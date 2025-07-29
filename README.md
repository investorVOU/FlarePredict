# 🎯 MultiChain Prediction Markets Telegram Bot

A fully decentralized multichain prediction market Telegram bot with NLP capabilities, powered by Flare FTSO oracles and supporting 12+ EVM blockchains.

## 🌟 Features

### 🤖 AI-Powered Natural Language Betting
- Type: `"bet 100 USDT on BTC above 70k by Friday"`
- Qwen AI parses natural language into structured bets
- Supports multiple languages and voice commands

### 🔗 Multichain Support
- **Flare Network** (with FTSO oracles)
- **Ethereum, Polygon, Arbitrum, Optimism, Base**
- **BSC, Avalanche, Fantom, zkSync, Scroll, Linea**
- Easy modular support for additional EVM chains

### 💰 Advanced Features
- **Gasless Transactions** via meta-transactions
- **WalletConnect v2** integration (MetaMask, Bifrost, Rabby)
- **Automatic Oracle Resolution** (Flare FTSO + Chainlink)
- **Referral System** with 5% lifetime earnings
- **Leaderboards** and portfolio tracking
- **Daily Free Prediction Faucet**

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Add your API keys
TG_BOT_TOKEN=your_telegram_bot_token
QWEN_API_KEY=your_qwen_api_key
WALLETCONNECT_PROJECT_ID=your_project_id
