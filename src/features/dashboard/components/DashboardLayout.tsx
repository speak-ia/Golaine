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
      <div className="dashboard-light flex h-[100dvh] max-h-[100dvh] min-h-0 w-full overflow-x-clip bg-[#F9FAFB] text-neutral-900 antialiased sm:h-screen sm:max-h-none">
        <div className="flex min-h-0 min-w-0 flex-1 flex-row">
          <DashboardSidebar />

          <div
            className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-x-clip transition-all duration-300 ease-in-out ${
              sidebarOpen ? "lg:ml-64" : "lg:ml-20"
            }`}
          >
            <DashboardHeader />

            <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-clip p-3 sm:p-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
