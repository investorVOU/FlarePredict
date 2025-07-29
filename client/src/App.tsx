import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Bot, BarChart3, Zap } from "lucide-react";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import Demo from "@/pages/demo";

function Navigation() {
  const [location] = useLocation();
  
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <h1 className="text-xl font-bold flex items-center gap-2 cursor-pointer">
                <Bot className="h-6 w-6" />
                MultiChain Prediction Bot
              </h1>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link href="/">
              <Button variant={location === "/" ? "default" : "ghost"} size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant={location === "/demo" ? "default" : "ghost"} size="sm">
                <Zap className="h-4 w-4 mr-2" />
                Bot Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/demo" component={Demo} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Navigation />
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
