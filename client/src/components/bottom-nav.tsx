import { useCallback } from "react";
import { useLocation } from "wouter";
import { LayoutDashboard, DollarSign, CreditCard, Receipt, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: DollarSign, label: "Income", path: "/income" },
  { icon: Receipt, label: "Expenses", path: "/expenses" },
  { icon: CreditCard, label: "Debts", path: "/debts" },
  { icon: FileText, label: "Reports", path: "/reports" },
];

export function BottomNav() {
  const [location, setLocation] = useLocation();

  const handleNavigate = useCallback((path: string) => {
    // Use wouter's location instead of window.location for SSR compatibility
    const currentParams = new URLSearchParams(location.split('?')[1] || '');
    const range = currentParams.get('range');
    
    if (range && range !== 'all') {
      setLocation(`${path}?range=${range}`);
    } else {
      setLocation(path);
    }
  }, [location, setLocation]);

  const pathWithoutQuery = location.split('?')[0];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-card-border">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathWithoutQuery === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 hover-elevate active-elevate-2 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <Icon className={cn("w-5 h-5", isActive && "fill-current")} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
