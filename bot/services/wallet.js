// Mock WalletConnect v2 service

class MockWalletConnect {
  constructor() {
    this.sessions = new Map();
    this.pendingRequests = new Map();
  }

  // Mock WalletConnect initialization
  async init(projectId) {
    console.log(`🔗 WalletConnect initialized with project ID: ${projectId}`);
    return true;
  }

  // Mock wallet connection
  async connect(telegramId) {
    const sessionId = Math.random().toString(36).substr(2, 9);
    const mockAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
    
    // Simulate user scanning QR code and approving
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const session = {
      sessionId,
      walletAddress: mockAddress,
      chainId: 1, // Ethereum mainnet
      connected: true,
      connectedAt: Date.now(),
      metadata: {
        name: 'MetaMask',
        description: 'Mock wallet connection',
        url: 'https://metamask.io',
        icons: ['https://metamask.io/icon.png']
      }
    };
    
    this.sessions.set(telegramId, session);
    
    return {
      success: true,
      session,
      qrCode: `data:image/svg+xml;base64,${this.generateMockQR()}`,
    };
  }

  // Mock wallet disconnection
  async disconnect(telegramId) {
    this.sessions.delete(telegramId);
    return { success: true };
  }

  // Get session for user
  getSession(telegramId) {
    return this.sessions.get(telegramId);
  }

  // Mock transaction signing
  async signTransaction(telegramId, txData) {
    const session = this.sessions.get(telegramId);
    
    if (!session) {
      throw new Error('Wallet not connected');
    }

    // Simulate user approval in wallet
    const requestId = Math.random().toString(36).substr(2, 9);
    
    this.pendingRequests.set(requestId, {
      telegramId,
      txData,
      createdAt: Date.now()
    });

    // Mock user interaction delay
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));

    // Random chance of rejection (10%)
    if (Math.random() < 0.1) {
      this.pendingRequests.delete(requestId);
      throw new Error('Transaction rejected by user');
    }

    // Mock signature
    const signature = `0x${Math.random().toString(16).substr(2, 130)}`;
    
    this.pendingRequests.delete(requestId);
    
    return {
      success: true,
      signature,
      txHash: txData.hash,
      requestId,
    };
  }

  // Mock message signing (for authentication)
  async signMessage(telegramId, message) {
    const session = this.sessions.get(telegramId);
    
    if (!session) {
      throw new Error('Wallet not connected');
    }

    // Mock signing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const signature = `0x${Math.random().toString(16).substr(2, 130)}`;
    
    return {
      success: true,
      signature,
      message,
      address: session.walletAddress,
    };
  }

  // Mock network switching
  async switchNetwork(telegramId, chainId) {
    const session = this.sessions.get(telegramId);
    
    if (!session) {
      throw new Error('Wallet not connected');
    }

    // Mock network switch delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    session.chainId = chainId;
    this.sessions.set(telegramId, session);

    return {
      success: true,
      chainId,
    };
  }

  // Generate mock QR code data URI
  generateMockQR() {
    const qrSvg = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <g transform="translate(20,20)">
          ${Array.from({length: 16}, (_, i) => 
            Array.from({length: 16}, (_, j) => 
              Math.random() > 0.5 ? `<rect x="${j*10}" y="${i*10}" width="10" height="10" fill="black"/>` : ''
            ).join('')
          ).join('')}
        </g>
        <text x="100" y="190" text-anchor="middle" font-family="Arial" font-size="12" fill="black">WalletConnect</text>
      </svg>
    `;
    
    return Buffer.from(qrSvg).toString('base64');
  }

  // Mock gas price estimation
  async getGasPrice(chainId) {
    const gasPrices = {
      1: 20, // Ethereum
      137: 30, // Polygon
      42161: 0.1, // Arbitrum
      10: 0.001, // Optimism
      56: 5, // BSC
      43114: 25, // Avalanche
      250: 100, // Fantom
      14: 0.01, // Flare
    };

    return {
      gasPrice: gasPrices[chainId] || 20,
      unit: 'gwei',
      chainId,
    };
  }

  // Mock balance fetching
  async getBalance(telegramId, chainId, tokenAddress = null) {
    const session = this.sessions.get(telegramId);
    
    if (!session) {
      throw new Error('Wallet not connected');
    }

    // Mock balances for different tokens/chains
    const baseBalance = Math.floor(Math.random() * 10000) + 100;
    
    return {
      balance: baseBalance.toString(),
      decimals: tokenAddress ? 6 : 18, // USDT has 6 decimals, ETH has 18
      symbol: tokenAddress ? 'USDT' : 'ETH',
      chainId,
      address: session.walletAddress,
    };
  }
}

// Mock gasless transaction support
class MockGaslessProvider {
  constructor() {
    this.relayerBalance = 100000; // Mock relayer balance
  }

  // Check if gasless is available for chain
  isGaslessSupported(chainId) {
    // Mock support for specific chains
    const supportedChains = [137, 42161, 10, 56]; // Polygon, Arbitrum, Optimism, BSC
    return supportedChains.includes(chainId);
  }

  // Execute gasless transaction
  async executeGasless(telegramId, txData, chainId) {
    if (!this.isGaslessSupported(chainId)) {
      throw new Error('Gasless transactions not supported on this chain');
    }

    if (this.relayerBalance < 10) {
      throw new Error('Relayer balance too low');
    }

    // Mock execution delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock relayer fee deduction
    this.relayerBalance -= Math.random() * 5;

    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;

    return {
      success: true,
      txHash,
      gasless: true,
      relayerUsed: true,
      chainId,
    };
  }

  // Get relayer status
  getRelayerStatus() {
    return {
      balance: this.relayerBalance,
      healthy: this.relayerBalance > 50,
      supportedChains: [137, 42161, 10, 56],
    };
  }
}

// Singleton instances
const walletConnect = new MockWalletConnect();
const gaslessProvider = new MockGaslessProvider();

module.exports = {
  walletConnect,
  gaslessProvider,
  MockWalletConnect,
  MockGaslessProvider,
};
