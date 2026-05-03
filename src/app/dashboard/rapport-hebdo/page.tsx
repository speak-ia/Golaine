"use client";

import dynamic from "next/dynamic";

const ReportsPage = dynamic(() => import("@features/reports/components/ReportsPage"));

export default function RapportHebdoRoutePage() {
  return <ReportsPage />;
}
