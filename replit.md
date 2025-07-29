# MultiChain Prediction Markets Telegram Bot

## Overview

This is a fully decentralized multichain prediction market Telegram bot that supports natural language betting across 12+ EVM blockchains. The bot leverages Flare FTSO oracles for price feeds and includes AI-powered natural language processing for user interactions. The application consists of a Node.js Telegram bot backend, a React frontend dashboard for monitoring, and smart contracts deployed across multiple chains.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Technology Stack
- **Backend**: Node.js with Express.js server
- **Frontend**: React with TypeScript, Vite bundler, TailwindCSS styling
- **Database**: PostgreSQL with Drizzle ORM
- **Bot Framework**: Telegraf for Telegram bot interactions
- **AI/NLP**: Qwen AI for natural language bet parsing
- **Blockchain**: Multi-EVM support with focus on Flare Network
- **UI Components**: Radix UI with shadcn/ui component library

### Architecture Pattern
The application follows a full-stack monolithic architecture with clear separation between:
- Telegram bot interface (`/bot` directory)
- Web dashboard (`/client` directory)
- Express API server (`/server` directory)
- Shared database schema (`/shared` directory)

## Key Components

### 1. Telegram Bot Service
- **Location**: `/bot` directory
- **Purpose**: Primary user interface for prediction market interactions
- **Features**:
  - Natural language bet parsing using Qwen AI
  - Multi-chain support with chain selection interface
  - Admin commands for market management
  - User wallet integration with WalletConnect v2
  - Real-time market data and betting functionality

### 2. Web Dashboard
- **Location**: `/client` directory
- **Purpose**: Administrative interface and public market monitoring
- **Features**:
  - Bot status monitoring
  - Active markets display
  - User leaderboards
  - Real-time statistics dashboard

### 3. API Server
- **Location**: `/server` directory
- **Purpose**: Backend API for data management and bot integration
- **Architecture**: Express.js with RESTful endpoints
- **Key Endpoints**:
  - `/api/bot/status` - Bot health monitoring
  - `/api/markets` - Market data retrieval
  - `/api/leaderboard` - User rankings
  - `/api/users/:telegramId` - User profile and betting history

### 4. Database Layer
- **ORM**: Drizzle with PostgreSQL
- **Schema Location**: `/shared/schema.ts`
- **Tables**:
  - `users` - User profiles with Telegram integration
  - `markets` - Prediction market definitions
  - `bets` - User betting records
  - `referrals` - Referral system tracking

### 5. Blockchain Integration
- **Multi-chain Support**: 12+ EVM networks including Flare, Ethereum, Polygon, Arbitrum, etc.
- **Oracle Integration**: Flare FTSO for primary price feeds, Chainlink for other chains
- **Smart Contracts**: MarketFactory and PredictionMarket contracts (referenced but not implemented in codebase)

## Data Flow

### User Interaction Flow
1. User sends message to Telegram bot
2. Bot processes natural language using Qwen AI
3. Parsed bet data sent to database via storage layer
4. Blockchain transaction initiated (if wallet connected)
5. Market resolution handled by oracle systems
6. Payouts processed automatically

### Data Storage Pattern
- In-memory storage implementation (`MemStorage` class) for development
- Database schema designed for PostgreSQL production deployment
- Modular storage interface allows easy swapping between implementations

### Real-time Updates
- Dashboard polls API endpoints every 30 seconds for status updates
- React Query for efficient data fetching and caching
- WebSocket support not implemented but architecture allows for future integration

## External Dependencies

### Core Dependencies
- **Telegram Bot API**: Primary user interface
- **Qwen AI API**: Natural language processing for bet parsing
- **WalletConnect v2**: Wallet integration for blockchain transactions
- **PostgreSQL**: Primary data storage (via Neon serverless)

### Blockchain Networks
- **Flare Network**: Primary chain with FTSO oracle integration
- **Additional EVMs**: Ethereum, Polygon, Arbitrum, Optimism, Base, BSC, Avalanche, Fantom, zkSync, Scroll, Linea

### Development Tools
- **Vite**: Frontend build system and development server
- **TypeScript**: Type safety across the entire application
- **TailwindCSS**: Utility-first CSS framework
- **ESBuild**: Backend bundling for production

## Deployment Strategy

### Development Environment
- Vite dev server for frontend development
- Hot module replacement for rapid iteration
- TypeScript compilation for type checking
- Express server with automatic restarts

### Production Build Process
1. Frontend built with Vite to `/dist/public`
2. Backend bundled with ESBuild to `/dist`
3. Database migrations managed through Drizzle Kit
4. Environment variables for API keys and database connections

### Hosting Considerations
- Designed for Replit deployment with specific configurations
- Database URL required for PostgreSQL connection
- Telegram Bot Token and Qwen API Key needed for full functionality
- WalletConnect Project ID required for wallet integration

### Scalability Features
- Modular chain support allows easy addition of new EVM networks
- Database schema supports multiple concurrent markets per chain
- Storage interface abstraction enables database migration
- React Query caching reduces API load

The application is structured to handle high-volume betting activity across multiple blockchains while maintaining a simple user experience through the Telegram interface. The architecture prioritizes modularity and extensibility for future blockchain integrations and feature additions.