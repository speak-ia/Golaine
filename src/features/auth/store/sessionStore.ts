import { create } from "zustand";
import type { DomainUser, PlanTier } from "@shared/types/domainTypes";

interface SessionStore {
  user: DomainUser | null;
  profilePhoto: string | null;
  planIntent: PlanTier | null;
  setUser: (_user: DomainUser | null) => void;
  setProfilePhoto: (_photo: string | null) => void;
  setPlanIntent: (_plan: PlanTier | null) => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  user: null,
  profilePhoto: null,
  planIntent: null,
  setUser: (user) => set({ user }),
  setProfilePhoto: (photo) => set({ profilePhoto: photo }),
  setPlanIntent: (planIntent) => set({ planIntent }),
}));
