"use client";

import { useState, useMemo, useCallback } from "react";
import {
  LayoutGrid,
  List,
  Plus,
  Phone,
  Mail,
  MapPin,
  Edit3,
  Trash2,
  X,
  MessageSquare,
  Calendar,
  Users,
  Eye,
  Check,
} from "lucide-react";
import type { ContactSegment } from "@shared/constants/status";
import type { Contact, ContactFormData } from "@shared/types/domainTypes";
import { contactsService } from "@features/contacts/service";
import { useServiceQuery } from "@shared/hooks/useServiceQuery";
import { toastIfFailed } from "@shared/utils/toastResult";
import { formatFCFA, formatPageRange } from "@shared/utils/format";
import { formatDateLocaleShort } from "@shared/utils/date";
import { getInitials, pickFromPalette } from "@shared/utils/text";
import { matchesQuery } from "@shared/utils/filter";
import { cn } from "@shared/utils/cn";
import { usePagination } from "@shared/hooks/usePagination";
import { PageHeader } from "@shared/components/feedback/PageHeader";
import { SearchInput } from "@shared/components/feedback/SearchInput";
import { EmptyState } from "@shared/components/feedback/EmptyState";
import { Pagination } from "@shared/components/feedback/Pagination";
import { StatusPill } from "@shared/components/feedback/StatusPill";
import { ConfirmModal } from "@shared/components/feedback/ConfirmModal";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
import { Button } from "@shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/components/ui/dialog";

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */
type ViewMode = "grid" | "list";

/* ═══════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════ */

const ITEMS_PER_PAGE = 6;

const segmentFilterOptions: { label: string; value: ContactSegment | "Tous" }[] = [
  { label: "Tous", value: "Tous" },
  { label: "VIP", value: "VIP" },
  { label: "Régulier", value: "Régulier" },
  { label: "Nouveau", value: "Nouveau" },
  { label: "Inactif", value: "Inactif" },
];

const GRADIENT_PALETTE = [
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
] as const;

function ContactViewContent({ contact }: { contact: Contact }) {
  return (
    <div className="space-y-4 py-1 max-h-[65vh] overflow-y-auto pr-1">
      <div className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/90 via-green-50/60 to-sky-50/80 p-5">
        <div
          className={cn(
            "flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl text-base font-bold text-white shadow-md bg-gradient-to-br",
            contact.color
          )}
        >
          {contact.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-gray-900">{contact.name}</p>
          <p className="text-xs text-gray-500">{contact.email || "Pas d'adresse email"}</p>
        </div>
        <StatusPill segment={contact.segment} label={contact.segment} size="sm" className="shrink-0" />
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-3.5 text-center transition-shadow hover:shadow-sm">
          <p className="text-lg font-bold text-gray-900">{contact.orders}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Commandes</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-3.5 text-center transition-shadow hover:shadow-sm">
          <p className="text-lg font-bold text-emerald-600">{formatFCFA(contact.totalSpent)}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Total dépensé</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-3.5 text-center transition-shadow hover:shadow-sm">
          <p className="text-[13px] font-bold text-gray-900">
            {contact.lastOrder ? formatDateLocaleShort(contact.lastOrder) : "—"}
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Dernière</p>
        </div>
      </div>

      <div className="space-y-0 divide-y divide-gray-50">
        <div className="flex gap-3 py-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
            <Phone className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-[11.5px] font-semibold uppercase tracking-wide text-gray-400">Téléphone</p>
            <p className="text-sm font-medium text-gray-900">{contact.phone}</p>
          </div>
        </div>
        <div className="flex gap-3 py-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
            <MapPin className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11.5px] font-semibold uppercase tracking-wide text-gray-400">Ville</p>
            <p className="text-sm font-medium text-gray-900">{contact.city}</p>
          </div>
        </div>
        {contact.email ? (
          <div className="flex gap-3 py-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50">
              <Mail className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-[11.5px] font-semibold uppercase tracking-wide text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-900">{contact.email}</p>
            </div>
          </div>
        ) : null}
        {contact.notes ? (
          <div className="flex gap-3 py-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50">
              <MessageSquare className="h-4 w-4 text-violet-600" />
            </div>
            <div>
              <p className="text-[11.5px] font-semibold uppercase tracking-wide text-gray-400">Notes</p>
              <p className="text-sm font-medium text-gray-900">{contact.notes}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ContactEditBody({
  contact,
  isNew,
  onSave,
  onClose,
}: {
  contact: Contact | null;
  isNew: boolean;
  onSave: (_data: ContactFormData, _id?: number) => void | Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(() => contact?.name ?? "");
  const [phone, setPhone] = useState(() => contact?.phone ?? "");
  const [email, setEmail] = useState(() => contact?.email ?? "");
  const [city, setCity] = useState(() => contact?.city ?? "");
  const [segment, setSegment] = useState<ContactSegment>(() => contact?.segment ?? "Nouveau");
  const [notes, setNotes] = useState(() => contact?.notes ?? "");

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) return;
    await onSave(
      {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        city: city.trim(),
        segment,
        notes: notes.trim(),
      },
      contact?.id
    );
  };

  const canSave = Boolean(name.trim() && phone.trim());

  return (
    <>
      <div className="max-h-[60vh] space-y-4 overflow-y-auto py-2 pr-1">
        <div className="mb-4 flex items-center gap-3 border-b border-gray-100 pb-4">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-sm",
              contact?.color ?? "from-brand to-brand-dark"
            )}
          >
            {getInitials(name || "NC")}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{name || "Nouveau contact"}</p>
            <StatusPill segment={segment} label={segment} size="sm" className="mt-1" />
          </div>
        </div>
        <div>
          <Label>Nom complet *</Label>
          <Input
            className="mt-1"
            placeholder="Ex: Fatou Diallo"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Téléphone *</Label>
            <Input
              className="mt-1"
              placeholder="Ex: +221 77 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              className="mt-1"
              placeholder="Ex: fatou@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Ville</Label>
            <Input className="mt-1" placeholder="Ex: Dakar" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div>
            <Label>Segment</Label>
            <select
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={segment}
              onChange={(e) => setSegment(e.target.value as ContactSegment)}
            >
              <option value="VIP">VIP</option>
              <option value="Régulier">Régulier</option>
              <option value="Nouveau">Nouveau</option>
              <option value="Inactif">Inactif</option>
            </select>
          </div>
        </div>
        <div>
          <Label>Notes</Label>
          <Textarea
            className="mt-1 min-h-[72px]"
            placeholder="Ajoutez des notes sur ce contact..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>
        {contact && contact.id !== 0 ? (
          <div className="grid grid-cols-3 gap-3 rounded-xl border border-gray-100 bg-gray-50/90 p-4">
            <div className="text-center">
              <p className="text-base font-bold text-gray-900">{contact.orders}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wide text-gray-400">Commandes</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-gray-900">{formatFCFA(contact.totalSpent)}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wide text-gray-400">Total</p>
            </div>
            <div className="text-center">
              <p className="text-[13px] font-semibold text-gray-900">
                {contact.lastOrder ? formatDateLocaleShort(contact.lastOrder) : "—"}
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wide text-gray-400">Dernière</p>
            </div>
          </div>
        ) : null}
      </div>
      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button
          type="button"
          className="bg-brand hover:bg-brand-dark text-white disabled:opacity-50"
          disabled={!canSave}
          onClick={handleSave}
        >
          <Check className="mr-2 h-4 w-4" strokeWidth={2.5} />
          {isNew ? "Ajouter" : "Enregistrer"}
        </Button>
      </DialogFooter>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ContactsPage Component
   ═══════════════════════════════════════════════════════════════ */

type ModalType = "view" | "edit" | "delete" | null;

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const loadContacts = useCallback(() => contactsService.list(), []);
  const onContactsSuccess = useCallback((data: Contact[]) => {
    setContacts(data);
  }, []);
  const { state: loadState, refetch } = useServiceQuery(loadContacts, {
    showToastOnError: true,
    onSuccess: onContactsSuccess,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [segmentFilter, setSegmentFilter] = useState<ContactSegment | "Tous">("Tous");

  const [activeModal, setActiveModal] = useState<{ type: ModalType; contact: Contact | null }>({
    type: null,
    contact: null,
  });

  const openModal = useCallback((type: ModalType, contact: Contact) => {
    setActiveModal({ type, contact });
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal({ type: null, contact: null });
  }, []);

  const { type: modalType, contact: selectedContact } = activeModal;

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchesSearch = matchesQuery(c, searchQuery, ["name", "phone", "city"]);
      const matchesSegment = segmentFilter === "Tous" || c.segment === segmentFilter;
      return matchesSearch && matchesSegment;
    });
  }, [contacts, searchQuery, segmentFilter]);

  const {
    page: safePage,
    setPage: setCurrentPage,
    totalPages,
    slice: paginatedContacts,
    resetPage,
  } = usePagination(filteredContacts, ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    resetPage();
  };

  const handleSegmentChange = (value: ContactSegment | "Tous") => {
    setSegmentFilter(value);
    resetPage();
  };

  const handleOpenAdd = () =>
    openModal("edit", {
      id: 0,
      name: "",
      phone: "",
      email: "",
      city: "",
      segment: "Nouveau",
      orders: 0,
      totalSpent: 0,
      lastOrder: "",
      notes: "",
      avatar: "NC",
      color: pickFromPalette(GRADIENT_PALETTE, `new-${Date.now()}`),
    });

  const handleSave = async (formData: ContactFormData, existingId?: number) => {
    if (!formData.name.trim() || !formData.phone.trim()) return;
    if (existingId) {
      const result = await contactsService.update(existingId, formData);
      if (toastIfFailed(result)) return;
    } else {
      const result = await contactsService.create(formData);
      if (toastIfFailed(result)) return;
    }
    await refetch();
    closeModal();
  };

  const handleDelete = useCallback(async () => {
    if (!selectedContact) return;
    const result = await contactsService.remove(selectedContact.id);
    if (toastIfFailed(result)) return;
    await refetch();
    resetPage();
    closeModal();
  }, [selectedContact, resetPage, closeModal, refetch]);

  /* ──────────────── Segment Counts ──────────────── */

  const segmentCounts = useMemo(
    () =>
      contacts.reduce<Record<string, number>>(
        (acc, c) => {
          acc[c.segment] = (acc[c.segment] || 0) + 1;
          return acc;
        },
        { Tous: contacts.length },
      ),
    [contacts],
  );

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */

  const isInitialLoading =
    loadState.status === "loading" && contacts.length === 0;

  return (
    <div className="space-y-6">
      {isInitialLoading ? (
        <div className="rounded-xl border border-gray-100 bg-white px-4 py-12 text-center text-sm text-gray-500">
          Chargement des contacts…
        </div>
      ) : null}
      <PageHeader
        icon={Users}
        title="Contacts"
        subtitle={
          <>
            {filteredContacts.length} contact{filteredContacts.length > 1 ? "s" : ""}
            {segmentFilter !== "Tous" && ` · ${segmentFilter}`}
          </>
        }
        actions={
          <Button
            onClick={handleOpenAdd}
            className="h-10 rounded-xl bg-brand px-4 font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un contact
          </Button>
        }
      />

      <div className="rounded-2xl border border-gray-100 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <SearchInput
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Rechercher par nom, téléphone ou ville…"
              inputClassName={cn(
                "h-10 rounded-xl border-gray-200 bg-gray-50 focus:bg-white",
                searchQuery && "pr-10"
              )}
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                aria-label="Effacer la recherche"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1 rounded-xl bg-gray-100 p-1 md:flex">
              {segmentFilterOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSegmentChange(opt.value)}
                  className={cn(
                    "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                    segmentFilter === opt.value
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {opt.label}
                  {opt.value !== "Tous" && (
                    <span className="ml-1 text-[10px] opacity-60">{segmentCounts[opt.value] || 0}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="md:hidden">
              <Select
                value={segmentFilter}
                onValueChange={(v) => handleSegmentChange(v as ContactSegment | "Tous")}
              >
                <SelectTrigger className="h-10 w-[130px] rounded-xl">
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

            <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "cursor-pointer rounded-lg p-2 transition-all",
                  viewMode === "grid" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}
                title="Vue grille"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "cursor-pointer rounded-lg p-2 transition-all",
                  viewMode === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}
                title="Vue liste"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredContacts.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white">
          <EmptyState
            icon={Users}
            title="Aucun contact trouvé"
            description={
              searchQuery || segmentFilter !== "Tous"
                ? "Essayez de modifier vos filtres de recherche"
                : "Commencez par ajouter votre premier contact"
            }
            action={
              !searchQuery && segmentFilter === "Tous" ? (
                <Button
                  onClick={handleOpenAdd}
                  className="rounded-xl bg-brand font-semibold text-white hover:bg-brand-dark"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un contact
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {paginatedContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onView={(c) => openModal("view", c)}
                  onEdit={(c) => openModal("edit", c)}
                  onDelete={(c) => openModal("delete", c)}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Contact
                      </th>
                      <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 sm:table-cell">
                        Téléphone
                      </th>
                      <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 lg:table-cell">
                        Ville
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Segment
                      </th>
                      <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 md:table-cell">
                        Commandes
                      </th>
                      <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 lg:table-cell">
                        Total
                      </th>
                      <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 xl:table-cell">
                        Dernière commande
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedContacts.map((contact) => (
                      <ContactRow
                        key={contact.id}
                        contact={contact}
                        onView={(c) => openModal("view", c)}
                        onEdit={(c) => openModal("edit", c)}
                        onDelete={(c) => openModal("delete", c)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {filteredContacts.length > ITEMS_PER_PAGE ? (
        <div>
          <Pagination page={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
          <p className="mt-2 text-center text-xs text-gray-400">
            {formatPageRange(
              (safePage - 1) * ITEMS_PER_PAGE + 1,
              Math.min(safePage * ITEMS_PER_PAGE, filteredContacts.length),
              filteredContacts.length
            )}{" "}
            contacts
          </p>
        </div>
      ) : null}

      <Dialog open={modalType === "view" && !!selectedContact} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent className="max-h-[90vh] bg-white text-gray-900 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails du contact</DialogTitle>
            <DialogDescription className="sr-only">Informations du contact</DialogDescription>
          </DialogHeader>
          {selectedContact ? <ContactViewContent contact={selectedContact} /> : null}
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Fermer
            </Button>
            <Button
              type="button"
              className="bg-brand hover:bg-brand-dark text-white"
              onClick={() =>
                selectedContact && setActiveModal({ type: "edit", contact: selectedContact })
              }
            >
              <Edit3 className="mr-2 h-4 w-4" strokeWidth={2.5} />
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalType === "edit" && !!selectedContact} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent className="max-h-[90vh] bg-white text-gray-900 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedContact?.id === 0 ? "Nouveau contact" : `Modifier ${selectedContact?.name}`}
            </DialogTitle>
          </DialogHeader>
          {selectedContact ? (
            <ContactEditBody
              key={selectedContact.id}
              contact={selectedContact.id === 0 ? null : selectedContact}
              isNew={selectedContact.id === 0}
              onSave={handleSave}
              onClose={closeModal}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={modalType === "delete" && !!selectedContact}
        title="Supprimer le contact"
        message={
          selectedContact
            ? `Le contact « ${selectedContact.name} » sera définitivement supprimé. Cette action est irréversible.`
            : ""
        }
        confirmLabel="Supprimer"
        confirmVariant="danger"
        onConfirm={() => {
          void handleDelete();
        }}
        onCancel={closeModal}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ContactCard (Grid View)
   ═══════════════════════════════════════════════════════════════ */

function ContactCard({
  contact,
  onView,
  onEdit,
  onDelete,
}: {
  contact: Contact;
  onView: (_c: Contact) => void;
  onEdit: (_c: Contact) => void;
  onDelete: (_c: Contact) => void;
}) {
  return (
    <div
      className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-200 group cursor-pointer"
      onClick={() => onView(contact)}
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
        <StatusPill segment={contact.segment} label={contact.segment} size="sm" />
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
            <span className="truncate">{formatDateLocaleShort(contact.lastOrder)}</span>
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
          <button onClick={(e) => { e.stopPropagation(); onView(contact); }} className="p-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer" title="Voir"><Eye className="w-3.5 h-3.5 text-blue-500" /></button>
          <button onClick={(e) => { e.stopPropagation(); onEdit(contact); }} className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" title="Modifier"><Edit3 className="w-3.5 h-3.5 text-gray-500" /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(contact); }} className="p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer" title="Supprimer"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
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
  onView,
  onEdit,
  onDelete,
}: {
  contact: Contact;
  onView: (_c: Contact) => void;
  onEdit: (_c: Contact) => void;
  onDelete: (_c: Contact) => void;
}) {
  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors group">
      {/* Contact name + avatar */}
      <td className="px-5 py-3.5">
        <button
          onClick={() => onView(contact)}
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
        <StatusPill segment={contact.segment} label={contact.segment} size="sm" />
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
          {formatDateLocaleShort(contact.lastOrder)}
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
