"use client";

import { lazy, Suspense } from "react";
import {
  Users,
  ShoppingCart,
  CalendarDays,
  TrendingUp,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { useAuthStore, type SidebarView } from "@/lib/store";

/* ── Lazy-loaded page components (code splitting) ── */
const MesProduitsPage = lazy(() => import("./MesProduitsPage"));
const ConversationsPage = lazy(() => import("./ConversationsPage"));
const AgentIAPage = lazy(() => import("./AgentIAPage"));
const TesterAgentPage = lazy(() => import("./TesterAgentPage"));
const WhatsAppConnectionPage = lazy(() => import("./WhatsAppConnectionPage"));
const MonPlanPage = lazy(() => import("./MonPlanPage"));
const RendezVousPage = lazy(() => import("./RendezVousPage"));
const ParametresPage = lazy(() => import("./ParametresPage"));
const ContactsPage = lazy(() => import("./ContactsPage"));
const CommandesPage = lazy(() => import("./CommandesPage"));
const RapportHebdoPage = lazy(() => import("./RapportHebdoPage"));

/* ── Loading fallback ── */
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Chargement…</p>
      </div>
    </div>
  );
}

/* ──────────────────── Metric Card ──────────────────── */
const MetricCard = ({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  trend,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  trend?: string;
}) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <ArrowUpRight className="w-3.5 h-3.5 text-[#25D366]" />
            <span className="text-xs font-medium text-[#25D366]">{trend}</span>
          </div>
        )}
      </div>
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
    </div>
  </div>
);

/* ──────────────────── Progress Card ──────────────────── */
const ProgressCard = ({
  title,
  current,
  max,
  color,
  unit,
}: {
  title: string;
  current: number;
  max: number;
  color: string;
  unit: string;
}) => {
  const percentage = Math.min((current / max) * 100, 100);
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        <span className="text-xs font-medium text-gray-400">
          {current}/{max} {unit}
        </span>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-2">{percentage.toFixed(1)}% utilisé</p>
    </div>
  );
};

/* ──────────────────── Orders Summary ──────────────────── */
const OrdersSummary = () => (
  <div className="bg-gradient-to-br from-[#111827] to-[#1F2937] rounded-2xl p-6 text-white">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-bold tracking-wider text-gray-300">
        RÉSUMÉ COMMANDES
      </h3>
      <ShoppingCart className="w-4 h-4 text-gray-400" />
    </div>
    <p className="text-3xl font-bold text-white">50 000F</p>
    <p className="text-sm text-[#25D366] mt-2 font-medium">
      Confirmées + livrées
    </p>
    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
      <div>
        <p className="text-xs text-gray-400">Total</p>
        <p className="text-sm font-semibold text-white">2 commandes</p>
      </div>
      <div>
        <p className="text-xs text-gray-400">En attente</p>
        <p className="text-sm font-semibold text-yellow-400">0</p>
      </div>
      <div>
        <p className="text-xs text-gray-400">Livrées</p>
        <p className="text-sm font-semibold text-[#25D366]">2</p>
      </div>
    </div>
  </div>
);

/* ──────────────────── Orders Chart ──────────────────── */
const OrdersChart = () => {
  const hours = ["00", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20", "22"];
  const data = [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
  const maxVal = Math.max(...data, 1);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-sm font-bold text-gray-700">Commandes / 24h</h3>
          <p className="text-xs text-gray-400 mt-0.5">par tranche horaire</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-bold text-gray-900">2</span>
          <span className="text-xs text-gray-400">total</span>
          <ArrowUpRight className="w-4 h-4 text-[#25D366]" />
        </div>
      </div>
      {/* Simple bar chart */}
      <div className="flex items-end justify-between gap-1.5 h-32 mt-4 px-1">
        {data.map((val, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full relative group">
              <div
                className={`w-full rounded-t-md transition-all duration-500 ${
                  val > 0 ? "bg-[#25D366]" : "bg-gray-100"
                }`}
                style={{ height: `${Math.max((val / maxVal) * 100, 8)}px` }}
              />
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {val} commande{val > 1 ? "s" : ""}
              </div>
            </div>
            <span className="text-[10px] text-gray-400">{hours[i]}h</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ──────────────────── Recent Activity ──────────────────── */
const RecentActivity = () => {
  const activities = [
    { time: "14:32", text: "Nouvelle commande reçue — #1248", type: "order" as const },
    { time: "13:15", text: "Fatou Diallo a été ajoutée aux contacts", type: "contact" as const },
    { time: "11:40", text: "Agent IA a répondu à 3 messages", type: "agent" as const },
    { time: "10:22", text: "Commande #1247 livrée avec succès", type: "success" as const },
    { time: "09:05", text: "Nouveau contact: Moussa Traoré", type: "contact" as const },
  ];

  const typeStyles = {
    order: "bg-blue-50 text-blue-600",
    contact: "bg-purple-50 text-purple-600",
    agent: "bg-green-50 text-green-600",
    success: "bg-emerald-50 text-emerald-600",
  };

  const typeIcons = {
    order: ShoppingCart,
    contact: Users,
    agent: TrendingUp,
    success: ArrowUpRight,
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-700">Activité récente</h3>
        <button className="text-xs text-[#25D366] font-medium hover:underline cursor-pointer">
          Voir tout
        </button>
      </div>
      <div className="space-y-3">
        {activities.map((activity, i) => {
          const Icon = typeIcons[activity.type];
          return (
            <div
              key={i}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  typeStyles[activity.type]
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 truncate">{activity.text}</p>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {activity.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ──────────────────── Dashboard Home ──────────────────── */
const DashboardHome = () => (
  <div className="space-y-6">
    {/* Metric cards row */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard title="Contacts" value="1" icon={Users} color="#8B5CF6" bgColor="#F3F0FF" trend="+1 cette semaine" />
      <MetricCard title="Commandes" value="2" icon={ShoppingCart} color="#25D366" bgColor="#E8F8EF" trend="+2 ce mois" />
      <MetricCard title="Rendez-vous" value="0" icon={CalendarDays} color="#F97316" bgColor="#FFF7ED" />
      <MetricCard title="Chiffre d'affaires" value="50 000 F" icon={TrendingUp} color="#0EA5E9" bgColor="#F0F9FF" trend="+12% vs mois dernier" />
    </div>

    {/* Progress bars */}
    <div className="grid sm:grid-cols-2 gap-4">
      <ProgressCard title="Messages ce mois" current={909} max={1500} color="#25D366" unit="messages" />
      <ProgressCard title="Analyses d'images" current={30} max={50} color="#0EA5E9" unit="analyses" />
    </div>

    {/* Summary + Chart */}
    <div className="grid sm:grid-cols-2 gap-4">
      <OrdersSummary />
      <OrdersChart />
    </div>

    {/* Recent activity */}
    <RecentActivity />
  </div>
);

/* ──────────────────── DashboardPage (router) ──────────────────── */
export default function DashboardPage() {
  // P2: Zustand selector — only re-renders when sidebarView changes
  const sidebarView = useAuthStore((s) => s.sidebarView);

  return (
    <Suspense fallback={<PageLoader />}>
      {sidebarView === "dashboard" && <DashboardHome />}
      {sidebarView === "whatsapp" && <WhatsAppConnectionPage />}
      {sidebarView === "agent" && <AgentIAPage />}
      {sidebarView === "tester" && <TesterAgentPage />}
      {sidebarView === "produits" && <MesProduitsPage />}
      {sidebarView === "conversations" && <ConversationsPage />}
      {sidebarView === "contacts" && <ContactsPage />}
      {sidebarView === "commandes" && <CommandesPage />}
      {sidebarView === "rendezvous" && <RendezVousPage />}
      {sidebarView === "rapport" && <RapportHebdoPage />}
      {sidebarView === "plan" && <MonPlanPage />}
      {sidebarView === "parametres" && <ParametresPage />}
    </Suspense>
  );
}
