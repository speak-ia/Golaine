"use client";

import dynamic from "next/dynamic";

const AgentTesterPage = dynamic(
  () => import("@features/agents/components/AgentTesterPage")
);

export default function TesterAgentRoutePage() {
  return <AgentTesterPage />;
}
