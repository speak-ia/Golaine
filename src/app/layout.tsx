import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppToaster } from "@shared/components/feedback/AppToaster";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "LuumoAI — Automatisez vos ventes sur WhatsApp avec l'IA",
  description:
    "LuumoAI est un assistant IA qui automatise vos ventes sur WhatsApp. Répondez à vos clients 24/7, enregistrez les commandes et boostez votre chiffre d'affaires.",
  keywords: [
    "LuumoAI",
    "WhatsApp",
    "IA",
    "ventes",
    "automatisation",
    "Afrique",
    "commerce",
  ],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%2325D366'/><text x='16' y='22' text-anchor='middle' fill='white' font-size='20' font-weight='bold'>L</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} antialiased`}>
        <AppToaster />
        {children}
      </body>
    </html>
  );
}
