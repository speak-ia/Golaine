import type { LucideIcon } from "lucide-react";

export type ReportKpi = {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
};

export type ReportTopProduct = {
  rank: number;
  name: string;
  quantity: number;
  revenue: number;
  percentage: number;
};

export type ReportAiMetric = {
  label: string;
  value: string;
  percentage: number;
  color: string;
  bgColor: string;
};

export type ReportTimelineEvent = {
  day: string;
  time: string;
  text: string;
  type: "sale" | "message" | "event" | "contact";
};

export type WeeklyReport = {
  messagesPerDay: number[];
  kpis: ReportKpi[];
  topProducts: ReportTopProduct[];
  topProductsTotal: number;
  aiMetrics: ReportAiMetric[];
  timeline: ReportTimelineEvent[];
};
