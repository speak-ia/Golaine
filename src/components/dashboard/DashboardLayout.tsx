"use client";

import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import DashboardPage from "./DashboardPage";
import { useAuthStore } from "@/lib/store";

export default function DashboardLayout() {
  const { sidebarOpen } = useAuthStore();

  return (
    <div className="h-screen bg-[#F9FAFB] flex">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main content area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        {/* Header */}
        <DashboardHeader />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <DashboardPage />
        </main>
      </div>
    </div>
  );
}
