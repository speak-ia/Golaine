"use client";

import { useState, useMemo } from "react";
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
  Warehouse,
  CircleCheck,
  Bot,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ──────────────────── Types ──────────────────── */
interface AgentIA {
  id: string;
  slotName: string;     // Nom du numéro WhatsApp (ex: "Alou Shop")
  agentName: string;    // Nom de l'agent IA configuré (ex: "Assistan")
  phone: string;
  status: "connected" | "inactive";
}

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  status: "actif" | "inactif";
  assignedAgent: string | null; // null = tous les agents IA
}

interface ProductFormData {
  name: string;
  price: string;
  category: string;
  stock: string;
  status: boolean;
  image: string;
  assignedAgent: string; // "all" or agent id
}

// Agents IA issus de la page Agent IA (slots WhatsApp)
const MOCK_AGENTS_IA: AgentIA[] = [
  { id: "slot-alou", slotName: "Alou Shop", agentName: "Assistan", phone: "+221 76 028 96 07", status: "connected" },
  { id: "slot-2", slotName: "Numéro 2", agentName: "", phone: "", status: "inactive" },
  { id: "slot-3", slotName: "Numéro 3", agentName: "", phone: "", status: "inactive" },
];

function getAgentIA(id: string | null): AgentIA | undefined {
  if (!id) return undefined;
  return MOCK_AGENTS_IA.find((a) => a.id === id);
}

function getAgentLabel(agent: AgentIA | undefined): string {
  if (!agent) return "Tous les agents IA";
  return agent.agentName ? `${agent.agentName} (${agent.slotName})` : agent.slotName;
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  price: "",
  category: "Mode",
  stock: "",
  status: true,
  image: "/products/robe-wax.png",
  assignedAgent: "all",
};

const CATEGORIES = [
  "Toutes",
  "Mode",
  "Textile",
  "Alimentation",
  "Beauté",
  "Accessoires",
] as const;

const STATUS_FILTERS = [
  { value: "tous", label: "Tous" },
  { value: "actif", label: "Actif" },
  { value: "inactif", label: "Inactif" },
  { value: "rupture", label: "Rupture de stock" },
] as const;

const ITEMS_PER_PAGE = 8;

const CATEGORY_COLORS: Record<string, string> = {
  Mode: "bg-purple-50 text-purple-700",
  Textile: "bg-amber-50 text-amber-700",
  Alimentation: "bg-green-50 text-green-700",
  Beauté: "bg-pink-50 text-pink-700",
  Accessoires: "bg-sky-50 text-sky-700",
};

const CATEGORY_ACCENT: Record<string, string> = {
  Mode: "from-purple-500/10 to-transparent",
  Textile: "from-amber-500/10 to-transparent",
  Alimentation: "from-green-500/10 to-transparent",
  Beauté: "from-pink-500/10 to-transparent",
  Accessoires: "from-sky-500/10 to-transparent",
};

/* ──────────────────── Helpers ──────────────────── */
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

/* ──────────────────── Product Form ──────────────────── */
function ProductForm({
  form,
  setForm,
}: {
  form: ProductFormData;
  setForm: React.Dispatch<React.SetStateAction<ProductFormData>>;
}) {
  return (
    <div className="space-y-4">
      {/* Image preview */}
      <div className="space-y-2">
        <Label className="text-gray-700">Image du produit</Label>
        <div className="relative w-full h-40 rounded-xl bg-gray-50 border border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
          {form.image ? (
            <img
              src={form.image}
              alt="Aperçu"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <ImageIcon className="w-8 h-8" />
              <span className="text-xs">Aucune image</span>
            </div>
          )}
        </div>
        <Input
          value={form.image}
          onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
          placeholder="/products/robe-wax.png"
          className="h-9 text-xs"
        />
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
            {CATEGORIES.filter((c) => c !== "Toutes").map((cat) => (
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
function StatCard({
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
}

/* ──────────────────── Product Card (Grid View) ──────────────────── */
function ProductCard({
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
  const gradient = CATEGORY_ACCENT[product.category] || "from-gray-100 to-transparent";

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className={`relative h-52 bg-gradient-to-br ${gradient} overflow-hidden`}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "";
            (e.target as HTMLImageElement).classList.add("hidden");
          }}
        />
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
            className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium ${
              CATEGORY_COLORS[product.category] || "bg-gray-50 text-gray-700"
            }`}
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
}

/* ──────────────────── Product Row (List View) ──────────────────── */
function ProductRow({
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
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm truncate">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${
              CATEGORY_COLORS[product.category] || "bg-gray-50 text-gray-700"
            }`}
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
}

/* ──────────────────── Main Component ──────────────────── */
export default function MesProduitsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: "Robe Wax S-400", price: 5000, category: "Mode", stock: 25, image: "/products/robe-wax.png", status: "actif", assignedAgent: "slot-alou" },
    { id: 2, name: "Pagne Tissé Premium", price: 8000, category: "Textile", stock: 15, image: "/products/pagne-tisse.png", status: "actif", assignedAgent: null },
    { id: 3, name: "Bissap 1L", price: 1500, category: "Alimentation", stock: 50, image: "/products/bissap.png", status: "actif", assignedAgent: "slot-alou" },
    { id: 4, name: "Huile d'Argan Bio", price: 12000, category: "Beauté", stock: 8, image: "/products/huile-argan.png", status: "actif", assignedAgent: "slot-2" },
    { id: 5, name: "Sac À Main Dakar", price: 6500, category: "Accessoires", stock: 20, image: "/products/sac-main.png", status: "actif", assignedAgent: null },
    { id: 6, name: "Thiakry Nature", price: 2000, category: "Alimentation", stock: 35, image: "/products/thiakry.png", status: "actif", assignedAgent: "slot-alou" },
    { id: 7, name: "Collier Traditionnel", price: 3500, category: "Accessoires", stock: 12, image: "/products/collier.png", status: "inactif", assignedAgent: "slot-3" },
    { id: 8, name: "Baobab Fruit Powder", price: 4500, category: "Alimentation", stock: 0, image: "/products/baobab.png", status: "actif", assignedAgent: null },
    { id: 9, name: "Tunique Boubou", price: 9000, category: "Mode", stock: 18, image: "/products/tunique.png", status: "actif", assignedAgent: "slot-alou" },
    { id: 10, name: "Savon Noir Naturel", price: 2500, category: "Beauté", stock: 40, image: "/products/savon-noir.png", status: "actif", assignedAgent: "slot-2" },
    { id: 11, name: "Bijoux Mauritanien", price: 15000, category: "Accessoires", stock: 5, image: "/products/bijoux.png", status: "actif", assignedAgent: null },
    { id: 12, name: "Café Touba 500g", price: 3000, category: "Alimentation", stock: 22, image: "/products/cafe-touba.png", status: "actif", assignedAgent: "slot-alou" },
  ]);

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
  const [nextId, setNextId] = useState(13);

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
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, safeCurrentPage]);

  /* ── Handlers ── */
  function handleOpenView(product: Product) {
    setViewingProduct(product);
    setViewOpen(true);
  }

  function handleCloseView() {
    setViewOpen(false);
    setViewingProduct(null);
  }

  function handleOpenAdd() {
    setFormData(EMPTY_FORM);
    setAddOpen(true);
  }

  function handleSaveAdd() {
    if (!formData.name.trim() || !formData.price) return;
    const newProduct: Product = {
      id: nextId,
      name: formData.name.trim(),
      price: Number(formData.price) || 0,
      category: formData.category,
      stock: Number(formData.stock) || 0,
      image: formData.image || "/products/robe-wax.png",
      status: formData.status ? "actif" : "inactif",
      assignedAgent: formData.assignedAgent === "all" ? null : formData.assignedAgent,
    };
    setProducts((prev) => [newProduct, ...prev]);
    setNextId((prev) => prev + 1);
    setAddOpen(false);
    setFormData(EMPTY_FORM);
  }

  function handleOpenEdit(product: Product) {
    setEditingProduct(product);
    setFormData(productToForm(product));
    setEditOpen(true);
  }

  function handleSaveEdit() {
    if (!editingProduct || !formData.name.trim()) return;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: formData.name.trim(),
              price: Number(formData.price) || 0,
              category: formData.category,
              stock: Number(formData.stock) || 0,
              image: formData.image || p.image,
              status: formData.status ? "actif" : "inactif",
              assignedAgent: formData.assignedAgent === "all" ? null : formData.assignedAgent,
            }
          : p
      )
    );
    setEditOpen(false);
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
  }

  function handleOpenDelete(product: Product) {
    setDeletingProduct(product);
    setDeleteOpen(true);
  }

  function handleConfirmDelete() {
    if (!deletingProduct) return;
    setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
    setDeleteOpen(false);
    setDeletingProduct(null);
  }

  function handleCategoryChange(val: string) {
    setCategoryFilter(val);
    setCurrentPage(1);
  }

  function handleStatusChange(val: string) {
    setStatusFilter(val);
    setCurrentPage(1);
  }

  function handleSearchChange(val: string) {
    setSearch(val);
    setCurrentPage(1);
  }

  function getPageNumbers(): (number | "ellipsis")[] {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safeCurrentPage > 3) pages.push("ellipsis");
      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safeCurrentPage < totalPages - 2) pages.push("ellipsis");
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
        <Button
          onClick={handleOpenAdd}
          className="bg-[#25D366] hover:bg-[#16A34A] text-white font-semibold cursor-pointer gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Ajouter un produit
        </Button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Package}
          label="Total produits"
          value={stats.totalProducts}
          color="#8B5CF6"
          bg="#F3F0FF"
        />
        <StatCard
          icon={TrendingUp}
          label="Produits actifs"
          value={stats.activeProducts}
          color="#16A34A"
          bg="#E8F8EF"
        />
        <StatCard
          icon={AlertTriangle}
          label="Stock faible"
          value={stats.lowStock}
          color="#F97316"
          bg="#FFF7ED"
        />
        <StatCard
          icon={BarChart3}
          label="Valeur stock"
          value={formatFCFA(stats.totalValue)}
          color="#0EA5E9"
          bg="#F0F9FF"
        />
      </div>

      {/* ── Search & Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Rechercher un produit..."
            className="pl-9 h-10 bg-white border-gray-200"
          />
        </div>

        <Select value={categoryFilter} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-[180px] h-10 bg-white border-gray-200">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent className="bg-white text-gray-900 border-gray-200">
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[180px] h-10 bg-white border-gray-200">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent className="bg-white text-gray-900 border-gray-200">
            {STATUS_FILTERS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View toggle */}
        <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-colors cursor-pointer ${
              viewMode === "grid"
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors cursor-pointer ${
              viewMode === "list"
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Product Grid/List ── */}
      {paginatedProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            Aucun produit trouvé
          </h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Aucun produit ne correspond à vos critères de recherche. Essayez de
            modifier vos filtres.
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
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={safeCurrentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="h-9 gap-1.5 text-sm cursor-pointer disabled:opacity-40 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </Button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, idx) =>
              page === "ellipsis" ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-9 h-9 flex items-center justify-center text-sm text-gray-400"
                >
                  …
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors cursor-pointer ${
                    page === safeCurrentPage
                      ? "bg-[#25D366] text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={safeCurrentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="h-9 gap-1.5 text-sm cursor-pointer disabled:opacity-40 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          >
            Suivant
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* ── View Product Modal ── */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent className="sm:max-w-lg rounded-2xl p-0 border-gray-200 text-gray-900 overflow-hidden">
            <DialogTitle className="sr-only">Détails du produit</DialogTitle>
            {viewingProduct && (
              <>
                {/* Image header */}
                <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                  <img
                    src={viewingProduct.image}
                    alt={viewingProduct.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "";
                      (e.target as HTMLImageElement).classList.add("hidden");
                    }}
                  />
                  {/* Status badge */}
                  <span
                    className={`absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${
                      viewingProduct.status === "actif"
                        ? "bg-emerald-500/90 text-white"
                        : "bg-gray-500/90 text-white"
                    }`}
                  >
                    <CircleCheck className="w-3.5 h-3.5" />
                    {viewingProduct.status === "actif" ? "Actif" : "Inactif"}
                  </span>
                </div>

                {/* Body */}
                <div className="p-6">
                  {/* Name & ID */}
                  <div className="mb-5">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Produit #{viewingProduct.id}
                    </p>
                    <h2 className="text-xl font-bold text-gray-900 leading-snug">
                      {viewingProduct.name}
                    </h2>
                  </div>

                  {/* Price */}
                  <div className="bg-[#E8F8EF] rounded-xl px-4 py-3 mb-5">
                    <p className="text-[11px] font-semibold text-[#16A34A] uppercase tracking-wider">Prix</p>
                    <p className="text-2xl font-bold text-[#16A34A] mt-0.5">{formatFCFA(viewingProduct.price)}</p>
                  </div>

                  {/* Detail grid */}
                  <div className="space-y-3 mb-5">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <Tag className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Catégorie</p>
                        <p className="text-sm font-medium text-gray-800">{viewingProduct.category}</p>
                      </div>
                    </div>

                    {/* Agent IA assigné */}
                    {(() => {
                      const agent = getAgentIA(viewingProduct.assignedAgent);
                      return (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${agent?.status === "connected" ? "bg-emerald-50" : "bg-gray-100"}`}>
                            <Bot className={`w-4 h-4 ${agent?.status === "connected" ? "text-emerald-600" : "text-gray-400"}`} />
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Agent IA assigné</p>
                            <div className="flex items-center gap-1.5">
                              {agent ? (
                                <>
                                  {agent.agentName && (
                                    <p className="text-sm font-medium text-gray-800">{agent.agentName}</p>
                                  )}
                                  <p className="text-sm text-gray-500">{agent.agentName ? `(${agent.slotName})` : agent.slotName}</p>
                                  <span className={`ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${agent.status === "connected" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${agent.status === "connected" ? "bg-emerald-500" : "bg-gray-300"}`} />
                                    {agent.status === "connected" ? "Actif" : "Inactif"}
                                  </span>
                                </>
                              ) : (
                                <p className="text-sm font-medium text-gray-800">Tous les agents IA</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Warehouse className={`w-4 h-4 ${viewingProduct.stock === 0 ? "text-red-500" : viewingProduct.stock < 10 ? "text-orange-500" : "text-emerald-600"}`} />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Stock</p>
                        <p className="text-sm font-medium text-gray-800">{viewingProduct.stock === 0 ? "Rupture de stock" : `${viewingProduct.stock} unités disponibles`}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <DialogFooter className="!pt-0 gap-2">
                    <Button
                      variant="outline"
                      onClick={handleCloseView}
                      className="flex-1 cursor-pointer bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      Fermer
                    </Button>
                    <Button
                      onClick={() => {
                        handleCloseView();
                        handleOpenEdit(viewingProduct);
                      }}
                      className="flex-1 bg-[#25D366] hover:bg-[#16A34A] text-white font-semibold cursor-pointer gap-2"
                    >
                      <Pencil className="w-4 h-4" />
                      Modifier
                    </Button>
                  </DialogFooter>
                </div>
              </>
            )}
          </DialogContent>
        </DialogPortal>
      </Dialog>

      {/* ── Add Product Modal ── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent className="sm:max-w-md rounded-2xl p-6 border-gray-200 text-gray-900">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Ajouter un produit
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Remplissez les informations du nouveau produit à ajouter à votre
                catalogue.
              </DialogDescription>
            </DialogHeader>
            <ProductForm form={formData} setForm={setFormData} />
            <DialogFooter className="pt-2 gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAddOpen(false);
                  setFormData(EMPTY_FORM);
                }}
                className="cursor-pointer bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSaveAdd}
                disabled={!formData.name.trim() || !formData.price}
                className="bg-[#25D366] hover:bg-[#16A34A] text-white font-semibold cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      {/* ── Edit Product Modal ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent className="sm:max-w-md rounded-2xl p-6 border-gray-200 text-gray-900">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Modifier le produit
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Modifiez les informations de{" "}
                <span className="font-medium text-gray-700">
                  {editingProduct?.name}
                </span>
                .
              </DialogDescription>
            </DialogHeader>
            <ProductForm form={formData} setForm={setFormData} />
            <DialogFooter className="pt-2 gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditOpen(false);
                  setEditingProduct(null);
                  setFormData(EMPTY_FORM);
                }}
                className="cursor-pointer bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={!formData.name.trim() || !formData.price}
                className="bg-[#25D366] hover:bg-[#16A34A] text-white font-semibold cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      {/* ── Delete Confirmation Modal ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent className="sm:max-w-md rounded-2xl p-6 border-gray-200 text-gray-900">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-gray-900">
                    Supprimer le produit
                  </DialogTitle>
                </div>
              </div>
              <DialogDescription className="text-sm text-gray-600 !mt-2">
                Êtes-vous sûr de vouloir supprimer{" "}
                <span className="font-semibold text-gray-800">
                  {deletingProduct?.name}
                </span>{" "}
                ? Cette action est irréversible et le produit sera définitivement
                retiré de votre catalogue.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-4 gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteOpen(false);
                  setDeletingProduct(null);
                }}
                className="cursor-pointer bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                Annuler
              </Button>
              <Button
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
