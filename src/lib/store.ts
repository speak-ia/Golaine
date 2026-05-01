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
  | "plan"
  | "parametres";

interface AuthStore {
  pageView: PageView;
  sidebarView: SidebarView;
  sidebarOpen: boolean;
  profilePhoto: string | null;
  setPageView: (view: PageView) => void;
  setSidebarView: (view: SidebarView) => void;
  setSidebarOpen: (open: boolean) => void;
  setProfilePhoto: (photo: string | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  pageView: "landing",
  sidebarView: "dashboard",
  sidebarOpen: true,
  profilePhoto: null,
  setPageView: (view) => set({ pageView: view }),
  setSidebarView: (view) => set({ sidebarView: view }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setProfilePhoto: (photo) => set({ profilePhoto: photo }),
}));
