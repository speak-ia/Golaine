import { create } from "zustand";

export type PageView = "landing" | "login" | "signup";

interface AuthStore {
  pageView: PageView;
  setPageView: (view: PageView) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  pageView: "landing",
  setPageView: (view) => set({ pageView: view }),
}));
