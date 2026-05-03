import { create } from "zustand";

interface UIStore {
  sidebarOpen: boolean;
  setSidebarOpen: (_open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  /** Fermé par défaut : mobile évite le menu plein écran au chargement ; desktop garde la rail compacte (lg). */
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
