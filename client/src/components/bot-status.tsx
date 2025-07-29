import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle, XCircle } from "lucide-react";

interface BotStatusProps {
  status?: {
    status: string;
    uptime: number;
    markets: number;
    users: number;
    mode?: string;
    telegram?: {
      connected: boolean;
      mode: string;
    };
  };
  loading: boolean;
}

export function BotStatus({ status, loading }: BotStatusProps) {
  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const isActive = status?.status === "active";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Telegram Bot Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {loading ? (
              <Badge variant="secondary">Loading...</Badge>
            ) : (
              <>
                <Badge variant={isActive ? "default" : "destructive"}>
                  {isActive ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {status?.status?.toUpperCase() || "UNKNOWN"}
                </Badge>
                {status?.mode && (
                  <Badge variant="outline">
                    {status.mode === "mock" ? "Mock Mode" : "Live Mode"}
                  </Badge>
                )}
              </>
            )}
          </div>
          
          {status && (
            <div className="text-right text-sm text-muted-foreground">
              <div>Uptime: {formatUptime(status.uptime)}</div>
              <div>{status.markets} markets, {status.users} users</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}