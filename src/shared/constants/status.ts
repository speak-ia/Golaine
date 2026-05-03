import type { LucideIcon } from "lucide-react";
import {
  Truck,
  Handshake,
  Phone,
  MoreHorizontal,
  CalendarCheck,
  CalendarClock,
  CalendarX,
} from "lucide-react";

/** Badge / pill : classes Tailwind séparées */
export type PillTone = {
  label: string;
  bg: string;
  text: string;
  border?: string;
};

/** Tuple unique pour Zod / filtres — ordre = clés de `ORDER_STATUS` */
export const ORDER_STATUSES = [
  "en_attente",
  "confirmee",
  "en_preparation",
  "livree",
  "annulee",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS: Record<
  OrderStatus,
  PillTone & { border: string }
> = {
  en_attente: {
    label: "En attente",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-300",
  },
  confirmee: {
    label: "Confirmée",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-300",
  },
  en_preparation: {
    label: "En préparation",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-300",
  },
  livree: {
    label: "Livrée",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-300",
  },
  annulee: {
    label: "Annulée",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-300",
  },
};

export const CONTACT_SEGMENTS = ["VIP", "Régulier", "Nouveau", "Inactif"] as const;

export type ContactSegment = (typeof CONTACT_SEGMENTS)[number];

export const CONTACT_SEGMENT: Record<ContactSegment, string> = {
  VIP: "bg-green-50 text-green-700 border-green-200",
  Régulier: "bg-blue-50 text-blue-700 border-blue-200",
  Nouveau: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Inactif: "bg-gray-50 text-gray-600 border-gray-200",
};

export const APPOINTMENT_TYPES = ["livraison", "rendez-vous", "appel", "autre"] as const;

export const APPOINTMENT_STATUSES = ["confirme", "en_attente", "annule"] as const;

export type AppointmentType = (typeof APPOINTMENT_TYPES)[number];

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export type AppointmentTypeConfig = PillTone & {
  border: string;
  icon: LucideIcon;
  /** Alias historique (= classes `text-*`) */
  color: string;
};

export const APPOINTMENT_TYPE: Record<AppointmentType, AppointmentTypeConfig> =
  {
    livraison: {
      label: "Livraison",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      color: "text-emerald-700",
      border: "border-emerald-200",
      icon: Truck,
    },
    "rendez-vous": {
      label: "Rendez-vous",
      bg: "bg-blue-50",
      text: "text-blue-700",
      color: "text-blue-700",
      border: "border-blue-200",
      icon: Handshake,
    },
    appel: {
      label: "Appel",
      bg: "bg-orange-50",
      text: "text-orange-700",
      color: "text-orange-700",
      border: "border-orange-200",
      icon: Phone,
    },
    autre: {
      label: "Autre",
      bg: "bg-gray-100",
      text: "text-gray-700",
      color: "text-gray-700",
      border: "border-gray-200",
      icon: MoreHorizontal,
    },
  };

export type AppointmentStatusConfig = PillTone & {
  border: string;
  icon: LucideIcon;
  color: string;
};

export const APPOINTMENT_STATUS: Record<
  AppointmentStatus,
  AppointmentStatusConfig
> = {
  confirme: {
    label: "Confirmé",
    bg: "bg-green-50",
    text: "text-green-700",
    color: "text-green-700",
    border: "border-green-200",
    icon: CalendarCheck,
  },
  en_attente: {
    label: "En attente",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    color: "text-yellow-700",
    border: "border-yellow-200",
    icon: CalendarClock,
  },
  annule: {
    label: "Annulé",
    bg: "bg-red-50",
    text: "text-red-700",
    color: "text-red-700",
    border: "border-red-200",
    icon: CalendarX,
  },
};

/** Activité récente dashboard — classes pour la pastille icône */
export type DashboardActivityType =
  | "order"
  | "contact"
  | "agent"
  | "success";

export const DASHBOARD_ACTIVITY_CLASS: Record<DashboardActivityType, string> = {
  order: "bg-blue-50 text-blue-600",
  contact: "bg-purple-50 text-purple-600",
  agent: "bg-green-50 text-green-600",
  success: "bg-emerald-50 text-emerald-600",
};
