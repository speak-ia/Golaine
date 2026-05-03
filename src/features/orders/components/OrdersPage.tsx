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
  MapPin,
  Phone,
  Calendar,
  Banknote,
  ShoppingBag,
  Check,
} from "lucide-react";
import type { OrderStatus } from "@shared/constants/status";
import type { Order } from "@shared/types/domainTypes";
import { ordersService } from "@features/orders/service";
import { useServiceQuery } from "@shared/hooks/useServiceQuery";
import { ORDER_STATUS, ORDER_STATUSES } from "@shared/constants/status";
import { formatFCFA, formatPageRange } from "@shared/utils/format";
import { cn } from "@shared/utils/cn";
import { usePagination } from "@shared/hooks/usePagination";
import { StatCard } from "@shared/components/feedback/StatCard";
import { Pagination } from "@shared/components/feedback/Pagination";
import { EmptyState } from "@shared/components/feedback/EmptyState";
import { StatusPill } from "@shared/components/feedback/StatusPill";
import { ConfirmModal } from "@shared/components/feedback/ConfirmModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/components/ui/dialog";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";

type ModalType = "view" | "edit" | "delete" | null;

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = ORDER_STATUSES.map((value) => ({
  value,
  label: ORDER_STATUS[value].label,
}));

const ITEMS_PER_PAGE = 5;

function OrderViewBody({ order }: { order: Order }) {
  const st = ORDER_STATUS[order.status];
  return (
    <div className="space-y-1 text-gray-900">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50">
          <FileText className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Commande</p>
          <p className="text-[15px] font-bold">#{order.id}</p>
        </div>
        <div className="ml-auto">
          <StatusPill label={st.label} tone={st} size="sm" />
        </div>
      </div>
      {[
        { Icon: Phone, wrap: "bg-indigo-50", ic: "text-indigo-600", label: "Client", val: order.client },
        { Icon: ShoppingBag, wrap: "bg-amber-50", ic: "text-amber-600", label: "Produit", val: order.produit },
        { Icon: MapPin, wrap: "bg-emerald-50", ic: "text-emerald-600", label: "Adresse de livraison", val: order.adresse },
        {
          Icon: Banknote,
          wrap: "bg-red-50",
          ic: "text-red-500",
          label: "Montant",
          val: <span className="text-base font-bold text-emerald-600">{formatFCFA(order.montant)}</span>,
        },
        { Icon: Calendar, wrap: "bg-violet-50", ic: "text-violet-600", label: "Date", val: order.date },
      ].map((row, i) => (
        <div key={i} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", row.wrap)}>
            <row.Icon className={cn("w-4 h-4", row.ic)} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{row.label}</p>
            <div className="text-sm font-medium text-gray-900 mt-0.5">{row.val}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function OrderEditBody({
  order,
  onSave,
  onClose,
}: {
  order: Order;
  onSave: (_o: Order) => void;
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
    <>
      <div className="space-y-4 py-2">
        <div>
          <Label>Client</Label>
          <Input className="mt-1" value={client} onChange={(e) => setClient(e.target.value)} placeholder="Numéro du client" />
        </div>
        <div>
          <Label>Produit</Label>
          <Input className="mt-1" value={produit} onChange={(e) => setProduit(e.target.value)} placeholder="Nom du produit" />
        </div>
        <div>
          <Label>Adresse de livraison</Label>
          <textarea
            className="mt-1 w-full min-h-[72px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            placeholder="Adresse complète"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Montant (FCFA)</Label>
            <Input type="number" className="mt-1" value={montant} onChange={(e) => setMontant(e.target.value)} />
          </div>
          <div>
            <Label>Statut</Label>
            <select
              className="mt-1 w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm"
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
      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="button" className="bg-brand hover:bg-brand-dark text-white" onClick={handleSave}>
          <Check className="w-4 h-4 mr-2" />
          Enregistrer
        </Button>
      </DialogFooter>
    </>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const loadOrders = useCallback(() => ordersService.list(), []);
  const onOrdersSuccess = useCallback((data: Order[]) => {
    setOrders(data);
  }, []);
  const { state: loadState } = useServiceQuery(loadOrders, {
    showToastOnError: true,
    onSuccess: onOrdersSuccess,
  });
  const [activeModal, setActiveModal] = useState<{
    type: ModalType;
    order: Order | null;
  }>({ type: null, order: null });

  const {
    page: safePage,
    setPage: setCurrentPage,
    totalPages,
    slice: paginatedOrders,
    resetPage,
  } = usePagination(orders, ITEMS_PER_PAGE);

  const openModal = useCallback((type: ModalType, order: Order) => {
    setActiveModal({ type, order });
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal({ type: null, order: null });
  }, []);

  const handleSave = useCallback(
    (updated: Order) => {
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      closeModal();
    },
    [closeModal]
  );

  const handleDelete = useCallback(() => {
    if (!activeModal.order) return;
    const id = activeModal.order.id;
    setOrders((prev) => prev.filter((o) => o.id !== id));
    resetPage();
    closeModal();
  }, [activeModal.order, closeModal, resetPage]);

  const { type: modalType, order: selectedOrder } = activeModal;

  const total = orders.length;
  const confirmed = orders.filter((o) => o.status === "confirmee").length;
  const delivered = orders.filter((o) => o.status === "livree").length;
  const revenue = orders.reduce((s, o) => s + o.montant, 0);

  const stats = [
    { label: "Total", value: total.toString(), icon: FileText, color: "#6366f1", bg: "#eef2ff" },
    { label: "Confirmées", value: confirmed.toString(), icon: CheckCircle2, color: "#10b981", bg: "#ecfdf5" },
    { label: "Livrées", value: delivered.toString(), icon: Package, color: "#f59e0b", bg: "#fffbeb" },
    { label: "Chiffre d'aff.", value: formatFCFA(revenue), icon: TrendingUp, color: "#8b5cf6", bg: "#f5f3ff" },
  ];

  const STATUS_CYCLE: OrderStatus[] = [
    "en_attente",
    "confirmee",
    "en_preparation",
    "livree",
    "annulee",
  ];

  const ordersLoading =
    loadState.status === "loading" && orders.length === 0;

  return (
    <div className="w-full">
      {ordersLoading ? (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
          Chargement des commandes…
        </div>
      ) : null}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[22px] font-bold leading-tight tracking-tight text-gray-900">
            Commandes & Ventes
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">Suivi de vos ventes et commandes clients</p>
        </div>
        <Button className="w-full shrink-0 cursor-pointer gap-2 bg-brand font-semibold text-white shadow-sm hover:bg-brand-dark sm:w-auto">
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Nouvelle commande
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            variant="compact"
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            iconColor={stat.color}
            iconBg={stat.bg}
          />
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-[14%]" />
              <col className="w-[16%]" />
              <col className="w-[20%]" />
              <col className="w-[14%]" />
              <col className="w-[14%]" />
              <col className="w-[12%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Client", "Produit", "Adresse", "Montant", "Statut", "Date", "Actions"].map((h) => (
                  <th
                    key={h}
                    className={cn(
                      "px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider",
                      (h === "Montant" || h === "Actions") && "text-right"
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => {
                const st = ORDER_STATUS[order.status];
                return (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3 align-top">
                      <p className="font-medium text-gray-900 text-[13px]">{order.client}</p>
                      <p className="text-[12px] text-gray-400 mt-0.5">{order.clientSub}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-800">{order.produit}</td>
                    <td className="px-4 py-3 text-gray-500 text-[13px]">{order.adresse}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatFCFA(order.montant)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 cursor-pointer"
                        title="Changer le statut"
                        onClick={() => {
                          const currentIdx = STATUS_CYCLE.indexOf(order.status);
                          const nextIdx = (currentIdx + 1) % STATUS_CYCLE.length;
                          const next = STATUS_CYCLE[nextIdx];
                          setOrders((prev) =>
                            prev.map((o) => (o.id === order.id ? { ...o, status: next } : o))
                          );
                        }}
                      >
                        <StatusPill label={st.label} tone={st} size="sm" />
                        <ChevronDown className="w-3 h-3 text-gray-400 opacity-60" />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-[13px]">{order.date}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Voir" onClick={() => openModal("view", order)}>
                          <Eye className="w-[15px] h-[15px]" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Modifier" onClick={() => openModal("edit", order)}>
                          <Pencil className="w-[14px] h-[14px]" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title="Supprimer" onClick={() => openModal("delete", order)}>
                          <Trash2 className="w-[14px] h-[14px]" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <EmptyState icon={FileText} title="Aucune commande" description="Les commandes apparaîtront ici." />
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination page={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
          <p className="mt-2 text-center text-xs text-gray-400">
            {formatPageRange(
              (safePage - 1) * ITEMS_PER_PAGE + 1,
              Math.min(safePage * ITEMS_PER_PAGE, orders.length),
              orders.length
            )}{" "}
            commandes
          </p>
        </div>
      )}

      <Dialog open={modalType === "view" && !!selectedOrder} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent className="sm:max-w-md bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle>Détails de la commande</DialogTitle>
            <DialogDescription className="sr-only">Informations complètes</DialogDescription>
          </DialogHeader>
          {selectedOrder && <OrderViewBody order={selectedOrder} />}
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalType === "edit" && !!selectedOrder} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent className="sm:max-w-md bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle>Modifier la commande #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <OrderEditBody order={selectedOrder} onSave={handleSave} onClose={closeModal} />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={modalType === "delete" && !!selectedOrder}
        title="Supprimer la commande"
        message={
          selectedOrder
            ? `La commande #${selectedOrder.id} pour ${selectedOrder.produit} sera définitivement supprimée. Cette action est irréversible.`
            : ""
        }
        confirmLabel="Supprimer"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={closeModal}
      />
    </div>
  );
}
