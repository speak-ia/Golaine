"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Send,
  ShoppingCart,
  TrendingUp,
  UserPlus,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
  Bot,
  SmilePlus,
  BarChart3,
  Package,
  CircleCheck,
  UserCircle,
  MessageCircle,
  ShoppingBag,
  AlertCircle,
  Star,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════════════════════════ */

const FRENCH_DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const FRENCH_MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

function formatFCFA(value: number): string {
  return value.toLocaleString("fr-FR", { useGrouping: true }) + " FCFA";
}

function formatDateFR(date: Date): string {
  return `${date.getDate()} ${FRENCH_MONTHS[date.getMonth()]}`;
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

/* ════════════════════════════════════════════════════════════════
   WEEK SELECTOR
   ════════════════════════════════════════════════════════════════ */

function WeekSelector({
  weekOffset,
  onPrev,
  onNext,
  onReset,
}: {
  weekOffset: number;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
}) {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1) + weekOffset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const canGoBack = weekOffset > -52;
  const canGoForward = weekOffset < 0;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Rapport hebdomadaire
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Semaine du {formatDateFR(monday)} au {formatDateFR(sunday)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={!canGoBack}
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
            canGoBack
              ? "border-gray-200 hover:bg-gray-50 text-gray-600"
              : "border-gray-100 text-gray-300 cursor-not-allowed"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onReset}
          className="h-9 px-4 rounded-xl bg-[#E8F8EF] text-[#16A34A] text-sm font-medium hover:bg-[#d0f0de] transition-colors cursor-pointer"
        >
          Cette semaine
        </button>
        <button
          onClick={onNext}
          disabled={!canGoForward}
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
            canGoForward
              ? "border-gray-200 hover:bg-gray-50 text-gray-600"
              : "border-gray-100 text-gray-300 cursor-not-allowed"
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   KPI CARD
   ════════════════════════════════════════════════════════════════ */

interface KPICardData {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

function KPICard({ data }: { data: KPICardData }) {
  const Icon = data.icon;
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 font-medium truncate">{data.label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.value}</p>
          <div className="flex items-center gap-1 mt-2">
            {data.trendUp ? (
              <ArrowUpRight className="w-3.5 h-3.5 text-[#25D366]" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
            )}
            <span
              className={`text-xs font-medium ${
                data.trendUp ? "text-[#25D366]" : "text-red-500"
              }`}
            >
              {data.trend} vs semaine dernière
            </span>
          </div>
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: data.iconBg }}
        >
          <Icon className="w-5 h-5" style={{ color: data.iconColor }} />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   DAILY ACTIVITY CHART (CSS-based)
   ════════════════════════════════════════════════════════════════ */

function DailyActivityChart() {
  const values = [28, 35, 42, 38, 45, 52, 15];
  const maxVal = Math.max(...values);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-sm font-bold text-gray-700">
            Messages par jour
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Volume de messages sur la semaine
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-[#25D366]" />
            <span className="text-[11px] text-gray-400">Semaine</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-[#86EFAC]" />
            <span className="text-[11px] text-gray-400">Week-end</span>
          </div>
        </div>
      </div>

      {/* Chart area */}
      <div className="relative mt-6">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[11px] text-gray-400">
          <span>{maxVal}</span>
          <span>{Math.round((maxVal * 3) / 4)}</span>
          <span>{Math.round(maxVal / 2)}</span>
          <span>{Math.round(maxVal / 4)}</span>
          <span>0</span>
        </div>

        {/* Bars */}
        <div className="ml-10">
          {/* Grid lines */}
          <div className="relative h-48 flex flex-col justify-between mb-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="border-t border-dashed border-gray-100 w-full"
              />
            ))}

            {/* Bars container */}
            <div className="absolute inset-0 flex items-end justify-around gap-2 sm:gap-4 px-1">
              {values.map((val, i) => {
                const heightPercent = (val / maxVal) * 100;
                const isWeekend = i >= 5;
                const isHovered = hoveredIndex === i;

                return (
                  <div
                    key={i}
                    className="flex flex-col items-center flex-1 relative"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Tooltip */}
                    <div
                      className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all duration-200 whitespace-nowrap pointer-events-none z-10 ${
                        isHovered
                          ? "opacity-100 -translate-y-1"
                          : "opacity-0"
                      }`}
                    >
                      {val} messages
                      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-gray-800" />
                    </div>

                    {/* Bar */}
                    <div
                      className={`w-full max-w-[48px] rounded-t-lg transition-all duration-300 ease-out ${
                        isWeekend ? "bg-[#86EFAC]" : "bg-[#25D366]"
                      } ${isHovered ? "opacity-80" : ""}`}
                      style={{
                        height: `${heightPercent}%`,
                        minHeight: val > 0 ? "4px" : "0px",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* X-axis labels */}
          <div className="flex justify-around gap-2 sm:gap-4 px-1">
            {FRENCH_DAYS.map((day) => (
              <span
                key={day}
                className="flex-1 text-center text-[11px] text-gray-400 font-medium"
              >
                {day}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Summary row */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">
            {values.reduce((a, b) => a + b, 0)}
          </p>
          <p className="text-[11px] text-gray-400">Total messages</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">
            {Math.round(
              values.reduce((a, b) => a + b, 0) / (values.filter(v => v > 0).length || 1)
            )}
          </p>
          <p className="text-[11px] text-gray-400">Moyenne / jour</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-[#25D366]">
            {FRENCH_DAYS[values.indexOf(Math.max(...values))]}
          </p>
          <p className="text-[11px] text-gray-400">Jour le plus actif</p>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   TOP PRODUCTS TABLE
   ════════════════════════════════════════════════════════════════ */

function TopProductsTable() {
  const products = [
    {
      rank: 1,
      name: "Robe Wax S-400",
      quantity: 18,
      revenue: 90_000,
      percentage: 28,
    },
    {
      rank: 2,
      name: "Bissap 1L",
      quantity: 45,
      revenue: 67_500,
      percentage: 21,
    },
    {
      rank: 3,
      name: "Pagne Tissé Premium",
      quantity: 8,
      revenue: 64_000,
      percentage: 19,
    },
    {
      rank: 4,
      name: "Huile d'Argan Bio",
      quantity: 5,
      revenue: 60_000,
      percentage: 18,
    },
    {
      rank: 5,
      name: "Thiakry Nature",
      quantity: 20,
      revenue: 40_000,
      percentage: 14,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-gray-700">
            Produits les plus vendus
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Classement par chiffre d'affaires
          </p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#F3F0FF] flex items-center justify-center">
          <Package className="w-4.5 h-4.5 text-purple-600" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-3">
                #
              </th>
              <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-3">
                Produit
              </th>
              <th className="text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-3">
                Quantité
              </th>
              <th className="text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-3">
                CA (FCFA)
              </th>
              <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-3 w-40">
                % du total
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.rank}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
              >
                <td className="py-3.5 pr-3">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-[11px] font-bold ${
                      product.rank === 1
                        ? "bg-yellow-50 text-yellow-600"
                        : product.rank === 2
                        ? "bg-gray-100 text-gray-500"
                        : product.rank === 3
                        ? "bg-orange-50 text-orange-500"
                        : "bg-gray-50 text-gray-400"
                    }`}
                  >
                    {product.rank}
                  </span>
                </td>
                <td className="py-3.5 pr-3">
                  <span className="text-sm font-medium text-gray-700">
                    {product.name}
                  </span>
                </td>
                <td className="py-3.5 pr-3 text-right">
                  <span className="text-sm text-gray-600">
                    {product.quantity}
                  </span>
                </td>
                <td className="py-3.5 pr-3 text-right">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatFCFA(product.revenue)}
                  </span>
                </td>
                <td className="py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#25D366] to-[#16A34A] transition-all duration-700 ease-out"
                        style={{ width: `${product.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 w-8 text-right">
                      {product.percentage}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <span className="text-sm font-semibold text-gray-500">Total</span>
        <span className="text-sm font-bold text-gray-900">
          {formatFCFA(321_500)}
        </span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   AI PERFORMANCE SECTION
   ════════════════════════════════════════════════════════════════ */

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(max)].map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < Math.floor(rating)
              ? "fill-amber-400 text-amber-400"
              : i < rating
              ? "fill-amber-400/50 text-amber-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

function AIPerformance() {
  const metrics = [
    {
      icon: Zap,
      label: "Temps de réponse moyen",
      value: "2.3 secondes",
      percentage: 92,
      color: "#25D366",
      bgColor: "#E8F8EF",
    },
    {
      icon: CircleCheck,
      label: "Taux de résolution",
      value: "89%",
      percentage: 89,
      color: "#8B5CF6",
      bgColor: "#F3F0FF",
    },
    {
      icon: SmilePlus,
      label: "Satisfaction client",
      value: "4.5/5",
      percentage: 90,
      color: "#F59E0B",
      bgColor: "#FFFBEB",
      extra: <StarRating rating={4.5} />,
    },
    {
      icon: Bot,
      label: "Conversations automatisées",
      value: "87%",
      percentage: 87,
      color: "#0EA5E9",
      bgColor: "#F0F9FF",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-gray-700">
            Performance de l&apos;Agent IA
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Métriques clés de la semaine
          </p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#E8F8EF] flex items-center justify-center">
          <BarChart3 className="w-4.5 h-4.5 text-[#16A34A]" />
        </div>
      </div>

      <div className="space-y-5">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: metric.bgColor }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ color: metric.color }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {metric.label}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        {metric.value}
                      </span>
                      {metric.extra}
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden ml-[42px]">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${metric.percentage}%`,
                    backgroundColor: metric.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ACTIVITY TIMELINE
   ════════════════════════════════════════════════════════════════ */

type EventType = "sale" | "message" | "event" | "contact";

interface TimelineEvent {
  day: string;
  time: string;
  text: string;
  type: EventType;
}

const EVENT_STYLES: Record<
  EventType,
  { dot: string; ring: string; icon: React.ElementType; iconBg: string }
> = {
  sale: {
    dot: "bg-[#25D366]",
    ring: "ring-[#25D366]/20",
    icon: ShoppingBag,
    iconBg: "bg-[#E8F8EF] text-[#16A34A]",
  },
  message: {
    dot: "bg-[#3B82F6]",
    ring: "ring-[#3B82F6]/20",
    icon: MessageCircle,
    iconBg: "bg-[#EFF6FF] text-[#3B82F6]",
  },
  event: {
    dot: "bg-[#F97316]",
    ring: "ring-[#F97316]/20",
    icon: AlertCircle,
    iconBg: "bg-[#FFF7ED] text-[#F97316]",
  },
  contact: {
    dot: "bg-[#8B5CF6]",
    ring: "ring-[#8B5CF6]/20",
    icon: UserCircle,
    iconBg: "bg-[#F3F0FF] text-[#8B5CF6]",
  },
};

function TimelineItem({ event }: { event: TimelineEvent }) {
  const style = EVENT_STYLES[event.type];
  const Icon = style.icon;

  return (
    <div className="relative flex gap-4 group">
      {/* Timeline dot & line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className={`w-3 h-3 rounded-full ${style.dot} ring-4 ${style.ring} z-10 mt-1.5`}
        />
        {/* Connecting line - hidden for last item via CSS */}
        <div className="w-0.5 flex-1 bg-gray-100 min-h-[24px]" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-5 group-last:pb-0">
        <div className="flex items-center gap-2 mb-1">
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center ${style.iconBg}`}
          >
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            {event.day} · {event.time}
          </span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed ml-8">
          {event.text}
        </p>
      </div>
    </div>
  );
}

function ActivityTimeline() {
  const events: TimelineEvent[] = [
    {
      day: "Dimanche",
      time: "18:45",
      text: "Rapport hebdomadaire généré automatiquement",
      type: "event",
    },
    {
      day: "Samedi",
      time: "14:20",
      text: "Commande #1008 confirmée par Aminata Sow — 15 000 FCFA",
      type: "sale",
    },
    {
      day: "Samedi",
      time: "10:05",
      text: "Pic de messages : 52 messages traités par l'IA",
      type: "message",
    },
    {
      day: "Vendredi",
      time: "16:30",
      text: "Nouveau contact : Oumar Bah — intéressé par les pagnes tissés",
      type: "contact",
    },
    {
      day: "Vendredi",
      time: "09:12",
      text: "Agent IA a résolu 12 conversations sans intervention",
      type: "message",
    },
    {
      day: "Jeudi",
      time: "15:48",
      text: "Commande #1005 livrée avec succès — Fatou Diallo",
      type: "sale",
    },
    {
      day: "Jeudi",
      time: "11:00",
      text: "Mise à jour du catalogue : 3 nouveaux produits ajoutés",
      type: "event",
    },
    {
      day: "Mercredi",
      time: "17:22",
      text: "Nouveau contact : Aïssatou Ndiaye — recommandée par Fatou",
      type: "contact",
    },
    {
      day: "Mercredi",
      time: "10:30",
      text: "Commande #1003 confirmée par Moussa Traoré — 32 000 FCFA",
      type: "sale",
    },
    {
      day: "Mardi",
      time: "16:45",
      text: "Nouveau contact : Boubacar Diallo — secteur agroalimentaire",
      type: "contact",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-gray-700">
            Activité de la semaine
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {events.length} événements cette semaine
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#25D366]" />
            <span className="text-[11px] text-gray-400">Ventes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            <span className="text-[11px] text-gray-400">Messages</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#F97316]" />
            <span className="text-[11px] text-gray-400">Événements</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
            <span className="text-[11px] text-gray-400">Contacts</span>
          </div>
        </div>
      </div>

      <div className="max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
        {events.map((event, i) => (
          <TimelineItem key={i} event={event} />
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════ */

export default function RapportHebdoPage() {
  const [weekOffset, setWeekOffset] = useState(0);

  const handlePrev = () => {
    setWeekOffset((prev) => Math.max(prev - 1, -52));
  };

  const handleNext = () => {
    setWeekOffset((prev) => Math.min(prev + 1, 0));
  };

  const handleReset = () => {
    setWeekOffset(0);
  };

  const kpiCards: KPICardData[] = [
    {
      label: "Messages reçus",
      value: "245",
      trend: "+12%",
      trendUp: true,
      icon: MessageSquare,
      iconColor: "#25D366",
      iconBg: "#E8F8EF",
    },
    {
      label: "Messages envoyés (IA)",
      value: "198",
      trend: "+8%",
      trendUp: true,
      icon: Send,
      iconColor: "#3B82F6",
      iconBg: "#EFF6FF",
    },
    {
      label: "Nouvelles commandes",
      value: "12",
      trend: "+25%",
      trendUp: true,
      icon: ShoppingCart,
      iconColor: "#8B5CF6",
      iconBg: "#F3F0FF",
    },
    {
      label: "Chiffre d'affaires",
      value: "245 000 FCFA",
      trend: "+18%",
      trendUp: true,
      icon: TrendingUp,
      iconColor: "#059669",
      iconBg: "#ECFDF5",
    },
    {
      label: "Nouveaux contacts",
      value: "8",
      trend: "+5%",
      trendUp: true,
      icon: UserPlus,
      iconColor: "#F97316",
      iconBg: "#FFF7ED",
    },
    {
      label: "Taux de conversion",
      value: "15.2%",
      trend: "+2.1%",
      trendUp: true,
      icon: Target,
      iconColor: "#0891B2",
      iconBg: "#ECFEFF",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Week Selector */}
      <WeekSelector
        weekOffset={weekOffset}
        onPrev={handlePrev}
        onNext={handleNext}
        onReset={handleReset}
      />

      {/* KPI Cards — 2x3 on desktop, 1 col mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((kpi) => (
          <KPICard key={kpi.label} data={kpi} />
        ))}
      </div>

      {/* Daily Activity Chart — full width */}
      <DailyActivityChart />

      {/* Products Table + AI Performance — side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopProductsTable />
        <AIPerformance />
      </div>

      {/* Activity Timeline — full width */}
      <ActivityTimeline />
    </div>
  );
}
