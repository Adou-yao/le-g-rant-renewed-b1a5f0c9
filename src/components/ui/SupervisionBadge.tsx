import { ShieldCheck } from "lucide-react";

export function SupervisionBadge() {
  return (
    <div className="mx-4 mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20">
      <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
      <span className="text-xs font-semibold text-primary">Mode Supervision — Lecture Seule</span>
    </div>
  );
}
