import type { SidebarView } from "./types/dashboardTypes";

/** Identifiants de sous-vues dashboard + chemins URL. */
export const DASHBOARD_ROUTE_PREFIX = "/dashboard" as const;

export const DASHBOARD_PATHS = {
  home: "/dashboard",
  whatsapp: "/dashboard/whatsapp",
  agent: "/dashboard/agent-ia",
  tester: "/dashboard/tester-agent",
  produits: "/dashboard/mes-produits",
  conversations: "/dashboard/conversations",
  contacts: "/dashboard/contacts",
  commandes: "/dashboard/commandes",
  rendezvous: "/dashboard/rendez-vous",
  rapport: "/dashboard/rapport-hebdo",
  plan: "/dashboard/mon-plan",
  parametres: "/dashboard/parametres",
} as const;

export type DashboardPathKey = keyof typeof DASHBOARD_PATHS;

/** Aligné sur `SidebarView` — chemins App Router */
export const NAV_ID_TO_PATH: Record<SidebarView, string> = {
  dashboard: DASHBOARD_PATHS.home,
  whatsapp: DASHBOARD_PATHS.whatsapp,
  agent: DASHBOARD_PATHS.agent,
  tester: DASHBOARD_PATHS.tester,
  produits: DASHBOARD_PATHS.produits,
  conversations: DASHBOARD_PATHS.conversations,
  contacts: DASHBOARD_PATHS.contacts,
  commandes: DASHBOARD_PATHS.commandes,
  rendezvous: DASHBOARD_PATHS.rendezvous,
  rapport: DASHBOARD_PATHS.rapport,
  plan: DASHBOARD_PATHS.plan,
  parametres: DASHBOARD_PATHS.parametres,
};
