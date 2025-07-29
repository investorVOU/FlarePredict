
# 🚀 Production Deployment Guide

## Production Environment Setup

### 1. Environment Configuration

Create a production-ready `.env` file:

```env
# Production Environment
NODE_ENV=production

# Required: Telegram Bot Token
TG_BOT_TOKEN=your_production_bot_token

# Required: Database (Use Neon, Supabase, or similar)
DATABASE_URL=postgresql://username:password@host:port/dbname?sslmode=require

# Optional: AI Integration
QWEN_API_KEY=your_qwen_api_key

# Optional: WalletConnect Integration
WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Server Configuration
PORT=5000
HOST=0.0.0.0
```

### 2. Database Setup

#### Option A: Neon Database (Recommended)
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to `DATABASE_URL`

#### Option B: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get PostgreSQL connection string
4. Add to `DATABASE_URL`

### 3. Telegram Bot Production Setup

#### Create Production Bot
```bash
# Message @BotFather on Telegram
/newbot
# Follow prompts to create production bot
# Copy token to TG_BOT_TOKEN
```

#### Set Bot Commands
```bash
# Message your bot and send these commands to @BotFather
/setcommands

# Paste this command list:
start - 🎯 Welcome to MultiChain Prediction Markets
predict - 📈 Place a prediction bet
listmarkets - 📊 View active markets  
mybets - 📱 Your betting portfolio
leaderboard - 🏆 Top performers
invite - 🤝 Earn referral rewards
howto - 📚 How to use the bot
faq - ❓ Frequently asked questions
```

### 4. Production Build Process

#### Build the Application
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm run start
```

#### Verify Build
```bash
# Check build output
ls -la dist/
# Should contain built server files

# Test production start
npm run start
# Should start without development tools
```

### 5. Replit Production Deployment

#### A. Configure Secrets
1. Go to Replit Secrets tab
2. Add these secrets:
   - `TG_BOT_TOKEN`: Your bot token
   - `DATABASE_URL`: Your database connection
   - `QWEN_API_KEY`: AI service key (optional)
   - `WALLETCONNECT_PROJECT_ID`: WalletConnect key (optional)

#### B. Configure Deployment
1. Go to Deployments tab in Replit
2. Click "Deploy"
3. Choose "Autoscale" for production traffic
4. Configure custom domain if needed

#### C. Always-On Configuration
```toml
# .replit file should contain:
[deployment]
run = "npm run start"
deploymentTarget = "cloudrun"

[[ports]]
localPort = 5000
externalPort = 80
```

### 6. Monitoring & Health Checks

#### Health Check Endpoint
The app includes a health check at `/api/bot/status`:

```javascript
// Example health check response
{
  "isRunning": true,
  "mode": "live",
  "uptime": "2h 15m",
  "lastActivity": "2024-01-15T10:30:00Z"
}
```

#### Monitor Bot Status
```bash
# Check if bot is responding
curl https://your-repl-url.repl.co/api/bot/status

# Check markets endpoint
curl https://your-repl-url.repl.co/api/markets
```

### 7. Performance Optimization

#### Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_bets_user_id ON bets(user_id);
CREATE INDEX idx_markets_active ON markets(is_active);
```

#### Caching Strategy
- API responses cached for 30 seconds
- User data cached per session
- Market data refreshed every minute

### 8. Security Checklist

#### ✅ Production Security
- [ ] All API keys in environment variables
- [ ] Database connection uses SSL
- [ ] No hardcoded secrets in code
- [ ] Bot token secured in Replit Secrets
- [ ] CORS configured for web dashboard
- [ ] Rate limiting enabled (handled by Replit)

#### ✅ Telegram Bot Security
- [ ] Bot username doesn't contain sensitive info
- [ ] Bot description is user-friendly
- [ ] Commands are properly documented
- [ ] Error messages don't expose internals

### 9. Scaling Considerations

#### Replit Autoscale
- Automatically scales based on traffic
- Handles 10,000+ concurrent users
- Built-in load balancing

#### Database Scaling
- Use connection pooling
- Implement read replicas if needed
- Monitor query performance

### 10. Maintenance

#### Regular Tasks
- Monitor bot uptime
- Check error logs weekly
- Update dependencies monthly
- Backup database regularly

#### Update Process
1. Test changes in development
2. Create backup of current deployment
3. Deploy new version
4. Monitor for 24 hours
5. Rollback if issues occur

### 11. Troubleshooting

#### Common Issues

**Bot Not Responding**
```bash
# Check bot status
curl https://your-app.repl.co/api/bot/status

# Check logs in Replit console
# Look for "🤖 Telegram bot is running..."
```

**Database Connection Issues**
```bash
# Verify DATABASE_URL format
echo $DATABASE_URL
# Should start with postgresql://
```

**Port Configuration**
```bash
# Ensure app binds to 0.0.0.0:5000
# Check server/index.ts for correct host binding
```

### 12. Go-Live Checklist

#### Pre-Launch
- [ ] Environment variables configured
- [ ] Database connected and migrated
- [ ] Bot token active and tested
- [ ] Health checks passing
- [ ] Web dashboard accessible

#### Launch
- [ ] Deploy to production
- [ ] Test all bot commands
- [ ] Verify natural language parsing
- [ ] Check wallet connection flow
- [ ] Monitor error rates

#### Post-Launch
- [ ] Share bot with initial users
- [ ] Monitor performance metrics
- [ ] Collect user feedback
- [ ] Plan feature updates

---

**Your MultiChain Prediction Markets bot is now ready for production! 🚀**

Monitor the health endpoint and Replit logs to ensure smooth operation.
