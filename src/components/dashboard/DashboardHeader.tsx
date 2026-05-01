"use client";

import { useState, useRef, useCallback } from "react";
import {
  Bell,
  Search,
  ChevronDown,
  Menu,
  Crown,
  Settings,
  LogOut,
  User,
  Camera,
} from "lucide-react";
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

const pageDescriptions: Record<SidebarView, string> = {
  dashboard: "Vue d'ensemble de votre activité",
  whatsapp: "Connectez votre WhatsApp Business",
  agent: "Configurez le comportement de votre agent",
  tester: "Testez les réponses de votre agent",
  produits: "Gérez votre catalogue de produits",
  conversations: "Suivez vos conversations WhatsApp",
  contacts: "Gérez votre base de contacts",
  commandes: "Suivez et gérez vos commandes",
  rendezvous: "Planifiez vos rendez-vous",
  rapport: "Analysez vos performances hebdomadaires",
  plan: "Gérez votre abonnement",
  parametres: "Personnalisez votre compte",
};

export default function DashboardHeader() {
  // P2: Zustand selectors — only re-renders when these values change
  const sidebarView = useAuthStore((s) => s.sidebarView);
  const profilePhoto = useAuthStore((s) => s.profilePhoto);
  const setSidebarView = useAuthStore((s) => s.setSidebarView);
  const setSidebarOpen = useAuthStore((s) => s.setSidebarOpen);
  const setPageView = useAuthStore((s) => s.setPageView);
  const setProfilePhoto = useAuthStore((s) => s.setProfilePhoto);

  const [profileOpen, setProfileOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfilePhoto(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [setProfilePhoto]);

  const dateStr = (() => {
    const d = new Date();
    const days = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    const months = [
      "janvier", "février", "mars", "avril", "mai", "juin",
      "juillet", "août", "septembre", "octobre", "novembre", "décembre",
    ];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
  })();

  return (
    <>
      <header className="bg-[#F0FDF4] border-b border-gray-200">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          {/* Left section */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/80 transition-colors text-gray-600 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-base sm:text-lg font-bold text-[#16A34A] tracking-wide">
                {pageTitles[sidebarView]}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                {pageDescriptions[sidebarView]}
              </p>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Agent status */}
            <div className="hidden md:flex items-center gap-2 bg-white rounded-full px-3 py-1.5 border border-gray-200">
              <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              <span className="text-[11px] font-medium text-gray-600">Agent actif</span>
            </div>

            {/* Date */}
            <div className="hidden lg:block text-[11px] text-gray-500 font-medium">
              {dateStr}
            </div>

            {/* Search */}
            <button className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/80 transition-colors text-gray-500 cursor-pointer">
              <Search className="w-[18px] h-[18px]" />
            </button>

            {/* Notifications */}
            <button className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/80 transition-colors text-gray-500 cursor-pointer">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-[#F0FDF4]" />
            </button>

            {/* Profile button */}
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 pl-2 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#25D366] to-[#16A34A] flex items-center justify-center text-white font-bold text-xs ring-2 ring-white shadow-sm overflow-hidden relative">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Photo" className="w-full h-full object-cover" />
                ) : (
                  "AD"
                )}
              </div>
              {/* Name + Plan (visible on md+) */}
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-semibold text-gray-800 leading-tight group-hover:text-gray-900 transition-colors">
                  Alassane
                </span>
                <div className="flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-500" />
                  <span className="text-[11px] font-medium text-gray-500 leading-tight">Plan Pro</span>
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 hidden sm:block transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Profile Dropdown */}
      {profileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9999]"
            onClick={() => setProfileOpen(false)}
          />
          <div className="absolute right-4 sm:right-6 top-[72px] z-[10000] w-72 bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* User info header */}
            <div className="bg-gradient-to-br from-[#25D366] to-[#16A34A] px-5 py-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePhotoClick}
                  className="relative w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm backdrop-blur-sm overflow-hidden cursor-pointer group/photo ring-2 ring-white/30"
                  title="Changer la photo"
                >
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Photo" className="w-full h-full object-cover" />
                  ) : (
                    "AD"
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                    <Camera className="w-4 h-4 text-white opacity-0 group-hover/photo:opacity-100 transition-opacity duration-200" />
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">Alassane Amadou Diallo</p>
                  <p className="text-xs text-white/70 truncate">alassane@golaine.sn</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                <Crown className="w-3 h-3 text-amber-300" />
                <span className="text-xs font-semibold text-white/90">Plan Pro</span>
                <span className="text-[10px] text-white/50 ml-auto">49 000 FCFA/mois</span>
              </div>
              {profilePhoto && (
                <button
                  onClick={() => setProfilePhoto(null)}
                  className="mt-2.5 w-full text-center text-[11px] font-medium text-white/60 hover:text-white/90 transition-colors cursor-pointer"
                >
                  Supprimer la photo
                </button>
              )}
            </div>

            {/* Menu items */}
            <div className="p-2">
              <button
                onClick={() => {
                  setSidebarView("parametres");
                  setProfileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-gray-400" />
                Mon profil
              </button>
              <button
                onClick={() => {
                  setSidebarView("parametres");
                  setProfileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-gray-400" />
                Paramètres
              </button>
              <button
                onClick={() => {
                  setSidebarView("plan");
                  setProfileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Crown className="w-4 h-4 text-gray-400" />
                Mon abonnement
              </button>
            </div>

            {/* Separator + Logout */}
            <div className="border-t border-gray-100 p-2">
              <button
                onClick={() => {
                  setPageView("landing");
                  setProfileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
