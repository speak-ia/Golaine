"use client";

import { useState, useCallback } from "react";
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
  X,
  MapPin,
  Phone,
  Calendar,
  Banknote,
  ShoppingBag,
  AlertTriangle,
  Check,
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

type ModalType = "view" | "edit" | "delete" | null;

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

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "en_attente", label: "En attente" },
  { value: "confirmee", label: "Confirmée" },
  { value: "en_preparation", label: "En préparation" },
  { value: "livree", label: "Livrée" },
  { value: "annulee", label: "Annulée" },
];

/* ──────────────────── Mock Data ──────────────────── */
const INITIAL_ORDERS: Order[] = [
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

/* ──────────────────── Custom CSS ──────────────────── */
const styles = `
  /* Stats card */
  .cmd-stat {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 18px 22px;
    transition: box-shadow 0.2s ease, transform 0.2s ease;
    height: 100%;
  }
  .cmd-stat:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.07);
    transform: translateY(-1px);
  }

  /* Table container */
  .cmd-table-wrap {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
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

  /* Modal overlay */
  .cmd-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    animation: cmd-fadeIn 0.18s ease;
  }

  /* Modal box */
  .cmd-modal {
    background: #ffffff;
    border-radius: 14px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08);
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    animation: cmd-slideUp 0.22s ease;
  }
  .cmd-modal--sm { max-width: 440px; }
  .cmd-modal--md { max-width: 540px; }

  /* Modal header */
  .cmd-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 16px;
    border-bottom: 1px solid #f3f4f6;
  }
  .cmd-modal-header h3 {
    font-size: 16px;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }

  /* Modal close button */
  .cmd-modal-close {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #9ca3af;
    transition: background 0.12s ease, color 0.12s ease;
  }
  .cmd-modal-close:hover {
    background: #f3f4f6;
    color: #374151;
  }

  /* Modal body */
  .cmd-modal-body {
    padding: 20px 24px 24px;
  }

  /* Detail row */
  .cmd-detail-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #f9fafb;
  }
  .cmd-detail-row:last-child {
    border-bottom: none;
  }
  .cmd-detail-icon {
    width: 36px;
    height: 36px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .cmd-detail-label {
    font-size: 11.5px;
    font-weight: 600;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 2px;
  }
  .cmd-detail-value {
    font-size: 14px;
    font-weight: 500;
    color: #111827;
  }

  /* Form group */
  .cmd-form-group {
    margin-bottom: 18px;
  }
  .cmd-form-group:last-child {
    margin-bottom: 0;
  }
  .cmd-form-label {
    display: block;
    font-size: 12.5px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 6px;
  }
  .cmd-form-input,
  .cmd-form-select,
  .cmd-form-textarea {
    width: 100%;
    padding: 10px 14px;
    font-size: 13.5px;
    color: #111827;
    background: #ffffff;
    border: 1.5px solid #e5e7eb;
    border-radius: 8px;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
    font-family: inherit;
  }
  .cmd-form-input:focus,
  .cmd-form-select:focus,
  .cmd-form-textarea:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
  }
  .cmd-form-textarea {
    resize: vertical;
    min-height: 70px;
  }

  /* Modal footer */
  .cmd-modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 24px;
    border-top: 1px solid #f3f4f6;
  }

  /* Secondary button */
  .cmd-btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 18px;
    border-radius: 8px;
    background: #ffffff;
    color: #374151;
    font-size: 13px;
    font-weight: 600;
    border: 1.5px solid #e5e7eb;
    cursor: pointer;
    transition: background 0.12s ease, border-color 0.12s ease;
  }
  .cmd-btn-secondary:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }

  /* Danger button */
  .cmd-btn-danger {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 18px;
    border-radius: 8px;
    background: #ef4444;
    color: #ffffff;
    font-size: 13px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: background 0.15s ease, box-shadow 0.15s ease;
  }
  .cmd-btn-danger:hover {
    background: #dc2626;
    box-shadow: 0 2px 8px rgba(239,68,68,0.3);
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

  /* Animations */
  @keyframes cmd-fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes cmd-slideUp {
    from { opacity: 0; transform: translateY(12px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
`;

/* ──────────────────── View Modal ──────────────────── */
function ViewModal({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const st = STATUS_MAP[order.status];

  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div
        className="cmd-modal cmd-modal--md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cmd-modal-header">
          <h3>Détails de la commande</h3>
          <button className="cmd-modal-close" onClick={onClose}>
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* Body */}
        <div className="cmd-modal-body">
          {/* Order ID */}
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#ecfdf5" }}
            >
              <FileText className="w-4 h-4" style={{ color: "#10b981" }} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Commande
              </p>
              <p className="text-[15px] font-bold text-gray-900">
                #{order.id}
              </p>
            </div>
            <div className="ml-auto">
              <span className={`cmd-badge ${st.bg} ${st.text} ${st.border}`}>
                {st.label}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="cmd-detail-row">
            <div
              className="cmd-detail-icon"
              style={{ backgroundColor: "#eef2ff" }}
            >
              <Phone className="w-[16px] h-[16px]" style={{ color: "#6366f1" }} />
            </div>
            <div>
              <p className="cmd-detail-label">Client</p>
              <p className="cmd-detail-value">{order.client}</p>
            </div>
          </div>

          <div className="cmd-detail-row">
            <div
              className="cmd-detail-icon"
              style={{ backgroundColor: "#fffbeb" }}
            >
              <ShoppingBag
                className="w-[16px] h-[16px]"
                style={{ color: "#f59e0b" }}
              />
            </div>
            <div>
              <p className="cmd-detail-label">Produit</p>
              <p className="cmd-detail-value">{order.produit}</p>
            </div>
          </div>

          <div className="cmd-detail-row">
            <div
              className="cmd-detail-icon"
              style={{ backgroundColor: "#ecfdf5" }}
            >
              <MapPin className="w-[16px] h-[16px]" style={{ color: "#10b981" }} />
            </div>
            <div>
              <p className="cmd-detail-label">Adresse de livraison</p>
              <p className="cmd-detail-value">{order.adresse}</p>
            </div>
          </div>

          <div className="cmd-detail-row">
            <div
              className="cmd-detail-icon"
              style={{ backgroundColor: "#fef2f2" }}
            >
              <Banknote
                className="w-[16px] h-[16px]"
                style={{ color: "#ef4444" }}
              />
            </div>
            <div>
              <p className="cmd-detail-label">Montant</p>
              <p className="cmd-detail-value text-[16px] font-bold" style={{ color: "#10b981" }}>
                {formatMontant(order.montant)}
              </p>
            </div>
          </div>

          <div className="cmd-detail-row">
            <div
              className="cmd-detail-icon"
              style={{ backgroundColor: "#f5f3ff" }}
            >
              <Calendar
                className="w-[16px] h-[16px]"
                style={{ color: "#8b5cf6" }}
              />
            </div>
            <div>
              <p className="cmd-detail-label">Date</p>
              <p className="cmd-detail-value">{order.date}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="cmd-modal-footer">
          <button className="cmd-btn-secondary" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────── Edit Modal ──────────────────── */
function EditModal({
  order,
  onSave,
  onClose,
}: {
  order: Order;
  onSave: (updated: Order) => void;
  onClose: () => void;
}) {
  const [client, setClient] = useState(order.client);
  const [produit, setProduit] = useState(order.produit);
  const [adresse, setAdresse] = useState(order.adresse);
  const [montant, setMontant] = useState(order.montant.toString());
  const [status, setStatus] = useState<OrderStatus>(order.status);

  const handleSave = () => {
    if (!client.trim() || !produit.trim() || !adresse.trim() || !montant) return;
    onSave({
      ...order,
      client: client.trim(),
      produit: produit.trim(),
      adresse: adresse.trim(),
      montant: parseInt(montant, 10) || 0,
      status,
    });
  };

  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div
        className="cmd-modal cmd-modal--md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cmd-modal-header">
          <h3>Modifier la commande #{order.id}</h3>
          <button className="cmd-modal-close" onClick={onClose}>
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* Body */}
        <div className="cmd-modal-body">
          <div className="cmd-form-group">
            <label className="cmd-form-label">Client</label>
            <input
              type="text"
              className="cmd-form-input"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Numéro du client"
            />
          </div>

          <div className="cmd-form-group">
            <label className="cmd-form-label">Produit</label>
            <input
              type="text"
              className="cmd-form-input"
              value={produit}
              onChange={(e) => setProduit(e.target.value)}
              placeholder="Nom du produit"
            />
          </div>

          <div className="cmd-form-group">
            <label className="cmd-form-label">Adresse de livraison</label>
            <textarea
              className="cmd-form-textarea"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              placeholder="Adresse complète"
              rows={2}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="cmd-form-group">
              <label className="cmd-form-label">Montant (F)</label>
              <input
                type="number"
                className="cmd-form-input"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="cmd-form-group">
              <label className="cmd-form-label">Statut</label>
              <select
                className="cmd-form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="cmd-modal-footer">
          <button className="cmd-btn-secondary" onClick={onClose}>
            Annuler
          </button>
          <button className="cmd-btn" onClick={handleSave}>
            <Check className="w-4 h-4" strokeWidth={2.5} />
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────── Delete Modal ──────────────────── */
function DeleteModal({
  order,
  onConfirm,
  onClose,
}: {
  order: Order;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div
        className="cmd-modal cmd-modal--sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cmd-modal-header">
          <h3>Supprimer la commande</h3>
          <button className="cmd-modal-close" onClick={onClose}>
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* Body */}
        <div className="cmd-modal-body" style={{ textAlign: "center", padding: "28px 24px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "#fef2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <AlertTriangle className="w-7 h-7" style={{ color: "#ef4444" }} />
          </div>
          <p style={{ fontSize: "15px", fontWeight: 600, color: "#111827", margin: "0 0 6px" }}>
            Êtes-vous sûr ?
          </p>
          <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.5, margin: "0" }}>
            La commande <strong>#{order.id}</strong> pour{" "}
            <strong>{order.produit}</strong> sera définitivement supprimée.
            Cette action est irréversible.
          </p>
        </div>

        {/* Footer */}
        <div className="cmd-modal-footer" style={{ justifyContent: "center" }}>
          <button className="cmd-btn-secondary" onClick={onClose}>
            Annuler
          </button>
          <button className="cmd-btn-danger" onClick={onConfirm}>
            <Trash2 className="w-4 h-4" strokeWidth={2} />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────── Main Component ──────────────────── */
export default function CommandesPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [activeModal, setActiveModal] = useState<{
    type: ModalType;
    order: Order | null;
  }>({ type: null, order: null });

  /* Stats */
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

  /* Modal handlers */
  const openModal = useCallback((type: ModalType, order: Order) => {
    setActiveModal({ type, order });
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal({ type: null, order: null });
  }, []);

  const handleSave = useCallback(
    (updated: Order) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o))
      );
      closeModal();
    },
    [closeModal]
  );

  const handleDelete = useCallback(() => {
    if (!activeModal.order) return;
    setOrders((prev) => prev.filter((o) => o.id !== activeModal.order!.id));
    closeModal();
  }, [activeModal.order, closeModal]);

  const { type: modalType, order: selectedOrder } = activeModal;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div className="w-full">
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
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
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
            <table className="w-full" style={{ tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "14%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>
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
                          <button
                            className="cmd-action"
                            title="Voir"
                            onClick={() => openModal("view", order)}
                          >
                            <Eye className="w-[15px] h-[15px]" />
                          </button>
                          <button
                            className="cmd-action"
                            title="Modifier"
                            onClick={() => openModal("edit", order)}
                          >
                            <Pencil className="w-[14px] h-[14px]" />
                          </button>
                          <button
                            className="cmd-action cmd-action--danger"
                            title="Supprimer"
                            onClick={() => openModal("delete", order)}
                          >
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

      {/* ── Modals ── */}
      {modalType === "view" && selectedOrder && (
        <ViewModal order={selectedOrder} onClose={closeModal} />
      )}
      {modalType === "edit" && selectedOrder && (
        <EditModal order={selectedOrder} onSave={handleSave} onClose={closeModal} />
      )}
      {modalType === "delete" && selectedOrder && (
        <DeleteModal order={selectedOrder} onConfirm={handleDelete} onClose={closeModal} />
      )}
    </>
  );
}
