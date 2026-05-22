import {
  MessageSquare,
  Send,
  ShoppingCart,
  TrendingUp,
  UserPlus,
  Target,
} from "lucide-react";
import {
  AuthenticationError,
  InternalServerError,
} from "@shared/errors/AppError";
import { pickServiceImplementation } from "@shared/services/pickServiceImplementation";
import { createBrowserSupabaseClient } from "@shared/services/supabase/client";
import { DAYS_FR_LONG, getMonday, getSunday } from "@shared/utils/date";
import { formatFCFA } from "@shared/utils/format";
import { err, ok, type Result } from "@shared/types/Result";
import { logger } from "@shared/utils/logger";
import type { WeeklyReport } from "./types";

function weekBounds(weekOffset: number) {
  const anchor = new Date();
  const monday = getMonday(anchor);
  monday.setDate(monday.getDate() + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = getSunday(monday);
  sunday.setHours(23, 59, 59, 999);
  const prevMonday = new Date(monday);
  prevMonday.setDate(prevMonday.getDate() - 7);
  const prevSunday = new Date(sunday);
  prevSunday.setDate(prevSunday.getDate() - 7);
  return { monday, sunday, prevMonday, prevSunday };
}

function trendPct(current: number, previous: number): { trend: string; trendUp: boolean } {
  if (previous === 0) {
    return current > 0
      ? { trend: "+100%", trendUp: true }
      : { trend: "0%", trendUp: true };
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  return {
    trend: `${pct >= 0 ? "+" : ""}${pct}%`,
    trendUp: pct >= 0,
  };
}

function mondayIndex(d: Date): number {
  const day = d.getDay();
  return day === 0 ? 6 : day - 1;
}

function formatTimelineDay(iso: string): string {
  const d = new Date(iso);
  return DAYS_FR_LONG[d.getDay()];
}

function formatTimelineTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

const EMPTY_WEEK: WeeklyReport = {
  messagesPerDay: [0, 0, 0, 0, 0, 0, 0],
  kpis: [],
  topProducts: [],
  topProductsTotal: 0,
  aiMetrics: [],
  timeline: [],
};

export interface ReportsService {
  getWeeklyReport(_weekOffset: number): Promise<Result<WeeklyReport>>;
}

const reportsServiceMock: ReportsService = {
  async getWeeklyReport() {
    return ok({
      messagesPerDay: [12, 18, 22, 19, 28, 15, 8],
      kpis: [
        {
          label: "Messages reçus",
          value: "122",
          trend: "+8%",
          trendUp: true,
          icon: MessageSquare,
          iconColor: "#25D366",
          iconBg: "#E8F8EF",
        },
        {
          label: "Messages envoyés (IA)",
          value: "98",
          trend: "+5%",
          trendUp: true,
          icon: Send,
          iconColor: "#3B82F6",
          iconBg: "#EFF6FF",
        },
        {
          label: "Nouvelles commandes",
          value: "4",
          trend: "+2%",
          trendUp: true,
          icon: ShoppingCart,
          iconColor: "#8B5CF6",
          iconBg: "#F3F0FF",
        },
        {
          label: "Chiffre d'affaires",
          value: formatFCFA(85_000),
          trend: "+12%",
          trendUp: true,
          icon: TrendingUp,
          iconColor: "#059669",
          iconBg: "#ECFDF5",
        },
        {
          label: "Nouveaux contacts",
          value: "3",
          trend: "+1%",
          trendUp: true,
          icon: UserPlus,
          iconColor: "#F97316",
          iconBg: "#FFF7ED",
        },
        {
          label: "Taux de conversion",
          value: "12%",
          trend: "0%",
          trendUp: true,
          icon: Target,
          iconColor: "#0891B2",
          iconBg: "#ECFEFF",
        },
      ],
      topProducts: [],
      topProductsTotal: 0,
      aiMetrics: [],
      timeline: [],
    });
  },
};

const reportsServiceSupabase: ReportsService = {
  async getWeeklyReport(weekOffset) {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err(new AuthenticationError());

    const { monday, sunday, prevMonday, prevSunday } = weekBounds(weekOffset);
    const startIso = monday.toISOString();
    const endIso = sunday.toISOString();
    const prevStart = prevMonday.toISOString();
    const prevEnd = prevSunday.toISOString();

    const [
      { data: orders, error: ordersErr },
      { data: prevOrders },
      { data: contacts, error: contactsErr },
      { data: prevContacts },
      { data: threads },
      { data: activity },
    ] = await Promise.all([
      supabase
        .from("orders")
        .select("id, client, produit, montant, status, created_at")
        .eq("user_id", user.id)
        .gte("created_at", startIso)
        .lte("created_at", endIso),
      supabase
        .from("orders")
        .select("id, montant, status")
        .eq("user_id", user.id)
        .gte("created_at", prevStart)
        .lte("created_at", prevEnd),
      supabase
        .from("contacts")
        .select("id, name, created_at")
        .eq("user_id", user.id)
        .gte("created_at", startIso)
        .lte("created_at", endIso),
      supabase
        .from("contacts")
        .select("id")
        .eq("user_id", user.id)
        .gte("created_at", prevStart)
        .lte("created_at", prevEnd),
      supabase.from("conversation_threads").select("id").eq("user_id", user.id),
      supabase
        .from("activity_events")
        .select("body, created_at, activity_type")
        .eq("user_id", user.id)
        .gte("created_at", startIso)
        .lte("created_at", endIso)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (ordersErr || contactsErr) {
      logger.error("[reports] week queries", {
        orders: ordersErr?.message,
        contacts: contactsErr?.message,
      });
      return err(new InternalServerError());
    }

    const threadIds = (threads ?? []).map((t) => t.id);
    let messages: { sender: string; sent_at: string }[] = [];
    let prevMessages: { sender: string }[] = [];

    if (threadIds.length > 0) {
      const [{ data: msgs }, { data: prevMsgs }] = await Promise.all([
        supabase
          .from("conversation_messages")
          .select("sender, sent_at")
          .in("thread_id", threadIds)
          .gte("sent_at", startIso)
          .lte("sent_at", endIso),
        supabase
          .from("conversation_messages")
          .select("sender")
          .in("thread_id", threadIds)
          .gte("sent_at", prevStart)
          .lte("sent_at", prevEnd),
      ]);
      messages = msgs ?? [];
      prevMessages = prevMsgs ?? [];
    }

    const messagesPerDay = [0, 0, 0, 0, 0, 0, 0];
    for (const m of messages) {
      const idx = mondayIndex(new Date(m.sent_at));
      messagesPerDay[idx] += 1;
    }

    const clientMessages = messages.filter((m) => m.sender === "client").length;
    const agentMessages = messages.filter((m) => m.sender === "agent").length;
    const prevClient = prevMessages.filter((m) => m.sender === "client").length;
    const prevAgent = prevMessages.filter((m) => m.sender === "agent").length;

    const weekOrders = (orders ?? []).filter((o) => o.status !== "annulee");
    const prevWeekOrders = (prevOrders ?? []).filter((o) => o.status !== "annulee");
    const revenue = weekOrders.reduce((s, o) => s + Number(o.montant), 0);
    const prevRevenue = prevWeekOrders.reduce((s, o) => s + Number(o.montant), 0);

    const newContacts = contacts?.length ?? 0;
    const prevNewContacts = prevContacts?.length ?? 0;

    const conversion =
      clientMessages > 0
        ? Math.round((weekOrders.length / clientMessages) * 1000) / 10
        : 0;
    const prevConversion =
      prevClient > 0
        ? Math.round((prevWeekOrders.length / prevClient) * 1000) / 10
        : 0;

    const productMap = new Map<string, { qty: number; revenue: number }>();
    for (const o of weekOrders) {
      const name = o.produit?.trim() || "Produit";
      const cur = productMap.get(name) ?? { qty: 0, revenue: 0 };
      productMap.set(name, {
        qty: cur.qty + 1,
        revenue: cur.revenue + Number(o.montant),
      });
    }

    const topSorted = [...productMap.entries()]
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5);

    const topProductsTotal = topSorted.reduce((s, [, v]) => s + v.revenue, 0);
    const topProducts = topSorted.map(([name, stats], i) => ({
      rank: i + 1,
      name,
      quantity: stats.qty,
      revenue: stats.revenue,
      percentage:
        topProductsTotal > 0
          ? Math.round((stats.revenue / topProductsTotal) * 100)
          : 0,
    }));

    const totalMessages = messages.length;
    const autoRate =
      totalMessages > 0 ? Math.round((agentMessages / totalMessages) * 100) : 0;

    const timelineFromOrders = (orders ?? [])
      .filter((o) => o.status !== "annulee")
      .slice(0, 5)
      .map((o) => ({
        day: formatTimelineDay(o.created_at),
        time: formatTimelineTime(o.created_at),
        text: `Commande #${o.id} — ${o.client} — ${formatFCFA(Number(o.montant))}`,
        type: "sale" as const,
      }));

    const timelineFromContacts = (contacts ?? []).slice(0, 3).map((c) => ({
      day: formatTimelineDay(c.created_at),
      time: formatTimelineTime(c.created_at),
      text: `Nouveau contact : ${c.name}`,
      type: "contact" as const,
    }));

    const timelineFromActivity = (activity ?? []).map((e) => ({
      day: formatTimelineDay(e.created_at),
      time: formatTimelineTime(e.created_at),
      text: e.body,
      type:
        e.activity_type === "order"
          ? ("sale" as const)
          : e.activity_type === "contact"
            ? ("contact" as const)
            : e.activity_type === "agent"
              ? ("message" as const)
              : ("event" as const),
    }));

    const timeline = [
      ...timelineFromActivity,
      ...timelineFromOrders,
      ...timelineFromContacts,
    ].slice(0, 12);

    const t1 = trendPct(clientMessages, prevClient);
    const t2 = trendPct(agentMessages, prevAgent);
    const t3 = trendPct(weekOrders.length, prevWeekOrders.length);
    const t4 = trendPct(revenue, prevRevenue);
    const t5 = trendPct(newContacts, prevNewContacts);
    const t6 = trendPct(conversion, prevConversion);

    return ok({
      messagesPerDay,
      kpis: [
        {
          label: "Messages reçus",
          value: String(clientMessages),
          ...t1,
          icon: MessageSquare,
          iconColor: "#25D366",
          iconBg: "#E8F8EF",
        },
        {
          label: "Messages envoyés (IA)",
          value: String(agentMessages),
          ...t2,
          icon: Send,
          iconColor: "#3B82F6",
          iconBg: "#EFF6FF",
        },
        {
          label: "Nouvelles commandes",
          value: String(weekOrders.length),
          ...t3,
          icon: ShoppingCart,
          iconColor: "#8B5CF6",
          iconBg: "#F3F0FF",
        },
        {
          label: "Chiffre d'affaires",
          value: formatFCFA(revenue),
          ...t4,
          icon: TrendingUp,
          iconColor: "#059669",
          iconBg: "#ECFDF5",
        },
        {
          label: "Nouveaux contacts",
          value: String(newContacts),
          ...t5,
          icon: UserPlus,
          iconColor: "#F97316",
          iconBg: "#FFF7ED",
        },
        {
          label: "Taux de conversion",
          value: `${conversion}%`,
          ...t6,
          icon: Target,
          iconColor: "#0891B2",
          iconBg: "#ECFEFF",
        },
      ],
      topProducts,
      topProductsTotal,
      aiMetrics: [
        {
          label: "Messages traités",
          value: String(totalMessages),
          percentage: Math.min(100, totalMessages),
          color: "#25D366",
          bgColor: "#E8F8EF",
        },
        {
          label: "Taux de réponse IA",
          value: `${autoRate}%`,
          percentage: autoRate,
          color: "#8B5CF6",
          bgColor: "#F3F0FF",
        },
        {
          label: "Commandes confirmées",
          value: String(weekOrders.filter((o) => o.status === "confirmee" || o.status === "livree").length),
          percentage: weekOrders.length
            ? Math.round(
                (weekOrders.filter((o) => o.status === "confirmee" || o.status === "livree").length /
                  weekOrders.length) *
                  100,
              )
            : 0,
          color: "#F59E0B",
          bgColor: "#FFFBEB",
        },
        {
          label: "Événements enregistrés",
          value: String((activity ?? []).length),
          percentage: Math.min(100, (activity ?? []).length * 10),
          color: "#0EA5E9",
          bgColor: "#F0F9FF",
        },
      ],
      timeline,
    });
  },
};

export const reportsService = pickServiceImplementation(
  reportsServiceSupabase,
  reportsServiceMock,
);

export function emptyWeeklyReport(): WeeklyReport {
  return { ...EMPTY_WEEK };
}
