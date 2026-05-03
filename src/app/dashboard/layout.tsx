"use client";

import type { ReactNode } from "react";
import { DashboardLayout } from "@features/dashboard";

export default function DashboardRouteLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
