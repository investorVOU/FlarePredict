
import { ethers } from 'ethers';

interface ChainConfig {
  id: string;
  name: string;
  chainId: number;
  rpc: string;
  explorer: string;
  contracts: {
    marketFactory: string;
    predictionMarket: string;
    oracleResolver: string;
    usdtToken: string;
  };
}

export class BlockchainService {
  private providers: Map<string, ethers.JsonRpcProvider> = new Map();
  private contracts: Map<string, ethers.Contract> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    const chains = this.getChainConfigs();
    
    chains.forEach(chain => {
      try {
        const provider = new ethers.JsonRpcProvider(chain.rpc);
        this.providers.set(chain.id, provider);
        console.log(`✅ Connected to ${chain.name} (${chain.chainId})`);
      } catch (error) {
        console.error(`❌ Failed to connect to ${chain.name}:`, error);
      }
    });
  }

  private getChainConfigs(): ChainConfig[] {
    return [
      {
        id: 'flare',
        name: 'Flare',
        chainId: 14,
        rpc: 'https://flare-api.flare.network/ext/bc/C/rpc',
        explorer: 'https://flarescan.com',
        contracts: {
          marketFactory: process.env.FLARE_MARKET_FACTORY || '0x1234567890123456789012345678901234567890',
          predictionMarket: process.env.FLARE_PREDICTION_MARKET || '0x1234567890123456789012345678901234567890',
          oracleResolver: process.env.FLARE_ORACLE_RESOLVER || '0x1234567890123456789012345678901234567890',
          usdtToken: '0x1234567890123456789012345678901234567890'
        }
      },
      {
        id: 'ethereum',
        name: 'Ethereum',
        chainId: 1,
        rpc: process.env.ETHEREUM_RPC_URL || `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        explorer: 'https://etherscan.io',
        contracts: {
          marketFactory: process.env.ETH_MARKET_FACTORY || '0x1234567890123456789012345678901234567890',
          predictionMarket: process.env.ETH_PREDICTION_MARKET || '0x1234567890123456789012345678901234567890',
          oracleResolver: process.env.ETH_ORACLE_RESOLVER || '0x1234567890123456789012345678901234567890',
          usdtToken: '0xdAC17F958D2ee523a2206206994597C13D831ec7' // Real USDT on Ethereum
        }
      },
      {
        id: 'polygon',
        name: 'Polygon',
        chainId: 137,
        rpc: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
        explorer: 'https://polygonscan.com',
        contracts: {
          marketFactory: process.env.POLYGON_MARKET_FACTORY || '0x1234567890123456789012345678901234567890',
          predictionMarket: process.env.POLYGON_PREDICTION_MARKET || '0x1234567890123456789012345678901234567890',
          oracleResolver: process.env.POLYGON_ORACLE_RESOLVER || '0x1234567890123456789012345678901234567890',
          usdtToken: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' // Real USDT on Polygon
        }
      },
      {
        id: 'arbitrum',
        name: 'Arbitrum',
        chainId: 42161,
        rpc: 'https://arb1.arbitrum.io/rpc',
        explorer: 'https://arbiscan.io',
        contracts: {
          marketFactory: process.env.ARBITRUM_MARKET_FACTORY || '0x1234567890123456789012345678901234567890',
          predictionMarket: process.env.ARBITRUM_PREDICTION_MARKET || '0x1234567890123456789012345678901234567890',
          oracleResolver: process.env.ARBITRUM_ORACLE_RESOLVER || '0x1234567890123456789012345678901234567890',
          usdtToken: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' // Real USDT on Arbitrum
        }
      },
    ];
  }

  async getOraclePrice(asset: string, chainId: string): Promise<{price: number, timestamp: number, source: string}> {
    const provider = this.providers.get(chainId);
    if (!provider) {
      throw new Error(`Provider not found for chain ${chainId}`);
    }

    try {
      if (chainId === 'flare') {
        // Use Flare FTSO
        return await this.getFlareOraclePrice(asset, provider);
      } else {
        // Use Chainlink
        return await this.getChainlinkPrice(asset, provider);
      }
    } catch (error) {
      console.error(`Error fetching oracle price for ${asset} on ${chainId}:`, error);
      // Fallback to mock data
      return this.getMockPrice(asset);
    }
  }

  private async getFlareOraclePrice(asset: string, provider: ethers.JsonRpcProvider) {
    // Flare FTSO interface
    const ftsoRegistryAbi = [
      "function getCurrentPrice(string memory _symbol) external view returns (uint256 _price, uint256 _timestamp, uint256 _decimals)"
    ];
    
    const ftsoRegistryAddress = '0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019'; // Flare FTSO Registry
    const ftsoRegistry = new ethers.Contract(ftsoRegistryAddress, ftsoRegistryAbi, provider);
    
    const result = await ftsoRegistry.getCurrentPrice(asset);
    const price = Number(result._price) / Math.pow(10, Number(result._decimals));
    
    return {
      price,
      timestamp: Number(result._timestamp),
      source: 'Flare FTSO'
    };
  }

  private async getChainlinkPrice(asset: string, provider: ethers.JsonRpcProvider) {
    // Chainlink price feed addresses (Ethereum mainnet)
    const priceFeeds: Record<string, string> = {
      'BTC': '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c', // BTC/USD
      'ETH': '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419', // ETH/USD
      'MATIC': '0x7bAC85A8a13A4BcD8abb3eB7d6b4d632c5a57676', // MATIC/USD
    };
    
    const feedAddress = priceFeeds[asset];
    if (!feedAddress) {
      throw new Error(`Price feed not found for ${asset}`);
    }
    
    const aggregatorV3InterfaceABI = [
      "function latestRoundData() external view returns (uint80 roundId, int256 price, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)"
    ];
    
    const priceFeed = new ethers.Contract(feedAddress, aggregatorV3InterfaceABI, provider);
    const roundData = await priceFeed.latestRoundData();
    
    // Chainlink prices typically have 8 decimals
    const price = Number(roundData.price) / 1e8;
    
    return {
      price,
      timestamp: Number(roundData.updatedAt),
      source: 'Chainlink'
    };
  }

  private getMockPrice(asset: string) {
    const mockPrices: Record<string, number> = {
      'BTC': 67420,
      'ETH': 3340,
      'MATIC': 1.85,
      'BNB': 610,
      'ADA': 1.23,
      'SOL': 145,
    };
    
    const basePrice = mockPrices[asset] || 100;
    const price = basePrice + (Math.random() - 0.5) * basePrice * 0.05; // ±5% variance
    
    return {
      price,
      timestamp: Date.now(),
      source: 'Mock'
    };
  }

  async estimateGas(chainId: string, operation: string, params: any): Promise<number> {
    const provider = this.providers.get(chainId);
    if (!provider) {
      throw new Error(`Provider not found for chain ${chainId}`);
    }

    try {
      // Estimate gas for different operations
      const gasEstimates: Record<string, number> = {
        'placeBet': 150000,
        'resolveBet': 80000,
        'claimReward': 65000,
        'createMarket': 200000,
      };

      const baseGas = gasEstimates[operation] || 100000;
      
      // Get current gas price
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');
      
      return baseGas;
    } catch (error) {
      console.error(`Error estimating gas for ${operation} on ${chainId}:`, error);
      return 150000; // Default fallback
    }
  }

  async placeBet(
    chainId: string, 
    userAddress: string, 
    marketId: string, 
    amount: number, 
    prediction: boolean
  ): Promise<{txHash: string, blockNumber: number}> {
    const provider = this.providers.get(chainId);
    if (!provider) {
      throw new Error(`Provider not found for chain ${chainId}`);
    }

    // This would normally interact with your deployed smart contracts
    // For now, we'll simulate the transaction
    const simulatedTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    const currentBlock = await provider.getBlockNumber();
    
    console.log(`📝 Simulated bet placement:
      Chain: ${chainId}
      User: ${userAddress}
      Market: ${marketId}
      Amount: ${amount} USDT
      Prediction: ${prediction}
      TX Hash: ${simulatedTxHash}
    `);
    
    return {
      txHash: simulatedTxHash,
      blockNumber: currentBlock
    };
  }

  async getTokenBalance(chainId: string, userAddress: string, tokenAddress: string): Promise<number> {
    const provider = this.providers.get(chainId);
    if (!provider) {
      throw new Error(`Provider not found for chain ${chainId}`);
    }

    try {
      const erc20Abi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ];
      
      const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
      const balance = await tokenContract.balanceOf(userAddress);
      const decimals = await tokenContract.decimals();
      
      return Number(ethers.formatUnits(balance, decimals));
    } catch (error) {
      console.error(`Error fetching token balance for ${userAddress} on ${chainId}:`, error);
      return 0;
    }
  }

  getChainConfig(chainId: string): ChainConfig | undefined {
    return this.getChainConfigs().find(chain => chain.id === chainId);
  }

  async getBlockNumber(chainId: string): Promise<number> {
    const provider = this.providers.get(chainId);
    if (!provider) {
      throw new Error(`Provider not found for chain ${chainId}`);
    }
    
    return await provider.getBlockNumber();
  }

  async waitForTransaction(chainId: string, txHash: string): Promise<ethers.TransactionReceipt | null> {
    const provider = this.providers.get(chainId);
    if (!provider) {
      throw new Error(`Provider not found for chain ${chainId}`);
    }
    
    return await provider.waitForTransaction(txHash);
  }
}

export const blockchainService = new BlockchainService();
