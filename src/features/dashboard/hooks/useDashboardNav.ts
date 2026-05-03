import { DASHBOARD_PATHS } from "../constants";
import type { SidebarView } from "../types/dashboardTypes";

/** Correspondance chemin URL → identifiant de vue (titres header / état actif). */
const PATH_TO_VIEW: Record<string, SidebarView> = {
  [DASHBOARD_PATHS.home]: "dashboard",
  [DASHBOARD_PATHS.whatsapp]: "whatsapp",
  [DASHBOARD_PATHS.agent]: "agent",
  [DASHBOARD_PATHS.tester]: "tester",
  [DASHBOARD_PATHS.produits]: "produits",
  [DASHBOARD_PATHS.conversations]: "conversations",
  [DASHBOARD_PATHS.contacts]: "contacts",
  [DASHBOARD_PATHS.commandes]: "commandes",
  [DASHBOARD_PATHS.rendezvous]: "rendezvous",
  [DASHBOARD_PATHS.rapport]: "rapport",
  [DASHBOARD_PATHS.plan]: "plan",
  [DASHBOARD_PATHS.parametres]: "parametres",
};

function normalizePath(p: string) {
  if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1);
  return p;
}

export function sidebarViewFromPathname(pathname: string): SidebarView {
  const n = normalizePath(pathname);
  return PATH_TO_VIEW[n] ?? "dashboard";
}
