const { Markup } = require('telegraf');
const fs = require('fs').promises;
const path = require('path');

function handleCommands(bot) {
  
  // Predict command - guided betting
  bot.command('predict', async (ctx) => {
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('📈 BTC Price', 'predict:btc')],
      [Markup.button.callback('📊 ETH Price', 'predict:eth')],
      [Markup.button.callback('⭐ Custom Asset', 'predict:custom')],
    ]);

    await ctx.reply(
      '🎯 **Create a Prediction**\n\n' +
      'Choose an asset to predict, or type a natural language bet like:\n' +
      '`"bet 100 USDT on BTC above 70k by Friday"`',
      {
        parse_mode: 'Markdown',
        ...keyboard
      }
    );
  });

  // List markets command
  bot.command('listmarkets', async (ctx) => {
    try {
      const marketsFile = path.join(__dirname, '..', 'data', 'markets.json');
      let markets = [];
      
      try {
        const data = await fs.readFile(marketsFile, 'utf8');
        markets = JSON.parse(data);
      } catch (e) {
        // No markets file yet
      }

      if (markets.length === 0) {
        return ctx.reply(
          '📊 **No Active Markets**\n\n' +
          'No prediction markets are currently active.\n' +
          'Use /predict to suggest a new market!'
        );
      }

      let message = '📊 **Active Prediction Markets**\n\n';
      markets.slice(0, 10).forEach((market, index) => {
        message += `${index + 1}. **${market.title}**\n`;
        message += `   Chain: ${market.chain}\n`;
        message += `   Expires: ${new Date(market.expiry).toLocaleDateString()}\n`;
        message += `   Pool: ${market.yesPool + market.noPool} USDT\n\n`;
      });

      if (markets.length > 10) {
        message += `... and ${markets.length - 10} more markets`;
      }

      await ctx.replyWithMarkdown(message);
    } catch (error) {
      console.error('List markets error:', error);
      ctx.reply('❌ Error fetching markets. Please try again.');
    }
  });

  // Market info command
  bot.command('marketinfo', async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    
    if (args.length === 0) {
      return ctx.reply('❌ Please specify a market ID: `/marketinfo <id>`', { parse_mode: 'Markdown' });
    }

    // Mock market info
    const mockMarket = {
      id: args[0],
      title: 'BTC > $70,000 by Friday',
      description: 'Will Bitcoin price exceed $70,000 USD by end of Friday?',
      chain: 'Flare Network',
      expiry: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      yesPool: 15420,
      noPool: 8960,
      totalBets: 47,
      oracleSource: 'Flare FTSO',
    };

    const message = `
📊 **Market Information**

**${mockMarket.title}**
${mockMarket.description}

🔗 **Chain:** ${mockMarket.chain}
⏰ **Expires:** ${mockMarket.expiry.toLocaleString()}
📈 **YES Pool:** ${mockMarket.yesPool} USDT
📉 **NO Pool:** ${mockMarket.noPool} USDT
🎯 **Total Bets:** ${mockMarket.totalBets}
🔮 **Oracle:** ${mockMarket.oracleSource}

**Current Odds:**
YES: ${(mockMarket.noPool / (mockMarket.yesPool + mockMarket.noPool) * 100).toFixed(1)}%
NO: ${(mockMarket.yesPool / (mockMarket.yesPool + mockMarket.noPool) * 100).toFixed(1)}%
    `;

    await ctx.replyWithMarkdown(message);
  });

  // My bets command
  bot.command('mybets', async (ctx) => {
    try {
      const userId = ctx.from.id.toString();
      const betsFile = path.join(__dirname, '..', 'data', 'bets.json');
      
      let allBets = [];
      try {
        const data = await fs.readFile(betsFile, 'utf8');
        allBets = JSON.parse(data);
      } catch (e) {
        // No bets file yet
      }

      const userBets = allBets.filter(bet => bet.telegramId === userId);

      if (userBets.length === 0) {
        return ctx.reply(
          '📱 **Your Betting Portfolio**\n\n' +
          'You haven\'t placed any bets yet.\n' +
          'Use /predict to make your first prediction!'
        );
      }

      let message = '📱 **Your Betting Portfolio**\n\n';
      let totalBetAmount = 0;
      let activeBets = 0;

      userBets.slice(-5).forEach((betData, index) => {
        const bet = betData.bet;
        message += `${index + 1}. **${bet.asset} ${bet.condition}**\n`;
        message += `   Amount: ${bet.amount} USDT\n`;
        message += `   Prediction: ${bet.prediction}\n`;
        message += `   Chain: ${bet.chainId}\n`;
        message += `   Status: Active 🟢\n\n`;
        
        totalBetAmount += bet.amount;
        activeBets++;
      });

      message += `📊 **Summary:**\n`;
      message += `Total Bet: ${totalBetAmount} USDT\n`;
      message += `Active Bets: ${activeBets}\n`;
      message += `Win Rate: 0% (no resolved bets yet)`;

      await ctx.replyWithMarkdown(message);
    } catch (error) {
      console.error('My bets error:', error);
      ctx.reply('❌ Error fetching your bets. Please try again.');
    }
  });

  // Leaderboard command
  bot.command('leaderboard', async (ctx) => {
    // Mock leaderboard data
    const leaderboard = [
      { username: 'CryptoKing', wins: 23, total: 892 },
      { username: 'PredictorPro', wins: 19, total: 654 },
      { username: 'OracleWhisperer', wins: 17, total: 543 },
      { username: 'FlareTrader', wins: 15, total: 432 },
      { username: 'ChainGuru', wins: 12, total: 321 },
    ];

    let message = '🏆 **Weekly Leaderboard**\n\n';
    
    leaderboard.forEach((user, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      const winRate = ((user.wins / user.total) * 100).toFixed(1);
      message += `${medal} **${user.username}**\n`;
      message += `   Wins: ${user.wins} | Total: ${user.total} USDT | Rate: ${winRate}%\n\n`;
    });

    message += '🎯 Want to see your name here? Start predicting with /predict!';

    await ctx.replyWithMarkdown(message);
  });

  // Invite command
  bot.command('invite', async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username || ctx.from.first_name;
    const referralCode = `ref_${userId}`;
    const referralLink = `https://t.me/your_bot_username?start=${referralCode}`;

    const message = `
🎁 **Referral Program**

Invite friends and earn **5%** of their winnings!

**Your Referral Link:**
\`${referralLink}\`

**How it works:**
• Friend joins using your link
• They place their first bet
• You earn 5% of their winnings forever
• They get a 10 USDT welcome bonus

**Your Stats:**
• Referrals: 0
• Bonus Earned: 0 USDT

Share your link and start earning! 💰
    `;

    const keyboard = Markup.inlineKeyboard([
      Markup.button.url('📤 Share Link', `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Join the best multichain prediction market bot!')}`),
    ]);

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...keyboard
    });
  });

  // How to command
  bot.command('howto', async (ctx) => {
    const message = `
📚 **How to Use MultiChain Prediction Markets**

**1. Natural Language Betting:**
Just type: \`"bet 100 USDT on BTC above 70k by Friday"\`
The AI will parse your bet and guide you through the process.

**2. Guided Betting:**
Use \`/predict\` for step-by-step bet creation.

**3. Choose Your Chain:**
Select from 12+ blockchains including Flare, Ethereum, Polygon, Arbitrum, and more.

**4. Wallet Connection:**
Connect via WalletConnect (MetaMask, Bifrost, Rabby supported).

**5. Track Performance:**
• \`/mybets\` - Your betting portfolio
• \`/leaderboard\` - Top performers
• \`/marketinfo <id>\` - Market details

**6. Earn Rewards:**
• Refer friends with \`/invite\`
• Win streak bonuses
• NFT badges for milestones

**Supported Bet Types:**
• Price predictions (BTC > $70k)
• Time-based outcomes (by Friday)
• Custom markets (admin created)

**Payment:**
All bets in USDT, automatic payouts on resolution.

Ready to start? Try: \`"bet 50 USDT on ETH above 3500 today"\`
    `;

    await ctx.replyWithMarkdown(message);
  });

  // FAQ command
  bot.command('faq', async (ctx) => {
    const message = `
❓ **Frequently Asked Questions**

**Q: Which blockchains are supported?**
A: Flare, Ethereum, Polygon, Arbitrum, Optimism, Base, BSC, Avalanche, Fantom, zkSync, Scroll, Linea.

**Q: How do I connect my wallet?**
A: We use WalletConnect v2. Just click confirm when placing a bet and scan the QR code.

**Q: Are transactions gasless?**
A: Yes! We use meta-transactions for seamless betting experience.

**Q: How are markets resolved?**
A: Flare FTSO oracles for Flare network, Chainlink for other chains. Fully decentralized.

**Q: What's the minimum bet?**
A: 10 USDT minimum, 10,000 USDT maximum per bet.

**Q: When do I get paid?**
A: Automatic payouts within 1 hour of market resolution.

**Q: How do referrals work?**
A: Earn 5% of friends' winnings forever. They get 10 USDT welcome bonus.

**Q: Is there a daily limit?**
A: No daily betting limits. Plus daily free prediction faucet for engagement.

**Q: How secure is it?**
A: Smart contracts audited, oracle verified, funds are always in your control.

**Need more help?** Type your question and our AI will try to help!
    `;

    await ctx.replyWithMarkdown(message);
  });

  // Prediction asset selection callbacks
  bot.action('predict:btc', async (ctx) => {
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('📈 Above $70k', 'bet:btc:above:70000'),
        Markup.button.callback('📉 Below $65k', 'bet:btc:below:65000')
      ],
      [Markup.button.callback('🎯 Custom Price', 'bet:btc:custom')]
    ]);

    await ctx.editMessageText(
      '₿ **Bitcoin Price Prediction**\n\n' +
      'Current BTC: ~$67,420\n\n' +
      'Choose your prediction:',
      {
        parse_mode: 'Markdown',
        ...keyboard
      }
    );
  });

  bot.action('predict:eth', async (ctx) => {
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('📈 Above $3500', 'bet:eth:above:3500'),
        Markup.button.callback('📉 Below $3200', 'bet:eth:below:3200')
      ],
      [Markup.button.callback('🎯 Custom Price', 'bet:eth:custom')]
    ]);

    await ctx.editMessageText(
      '⟠ **Ethereum Price Prediction**\n\n' +
      'Current ETH: ~$3,340\n\n' +
      'Choose your prediction:',
      {
        parse_mode: 'Markdown',
        ...keyboard
      }
    );
  });

  // Bet amount selection
  bot.action(/bet:(\w+):(above|below):(\d+)/, async (ctx) => {
    const [, asset, direction, price] = ctx.match;
    
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('💰 50 USDT', `amount:${asset}:${direction}:${price}:50`),
        Markup.button.callback('💰 100 USDT', `amount:${asset}:${direction}:${price}:100`)
      ],
      [
        Markup.button.callback('💰 250 USDT', `amount:${asset}:${direction}:${price}:250`),
        Markup.button.callback('💰 500 USDT', `amount:${asset}:${direction}:${price}:500`)
      ],
      [Markup.button.callback('🎯 Custom Amount', `amount:${asset}:${direction}:${price}:custom`)]
    ]);

    await ctx.editMessageText(
      `💰 **Choose Bet Amount**\n\n` +
      `Prediction: ${asset.toUpperCase()} ${direction} $${price}\n\n` +
      `Select amount to bet:`,
      {
        parse_mode: 'Markdown',
        ...keyboard
      }
    );
  });

  // Final bet confirmation with chain selection
  bot.action(/amount:(\w+):(above|below):(\d+):(\d+)/, async (ctx) => {
    const [, asset, direction, price, amount] = ctx.match;
    
    // Trigger chain selection like in natural language flow
    const { getChainOptions } = require('../services/blockchain');
    const chains = getChainOptions();
    
    const betData = {
      asset: asset.toUpperCase(),
      condition: `${direction} $${price}`,
      prediction: direction === 'above' ? 'YES' : 'NO',
      amount: parseInt(amount),
      deadline: 'end of day'
    };

    const keyboard = Markup.inlineKeyboard(
      chains.map(chain => Markup.button.callback(
        `${chain.emoji} ${chain.name}`, 
        `select_chain:${chain.id}:${JSON.stringify(betData)}`
      )),
      { columns: 2 }
    );

    await ctx.editMessageText(
      `🎯 **Confirm Your Bet:**\n` +
      `Asset: ${betData.asset}\n` +
      `Condition: ${betData.condition}\n` +
      `Prediction: ${betData.prediction}\n` +
      `Amount: ${betData.amount} USDT\n` +
      `Deadline: ${betData.deadline}\n\n` +
      `Select blockchain:`,
      {
        parse_mode: 'Markdown',
        ...keyboard
      }
    );
  });
}

module.exports = { handleCommands };
