"use client";

import dynamic from "next/dynamic";

const SettingsPage = dynamic(() => import("@features/settings/components/SettingsPage"));

export default function ParametresRoutePage() {
  return <SettingsPage />;
}
