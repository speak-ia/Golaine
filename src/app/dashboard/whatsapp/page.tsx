"use client";

import dynamic from "next/dynamic";

const WhatsAppPage = dynamic(() => import("@features/whatsapp/components/WhatsAppPage"));

export default function WhatsAppRoutePage() {
  return <WhatsAppPage />;
}
