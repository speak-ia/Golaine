"use client";

import dynamic from "next/dynamic";

const DashboardHome = dynamic(() => import("@features/dashboard").then((m) => ({ default: m.DashboardHome })), {
  loading: () => (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
    </div>
  ),
});

export default function DashboardPage() {
  return <DashboardHome />;
}
