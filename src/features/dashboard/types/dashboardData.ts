import type { DashboardActivityType } from "@shared/constants/status";

export interface DashboardActivityItem {
  time: string;
  text: string;
  type: DashboardActivityType;
}

export interface DashboardHomeData {
  contactsCount: number;
  contactsThisWeek: number;
  ordersCountActive: number;
  ordersThisMonth: number;
  appointmentsCount: number;
  revenueMonthFcfa: number;
  revenueTrendLabel: string;
  ordersPending: number;
  ordersDelivered: number;
  ordersTotalNonCancelled: number;
  ordersByTwoHourSlot12: number[];
  ordersLast24hTotal: number;
  messagesUsed: number;
  messagesLimit: number;
  imageAnalysisUsed: number;
  imageAnalysisLimit: number;
  activities: DashboardActivityItem[];
}
