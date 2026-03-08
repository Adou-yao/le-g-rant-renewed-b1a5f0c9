import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface GerantOnlyRouteProps {
  children: ReactNode;
}

export function GerantOnlyRoute({ children }: GerantOnlyRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isProprietaire, loading: roleLoading } = useUserRole();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (isProprietaire) {
    return <Navigate to="/dashboard-superviseur" replace />;
  }

  return <>{children}</>;
}
