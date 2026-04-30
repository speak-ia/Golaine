import { create } from "zustand";

export type PageView = "landing" | "login" | "signup" | "dashboard";

export type SidebarView =
  | "dashboard"
  | "whatsapp"
  | "agent"
  | "tester"
  | "produits"
  | "conversations"
  | "contacts"
  | "commandes"
  | "rendezvous"
  | "rapport"
  | "plan";

interface AuthStore {
  pageView: PageView;
  sidebarView: SidebarView;
  sidebarOpen: boolean;
  setPageView: (view: PageView) => void;
  setSidebarView: (view: SidebarView) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  pageView: "landing",
  sidebarView: "dashboard",
  sidebarOpen: true,
  setPageView: (view) => set({ pageView: view }),
  setSidebarView: (view) => set({ sidebarView: view }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
