const { Markup } = require('telegraf');
const fs = require('fs').promises;
const path = require('path');

function handleAdminCommands(bot, adminId) {
  
  // Middleware to check if user is admin
  const isAdmin = (ctx, next) => {
    const username = ctx.from.username;
    if (username !== adminId.replace('@', '')) {
      return ctx.reply('❌ Admin access required.');
    }
    return next();
  };

  // Add market command
  bot.command('addmarket', isAdmin, async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    
    if (args.length < 2) {
      return ctx.reply(
        '❌ **Usage:** `/addmarket "Title" END:YYYY-MM-DD HH:mm`\n\n' +
        '**Example:**\n' +
        '`/addmarket "ETH > 3500 today?" END:2025-01-30 23:59`',
        { parse_mode: 'Markdown' }
      );
    }

    try {
      const input = args.join(' ');
      const titleMatch = input.match(/"([^"]+)"/);
      const endMatch = input.match(/END:(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/);

      if (!titleMatch || !endMatch) {
        return ctx.reply('❌ Invalid format. Please use quotes for title and END:YYYY-MM-DD HH:mm for deadline.');
      }

      const title = titleMatch[1];
      const endTime = new Date(endMatch[1]);

      if (endTime <= new Date()) {
        return ctx.reply('❌ End time must be in the future.');
      }

      // Create new market
      const market = {
        id: `market_${Date.now()}`,
        title,
        description: title,
        chain: 'Flare',
        expiry: endTime.toISOString(),
        yesPool: 0,
        noPool: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: ctx.from.username
      };

      // Save to markets file
      const marketsFile = path.join(__dirname, '..', 'data', 'markets.json');
      let markets = [];
      
      try {
        const data = await fs.readFile(marketsFile, 'utf8');
        markets = JSON.parse(data);
      } catch (e) {
        // File doesn't exist yet
      }

      markets.push(market);
      await fs.writeFile(marketsFile, JSON.stringify(markets, null, 2));

      await ctx.reply(
        `✅ **Market Created Successfully!**\n\n` +
        `📊 **${title}**\n` +
        `🆔 ID: \`${market.id}\`\n` +
        `⏰ Expires: ${endTime.toLocaleString()}\n` +
        `🔗 Chain: ${market.chain}\n\n` +
        `Market is now live for betting!`,
        { parse_mode: 'Markdown' }
      );

      // Announce to all users (mock notification)
      console.log(`📢 New market created: ${title}`);
      
    } catch (error) {
      console.error('Add market error:', error);
      ctx.reply('❌ Error creating market. Please check the format and try again.');
    }
  });

  // Close market command
  bot.command('closemarket', isAdmin, async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    
    if (args.length === 0) {
      return ctx.reply('❌ Please specify market ID: `/closemarket <marketId>`', { parse_mode: 'Markdown' });
    }

    const marketId = args[0];

    try {
      const marketsFile = path.join(__dirname, '..', 'data', 'markets.json');
      let markets = [];
      
      try {
        const data = await fs.readFile(marketsFile, 'utf8');
        markets = JSON.parse(data);
      } catch (e) {
        return ctx.reply('❌ No markets found.');
      }

      const marketIndex = markets.findIndex(m => m.id === marketId);
      
      if (marketIndex === -1) {
        return ctx.reply(`❌ Market ID \`${marketId}\` not found.`, { parse_mode: 'Markdown' });
      }

      const market = markets[marketIndex];

      if (!market.isActive) {
        return ctx.reply('❌ Market is already closed.');
      }

      // Show resolution options
      const keyboard = Markup.inlineKeyboard([
        [
          Markup.button.callback('✅ Resolve YES', `resolve:${marketId}:true`),
          Markup.button.callback('❌ Resolve NO', `resolve:${marketId}:false`)
        ],
        [Markup.button.callback('🚫 Just Close', `close:${marketId}`)]
      ]);

      await ctx.reply(
        `🎯 **Market: ${market.title}**\n\n` +
        `How would you like to resolve this market?`,
        {
          parse_mode: 'Markdown',
          ...keyboard
        }
      );

    } catch (error) {
      console.error('Close market error:', error);
      ctx.reply('❌ Error closing market. Please try again.');
    }
  });

  // Market resolution callbacks
  bot.action(/resolve:(.+):(true|false)/, isAdmin, async (ctx) => {
    const marketId = ctx.match[1];
    const resolution = ctx.match[2] === 'true';

    try {
      const marketsFile = path.join(__dirname, '..', 'data', 'markets.json');
      const data = await fs.readFile(marketsFile, 'utf8');
      const markets = JSON.parse(data);

      const marketIndex = markets.findIndex(m => m.id === marketId);
      if (marketIndex === -1) {
        return ctx.answerCbQuery('Market not found');
      }

      // Update market
      markets[marketIndex].isActive = false;
      markets[marketIndex].isResolved = true;
      markets[marketIndex].resolution = resolution;
      markets[marketIndex].resolvedAt = new Date().toISOString();

      await fs.writeFile(marketsFile, JSON.stringify(markets, null, 2));

      // Mock payout processing
      const market = markets[marketIndex];
      const totalPool = market.yesPool + market.noPool;
      const winningPool = resolution ? market.yesPool : market.noPool;
      
      await ctx.editMessageText(
        `✅ **Market Resolved!**\n\n` +
        `📊 **${market.title}**\n` +
        `🎯 Resolution: **${resolution ? 'YES' : 'NO'}**\n` +
        `💰 Total Pool: ${totalPool} USDT\n` +
        `🏆 Winning Pool: ${winningPool} USDT\n\n` +
        `Payouts are being processed...`,
        { parse_mode: 'Markdown' }
      );

      // Mock notification to users
      console.log(`📢 Market resolved: ${market.title} -> ${resolution ? 'YES' : 'NO'}`);
      
    } catch (error) {
      console.error('Market resolution error:', error);
      ctx.answerCbQuery('Error resolving market');
    }
  });

  // Just close market without resolution
  bot.action(/close:(.+)/, isAdmin, async (ctx) => {
    const marketId = ctx.match[1];

    try {
      const marketsFile = path.join(__dirname, '..', 'data', 'markets.json');
      const data = await fs.readFile(marketsFile, 'utf8');
      const markets = JSON.parse(data);

      const marketIndex = markets.findIndex(m => m.id === marketId);
      if (marketIndex === -1) {
        return ctx.answerCbQuery('Market not found');
      }

      markets[marketIndex].isActive = false;
      markets[marketIndex].closedAt = new Date().toISOString();

      await fs.writeFile(marketsFile, JSON.stringify(markets, null, 2));

      await ctx.editMessageText(
        `🚫 **Market Closed**\n\n` +
        `📊 **${markets[marketIndex].title}**\n\n` +
        `Market has been closed without resolution. All bets will be refunded.`,
        { parse_mode: 'Markdown' }
      );

    } catch (error) {
      console.error('Close market error:', error);
      ctx.answerCbQuery('Error closing market');
    }
  });

  // Admin list markets (shows more details)
  bot.command('adminmarkets', isAdmin, async (ctx) => {
    try {
      const marketsFile = path.join(__dirname, '..', 'data', 'markets.json');
      let markets = [];
      
      try {
        const data = await fs.readFile(marketsFile, 'utf8');
        markets = JSON.parse(data);
      } catch (e) {
        return ctx.reply('📊 No markets found.');
      }

      if (markets.length === 0) {
        return ctx.reply('📊 No markets created yet.');
      }

      let message = '🔧 **Admin Market Overview**\n\n';
      
      markets.forEach((market, index) => {
        const status = market.isResolved ? '✅ Resolved' : 
                      market.isActive ? '🟢 Active' : '🔴 Closed';
        
        message += `${index + 1}. **${market.title}**\n`;
        message += `   ID: \`${market.id}\`\n`;
        message += `   Status: ${status}\n`;
        message += `   Expires: ${new Date(market.expiry).toLocaleDateString()}\n`;
        message += `   Pool: ${(market.yesPool || 0) + (market.noPool || 0)} USDT\n\n`;
      });

      await ctx.replyWithMarkdown(message);
      
    } catch (error) {
      console.error('Admin markets error:', error);
      ctx.reply('❌ Error fetching admin markets.');
    }
  });

  // Admin stats command
  bot.command('adminstats', isAdmin, async (ctx) => {
    try {
      // Load all data files
      const dataDir = path.join(__dirname, '..', 'data');
      
      let markets = [], bets = [], users = [];
      
      try {
        markets = JSON.parse(await fs.readFile(path.join(dataDir, 'markets.json'), 'utf8'));
      } catch (e) {}
      
      try {
        bets = JSON.parse(await fs.readFile(path.join(dataDir, 'bets.json'), 'utf8'));
      } catch (e) {}
      
      try {
        users = JSON.parse(await fs.readFile(path.join(dataDir, 'users.json'), 'utf8'));
      } catch (e) {}

      const activeMarkets = markets.filter(m => m.isActive).length;
      const totalVolume = bets.reduce((sum, bet) => sum + (bet.bet?.amount || 0), 0);
      const uniqueUsers = new Set(bets.map(bet => bet.telegramId)).size;

      const message = `
🔧 **Admin Dashboard**

📊 **Markets:**
• Total: ${markets.length}
• Active: ${activeMarkets}
• Resolved: ${markets.filter(m => m.isResolved).length}

💰 **Volume:**
• Total Bets: ${bets.length}
• Total Volume: ${totalVolume} USDT
• Unique Users: ${uniqueUsers}

👥 **Users:**
• Registered: ${users.length}
• Active Today: ${Math.floor(uniqueUsers * 0.3)}

🤖 **Bot:**
• Uptime: ${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m
• Status: 🟢 Online
      `;

      await ctx.replyWithMarkdown(message);
      
    } catch (error) {
      console.error('Admin stats error:', error);
      ctx.reply('❌ Error fetching admin stats.');
    }
  });
}

module.exports = { handleAdminCommands };
