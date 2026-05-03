"use client";

import type { ReactNode } from "react";

/** Client guard — étendre en phase 4 (session Supabase). */
export function AuthGuard({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
