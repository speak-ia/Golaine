/**
 * Types métier centralisés (domaine AgentIA / Venteo).
 * Les enums partagés avec l’UI restent dans `@shared/constants/status` et sont réexportés ici pour commodité.
 */

import type {
  ContactSegment,
  OrderStatus,
  AppointmentType,
  AppointmentStatus,
} from "@shared/constants/status";

export type {
  ContactSegment,
  OrderStatus,
  AppointmentType,
  AppointmentStatus,
} from "@shared/constants/status";

/** Produit catalogue (mock / futur Supabase) */
export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  status: "actif" | "inactif";
  assignedAgent: string | null;
}

/** Slot agent WhatsApp (mock) */
export interface AgentIA {
  id: string;
  slotName: string;
  agentName: string;
  phone: string;
  status: "connected" | "inactive";
}

export interface Contact {
  id: number;
  name: string;
  phone: string;
  email: string;
  segment: ContactSegment;
  orders: number;
  totalSpent: number;
  lastOrder: string;
  city: string;
  notes: string;
  avatar: string;
  color: string;
}

export interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  city: string;
  segment: ContactSegment;
  notes: string;
}

export interface Order {
  id: number;
  client: string;
  clientSub: string;
  produit: string;
  adresse: string;
  montant: number;
  status: OrderStatus;
  date: string;
}

export interface Appointment {
  id: number;
  title: string;
  client: string;
  date: string;
  time: string;
  duration: number;
  type: AppointmentType;
  status: AppointmentStatus;
  notes: string;
  location: string;
}

export interface Message {
  sender: "client" | "agent";
  text: string;
  time: string;
}

export interface Conversation {
  id: number;
  name: string;
  phone: string;
  lastMessage: string;
  time: string;
  unread: number;
  status: "active" | "closed";
  avatar: string;
  gradient: string;
}

export type ConversationFilterTab = "all" | "active" | "closed";

export type PlanTier = "Starter" | "Pro" | "Business";

/** Utilisateur session (placeholder avant Supabase Auth) */
export interface DomainUser {
  id: string;
  email: string;
  displayName?: string;
}
