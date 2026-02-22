import { Produit } from "@/hooks/useProduits";
import { Vente } from "@/hooks/useVentes";

export function calculateDailyStats(ventes: Vente[], produits: Produit[]) {
  const today = new Date().toISOString().split("T")[0];
  const todaySales = ventes.filter((v) => v.date_vente.startsWith(today));

  const ventesJour = todaySales.reduce((sum, v) => sum + v.montant_total, 0);

  let beneficeNet = 0;
  todaySales.forEach((vente) => {
    const produit = produits.find((p) => p.id === vente.produit_id);
    if (produit) {
      const marge = produit.prix_vente - produit.prix_achat;
      beneficeNet += marge * vente.quantite;
    }
  });

  return { ventesJour, beneficeNet };
}

export function getWeeklySalesData(ventes: Vente[]) {
  const data = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const dayVentes = ventes.filter((v) => v.date_vente.startsWith(dateStr));
    const total = dayVentes.reduce((sum, v) => sum + v.montant_total, 0);

    data.push({
      jour: new Intl.DateTimeFormat("fr-CI", { weekday: "short" }).format(date),
      ventes: total,
    });
  }

  return data;
}

export function getLowStockProduits(produits: Produit[]) {
  return produits.filter((p) => p.stock_actuel < 5);
}
