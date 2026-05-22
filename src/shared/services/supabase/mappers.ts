import type {
  AppointmentStatus,
  AppointmentType,
  ContactSegment,
  OrderStatus,
} from "@shared/constants/status";
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
  CONTACT_SEGMENTS,
  ORDER_STATUSES,
} from "@shared/constants/status";
import type {
  Appointment,
  Contact,
  Conversation,
  Message,
  Order,
  Product,
} from "@shared/types/domainTypes";
import {
  formatChatListTime,
  formatChatMessageTime,
  formatDateLocaleShort,
} from "@shared/utils/date";
import { getInitials } from "@shared/utils/text";
import type { Database } from "./types";

type ContactRow = Database["public"]["Tables"]["contacts"]["Row"];
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type AppointmentRow = Database["public"]["Tables"]["appointments"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ThreadRow = Database["public"]["Tables"]["conversation_threads"]["Row"];
type MessageRow = Database["public"]["Tables"]["conversation_messages"]["Row"];

const CONTACT_GRADIENTS = [
  "from-green-400 to-emerald-600",
  "from-purple-400 to-violet-600",
  "from-blue-400 to-cyan-600",
  "from-orange-400 to-amber-600",
  "from-pink-400 to-rose-600",
  "from-teal-400 to-green-600",
  "from-indigo-400 to-blue-600",
  "from-red-400 to-pink-600",
  "from-yellow-400 to-orange-600",
  "from-cyan-400 to-teal-600",
  "from-emerald-400 to-green-600",
  "from-gray-400 to-gray-600",
] as const;

function segmentFromDb(s: string): ContactSegment {
  return CONTACT_SEGMENTS.includes(s as ContactSegment)
    ? (s as ContactSegment)
    : "Nouveau";
}

function orderStatusFromDb(s: string): OrderStatus {
  return ORDER_STATUSES.includes(s as OrderStatus) ? (s as OrderStatus) : "en_attente";
}

function appointmentTypeFromDb(s: string): AppointmentType {
  return APPOINTMENT_TYPES.includes(s as AppointmentType)
    ? (s as AppointmentType)
    : "autre";
}

function appointmentStatusFromDb(s: string): AppointmentStatus {
  return APPOINTMENT_STATUSES.includes(s as AppointmentStatus)
    ? (s as AppointmentStatus)
    : "en_attente";
}

export function contactFromRow(row: ContactRow): Contact {
  const initials = getInitials(row.name);
  const color = CONTACT_GRADIENTS[Math.abs(Number(row.id)) % CONTACT_GRADIENTS.length];
  return {
    id: Number(row.id),
    name: row.name,
    phone: row.phone,
    email: row.email,
    segment: segmentFromDb(row.segment),
    city: row.city,
    notes: row.notes,
    orders: row.orders_count,
    totalSpent: row.total_spent,
    lastOrder: row.last_order_at ? formatDateLocaleShort(row.last_order_at) : "",
    avatar: initials,
    color,
  };
}

export function orderFromRow(row: OrderRow): Order {
  return {
    id: Number(row.id),
    client: row.client,
    clientSub: row.client_sub,
    produit: row.produit,
    adresse: row.adresse,
    montant: Number(row.montant),
    status: orderStatusFromDb(row.status),
    date: new Date(row.created_at).toLocaleDateString("fr-FR"),
  };
}

const CONVERSATION_GRADIENTS = [
  "from-emerald-500 to-green-600",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-rose-500 to-pink-600",
  "from-teal-500 to-emerald-600",
  "from-fuchsia-500 to-pink-600",
  "from-indigo-500 to-violet-600",
  "from-yellow-500 to-amber-600",
  "from-lime-500 to-green-600",
] as const;

export function productFromRow(row: ProductRow): Product {
  return {
    id: Number(row.id),
    name: row.name,
    price: Number(row.price),
    category: row.category,
    stock: row.stock,
    image: row.image ?? "",
    status: row.status === "inactif" ? "inactif" : "actif",
    assignedAgent: row.assigned_agent,
  };
}

export function threadFromRow(row: ThreadRow): Conversation {
  const avatar =
    row.avatar_initials?.trim() || getInitials(row.contact_name || "?");
  const gradient =
    row.gradient_key?.trim() ||
    CONVERSATION_GRADIENTS[Math.abs(Number(row.id)) % CONVERSATION_GRADIENTS.length];

  return {
    id: Number(row.id),
    name: row.contact_name,
    phone: row.contact_phone,
    lastMessage: row.last_message,
    time: formatChatListTime(row.last_message_at),
    unread: row.unread_count,
    status: row.status === "closed" ? "closed" : "active",
    avatar,
    gradient,
  };
}

export function messageFromRow(row: MessageRow): Message {
  return {
    id: Number(row.id),
    sender: row.sender === "agent" ? "agent" : "client",
    text: row.body,
    time: formatChatMessageTime(row.sent_at),
  };
}

export function appointmentFromRow(row: AppointmentRow): Appointment {
  return {
    id: Number(row.id),
    title: row.title,
    client: row.client,
    date: row.appointment_date,
    time: row.appointment_time,
    duration: row.duration_minutes,
    type: appointmentTypeFromDb(row.type),
    status: appointmentStatusFromDb(row.status),
    notes: row.notes,
    location: row.location,
  };
}
