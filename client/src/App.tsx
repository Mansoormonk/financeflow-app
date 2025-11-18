import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { BottomNav } from "@/components/bottom-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import Dashboard from "@/pages/dashboard";
import Income from "@/pages/income";
import Expenses from "@/pages/expenses";
import Debts from "@/pages/debts";
import Reports from "@/pages/reports";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/income" component={Income} />
      <Route path="/expenses" component={Expenses} />
      <Route path="/debts" component={Debts} />
      <Route path="/reports" component={Reports} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <div className="min-h-screen bg-background pb-16">
            <header className="sticky top-0 z-40 bg-card border-b border-card-border">
              <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold">FinanceFlow</h1>
                  <p className="text-xs text-muted-foreground">Personal Finance Manager</p>
                </div>
                <ThemeToggle />
              </div>
            </header>
            <main className="container mx-auto px-4 py-6 max-w-3xl">
              <Router />
            </main>
            <BottomNav />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
