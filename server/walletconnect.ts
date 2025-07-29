
import { Core } from '@walletconnect/core';
import { Web3Wallet, IWeb3Wallet } from '@walletconnect/web3wallet';
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';

export class WalletConnectService {
  private web3wallet: IWeb3Wallet | null = null;
  private core: Core | null = null;
  private isInitialized = false;
  private sessions: Map<string, any> = new Map();

  async initialize(): Promise<void> {
    try {
      const projectId = process.env.WALLETCONNECT_PROJECT_ID;
      
      if (!projectId) {
        console.log('⚠️  WalletConnect Project ID not provided - running in mock mode');
        return;
      }

      this.core = new Core({
        projectId: projectId,
      });

      this.web3wallet = await Web3Wallet.init({
        core: this.core,
        metadata: {
          name: 'MultiChain Prediction Markets',
          description: 'Decentralized prediction markets across multiple blockchains',
          url: 'https://prediction-markets.replit.app',
          icons: ['https://prediction-markets.replit.app/logo.png'],
        },
      });

      this.setupEventListeners();
      this.isInitialized = true;
      
      console.log('✅ WalletConnect v2 initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize WalletConnect:', error);
    }
  }

  private setupEventListeners(): void {
    if (!this.web3wallet) return;

    // Handle session proposals
    this.web3wallet.on('session_proposal', async (event) => {
      console.log('📨 Session proposal received:', event);
      
      try {
        const { id, params } = event;
        const { requiredNamespaces, relays } = params;

        // Build approved namespaces
        const approvedNamespaces = buildApprovedNamespaces({
          proposal: params,
          supportedNamespaces: {
            eip155: {
              chains: [
                'eip155:1',    // Ethereum
                'eip155:14',   // Flare
                'eip155:137',  // Polygon
                'eip155:42161', // Arbitrum
                'eip155:10',   // Optimism
                'eip155:8453', // Base
                'eip155:56',   // BSC
                'eip155:43114', // Avalanche
              ],
              methods: [
                'eth_sendTransaction',
                'eth_signTransaction',
                'eth_sign',
                'personal_sign',
                'eth_signTypedData',
              ],
              events: ['chainChanged', 'accountsChanged'],
              accounts: [
                'eip155:1:0x0000000000000000000000000000000000000000',
                'eip155:14:0x0000000000000000000000000000000000000000',
                'eip155:137:0x0000000000000000000000000000000000000000',
                'eip155:42161:0x0000000000000000000000000000000000000000',
              ]
            },
          },
        });

        // Approve the session
        const session = await this.web3wallet.approveSession({
          id,
          namespaces: approvedNamespaces,
        });

        console.log('✅ Session approved:', session);
      } catch (error) {
        console.error('❌ Failed to approve session:', error);
        
        await this.web3wallet.rejectSession({
          id: event.id,
          reason: getSdkError('USER_REJECTED'),
        });
      }
    });

    // Handle session requests (transaction signing, etc.)
    this.web3wallet.on('session_request', async (event) => {
      console.log('📨 Session request received:', event);
      
      try {
        const { topic, params, id } = event;
        const { request } = params;
        
        // Handle different request methods
        switch (request.method) {
          case 'eth_sendTransaction':
            await this.handleSendTransaction(topic, id, request.params);
            break;
          case 'personal_sign':
            await this.handlePersonalSign(topic, id, request.params);
            break;
          case 'eth_signTypedData':
            await this.handleSignTypedData(topic, id, request.params);
            break;
          default:
            await this.web3wallet.respondSessionRequest({
              topic,
              response: {
                id,
                error: getSdkError('UNSUPPORTED_METHODS'),
              },
            });
        }
      } catch (error) {
        console.error('❌ Failed to handle session request:', error);
        
        await this.web3wallet.respondSessionRequest({
          topic: event.topic,
          response: {
            id: event.id,
            error: getSdkError('USER_REJECTED'),
          },
        });
      }
    });

    // Handle session delete
    this.web3wallet.on('session_delete', (event) => {
      console.log('🗑️  Session deleted:', event);
      this.sessions.delete(event.topic);
    });
  }

  private async handleSendTransaction(topic: string, id: number, params: any[]): Promise<void> {
    if (!this.web3wallet) return;

    try {
      // In a real implementation, you would:
      // 1. Validate the transaction
      // 2. Show user approval UI
      // 3. Sign and broadcast the transaction
      
      // For demo purposes, we'll simulate a successful transaction
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      await this.web3wallet.respondSessionRequest({
        topic,
        response: {
          id,
          result: mockTxHash,
        },
      });

      console.log('✅ Transaction sent:', mockTxHash);
    } catch (error) {
      console.error('❌ Failed to send transaction:', error);
      
      await this.web3wallet.respondSessionRequest({
        topic,
        response: {
          id,
          error: getSdkError('USER_REJECTED'),
        },
      });
    }
  }

  private async handlePersonalSign(topic: string, id: number, params: any[]): Promise<void> {
    if (!this.web3wallet) return;

    try {
      // Mock signature
      const mockSignature = `0x${Math.random().toString(16).substr(2, 130)}`;
      
      await this.web3wallet.respondSessionRequest({
        topic,
        response: {
          id,
          result: mockSignature,
        },
      });

      console.log('✅ Message signed');
    } catch (error) {
      console.error('❌ Failed to sign message:', error);
      
      await this.web3wallet.respondSessionRequest({
        topic,
        response: {
          id,
          error: getSdkError('USER_REJECTED'),
        },
      });
    }
  }

  private async handleSignTypedData(topic: string, id: number, params: any[]): Promise<void> {
    if (!this.web3wallet) return;

    try {
      // Mock signature for typed data
      const mockSignature = `0x${Math.random().toString(16).substr(2, 130)}`;
      
      await this.web3wallet.respondSessionRequest({
        topic,
        response: {
          id,
          result: mockSignature,
        },
      });

      console.log('✅ Typed data signed');
    } catch (error) {
      console.error('❌ Failed to sign typed data:', error);
      
      await this.web3wallet.respondSessionRequest({
        topic,
        response: {
          id,
          error: getSdkError('USER_REJECTED'),
        },
      });
    }
  }

  async createSession(telegramId: string): Promise<{uri: string, approval: Promise<any>}> {
    if (!this.web3wallet || !this.isInitialized) {
      throw new Error('WalletConnect not initialized');
    }

    try {
      const { uri, approval } = await this.web3wallet.core.pairing.create();
      
      if (!uri) {
        throw new Error('Failed to create pairing URI');
      }

      // Store session mapping
      approval.then((session) => {
        this.sessions.set(telegramId, session);
        console.log(`✅ Session created for user ${telegramId}`);
      }).catch((error) => {
        console.error('❌ Session approval failed:', error);
      });

      return { uri, approval };
    } catch (error) {
      console.error('❌ Failed to create session:', error);
      throw error;
    }
  }

  async disconnectSession(telegramId: string): Promise<void> {
    const session = this.sessions.get(telegramId);
    
    if (session && this.web3wallet) {
      try {
        await this.web3wallet.disconnectSession({
          topic: session.topic,
          reason: getSdkError('USER_DISCONNECTED'),
        });
        
        this.sessions.delete(telegramId);
        console.log(`✅ Session disconnected for user ${telegramId}`);
      } catch (error) {
        console.error('❌ Failed to disconnect session:', error);
      }
    }
  }

  getSession(telegramId: string): any {
    return this.sessions.get(telegramId);
  }

  isConnected(telegramId: string): boolean {
    return this.sessions.has(telegramId);
  }

  async signTransaction(telegramId: string, transaction: any): Promise<string> {
    const session = this.sessions.get(telegramId);
    
    if (!session || !this.web3wallet) {
      throw new Error('No active session found');
    }

    try {
      const result = await this.web3wallet.request({
        topic: session.topic,
        chainId: `eip155:${transaction.chainId}`,
        request: {
          method: 'eth_sendTransaction',
          params: [transaction],
        },
      });

      return result as string;
    } catch (error) {
      console.error('❌ Failed to sign transaction:', error);
      throw error;
    }
  }

  getStatus() {
    return {
      isInitialized: this.isInitialized,
      activeSessions: this.sessions.size,
      projectId: process.env.WALLETCONNECT_PROJECT_ID ? 'configured' : 'missing',
    };
  }
}

export const walletConnectService = new WalletConnectService();
