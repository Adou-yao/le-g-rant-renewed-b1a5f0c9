import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Store, Mail, Lock, User, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Email invalide");
const passwordSchema = z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères");

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signUp, resetPassword, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  const validateForm = (): boolean => {
    try { emailSchema.parse(email); } catch { toast.error("Veuillez entrer un email valide"); return false; }
    try { passwordSchema.parse(password); } catch { toast.error("Le mot de passe doit contenir au moins 6 caractères"); return false; }
    if (!isLogin && !storeName.trim()) { toast.error("Veuillez entrer le nom de votre boutique"); return false; }
    return true;
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try { emailSchema.parse(email); } catch { toast.error("Veuillez entrer un email valide"); return; }
    setIsSubmitting(true);
    try {
      const { error } = await resetPassword(email);
      if (error) toast.error(error.message);
      else { toast.success("Un lien de réinitialisation a été envoyé à votre email"); setIsForgotPassword(false); }
    } finally { setIsSubmitting(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) toast.error(error.message.includes("Invalid login credentials") ? "Email ou mot de passe incorrect" : error.message);
        else toast.success("Connexion réussie !");
      } else {
        const { error } = await signUp(email, password, storeName);
        if (error) toast.error(error.message.includes("already registered") ? "Cet email est déjà utilisé" : error.message);
        else { toast.success("Un code de vérification a été envoyé à votre email"); navigate("/verify", { state: { email } }); }
      }
    } finally { setIsSubmitting(false); }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center gradient-mesh"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col gradient-mesh relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-20 -left-20 w-60 h-60 rounded-full bg-primary/15 blur-3xl animate-float" />
      <div className="absolute top-40 -right-20 w-48 h-48 rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-20 left-1/2 w-72 h-72 rounded-full bg-warning/8 blur-3xl animate-float" style={{ animationDelay: '4s' }} />

      <div className="relative pt-20 pb-10 px-6 text-center animate-slide-up">
        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-3xl gradient-hero opacity-30 blur-2xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl gradient-hero shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-500 premium-border">
            <Store className="w-12 h-12 text-white drop-shadow-lg" />
          </div>
        </div>
        <h1 className="text-4xl font-display text-gradient tracking-tight mb-3">
          Le Gérant
        </h1>
        <p className="text-muted-foreground text-lg max-w-xs mx-auto leading-relaxed">
          Votre assistant intelligent pour gérer votre boutique avec succès ✨
        </p>
      </div>

      <div className="relative flex-1 px-5 pb-8">
        <div className="glass-strong rounded-3xl p-6 animate-slide-up" style={{ animationDelay: '150ms' }}>
          {isForgotPassword ? (
            <>
              <button type="button" onClick={() => setIsForgotPassword(false)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                <ArrowLeft className="h-4 w-4" />Retour
              </button>
              <h2 className="text-xl font-bold text-foreground mb-2">Mot de passe oublié</h2>
              <p className="text-sm text-muted-foreground mb-6">Entrez votre email pour recevoir un lien de réinitialisation</p>
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-12 h-14 rounded-2xl border-border/50 bg-background/50 focus:bg-background transition-all focus:shadow-lg focus:shadow-primary/10" />
                  </div>
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl font-semibold text-lg gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] glow-primary">
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Envoyer le lien<ArrowRight className="ml-2 h-5 w-5" /></>}
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="flex gap-1.5 p-1.5 bg-muted/60 rounded-2xl mb-6">
                <button type="button" onClick={() => setIsLogin(true)} className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${isLogin ? "gradient-primary text-white shadow-lg glow-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  Connexion
                </button>
                <button type="button" onClick={() => setIsLogin(false)} className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${!isLogin ? "gradient-primary text-white shadow-lg glow-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  Inscription
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div className="space-y-2 animate-fade-in">
                    <Label htmlFor="storeName" className="text-sm font-medium">Nom de la boutique</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input id="storeName" type="text" placeholder="Ma Boutique" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="pl-12 h-14 rounded-2xl border-border/50 bg-background/50 focus:bg-background transition-all focus:shadow-lg focus:shadow-primary/10" />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-12 h-14 rounded-2xl border-border/50 bg-background/50 focus:bg-background transition-all focus:shadow-lg focus:shadow-primary/10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
                    {isLogin && <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs text-primary font-medium hover:underline">Mot de passe oublié ?</button>}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-12 h-14 rounded-2xl border-border/50 bg-background/50 focus:bg-background transition-all focus:shadow-lg focus:shadow-primary/10" />
                  </div>
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl font-semibold text-lg gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] glow-primary">
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>{isLogin ? "Se connecter" : "Créer mon compte"}<ArrowRight className="ml-2 h-5 w-5" /></>}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-6">
                {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
                <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary font-semibold hover:underline">
                  {isLogin ? "S'inscrire" : "Se connecter"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
