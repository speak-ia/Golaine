"use client";

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
import { useAuthStore, type SidebarView } from "@/lib/store";

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
  const { sidebarView, setSidebarView, sidebarOpen, setSidebarOpen, setPageView } =
    useAuthStore();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:w-20 lg:translate-x-0"
        }`}
      >
        {/* Logo section */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#25D366] to-[#16A34A] flex-shrink-0">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            {sidebarOpen && (
              <span className="text-lg font-bold text-gray-900 truncate">
                Golaine
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform duration-300 ${
                !sidebarOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Menu label */}
        {sidebarOpen && (
          <div className="px-4 pt-4 pb-1">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Menu
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = sidebarView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSidebarView(item.id);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#E8F8EF] text-[#16A34A]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    isActive ? "text-[#16A34A]" : "text-gray-400"
                  }`}
                />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-3 border-t border-gray-100">
          <button
            onClick={() => setPageView("landing")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer"
            title={!sidebarOpen ? "Déconnexion" : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
