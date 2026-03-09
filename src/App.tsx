import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";
import { GerantOnlyRoute } from "@/components/GerantOnlyRoute";
import Index from "./pages/Index";
import Ventes from "./pages/Ventes";
import Articles from "./pages/Articles";
import Dettes from "./pages/Dettes";
import Depenses from "./pages/Depenses";
import Stats from "./pages/Stats";
import Auth from "./pages/Auth";
import Abonnement from "./pages/Abonnement";
import DashboardProprietaire from "./pages/DashboardProprietaire";
import DashboardSuperviseur from "./pages/DashboardSuperviseur";
import FaireInventaire from "./pages/FaireInventaire";
import ChangementObligatoire from "./pages/ChangementObligatoire";
import NotFound from "./pages/NotFound";
import VerifyEmail from "./pages/VerifyEmail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/verify" element={<VerifyEmail />} />
          {/* Operational pages - gérant only */}
          <Route path="/" element={<GerantOnlyRoute><AppLayout><Index /></AppLayout></GerantOnlyRoute>} />
          <Route path="/ventes" element={<GerantOnlyRoute><AppLayout><Ventes /></AppLayout></GerantOnlyRoute>} />
          <Route path="/articles" element={<GerantOnlyRoute><AppLayout><Articles /></AppLayout></GerantOnlyRoute>} />
          <Route path="/dettes" element={<GerantOnlyRoute><AppLayout><Dettes /></AppLayout></GerantOnlyRoute>} />
          <Route path="/depenses" element={<GerantOnlyRoute><AppLayout><Depenses /></AppLayout></GerantOnlyRoute>} />
          <Route path="/stats" element={<RoleProtectedRoute allowedRoles={["proprietaire"]}><AppLayout><Stats /></AppLayout></RoleProtectedRoute>} />
          <Route path="/faire-inventaire" element={<GerantOnlyRoute><AppLayout><FaireInventaire /></AppLayout></GerantOnlyRoute>} />
          {/* Proprietaire only */}
          <Route path="/abonnement" element={<RoleProtectedRoute allowedRoles={["proprietaire"]}><AppLayout><Abonnement /></AppLayout></RoleProtectedRoute>} />
          <Route path="/dashboard-proprietaire" element={<RoleProtectedRoute allowedRoles={["proprietaire"]}><AppLayout><DashboardProprietaire /></AppLayout></RoleProtectedRoute>} />
          <Route path="/dashboard-superviseur" element={<RoleProtectedRoute allowedRoles={["proprietaire"]}><AppLayout><DashboardSuperviseur /></AppLayout></RoleProtectedRoute>} />
          <Route path="/changement-obligatoire" element={<ProtectedRoute><ChangementObligatoire /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
