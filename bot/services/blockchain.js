// Mock blockchain service for multichain support

function getChainOptions() {
  return [
    { id: 'flare', name: 'Flare', emoji: '🔥', rpc: 'https://flare-api.flare.network/ext/bc/C/rpc' },
    { id: 'ethereum', name: 'Ethereum', emoji: '⟠', rpc: 'https://eth-mainnet.g.alchemy.com/v2/' },
    { id: 'polygon', name: 'Polygon', emoji: '💜', rpc: 'https://polygon-rpc.com' },
    { id: 'arbitrum', name: 'Arbitrum', emoji: '🔵', rpc: 'https://arb1.arbitrum.io/rpc' },
    { id: 'optimism', name: 'Optimism', emoji: '🔴', rpc: 'https://mainnet.optimism.io' },
    { id: 'base', name: 'Base', emoji: '🔷', rpc: 'https://mainnet.base.org' },
    { id: 'bsc', name: 'BSC', emoji: '🟡', rpc: 'https://bsc-dataseed1.binance.org' },
    { id: 'avalanche', name: 'Avalanche', emoji: '❄️', rpc: 'https://api.avax.network/ext/bc/C/rpc' },
    { id: 'fantom', name: 'Fantom', emoji: '👻', rpc: 'https://rpc.ftm.tools' },
    { id: 'zksync', name: 'zkSync', emoji: '⚡', rpc: 'https://mainnet.era.zksync.io' },
    { id: 'scroll', name: 'Scroll', emoji: '📜', rpc: 'https://rpc.scroll.io' },
    { id: 'linea', name: 'Linea', emoji: '🌐', rpc: 'https://rpc.linea.build' },
  ];
}

function getChainInfo(chainId) {
  return getChainOptions().find(chain => chain.id === chainId);
}

// Mock contract addresses for each chain
function getContractAddresses(chainId) {
  const baseAddress = '0x1234567890123456789012345678901234567890';
  return {
    marketFactory: baseAddress,
    predictionMarket: baseAddress,
    oracleResolver: baseAddress,
    usdtToken: baseAddress,
  };
}

// Mock oracle price feeds
async function getOraclePrice(asset, chainId) {
  // Mock current prices
  const prices = {
    'BTC': 67420 + (Math.random() - 0.5) * 2000,
    'ETH': 3340 + (Math.random() - 0.5) * 200,
    'BNB': 610 + (Math.random() - 0.5) * 50,
    'ADA': 1.23 + (Math.random() - 0.5) * 0.2,
    'SOL': 145 + (Math.random() - 0.5) * 20,
    'DOT': 28.5 + (Math.random() - 0.5) * 5,
    'LINK': 23.8 + (Math.random() - 0.5) * 3,
    'MATIC': 1.85 + (Math.random() - 0.5) * 0.3,
    'AVAX': 42.1 + (Math.random() - 0.5) * 8,
    'FTM': 0.95 + (Math.random() - 0.5) * 0.15,
  };

  const price = prices[asset] || 100;
  
  return {
    price: price.toFixed(2),
    timestamp: Date.now(),
    source: chainId === 'flare' ? 'Flare FTSO' : 'Chainlink',
    confidence: 0.99,
  };
}

// Mock transaction simulation
async function simulateTransaction(chainId, txData) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
  const gasUsed = Math.floor(Math.random() * 100000) + 50000;
  
  return {
    success: true,
    txHash,
    blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
    gasUsed,
    gasPrice: '20000000000', // 20 gwei
    chainId,
    timestamp: Date.now(),
  };
}

// Mock wallet connection states
const walletSessions = new Map();

function generateWalletSession(telegramId) {
  const sessionId = Math.random().toString(36).substr(2, 9);
  const mockWalletAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
  
  walletSessions.set(telegramId, {
    sessionId,
    walletAddress: mockWalletAddress,
    connected: true,
    connectedAt: Date.now(),
    chainId: 'ethereum', // default
  });
  
  return walletSessions.get(telegramId);
}

function getWalletSession(telegramId) {
  return walletSessions.get(telegramId);
}

function disconnectWallet(telegramId) {
  walletSessions.delete(telegramId);
}

// Mock gas estimation
async function estimateGas(chainId, operation) {
  const gasEstimates = {
    'placeBet': 150000,
    'resolveBet': 80000,
    'claimReward': 65000,
    'createMarket': 200000,
  };
  
  const baseGas = gasEstimates[operation] || 100000;
  const networkMultiplier = chainId === 'ethereum' ? 1.5 : 1.0;
  
  return Math.floor(baseGas * networkMultiplier * (0.9 + Math.random() * 0.2));
}

// Mock balance checking
async function getUserBalance(walletAddress, chainId, tokenSymbol = 'USDT') {
  // Mock balances
  const mockBalance = Math.floor(Math.random() * 10000) + 100;
  
  return {
    balance: mockBalance.toString(),
    decimals: 6,
    symbol: tokenSymbol,
    chainId,
    walletAddress,
  };
}

module.exports = {
  getChainOptions,
  getChainInfo,
  getContractAddresses,
  getOraclePrice,
  simulateTransaction,
  generateWalletSession,
  getWalletSession,
  disconnectWallet,
  estimateGas,
  getUserBalance,
};
