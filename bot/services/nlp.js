// Mock Qwen AI NLP service for parsing natural language bets
async function parseNaturalLanguageBet(text) {
  try {
    // Remove common prefixes
    const cleanText = text.replace(/^(bet|i want to bet|place a bet)/i, '').trim();
    
    // Parse amount
    const amountMatch = cleanText.match(/(\d+(?:\.\d+)?)\s*(usdt|usd|dollars?)/i);
    if (!amountMatch) {
      return {
        success: false,
        error: "Could not find bet amount. Please specify amount in USDT (e.g., '100 USDT')"
      };
    }
    const amount = parseFloat(amountMatch[1]);
    
    if (amount < 10) {
      return {
        success: false,
        error: "Minimum bet amount is 10 USDT"
      };
    }
    
    if (amount > 10000) {
      return {
        success: false,
        error: "Maximum bet amount is 10,000 USDT"
      };
    }

    // Parse asset
    const assetMatch = cleanText.match(/\b(btc|bitcoin|eth|ethereum|bnb|ada|sol|dot|link|matic|avax|ftm|one|near|atom)\b/i);
    if (!assetMatch) {
      return {
        success: false,
        error: "Could not identify asset. Supported: BTC, ETH, BNB, ADA, SOL, DOT, LINK, MATIC, AVAX, FTM, ONE, NEAR, ATOM"
      };
    }
    const asset = assetMatch[1].toUpperCase();

    // Parse price condition
    const priceMatch = cleanText.match(/(above|below|over|under|greater than|less than|>|<)\s*\$?(\d+(?:,\d{3})*(?:\.\d+)?)\s*k?/i);
    if (!priceMatch) {
      return {
        success: false,
        error: "Could not parse price condition. Use format like 'above $70k' or 'below 3500'"
      };
    }
    
    const direction = priceMatch[1].toLowerCase();
    let price = parseFloat(priceMatch[2].replace(/,/g, ''));
    
    // Handle 'k' suffix
    if (cleanText.includes('k') || cleanText.includes('K')) {
      price *= 1000;
    }
    
    const isAbove = ['above', 'over', 'greater than', '>'].includes(direction);
    const prediction = isAbove ? 'YES' : 'NO';
    const condition = `${isAbove ? 'above' : 'below'} $${price.toLocaleString()}`;

    // Parse deadline
    let deadline = 'end of day';
    const timeMatch = cleanText.match(/by\s+(today|tomorrow|friday|saturday|sunday|monday|tuesday|wednesday|thursday|weekend|end of (?:day|week|month))/i);
    if (timeMatch) {
      deadline = timeMatch[1].toLowerCase();
    }

    // Mock confidence scoring based on clarity
    const confidence = 0.85 + Math.random() * 0.1; // 85-95%

    return {
      success: true,
      confidence: confidence.toFixed(2),
      data: {
        asset,
        condition,
        prediction,
        amount,
        deadline,
        originalText: text
      }
    };

  } catch (error) {
    console.error('NLP parsing error:', error);
    return {
      success: false,
      error: "Failed to parse your bet. Please try a clearer format like 'bet 100 USDT on BTC above 70k by Friday'"
    };
  }
}

// Mock Qwen AI response for general questions
async function generateAIResponse(question) {
  // Simple keyword-based responses (in real implementation, this would call Qwen API)
  const responses = {
    'how': 'To place a bet, simply type something like "bet 100 USDT on BTC above 70k by Friday" or use /predict for guided betting.',
    'what': 'This is a multichain prediction market bot supporting 12+ blockchains with AI-powered natural language betting.',
    'when': 'Markets resolve automatically based on oracle data. Payouts happen within 1 hour of resolution.',
    'where': 'Your funds are secured on-chain across multiple blockchains including Flare, Ethereum, Polygon, and more.',
    'why': 'Decentralized prediction markets provide fair, transparent betting with oracle-verified outcomes and automatic payouts.',
    'price': 'I can help you make price predictions! Try: "bet 50 USDT on ETH above 3500 today"',
    'oracle': 'We use Flare FTSO oracles on Flare network and Chainlink on other chains for accurate, tamper-proof price data.',
    'wallet': 'Connect via WalletConnect v2. Supports MetaMask, Bifrost, Rabby, and other major wallets.',
    'chain': 'Supported: Flare, Ethereum, Polygon, Arbitrum, Optimism, Base, BSC, Avalanche, Fantom, zkSync, Scroll, Linea.',
    'gas': 'Most transactions are gasless using meta-transactions for seamless user experience.',
    'minimum': 'Minimum bet is 10 USDT, maximum is 10,000 USDT per bet.',
    'referral': 'Use /invite to get your referral link. Earn 5% of friends\' winnings forever!',
    'admin': 'Only @maxinayas can create and manage markets. Users can suggest markets via feedback.'
  };

  const lowerQuestion = question.toLowerCase();
  const matchedKey = Object.keys(responses).find(key => lowerQuestion.includes(key));
  
  if (matchedKey) {
    return responses[matchedKey];
  }

  return "I'm an AI assistant for multichain prediction markets. Ask me about betting, supported chains, or use /help for commands!";
}

module.exports = {
  parseNaturalLanguageBet,
  generateAIResponse
};
