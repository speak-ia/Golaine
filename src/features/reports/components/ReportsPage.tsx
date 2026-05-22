"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { reportsService } from "@features/reports/service";
import type {
  ReportAiMetric,
  ReportTimelineEvent,
  ReportTopProduct,
  WeeklyReport,
} from "@features/reports/types";
import { useServiceQuery } from "@shared/hooks/useServiceQuery";
import { Loader2 } from "lucide-react";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Send,
  ShoppingCart,
  TrendingUp,
  UserPlus,
  Target,
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
} from "lucide-react";
import { formatFCFA } from "@shared/utils/format";
import { DAYS_FR_SHORT, formatDateFR } from "@shared/utils/date";
import { StatCard } from "@shared/components/feedback/StatCard";

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
          className="h-9 cursor-pointer rounded-xl bg-brand-tint px-4 text-sm font-medium text-brand-dark transition-colors hover:bg-brand-soft"
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
   DAILY ACTIVITY CHART (CSS-based)
   ════════════════════════════════════════════════════════════════ */

function DailyActivityChart({ values }: { values: number[] }) {
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
            {DAYS_FR_SHORT.map((day) => (
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
            {DAYS_FR_SHORT[values.indexOf(Math.max(...values))]}
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

function TopProductsTable({
  products,
  total,
}: {
  products: ReportTopProduct[];
  total: number;
}) {
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

      {products.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">
          Aucune vente enregistrée sur cette semaine.
        </p>
      ) : (
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
      )}

      {products.length > 0 && (
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <span className="text-sm font-semibold text-gray-500">Total</span>
        <span className="text-sm font-bold text-gray-900">
          {formatFCFA(total)}
        </span>
      </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   AI PERFORMANCE SECTION
   ════════════════════════════════════════════════════════════════ */

const AI_ICONS = [Zap, CircleCheck, SmilePlus, Bot] as const;

function AIPerformance({ metrics }: { metrics: ReportAiMetric[] }) {
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
        {metrics.length === 0 ? (
          <p className="text-sm text-gray-500">Pas encore de données IA sur cette période.</p>
        ) : null}
        {metrics.map((metric, i) => {
          const Icon = AI_ICONS[i] ?? Bot;
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

function ActivityTimeline({ events }: { events: ReportTimelineEvent[] }) {
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
        {events.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">
            Aucune activité enregistrée cette semaine.
          </p>
        ) : (
          events.map((event, i) => (
            <TimelineItem key={`${event.day}-${event.time}-${i}`} event={event} />
          ))
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════ */

const EMPTY_REPORT: WeeklyReport = {
  messagesPerDay: [0, 0, 0, 0, 0, 0, 0],
  kpis: [],
  topProducts: [],
  topProductsTotal: 0,
  aiMetrics: [],
  timeline: [],
};

export default function ReportsPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [report, setReport] = useState<WeeklyReport>(EMPTY_REPORT);

  const loadReport = useCallback(
    () => reportsService.getWeeklyReport(weekOffset),
    [weekOffset],
  );

  const { state: reportState, refetch } = useServiceQuery(loadReport, {
    showToastOnError: true,
    onSuccess: (data) => setReport(data),
  });

  const weekLoaded = useRef(false);
  useEffect(() => {
    if (!weekLoaded.current) {
      weekLoaded.current = true;
      return;
    }
    void refetch();
  }, [weekOffset, refetch]);

  const handlePrev = () => {
    setWeekOffset((prev) => Math.max(prev - 1, -52));
  };

  const handleNext = () => {
    setWeekOffset((prev) => Math.min(prev + 1, 0));
  };

  const handleReset = () => {
    setWeekOffset(0);
  };

  const loading = reportState.status === "loading";

  return (
    <div className="space-y-6">
      {/* Week Selector */}
      <WeekSelector
        weekOffset={weekOffset}
        onPrev={handlePrev}
        onNext={handleNext}
        onReset={handleReset}
      />

      {loading && report.kpis.length === 0 ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      ) : (
        <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {report.kpis.map((kpi) => (
          <StatCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            iconColor={kpi.iconColor}
            iconBg={kpi.iconBg}
            trend={`${kpi.trend} vs semaine dernière`}
            trendUp={kpi.trendUp}
          />
        ))}
      </div>

      {/* Daily Activity Chart — full width */}
      <DailyActivityChart values={report.messagesPerDay} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopProductsTable products={report.topProducts} total={report.topProductsTotal} />
        <AIPerformance metrics={report.aiMetrics} />
      </div>

      <ActivityTimeline events={report.timeline} />
        </>
      )}
    </div>
  );
}
