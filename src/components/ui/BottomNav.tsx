import { Home, ShoppingCart, Package, BookOpen, Wallet, LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Accueil", path: "/" },
  { icon: ShoppingCart, label: "Vendre", path: "/ventes" },
  { icon: Package, label: "Articles", path: "/articles" },
  { icon: Wallet, label: "Dépenses", path: "/depenses" },
  { icon: BookOpen, label: "Dettes", path: "/dettes" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border/50" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-success/50 to-transparent" />

      <div className="relative flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 touch-target group",
                isActive
                  ? "text-success"
                  : "text-muted-foreground hover:text-foreground active:scale-95"
              )}
            >
              {isActive && (
                <span className="absolute inset-0 bg-gradient-to-t from-success/15 to-success/5 rounded-2xl border border-success/20" />
              )}

              <div className={cn(
                "relative z-10 transition-all duration-300",
                isActive && "-translate-y-0.5"
              )}>
                <Icon
                  className={cn(
                    "h-6 w-6 transition-all duration-300",
                    isActive && "drop-shadow-[0_0_12px_hsl(var(--success)/0.6)]",
                    !isActive && "group-hover:scale-110"
                  )}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-success" />
                )}
              </div>

              <span
                className={cn(
                  "relative z-10 text-[10px] font-medium leading-none transition-all duration-300",
                  isActive && "font-bold text-success"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
