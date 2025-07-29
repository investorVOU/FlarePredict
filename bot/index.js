const { Telegraf, Markup } = require('telegraf');
const fs = require('fs').promises;
const path = require('path');

const { handleCommands } = require('./handlers/commands');
const { handleAdminCommands } = require('./handlers/admin');
const { parseNaturalLanguageBet } = require('./services/nlp');
const { getChainOptions } = require('./services/blockchain');

// Load environment variables
require('dotenv').config();

const bot = new Telegraf(process.env.TG_BOT_TOKEN || 'your-bot-token');

// Admin user ID
const ADMIN_ID = '@maxinayas';

// Middleware to handle errors
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('❌ An error occurred. Please try again later.');
});

// Start command
bot.start(async (ctx) => {
  const welcomeMessage = `
🎯 **Welcome to MultiChain Prediction Markets!**

Powered by Flare FTSO and 10+ blockchains with AI-powered natural language betting.

**Quick Start:**
• Type: "bet 100 USDT on BTC above 70k by Friday"
• Use /predict for guided betting
• Check /howto for detailed instructions

**Available Commands:**
/predict - Place a prediction bet
/listmarkets - View active markets
/mybets - Your betting portfolio
/leaderboard - Top performers
/invite - Earn referral rewards
/faq - Frequently asked questions

**Supported Chains:**
Flare, Ethereum, Polygon, Arbitrum, Optimism, Base, BSC, Avalanche, Fantom, zkSync, Scroll, Linea

Ready to start predicting? 🚀
  `;

  await ctx.replyWithMarkdown(welcomeMessage);
});

// Natural language bet parsing
bot.hears(/bet\s+/i, async (ctx) => {
  try {
    const text = ctx.message.text;
    const parsed = await parseNaturalLanguageBet(text);
    
    if (!parsed.success) {
      return ctx.reply(`❌ ${parsed.error}\n\nTry: "bet 100 USDT on BTC above 70k by Friday"`);
    }

    const chains = getChainOptions();
    const keyboard = Markup.inlineKeyboard(
      chains.map(chain => Markup.button.callback(
        `${chain.emoji} ${chain.name}`, 
        `select_chain:${chain.id}:${JSON.stringify(parsed.data)}`
      )),
      { columns: 2 }
    );

    await ctx.reply(
      `🎯 **Parsed Bet:**\n` +
      `Asset: ${parsed.data.asset}\n` +
      `Condition: ${parsed.data.condition}\n` +
      `Prediction: ${parsed.data.prediction}\n` +
      `Amount: ${parsed.data.amount} USDT\n` +
      `Deadline: ${parsed.data.deadline}\n\n` +
      `Select blockchain:`,
      {
        parse_mode: 'Markdown',
        ...keyboard
      }
    );
  } catch (error) {
    console.error('NLP parsing error:', error);
    ctx.reply('❌ Failed to parse your bet. Please try again or use /predict for guided betting.');
  }
});

// Chain selection callback
bot.action(/select_chain:(.+):(.+)/, async (ctx) => {
  try {
    const chainId = ctx.match[1];
    const betData = JSON.parse(ctx.match[2]);
    
    // Mock potential payout calculation
    const potentialPayout = Math.round(betData.amount * 1.65);
    
    const confirmKeyboard = Markup.inlineKeyboard([
      Markup.button.callback('✅ Confirm Bet', `confirm_bet:${chainId}:${JSON.stringify(betData)}`),
      Markup.button.callback('❌ Cancel', 'cancel_bet')
    ]);

    const chainName = getChainOptions().find(c => c.id === chainId)?.name || chainId;
    
    await ctx.editMessageText(
      `🔗 **${chainName} Blockchain Selected**\n\n` +
      `🎯 Bet: ${betData.asset} ${betData.condition}\n` +
      `💰 Amount: ${betData.amount} USDT\n` +
      `📈 Prediction: ${betData.prediction}\n` +
      `⏰ Deadline: ${betData.deadline}\n` +
      `💎 Potential Payout: ${potentialPayout} USDT\n\n` +
      `Connect your wallet to confirm?`,
      {
        parse_mode: 'Markdown',
        ...confirmKeyboard
      }
    );
  } catch (error) {
    console.error('Chain selection error:', error);
    ctx.reply('❌ Error processing chain selection.');
  }
});

// Bet confirmation
bot.action(/confirm_bet:(.+):(.+)/, async (ctx) => {
  try {
    const chainId = ctx.match[1];
    const betData = JSON.parse(ctx.match[2]);
    
    // Mock wallet connection and transaction
    await ctx.editMessageText('🔗 Connecting to WalletConnect...');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await ctx.editMessageText('📝 Please sign the transaction in your wallet...');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock transaction hash
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    await ctx.editMessageText(
      `✅ **Bet Placed Successfully!**\n\n` +
      `🔗 Chain: ${getChainOptions().find(c => c.id === chainId)?.name}\n` +
      `💰 Amount: ${betData.amount} USDT\n` +
      `📈 Prediction: ${betData.prediction}\n` +
      `🔗 TX: \`${txHash}\`\n\n` +
      `Your bet is now active! Check /mybets for updates.`,
      { parse_mode: 'Markdown' }
    );

    // Log bet to mock database
    const userData = {
      telegramId: ctx.from.id.toString(),
      username: ctx.from.username || ctx.from.first_name,
      bet: {
        ...betData,
        chainId,
        txHash,
        timestamp: new Date().toISOString()
      }
    };

    // Save to mock JSON storage
    try {
      const betsFile = path.join(__dirname, 'data', 'bets.json');
      let bets = [];
      try {
        const existing = await fs.readFile(betsFile, 'utf8');
        bets = JSON.parse(existing);
      } catch (e) {
        // File doesn't exist yet
      }
      bets.push(userData);
      await fs.writeFile(betsFile, JSON.stringify(bets, null, 2));
    } catch (error) {
      console.error('Error saving bet:', error);
    }

  } catch (error) {
    console.error('Bet confirmation error:', error);
    ctx.reply('❌ Error confirming bet. Please try again.');
  }
});

// Cancel bet
bot.action('cancel_bet', async (ctx) => {
  await ctx.editMessageText('❌ Bet cancelled.');
});

// Register command handlers
handleCommands(bot);

// Register admin handlers (only for specific admin user)
handleAdminCommands(bot, ADMIN_ID);

// Error handling for unhandled actions
bot.on('callback_query', (ctx) => {
  ctx.answerCbQuery('Action not recognized');
});

// Launch bot
async function launchBot() {
  try {
    // Ensure data directory exists
    const dataDir = path.join(__dirname, 'data');
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }

    // Initialize empty data files if they don't exist
    const files = ['users.json', 'bets.json', 'markets.json'];
    for (const file of files) {
      const filePath = path.join(dataDir, file);
      try {
        await fs.access(filePath);
      } catch (e) {
        await fs.writeFile(filePath, '[]');
      }
    }

    await bot.launch();
    console.log('🤖 Telegram bot is running...');
    
    // Graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  } catch (error) {
    console.error('Failed to launch bot:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  launchBot();
}

module.exports = { bot, launchBot };
