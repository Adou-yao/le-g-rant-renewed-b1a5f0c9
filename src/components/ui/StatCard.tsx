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
        "rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] animate-slide-up relative overflow-hidden",
        variant === "default" && "glass-strong card-shadow-lg",
        variant === "success" && "gradient-success text-white glow-success",
        variant === "primary" && "gradient-primary text-white glow-primary",
        variant === "destructive" && "bg-gradient-to-br from-destructive to-destructive/80 text-white",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {variant !== "default" && (
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-xl" />
      )}
      <div className="relative flex items-start justify-between gap-2">
        <div className="space-y-2 flex-1 min-w-0">
          <p className={cn(
            "text-[10px] font-bold uppercase tracking-widest",
            variant === "default" ? "text-muted-foreground" : "opacity-75"
          )}>
            {label}
          </p>
          <p className="text-2xl font-display currency-display truncate">
            {typeof value === "number" ? new Intl.NumberFormat("fr-CI").format(value) : value}
          </p>
          {trend && (
            <div className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full",
              variant === "default" && trend.isPositive && "bg-accent/10 text-accent",
              variant === "default" && !trend.isPositive && "bg-destructive/10 text-destructive",
              variant !== "default" && "bg-white/20"
            )}>
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "p-2.5 rounded-xl transition-transform duration-300",
            variant === "default" ? "bg-muted/60" : "bg-white/15 backdrop-blur-sm"
          )}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
