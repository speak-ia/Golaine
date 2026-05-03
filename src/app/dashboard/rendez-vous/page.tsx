"use client";

import dynamic from "next/dynamic";

const AppointmentsPage = dynamic(
  () => import("@features/appointments/components/AppointmentsPage")
);

export default function RendezVousRoutePage() {
  return <AppointmentsPage />;
}
