import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Zap, TrendingUp, Users, Trophy, Link2 } from 'lucide-react';

export default function DemoPage() {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      type: 'bot',
      content: '🎯 Welcome to MultiChain Prediction Markets!\n\nPowered by Flare FTSO and 12+ blockchains with AI-powered natural language betting.\n\nReady to start predicting? 🚀'
    }
  ]);

  const mockResponses = {
    '/start': '🎯 Welcome to MultiChain Prediction Markets!\n\nType a natural language bet like:\n"bet 100 USDT on BTC above 70k by Friday"',
    '/listmarkets': '📊 Active Prediction Markets\n\n1. BTC > $70,000 by End of January 2025\n   Chain: flare\n   Pool: 24,380 USDT\n\n2. ETH > $3,500 Today\n   Chain: ethereum\n   Pool: 21,090 USDT\n\n3. MATIC > $2.00 by February\n   Chain: polygon\n   Pool: 9,900 USDT',
    '/mybets': '📱 Your Betting Portfolio\n\n• BTC > $70,000 by End of January 2025\n  Amount: 100 USDT\n  Prediction: YES\n  Chain: flare\n  Status: Active 🟢\n\n📊 Summary:\nTotal Bet: 100 USDT\nActive Bets: 1\nWin Rate: 65%',
    '/leaderboard': '🏆 Weekly Leaderboard\n\n🥇 oracle_whisperer\n   Wins: 3420 USDT | Bets: 25 | Rate: 68.5%\n\n🥈 crypto_trader_01\n   Wins: 1580 USDT | Bets: 12 | Rate: 62.3%\n\n🥉 prediction_master\n   Wins: 890 USDT | Bets: 8 | Rate: 58.1%',
    'bet': '🎯 Parsed Bet:\nAsset: BTC\nCondition: above $70,000\nPrediction: YES\nAmount: 100 USDT\nDeadline: end of day\n\nSelect blockchain:'
  };

  const sampleBets = [
    'bet 100 USDT on BTC above 70k by Friday',
    'bet 50 USDT on ETH below 3500 by today',
    'bet 200 USDT on MATIC above $2 by February',
    'bet 75 USDT on SOL over 150 dollars by weekend'
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;

    setChatMessages(prev => [...prev, { type: 'user', content: message }]);

    // Simulate bot response
    setTimeout(() => {
      let response = '';
      
      if (message.startsWith('/')) {
        response = mockResponses[message as keyof typeof mockResponses] || 'Command not recognized. Type /start for help.';
      } else if (message.toLowerCase().includes('bet')) {
        response = mockResponses.bet;
        // Simulate chain selection after 2 seconds
        setTimeout(() => {
          setChatMessages(prev => [...prev, {
            type: 'bot',
            content: '🔗 Flare Blockchain Selected\n\n🎯 Bet: BTC above $70,000\n💰 Amount: 100 USDT\n📈 Prediction: YES\n⏰ Deadline: end of day\n💎 Potential Payout: 165 USDT\n\nConnect your wallet to confirm?'
          }]);
        }, 2000);
      } else {
        response = 'Try typing a command like /listmarkets or a natural language bet like "bet 100 USDT on BTC above 70k"';
      }

      setChatMessages(prev => [...prev, { type: 'bot', content: response }]);
    }, 1000);

    setMessage('');
  };

  const handleSampleBet = (bet: string) => {
    setMessage(bet);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Telegram Bot Demo</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Experience the MultiChain Prediction Markets bot with AI-powered natural language betting
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-semibold">Natural Language</h3>
              <p className="text-sm text-muted-foreground">Chat naturally with AI</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Link2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-semibold">12+ Blockchains</h3>
              <p className="text-sm text-muted-foreground">Multi-chain support</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <h3 className="font-semibold">FTSO Oracles</h3>
              <p className="text-sm text-muted-foreground">Flare & Chainlink data</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <h3 className="font-semibold">Gamification</h3>
              <p className="text-sm text-muted-foreground">Leaderboards & rewards</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chat Simulator */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Telegram Bot Simulator
            </CardTitle>
            <CardDescription>
              Test the bot with real commands and natural language bets
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg whitespace-pre-line ${
                    msg.type === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white dark:bg-gray-800 border'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Type a message or command..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>Send</Button>
            </div>
          </CardContent>
        </Card>

        {/* Features & Examples */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Commands</CardTitle>
              <CardDescription>Try these commands in the chat</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {['/start', '/listmarkets', '/mybets', '/leaderboard'].map((cmd) => (
                <Button
                  key={cmd}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setMessage(cmd)}
                >
                  {cmd}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sample Natural Language Bets</CardTitle>
              <CardDescription>Click to try these AI-powered betting examples</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {sampleBets.map((bet, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => handleSampleBet(bet)}
                >
                  {bet}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supported Blockchains</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Flare', emoji: '🔥' },
                  { name: 'Ethereum', emoji: '⟠' },
                  { name: 'Polygon', emoji: '💜' },
                  { name: 'Arbitrum', emoji: '🔵' },
                  { name: 'Optimism', emoji: '🔴' },
                  { name: 'Base', emoji: '🔷' },
                  { name: 'BSC', emoji: '🟡' },
                  { name: 'Avalanche', emoji: '❄️' },
                  { name: 'Fantom', emoji: '👻' },
                  { name: 'zkSync', emoji: '⚡' },
                  { name: 'Scroll', emoji: '📜' },
                  { name: 'Linea', emoji: '🌐' }
                ].map((chain) => (
                  <Badge key={chain.name} variant="secondary" className="justify-center">
                    {chain.emoji} {chain.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">AI-Powered NLP</h4>
                  <p className="text-sm text-muted-foreground">
                    Powered by Qwen AI for understanding natural language bets
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">WalletConnect v2</h4>
                  <p className="text-sm text-muted-foreground">
                    Secure wallet integration for decentralized betting
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Flare FTSO Oracles</h4>
                  <p className="text-sm text-muted-foreground">
                    Real-time price feeds from decentralized oracles
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Ready to deploy your own bot?</h2>
        <p className="text-muted-foreground mb-4">
          Get your Telegram Bot Token, Qwen AI API Key, and WalletConnect Project ID to deploy this fully functional prediction market bot.
        </p>
        <div className="flex gap-4">
          <Button variant="default">View Setup Guide</Button>
          <Button variant="outline">Check GitHub</Button>
        </div>
      </div>
    </div>
  );
}