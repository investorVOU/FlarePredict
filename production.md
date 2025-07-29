
# Production Deployment Guide

## 🚀 Quick Production Setup

### 1. Environment Configuration

Set these required environment variables in Replit Secrets:

```env
# Essential
NODE_ENV=production
TG_BOT_TOKEN=your_telegram_bot_token_from_botfather
DATABASE_URL=postgresql://user:pass@host:port/dbname

# Optional (for enhanced features)
QWEN_API_KEY=your_qwen_ai_key_for_nlp
WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### 2. Telegram Bot Configuration

#### A. Create Bot with BotFather
1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Use `/newbot` command
3. Choose bot name and username
4. Copy the token to `TG_BOT_TOKEN` secret

#### B. Configure Bot Commands
Send this to BotFather using `/setcommands`:

```
start - 🎯 Welcome to MultiChain Prediction Markets
predict - 📈 Place a prediction bet
listmarkets - 📊 View active markets  
mybets - 📱 Your betting portfolio
leaderboard - 🏆 Top performers
invite - 🤝 Earn referral rewards
howto - 📚 How to use the bot
faq - ❓ Frequently asked questions
```

### 3. Database Setup

#### Option A: Replit Database (Recommended)
1. Enable Replit Database in your repl
2. It automatically creates `DATABASE_URL`
3. No additional setup required

#### Option B: External PostgreSQL
```bash
# Example DATABASE_URL format:
DATABASE_URL=postgresql://username:password@hostname:5432/database_name

# For Railway, Supabase, etc.
# Copy connection string from your provider
```

### 4. Production Build

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm run start
```

### 5. Replit Deployment

#### A. Always-On Deployment
1. Click "Deploy" in Replit header
2. Choose "Reserved VM" for 24/7 uptime
3. Select "Deploy" to publish

#### B. Autoscale Deployment
1. Click "Deploy" button
2. Choose "Autoscale" for high traffic
3. Configure custom domain if needed
4. Deploy with auto-scaling enabled

## 🔍 Health Monitoring

### Health Check Endpoints

```bash
# Bot status
curl https://your-repl-url.repl.co/api/bot/status

# Expected response:
{
  "isRunning": true,
  "mode": "live",
  "uptime": "2h 15m"
}

# Markets endpoint
curl https://your-repl-url.repl.co/api/markets

# Leaderboard
curl https://your-repl-url.repl.co/api/leaderboard
```

### Monitor Bot Health
```bash
# Test bot commands
# Send "/start" to your bot - should get welcome message
# Try "bet 100 USDT on BTC above 70k" - should parse correctly

# Check logs in Replit console for:
# ✅ Telegram bot successfully started
# 🤖 Bot info: @yourbotname
```

## ⚡ Performance Optimization

### Database Indexes
```sql
-- Auto-created by Drizzle schema
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_bets_user_id ON bets(user_id);  
CREATE INDEX idx_markets_active ON markets(is_active);
```

### Caching Strategy
- API responses cached for 30 seconds
- User sessions cached per interaction
- Market data refreshed every minute
- Replit handles CDN and edge caching

## 🔐 Security Checklist

### ✅ Production Security
- [ ] All API keys in Replit Secrets (never in code)
- [ ] Database uses SSL connections  
- [ ] Bot token secured and valid
- [ ] No hardcoded credentials anywhere
- [ ] CORS configured for web dashboard
- [ ] Error messages don't expose internals

### ✅ Bot Security  
- [ ] Commands properly documented
- [ ] Rate limiting handled by Replit
- [ ] User input validated and sanitized
- [ ] Callback data length limits respected

## 📈 Scaling Considerations

### Replit Auto-Scaling
- Handles 10,000+ concurrent users automatically
- Built-in load balancing across regions
- Automatic failover and recovery
- No manual server management needed

### Database Scaling
```bash
# Monitor database performance
# Use connection pooling (handled by Drizzle)
# Consider read replicas for high traffic
# Index optimization for better query performance
```

## 🛠️ Troubleshooting

### Common Issues & Solutions

#### Bot Not Starting
```bash
# Check token validity
echo $TG_BOT_TOKEN
# Should be format: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# Check logs for error messages
# Look for "🤖 Telegram bot successfully started"
```

#### Database Connection Issues
```bash
# Verify DATABASE_URL format
echo $DATABASE_URL  
# Should start with postgresql://

# Test connection from Replit shell
npm run db:check  # If you add this script
```

#### Button/Command Errors
```bash
# Check for BUTTON_DATA_INVALID errors
# Usually caused by callback data > 64 bytes
# Solution: Use shorter callback identifiers
```

### Performance Issues
```bash
# Monitor response times
curl -w "%{time_total}" https://your-app.repl.co/api/bot/status

# Check memory usage in Replit metrics
# Optimize database queries if needed
```

## 🚀 Go-Live Checklist

### Pre-Launch
- [ ] Environment variables configured in Secrets
- [ ] Database connected and schema deployed
- [ ] Bot token valid and commands set
- [ ] Health checks returning success
- [ ] Web dashboard accessible
- [ ] Natural language parsing working

### Launch Day
- [ ] Deploy to production via Replit Deploy
- [ ] Test all bot commands end-to-end
- [ ] Verify chain selection and wallet connection
- [ ] Test betting flow completely
- [ ] Monitor error logs for first hour
- [ ] Announce bot to users

### Post-Launch
- [ ] Monitor daily active users
- [ ] Track betting volume and success rates
- [ ] Review error logs weekly
- [ ] Update dependencies monthly
- [ ] Backup user data regularly

## 📊 Monitoring & Analytics

### Built-in Metrics
```bash
# Bot usage stats
GET /api/bot/status
# Returns uptime, active users, recent activity

# Market performance  
GET /api/markets
# Active markets, betting volumes, resolution rates

# User engagement
GET /api/leaderboard  
# Top users, win rates, referral activity
```

### Custom Monitoring
```javascript
// Add to your monitoring dashboard
const metrics = {
  totalUsers: await storage.getUserCount(),
  totalBets: await storage.getBetCount(), 
  activeBets: await storage.getActiveBetCount(),
  totalVolume: await storage.getTotalVolume()
};
```

## 🔄 Update Process

### Safe Deployment Updates
1. Test changes in development branch
2. Create backup of current production state
3. Deploy new version using Replit Deploy
4. Monitor for 30 minutes post-deployment
5. Rollback if critical issues detected

### Database Migrations
```bash
# Drizzle handles schema changes automatically
npm run db:push  # Applies schema changes
npm run db:migrate  # For complex migrations
```

## 📞 Emergency Response

### Bot Down Recovery
1. Check Replit deployment status
2. Verify environment variables
3. Restart deployment if needed
4. Check database connectivity
5. Monitor recovery in real-time

### Data Recovery
- Replit provides automatic backups
- Database transactions are atomic
- User data is always consistent
- Betting records are immutable once confirmed

---

**Production Ready!** Your MultiChain Prediction Markets bot is now live and scalable on Replit. 🎯

For ongoing support, monitor the health endpoints and check Replit console logs regularly.
