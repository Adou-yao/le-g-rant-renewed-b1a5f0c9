import { cn } from "@/lib/utils";
import { MessageCircle, Phone, User, Calendar, Trash2 } from "lucide-react";
import { Button } from "./button";

interface DebtCardProps {
  nomClient: string;
  telephone: string;
  montant: number;
  dateAjout: string;
  boutiqueName?: string;
  onWhatsAppRelance: () => void;
  onDelete?: () => void;
  className?: string;
  delay?: number;
}

export function DebtCard({ nomClient, telephone, montant, dateAjout, boutiqueName = "Ma Boutique", onWhatsAppRelance, onDelete, className, delay = 0 }: DebtCardProps) {
  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("fr-CI", { day: "numeric", month: "short", year: "numeric" }).format(new Date(date));
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Bonjour ${nomClient}, c'est la boutique ${boutiqueName}. Je vous contacte pour le rappel de votre crédit de ${new Intl.NumberFormat("fr-CI").format(montant)} FCFA. On est ensemble !`
    );
    const cleanPhone = telephone.replace(/\s/g, "").replace(/^\+/, "");
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
    onWhatsAppRelance();
  };

  return (
    <div
      className={cn(
        "group rounded-2xl p-4 glass-strong transition-all duration-300 animate-slide-up hover:shadow-lg hover:translate-y-[-2px]",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl gradient-hero flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105">
          <User className="h-6 w-6 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <h3 className="font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                {nomClient}
              </h3>
              {telephone && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Phone className="h-3.5 w-3.5" />
                  {telephone}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground glass px-2 py-1 rounded-full">
              <Calendar className="h-3 w-3" />
              {formatDate(dateAjout)}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-display text-destructive currency-display">
                {new Intl.NumberFormat("fr-CI").format(montant)}
              </span>
              <span className="text-sm font-medium text-destructive/70">F</span>
            </div>

            <div className="flex items-center gap-2">
              {onDelete && (
                <Button onClick={onDelete} size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              {telephone && (
                <Button onClick={handleWhatsAppClick} size="sm" className="gradient-success text-white gap-1.5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 rounded-xl">
                  <MessageCircle className="h-3.5 w-3.5" />
                  Relancer
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
