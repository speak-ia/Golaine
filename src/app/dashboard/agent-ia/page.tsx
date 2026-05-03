"use client";

import dynamic from "next/dynamic";

const AgentsPage = dynamic(() => import("@features/agents/components/AgentsPage"));

export default function AgentIARoutePage() {
  return <AgentsPage />;
}
