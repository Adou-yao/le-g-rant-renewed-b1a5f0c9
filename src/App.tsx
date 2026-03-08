import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Ventes from "./pages/Ventes";
import Articles from "./pages/Articles";
import Dettes from "./pages/Dettes";
import Depenses from "./pages/Depenses";
import Stats from "./pages/Stats";
import Auth from "./pages/Auth";
import Abonnement from "./pages/Abonnement";
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
          <Route path="/" element={<ProtectedRoute><AppLayout><Index /></AppLayout></ProtectedRoute>} />
          <Route path="/ventes" element={<ProtectedRoute><AppLayout><Ventes /></AppLayout></ProtectedRoute>} />
          <Route path="/articles" element={<ProtectedRoute><AppLayout><Articles /></AppLayout></ProtectedRoute>} />
          <Route path="/dettes" element={<ProtectedRoute><AppLayout><Dettes /></AppLayout></ProtectedRoute>} />
          <Route path="/depenses" element={<ProtectedRoute><AppLayout><Depenses /></AppLayout></ProtectedRoute>} />
          <Route path="/stats" element={<ProtectedRoute><AppLayout><Stats /></AppLayout></ProtectedRoute>} />
          <Route path="/abonnement" element={<ProtectedRoute><AppLayout><Abonnement /></AppLayout></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
