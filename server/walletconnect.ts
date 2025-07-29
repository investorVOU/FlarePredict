import { SignClient } from '@walletconnect/sign-client';
import { Web3Modal } from '@web3modal/standalone';

interface WalletConnectSession {
  topic: string;
  namespaces: any;
  peer: any;
}

export class WalletConnectService {
  private signClient: SignClient | null = null;
  private web3Modal: Web3Modal | null = null;
  private sessions: Map<string, WalletConnectSession> = new Map();

  constructor() {
    this.initializeWalletConnect();
  }

  private async initializeWalletConnect() {
    try {
      const projectId = process.env.WALLETCONNECT_PROJECT_ID;

      if (!projectId) {
        console.log('⚠️ WalletConnect Project ID not found, using mock mode');
        return;
      }

      this.signClient = await SignClient.init({
        projectId,
        metadata: {
          name: 'MultiChain Prediction Markets',
          description: 'Decentralized prediction markets across multiple blockchains',
          url: 'https://prediction-markets.replit.app',
          icons: ['https://walletconnect.com/walletconnect-logo.png']
        }
      });

      this.web3Modal = new Web3Modal({
        projectId,
        standaloneChains: [
          'eip155:1',    // Ethereum
          'eip155:137',  // Polygon
          'eip155:42161', // Arbitrum
          'eip155:10',   // Optimism
          'eip155:8453', // Base
          'eip155:56',   // BSC
          'eip155:43114', // Avalanche
          'eip155:14',   // Flare
        ]
      });

      console.log('✅ WalletConnect v2 initialized successfully');
    } catch (error) {
      console.error('❌ WalletConnect initialization failed:', error);
    }
  }

  async createSession(chainId: string): Promise<{ uri: string; approval: () => Promise<WalletConnectSession> }> {
    if (!this.signClient) {
      throw new Error('WalletConnect not initialized');
    }

    const chainConfig = this.getChainConfig(chainId);

    const { uri, approval } = await this.signClient.connect({
      requiredNamespaces: {
        eip155: {
          methods: [
            'eth_sendTransaction',
            'eth_signTransaction',
            'eth_sign',
            'personal_sign',
            'eth_signTypedData',
          ],
          chains: [`eip155:${chainConfig.chainId}`],
          events: ['chainChanged', 'accountsChanged'],
        },
      },
    });

    if (!uri) {
      throw new Error('Failed to generate WalletConnect URI');
    }

    return {
      uri,
      approval: async () => {
        const session = await approval();
        this.sessions.set(session.topic, session);
        return session;
      }
    };
  }

  async sendTransaction(session: WalletConnectSession, transaction: any): Promise<string> {
    if (!this.signClient) {
      throw new Error('WalletConnect not initialized');
    }

    const result = await this.signClient.request({
      topic: session.topic,
      chainId: `eip155:${transaction.chainId}`,
      request: {
        method: 'eth_sendTransaction',
        params: [transaction],
      },
    });

    return result as string;
  }

  async signMessage(session: WalletConnectSession, message: string): Promise<string> {
    if (!this.signClient) {
      throw new Error('WalletConnect not initialized');
    }

    const accounts = session.namespaces.eip155.accounts;
    const account = accounts[0];

    const result = await this.signClient.request({
      topic: session.topic,
      chainId: account.split(':').slice(0, 2).join(':'),
      request: {
        method: 'personal_sign',
        params: [message, account.split(':')[2]],
      },
    });

    return result as string;
  }

  async disconnectSession(topic: string): Promise<void> {
    if (!this.signClient) {
      throw new Error('WalletConnect not initialized');
    }

    await this.signClient.disconnect({
      topic,
      reason: {
        code: 6000,
        message: 'User disconnected',
      },
    });

    this.sessions.delete(topic);
  }

  private getChainConfig(chainId: string) {
    const chains: Record<string, { chainId: number; name: string }> = {
      'flare': { chainId: 14, name: 'Flare' },
      'ethereum': { chainId: 1, name: 'Ethereum' },
      'polygon': { chainId: 137, name: 'Polygon' },
      'arbitrum': { chainId: 42161, name: 'Arbitrum' },
      'optimism': { chainId: 10, name: 'Optimism' },
      'base': { chainId: 8453, name: 'Base' },
      'bsc': { chainId: 56, name: 'BSC' },
      'avalanche': { chainId: 43114, name: 'Avalanche' },
    };

    return chains[chainId] || chains['ethereum'];
  }

  getStatus() {
    return {
      initialized: !!this.signClient,
      activeSessions: this.sessions.size,
      projectId: !!process.env.WALLETCONNECT_PROJECT_ID,
    };
  }
}

export const walletConnectService = new WalletConnectService();