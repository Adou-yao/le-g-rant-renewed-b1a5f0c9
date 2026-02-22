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
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom px-3 pb-2">
      <div className="relative glass-strong rounded-2xl overflow-hidden">
        {/* Top accent line */}
        <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="relative flex items-center justify-around px-1 py-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 touch-target group",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground active:scale-95"
                )}
              >
                {isActive && (
                  <span className="absolute inset-0 bg-primary/8 rounded-xl" />
                )}

                <div className={cn(
                  "relative z-10 transition-all duration-300",
                  isActive && "-translate-y-0.5"
                )}>
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-all duration-300",
                      isActive && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]",
                      !isActive && "group-hover:scale-110"
                    )}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                </div>

                <span
                  className={cn(
                    "relative z-10 text-[10px] font-medium leading-none transition-all duration-300",
                    isActive && "font-bold text-primary"
                  )}
                >
                  {item.label}
                </span>

                {isActive && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full gradient-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
