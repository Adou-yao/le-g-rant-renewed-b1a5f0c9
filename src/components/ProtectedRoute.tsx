import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [mustChange, setMustChange] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    if (!user) {
      setCheckingProfile(false);
      return;
    }
    const check = async () => {
      const { data } = await supabase
        .from("profiles" as any)
        .select("must_change_password")
        .eq("user_id", user.id)
        .maybeSingle();
      setMustChange((data as any)?.must_change_password ?? false);
      setCheckingProfile(false);
    };
    check();
  }, [user]);

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to forced password change if needed
  if (mustChange && location.pathname !== "/changement-obligatoire") {
    return <Navigate to="/changement-obligatoire" replace />;
  }

  return <>{children}</>;
}
