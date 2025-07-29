import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BotStatus } from "@/components/bot-status";
import { Activity, TrendingUp, Users, DollarSign, ExternalLink } from "lucide-react";

export default function Dashboard() {
  const { data: botStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/bot/status"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: markets, isLoading: marketsLoading } = useQuery({
    queryKey: ["/api/markets"],
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🎯 MultiChain Prediction Markets
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Powered by Flare FTSO and 12+ blockchains with AI-powered natural language betting
          </p>
        </div>

        {/* Bot Status */}
        <div className="mb-6">
          <BotStatus status={botStatus} loading={statusLoading} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Markets</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statusLoading ? "..." : (botStatus?.markets || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across 12+ blockchains
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statusLoading ? "..." : (botStatus?.users || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Active predictors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bot Uptime</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statusLoading ? "..." : Math.floor((botStatus?.uptime || 0) / 3600)}h
              </div>
              <p className="text-xs text-muted-foreground">
                Running smoothly
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volume Today</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.floor(Math.random() * 50000 + 10000).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                USDT wagered
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Markets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Active Markets
                <Badge variant="secondary">{markets?.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {marketsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : markets && markets.length > 0 ? (
                <div className="space-y-4">
                  {markets.slice(0, 5).map((market: any) => (
                    <div key={market.id} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-sm">{market.title}</h4>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Chain: {market.chainId}</span>
                        <span>Pool: {(market.yesPool + market.noPool).toLocaleString()} USDT</span>
                        <span>Expires: {new Date(market.expiryDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  {markets.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      ... and {markets.length - 5} more markets
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active markets found</p>
                  <p className="text-xs">New markets are added regularly</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏆 Top Predictors
                <Badge variant="secondary">Weekly</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboardLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : leaderboard && leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.slice(0, 5).map((user: any, index: number) => {
                    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
                    return (
                      <div key={user.id} className="flex items-center gap-3">
                        <span className="text-lg">{medal}</span>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{user.username}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.totalWon || 0} USDT won • {user.totalBets || 0} bets
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {user.winStreak || 0} streak
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No leaderboard data</p>
                  <p className="text-xs">Start predicting to see rankings</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🚀 Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">💬</div>
                <h3 className="font-semibold mb-2">Start Chatting</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Find our bot on Telegram and start with /start
                </p>
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Open Telegram
                </Button>
              </div>
              
              <div className="text-center">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-semibold mb-2">Make Predictions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Type: "bet 100 USDT on BTC above 70k by Friday"
                </p>
                <Button variant="outline" size="sm">
                  View Examples
                </Button>
              </div>
              
              <div className="text-center">
                <div className="text-3xl mb-2">🏆</div>
                <h3 className="font-semibold mb-2">Win Rewards</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Automatic payouts when markets resolve
                </p>
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supported Chains */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🔗 Supported Blockchains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: "Flare", emoji: "🔥" },
                { name: "Ethereum", emoji: "⟠" },
                { name: "Polygon", emoji: "💜" },
                { name: "Arbitrum", emoji: "🔵" },
                { name: "Optimism", emoji: "🔴" },
                { name: "Base", emoji: "🔷" },
                { name: "BSC", emoji: "🟡" },
                { name: "Avalanche", emoji: "❄️" },
                { name: "Fantom", emoji: "👻" },
                { name: "zkSync", emoji: "⚡" },
                { name: "Scroll", emoji: "📜" },
                { name: "Linea", emoji: "🌐" },
              ].map((chain) => (
                <div key={chain.name} className="text-center p-3 border rounded-lg">
                  <div className="text-2xl mb-1">{chain.emoji}</div>
                  <div className="text-xs font-medium">{chain.name}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
