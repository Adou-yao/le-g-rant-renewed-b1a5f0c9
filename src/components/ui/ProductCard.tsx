import { cn } from "@/lib/utils";
import { Package, AlertTriangle, TrendingUp } from "lucide-react";

interface ProductCardProps {
  name: string;
  prixAchat: number;
  prixVente: number;
  stock: number;
  image?: string;
  onSelect?: () => void;
  selected?: boolean;
  showProfit?: boolean;
  className?: string;
  delay?: number;
}

export function ProductCard({ name, prixAchat, prixVente, stock, image, onSelect, selected, showProfit = false, className, delay = 0 }: ProductCardProps) {
  const profit = prixVente - prixAchat;
  const profitMargin = prixAchat > 0 ? ((profit / prixAchat) * 100).toFixed(0) : 0;
  const isLowStock = stock < 5;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "group w-full text-left rounded-2xl p-4 transition-all duration-300 animate-slide-up",
        "glass-strong hover:shadow-lg active:scale-[0.98] focus:outline-none hover:translate-y-[-2px]",
        selected && "ring-2 ring-primary bg-primary/5 glow-primary",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0 relative">
          {image ? (
            <div className="relative overflow-hidden rounded-xl">
              <img src={image} alt={name} className="w-14 h-14 object-cover transition-transform duration-300 group-hover:scale-110" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/5 flex items-center justify-center transition-all duration-300 group-hover:from-primary/20 group-hover:to-accent/10">
              <Package className="h-6 w-6 text-primary/60 transition-colors duration-300 group-hover:text-primary" />
            </div>
          )}
          {isLowStock && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center animate-pulse shadow-sm">
              <AlertTriangle className="h-3 w-3 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-300">
            {name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-display text-primary currency-display">
              {new Intl.NumberFormat("fr-CI").format(prixVente)} F
            </span>
            {showProfit && profit > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                <TrendingUp className="h-2.5 w-2.5" />
                +{profitMargin}%
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 rounded-full flex-1 max-w-16 bg-muted/60 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isLowStock ? "bg-destructive" : stock < 10 ? "bg-warning" : "bg-accent"
                )}
                style={{ width: `${Math.min(stock * 10, 100)}%` }}
              />
            </div>
            <span className={cn("text-xs font-medium", isLowStock ? "text-destructive" : "text-muted-foreground")}>
              {stock}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
