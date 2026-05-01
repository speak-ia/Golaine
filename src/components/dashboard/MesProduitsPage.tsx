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
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  status: "actif" | "inactif";
}

interface ProductFormData {
  name: string;
  price: string;
  category: string;
  stock: string;
  status: boolean;
  image: string;
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  price: "",
  category: "Mode",
  stock: "",
  status: true,
  image: "📦",
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

const ITEMS_PER_PAGE = 6;

const CATEGORY_COLORS: Record<string, string> = {
  Mode: "bg-purple-50 text-purple-700",
  Textile: "bg-amber-50 text-amber-700",
  Alimentation: "bg-green-50 text-green-700",
  Beauté: "bg-pink-50 text-pink-700",
  Accessoires: "bg-sky-50 text-sky-700",
};

/* ──────────────────── Helpers ──────────────────── */
function formatFCFA(amount: number): string {
  return amount.toLocaleString("fr-FR") + " FCFA";
}

function getStockBadge(stock: number) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
        <X className="w-3 h-3" />
        Rupture
      </span>
    );
  }
  if (stock < 10) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
        <AlertTriangle className="w-3 h-3" />
        Stock faible
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
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
          <SelectContent>
            {CATEGORIES.filter((c) => c !== "Toutes").map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Emoji */}
      <div className="space-y-2">
        <Label htmlFor="prod-emoji" className="text-gray-700">
          Emoji / Icône
        </Label>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
            {form.image || "📦"}
          </div>
          <Input
            id="prod-emoji"
            value={form.image}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, image: e.target.value }))
            }
            placeholder="Collez un emoji"
            className="h-10"
          />
        </div>
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

/* ──────────────────── Main Component ──────────────────── */
export default function MesProduitsPage() {
  /* ── State ── */
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: "Robe Wax S-400", price: 5000, category: "Mode", stock: 25, image: "👗", status: "actif" },
    { id: 2, name: "Pagne Tissé Premium", price: 8000, category: "Textile", stock: 15, image: "🧵", status: "actif" },
    { id: 3, name: "Bissap 1L", price: 1500, category: "Alimentation", stock: 50, image: "🍵", status: "actif" },
    { id: 4, name: "Huile d'Argan Bio", price: 12000, category: "Beauté", stock: 8, image: "✨", status: "actif" },
    { id: 5, name: "Sac À Main Dakar", price: 6500, category: "Accessoires", stock: 20, image: "👜", status: "actif" },
    { id: 6, name: "Thiakry Nature", price: 2000, category: "Alimentation", stock: 35, image: "🍚", status: "actif" },
    { id: 7, name: "Collier Traditionnel", price: 3500, category: "Accessoires", stock: 12, image: "📿", status: "inactif" },
    { id: 8, name: "Baobab Fruit Powder", price: 4500, category: "Alimentation", stock: 0, image: "🌿", status: "actif" },
    { id: 9, name: "Tunique Boubou", price: 9000, category: "Mode", stock: 18, image: "👚", status: "actif" },
    { id: 10, name: "Savon Noir Naturel", price: 2500, category: "Beauté", stock: 40, image: "🧼", status: "actif" },
    { id: 11, name: "Bijoux Mauritanien", price: 15000, category: "Accessoires", stock: 5, image: "💎", status: "actif" },
    { id: 12, name: "Café Touba 500g", price: 3000, category: "Alimentation", stock: 22, image: "☕", status: "actif" },
  ]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Toutes");
  const [statusFilter, setStatusFilter] = useState("tous");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM);
  const [nextId, setNextId] = useState(13);

  /* ── Filtered & Paginated ── */
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      if (search) {
        const q = search.toLowerCase();
        const matchesSearch =
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      // Category
      if (categoryFilter !== "Toutes" && p.category !== categoryFilter) {
        return false;
      }
      // Status
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
      image: formData.image || "📦",
      status: formData.status ? "actif" : "inactif",
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
              image: formData.image || "📦",
              status: formData.status ? "actif" : "inactif",
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

  // Reset page when filters change
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

  /* ── Page number buttons ── */
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
    <div className="space-y-6">
      {/* ── Top Bar ── */}
      <div className="flex flex-col gap-4">
        {/* Heading row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F8EF] flex items-center justify-center">
              <Package className="w-5 h-5 text-[#16A34A]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mes Produits</h1>
              <p className="text-sm text-gray-500">
                {products.length} produit{products.length > 1 ? "s" : ""} au total
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

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Rechercher un produit..."
              className="pl-9 h-10 bg-white border-gray-200"
            />
          </div>

          {/* Category filter */}
          <Select value={categoryFilter} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-[180px] h-10 bg-white border-gray-200">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-[180px] h-10 bg-white border-gray-200">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Product Grid ── */}
      {paginatedProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow duration-200 flex flex-col"
            >
              {/* Top: emoji + status */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center text-3xl">
                  {product.image}
                </div>
                <Badge
                  className={
                    product.status === "actif"
                      ? "bg-emerald-50 text-emerald-700 border-0 font-medium"
                      : "bg-gray-100 text-gray-500 border-0 font-medium"
                  }
                >
                  {product.status === "actif" ? "Actif" : "Inactif"}
                </Badge>
              </div>

              {/* Info */}
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-gray-900 leading-snug">
                  {product.name}
                </h3>
                <p className="text-lg font-bold text-[#16A34A]">
                  {formatFCFA(product.price)}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      CATEGORY_COLORS[product.category] || "bg-gray-50 text-gray-700"
                    }`}
                  >
                    {product.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {product.stock} en stock
                  </span>
                </div>
                {product.stock <= 10 && (
                  <div className="pt-1">{getStockBadge(product.stock)}</div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 mt-4 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEdit(product)}
                  className="flex-1 h-9 text-gray-600 hover:text-[#16A34A] hover:bg-[#E8F8EF] gap-1.5 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Modifier
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenDelete(product)}
                  className="flex-1 h-9 text-gray-600 hover:text-red-600 hover:bg-red-50 gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {/* Précédent */}
          <Button
            variant="outline"
            size="sm"
            disabled={safeCurrentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="h-9 gap-1.5 text-sm cursor-pointer disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </Button>

          {/* Page numbers */}
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

          {/* Suivant */}
          <Button
            variant="outline"
            size="sm"
            disabled={safeCurrentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="h-9 gap-1.5 text-sm cursor-pointer disabled:opacity-40"
          >
            Suivant
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* ── Add Product Modal ── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent className="sm:max-w-md rounded-2xl p-6 border-gray-200">
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
                className="cursor-pointer"
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
          <DialogContent className="sm:max-w-md rounded-2xl p-6 border-gray-200">
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
                className="cursor-pointer"
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
          <DialogContent className="sm:max-w-md rounded-2xl p-6 border-gray-200">
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
                className="cursor-pointer"
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
