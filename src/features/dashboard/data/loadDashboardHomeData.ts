import "server-only";

import { isSupabaseConfigured } from "@/config/env";
import { createServerSupabaseClient } from "@shared/services/supabase/server";
import { shouldUseSupabaseData } from "@shared/services/pickServiceImplementation";
import { getMonday } from "@shared/utils/date";
import { logger } from "@shared/utils/logger";
import type { DashboardActivityItem, DashboardHomeData } from "../types/dashboardData";
import type { DashboardActivityType } from "@shared/constants/status";

/** Données de démo (aucune config Supabase ou mode démo). */
export const DASHBOARD_DEMO_STATIC: DashboardHomeData = {
  contactsCount: 1,
  contactsThisWeek: 1,
  ordersCountActive: 2,
  ordersThisMonth: 2,
  appointmentsCount: 0,
  revenueMonthFcfa: 50_000,
  revenueTrendLabel: "+12% vs mois dernier",
  ordersPending: 0,
  ordersDelivered: 2,
  ordersTotalNonCancelled: 2,
  ordersByTwoHourSlot12: [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
  ordersLast24hTotal: 2,
  messagesUsed: 909,
  messagesLimit: 1500,
  imageAnalysisUsed: 30,
  imageAnalysisLimit: 50,
  activities: [
    { time: "14:32", text: "Nouvelle commande reçue — #1248", type: "order" },
    { time: "13:15", text: "Fatou Diallo a été ajoutée aux contacts", type: "contact" },
    { time: "11:40", text: "Agent IA a répondu à 3 messages", type: "agent" },
    { time: "10:22", text: "Commande #1247 livrée avec succès", type: "success" },
    { time: "09:05", text: "Nouveau contact: Moussa Traoré", type: "contact" },
  ],
};

const DASHBOARD_EMPTY: DashboardHomeData = {
  contactsCount: 0,
  contactsThisWeek: 0,
  ordersCountActive: 0,
  ordersThisMonth: 0,
  appointmentsCount: 0,
  revenueMonthFcfa: 0,
  revenueTrendLabel: "—",
  ordersPending: 0,
  ordersDelivered: 0,
  ordersTotalNonCancelled: 0,
  ordersByTwoHourSlot12: Array(12).fill(0),
  ordersLast24hTotal: 0,
  messagesUsed: 0,
  messagesLimit: 1500,
  imageAnalysisUsed: 0,
  imageAnalysisLimit: 50,
  activities: [],
};

function revenueTrendLabel(thisMonth: number, lastMonth: number): string {
  if (lastMonth <= 0) {
    return thisMonth > 0 ? "Premier mois d’activité" : "—";
  }
  const pct = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct}% vs mois dernier`;
}

function mapActivityType(raw: string): DashboardActivityType {
  if (raw === "order" || raw === "contact" || raw === "agent" || raw === "success") {
    return raw;
  }
  return "order";
}

export async function loadDashboardHomeData(): Promise<DashboardHomeData> {
  if (!shouldUseSupabaseData()) {
    return DASHBOARD_DEMO_STATIC;
  }

  let supabase;
  try {
    supabase = await createServerSupabaseClient();
  } catch (error: unknown) {
    logger.warn("[dashboard] Supabase serveur indisponible", {
      error: error instanceof Error ? error.message : String(error),
    });
    if (isSupabaseConfigured()) {
      return DASHBOARD_EMPTY;
    }
    return DASHBOARD_DEMO_STATIC;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return DASHBOARD_EMPTY;
  }

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const monthStart = new Date(y, m, 1, 0, 0, 0, 0);
  const lastMonthStart = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const lastMonthEnd = new Date(y, m, 0, 23, 59, 59, 999);
  const weekStart = getMonday(now);
  weekStart.setHours(0, 0, 0, 0);
  const day24hAgoTs = now.getTime() - 24 * 60 * 60 * 1000;

  try {
    const [
      contactsCountRes,
      contactsWeekRes,
      appointmentsCountRes,
      profileRes,
      activityRes,
      ordersRes,
    ] = await Promise.all([
      supabase
        .from("contacts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("contacts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", weekStart.toISOString()),
      supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("profiles")
        .select(
          "messages_used_month, messages_limit_month, image_analyses_used_month, image_analyses_limit_month",
        )
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("activity_events")
        .select("activity_type, body, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("orders")
        .select("montant, status, created_at")
        .eq("user_id", user.id),
    ]);

    const allOrders = ordersRes.data ?? [];
    let revenueThis = 0;
    let revenueLast = 0;
    let ordersThisMonth = 0;
    let ordersPending = 0;
    let ordersDelivered = 0;
    let ordersTotalNonCancelled = 0;
    const buckets = Array.from({ length: 12 }, () => 0);
    let ordersLast24hTotal = 0;

    for (const o of allOrders) {
      const created = new Date(o.created_at);
      const t = created.getTime();
      const st = o.status;
      const montant = Number(o.montant);

      if (st !== "annulee") ordersTotalNonCancelled += 1;
      if (st === "livree") ordersDelivered += 1;
      if (st === "en_attente" || st === "en_preparation") ordersPending += 1;

      if (created >= monthStart && created <= now) {
        ordersThisMonth += 1;
        if (st === "confirmee" || st === "livree") {
          revenueThis += montant;
        }
      }

      if (created >= lastMonthStart && created <= lastMonthEnd) {
        if (st === "confirmee" || st === "livree") {
          revenueLast += montant;
        }
      }

      if (t >= day24hAgoTs) {
        ordersLast24hTotal += 1;
        const h = new Date(o.created_at).getHours();
        buckets[Math.min(11, Math.floor(h / 2))] += 1;
      }
    }

    const activities: DashboardActivityItem[] = (activityRes.data ?? []).map((row) => ({
      type: mapActivityType(row.activity_type),
      text: row.body,
      time: new Date(row.created_at).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

    const profile = profileRes.data;

    return {
      contactsCount: contactsCountRes.count ?? 0,
      contactsThisWeek: contactsWeekRes.count ?? 0,
      ordersCountActive: ordersThisMonth,
      ordersThisMonth,
      appointmentsCount: appointmentsCountRes.count ?? 0,
      revenueMonthFcfa: revenueThis,
      revenueTrendLabel: revenueTrendLabel(revenueThis, revenueLast),
      ordersPending,
      ordersDelivered,
      ordersTotalNonCancelled,
      ordersByTwoHourSlot12: buckets,
      ordersLast24hTotal,
      messagesUsed: profile?.messages_used_month ?? 0,
      messagesLimit: profile?.messages_limit_month ?? 1500,
      imageAnalysisUsed: profile?.image_analyses_used_month ?? 0,
      imageAnalysisLimit: profile?.image_analyses_limit_month ?? 50,
      activities,
    };
  } catch (error: unknown) {
    logger.error("[dashboard] agrégation impossible", {
      error: error instanceof Error ? error.message : String(error),
    });
    return DASHBOARD_EMPTY;
  }
}
