"use client";

import type { ReactNode } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { useUIStore } from "../store/uiStore";
import { AuthGuard } from "@features/auth/components/AuthGuard";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <AuthGuard>
      <div className="flex h-screen bg-[#F9FAFB]">
        <DashboardSidebar />

        <div
          className={`flex min-w-0 flex-1 flex-col transition-all duration-300 ease-in-out ${
            sidebarOpen ? "lg:ml-64" : "lg:ml-20"
          }`}
        >
          <DashboardHeader />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
