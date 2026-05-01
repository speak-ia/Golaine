"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Search,
  Plus,
  Pencil,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Phone,
  Calendar,
  MessageSquare,
  User,
  X,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Types ───────────────────────────────────────────────────────────────────

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: number;
  client: string;
  phone: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  date: string;
  channel: "whatsapp" | "manuel";
  notes?: string;
}

type OrderStatus =
  | "en_attente"
  | "confirmee"
  | "en_preparation"
  | "livree"
  | "annulee";

type ModalType = "none" | "detail" | "edit" | "create";

interface NewOrderItem {
  name: string;
  qty: number;
  price: number;
}

// ─── Status Configuration ────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bgColor: string; dotColor: string }
> = {
  en_attente: {
    label: "En attente",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50 border-yellow-200",
    dotColor: "bg-yellow-500",
  },
  confirmee: {
    label: "Confirmée",
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
    dotColor: "bg-blue-500",
  },
  en_preparation: {
    label: "En préparation",
    color: "text-orange-700",
    bgColor: "bg-orange-50 border-orange-200",
    dotColor: "bg-orange-500",
  },
  livree: {
    label: "Livrée",
    color: "text-green-700",
    bgColor: "bg-green-50 border-green-200",
    dotColor: "bg-green-500",
  },
  annulee: {
    label: "Annulée",
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200",
    dotColor: "bg-red-500",
  },
};

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "en_attente", label: "En attente" },
  { value: "confirmee", label: "Confirmée" },
  { value: "en_preparation", label: "En préparation" },
  { value: "livree", label: "Livrée" },
  { value: "annulee", label: "Annulée" },
];

const FILTER_OPTIONS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Toutes" },
  ...STATUS_OPTIONS,
];

// ─── Mock Data ───────────────────────────────────────────────────────────────

const INITIAL_ORDERS: Order[] = [
  {
    id: 1001,
    client: "Fatou Diallo",
    phone: "+221 77 234 56 78",
    items: [
      { name: "Robe Wax S-400", qty: 3, price: 5000 },
      { name: "Pagne Tissé", qty: 2, price: 8000 },
    ],
    total: 31000,
    status: "livree",
    date: "2025-01-15",
    channel: "whatsapp",
  },
  {
    id: 1002,
    client: "Moussa Traoré",
    phone: "+225 07 89 12 34",
    items: [{ name: "Bissap 1L", qty: 10, price: 1500 }],
    total: 15000,
    status: "confirmee",
    date: "2025-01-14",
    channel: "whatsapp",
  },
  {
    id: 1003,
    client: "Aminata Sow",
    phone: "+221 78 456 78 90",
    items: [
      { name: "Huile d'Argan Bio", qty: 1, price: 12000 },
      { name: "Savon Noir", qty: 2, price: 2500 },
    ],
    total: 17000,
    status: "en_attente",
    date: "2025-01-14",
    channel: "whatsapp",
  },
  {
    id: 1004,
    client: "Ibrahim Keita",
    phone: "+223 76 123 45 67",
    items: [{ name: "Sac À Main Dakar", qty: 1, price: 6500 }],
    total: 6500,
    status: "annulee",
    date: "2025-01-13",
    channel: "manuel",
  },
  {
    id: 1005,
    client: "Awa Ndiaye",
    phone: "+221 77 890 12 34",
    items: [
      { name: "Thiakry Nature", qty: 5, price: 2000 },
      { name: "Bissap 1L", qty: 5, price: 1500 },
    ],
    total: 17500,
    status: "livree",
    date: "2025-01-12",
    channel: "whatsapp",
  },
  {
    id: 1006,
    client: "Oumar Ba",
    phone: "+221 76 567 89 01",
    items: [{ name: "Tunique Boubou", qty: 2, price: 9000 }],
    total: 18000,
    status: "confirmee",
    date: "2025-01-11",
    channel: "whatsapp",
  },
  {
    id: 1007,
    client: "Mariam Coulibaly",
    phone: "+223 70 234 56 78",
    items: [{ name: "Bijoux Mauritanien", qty: 1, price: 15000 }],
    total: 15000,
    status: "en_preparation",
    date: "2025-01-10",
    channel: "whatsapp",
  },
  {
    id: 1008,
    client: "Cheikh Sy",
    phone: "+221 78 345 67 89",
    items: [{ name: "Café Touba 500g", qty: 3, price: 3000 }],
    total: 9000,
    status: "livree",
    date: "2025-01-09",
    channel: "manuel",
  },
  {
    id: 1009,
    client: "Fatima Diop",
    phone: "+221 77 678 90 12",
    items: [
      { name: "Collier Traditionnel", qty: 2, price: 3500 },
      { name: "Bracelet", qty: 2, price: 2000 },
    ],
    total: 11000,
    status: "confirmee",
    date: "2025-01-08",
    channel: "whatsapp",
  },
  {
    id: 1010,
    client: "Boubacar Diallo",
    phone: "+223 71 456 78 90",
    items: [{ name: "Baobab Fruit Powder", qty: 4, price: 4500 }],
    total: 18000,
    status: "en_attente",
    date: "2025-01-07",
    channel: "whatsapp",
  },
  {
    id: 1011,
    client: "Kadiatou Bah",
    phone: "+224 62 345 67 89",
    items: [
      { name: "Robe Wax S-400", qty: 1, price: 5000 },
      { name: "Tunique Boubou", qty: 1, price: 9000 },
    ],
    total: 14000,
    status: "livree",
    date: "2025-01-06",
    channel: "whatsapp",
  },
  {
    id: 1012,
    client: "Seydou Ndiaye",
    phone: "+221 76 789 01 23",
    items: [{ name: "Savon Noir Naturel", qty: 10, price: 2500 }],
    total: 25000,
    status: "annulee",
    date: "2025-01-05",
    channel: "manuel",
  },
  {
    id: 1013,
    client: "Aicha Touré",
    phone: "+223 70 567 89 01",
    items: [
      { name: "Huile d'Argan Bio", qty: 2, price: 12000 },
      { name: "Savon Noir", qty: 3, price: 2500 },
    ],
    total: 31500,
    status: "confirmee",
    date: "2025-01-04",
    channel: "whatsapp",
  },
  {
    id: 1014,
    client: "Mamadou Sow",
    phone: "+221 77 890 23 45",
    items: [{ name: "Pagne Tissé Premium", qty: 3, price: 8000 }],
    total: 24000,
    status: "en_preparation",
    date: "2025-01-03",
    channel: "whatsapp",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatFCFA(amount: number): string {
  return (
    amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA"
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getItemSummary(items: OrderItem[]): string {
  if (items.length === 0) return "—";
  if (items.length === 1) return items[0].name;
  return `${items[0].name} +${items.length - 1} autre${items.length > 2 ? "s" : ""}`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${config.bgColor} ${config.color}`}
    >
      <span className={`inline-block size-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}

function ChannelBadge({ channel }: { channel: "whatsapp" | "manuel" }) {
  if (channel === "whatsapp") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600">
        <MessageSquare className="size-3" />
        WhatsApp
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
      <User className="size-3" />
      Manuel
    </span>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CommandesPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalType, setModalType] = useState<ModalType>("none");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // Edit form state
  const [editStatus, setEditStatus] = useState<OrderStatus>("en_attente");
  const [editNotes, setEditNotes] = useState("");

  // Create form state
  const [createClient, setCreateClient] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createItems, setCreateItems] = useState<NewOrderItem[]>([
    { name: "", qty: 1, price: 0 },
  ]);

  // Delete state
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // Expanded row
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const ORDERS_PER_PAGE = 5;

  // ── Derived data ──

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        searchQuery === "" ||
        order.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toString().includes(searchQuery);
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ORDERS_PER_PAGE;
    return filteredOrders.slice(start, start + ORDERS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) ?? null,
    [orders, selectedOrderId]
  );

  const createTotal = useMemo(
    () => createItems.reduce((sum, item) => sum + item.qty * item.price, 0),
    [createItems]
  );

  // ── Reset page when filter/search changes ──

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // ── Handlers ──

  const openDetail = useCallback((id: number) => {
    setSelectedOrderId(id);
    setModalType("detail");
  }, []);

  const openEdit = useCallback((id: number) => {
    const order = orders.find((o) => o.id === id);
    if (order) {
      setSelectedOrderId(id);
      setEditStatus(order.status);
      setEditNotes(order.notes ?? "");
      setModalType("edit");
    }
  }, [orders]);

  const openCreate = useCallback(() => {
    setCreateClient("");
    setCreatePhone("");
    setCreateItems([{ name: "", qty: 1, price: 0 }]);
    setModalType("create");
  }, []);

  const closeModal = useCallback(() => {
    setModalType("none");
    setSelectedOrderId(null);
  }, []);

  const handleSaveEdit = useCallback(() => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrderId
          ? { ...o, status: editStatus, notes: editNotes }
          : o
      )
    );
    closeModal();
  }, [selectedOrderId, editStatus, editNotes, closeModal]);

  const handleAddItem = useCallback(() => {
    setCreateItems((prev) => [...prev, { name: "", qty: 1, price: 0 }]);
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setCreateItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleItemChange = useCallback(
    (index: number, field: keyof NewOrderItem, value: string | number) => {
      setCreateItems((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        )
      );
    },
    []
  );

  const handleCreateOrder = useCallback(() => {
    const newId = Math.max(...orders.map((o) => o.id), 1000) + 1;
    const today = new Date().toISOString().split("T")[0];
    const newOrder: Order = {
      id: newId,
      client: createClient,
      phone: createPhone,
      items: createItems.filter((item) => item.name.trim() !== ""),
      total: createTotal,
      status: "en_attente",
      date: today,
      channel: "manuel",
      notes: "",
    };
    setOrders((prev) => [newOrder, ...prev]);
    setCurrentPage(1);
    closeModal();
  }, [createClient, createPhone, createItems, createTotal, orders, closeModal]);

  const handleConfirmDelete = useCallback(() => {
    if (deleteTargetId !== null) {
      setOrders((prev) => prev.filter((o) => o.id !== deleteTargetId));
      setDeleteTargetId(null);
      closeModal();
    }
  }, [deleteTargetId, closeModal]);

  const toggleExpanded = useCallback((id: number) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  }, []);

  // ── Page numbers for pagination ──

  const pageNumbers = useMemo(() => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ── Top Bar ── */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F8EF]">
                <ShoppingCart className="size-5 text-[#25D366]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Commandes</h1>
                <p className="text-sm text-gray-500">
                  {filteredOrders.length} commande
                  {filteredOrders.length !== 1 ? "s" : ""} au total
                </p>
              </div>
            </div>
            <Button
              onClick={openCreate}
              className="cursor-pointer bg-[#25D366] text-white hover:bg-[#16A34A] shadow-sm"
            >
              <Plus className="size-4" />
              Nouvelle commande
            </Button>
          </div>

          {/* Filters & Search */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Status filter pills */}
            <div className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.map((opt) => {
                const isActive =
                  statusFilter === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setStatusFilter(opt.value)}
                    className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#25D366] text-white shadow-sm"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher par nom ou ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="cursor-pointer pl-9 border-gray-200 bg-white"
              />
            </div>
          </div>
        </div>

        {/* ── Order List ── */}
        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
            <ShoppingCart className="mx-auto mb-4 size-12 text-gray-300" />
            <h3 className="mb-1 text-lg font-semibold text-gray-900">
              Aucune commande trouvée
            </h3>
            <p className="text-sm text-gray-500">
              Essayez de modifier vos filtres ou votre recherche.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block rounded-2xl border border-gray-100 bg-white overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Commande
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Client
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Articles
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Total
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Statut
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Date
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedOrders.map((order) => {
                    const isExpanded = expandedOrderId === order.id;
                    return (
                      <React.Fragment key={order.id}>
                        <tr
                          className={`cursor-pointer transition-colors hover:bg-gray-50/80 ${
                            isExpanded ? "bg-gray-50/50" : ""
                          }`}
                          onClick={() => toggleExpanded(order.id)}
                        >
                          <td className="px-5 py-3.5">
                            <span className="text-sm font-semibold text-gray-900">
                              #{order.id}
                            </span>
                            <div className="mt-0.5">
                              <ChannelBadge channel={order.channel} />
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="text-sm font-medium text-gray-900">
                              {order.client}
                            </div>
                            <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                              <Phone className="size-3" />
                              {order.phone}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm text-gray-600">
                              {getItemSummary(order.items)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatFCFA(order.total)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm text-gray-500">
                              {formatDate(order.date)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div
                              className="flex items-center justify-end gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="cursor-pointer size-8 text-gray-400 hover:text-[#25D366]"
                                onClick={() => openDetail(order.id)}
                              >
                                <Eye className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="cursor-pointer size-8 text-gray-400 hover:text-blue-600"
                                onClick={() => openEdit(order.id)}
                              >
                                <Pencil className="size-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {/* Expanded row detail */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="bg-gray-50/80 px-5 py-4">
                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {order.items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="rounded-lg border border-gray-100 bg-white p-3"
                                  >
                                    <p className="text-xs font-medium text-gray-500">
                                      Article {idx + 1}
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-gray-900">
                                      {item.name}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-600">
                                      {item.qty} × {formatFCFA(item.price)} ={" "}
                                      <span className="font-semibold text-gray-900">
                                        {formatFCFA(item.qty * item.price)}
                                      </span>
                                    </p>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                  {order.items.length} article
                                  {order.items.length > 1 ? "s" : ""}
                                </span>
                                <span className="text-lg font-bold text-gray-900">
                                  Total : {formatFCFA(order.total)}
                                </span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="flex flex-col gap-3 md:hidden">
              {paginatedOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-gray-100 bg-white p-5 transition-shadow hover:shadow-sm"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">
                          #{order.id}
                        </span>
                        <ChannelBadge channel={order.channel} />
                      </div>
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {order.client}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-gray-500">
                        <Phone className="size-3" />
                        {order.phone}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  {/* Card Body */}
                  <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3">
                    <div>
                      <p className="text-xs text-gray-500">Articles</p>
                      <p className="text-sm text-gray-700">
                        {getItemSummary(order.items)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-sm font-bold text-gray-900">
                        {formatFCFA(order.total)}
                      </p>
                    </div>
                  </div>

                  {/* Card Date & Actions */}
                  <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="size-3" />
                      {formatDate(order.date)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer gap-1 text-gray-500 hover:text-[#25D366]"
                        onClick={() => openDetail(order.id)}
                      >
                        <Eye className="size-3.5" />
                        Détails
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer gap-1 text-gray-500 hover:text-blue-600"
                        onClick={() => openEdit(order.id)}
                      >
                        <Pencil className="size-3.5" />
                        Modifier
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="cursor-pointer size-9"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="size-4" />
                </Button>

                {pageNumbers.map((page, idx) =>
                  page === "ellipsis" ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="flex size-9 items-center justify-center text-sm text-gray-400"
                    >
                      ...
                    </span>
                  ) : (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="icon"
                      className={`cursor-pointer size-9 ${
                        currentPage === page
                          ? "bg-[#25D366] text-white hover:bg-[#16A34A]"
                          : "border-gray-200"
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  )
                )}

                <Button
                  variant="outline"
                  size="icon"
                  className="cursor-pointer size-9"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* ──────────────────────────────────────────────────────────────────── */}
        {/* DETAIL MODAL */}
        {/* ──────────────────────────────────────────────────────────────────── */}
        <Dialog
          open={modalType === "detail" && selectedOrder !== null}
          onOpenChange={(open) => {
            if (!open) closeModal();
          }}
        >
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <span className="text-gray-400 font-normal">Commande</span>
                <span className="text-gray-900 font-bold">#{selectedOrder?.id}</span>
                {selectedOrder && <StatusBadge status={selectedOrder.status} />}
              </DialogTitle>
              <DialogDescription>
                Détails complets de la commande
              </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-5">
                {/* Client Info */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <User className="size-3.5" />
                      Client
                    </div>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {selectedOrder.client}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Phone className="size-3.5" />
                      Téléphone
                    </div>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {selectedOrder.phone}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Calendar className="size-3.5" />
                      Date
                    </div>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {formatDate(selectedOrder.date)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <MessageSquare className="size-3.5" />
                      Canal
                    </div>
                    <p className="mt-1">
                      <ChannelBadge channel={selectedOrder.channel} />
                    </p>
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-gray-900">
                    Articles commandés
                  </h4>
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Produit
                          </th>
                          <th className="px-4 py-2.5 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                            Qté
                          </th>
                          <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                            Prix unit.
                          </th>
                          <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                            Sous-total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {selectedOrder.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                              {item.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 text-center">
                              {item.qty}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 text-right">
                              {formatFCFA(item.price)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 font-semibold text-right">
                              {formatFCFA(item.qty * item.price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 border-t border-gray-200">
                          <td
                            colSpan={3}
                            className="px-4 py-3 text-sm font-bold text-gray-900 text-right"
                          >
                            Total
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                            {formatFCFA(selectedOrder.total)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-900">
                      Notes
                    </h4>
                    <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="mt-4 gap-2 sm:gap-2">
              <Button
                variant="outline"
                className="cursor-pointer border-gray-200"
                onClick={() => {
                  if (selectedOrderId) openEdit(selectedOrderId);
                }}
              >
                <Pencil className="size-4" />
                Modifier
              </Button>
              <Button
                variant="outline"
                className="cursor-pointer border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => {
                  if (selectedOrderId) setDeleteTargetId(selectedOrderId);
                }}
              >
                <Trash2 className="size-4" />
                Supprimer
              </Button>
              <Button
                className="cursor-pointer bg-[#25D366] text-white hover:bg-[#16A34A]"
                onClick={closeModal}
              >
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ──────────────────────────────────────────────────────────────────── */}
        {/* EDIT MODAL */}
        {/* ──────────────────────────────────────────────────────────────────── */}
        <Dialog
          open={modalType === "edit" && selectedOrder !== null}
          onOpenChange={(open) => {
            if (!open) closeModal();
          }}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="size-5 text-gray-400" />
                Modifier la commande #{selectedOrder?.id}
              </DialogTitle>
              <DialogDescription>
                Mettez à jour le statut et les notes de la commande.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Status */}
              <div className="space-y-2">
                <Label className="text-gray-700">Statut</Label>
                <Select
                  value={editStatus}
                  onValueChange={(val) => setEditStatus(val as OrderStatus)}
                >
                  <SelectTrigger className="w-full border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-gray-700">Notes</Label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Ajouter une note sur cette commande..."
                  className="border-gray-200 resize-none"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="mt-4 flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="cursor-pointer border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 sm:mr-auto"
                onClick={() => {
                  if (selectedOrderId) setDeleteTargetId(selectedOrderId);
                }}
              >
                <Trash2 className="size-4" />
                Supprimer
              </Button>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="cursor-pointer flex-1 border-gray-200 sm:flex-none"
                  onClick={closeModal}
                >
                  Annuler
                </Button>
                <Button
                  className="cursor-pointer flex-1 bg-[#25D366] text-white hover:bg-[#16A34A] sm:flex-none"
                  onClick={handleSaveEdit}
                >
                  Enregistrer
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ──────────────────────────────────────────────────────────────────── */}
        {/* CREATE MODAL */}
        {/* ──────────────────────────────────────────────────────────────────── */}
        <Dialog
          open={modalType === "create"}
          onOpenChange={(open) => {
            if (!open) closeModal();
          }}
        >
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="size-5 text-[#25D366]" />
                Nouvelle commande
              </DialogTitle>
              <DialogDescription>
                Créez une nouvelle commande en remplissant les informations
                ci-dessous.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              {/* Client & Phone */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-gray-700">Nom du client</Label>
                  <Input
                    value={createClient}
                    onChange={(e) => setCreateClient(e.target.value)}
                    placeholder="Ex: Fatou Diallo"
                    className="border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Téléphone</Label>
                  <Input
                    value={createPhone}
                    onChange={(e) => setCreatePhone(e.target.value)}
                    placeholder="Ex: +221 77 234 56 78"
                    className="border-gray-200"
                  />
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-700">Articles</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer gap-1 text-[#25D366] hover:text-[#16A34A] hover:bg-[#E8F8EF]"
                    onClick={handleAddItem}
                  >
                    <Plus className="size-3.5" />
                    Ajouter un article
                  </Button>
                </div>

                <div className="space-y-2">
                  {createItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 rounded-xl border border-gray-100 bg-gray-50/50 p-3"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <div className="sm:col-span-2">
                            <Input
                              value={item.name}
                              onChange={(e) =>
                                handleItemChange(idx, "name", e.target.value)
                              }
                              placeholder="Nom du produit"
                              className="border-gray-200 bg-white"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              min={1}
                              value={item.qty}
                              onChange={(e) =>
                                handleItemChange(
                                  idx,
                                  "qty",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              placeholder="Qté"
                              className="border-gray-200 bg-white"
                            />
                            <Input
                              type="number"
                              min={0}
                              value={item.price}
                              onChange={(e) =>
                                handleItemChange(
                                  idx,
                                  "price",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              placeholder="Prix"
                              className="border-gray-200 bg-white"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Sous-total :{" "}
                          <span className="font-semibold text-gray-700">
                            {formatFCFA(item.qty * item.price)}
                          </span>
                        </p>
                      </div>
                      {createItems.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer size-8 shrink-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                          onClick={() => handleRemoveItem(idx)}
                        >
                          <X className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="rounded-xl bg-[#E8F8EF] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Total de la commande
                  </span>
                  <span className="text-lg font-bold text-[#16A34A]">
                    {formatFCFA(createTotal)}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                className="cursor-pointer border-gray-200"
                onClick={closeModal}
              >
                Annuler
              </Button>
              <Button
                className="cursor-pointer bg-[#25D366] text-white hover:bg-[#16A34A]"
                onClick={handleCreateOrder}
                disabled={!createClient.trim() || !createPhone.trim() || createItems.every((i) => !i.name.trim())}
              >
                Créer la commande
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ──────────────────────────────────────────────────────────────────── */}
        {/* DELETE CONFIRMATION */}
        {/* ──────────────────────────────────────────────────────────────────── */}
        <AlertDialog
          open={deleteTargetId !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteTargetId(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-red-500" />
                Supprimer la commande
              </AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer la commande{" "}
                <span className="font-semibold text-gray-900">
                  #{deleteTargetId}
                </span>{" "}
                ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                className="cursor-pointer bg-red-600 text-white hover:bg-red-700"
                onClick={handleConfirmDelete}
              >
                <Trash2 className="size-4" />
                Supprimer définitivement
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
