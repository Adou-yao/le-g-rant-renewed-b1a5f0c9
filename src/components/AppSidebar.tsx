import { LayoutDashboard, Receipt, Package, BookOpen, Wallet, LogOut, BarChart3, CreditCard, Network } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.jpg";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";

const gerantNavItems = [
  { icon: LayoutDashboard, label: "Ma Boutique", path: "/" },
  { icon: Receipt, label: "Nouvelle Vente", path: "/ventes" },
  { icon: Package, label: "Stock", path: "/articles" },
  { icon: BookOpen, label: "Dettes", path: "/dettes" },
  { icon: Wallet, label: "Dépenses", path: "/depenses" },
  { icon: BarChart3, label: "Statistiques", path: "/stats" },
];

const proprietaireNavItems = [
  { icon: LayoutDashboard, label: "Supervision", path: "/dashboard-superviseur" },
  { icon: Network, label: "Mon Réseau", path: "/dashboard-proprietaire" },
  { icon: CreditCard, label: "Abonnement", path: "/abonnement" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { isProprietaire } = useUserRole();

  const navItems = isProprietaire
    ? [...baseNavItems, ...proprietaireOnlyItems]
    : baseNavItems;

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className={cn(
          "flex items-center gap-3 transition-all duration-300",
          collapsed && "justify-center"
        )}>
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-lg shadow-primary/25">
            <img src={logo} alt="Le Gérant" className="h-full w-full object-cover" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display text-sm font-bold text-sidebar-foreground">Gestion Professionnelle</span>
              <span className="text-[10px] text-sidebar-foreground/50">Gestion simplifiée</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "group/btn relative transition-all duration-200",
                        isActive && "bg-primary/10 text-primary font-semibold"
                      )}
                    >
                      <NavLink
                        to={item.path}
                        end={item.path === "/"}
                        className="flex items-center gap-3"
                        activeClassName="text-primary"
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
                        )}
                        <item.icon
                          className={cn(
                            "h-4 w-4 transition-all duration-200",
                            isActive
                              ? "text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.4)]"
                              : "text-sidebar-foreground/60 group-hover/btn:text-sidebar-foreground"
                          )}
                          strokeWidth={isActive ? 2.5 : 1.8}
                        />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
            "text-destructive/70 hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.8} />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
