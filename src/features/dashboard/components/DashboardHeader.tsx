"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
import { DASHBOARD_PATHS } from "../constants";
import { sidebarViewFromPathname } from "../hooks/useDashboardNav";
import type { SidebarView } from "../types/dashboardTypes";
import { useUIStore } from "../store/uiStore";
import { useSessionStore } from "@features/auth/store/sessionStore";
import { formatDateLong } from "@shared/utils/date";
import { useImageUpload } from "@shared/hooks/useImageUpload";

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
  const pathname = usePathname();
  const router = useRouter();
  const sidebarView = sidebarViewFromPathname(pathname);
  const profilePhoto = useSessionStore((s) => s.profilePhoto);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const setProfilePhoto = useSessionStore((s) => s.setProfilePhoto);

  const [profileOpen, setProfileOpen] = useState(false);

  const { inputRef: profileFileInputRef, open: openProfilePhotoPicker, onChange: onProfilePhotoChange } =
    useImageUpload({
      onLoaded: (url) => setProfilePhoto(url),
    });

  const dateStr = formatDateLong(new Date());

  return (
    <>
      <header className="border-b border-gray-200 bg-brand-soft">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-white/80 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <h1 className="text-base font-bold tracking-wide text-brand-dark sm:text-lg">
                {pageTitles[sidebarView]}
              </h1>
              <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">{pageDescriptions[sidebarView]}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 md:flex">
              <div className="h-2 w-2 animate-pulse rounded-full bg-brand" />
              <span className="text-[11px] font-medium text-gray-600">Agent actif</span>
            </div>

            <div className="hidden text-[11px] font-medium text-gray-500 lg:block">{dateStr}</div>

            <button className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-white/80">
              <Search className="h-[18px] w-[18px]" />
            </button>

            <button className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-white/80">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-brand-soft bg-red-500" />
            </button>

            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="group flex cursor-pointer items-center gap-2 pl-2"
            >
              <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand to-brand-dark text-xs font-bold text-white shadow-sm ring-2 ring-white">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Photo" className="h-full w-full object-cover" />
                ) : (
                  "AD"
                )}
              </div>
              <div className="hidden flex-col items-start sm:flex">
                <span className="text-sm font-semibold leading-tight text-gray-800 transition-colors group-hover:text-gray-900">
                  Alassane
                </span>
                <div className="flex items-center gap-1">
                  <Crown className="h-3 w-3 text-amber-500" />
                  <span className="text-[11px] font-medium leading-tight text-gray-500">Plan Pro</span>
                </div>
              </div>
              <ChevronDown
                className={`hidden h-3.5 w-3.5 text-gray-400 transition-transform duration-200 sm:block ${profileOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </div>
      </header>

      {profileOpen && (
        <>
          <div className="fixed inset-0 z-[9999]" onClick={() => setProfileOpen(false)} />
          <div className="animate-in fade-in slide-in-from-top-2 absolute right-4 top-[72px] z-[10000] w-72 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/50 duration-200 sm:right-6">
            <div className="bg-gradient-to-br from-brand to-brand-dark px-5 py-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={openProfilePhotoPicker}
                  className="group/photo relative flex h-11 w-11 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-white/20 text-sm font-bold text-white ring-2 ring-white/30 backdrop-blur-sm"
                  title="Changer la photo"
                >
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Photo" className="h-full w-full object-cover" />
                  ) : (
                    "AD"
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover/photo:bg-black/40">
                    <Camera className="h-4 w-4 text-white opacity-0 transition-opacity duration-200 group-hover/photo:opacity-100" />
                  </div>
                </button>
                <input
                  ref={profileFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onProfilePhotoChange}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">Alassane Amadou Diallo</p>
                  <p className="truncate text-xs text-white/70">alassane@golaine.sn</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <Crown className="h-3 w-3 text-amber-300" />
                <span className="text-xs font-semibold text-white/90">Plan Pro</span>
                <span className="ml-auto text-[10px] text-white/50">49 000 FCFA/mois</span>
              </div>
              {profilePhoto && (
                <button
                  onClick={() => setProfilePhoto(null)}
                  className="mt-2.5 w-full cursor-pointer text-center text-[11px] font-medium text-white/60 transition-colors hover:text-white/90"
                >
                  Supprimer la photo
                </button>
              )}
            </div>

            <div className="p-2">
              <button
                onClick={() => {
                  router.push(DASHBOARD_PATHS.parametres);
                  setProfileOpen(false);
                }}
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <User className="h-4 w-4 text-gray-400" />
                Mon profil
              </button>
              <button
                onClick={() => {
                  router.push(DASHBOARD_PATHS.parametres);
                  setProfileOpen(false);
                }}
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Settings className="h-4 w-4 text-gray-400" />
                Paramètres
              </button>
              <button
                onClick={() => {
                  router.push(DASHBOARD_PATHS.plan);
                  setProfileOpen(false);
                }}
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Crown className="h-4 w-4 text-gray-400" />
                Mon abonnement
              </button>
            </div>

            <div className="border-t border-gray-100 p-2">
              <button
                onClick={() => {
                  router.push("/");
                  setProfileOpen(false);
                }}
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
