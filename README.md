
# 🎯 MultiChain Prediction Markets Telegram Bot

A fully decentralized multichain prediction market Telegram bot with AI-powered natural language betting, supporting 12+ EVM blockchains and powered by Flare FTSO oracles.

## 🌟 Features

### 🤖 AI-Powered Natural Language Betting
- Type: `"bet 100 USDT on BTC above 70k by Friday"`
- Qwen AI parses natural language into structured bets
- Fallback parser for when AI is unavailable
- Support for multiple bet formats and conditions

### 🔗 Multichain Support
- **Primary**: Flare Network (with FTSO oracles)
- **Supported**: Ethereum, Polygon, Arbitrum, Optimism, Base, BSC, Avalanche, Fantom, zkSync, Scroll, Linea
- Easy addition of new EVM-compatible chains

### 💰 Advanced Features
- **Real-time Oracle Integration** (Flare FTSO + Chainlink)
- **WalletConnect v2** integration
- **Referral System** with 5% lifetime earnings
- **Leaderboards** and portfolio tracking
- **Web Dashboard** for monitoring and management

## 🚀 Quick Start

### 1. Environment Setup

First, copy the environment template and add your API keys:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Telegram Bot (Required)
TG_BOT_TOKEN=your_telegram_bot_token_from_botfather

# AI Integration (Optional - fallback parser used if not provided)
QWEN_API_KEY=your_qwen_api_key

# WalletConnect (Optional for demo mode)
WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Database (Auto-configured for development)
DATABASE_URL=your_postgres_url

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 2. Get Your Telegram Bot Token

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot` command
3. Follow prompts to create your bot
4. Copy the token to your `.env` file

### 3. Install Dependencies

Dependencies are automatically installed when you run the app in Replit.

### 4. Start the Application

Click the **Run** button in Replit, or use:

```bash
npm run dev
```

The app will start on port 5000 with:
- Telegram bot service
- Web dashboard at the webview URL
- API endpoints for monitoring

## 📱 Bot Commands

### User Commands
- `/start` - Welcome message and bot introduction
- `/predict` - Guided betting interface
- `/listmarkets` - View active prediction markets
- `/mybets` - Your betting portfolio
- `/leaderboard` - Top performers ranking
- `/invite` - Referral link generation
- `/howto` - Detailed usage instructions
- `/faq` - Frequently asked questions

### Natural Language Examples
```
bet 100 USDT on BTC above 70k by Friday
bet 50 USDT on ETH below 3500 today
bet 250 USDT on BTC over 65000 by weekend
```

## 🌐 Web Dashboard

Access the web dashboard through Replit's webview to monitor:
- Bot status and health
- Active prediction markets
- User leaderboards
- Real-time statistics
- Admin controls (when configured)

## 🔧 Configuration

### Supported Assets
BTC, ETH, BNB, ADA, SOL, DOT, LINK, MATIC, AVAX, FTM, ONE, NEAR, ATOM

### Bet Limits
- Minimum: 10 USDT
- Maximum: 10,000 USDT per bet

### Supported Chains
- **Flare** (Primary with FTSO oracles)
- **Ethereum** (Mainnet)
- **Layer 2**: Polygon, Arbitrum, Optimism, Base
- **BSC** (Binance Smart Chain)
- **Other EVM**: Avalanche, Fantom, zkSync, Scroll, Linea

## 🗄️ Database Schema

The app uses PostgreSQL with the following main tables:
- `users` - User profiles and Telegram integration
- `markets` - Prediction market definitions
- `bets` - User betting records
- `referrals` - Referral system tracking

For development, an in-memory storage system is used by default.

## 🚀 Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL=your_production_postgres_url
TG_BOT_TOKEN=your_bot_token
QWEN_API_KEY=your_qwen_key
WALLETCONNECT_PROJECT_ID=your_project_id
```

### Build for Production
```bash
npm run build
npm run start
```

### Replit Deployment
1. Set environment variables in Replit Secrets
2. Configure auto-deployment in Replit
3. Your bot will be available 24/7

## 🛠️ Development

### Project Structure
```
├── server/           # Express.js API server
├── client/           # React dashboard
├── bot/             # Legacy bot handlers (reference)
├── shared/          # Shared database schema
└── README.md        # This file
```

### Adding New Chains
1. Add chain config to `getChainOptions()` in `telegram-bot.ts`
2. Update chain validation in natural language parser
3. Add oracle integration for price feeds

### API Endpoints
- `GET /api/bot/status` - Bot health check
- `GET /api/markets` - Active markets
- `GET /api/leaderboard` - User rankings
- `GET /api/users/:telegramId` - User profile

## 🔐 Security

- API keys stored in environment variables
- Telegram bot token secured
- Database credentials protected
- No private keys stored (WalletConnect handles signing)

## 📞 Support

For issues or questions:
1. Check the `/faq` command in the bot
2. Review this README
3. Check Replit console for error logs

## 📄 License

MIT License - see LICENSE file for details.

---

**Ready to start?** Set up your environment variables and click Run to launch your multichain prediction market bot! 🚀
