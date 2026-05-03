"use client";

import dynamic from "next/dynamic";

const PlanPage = dynamic(() => import("@features/plan/components/PlanPage"));

export default function MonPlanRoutePage() {
  return <PlanPage />;
}
