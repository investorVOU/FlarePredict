
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PredictionMarket is ReentrancyGuard, Ownable {
    struct Market {
        uint256 id;
        string title;
        string description;
        uint256 expiryTime;
        uint256 targetPrice;
        bool isAbove; // true for above, false for below
        uint256 yesPool;
        uint256 noPool;
        bool resolved;
        bool outcome;
        string asset;
        address oracle;
    }

    struct Bet {
        uint256 marketId;
        address bettor;
        uint256 amount;
        bool prediction; // true for YES, false for NO
        bool claimed;
    }

    IERC20 public immutable usdtToken;
    uint256 public nextMarketId = 1;
    uint256 public nextBetId = 1;
    
    mapping(uint256 => Market) public markets;
    mapping(uint256 => Bet) public bets;
    mapping(uint256 => uint256[]) public marketBets; // marketId => betIds[]
    mapping(address => uint256[]) public userBets; // user => betIds[]
    
    uint256 public constant MIN_BET = 10 * 1e6; // 10 USDT (6 decimals)
    uint256 public constant MAX_BET = 10000 * 1e6; // 10,000 USDT
    uint256 public constant PLATFORM_FEE = 200; // 2% (basis points)
    
    event MarketCreated(
        uint256 indexed marketId,
        string title,
        uint256 expiryTime,
        uint256 targetPrice,
        bool isAbove,
        string asset
    );
    
    event BetPlaced(
        uint256 indexed betId,
        uint256 indexed marketId,
        address indexed bettor,
        uint256 amount,
        bool prediction
    );
    
    event MarketResolved(
        uint256 indexed marketId,
        bool outcome,
        uint256 finalPrice
    );
    
    event BetClaimed(
        uint256 indexed betId,
        address indexed bettor,
        uint256 payout
    );

    constructor(address _usdtToken) {
        usdtToken = IERC20(_usdtToken);
    }

    function createMarket(
        string memory _title,
        string memory _description,
        uint256 _expiryTime,
        uint256 _targetPrice,
        bool _isAbove,
        string memory _asset,
        address _oracle
    ) external onlyOwner returns (uint256) {
        require(_expiryTime > block.timestamp, "Expiry must be in future");
        require(_targetPrice > 0, "Target price must be positive");
        require(_oracle != address(0), "Invalid oracle address");
        
        uint256 marketId = nextMarketId++;
        
        markets[marketId] = Market({
            id: marketId,
            title: _title,
            description: _description,
            expiryTime: _expiryTime,
            targetPrice: _targetPrice,
            isAbove: _isAbove,
            yesPool: 0,
            noPool: 0,
            resolved: false,
            outcome: false,
            asset: _asset,
            oracle: _oracle
        });
        
        emit MarketCreated(marketId, _title, _expiryTime, _targetPrice, _isAbove, _asset);
        return marketId;
    }

    function placeBet(
        uint256 _marketId,
        uint256 _amount,
        bool _prediction
    ) external nonReentrant returns (uint256) {
        Market storage market = markets[_marketId];
        require(market.id != 0, "Market does not exist");
        require(block.timestamp < market.expiryTime, "Market expired");
        require(!market.resolved, "Market already resolved");
        require(_amount >= MIN_BET && _amount <= MAX_BET, "Invalid bet amount");
        
        // Transfer USDT from user
        require(
            usdtToken.transferFrom(msg.sender, address(this), _amount),
            "USDT transfer failed"
        );
        
        uint256 betId = nextBetId++;
        
        bets[betId] = Bet({
            marketId: _marketId,
            bettor: msg.sender,
            amount: _amount,
            prediction: _prediction,
            claimed: false
        });
        
        // Update market pools
        if (_prediction) {
            market.yesPool += _amount;
        } else {
            market.noPool += _amount;
        }
        
        // Update mappings
        marketBets[_marketId].push(betId);
        userBets[msg.sender].push(betId);
        
        emit BetPlaced(betId, _marketId, msg.sender, _amount, _prediction);
        return betId;
    }

    // Admin-only market resolution (for @maxinayas)
    function resolveMarket(uint256 _marketId, bool _outcome) external onlyOwner {
        Market storage market = markets[_marketId];
        require(market.id != 0, "Market does not exist");
        require(!market.resolved, "Market already resolved");
        
        market.resolved = true;
        market.outcome = _outcome;
        
        emit MarketResolved(_marketId, _outcome, 0);
        
        // Automatically process payouts after resolution
        _processPayout(_marketId);
    }

    // Automatic oracle resolution (fallback for time-based markets)
    function resolveMarketWithOracle(uint256 _marketId) external {
        Market storage market = markets[_marketId];
        require(market.id != 0, "Market does not exist");
        require(block.timestamp >= market.expiryTime, "Market not expired yet");
        require(!market.resolved, "Market already resolved");
        
        // Get price from oracle
        AggregatorV3Interface priceFeed = AggregatorV3Interface(market.oracle);
        (, int256 price, , uint256 updatedAt, ) = priceFeed.latestRoundData();
        require(updatedAt > 0, "Invalid oracle data");
        
        uint256 finalPrice = uint256(price) / 1e8; // Convert from 8 decimals to standard
        
        // Determine outcome
        bool outcome;
        if (market.isAbove) {
            outcome = finalPrice > market.targetPrice;
        } else {
            outcome = finalPrice < market.targetPrice;
        }
        
        market.resolved = true;
        market.outcome = outcome;
        
        emit MarketResolved(_marketId, outcome, finalPrice);
        
        // Automatically process payouts after resolution
        _processPayout(_marketId);
    }

    // Automatic payout processing
    function processPayout(uint256 _marketId) external {
        _processPayout(_marketId);
    }

    function _processPayout(uint256 _marketId) internal {
        Market storage market = markets[_marketId];
        require(market.resolved, "Market not resolved");
        
        uint256[] memory marketBetIds = marketBets[_marketId];
        uint256 totalPayout = 0;
        
        for (uint256 i = 0; i < marketBetIds.length; i++) {
            uint256 betId = marketBetIds[i];
            Bet storage bet = bets[betId];
            
            if (!bet.claimed && bet.prediction == market.outcome) {
                uint256 totalPool = market.yesPool + market.noPool;
                uint256 winningPool = market.outcome ? market.yesPool : market.noPool;
                
                if (winningPool > 0) {
                    uint256 grossPayout = (bet.amount * totalPool) / winningPool;
                    uint256 platformFee = (grossPayout * PLATFORM_FEE) / 10000;
                    uint256 netPayout = grossPayout - platformFee;
                    
                    bet.claimed = true;
                    totalPayout += netPayout;
                    
                    // Automatic payout transfer
                    require(usdtToken.transfer(bet.bettor, netPayout), "Payout failed");
                    
                    emit BetClaimed(betId, bet.bettor, netPayout);
                }
            } else if (!bet.claimed) {
                // Mark losing bets as claimed
                bet.claimed = true;
                emit BetClaimed(betId, bet.bettor, 0);
            }
        }
        
        emit PayoutsProcessed(_marketId, totalPayout);
    }

    event PayoutsProcessed(uint256 indexed marketId, uint256 totalPayout);

    function claimBet(uint256 _betId) external nonReentrant {
        Bet storage bet = bets[_betId];
        require(bet.bettor == msg.sender, "Not your bet");
        require(!bet.claimed, "Already claimed");
        
        Market storage market = markets[bet.marketId];
        require(market.resolved, "Market not resolved");
        
        // Check if bet won
        if (bet.prediction == market.outcome) {
            uint256 totalPool = market.yesPool + market.noPool;
            uint256 winningPool = market.outcome ? market.yesPool : market.noPool;
            
            // Calculate payout: (user_bet / winning_pool) * total_pool * (1 - platform_fee)
            uint256 grossPayout = (bet.amount * totalPool) / winningPool;
            uint256 platformFee = (grossPayout * PLATFORM_FEE) / 10000;
            uint256 netPayout = grossPayout - platformFee;
            
            bet.claimed = true;
            
            require(usdtToken.transfer(msg.sender, netPayout), "Payout failed");
            
            emit BetClaimed(_betId, msg.sender, netPayout);
        } else {
            // Losing bet - mark as claimed but no payout
            bet.claimed = true;
            emit BetClaimed(_betId, msg.sender, 0);
        }
    }

    function getMarket(uint256 _marketId) external view returns (Market memory) {
        return markets[_marketId];
    }

    function getBet(uint256 _betId) external view returns (Bet memory) {
        return bets[_betId];
    }

    function getMarketBets(uint256 _marketId) external view returns (uint256[] memory) {
        return marketBets[_marketId];
    }

    function getUserBets(address _user) external view returns (uint256[] memory) {
        return userBets[_user];
    }

    function calculatePotentialPayout(
        uint256 _marketId,
        uint256 _amount,
        bool _prediction
    ) external view returns (uint256) {
        Market storage market = markets[_marketId];
        require(market.id != 0, "Market does not exist");
        
        uint256 currentYesPool = market.yesPool;
        uint256 currentNoPool = market.noPool;
        
        // Add user's bet to appropriate pool
        if (_prediction) {
            currentYesPool += _amount;
        } else {
            currentNoPool += _amount;
        }
        
        uint256 totalPool = currentYesPool + currentNoPool;
        uint256 winningPool = _prediction ? currentYesPool : currentNoPool;
        
        uint256 grossPayout = (_amount * totalPool) / winningPool;
        uint256 platformFee = (grossPayout * PLATFORM_FEE) / 10000;
        uint256 netPayout = grossPayout - platformFee;
        
        return netPayout;
    }

    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = usdtToken.balanceOf(address(this));
        require(usdtToken.transfer(owner(), balance), "Withdrawal failed");
    }
}
