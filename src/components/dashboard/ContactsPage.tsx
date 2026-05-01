"use client";

import { useState, useMemo } from "react";
import {
  Search,
  LayoutGrid,
  List,
  Plus,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  MessageSquare,
  Calendar,
  DollarSign,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */

type Segment = "VIP" | "Régulier" | "Nouveau" | "Inactif";
type ViewMode = "grid" | "list";

interface Contact {
  id: number;
  name: string;
  phone: string;
  email: string;
  segment: Segment;
  orders: number;
  totalSpent: number;
  lastOrder: string;
  city: string;
  notes: string;
  avatar: string;
  color: string;
}

interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  city: string;
  segment: Segment;
  notes: string;
}

/* ═══════════════════════════════════════════════════════════════
   Mock Data
   ═══════════════════════════════════════════════════════════════ */

const initialContacts: Contact[] = [
  { id: 1, name: "Fatou Diallo", phone: "+221 77 234 56 78", email: "fatou@email.com", segment: "VIP", orders: 8, totalSpent: 245000, lastOrder: "2025-01-15", city: "Dakar", notes: "Cliente fidèle, aime les produits wax", avatar: "FD", color: "from-green-400 to-emerald-600" },
  { id: 2, name: "Moussa Traoré", phone: "+225 07 89 12 34", email: "moussa@email.com", segment: "Régulier", orders: 3, totalSpent: 45000, lastOrder: "2025-01-14", city: "Abidjan", notes: "", avatar: "MT", color: "from-purple-400 to-violet-600" },
  { id: 3, name: "Aminata Sow", phone: "+221 78 456 78 90", email: "aminata@email.com", segment: "Nouveau", orders: 1, totalSpent: 17000, lastOrder: "2025-01-14", city: "Dakar", notes: "Première commande", avatar: "AS", color: "from-blue-400 to-cyan-600" },
  { id: 4, name: "Ibrahim Keita", phone: "+223 76 123 45 67", email: "ibrahim@email.com", segment: "Régulier", orders: 5, totalSpent: 89000, lastOrder: "2025-01-13", city: "Bamako", notes: "", avatar: "IK", color: "from-orange-400 to-amber-600" },
  { id: 5, name: "Awa Ndiaye", phone: "+221 77 890 12 34", email: "awa@email.com", segment: "VIP", orders: 12, totalSpent: 356000, lastOrder: "2025-01-12", city: "Saint-Louis", notes: "Très bonne cliente, recommande souvent", avatar: "AN", color: "from-pink-400 to-rose-600" },
  { id: 6, name: "Oumar Ba", phone: "+221 76 567 89 01", email: "oumar@email.com", segment: "Régulier", orders: 2, totalSpent: 32500, lastOrder: "2025-01-11", city: "Dakar", notes: "", avatar: "OB", color: "from-teal-400 to-green-600" },
  { id: 7, name: "Mariam Coulibaly", phone: "+223 70 234 56 78", email: "mariam@email.com", segment: "Nouveau", orders: 1, totalSpent: 15000, lastOrder: "2025-01-10", city: "Bamako", notes: "", avatar: "MC", color: "from-indigo-400 to-blue-600" },
  { id: 8, name: "Cheikh Sy", phone: "+221 78 345 67 89", email: "cheikh@email.com", segment: "Inactif", orders: 0, totalSpent: 0, lastOrder: "", city: "Thiès", notes: "Pas encore commandé", avatar: "CS", color: "from-red-400 to-pink-600" },
  { id: 9, name: "Fatima Diop", phone: "+221 77 678 90 12", email: "fatima@email.com", segment: "Régulier", orders: 4, totalSpent: 67000, lastOrder: "2025-01-08", city: "Dakar", notes: "", avatar: "FD", color: "from-yellow-400 to-orange-600" },
  { id: 10, name: "Boubacar Diallo", phone: "+223 71 456 78 90", email: "boubacar@email.com", segment: "Nouveau", orders: 1, totalSpent: 18000, lastOrder: "2025-01-07", city: "Bamako", notes: "", avatar: "BD", color: "from-cyan-400 to-teal-600" },
  { id: 11, name: "Kadiatou Bah", phone: "+224 62 345 67 89", email: "kadiatou@email.com", segment: "VIP", orders: 6, totalSpent: 178000, lastOrder: "2025-01-06", city: "Conakry", notes: "Aime les produits beauté", avatar: "KB", color: "from-emerald-400 to-green-600" },
  { id: 12, name: "Seydou Ndiaye", phone: "+221 76 789 01 23", email: "seydou@email.com", segment: "Inactif", orders: 0, totalSpent: 0, lastOrder: "", city: "Dakar", notes: "Intéressé par les produits alimentaires", avatar: "SN", color: "from-gray-400 to-gray-600" },
];

/* ═══════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════ */

const ITEMS_PER_PAGE = 6;

const segmentStyles: Record<Segment, string> = {
  VIP: "bg-green-50 text-green-700 border-green-200",
  Régulier: "bg-blue-50 text-blue-700 border-blue-200",
  Nouveau: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Inactif: "bg-gray-50 text-gray-600 border-gray-200",
};

const segmentFilterOptions: { label: string; value: Segment | "Tous" }[] = [
  { label: "Tous", value: "Tous" },
  { label: "VIP", value: "VIP" },
  { label: "Régulier", value: "Régulier" },
  { label: "Nouveau", value: "Nouveau" },
  { label: "Inactif", value: "Inactif" },
];

const emptyForm: ContactFormData = {
  name: "",
  phone: "",
  email: "",
  city: "",
  segment: "Nouveau",
  notes: "",
};

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */

function formatFCFA(amount: number): string {
  return amount.toLocaleString("fr-FR") + " F";
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function generateGradient(): string {
  const gradients = [
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
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
}

/* ═══════════════════════════════════════════════════════════════
   ContactsPage Component
   ═══════════════════════════════════════════════════════════════ */

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [segmentFilter, setSegmentFilter] = useState<Segment | "Tous">("Tous");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState<ContactFormData>(emptyForm);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);

  /* ──────────────── Filtering & Pagination ──────────────── */

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchesSearch =
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        c.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSegment =
        segmentFilter === "Tous" || c.segment === segmentFilter;

      return matchesSearch && matchesSegment;
    });
  }, [contacts, searchQuery, segmentFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredContacts.length / ITEMS_PER_PAGE));

  const paginatedContacts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredContacts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredContacts, currentPage]);

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleSegmentChange = (value: Segment | "Tous") => {
    setSegmentFilter(value);
    setCurrentPage(1);
  };

  /* ──────────────── CRUD Operations ──────────────── */

  const handleOpenAdd = () => {
    setEditingContact(null);
    setFormData(emptyForm);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      city: contact.city,
      segment: contact.segment,
      notes: contact.notes,
    });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.phone.trim()) return;

    if (editingContact) {
      // Update existing
      setContacts((prev) =>
        prev.map((c) =>
          c.id === editingContact.id
            ? { ...c, ...formData, avatar: getInitials(formData.name) }
            : c
        )
      );
    } else {
      // Add new
      const newContact: Contact = {
        id: Math.max(0, ...contacts.map((c) => c.id)) + 1,
        ...formData,
        orders: 0,
        totalSpent: 0,
        lastOrder: "",
        avatar: getInitials(formData.name),
        color: generateGradient(),
      };
      setContacts((prev) => [newContact, ...prev]);
    }
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setContacts((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const updateFormField = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /* ──────────────── Segment Counts ──────────────── */

  const segmentCounts = useMemo(() => {
    const counts: Record<string, number> = { Tous: contacts.length };
    contacts.forEach((c) => {
      counts[c.segment] = (counts[c.segment] || 0) + 1;
    });
    return counts;
  }, [contacts]);

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */

  return (
    <div className="space-y-6">
      {/* ──────────── Top Bar ──────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8F8EF] flex items-center justify-center">
            <Users className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Contacts</h1>
            <p className="text-sm text-gray-500">
              {filteredContacts.length} contact{filteredContacts.length > 1 ? "s" : ""}
              {segmentFilter !== "Tous" && ` · ${segmentFilter}`}
            </p>
          </div>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-[#25D366] hover:bg-[#16A34A] text-white font-semibold rounded-xl px-4 h-10 shadow-sm cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un contact
        </Button>
      </div>

      {/* ──────────── Filters Bar ──────────── */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom, téléphone ou ville..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Segment Filters */}
            <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {segmentFilterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSegmentChange(opt.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    segmentFilter === opt.value
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {opt.label}
                  {opt.value !== "Tous" && (
                    <span className="ml-1 text-[10px] opacity-60">
                      {segmentCounts[opt.value] || 0}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Mobile segment select */}
            <div className="md:hidden">
              <Select
                value={segmentFilter}
                onValueChange={(v) => handleSegmentChange(v as Segment | "Tous")}
              >
                <SelectTrigger className="w-[130px] h-10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {segmentFilterOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                title="Vue grille"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                title="Vue liste"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────── Grid View ──────────── */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginatedContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={handleOpenEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* ──────────── List View ──────────── */}
      {viewMode === "list" && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                    Contact
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">
                    Téléphone
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">
                    Ville
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                    Segment
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">
                    Commandes
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">
                    Total
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden xl:table-cell">
                    Dernière commande
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedContacts.map((contact) => (
                  <ContactRow
                    key={contact.id}
                    contact={contact}
                    onEdit={handleOpenEdit}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────── Empty State ──────────── */}
      {filteredContacts.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            Aucun contact trouvé
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            {searchQuery || segmentFilter !== "Tous"
              ? "Essayez de modifier vos filtres de recherche"
              : "Commencez par ajouter votre premier contact"}
          </p>
          {!searchQuery && segmentFilter === "Tous" && (
            <Button
              onClick={handleOpenAdd}
              className="bg-[#25D366] hover:bg-[#16A34A] text-white font-semibold rounded-xl cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un contact
            </Button>
          )}
        </div>
      )}

      {/* ──────────── Pagination ──────────── */}
      {filteredContacts.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Affichage de{" "}
            <span className="font-medium text-gray-700">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{" "}
            à{" "}
            <span className="font-medium text-gray-700">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredContacts.length)}
            </span>{" "}
            sur{" "}
            <span className="font-medium text-gray-700">
              {filteredContacts.length}
            </span>{" "}
            contacts
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  currentPage === page
                    ? "bg-[#25D366] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* ──────────── Add/Edit Modal ──────────── */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl p-6 gap-0 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-5">
            <DialogTitle className="text-lg font-bold text-gray-900">
              {editingContact ? "Modifier le contact" : "Nouveau contact"}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {editingContact
                ? "Modifiez les informations du contact ci-dessous."
                : "Remplissez les informations pour ajouter un nouveau contact."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Avatar preview */}
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                  editingContact?.color || "from-green-400 to-emerald-600"
                } flex items-center justify-center text-white font-bold text-sm shadow-sm`}
              >
                {getInitials(formData.name || "NC")}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {formData.name || "Nouveau contact"}
                </p>
                <p className="text-xs text-gray-400">{formData.segment}</p>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="contact-name" className="text-sm font-medium text-gray-700">
                Nom complet <span className="text-red-400">*</span>
              </Label>
              <Input
                id="contact-name"
                placeholder="Ex: Fatou Diallo"
                value={formData.name}
                onChange={(e) => updateFormField("name", e.target.value)}
                className="rounded-xl h-10"
              />
            </div>

            {/* Phone + Email row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="contact-phone" className="text-sm font-medium text-gray-700">
                  Téléphone <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="contact-phone"
                  placeholder="Ex: +221 77 123 45 67"
                  value={formData.phone}
                  onChange={(e) => updateFormField("phone", e.target.value)}
                  className="rounded-xl h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="Ex: fatou@email.com"
                  value={formData.email}
                  onChange={(e) => updateFormField("email", e.target.value)}
                  className="rounded-xl h-10"
                />
              </div>
            </div>

            {/* City + Segment row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="contact-city" className="text-sm font-medium text-gray-700">
                  Ville
                </Label>
                <Input
                  id="contact-city"
                  placeholder="Ex: Dakar"
                  value={formData.city}
                  onChange={(e) => updateFormField("city", e.target.value)}
                  className="rounded-xl h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">Segment</Label>
                <Select
                  value={formData.segment}
                  onValueChange={(v) => updateFormField("segment", v)}
                >
                  <SelectTrigger className="w-full rounded-xl h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIP">VIP</SelectItem>
                    <SelectItem value="Régulier">Régulier</SelectItem>
                    <SelectItem value="Nouveau">Nouveau</SelectItem>
                    <SelectItem value="Inactif">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="contact-notes" className="text-sm font-medium text-gray-700">
                Notes
              </Label>
              <Textarea
                id="contact-notes"
                placeholder="Ajoutez des notes sur ce contact..."
                value={formData.notes}
                onChange={(e) => updateFormField("notes", e.target.value)}
                className="rounded-xl min-h-[80px] resize-none"
              />
            </div>

            {/* Read-only stats for edit mode */}
            {editingContact && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Statistiques
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 mx-auto mb-1">
                      <ShoppingBag className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {editingContact.orders}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                      Commandes
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 mx-auto mb-1">
                      <DollarSign className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {formatFCFA(editingContact.totalSpent)}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                      Total dépensé
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 mx-auto mb-1">
                      <Calendar className="w-4 h-4 text-purple-500" />
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {formatDate(editingContact.lastOrder)}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                      Dernière commande
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              className="rounded-xl px-5 cursor-pointer"
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!formData.name.trim() || !formData.phone.trim()}
              className="bg-[#25D366] hover:bg-[#16A34A] text-white font-semibold rounded-xl px-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingContact ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ──────────── Delete Confirmation ──────────── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="sm:max-w-md rounded-2xl p-6">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <AlertDialogTitle className="text-lg font-bold text-gray-900">
                  Supprimer le contact
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-sm text-gray-500 mt-2">
              Êtes-vous sûr de vouloir supprimer{" "}
              <span className="font-semibold text-gray-700">
                {deleteTarget?.name}
              </span>{" "}
              ? Cette action est irréversible et toutes les données associées seront perdues.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl px-5 cursor-pointer">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl px-5 cursor-pointer"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ContactCard (Grid View)
   ═══════════════════════════════════════════════════════════════ */

function ContactCard({
  contact,
  onEdit,
  onDelete,
}: {
  contact: Contact;
  onEdit: (c: Contact) => void;
  onDelete: (c: Contact) => void;
}) {
  return (
    <div
      className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-200 group cursor-pointer"
      onClick={() => onEdit(contact)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-full bg-gradient-to-br ${contact.color} flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0`}
          >
            {contact.avatar}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900 truncate">
              {contact.name}
            </h3>
            <p className="text-xs text-gray-400 truncate">{contact.email}</p>
          </div>
        </div>
        <Badge
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${segmentStyles[contact.segment]}`}
        >
          {contact.segment}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">{contact.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">{contact.city}</span>
        </div>
        {contact.lastOrder && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{formatDate(contact.lastOrder)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900">{contact.orders}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
              Commandes
            </p>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900">
              {formatFCFA(contact.totalSpent)}
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
              Total
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(contact);
            }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            title="Modifier"
          >
            <Edit3 className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(contact);
            }}
            className="p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
            title="Supprimer"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </div>

      {contact.notes && (
        <div className="mt-3 pt-3 border-t border-gray-50">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500 line-clamp-2">{contact.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ContactRow (List View)
   ═══════════════════════════════════════════════════════════════ */

function ContactRow({
  contact,
  onEdit,
  onDelete,
}: {
  contact: Contact;
  onEdit: (c: Contact) => void;
  onDelete: (c: Contact) => void;
}) {
  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors group">
      {/* Contact name + avatar */}
      <td className="px-5 py-3.5">
        <button
          onClick={() => onEdit(contact)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div
            className={`w-9 h-9 rounded-full bg-gradient-to-br ${contact.color} flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0`}
          >
            {contact.avatar}
          </div>
          <div className="min-w-0 text-left">
            <p className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">
              {contact.name}
            </p>
            <p className="text-xs text-gray-400 truncate max-w-[180px]">
              {contact.email}
            </p>
          </div>
        </button>
      </td>

      {/* Phone */}
      <td className="px-5 py-3.5 hidden sm:table-cell">
        <span className="text-sm text-gray-600">{contact.phone}</span>
      </td>

      {/* City */}
      <td className="px-5 py-3.5 hidden lg:table-cell">
        <span className="text-sm text-gray-600">{contact.city}</span>
      </td>

      {/* Segment */}
      <td className="px-5 py-3.5">
        <Badge
          className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${segmentStyles[contact.segment]}`}
        >
          {contact.segment}
        </Badge>
      </td>

      {/* Orders */}
      <td className="px-5 py-3.5 hidden md:table-cell">
        <span className="text-sm font-medium text-gray-700">
          {contact.orders}
        </span>
      </td>

      {/* Total */}
      <td className="px-5 py-3.5 hidden lg:table-cell">
        <span className="text-sm font-medium text-gray-700">
          {formatFCFA(contact.totalSpent)}
        </span>
      </td>

      {/* Last Order */}
      <td className="px-5 py-3.5 hidden xl:table-cell">
        <span className="text-sm text-gray-500">
          {formatDate(contact.lastOrder)}
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-3.5">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(contact)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            title="Modifier"
          >
            <Edit3 className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
          <button
            onClick={() => onDelete(contact)}
            className="p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </td>
    </tr>
  );
}
