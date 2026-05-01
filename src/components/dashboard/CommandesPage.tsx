"use client";

import { useState } from "react";
import {
  Plus,
  FileText,
  CheckCircle2,
  Package,
  TrendingUp,
  ChevronDown,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

/* ──────────────────── Types ──────────────────── */
type OrderStatus = "en_attente" | "confirmee" | "en_preparation" | "livree" | "annulee";

interface Order {
  id: number;
  client: string;
  clientSub: string;
  produit: string;
  adresse: string;
  montant: number;
  status: OrderStatus;
  date: string;
}

/* ──────────────────── Status Config ──────────────────── */
const STATUS_MAP: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string }
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

/* ──────────────────── Mock Data (exactly as image) ──────────────────── */
const ORDERS: Order[] = [
  {
    id: 1001,
    client: "22241857975",
    clientSub: "22241857975",
    produit: "Iphone PRO max",
    adresse: "Point E, rue 37",
    montant: 250000,
    status: "confirmee",
    date: "27/04/2026",
  },
  {
    id: 1002,
    client: "22241857975",
    clientSub: "22241857975",
    produit: "Protéine Premium",
    adresse: "Pikine rue, 10",
    montant: 50000,
    status: "en_attente",
    date: "27/04/2026",
  },
  {
    id: 1003,
    client: "22241857975",
    clientSub: "22241857975",
    produit: "Protéine Premium",
    adresse: "rue, 10 pikine",
    montant: 50000,
    status: "confirmee",
    date: "26/04/2026",
  },
];

/* ──────────────────── Helpers ──────────────────── */
function formatMontant(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " F";
}

/* ──────────────────── Custom CSS (pixel-perfect) ──────────────────── */
const styles = `
  /* Stats card */
  .cmd-stat {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 16px 20px;
    transition: box-shadow 0.2s ease;
  }
  .cmd-stat:hover {
    box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  }

  /* Table container */
  .cmd-table-wrap {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    overflow: hidden;
  }

  /* Header cell */
  .cmd-th {
    padding: 11px 16px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #6b7280;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    text-align: left;
    white-space: nowrap;
    user-select: none;
  }

  /* Data cell */
  .cmd-td {
    padding: 14px 16px;
    font-size: 13.5px;
    color: #111827;
    border-bottom: 1px solid #f3f4f6;
    line-height: 1.45;
  }

  /* Row hover */
  .cmd-tr {
    transition: background-color 0.1s ease;
  }
  .cmd-tr:hover {
    background-color: #fafbfc;
  }

  /* Status badge */
  .cmd-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    border-width: 1px;
    border-style: solid;
    line-height: 1.3;
    cursor: pointer;
    transition: opacity 0.12s ease;
  }
  .cmd-badge:hover {
    opacity: 0.85;
  }

  /* Action button */
  .cmd-action {
    width: 30px;
    height: 30px;
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
  .cmd-action:hover {
    background: #f3f4f6;
    color: #374151;
  }
  .cmd-action--danger:hover {
    background: #fef2f2;
    color: #ef4444;
  }

  /* Primary button */
  .cmd-btn {
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
  .cmd-btn:hover {
    background: #059669;
    box-shadow: 0 2px 8px rgba(16,185,129,0.3);
  }

  /* Scrollbar */
  .cmd-scroll::-webkit-scrollbar {
    height: 4px;
  }
  .cmd-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .cmd-scroll::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }
`;

/* ──────────────────── Main Component ──────────────────── */
export default function CommandesPage() {
  const [orders] = useState<Order[]>(ORDERS);

  /* Stats computed from data */
  const total = orders.length;
  const confirmed = orders.filter((o) => o.status === "confirmee").length;
  const delivered = orders.filter((o) => o.status === "livree").length;
  const revenue = orders.reduce((s, o) => s + o.montant, 0);

  const stats = [
    { label: "Total", value: total.toString(), icon: FileText, color: "#6366f1", bg: "#eef2ff" },
    { label: "Confirmées", value: confirmed.toString(), icon: CheckCircle2, color: "#10b981", bg: "#ecfdf5" },
    { label: "Livrées", value: delivered.toString(), icon: Package, color: "#f59e0b", bg: "#fffbeb" },
    { label: "Chiffre d'aff.", value: formatMontant(revenue), icon: TrendingUp, color: "#8b5cf6", bg: "#f5f3ff" },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div className="max-w-6xl mx-auto">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 leading-tight tracking-tight">
              Commandes & Ventes
            </h1>
            <p className="text-[13px] text-gray-500 mt-1">
              Suivi de vos ventes et commandes clients
            </p>
          </div>
          <button className="cmd-btn">
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Nouvelle commande
          </button>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="cmd-stat">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: stat.bg }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-[22px] font-bold text-gray-900 leading-none">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Table ── */}
        <div className="cmd-table-wrap">
          <div className="overflow-x-auto cmd-scroll">
            <table className="w-full min-w-[680px]">
              <thead>
                <tr>
                  <th className="cmd-th">Client</th>
                  <th className="cmd-th">Produit</th>
                  <th className="cmd-th">Adresse</th>
                  <th className="cmd-th text-right">Montant</th>
                  <th className="cmd-th">Statut</th>
                  <th className="cmd-th">Date</th>
                  <th className="cmd-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const st = STATUS_MAP[order.status];
                  return (
                    <tr key={order.id} className="cmd-tr">
                      {/* Client */}
                      <td className="cmd-td">
                        <p className="font-medium text-gray-900 text-[13px]">{order.client}</p>
                        <p className="text-[12px] text-gray-400 mt-0.5">{order.clientSub}</p>
                      </td>
                      {/* Produit */}
                      <td className="cmd-td">
                        <span className="text-gray-800">{order.produit}</span>
                      </td>
                      {/* Adresse */}
                      <td className="cmd-td">
                        <span className="text-gray-500 text-[13px]">{order.adresse}</span>
                      </td>
                      {/* Montant */}
                      <td className="cmd-td text-right">
                        <span className="font-semibold text-gray-900">
                          {formatMontant(order.montant)}
                        </span>
                      </td>
                      {/* Statut */}
                      <td className="cmd-td">
                        <span className={`cmd-badge ${st.bg} ${st.text} ${st.border}`}>
                          {st.label}
                          <ChevronDown className="w-3 h-3 opacity-60" />
                        </span>
                      </td>
                      {/* Date */}
                      <td className="cmd-td">
                        <span className="text-gray-500 text-[13px]">{order.date}</span>
                      </td>
                      {/* Actions */}
                      <td className="cmd-td text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <button className="cmd-action" title="Voir">
                            <Eye className="w-[15px] h-[15px]" />
                          </button>
                          <button className="cmd-action" title="Modifier">
                            <Pencil className="w-[14px] h-[14px]" />
                          </button>
                          <button className="cmd-action cmd-action--danger" title="Supprimer">
                            <Trash2 className="w-[14px] h-[14px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {orders.length === 0 && (
            <div className="py-16 text-center">
              <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">Aucune commande</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
