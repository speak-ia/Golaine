"use client";

import { useState } from "react";
import {
  Plus,
  FileText,
  CheckCircle2,
  Package,
  TrendingUp,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

/* ──────────────────── Types ──────────────────── */
type OrderStatus = "en_attente" | "confirmee" | "en_preparation" | "livree" | "annulee";

interface Order {
  id: number;
  client: string;
  produit: string;
  adresse: string;
  montant: number;
  status: OrderStatus;
  date: string;
}

/* ──────────────────── Status Config ──────────────────── */
const STATUS_MAP: Record<
  OrderStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  en_attente: {
    label: "En attente",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  confirmee: {
    label: "Confirmée",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  en_preparation: {
    label: "En préparation",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  livree: {
    label: "Livrée",
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-500",
  },
  annulee: {
    label: "Annulée",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
  },
};

/* ──────────────────── Mock Data ──────────────────── */
const INITIAL_ORDERS: Order[] = [
  {
    id: 1001,
    client: "22241857975",
    produit: "Iphone PRO max",
    adresse: "Point E, rue 37",
    montant: 250000,
    status: "confirmee",
    date: "27/04/2026",
  },
  {
    id: 1002,
    client: "22241857975",
    produit: "Protéine Premium",
    adresse: "Pikine rue, 10",
    montant: 50000,
    status: "en_attente",
    date: "27/04/2026",
  },
  {
    id: 1003,
    client: "22241857975",
    produit: "Protéine Premium",
    adresse: "rue, 10 pikine",
    montant: 50000,
    status: "confirmee",
    date: "26/04/2026",
  },
  {
    id: 1004,
    client: "771234567",
    produit: "Sac à main cuir",
    adresse: "Médina, avenue Blaise Diagne",
    montant: 35000,
    status: "livree",
    date: "25/04/2026",
  },
  {
    id: 1005,
    client: "788990123",
    produit: "Parfum Touba 100ml",
    adresse: "Almadies, villa 14",
    montant: 15000,
    status: "annulee",
    date: "24/04/2026",
  },
  {
    id: 1006,
    client: "764567890",
    produit: "Chemise Wax Premium",
    adresse: "Plateau, rue 45",
    montant: 22000,
    status: "confirmee",
    date: "23/04/2026",
  },
  {
    id: 1007,
    client: "773456789",
    produit: "Bissap Bio 5L",
    adresse: "Grand Yoff, cité Keur Gorgui",
    montant: 8500,
    status: "en_preparation",
    date: "22/04/2026",
  },
  {
    id: 1008,
    client: "782345678",
    produit: "Huile d'Argan 250ml",
    adresse: "Liberté 6, extension",
    montant: 45000,
    status: "confirmee",
    date: "21/04/2026",
  },
];

/* ──────────────────── Helpers ──────────────────── */
function formatMontant(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " F";
}

/* ──────────────────── Custom CSS ──────────────────── */
const cmdStyles = `
  .cmd-header-cell {
    padding: 12px 16px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    text-align: left;
    white-space: nowrap;
  }
  .cmd-row {
    transition: background-color 0.12s ease;
  }
  .cmd-row:hover {
    background-color: #f9fafb;
  }
  .cmd-cell {
    padding: 14px 16px;
    font-size: 14px;
    color: #111827;
    border-bottom: 1px solid #f3f4f6;
    white-space: nowrap;
  }
  .cmd-stat-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 18px 20px;
    transition: box-shadow 0.2s ease;
  }
  .cmd-stat-card:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .cmd-input {
    width: 100%;
    padding: 9px 14px 9px 38px;
    border-radius: 8px;
    border: 1.5px solid #e5e7eb;
    background: #ffffff;
    font-size: 13px;
    color: #111827;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .cmd-input:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
  .cmd-input::placeholder {
    color: #9ca3af;
  }
  .cmd-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 18px;
    border-radius: 8px;
    background: #10b981;
    color: #ffffff;
    font-size: 13px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: background 0.15s ease, box-shadow 0.15s ease;
  }
  .cmd-btn-primary:hover {
    background: #059669;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  }
  .cmd-action-btn {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: background 0.12s ease, color 0.12s ease;
    color: #9ca3af;
  }
  .cmd-action-btn:hover {
    background: #f3f4f6;
    color: #374151;
  }
  .cmd-filter-pill {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
  }
  .cmd-filter-pill:hover {
    border-color: #d1d5db;
    background: #f9fafb;
  }
  .cmd-filter-pill--active {
    background: #10b981;
    color: #ffffff;
    border-color: #10b981;
    box-shadow: 0 1px 4px rgba(16,185,129,0.25);
  }
  .cmd-page-btn {
    width: 36px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    color: #374151;
    cursor: pointer;
    transition: all 0.12s ease;
  }
  .cmd-page-btn:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #d1d5db;
  }
  .cmd-page-btn--active {
    background: #10b981;
    color: #ffffff;
    border-color: #10b981;
  }
  .cmd-page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

/* ──────────────────── Main Component ──────────────────── */
export default function CommandesPage() {
  const [orders] = useState<Order[]>(INITIAL_ORDERS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<number | null>(null);

  const PER_PAGE = 6;

  /* Derived */
  const filtered = orders.filter((o) => {
    const matchSearch =
      search === "" ||
      o.client.includes(search) ||
      o.produit.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toString().includes(search);
    const matchFilter = filter === "all" || o.status === filter;
    return matchSearch && matchFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const totalCount = orders.length;
  const confirmedCount = orders.filter((o) => o.status === "confirmee").length;
  const deliveredCount = orders.filter((o) => o.status === "livree").length;
  const revenue = orders
    .filter((o) => o.status !== "annulee")
    .reduce((s, o) => s + o.montant, 0);

  const selectedOrder = detailId !== null ? orders.find((o) => o.id === detailId) : null;

  /* Stat cards */
  const stats = [
    {
      label: "Total",
      value: totalCount.toString(),
      icon: FileText,
      color: "#6366f1",
      bg: "#eef2ff",
    },
    {
      label: "Confirmées",
      value: confirmedCount.toString(),
      icon: CheckCircle2,
      color: "#10b981",
      bg: "#ecfdf5",
    },
    {
      label: "Livrées",
      value: deliveredCount.toString(),
      icon: Package,
      color: "#f59e0b",
      bg: "#fffbeb",
    },
    {
      label: "Chiffre d'aff.",
      value: formatMontant(revenue),
      icon: TrendingUp,
      color: "#8b5cf6",
      bg: "#f5f3ff",
    },
  ];

  const filterOptions: { value: OrderStatus | "all"; label: string }[] = [
    { value: "all", label: "Toutes" },
    { value: "en_attente", label: "En attente" },
    { value: "confirmee", label: "Confirmée" },
    { value: "en_preparation", label: "En préparation" },
    { value: "livree", label: "Livrée" },
    { value: "annulee", label: "Annulée" },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cmdStyles }} />

      <div className="max-w-6xl mx-auto">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              Commandes & Ventes
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Suivi de vos ventes et commandes clients
            </p>
          </div>
          <button className="cmd-btn-primary">
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Nouvelle commande
          </button>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="cmd-stat-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {stat.label}
                  </span>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: stat.bg }}
                  >
                    <Icon className="w-4 h-4" style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 leading-none">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Filters Bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setFilter(opt.value);
                  setPage(1);
                }}
                className={`cmd-filter-pill ${filter === opt.value ? "cmd-filter-pill--active" : ""}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher une commande..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="cmd-input"
            />
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-xl border border-gray-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr>
                  <th className="cmd-header-cell">Client</th>
                  <th className="cmd-header-cell">Produit</th>
                  <th className="cmd-header-cell">Adresse</th>
                  <th className="cmd-header-cell text-right">Montant</th>
                  <th className="cmd-header-cell">Statut</th>
                  <th className="cmd-header-cell">Date</th>
                  <th className="cmd-header-cell text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((order) => {
                  const st = STATUS_MAP[order.status];
                  return (
                    <tr key={order.id} className="cmd-row">
                      {/* Client */}
                      <td className="cmd-cell">
                        <span className="font-medium text-gray-900">{order.client}</span>
                      </td>
                      {/* Produit */}
                      <td className="cmd-cell">
                        <span className="text-gray-700">{order.produit}</span>
                      </td>
                      {/* Adresse */}
                      <td className="cmd-cell">
                        <span className="text-gray-500 text-[13px]">{order.adresse}</span>
                      </td>
                      {/* Montant */}
                      <td className="cmd-cell text-right">
                        <span className="font-semibold text-gray-900">
                          {formatMontant(order.montant)}
                        </span>
                      </td>
                      {/* Statut */}
                      <td className="cmd-cell">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold ${st.bg} ${st.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>
                      {/* Date */}
                      <td className="cmd-cell">
                        <span className="text-gray-500 text-[13px]">{order.date}</span>
                      </td>
                      {/* Actions */}
                      <td className="cmd-cell text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="cmd-action-btn"
                            title="Voir détails"
                            onClick={() => setDetailId(order.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="cmd-action-btn" title="Modifier">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button className="cmd-action-btn hover:!text-red-500 hover:!bg-red-50" title="Supprimer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {paginated.map((order) => {
              const st = STATUS_MAP[order.status];
              return (
                <div key={order.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {order.produit}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{order.client}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${st.bg} ${st.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-gray-500">{order.adresse}</span>
                    <span className="font-semibold text-gray-900">
                      {formatMontant(order.montant)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                    <span className="text-xs text-gray-400">{order.date}</span>
                    <div className="flex items-center gap-1">
                      <button className="cmd-action-btn" onClick={() => setDetailId(order.id)}>
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="cmd-action-btn">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {paginated.length === 0 && (
            <div className="py-16 text-center">
              <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-900">Aucune commande trouvée</p>
              <p className="text-xs text-gray-400 mt-1">Essayez de modifier vos filtres.</p>
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-5">
            <button
              className="cmd-page-btn"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={`cmd-page-btn ${page === n ? "cmd-page-btn--active" : ""}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              className="cmd-page-btn"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDetailId(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">
                Commande #{selectedOrder.id}
              </h2>
              <button
                onClick={() => setDetailId(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer text-gray-400"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Client</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{selectedOrder.client}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Date</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{selectedOrder.date}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Produit</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{selectedOrder.produit}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Adresse de livraison</p>
                <p className="text-sm text-gray-700 mt-1">{selectedOrder.adresse}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Montant</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {formatMontant(selectedOrder.montant)}
                  </p>
                </div>
                {(() => {
                  const st = STATUS_MAP[selectedOrder.status];
                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${st.bg} ${st.text}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
