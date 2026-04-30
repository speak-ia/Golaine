"use client";

import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import DashboardPage from "./DashboardPage";
import { useAuthStore } from "@/lib/store";

export default function DashboardLayout() {
  const { sidebarOpen } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main content area */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        {/* Header */}
        <DashboardHeader />

        {/* Page content */}
        <main className="p-4 sm:p-6">
          <DashboardPage />
        </main>
      </div>
    </div>
  );
}
