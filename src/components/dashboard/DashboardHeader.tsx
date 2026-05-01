"use client";

import { Bell, Search, ChevronDown, Menu } from "lucide-react";
import { useAuthStore, type SidebarView } from "@/lib/store";

const pageTitles: Record<SidebarView, string> = {
  dashboard: "DASHBOARD",
  whatsapp: "WHATSAPP",
  agent: "AGENT IA",
  tester: "TESTER L'AGENT",
  produits: "MES PRODUITS",
  conversations: "CONVERSATIONS",
  contacts: "CONTACTS",
  commandes: "COMMANDES",
  rendezvous: "RENDEZ-VOUS",
  rapport: "RAPPORT HEBDO",
  plan: "MON PLAN",
  parametres: "PARAMÈTRES",
};

export default function DashboardHeader() {
  const { sidebarView, setSidebarOpen } = useAuthStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bon matin";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const getDateStr = () => {
    const d = new Date();
    const days = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    const months = [
      "janvier", "février", "mars", "avril", "mai", "juin",
      "juillet", "août", "septembre", "octobre", "novembre", "décembre",
    ];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
  };

  return (
    <header className="bg-[#F0FDF4] border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left section */}
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/80 transition-colors text-gray-600 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg font-bold text-[#16A34A] tracking-wide">
              {pageTitles[sidebarView]}
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">
              {getGreeting()}, Alassane Amadou Diallo 👋
            </p>
            <p className="text-xs text-gray-500">
              Vue d&apos;ensemble de votre activité
            </p>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Agent status */}
          <div className="hidden sm:flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200">
            <div className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse" />
            <span className="text-xs font-medium text-gray-700">Agent actif</span>
          </div>

          {/* Date */}
          <div className="hidden md:block text-xs text-gray-500 font-medium">
            {getDateStr()}
          </div>

          {/* Search */}
          <button className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/80 transition-colors text-gray-500 cursor-pointer">
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <button className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/80 transition-colors text-gray-500 cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-[#F0FDF4]" />
          </button>

          {/* Profile dropdown */}
          <button className="flex items-center gap-2 pl-2 cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#25D366] to-[#16A34A] flex items-center justify-center text-white font-bold text-xs">
              AD
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
          </button>
        </div>
      </div>
    </header>
  );
}
