import { cn } from "@/lib/utils";
import { Banknote, Smartphone, Check } from "lucide-react";

export type PaymentMode = "espece" | "en_ligne";
export type PaymentOperator = "wave" | "orange" | "mtn" | "moov";

interface PaymentModeSelectorProps {
  selectedMode: PaymentMode;
  onSelectMode: (mode: PaymentMode) => void;
}

interface OperatorSelectorProps {
  selectedOperator: PaymentOperator | null;
  onSelectOperator: (operator: PaymentOperator) => void;
}

const operators: { id: PaymentOperator; label: string; color: string; bgClass: string }[] = [
  { id: "wave", label: "Wave", color: "text-info", bgClass: "bg-info/10 border-info/30 hover:border-info" },
  { id: "orange", label: "Orange Money", color: "text-warning", bgClass: "bg-warning/10 border-warning/30 hover:border-warning" },
  { id: "mtn", label: "MTN MoMo", color: "text-yellow-500", bgClass: "bg-yellow-50 border-yellow-200 hover:border-yellow-500" },
  { id: "moov", label: "Moov Money", color: "text-blue-600", bgClass: "bg-blue-50 border-blue-200 hover:border-blue-600" },
];

export function PaymentModeSelector({ selectedMode, onSelectMode }: PaymentModeSelectorProps) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => onSelectMode("espece")}
        className={cn(
          "flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200",
          "touch-target active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-offset-2",
          selectedMode === "espece"
            ? "bg-success border-success text-success-foreground"
            : "bg-success/10 border-success/30 hover:border-success"
        )}
      >
        <Banknote className={cn("h-8 w-8 transition-colors", selectedMode === "espece" ? "text-current" : "text-success")} />
        <span className="text-sm font-semibold">Espèces</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectMode("en_ligne")}
        className={cn(
          "flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200",
          "touch-target active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-offset-2",
          selectedMode === "en_ligne"
            ? "bg-primary border-primary text-primary-foreground"
            : "bg-primary/10 border-primary/30 hover:border-primary"
        )}
      >
        <Smartphone className={cn("h-8 w-8 transition-colors", selectedMode === "en_ligne" ? "text-current" : "text-primary")} />
        <span className="text-sm font-semibold">Paiement Mobile</span>
      </button>
    </div>
  );
}

export function OperatorSelector({ selectedOperator, onSelectOperator }: OperatorSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 mt-4 animate-fade-in">
      {operators.map((op) => (
        <button
          key={op.id}
          type="button"
          onClick={() => onSelectOperator(op.id)}
          className={cn(
            "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
            "touch-target active:scale-[0.97] focus:outline-none",
            selectedOperator === op.id
              ? "bg-primary border-primary text-primary-foreground"
              : op.bgClass
          )}
        >
          {selectedOperator === op.id && <Check className="h-4 w-4" />}
          <span className={cn("text-sm font-semibold", selectedOperator === op.id ? "text-current" : op.color)}>
            {op.label}
          </span>
        </button>
      ))}
    </div>
  );
}

export function getOperatorLabel(operator: PaymentOperator): string {
  const op = operators.find((o) => o.id === operator);
  return op?.label || operator;
}
