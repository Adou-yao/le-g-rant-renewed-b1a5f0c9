import { ReactNode, useState } from "react";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import logo from "@/assets/logo.jpg";
import { cn } from "@/lib/utils";

function LogoTrigger() {
  const { toggleSidebar } = useSidebar();
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    toggleSidebar();
    setTimeout(() => setClicked(false), 400);
  };

  return (
    <button
      onClick={handleClick}
      className="ml-3 flex items-center justify-center rounded-xl overflow-hidden shadow-lg shadow-primary/25 transition-transform duration-300 ease-out active:scale-90 focus:outline-none focus:ring-2 focus:ring-ring"
      aria-label="Toggle sidebar"
    >
      <img
        src={logo}
        alt="Le Gérant"
        className={cn(
          "h-9 w-9 object-cover transition-transform duration-300 ease-out",
          clicked && "rotate-[360deg] scale-110"
        )}
      />
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
