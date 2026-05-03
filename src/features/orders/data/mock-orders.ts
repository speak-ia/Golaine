import type { Order } from "@shared/types/domainTypes";

export const MOCK_INITIAL_ORDERS: Order[] = [
  { id: 1001, client: "22241857975", clientSub: "22241857975", produit: "Iphone PRO max", adresse: "Point E, rue 37", montant: 250000, status: "confirmee", date: "27/04/2026" },
  { id: 1002, client: "778456123", clientSub: "778456123", produit: "Protéine Premium", adresse: "Pikine rue 10", montant: 50000, status: "en_attente", date: "27/04/2026" },
  { id: 1003, client: "775321987", clientSub: "775321987", produit: "Robe Wax S-400", adresse: "Rue 10 Pikine", montant: 50000, status: "confirmee", date: "26/04/2026" },
  { id: 1004, client: "771234567", clientSub: "771234567", produit: "Sac À Main Dakar", adresse: "Médina, rue 45", montant: 6500, status: "livree", date: "26/04/2026" },
  { id: 1005, client: "779876543", clientSub: "779876543", produit: "Huile d'Argan Bio", adresse: "Almadies, bd de la Corniche", montant: 12000, status: "en_preparation", date: "25/04/2026" },
  { id: 1006, client: "763456789", clientSub: "763456789", produit: "Bissap 1L", adresse: "Ouakam, route des Almadies", montant: 1500, status: "confirmee", date: "25/04/2026" },
  { id: 1007, client: "782345678", clientSub: "782345678", produit: "Café Touba 500g", adresse: "Parcelles Assainies, U23", montant: 3000, status: "annulee", date: "24/04/2026" },
  { id: 1008, client: "770987654", clientSub: "770987654", produit: "Tunique Boubou", adresse: "Grand Yoff, carrefour A", montant: 9000, status: "livree", date: "24/04/2026" },
  { id: 1009, client: "776543210", clientSub: "776543210", produit: "Savon Noir Naturel", adresse: "Liberté 6, villa 12", montant: 2500, status: "en_attente", date: "23/04/2026" },
  { id: 1010, client: "778901234", clientSub: "778901234", produit: "Pagne Tissé Premium", adresse: "Fann Résidence, lot 8", montant: 8000, status: "confirmee", date: "23/04/2026" },
  { id: 1011, client: "774567890", clientSub: "774567890", produit: "Bijoux Mauritanien", adresse: "Ngor, rue des pêcheurs", montant: 15000, status: "en_preparation", date: "22/04/2026" },
  { id: 1012, client: "771122334", clientSub: "771122334", produit: "Thiakry Nature", adresse: "Dakar Plateau, av. de la République", montant: 2000, status: "livree", date: "22/04/2026" },
];
