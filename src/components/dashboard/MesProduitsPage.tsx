"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useProductStore,
  MOCK_AGENTS_IA,
  type Product,
} from "@/lib/store";

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
function getAgentIA(id: string | null) {
  if (!id) return undefined;
  return MOCK_AGENTS_IA.find((a) => a.id === id);
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

function getCategoryColorIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % COLOR_POOL.length;
}

function getCategoryBg(name: string): string {
  return COLOR_POOL[getCategoryColorIndex(name)]?.bg || "bg-gray-50";
}

function getCategoryText(name: string): string {
  return COLOR_POOL[getCategoryColorIndex(name)]?.text || "text-gray-700";
}

function getCategoryAccent(name: string): string {
  return COLOR_POOL[getCategoryColorIndex(name)]?.accent || "from-gray-100 to-transparent";
}

function formatFCFA(amount: number): string {
  return amount.toLocaleString("fr-FR") + " FCFA";
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
const CategoryManager = React.memo(function CategoryManager() {
  const { categories, addCategory, renameCategory, deleteCategory } = useProductStore();
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

  function handleSaveEdit() {
    const trimmed = editValue.trim();
    if (!trimmed || !editingCat) return;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase() && c !== editingCat)) return;
    renameCategory(editingCat, trimmed);
    setEditingCat(null);
    setEditValue("");
  }

  function handleConfirmDelete(name: string) {
    deleteCategory(name);
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
          className="h-9 bg-[#25D366] hover:bg-[#16A34A] text-white font-medium cursor-pointer gap-1.5 px-3"
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
}: {
  form: ProductFormData;
  setForm: React.Dispatch<React.SetStateAction<ProductFormData>>;
  categories: string[];
}) {
  return (
    <div className="space-y-4">
      {/* Image upload */}
      <div className="space-y-2">
        <Label className="text-gray-700">Image du produit</Label>
        <input
          type="file"
          accept="image/*"
          id="prod-image-upload"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 5 * 1024 * 1024) return; // 5MB max
            const reader = new FileReader();
            reader.onloadend = () => {
              setForm((prev) => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
          }}
        />
        <div
          onClick={() => document.getElementById("prod-image-upload")?.click()}
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
      <div className="grid grid-cols-2 gap-4">
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
            {MOCK_AGENTS_IA.map((agent) => (
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
          className="data-[state=checked]:bg-[#25D366]"
        />
      </div>
    </div>
  );
}

/* ──────────────────── Stat Card ──────────────────── */
const StatCard = React.memo(function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: bg }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
});

/* ──────────────────── Product Card (Grid View) ──────────────────── */
const ProductCard = React.memo(function ProductCard({
  product,
  onView,
  onEdit,
  onDelete,
}: {
  product: Product;
  onView: (p: Product) => void;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
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
          <p className="text-lg font-bold text-[#16A34A]">
            {formatFCFA(product.price)}
          </p>
        </div>

        {/* Agent IA assigné */}
        <div className="flex items-center gap-1.5 mt-2">
          {product.assignedAgent ? (() => {
            const agent = getAgentIA(product.assignedAgent);
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
  onView,
  onEdit,
  onDelete,
}: {
  product: Product;
  onView: (p: Product) => void;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
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
            const agent = getAgentIA(product.assignedAgent);
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
        <p className="font-bold text-[#16A34A] text-sm">{formatFCFA(product.price)}</p>
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
export default function MesProduitsPage() {
  const products = useProductStore((s) => s.products);
  const categories = useProductStore((s) => s.categories);
  const addProduct = useProductStore((s) => s.addProduct);
  const updateProduct = useProductStore((s) => s.updateProduct);
  const deleteProduct = useProductStore((s) => s.deleteProduct);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Toutes");
  const [statusFilter, setStatusFilter] = useState("tous");
  const [currentPage, setCurrentPage] = useState(1);

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
      if (search) {
        const q = search.toLowerCase();
        const matchesSearch =
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      if (categoryFilter !== "Toutes" && p.category !== categoryFilter) return false;
      if (statusFilter === "actif" && p.status !== "actif") return false;
      if (statusFilter === "inactif" && p.status !== "inactif") return false;
      if (statusFilter === "rupture" && p.stock !== 0) return false;
      return true;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const effectivePage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (effectivePage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, effectivePage]);

  /* ── Handlers ── */
  const handleOpenView = useCallback((product: Product) => {
    setViewingProduct(product);
    setViewOpen(true);
  }, []);

  const handleCloseView = useCallback(() => {
    setViewOpen(false);
    setViewingProduct(null);
  }, []);

  const handleOpenAdd = useCallback(() => {
    setFormData(EMPTY_FORM);
    setAddOpen(true);
  }, []);

  const handleSaveAdd = useCallback(() => {
    if (!formData.name.trim() || !formData.price || Number(formData.price) <= 0) return;
    if (!formData.category) return;
    addProduct({
      name: formData.name.trim(),
      price: Number(formData.price) || 0,
      category: formData.category,
      stock: Number(formData.stock) || 0,
      image: formData.image,
      status: formData.status ? "actif" : "inactif",
      assignedAgent: formData.assignedAgent === "all" ? null : formData.assignedAgent,
    });
    setAddOpen(false);
    setFormData(EMPTY_FORM);
    setCurrentPage(1); // Go to first page to see new product
  }, [formData, addProduct]);

  const handleOpenEdit = useCallback((product: Product) => {
    setEditingProduct(product);
    setFormData(productToForm(product));
    setEditOpen(true);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingProduct || !formData.name.trim() || !formData.category) return;
    if (Number(formData.price) <= 0) return;
    updateProduct(editingProduct.id, {
      name: formData.name.trim(),
      price: Number(formData.price) || 0,
      category: formData.category,
      stock: Number(formData.stock) || 0,
      image: formData.image || editingProduct.image,
      status: formData.status ? "actif" : "inactif",
      assignedAgent: formData.assignedAgent === "all" ? null : formData.assignedAgent,
    });
    setEditOpen(false);
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
  }, [formData, editingProduct, updateProduct]);

  const handleOpenDelete = useCallback((product: Product) => {
    setDeletingProduct(product);
    setDeleteOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deletingProduct) return;
    deleteProduct(deletingProduct.id);
    setDeleteOpen(false);
    setDeletingProduct(null);
    // FIX: If deleting caused current page to become empty, go to previous page
    const newFilteredLength = products.filter((p) => p.id !== deletingProduct.id).length;
    const newTotalPages = Math.max(1, Math.ceil(newFilteredLength / ITEMS_PER_PAGE));
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  }, [deletingProduct, deleteProduct, currentPage, products]);

  const handleCategoryChange = useCallback((val: string) => {
    setCategoryFilter(val);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    setCurrentPage(1);
  }, []);

  function getPageNumbers(): (number | "ellipsis")[] {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (effectivePage > 3) pages.push("ellipsis");
      const start = Math.max(2, effectivePage - 1);
      const end = Math.min(totalPages - 1, effectivePage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (effectivePage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  }

  /* ──────────────────── Render ──────────────────── */
  return (
    <div className="w-full space-y-6 text-gray-900">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#E8F8EF] flex items-center justify-center">
            <Package className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mes Produits</h1>
            <p className="text-sm text-gray-500">
              {stats.totalProducts} produit{stats.totalProducts > 1 ? "s" : ""} au catalogue
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
            className="bg-[#25D366] hover:bg-[#16A34A] text-white font-semibold cursor-pointer gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Ajouter un produit
          </Button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Package} label="Total produits" value={stats.totalProducts} color="#8B5CF6" bg="#F3F0FF" />
        <StatCard icon={TrendingUp} label="Produits actifs" value={stats.activeProducts} color="#16A34A" bg="#E8F8EF" />
        <StatCard icon={AlertTriangle} label="Stock faible" value={stats.lowStock} color="#F97316" bg="#FFF7ED" />
        <StatCard icon={BarChart3} label="Valeur stock" value={formatFCFA(stats.totalValue)} color="#0EA5E9" bg="#F0F9FF" />
      </div>

      {/* ── Search & Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Rechercher un produit..."
            className="pl-10 h-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[160px] h-10">
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
            <SelectTrigger className="w-[160px] h-10">
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
          <span>Page {effectivePage} sur {totalPages}</span>
        )}
      </div>

      {/* ── Product Grid/List ── */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">Aucun produit trouvé</p>
          <p className="text-sm text-gray-400 mt-1">
            {search || categoryFilter !== "Toutes" || statusFilter !== "tous"
              ? "Essayez de modifier vos filtres"
              : "Ajoutez votre premier produit"}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
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
              onView={handleOpenView}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          {getPageNumbers().map((page, i) =>
            page === "ellipsis" ? (
              <span key={`e-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors cursor-pointer ${
                  effectivePage === page
                    ? "bg-[#25D366] text-white"
                    : "border border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}
              >
                {page}
              </button>
            )
          )}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}

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
          <CategoryManager />
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
          <ProductForm form={formData} setForm={setFormData} categories={categories} />
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
              className="bg-[#25D366] hover:bg-[#16A34A] text-white font-semibold cursor-pointer"
            >
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
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
                <p className="text-xl font-bold text-[#16A34A] mt-1">{formatFCFA(viewingProduct.price)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50">
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
                          const agent = getAgentIA(viewingProduct.assignedAgent);
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
          <ProductForm form={formData} setForm={setFormData} categories={categories} />
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
              className="bg-[#25D366] hover:bg-[#16A34A] text-white font-semibold cursor-pointer"
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
