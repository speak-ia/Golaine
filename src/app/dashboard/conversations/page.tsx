"use client";

import dynamic from "next/dynamic";

const ConversationsPage = dynamic(
  () => import("@features/conversations/components/ConversationsPage")
);

export default function ConversationsRoutePage() {
  return <ConversationsPage />;
}
