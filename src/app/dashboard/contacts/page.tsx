"use client";

import dynamic from "next/dynamic";

const ContactsPage = dynamic(() => import("@features/contacts/components/ContactsPage"));

export default function ContactsRoutePage() {
  return <ContactsPage />;
}
