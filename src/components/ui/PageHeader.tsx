import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <header className={cn("px-5 pt-8 pb-6 safe-top", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-strong mb-1">
            <div className="w-1.5 h-1.5 rounded-full gradient-primary animate-pulse" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Le Gérant</span>
          </div>

          <h1 className="text-2xl font-display text-gradient tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground font-medium" style={{ animationDelay: '100ms' }}>
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0 animate-scale-in" style={{ animationDelay: '150ms' }}>
            {action}
          </div>
        )}
      </div>
    </header>
  );
}
