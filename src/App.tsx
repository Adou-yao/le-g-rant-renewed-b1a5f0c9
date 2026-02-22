import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
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
          <Route path="/" element={<ProtectedRoute><div className="min-h-screen bg-background pb-20"><Index /><BottomNav /></div></ProtectedRoute>} />
          <Route path="/ventes" element={<ProtectedRoute><div className="min-h-screen bg-background pb-20"><Ventes /><BottomNav /></div></ProtectedRoute>} />
          <Route path="/articles" element={<ProtectedRoute><div className="min-h-screen bg-background pb-20"><Articles /><BottomNav /></div></ProtectedRoute>} />
          <Route path="/dettes" element={<ProtectedRoute><div className="min-h-screen bg-background pb-20"><Dettes /><BottomNav /></div></ProtectedRoute>} />
          <Route path="/depenses" element={<ProtectedRoute><div className="min-h-screen bg-background pb-20"><Depenses /><BottomNav /></div></ProtectedRoute>} />
          <Route path="/stats" element={<ProtectedRoute><div className="min-h-screen bg-background pb-20"><Stats /><BottomNav /></div></ProtectedRoute>} />
          <Route path="/abonnement" element={<ProtectedRoute><Abonnement /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
