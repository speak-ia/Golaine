import type { Appointment } from "@shared/types/domainTypes";
import { toDateKey } from "@shared/utils/date";

const today = new Date();
const d = (offset: number) => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() + offset);
  return toDateKey(dt);
};

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    title: "Livraison Fatou - Dakar",
    client: "Fatou Diallo",
    date: d(0),
    time: "10:00",
    duration: 30,
    type: "livraison",
    status: "confirme",
    notes: "Robes wax + pagnes",
    location: "Plateau, Dakar",
  },
  {
    id: 2,
    title: "Démo produits - Boutique",
    client: "Moussa Traoré",
    date: d(0),
    time: "14:00",
    duration: 60,
    type: "rendez-vous",
    status: "en_attente",
    notes: "Intéressé par les produits alimentaires",
    location: "Marché Sandaga",
  },
  {
    id: 3,
    title: "Conseil beauté Aminata",
    client: "Aminata Sow",
    date: d(1),
    time: "09:30",
    duration: 45,
    type: "rendez-vous",
    status: "confirme",
    notes: "Vente huile d'argan et savon",
    location: "Almadies, Dakar",
  },
  {
    id: 4,
    title: "Relance Ibrahim",
    client: "Ibrahim Keita",
    date: d(2),
    time: "11:00",
    duration: 15,
    type: "appel",
    status: "en_attente",
    notes: "Panier abandonné",
    location: "",
  },
];
