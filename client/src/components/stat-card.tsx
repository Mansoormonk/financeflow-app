import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  iconColor?: string;
}

export function StatCard({ title, value, icon: Icon, trend, iconColor = "text-primary" }: StatCardProps) {
  const isPositiveTrend = trend && trend.value > 0;
  const isNegativeTrend = trend && trend.value < 0;

  return (
    <Card className="p-6 hover-elevate">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          <h3 className="text-3xl font-semibold mb-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {value}
          </h3>
          {trend && (
            <div className="flex items-center gap-1 text-xs">
              {isPositiveTrend && <TrendingUp className="w-3 h-3 text-green-600" />}
              {isNegativeTrend && <TrendingDown className="w-3 h-3 text-red-600" />}
              <span className={cn(
                "font-medium",
                isPositiveTrend && "text-green-600",
                isNegativeTrend && "text-red-600",
                !isPositiveTrend && !isNegativeTrend && "text-muted-foreground"
              )}>
                {trend.value > 0 && "+"}{trend.value}%
              </span>
              <span className="text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-lg bg-primary/10", iconColor)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}
