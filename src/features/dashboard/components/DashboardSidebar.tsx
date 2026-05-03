"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  FlaskConical,
  Package,
  MessagesSquare,
  Contact,
  ShoppingCart,
  CalendarDays,
  BarChart3,
  CreditCard,
  Settings,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { BrandLogo } from "@shared/components/feedback/BrandLogo";
import { NAV_ID_TO_PATH } from "../constants";
import type { SidebarView } from "../types/dashboardTypes";
import { useUIStore } from "../store/uiStore";

const menuItems: { id: SidebarView; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "whatsapp", label: "Connecter WhatsApp", icon: MessageSquare },
  { id: "agent", label: "Agent IA", icon: Bot },
  { id: "tester", label: "Tester l'agent", icon: FlaskConical },
  { id: "produits", label: "Mes produits", icon: Package },
  { id: "conversations", label: "Conversations", icon: MessagesSquare },
  { id: "contacts", label: "Contacts", icon: Contact },
  { id: "commandes", label: "Commandes", icon: ShoppingCart },
  { id: "rendezvous", label: "Rendez-vous", icon: CalendarDays },
  { id: "rapport", label: "Rapport hebdo", icon: BarChart3 },
  { id: "plan", label: "Mon Plan", icon: CreditCard },
  { id: "parametres", label: "Paramètres", icon: Settings },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:w-20 lg:translate-x-0"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
          <BrandLogo variant="compact" showText={sidebarOpen} />
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 lg:flex"
          >
            <ChevronLeft
              className={`h-4 w-4 transition-transform duration-300 ${!sidebarOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {sidebarOpen && (
          <div className="px-4 pb-1 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Menu</p>
          </div>
        )}

        <nav className="custom-scrollbar flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
          {menuItems.map((item) => {
            const href = NAV_ID_TO_PATH[item.id];
            const isActive =
              item.id === "dashboard"
                ? pathname === href || pathname === `${href}/`
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={item.id}
                href={href}
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#E8F8EF] text-[#16A34A]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon
                  className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-[#16A34A]" : "text-gray-400"}`}
                />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 px-3 py-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
            title={!sidebarOpen ? "Déconnexion" : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
