"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  AlertTriangle,
  X,
  Eye,
  ImageIcon,
  TrendingUp,
  BarChart3,
  LayoutGrid,
  List,
  Tag,
  Check,
  Bot,
  Smartphone,
} from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Switch } from "@shared/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { agentsService } from "@features/agents/service";
import { MOCK_AGENTS_IA } from "@features/agents/data/mockAgents";
import { productsService } from "@features/products/service";
import { useProductStore } from "@features/products/store/productStore";
import { toastIfFailed } from "@shared/utils/toastResult";
import { toast } from "sonner";
import type { AgentIA, Product } from "@shared/types/domainTypes";
import { useServiceQuery } from "@shared/hooks/useServiceQuery";
import { formatFCFA } from "@shared/utils/format";
import { matchesQuery } from "@shared/utils/filter";
import { hashIndex } from "@shared/utils/text";
import { usePagination } from "@shared/hooks/usePagination";
import { useImageUpload } from "@shared/hooks/useImageUpload";
import { PageHeader } from "@shared/components/feedback/PageHeader";
import { SearchInput } from "@shared/components/feedback/SearchInput";
import { EmptyState } from "@shared/components/feedback/EmptyState";
import { StatCard } from "@shared/components/feedback/StatCard";
import { Pagination } from "@shared/components/feedback/Pagination";

interface ProductFormData {
  name: string;
  price: string;
  category: string;
  stock: string;
  status: boolean;
  image: string;
  assignedAgent: string;
}

/* ──────────────────── Helpers ──────────────────── */
function getAgentIA(id: string | null, agents: AgentIA[]) {
  if (!id) return undefined;
  return agents.find((a) => a.id === id);
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  price: "",
  category: "",
  stock: "",
  status: true,
  image: "",
  assignedAgent: "all",
};

const STATUS_FILTERS = [
  { value: "tous", label: "Tous" },
  { value: "actif", label: "Actif" },
  { value: "inactif", label: "Inactif" },
  { value: "rupture", label: "Rupture de stock" },
] as const;

const ITEMS_PER_PAGE = 8;

const COLOR_POOL = [
  { bg: "bg-purple-50", text: "text-purple-700", accent: "from-purple-500/10 to-transparent" },
  { bg: "bg-amber-50", text: "text-amber-700", accent: "from-amber-500/10 to-transparent" },
  { bg: "bg-green-50", text: "text-green-700", accent: "from-green-500/10 to-transparent" },
  { bg: "bg-pink-50", text: "text-pink-700", accent: "from-pink-500/10 to-transparent" },
  { bg: "bg-sky-50", text: "text-sky-700", accent: "from-sky-500/10 to-transparent" },
  { bg: "bg-rose-50", text: "text-rose-700", accent: "from-rose-500/10 to-transparent" },
  { bg: "bg-indigo-50", text: "text-indigo-700", accent: "from-indigo-500/10 to-transparent" },
  { bg: "bg-teal-50", text: "text-teal-700", accent: "from-teal-500/10 to-transparent" },
  { bg: "bg-orange-50", text: "text-orange-700", accent: "from-orange-500/10 to-transparent" },
  { bg: "bg-cyan-50", text: "text-cyan-700", accent: "from-cyan-500/10 to-transparent" },
];

function getCategoryBg(name: string): string {
  return COLOR_POOL[hashIndex(name, COLOR_POOL.length)]?.bg || "bg-gray-50";
}

function getCategoryText(name: string): string {
  return COLOR_POOL[hashIndex(name, COLOR_POOL.length)]?.text || "text-gray-700";
}

function getCategoryAccent(name: string): string {
  return COLOR_POOL[hashIndex(name, COLOR_POOL.length)]?.accent || "from-gray-100 to-transparent";
}

function getStockBadge(stock: number) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-700">
        <X className="w-3 h-3" />
        Rupture
      </span>
    );
  }
  if (stock < 10) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-orange-50 text-orange-700">
        <AlertTriangle className="w-3 h-3" />
        Stock faible
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700">
      En stock
    </span>
  );
}

function productToForm(p: Product): ProductFormData {
  return {
    name: p.name,
    price: String(p.price),
    category: p.category,
    stock: String(p.stock),
    status: p.status === "actif",
    image: p.image,
    assignedAgent: p.assignedAgent || "all",
  };
}

/* ──────────────────── Category Manager Component ──────────────────── */
const CategoryManager = React.memo(function CategoryManager({
  onRenameCategory,
  onDeleteCategory,
}: {
  onRenameCategory: (_old: string, _new: string) => Promise<void>;
  onDeleteCategory: (_name: string) => Promise<void>;
}) {
  const { categories, addCategory } = useProductStore();
  const [newCatName, setNewCatName] = useState("");
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function handleAdd() {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return;
    addCategory(trimmed);
    setNewCatName("");
  }

  function handleStartEdit(name: string) {
    setEditingCat(name);
    setEditValue(name);
  }

  async function handleSaveEdit() {
    const trimmed = editValue.trim();
    if (!trimmed || !editingCat) return;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase() && c !== editingCat)) return;
    await onRenameCategory(editingCat, trimmed);
    setEditingCat(null);
    setEditValue("");
  }

  async function handleConfirmDelete(name: string) {
    await onDeleteCategory(name);
    setDeleteConfirm(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Nouvelle catégorie..."
          className="h-9 text-sm"
        />
        <Button
          onClick={handleAdd}
          disabled={!newCatName.trim()}
          size="sm"
          className="h-9 bg-brand hover:bg-brand-dark text-white font-medium cursor-pointer gap-1.5 px-3"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </Button>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
        {categories.map((cat) => (
          <div
            key={cat}
            className="group flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className={`inline-flex w-3 h-3 rounded-full ${getCategoryBg(cat)}`} />
            {editingCat === cat ? (
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit();
                  if (e.key === "Escape") { setEditingCat(null); setEditValue(""); }
                }}
                autoFocus
                className="h-7 text-sm flex-1"
              />
            ) : (
              <span className="flex-1 text-sm font-medium text-gray-800">{cat}</span>
            )}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {editingCat === cat ? (
                <>
                  <button
                    onClick={handleSaveEdit}
                    className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-emerald-50 transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  </button>
                  <button
                    onClick={() => { setEditingCat(null); setEditValue(""); }}
                    className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </>
              ) : deleteConfirm === cat ? (
                <>
                  <span className="text-[11px] text-red-500 font-medium mr-1">Supprimer ?</span>
                  <button
                    onClick={() => handleConfirmDelete(cat)}
                    className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-red-500" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleStartEdit(cat)}
                    className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3 h-3 text-gray-400" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(cat)}
                    className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Tag className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Aucune catégorie</p>
          </div>
        )}
      </div>
    </div>
  );
});

/* ──────────────────── Product Form ──────────────────── */
function ProductForm({
  form,
  setForm,
  categories,
  agents,
}: {
  form: ProductFormData;
  setForm: React.Dispatch<React.SetStateAction<ProductFormData>>;
  categories: string[];
  agents: AgentIA[];
}) {
  const { inputRef: productImageInputRef, open: openProductImage, onChange: onProductImageChange } =
    useImageUpload({
      onLoaded: (url) => setForm((prev) => ({ ...prev, image: url })),
    });

  return (
    <div className="space-y-4">
      {/* Image upload */}
      <div className="space-y-2">
        <Label className="text-gray-700">Image du produit</Label>
        <input
          ref={productImageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onProductImageChange}
        />
        <div
          onClick={openProductImage}
          className="relative w-full h-40 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors group"
        >
          {form.image ? (
            <>
              <img
                src={form.image}
                alt="Aperçu"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex flex-col items-center gap-1 text-white">
                  <Pencil className="w-5 h-5" />
                  <span className="text-xs font-medium">Changer l&apos;image</span>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setForm((prev) => ({ ...prev, image: "" }));
                }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-emerald-500 transition-colors">
              <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                <ImageIcon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium">Cliquez pour uploader une image</span>
              <span className="text-[10px] text-gray-300">PNG, JPG, WebP — Max 5 Mo</span>
            </div>
          )}
        </div>
      </div>

      {/* Nom */}
      <div className="space-y-2">
        <Label htmlFor="prod-name" className="text-gray-700">
          Nom du produit
        </Label>
        <Input
          id="prod-name"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Ex: Robe Wax S-400"
          className="h-10"
        />
      </div>

      {/* Prix & Stock row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="prod-price" className="text-gray-700">
            Prix (FCFA)
          </Label>
          <Input
            id="prod-price"
            type="number"
            min="0"
            value={form.price}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, price: e.target.value }))
            }
            placeholder="5 000"
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prod-stock" className="text-gray-700">
            Stock
          </Label>
          <Input
            id="prod-stock"
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, stock: e.target.value }))
            }
            placeholder="25"
            className="h-10"
          />
        </div>
      </div>

      {/* Agent IA assigné */}
      <div className="space-y-2">
        <Label className="text-gray-700 flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-gray-400" />
          Agent IA assigné
        </Label>
        <Select
          value={form.assignedAgent}
          onValueChange={(val) =>
            setForm((prev) => ({ ...prev, assignedAgent: val }))
          }
        >
          <SelectTrigger className="w-full h-10">
            <SelectValue placeholder="Choisir un agent IA" />
          </SelectTrigger>
          <SelectContent className="bg-white text-gray-900 border-gray-200">
            <SelectItem value="all">
              <span className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-gray-400" />
                Tous les agents IA
              </span>
            </SelectItem>
            {agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                <span className="flex items-center gap-2">
                  <Bot className={`w-4 h-4 ${agent.status === "connected" ? "text-emerald-500" : "text-gray-400"}`} />
                  <span className="flex flex-col">
                    <span className="text-sm font-medium">{agent.agentName || agent.slotName}</span>
                    {agent.agentName && (
                      <span className="text-[10px] text-gray-400">{agent.slotName}</span>
                    )}
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Catégorie */}
      <div className="space-y-2">
        <Label className="text-gray-700">Catégorie</Label>
        <Select
          value={form.category}
          onValueChange={(val) =>
            setForm((prev) => ({ ...prev, category: val }))
          }
        >
          <SelectTrigger className="w-full h-10">
            <SelectValue placeholder="Choisir une catégorie" />
          </SelectTrigger>
          <SelectContent className="bg-white text-gray-900 border-gray-200">
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Statut toggle */}
      <div className="flex items-center justify-between py-1">
        <div>
          <Label className="text-gray-700">Statut</Label>
          <p className="text-xs text-gray-500 mt-0.5">
            {form.status ? "Produit actif et visible" : "Produit masqué"}
          </p>
        </div>
        <Switch
          checked={form.status}
          onCheckedChange={(checked) =>
            setForm((prev) => ({ ...prev, status: checked }))
          }
          className="data-[state=checked]:bg-brand"
        />
      </div>
    </div>
  );
}

/* ──────────────────── Product Card (Grid View) ──────────────────── */
const ProductCard = React.memo(function ProductCard({
  product,
  agents,
  onView,
  onEdit,
  onDelete,
}: {
  product: Product;
  agents: AgentIA[];
  onView: (_p: Product) => void;
  onEdit: (_p: Product) => void;
  onDelete: (_p: Product) => void;
}) {
  const gradient = getCategoryAccent(product.category);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className={`relative h-52 bg-gradient-to-br ${gradient} overflow-hidden`}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-gray-300" />
          </div>
        )}
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span
            className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-semibold backdrop-blur-sm ${
              product.status === "actif"
                ? "bg-emerald-500/90 text-white"
                : "bg-gray-500/90 text-white"
            }`}
          >
            {product.status === "actif" ? "Actif" : "Inactif"}
          </span>
          {product.stock === 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-red-500/90 text-white backdrop-blur-sm">
              <X className="w-3 h-3" />
              Rupture
            </span>
          )}
          {product.stock > 0 && product.stock < 10 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-orange-500/90 text-white backdrop-blur-sm">
              <AlertTriangle className="w-3 h-3" />
              Stock faible
            </span>
          )}
        </div>

        {/* Hover action overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onView(product)}
              className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-blue-600" />
            </button>
            <button
              onClick={() => onEdit(product)}
              className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Pencil className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={() => onDelete(product)}
              className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 text-[15px] leading-snug line-clamp-2">
            {product.name}
          </h3>
        </div>

        <div className="mt-1.5">
          <p className="text-lg font-bold text-brand-dark">
            {formatFCFA(product.price)}
          </p>
        </div>

        {/* Agent IA assigné */}
        <div className="flex items-center gap-1.5 mt-2">
          {product.assignedAgent ? (() => {
            const agent = getAgentIA(product.assignedAgent, agents);
            return (
              <>
                <Bot className={`w-3.5 h-3.5 ${agent?.status === "connected" ? "text-emerald-500" : "text-gray-400"}`} />
                <span className="text-[11px] text-gray-500 truncate">
                  {agent?.agentName || agent?.slotName || "Agent IA"}
                </span>
              </>
            );
          })() : (
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5" />
              Tous les agents IA
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <span
            className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium ${getCategoryBg(product.category)} ${getCategoryText(product.category)}`}
          >
            {product.category}
          </span>
          {product.stock > 0 && (
            <span className="text-[11px] text-gray-400">
              {product.stock} en stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

/* ──────────────────── Product Row (List View) ──────────────────── */
const ProductRow = React.memo(function ProductRow({
  product,
  agents,
  onView,
  onEdit,
  onDelete,
}: {
  product: Product;
  agents: AgentIA[];
  onView: (_p: Product) => void;
  onEdit: (_p: Product) => void;
  onDelete: (_p: Product) => void;
}) {
  return (
    <div className="group bg-white rounded-xl border border-gray-100 p-3 hover:shadow-md hover:border-gray-200 transition-all duration-200 flex items-center gap-4">
      {/* Image */}
      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-gray-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm truncate">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${getCategoryBg(product.category)} ${getCategoryText(product.category)}`}
          >
            {product.category}
          </span>
          {getStockBadge(product.stock)}
        </div>
        {/* Agent IA assigné */}
        <div className="flex items-center gap-1.5 mt-1">
          {product.assignedAgent ? (() => {
            const agent = getAgentIA(product.assignedAgent, agents);
            return (
              <>
                <Bot className={`w-3 h-3 ${agent?.status === "connected" ? "text-emerald-500" : "text-gray-400"}`} />
                <span className="text-[11px] text-gray-500 truncate">
                  {agent?.agentName || agent?.slotName || "Agent IA"}
                </span>
              </>
            );
          })() : (
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <Smartphone className="w-3 h-3" />
              Tous les agents IA
            </span>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-brand-dark text-sm">{formatFCFA(product.price)}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{product.stock} en stock</p>
      </div>

      {/* Status */}
      <div className="flex-shrink-0">
        <span
          className={`inline-flex w-2 h-2 rounded-full ${
            product.status === "actif" ? "bg-emerald-500" : "bg-gray-300"
          }`}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onView(product)}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-blue-500" />
        </button>
        <button
          onClick={() => onEdit(product)}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <Pencil className="w-3.5 h-3.5 text-gray-500" />
        </button>
        <button
          onClick={() => onDelete(product)}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
        </button>
      </div>
    </div>
  );
});

/* ──────────────────── Main Component ──────────────────── */
export default function ProductsPage() {
  const products = useProductStore((s) => s.products);
  const categories = useProductStore((s) => s.categories);
  const setProducts = useProductStore((s) => s.setProducts);
  const setCategories = useProductStore((s) => s.setCategories);
  const addProduct = useProductStore((s) => s.addProduct);
  const updateProduct = useProductStore((s) => s.updateProduct);
  const deleteProduct = useProductStore((s) => s.deleteProduct);
  const renameCategory = useProductStore((s) => s.renameCategory);
  const deleteCategory = useProductStore((s) => s.deleteCategory);
  const [agentsList, setAgentsList] = useState<AgentIA[]>(MOCK_AGENTS_IA);

  const loadProducts = useCallback(() => productsService.list(), []);
  const loadAgents = useCallback(() => agentsService.list(), []);
  const mergeCategories = useCallback((items: Product[]) => {
    const fromDb = items.map((p) => p.category).filter(Boolean);
    const defaults = useProductStore.getState().categories.slice(0, 5);
    return [...new Set([...defaults, ...fromDb])];
  }, []);

  const onProductsSuccess = useCallback(
    (data: Product[]) => {
      setProducts(data);
      setCategories(mergeCategories(data));
    },
    [setProducts, setCategories, mergeCategories],
  );
  const onAgentsSuccess = useCallback((data: AgentIA[]) => {
    setAgentsList(data);
  }, []);
  useServiceQuery(loadProducts, {
    showToastOnError: true,
    onSuccess: onProductsSuccess,
  });
  useServiceQuery(loadAgents, {
    showToastOnError: true,
    onSuccess: onAgentsSuccess,
  });

  const [catModalOpen, setCatModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Toutes");
  const [statusFilter, setStatusFilter] = useState("tous");

  const [addOpen, setAddOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.status === "actif").length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock < 10).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    return { totalProducts, activeProducts, lowStock, outOfStock, totalValue };
  }, [products]);

  /* ── Filtered & Paginated ── */
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!matchesQuery(p, search, ["name", "category"])) return false;
      if (categoryFilter !== "Toutes" && p.category !== categoryFilter) return false;
      if (statusFilter === "actif" && p.status !== "actif") return false;
      if (statusFilter === "inactif" && p.status !== "inactif") return false;
      if (statusFilter === "rupture" && p.stock !== 0) return false;
      return true;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const {
    page: currentPage,
    setPage: setCurrentPage,
    totalPages,
    slice: paginatedProducts,
    resetPage,
  } = usePagination(filteredProducts, ITEMS_PER_PAGE);

  /* ── Handlers ── */
  const handleOpenView = useCallback((product: Product) => {
    setViewingProduct(product);
    setViewOpen(true);
  }, []);

  const handleOpenAdd = useCallback(() => {
    setFormData(EMPTY_FORM);
    setAddOpen(true);
  }, []);

  const handleSaveAdd = useCallback(async () => {
    if (!formData.name.trim() || !formData.price || Number(formData.price) <= 0) return;
    if (!formData.category) return;
    const payload = {
      name: formData.name.trim(),
      price: Number(formData.price) || 0,
      category: formData.category,
      stock: Number(formData.stock) || 0,
      image: formData.image,
      status: (formData.status ? "actif" : "inactif") as Product["status"],
      assignedAgent: formData.assignedAgent === "all" ? null : formData.assignedAgent,
    };
    const result = await productsService.create(payload);
    if (toastIfFailed(result)) return;
    addProduct(result.data);
    toast.success("Produit ajouté");
    setAddOpen(false);
    setFormData(EMPTY_FORM);
    resetPage();
  }, [formData, addProduct, resetPage]);

  const handleOpenEdit = useCallback((product: Product) => {
    setEditingProduct(product);
    setFormData(productToForm(product));
    setEditOpen(true);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingProduct || !formData.name.trim() || !formData.category) return;
    if (Number(formData.price) <= 0) return;
    const payload = {
      name: formData.name.trim(),
      price: Number(formData.price) || 0,
      category: formData.category,
      stock: Number(formData.stock) || 0,
      image: formData.image || editingProduct.image,
      status: (formData.status ? "actif" : "inactif") as Product["status"],
      assignedAgent: formData.assignedAgent === "all" ? null : formData.assignedAgent,
    };
    const result = await productsService.update(editingProduct.id, payload);
    if (toastIfFailed(result)) return;
    updateProduct(editingProduct.id, result.data);
    toast.success("Produit mis à jour");
    setEditOpen(false);
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
  }, [formData, editingProduct, updateProduct]);

  const handleOpenDelete = useCallback((product: Product) => {
    setDeletingProduct(product);
    setDeleteOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingProduct) return;
    const result = await productsService.remove(deletingProduct.id);
    if (toastIfFailed(result)) return;
    deleteProduct(deletingProduct.id);
    toast.success("Produit supprimé");
    setDeleteOpen(false);
    setDeletingProduct(null);
    const newFilteredLength = products.filter((p) => p.id !== deletingProduct.id).length;
    const newTotalPages = Math.max(1, Math.ceil(newFilteredLength / ITEMS_PER_PAGE));
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  }, [deletingProduct, deleteProduct, currentPage, products, setCurrentPage]);

  const handleRenameCategory = useCallback(
    async (oldName: string, newName: string) => {
      const result = await productsService.renameCategory(oldName, newName);
      if (toastIfFailed(result)) return;
      renameCategory(oldName, newName);
    },
    [renameCategory],
  );

  const handleDeleteCategory = useCallback(
    async (name: string) => {
      const remaining = categories.filter((c) => c !== name);
      const fallback = remaining[0] || "";
      const result = await productsService.deleteCategory(name, fallback);
      if (toastIfFailed(result)) return;
      deleteCategory(name);
    },
    [categories, deleteCategory],
  );

  const handleCategoryChange = useCallback((val: string) => {
    setCategoryFilter(val);
    resetPage();
  }, [resetPage]);

  const handleStatusChange = useCallback((val: string) => {
    setStatusFilter(val);
    resetPage();
  }, [resetPage]);

  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    resetPage();
  }, [resetPage]);

  /* ──────────────────── Render ──────────────────── */
  return (
    <div className="w-full space-y-6 text-gray-900">
      <PageHeader
        icon={Package}
        title="Mes Produits"
        subtitle={`${stats.totalProducts} produit${stats.totalProducts > 1 ? "s" : ""} au catalogue`}
        actions={
          <>
            <Button
              onClick={() => setCatModalOpen(true)}
              variant="outline"
              className="bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium cursor-pointer gap-2 border-gray-200"
            >
              <Tag className="w-4 h-4" />
              Catégories
              <span className="inline-flex w-5 h-5 rounded-full bg-gray-100 text-gray-600 items-center justify-center text-[11px] font-bold">
                {categories.length}
              </span>
            </Button>
            <Button
              onClick={handleOpenAdd}
              className="bg-brand hover:bg-brand-dark text-white font-semibold cursor-pointer gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Ajouter un produit
            </Button>
          </>
        }
      />

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard variant="compact" icon={Package} label="Total produits" value={stats.totalProducts} iconColor="#8B5CF6" iconBg="#F3F0FF" />
        <StatCard variant="compact" icon={TrendingUp} label="Produits actifs" value={stats.activeProducts} iconColor="#16A34A" iconBg="#E8F8EF" />
        <StatCard variant="compact" icon={AlertTriangle} label="Stock faible" value={stats.lowStock} iconColor="#F97316" iconBg="#FFF7ED" />
        <StatCard variant="compact" icon={BarChart3} label="Valeur stock" value={formatFCFA(stats.totalValue)} iconColor="#0EA5E9" iconBg="#F0F9FF" />
      </div>

      {/* ── Search & Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Rechercher un produit..."
        />
        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={handleCategoryChange}>
            <SelectTrigger className="h-10 w-full min-w-0 sm:w-[160px]">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-900 border-gray-200">
              <SelectItem value="Toutes">Toutes catégories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-10 w-full min-w-0 sm:w-[160px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-900 border-gray-200">
              {STATUS_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors cursor-pointer ${viewMode === "grid" ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors cursor-pointer ${viewMode === "list" ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Results count ── */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{filteredProducts.length} résultat{filteredProducts.length > 1 ? "s" : ""}</span>
        {totalPages > 1 && (
          <span>Page {currentPage} sur {totalPages}</span>
        )}
      </div>

      {/* ── Product Grid/List ── */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Aucun produit trouvé"
          description={
            search || categoryFilter !== "Toutes" || statusFilter !== "tous"
              ? "Essayez de modifier vos filtres"
              : "Ajoutez votre premier produit"
          }
          action={
            !(search || categoryFilter !== "Toutes" || statusFilter !== "tous") ? (
              <Button onClick={handleOpenAdd} className="bg-brand hover:bg-brand-dark text-white cursor-pointer">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un produit
              </Button>
            ) : undefined
          }
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              agents={agentsList}
              onView={handleOpenView}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {paginatedProducts.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              agents={agentsList}
              onView={handleOpenView}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      )}

      <Pagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* ═══════════ DIALOGS ═══════════ */}

      {/* Category Manager Modal */}
      <Dialog open={catModalOpen} onOpenChange={setCatModalOpen}>
        <DialogContent className="bg-white text-gray-900 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Gérer les catégories</DialogTitle>
            <DialogDescription className="text-gray-500">
              Ajoutez, renommez ou supprimez les catégories de votre catalogue.
            </DialogDescription>
          </DialogHeader>
          <CategoryManager
            onRenameCategory={handleRenameCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-white text-gray-900 sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Ajouter un produit</DialogTitle>
            <DialogDescription className="text-gray-500">
              Remplissez les informations du nouveau produit.
            </DialogDescription>
          </DialogHeader>
          <ProductForm form={formData} setForm={setFormData} categories={categories} agents={agentsList} />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              className="text-gray-700 border-gray-200 hover:bg-gray-50 cursor-pointer"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSaveAdd}
              className="bg-brand hover:bg-brand-dark text-white font-semibold cursor-pointer"
            >
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewingProduct(null);
        }}
      >
        <DialogContent className="bg-white text-gray-900 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Détails du produit</DialogTitle>
          </DialogHeader>
          {viewingProduct && (
            <div className="space-y-4">
              {viewingProduct.image ? (
                <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={viewingProduct.image}
                    alt={viewingProduct.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-48 rounded-xl bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-gray-300" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-900">{viewingProduct.name}</h3>
                <p className="text-xl font-bold text-brand-dark mt-1">{formatFCFA(viewingProduct.price)}</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Catégorie</p>
                  <p className="text-sm font-semibold text-gray-900">{viewingProduct.category}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-500">Stock</p>
                  <p className="text-sm font-semibold text-gray-900">{viewingProduct.stock} unités</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-500">Statut</p>
                  <p className={`text-sm font-semibold ${viewingProduct.status === "actif" ? "text-emerald-600" : "text-gray-500"}`}>
                    {viewingProduct.status === "actif" ? "Actif" : "Inactif"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-500">Agent IA</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {viewingProduct.assignedAgent
                      ? (() => {
                          const agent = getAgentIA(viewingProduct.assignedAgent, agentsList);
                          return agent?.agentName || agent?.slotName || "Agent IA";
                        })()
                      : "Tous les agents"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-white text-gray-900 sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Modifier le produit</DialogTitle>
            <DialogDescription className="text-gray-500">
              Mettez à jour les informations du produit.
            </DialogDescription>
          </DialogHeader>
          <ProductForm form={formData} setForm={setFormData} categories={categories} agents={agentsList} />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => { setEditOpen(false); setEditingProduct(null); }}
              className="text-gray-700 border-gray-200 hover:bg-gray-50 cursor-pointer"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-brand hover:bg-brand-dark text-white font-semibold cursor-pointer"
            >
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-white text-gray-900 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Supprimer le produit</DialogTitle>
            <DialogDescription className="text-gray-500">
              Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          {deletingProduct && (
            <p className="text-sm text-gray-700 font-medium">
              « {deletingProduct.name} » — {formatFCFA(deletingProduct.price)}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => { setDeleteOpen(false); setDeletingProduct(null); }}
              className="text-gray-700 border-gray-200 hover:bg-gray-50 cursor-pointer"
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer"
            >
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
