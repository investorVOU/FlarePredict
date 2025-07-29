import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface BotStatusProps {
  status: any;
  loading: boolean;
}

export function BotStatus({ status, loading }: BotStatusProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 animate-pulse" />
            Bot Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isOnline = status?.status === "active";
  const uptime = status?.uptime || 0;
  const uptimeHours = Math.floor(uptime / 3600);
  const uptimeMinutes = Math.floor((uptime % 3600) / 60);

  return (
    <Card className={`border-l-4 ${isOnline ? 'border-green-500' : 'border-red-500'}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            Telegram Bot Status
          </div>
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? "🟢 Online" : "🔴 Offline"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Uptime</div>
              <div className="text-xs text-muted-foreground">
                {uptimeHours}h {uptimeMinutes}m
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Active Markets</div>
              <div className="text-xs text-muted-foreground">
                {status?.markets || 0} markets
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Connected Users</div>
              <div className="text-xs text-muted-foreground">
                {status?.users || 0} users
              </div>
            </div>
          </div>
        </div>

        {isOnline && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-sm text-green-800 dark:text-green-200">
              ✅ Bot is running smoothly and accepting predictions
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              Try: "bet 100 USDT on BTC above 70k by Friday" in Telegram
            </div>
          </div>
        )}

        {!isOnline && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-sm text-red-800 dark:text-red-200">
              ❌ Bot is currently offline or experiencing issues
            </div>
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">
              Please try again later or contact support
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
