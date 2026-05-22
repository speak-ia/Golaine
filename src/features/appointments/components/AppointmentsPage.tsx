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
} from "@shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { ConfirmModal } from "@shared/components/feedback/ConfirmModal";
import { Input } from "@shared/components/ui/input";
import { Textarea } from "@shared/components/ui/textarea";
import { Badge } from "@shared/components/ui/badge";
import type { AppointmentType, AppointmentStatus } from "@shared/constants/status";
import { APPOINTMENT_TYPE, APPOINTMENT_STATUS } from "@shared/constants/status";
import type { Appointment } from "@shared/types/domainTypes";
import { appointmentsService } from "@features/appointments/service";
import { useServiceQuery } from "@shared/hooks/useServiceQuery";
import { toastIfFailed } from "@shared/utils/toastResult";
import { toast } from "sonner";
import {
  DAYS_FR_SHORT,
  MONTHS_FR_CAP,
  formatDateFromISO,
  formatDateShortFromISO,
  getMonday,
  getSunday,
  toDateKey,
} from "@shared/utils/date";
import { StatCard } from "@shared/components/feedback/StatCard";
import { StatusPill } from "@shared/components/feedback/StatusPill";
import { EmptyState } from "@shared/components/feedback/EmptyState";
import { cn } from "@shared/utils/cn";

/* ──────────────────── Constants ──────────────────── */
const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

/* ──────────────────── Helpers ──────────────────── */
function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${h}h${mins}` : `${h}h`;
  }
  return `${minutes}min`;
}

function getCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const padding = Array.from({ length: startDay }, () => null as null);
  const daysOfMonth = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
  return [...padding, ...daysOfMonth];
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
  onDateSelect: (_date: Date) => void;
  selectedDate: string | null;
  appointmentDates: Set<string>;
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getCalendarDays(year, month);
  const todayKey = toDateKey(new Date());

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">
          {MONTHS_FR_CAP[month]} {year}
        </h3>
      </div>

      <div className="-mx-1 overflow-x-auto px-1 sm:mx-0 sm:overflow-visible sm:px-0">
        <div className="min-w-[280px]">
          {/* Day headers */}
          <div className="mb-1 grid grid-cols-7 gap-1">
        {DAYS_FR_SHORT.map((day) => (
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
                  ? "bg-brand text-white"
                  : isSelected
                    ? "bg-brand-dark text-white ring-2 ring-brand/30"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              {day.getDate()}
              {hasAppts && (
                <span
                  className={`absolute bottom-0.5 w-1 h-1 rounded-full ${
                    isToday || isSelected ? "bg-white" : "bg-brand"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
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
  onEdit: (_apt: Appointment) => void;
  onDelete: (_apt: Appointment) => void;
}) {
  const typeConfig = APPOINTMENT_TYPE[appointment.type];
  const statusConfig = APPOINTMENT_STATUS[appointment.status];
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
              <TypeIcon className={cn("h-4 w-4", typeConfig.text)} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {appointment.title}
              </h4>
            </div>
          </div>

          {/* Badges */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            <StatusPill label={typeConfig.label} tone={typeConfig} size="sm" />
            <StatusPill label={statusConfig.label} tone={statusConfig} size="sm" />
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
              <span>
                {formatDateShortFromISO(appointment.date)} à {appointment.time}
              </span>
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
            className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-dark"
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
export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<AppointmentType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<Omit<Appointment, "id">>(getEmptyForm());

  /* ── Derived Data ── */
  const loadAppointments = useCallback(() => appointmentsService.list(), []);
  useServiceQuery(loadAppointments, {
    showToastOnError: true,
    onSuccess: (data) => setAppointments(data),
  });

  const todayKey = toDateKey(new Date());
  const monday = getMonday(new Date());
  const sunday = getSunday(new Date());

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

    // Sort by date then time (copie : sort() muterait le tableau dérivé)
    return [...result].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });
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

  const handleSave = useCallback(async () => {
    if (!formData.title.trim()) return;

    if (editingAppointment) {
      const result = await appointmentsService.update(editingAppointment.id, formData);
      if (toastIfFailed(result)) return;
      setAppointments((prev) =>
        prev.map((a) => (a.id === editingAppointment.id ? result.data : a)),
      );
      toast.success("Rendez-vous mis à jour");
    } else {
      const result = await appointmentsService.create(formData);
      if (toastIfFailed(result)) return;
      setAppointments((prev) => [...prev, result.data]);
      toast.success("Rendez-vous ajouté");
    }

    setIsFormOpen(false);
    setEditingAppointment(null);
  }, [formData, editingAppointment]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    const result = await appointmentsService.remove(deleteTarget.id);
    if (toastIfFailed(result)) return;
    setAppointments((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    toast.success("Rendez-vous supprimé");
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
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Aujourd'hui"
          value={stats.today}
          icon={CalendarDays}
          iconColor="#25D366"
          iconBg="#E8F8EF"
          variant="compact"
        />
        <StatCard
          label="Cette semaine"
          value={stats.week}
          icon={CalendarClock}
          iconColor="#F97316"
          iconBg="#FFF7ED"
          variant="compact"
        />
        <StatCard
          label="Confirmés"
          value={stats.confirmed}
          icon={CalendarCheck}
          iconColor="#16A34A"
          iconBg="#DCFCE7"
          variant="compact"
        />
        <StatCard
          label="En attente"
          value={stats.pending}
          icon={Clock}
          iconColor="#EAB308"
          iconBg="#FEFCE8"
          variant="compact"
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
                    {formatDateFromISO(selectedDate, true)}
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
              {selectedDate ? ` pour le ${formatDateShortFromISO(selectedDate)}` : ""}
            </p>
          </div>

          {/* Appointment list */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
            {filteredAppointments.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-white">
                <EmptyState
                  icon={CalendarDays}
                  title="Aucun rendez-vous pour cette période"
                  description="Modifiez les filtres ou sélectionnez une autre date."
                />
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
                    {(Object.keys(APPOINTMENT_TYPE) as AppointmentType[]).map((t) => (
                      <SelectItem key={t} value={t}>
                        {APPOINTMENT_TYPE[t].label}
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
                  {(Object.keys(APPOINTMENT_STATUS) as AppointmentStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {APPOINTMENT_STATUS[s].label}
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

      <ConfirmModal
        open={deleteTarget !== null}
        title="Supprimer ce rendez-vous ?"
        message={
          deleteTarget
            ? `Cette action est irréversible. Le rendez-vous « ${deleteTarget.title} » sera définitivement supprimé.`
            : ""
        }
        confirmLabel="Supprimer"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
