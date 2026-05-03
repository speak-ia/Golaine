"use client";

import { Toaster } from "sonner";

/** Toaster global sans dépendance à next-themes (ThemeProvider optionnel). */
export function AppToaster() {
  return <Toaster richColors position="top-center" closeButton />;
}
