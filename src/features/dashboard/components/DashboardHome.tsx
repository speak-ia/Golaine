"use client";

import {
  Users,
  ShoppingCart,
  CalendarDays,
  TrendingUp,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { StatCard, StatProgressCard } from "@shared/components/feedback/StatCard";
import {
  DASHBOARD_ACTIVITY_CLASS,
  type DashboardActivityType,
} from "@shared/constants/status";
import { BRAND } from "@shared/constants/brand";

const OrdersSummary = () => (
  <div className="rounded-2xl bg-gradient-to-br from-[#111827] to-[#1F2937] p-6 text-white">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">RÉSUMÉ COMMANDES</h3>
      <ShoppingCart className="h-4 w-4 text-gray-400" />
    </div>
    <p className="text-3xl font-bold text-white">50 000F</p>
    <p className="mt-2 text-sm font-medium text-brand">Confirmées + livrées</p>
    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-4">
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
        <p className="text-sm font-semibold text-brand">2</p>
      </div>
    </div>
  </div>
);

const OrdersChart = () => {
  const hours = ["00", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20", "22"];
  const data = [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
  const maxVal = Math.max(...data, 1);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="mb-1 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-700">Commandes / 24h</h3>
          <p className="mt-0.5 text-xs text-gray-400">par tranche horaire</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-bold text-gray-900">2</span>
          <span className="text-xs text-gray-400">total</span>
          <ArrowUpRight className="h-4 w-4 text-brand" />
        </div>
      </div>
      <div className="mt-4 flex h-32 items-end justify-between gap-1.5 px-1">
        {data.map((val, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div className="group relative w-full">
              <div
                className={`w-full rounded-t-md transition-all duration-500 ${val > 0 ? "bg-brand" : "bg-gray-100"}`}
                style={{ height: `${Math.max((val / maxVal) * 100, 8)}px` }}
              />
              <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
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

const RecentActivity = () => {
  const activities: { time: string; text: string; type: DashboardActivityType }[] = [
    { time: "14:32", text: "Nouvelle commande reçue — #1248", type: "order" },
    { time: "13:15", text: "Fatou Diallo a été ajoutée aux contacts", type: "contact" },
    { time: "11:40", text: "Agent IA a répondu à 3 messages", type: "agent" },
    { time: "10:22", text: "Commande #1247 livrée avec succès", type: "success" },
    { time: "09:05", text: "Nouveau contact: Moussa Traoré", type: "contact" },
  ];

  const typeIcons = {
    order: ShoppingCart,
    contact: Users,
    agent: TrendingUp,
    success: ArrowUpRight,
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-700">Activité récente</h3>
        <button className="cursor-pointer text-xs font-medium text-brand hover:underline">Voir tout</button>
      </div>
      <div className="space-y-3">
        {activities.map((activity, i) => {
          const Icon = typeIcons[activity.type];
          return (
            <div key={i} className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-gray-50">
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                  DASHBOARD_ACTIVITY_CLASS[activity.type]
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-gray-700">{activity.text}</p>
              </div>
              <span className="flex flex-shrink-0 items-center gap-1 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                {activity.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Contacts"
          value="1"
          icon={Users}
          iconColor="#8B5CF6"
          iconBg="#F3F0FF"
          trend="+1 cette semaine"
        />
        <StatCard
          label="Commandes"
          value="2"
          icon={ShoppingCart}
          iconColor={BRAND.green}
          iconBg={BRAND.tint}
          trend="+2 ce mois"
        />
        <StatCard
          label="Rendez-vous"
          value="0"
          icon={CalendarDays}
          iconColor="#F97316"
          iconBg="#FFF7ED"
        />
        <StatCard
          label="Chiffre d'affaires"
          value="50 000 F"
          icon={TrendingUp}
          iconColor="#0EA5E9"
          iconBg="#F0F9FF"
          trend="+12% vs mois dernier"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatProgressCard
          title="Messages ce mois"
          current={909}
          max={1500}
          color={BRAND.green}
          unit="messages"
        />
        <StatProgressCard
          title="Analyses d'images"
          current={30}
          max={50}
          color="#0EA5E9"
          unit="analyses"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <OrdersSummary />
        <OrdersChart />
      </div>

      <RecentActivity />
    </div>
  );
}
