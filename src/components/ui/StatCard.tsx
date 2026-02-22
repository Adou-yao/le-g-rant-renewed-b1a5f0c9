import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  variant?: "default" | "success" | "primary" | "destructive";
  className?: string;
  delay?: number;
}

export function StatCard({ label, value, icon: Icon, trend, variant = "default", className, delay = 0 }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] animate-fade-in-up",
        variant === "default" && "bg-card card-shadow-lg",
        variant === "success" && "gradient-success text-success-foreground glow-success",
        variant === "primary" && "gradient-primary text-primary-foreground glow-primary",
        variant === "destructive" && "bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-2 flex-1 min-w-0">
          <p className={cn(
            "text-xs font-semibold uppercase tracking-wider",
            variant === "default" ? "text-muted-foreground" : "opacity-80"
          )}>
            {label}
          </p>
          <p className="text-2xl font-bold font-display currency-display truncate">
            {typeof value === "number" ? new Intl.NumberFormat("fr-CI").format(value) : value}
          </p>
          {trend && (
            <div className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
              variant === "default" && trend.isPositive && "bg-success/10 text-success",
              variant === "default" && !trend.isPositive && "bg-destructive/10 text-destructive",
              variant !== "default" && "bg-white/20"
            )}>
              <span className="text-sm">{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}% vs hier</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "p-3 rounded-xl transition-transform duration-300",
            variant === "default" ? "bg-gradient-to-br from-muted to-background" : "bg-white/20 backdrop-blur-sm"
          )}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
