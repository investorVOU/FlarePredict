
# MultiChain Prediction Markets Telegram Bot

A fully decentralized multichain prediction market Telegram bot with AI-powered natural language betting across 12+ EVM blockchains.

## 🚀 Features

- **Natural Language Betting**: Type "bet 100 USDT on BTC above 70k by Friday" 
- **Multi-Chain Support**: 12+ blockchains including Flare, Ethereum, Polygon, Arbitrum
- **AI-Powered NLP**: Qwen AI for intelligent bet parsing with fallback system
- **Real-time Oracles**: Flare FTSO and Chainlink price feeds
- **Web Dashboard**: React-based monitoring interface
- **Wallet Integration**: WalletConnect v2 support

## 🏗️ Architecture

- **Backend**: Node.js + Express.js + TypeScript
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Database**: PostgreSQL with Drizzle ORM
- **Bot**: Telegraf framework for Telegram integration
- **AI/NLP**: Qwen AI with fallback parser
- **Blockchain**: Multi-EVM chain support

## 🛠️ Setup

### 1. Environment Variables

Create a `.env` file:

```env
# Required
TG_BOT_TOKEN=your_telegram_bot_token
DATABASE_URL=your_postgres_url

# Optional
QWEN_API_KEY=your_qwen_ai_key
WALLETCONNECT_PROJECT_ID=your_walletconnect_id
NODE_ENV=development
PORT=5000
```

### 2. Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# The bot will run on port 5000
# Telegram bot will start automatically
```

### 3. Telegram Bot Setup

1. Create bot with [@BotFather](https://t.me/BotFather)
2. Get bot token and add to environment variables
3. Set bot commands using BotFather:

```
start - Welcome and setup
predict - Place a prediction bet
listmarkets - View active markets
mybets - Your betting portfolio
leaderboard - Top performers
invite - Earn referral rewards
howto - How to use guide
faq - Frequently asked questions
```

## 🎯 Usage

### Natural Language Betting
```
bet 100 USDT on BTC above 70k by Friday
bet 50 USDT on ETH below 3500 today
bet 200 USDT on BNB above 600 by weekend
```

### Bot Commands
- `/start` - Welcome and onboarding
- `/predict` - Guided betting interface
- `/listmarkets` - View active prediction markets
- `/mybets` - Your betting history and portfolio
- `/leaderboard` - Top performers ranking
- `/invite` - Referral program with rewards

## 🌐 Supported Chains

- **Flare** (Primary with FTSO oracles)
- **Ethereum** Mainnet
- **Layer 2**: Polygon, Arbitrum, Optimism, Base
- **BSC** (Binance Smart Chain)
- **Other EVM**: Avalanche, Fantom, zkSync, Scroll, Linea

## 📊 Supported Assets

BTC, ETH, BNB, ADA, SOL, DOT, LINK, MATIC, AVAX, FTM, ONE, NEAR, ATOM

## 💰 Betting Rules

- **Minimum**: 10 USDT per bet
- **Maximum**: 10,000 USDT per bet
- **Supported Predictions**: Price above/below targets
- **Resolution**: Automatic via blockchain oracles
- **Payouts**: Instant upon market resolution

## 🗄️ Database Schema

```sql
-- Users table
users: id, telegram_id, username, referral_code, total_bets, total_won

-- Markets table  
markets: id, title, chain_id, expiry_date, yes_pool, no_pool, is_active

-- Bets table
bets: id, user_id, market_id, chain_id, amount, prediction, tx_hash

-- Referrals table
referrals: id, referrer_id, referee_id, bonus_amount
```

## 🚀 Production Deployment

### Environment Setup
```env
NODE_ENV=production
DATABASE_URL=your_production_postgres_url
TG_BOT_TOKEN=your_bot_token
QWEN_API_KEY=your_qwen_key
WALLETCONNECT_PROJECT_ID=your_project_id
```

### Build & Deploy
```bash
npm run build
npm run start
```

### Replit Deployment
1. Set environment variables in Replit Secrets
2. Use "Deploy" button for production deployment  
3. Bot runs 24/7 with auto-scaling

## 📁 Project Structure

```
├── server/           # Express API server
├── client/           # React dashboard
├── bot/             # Legacy handlers (reference)
├── shared/          # Database schema
└── production.md    # Production guide
```

## 🔧 API Endpoints

- `GET /api/bot/status` - Bot health check
- `GET /api/markets` - Active markets
- `GET /api/leaderboard` - User rankings
- `GET /api/users/:telegramId` - User profile

## 🔐 Security

- Environment variables for all secrets
- No private keys stored locally
- WalletConnect handles transaction signing
- Database connections use SSL in production

## 🐛 Troubleshooting

### Bot Not Responding
```bash
# Check bot status
curl http://localhost:5000/api/bot/status

# Should return: {"isRunning": true, "mode": "live"}
```

### Common Issues
- **Invalid Token**: Verify `TG_BOT_TOKEN` is correct
- **Database Connection**: Check `DATABASE_URL` format
- **Port Issues**: Ensure app binds to `0.0.0.0:5000`

## 📞 Support

1. Check `/faq` command in bot
2. Review console logs in Replit
3. Check API health endpoints
4. Verify environment variables

## 📄 License

MIT License - Open source prediction market bot.

---

**Ready to start?** Set up your environment variables and run `npm run dev`! 🎯
