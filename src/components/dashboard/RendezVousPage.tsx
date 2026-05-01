"use client";

import { useState, useMemo, useCallback } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Clock,
  MapPin,
  User,
  FileText,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Phone,
  Truck,
  Handshake,
  MoreHorizontal,
  Filter,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ──────────────────── Types ──────────────────── */
type AppointmentType = "livraison" | "rendez-vous" | "appel" | "autre";
type AppointmentStatus = "confirme" | "en_attente" | "annule";

interface Appointment {
  id: number;
  title: string;
  client: string;
  date: string;
  time: string;
  duration: number;
  type: AppointmentType;
  status: AppointmentStatus;
  notes: string;
  location: string;
}

/* ──────────────────── Constants ──────────────────── */
const TYPE_CONFIG: Record<
  AppointmentType,
  { label: string; color: string; bg: string; border: string; icon: React.ElementType }
> = {
  livraison: {
    label: "Livraison",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: Truck,
  },
  "rendez-vous": {
    label: "Rendez-vous",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Handshake,
  },
  appel: {
    label: "Appel",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    icon: Phone,
  },
  autre: {
    label: "Autre",
    color: "text-gray-700",
    bg: "bg-gray-100",
    border: "border-gray-200",
    icon: MoreHorizontal,
  },
};

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; color: string; bg: string; border: string; icon: React.ElementType }
> = {
  confirme: {
    label: "Confirmé",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    icon: CalendarCheck,
  },
  en_attente: {
    label: "En attente",
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    icon: CalendarClock,
  },
  annule: {
    label: "Annulé",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: CalendarX,
  },
};

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

/* ──────────────────── Mock Data ──────────────────── */
const initialAppointments: Appointment[] = [
  { id: 1, title: "Livraison Fatou - Dakar", client: "Fatou Diallo", date: "2025-01-15", time: "10:00", duration: 30, type: "livraison", status: "confirme", notes: "Robes wax + pagnes", location: "Plateau, Dakar" },
  { id: 2, title: "Démo produits - Boutique", client: "Moussa Traoré", date: "2025-01-15", time: "14:00", duration: 60, type: "rendez-vous", status: "en_attente", notes: "Intéressé par les produits alimentaires", location: "Marché Sandaga" },
  { id: 3, title: "Conseil beauté Aminata", client: "Aminata Sow", date: "2025-01-16", time: "09:30", duration: 45, type: "rendez-vous", status: "confirme", notes: "Vente huile d'argan et savon", location: "Almadies, Dakar" },
  { id: 4, title: "Relance Ibrahim", client: "Ibrahim Keita", date: "2025-01-16", time: "11:00", duration: 15, type: "appel", status: "en_attente", notes: "Panier abandonné", location: "" },
  { id: 5, title: "Livraison Awa - Saint-Louis", client: "Awa Ndiaye", date: "2025-01-17", time: "08:00", duration: 120, type: "livraison", status: "confirme", notes: "Commande importante", location: "Saint-Louis" },
  { id: 6, title: "Formation WhatsApp", client: "", date: "2025-01-17", time: "15:00", duration: 90, type: "autre", status: "confirme", notes: "Formation équipe", location: "En ligne" },
  { id: 7, title: "Livraison Oumar", client: "Oumar Ba", date: "2025-01-18", time: "10:00", duration: 30, type: "livraison", status: "en_attente", notes: "Thiakry + Bissap", location: "Médina, Dakar" },
  { id: 8, title: "Rendez-vous Kadiatou", client: "Kadiatou Bah", date: "2025-01-19", time: "13:00", duration: 45, type: "rendez-vous", status: "confirme", notes: "Nouvelle collection", location: "Conakry" },
  { id: 9, title: "Appel prospect", client: "Seydou Ndiaye", date: "2025-01-20", time: "16:00", duration: 15, type: "appel", status: "en_attente", notes: "Premier contact", location: "" },
  { id: 10, title: "Livraison Mariam", client: "Mariam Coulibaly", date: "2025-01-21", time: "09:00", duration: 60, type: "livraison", status: "annule", notes: "Client absente", location: "Bamako" },
  { id: 11, title: "Rencontre fournisseur", client: "", date: "2025-01-22", time: "11:00", duration: 60, type: "autre", status: "confirme", notes: "Nouveau stock wax", location: "Dakar" },
  { id: 12, title: "Suivi Fatima", client: "Fatima Diop", date: "2025-01-22", time: "15:30", duration: 20, type: "appel", status: "confirme", notes: "Satisfaction client", location: "" },
];

/* ──────────────────── Helpers ──────────────────── */
function formatDateFR(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${parseInt(d)} ${MONTHS_FR[parseInt(m) - 1]} ${y}`;
}

function formatDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${parseInt(d)} ${MONTHS_FR[parseInt(m) - 1].substring(0, 3)}`;
}

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${h}h${mins}` : `${h}h`;
  }
  return `${minutes}min`;
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getSunday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() + (7 - day);
  date.setDate(diff);
  date.setHours(23, 59, 59, 999);
  return date;
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (Date | null)[] = [];

  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  return days;
}

function getEmptyForm(): Omit<Appointment, "id"> {
  return {
    title: "",
    client: "",
    date: toDateKey(new Date()),
    time: "09:00",
    duration: 30,
    type: "rendez-vous",
    status: "en_attente",
    notes: "",
    location: "",
  };
}

/* ──────────────────── Calendar Component ──────────────────── */
function MiniCalendar({
  currentDate,
  onDateSelect,
  selectedDate,
  appointmentDates,
}: {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  selectedDate: string | null;
  appointmentDates: Set<string>;
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getCalendarDays(year, month);
  const todayKey = toDateKey(new Date());

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900">
          {MONTHS_FR[month]} {year}
        </h3>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS_FR.map((day) => (
          <div
            key={day}
            className="text-center text-[11px] font-semibold text-gray-400 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} className="h-8" />;
          }

          const dayKey = toDateKey(day);
          const isToday = dayKey === todayKey;
          const isSelected = dayKey === selectedDate;
          const hasAppts = appointmentDates.has(dayKey);

          return (
            <button
              key={dayKey}
              onClick={() => onDateSelect(day)}
              className={`
                relative h-8 w-full rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer
                flex flex-col items-center justify-center
                ${isToday && !isSelected
                  ? "bg-[#25D366] text-white"
                  : isSelected
                    ? "bg-[#16A34A] text-white ring-2 ring-[#16A34A]/30"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              {day.getDate()}
              {hasAppts && (
                <span
                  className={`absolute bottom-0.5 w-1 h-1 rounded-full ${
                    isToday || isSelected ? "bg-white" : "bg-[#25D366]"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────── Stat Card ──────────────────── */
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: bgColor }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

/* ──────────────────── Appointment Card ──────────────────── */
function AppointmentCard({
  appointment,
  onEdit,
  onDelete,
}: {
  appointment: Appointment;
  onEdit: (apt: Appointment) => void;
  onDelete: (apt: Appointment) => void;
}) {
  const typeConfig = TYPE_CONFIG[appointment.type];
  const statusConfig = STATUS_CONFIG[appointment.status];
  const TypeIcon = typeConfig.icon;

  const borderColors: Record<AppointmentType, string> = {
    livraison: "border-l-emerald-500",
    "rendez-vous": "border-l-blue-500",
    appel: "border-l-orange-500",
    autre: "border-l-gray-400",
  };

  return (
    <div
      className={`bg-white rounded-xl p-4 sm:p-5 border border-gray-100 border-l-4 ${borderColors[appointment.type]} hover:shadow-sm transition-shadow`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        {/* Left content */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start gap-2 mb-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeConfig.bg}`}
            >
              <TypeIcon className={`w-4 h-4 ${typeConfig.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {appointment.title}
              </h4>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${typeConfig.bg} ${typeConfig.color} ${typeConfig.border} border`}
            >
              {typeConfig.label}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border`}
            >
              {statusConfig.label}
            </span>
          </div>

          {/* Details */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
            {appointment.client && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3 text-gray-400" />
                <span>{appointment.client}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <CalendarDays className="w-3 h-3 text-gray-400" />
              <span>{formatDateShort(appointment.date)} à {appointment.time}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span>{formatDuration(appointment.duration)}</span>
            </div>
            {appointment.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span>{appointment.location}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="mt-2 flex items-start gap-1.5 text-xs text-gray-500">
              <FileText className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-1">{appointment.notes}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:flex-col sm:gap-1.5 flex-shrink-0">
          <button
            onClick={() => onEdit(appointment)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#16A34A] transition-colors cursor-pointer"
            title="Modifier"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(appointment)}
            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────── Main Component ──────────────────── */
export default function RendezVousPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [calendarDate, setCalendarDate] = useState(() => new Date(2025, 0, 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<AppointmentType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<Omit<Appointment, "id">>(getEmptyForm());

  /* ── Derived Data ── */
  const todayKey = toDateKey(new Date());
  const monday = getMonday(new Date(2025, 0, 15));
  const sunday = getSunday(new Date(2025, 0, 15));

  const appointmentDates = useMemo(() => {
    const dates = new Set<string>();
    appointments.forEach((apt) => dates.add(apt.date));
    return dates;
  }, [appointments]);

  const stats = useMemo(() => {
    const todayAppts = appointments.filter((a) => a.date === todayKey);
    const weekAppts = appointments.filter((a) => {
      const d = new Date(a.date);
      return d >= monday && d <= sunday;
    });
    const confirmed = appointments.filter((a) => a.status === "confirme");
    const pending = appointments.filter((a) => a.status === "en_attente");
    return {
      today: todayAppts.length,
      week: weekAppts.length,
      confirmed: confirmed.length,
      pending: pending.length,
    };
  }, [appointments, todayKey, monday, sunday]);

  const filteredAppointments = useMemo(() => {
    let result = [...appointments];

    // Filter by selected date
    if (selectedDate) {
      result = result.filter((a) => a.date === selectedDate);
    }

    // Filter by type
    if (typeFilter !== "all") {
      result = result.filter((a) => a.type === typeFilter);
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((a) => a.status === statusFilter);
    }

    // Sort by date then time
    result.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

    return result;
  }, [appointments, selectedDate, typeFilter, statusFilter]);

  /* ── Handlers ── */
  const handlePrevMonth = useCallback(() => {
    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleDateSelect = useCallback((date: Date) => {
    const key = toDateKey(date);
    setSelectedDate((prev) => (prev === key ? null : key));
  }, []);

  const handleGoToToday = useCallback(() => {
    setSelectedDate(null);
    setCalendarDate(new Date());
  }, []);

  const handleOpenAdd = useCallback(() => {
    setEditingAppointment(null);
    setFormData(getEmptyForm());
    setIsFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((apt: Appointment) => {
    setEditingAppointment(apt);
    const { id: _id, ...rest } = apt;
    void _id;
    setFormData(rest);
    setIsFormOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!formData.title.trim()) return;

    if (editingAppointment) {
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === editingAppointment.id ? { ...a, ...formData } : a
        )
      );
    } else {
      setAppointments((prev) => {
        const maxId = prev.reduce((max, a) => Math.max(max, a.id), 0);
        return [...prev, { ...formData, id: maxId + 1 }];
      });
    }

    setIsFormOpen(false);
    setEditingAppointment(null);
  }, [formData, editingAppointment]);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    setAppointments((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    setDeleteTarget(null);
  }, [deleteTarget]);

  const updateFormField = useCallback(
    <K extends keyof Omit<Appointment, "id">>(field: K, value: Omit<Appointment, "id">[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  /* ── Render ── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Rendez-vous</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gérez vos rendez-vous, livraisons et appels
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#25D366] to-[#16A34A] text-white font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer shadow-sm shadow-[#25D366]/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nouveau rendez-vous
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Aujourd'hui"
          value={stats.today}
          icon={CalendarDays}
          color="#25D366"
          bgColor="#E8F8EF"
        />
        <StatCard
          label="Cette semaine"
          value={stats.week}
          icon={CalendarClock}
          color="#F97316"
          bgColor="#FFF7ED"
        />
        <StatCard
          label="Confirmés"
          value={stats.confirmed}
          icon={CalendarCheck}
          color="#16A34A"
          bgColor="#DCFCE7"
        />
        <StatCard
          label="En attente"
          value={stats.pending}
          icon={Clock}
          color="#EAB308"
          bgColor="#FEFCE8"
        />
      </div>

      {/* Main content: Calendar + List */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Left: Mini Calendar */}
        <div className="space-y-3">
          <MiniCalendar
            currentDate={calendarDate}
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
            appointmentDates={appointmentDates}
          />
          {/* Calendar nav */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {selectedDate && (
            <button
              onClick={handleGoToToday}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#E8F8EF] text-sm font-semibold text-[#16A34A] hover:bg-[#DCFCE7] transition-colors cursor-pointer"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Aujourd&apos;hui
            </button>
          )}
        </div>

        {/* Right: Appointment List */}
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Filter className="w-4 h-4 text-gray-400" />
                Filtres
              </div>
              <div className="flex flex-wrap gap-2 flex-1">
                {/* Type filter */}
                <Select
                  value={typeFilter}
                  onValueChange={(v) => setTypeFilter(v as AppointmentType | "all")}
                >
                  <SelectTrigger className="w-full sm:w-auto">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="livraison">Livraison</SelectItem>
                    <SelectItem value="rendez-vous">Rendez-vous</SelectItem>
                    <SelectItem value="appel">Appel</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>

                {/* Status filter */}
                <Select
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as AppointmentStatus | "all")}
                >
                  <SelectTrigger className="w-full sm:w-auto">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="confirme">Confirmé</SelectItem>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="annule">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedDate && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">
                    Filtré par date :
                  </span>
                  <Badge variant="secondary" className="text-xs font-semibold bg-[#E8F8EF] text-[#16A34A] border border-[#BBF7D0] hover:bg-[#E8F8EF]">
                    {formatDateFR(selectedDate)}
                  </Badge>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Appointment count */}
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-gray-500">
              {filteredAppointments.length} rendez-vous
              {selectedDate ? ` pour le ${formatDateShort(selectedDate)}` : ""}
            </p>
          </div>

          {/* Appointment list */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
            {filteredAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  <CalendarDays className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Aucun rendez-vous pour cette date
                </p>
                <p className="text-xs text-gray-400">
                  Modifiez les filtres ou sélectionnez une autre date
                </p>
              </div>
            ) : (
              filteredAppointments.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  onEdit={handleOpenEdit}
                  onDelete={setDeleteTarget}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Add/Edit Modal ── */}
      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) setIsFormOpen(false); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              {editingAppointment ? "Modifier le rendez-vous" : "Nouveau rendez-vous"}
            </DialogTitle>
            <DialogDescription>
              {editingAppointment
                ? "Modifiez les informations du rendez-vous ci-dessous."
                : "Remplissez les informations pour créer un nouveau rendez-vous."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Titre *</label>
              <Input
                value={formData.title}
                onChange={(e) => updateFormField("title", e.target.value)}
                placeholder="Ex: Livraison Fatou - Dakar"
                className="w-full"
              />
            </div>

            {/* Client */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Client</label>
              <Input
                value={formData.client}
                onChange={(e) => updateFormField("client", e.target.value)}
                placeholder="Nom du client"
                className="w-full"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Date *</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => updateFormField("date", e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Heure *</label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => updateFormField("time", e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Duration & Type */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Durée</label>
                <Select
                  value={String(formData.duration)}
                  onValueChange={(v) => updateFormField("duration", Number(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        {formatDuration(d)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Type</label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => updateFormField("type", v as AppointmentType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TYPE_CONFIG) as AppointmentType[]).map((t) => (
                      <SelectItem key={t} value={t}>
                        {TYPE_CONFIG[t].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Statut</label>
              <Select
                value={formData.status}
                onValueChange={(v) => updateFormField("status", v as AppointmentStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_CONFIG) as AppointmentStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_CONFIG[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Lieu</label>
              <Input
                value={formData.location}
                onChange={(e) => updateFormField("location", e.target.value)}
                placeholder="Ex: Plateau, Dakar"
                className="w-full"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => updateFormField("notes", e.target.value)}
                placeholder="Notes supplémentaires..."
                rows={3}
                className="w-full resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <button
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Annuler
              </button>
            </DialogClose>
            <button
              onClick={handleSave}
              disabled={!formData.title.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#25D366] to-[#16A34A] text-white font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-[#25D366]/20"
            >
              {editingAppointment ? "Enregistrer" : "Créer"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Modal ── */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Supprimer ce rendez-vous ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Le rendez-vous{" "}
              <span className="font-semibold text-gray-700">
                &quot;{deleteTarget?.title}&quot;
              </span>{" "}
              sera définitivement supprimé.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <button
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Annuler
              </button>
            </DialogClose>
            <button
              onClick={handleDeleteConfirm}
              className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors cursor-pointer"
            >
              Supprimer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
