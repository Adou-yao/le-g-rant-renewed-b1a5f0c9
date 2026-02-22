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
        "group w-full text-left rounded-2xl p-4 bg-card transition-all duration-300 animate-fade-in-up",
        "card-shadow-lg hover:card-shadow-xl active:scale-[0.98] focus:outline-none hover:translate-y-[-2px]",
        selected && "ring-2 ring-success bg-success/5 glow-success",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0 relative">
          {image ? (
            <div className="relative overflow-hidden rounded-xl">
              <img src={image} alt={name} className="w-16 h-16 object-cover transition-transform duration-300 group-hover:scale-110" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-muted to-background flex items-center justify-center transition-all duration-300 group-hover:from-primary/10 group-hover:to-success/10">
              <Package className="h-7 w-7 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
            </div>
          )}
          {isLowStock && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center animate-pulse">
              <AlertTriangle className="h-3 w-3 text-destructive-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-300">
            {name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-bold font-display text-primary currency-display">
              {new Intl.NumberFormat("fr-CI").format(prixVente)} F
            </span>
            {showProfit && profit > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-success bg-success/10 px-2 py-1 rounded-full">
                <TrendingUp className="h-3 w-3" />
                +{new Intl.NumberFormat("fr-CI").format(profit)} F
                <span className="text-success/70">({profitMargin}%)</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 rounded-full flex-1 max-w-20 bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isLowStock ? "bg-destructive" : stock < 10 ? "bg-warning" : "bg-success"
                )}
                style={{ width: `${Math.min(stock * 10, 100)}%` }}
              />
            </div>
            <span className={cn("text-sm font-semibold", isLowStock ? "text-destructive" : "text-muted-foreground")}>
              {stock} en stock
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
