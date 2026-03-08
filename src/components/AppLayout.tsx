import { ReactNode, useState } from "react";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { cn } from "@/lib/utils";
import shopIcon from "@/assets/shop-icon.png";

function LogoTrigger() {
  const { toggleSidebar } = useSidebar();
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    toggleSidebar();
    setTimeout(() => setClicked(false), 600);
  };

  return (
    <button
      onClick={handleClick}
      className="ml-3 relative flex items-center justify-center h-11 w-11 rounded-2xl transition-all duration-300 ease-out active:scale-90 hover:scale-105 focus:outline-none group"
      aria-label="Toggle sidebar"
    >
      {/* Spinning ring accent */}
      <span
        className={cn(
          "absolute inset-0 rounded-2xl border-2 border-transparent transition-all duration-500",
          clicked
            ? "border-t-primary/60 border-r-primary/30 animate-spin"
            : "group-hover:border-t-primary/20"
        )}
      />
      {/* Shop icon */}
      <img
        src={shopIcon}
        alt="Le Gérant"
        className={cn(
          "relative h-10 w-10 object-contain transition-all duration-500 ease-out select-none drop-shadow-lg",
          clicked ? "scale-125 rotate-[360deg]" : "group-hover:scale-110"
        )}
      />
      {/* Pulse ring on click */}
      {clicked && (
        <span className="absolute inset-0 rounded-2xl border-2 border-primary/40 animate-ping" />
      )}
    </button>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="sticky top-0 z-40 flex h-12 items-center border-b border-border/50 bg-background/80 backdrop-blur-sm md:hidden">
            <LogoTrigger />
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
