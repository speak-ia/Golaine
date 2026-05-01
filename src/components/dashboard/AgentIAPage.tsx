"use client";

import { useState } from "react";
import {
  Bot,
  Sparkles,
  ChevronDown,
  Save,
  CheckCircle2,
  Info,
  Bell,
} from "lucide-react";

/* ──────────────────── Types ──────────────────── */
type TabSlot = {
  name: string;
  phone: string;
  status: "connected" | "inactive" | "locked";
};

type AgentConfig = {
  agentName: string;
  instructions: string;
  notificationNumber: string;
};

/* ──────────────────── Mock Data ──────────────────── */
const tabs: TabSlot[] = [
  { name: "Alou Shop", phone: "+221760289607", status: "connected" },
  { name: "Numéro 2", phone: "", status: "inactive" },
  { name: "Numéro 3", phone: "", status: "locked" },
];

const defaultConfigs: Record<string, AgentConfig> = {
  "Alou Shop": {
    agentName: "Assistan",
    instructions:
      "Tu es l'assistante de [Nom de l'entreprise].\nTu réponds aux questions sur nos produits et services.\nTu es professionnelle, chaleureuse et concise.",
    notificationNumber: "",
  },
  "Numéro 2": {
    agentName: "",
    instructions: "",
    notificationNumber: "",
  },
  "Numéro 3": {
    agentName: "",
    instructions: "",
    notificationNumber: "",
  },
};

/* ──────────────────── Main Component ──────────────────── */
export default function AgentIAPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [configs, setConfigs] = useState<Record<string, AgentConfig>>(defaultConfigs);
  const [saved, setSaved] = useState(false);
  const [showAIPrompt, setShowAIPrompt] = useState(false);

  const currentTab = tabs[activeTab];
  const config = configs[currentTab.name];

  const updateConfig = (key: keyof AgentConfig, value: string) => {
    setConfigs((prev) => ({
      ...prev,
      [currentTab.name]: { ...prev[currentTab.name], [key]: value },
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* ── Page Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#E8F8EF]">
          <Bot className="w-5 h-5 text-[#16A34A]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Agent IA</h1>
          <p className="text-sm text-gray-500">
            Configurez le comportement et les réponses de votre agent
          </p>
        </div>
      </div>

      {/* ── Number Tabs ── */}
      <div className="flex gap-3">
        {tabs.map((tab, i) => {
          const isActive = i === activeTab;
          const isLocked = tab.status === "locked";

          return (
            <button
              key={i}
              onClick={() => !isLocked && setActiveTab(i)}
              disabled={isLocked}
              className={`flex-1 rounded-xl p-4 text-left transition-all duration-200 cursor-pointer border ${
                isActive
                  ? "bg-[#25D366] text-white border-[#25D366] shadow-md shadow-[#25D366]/20"
                  : isLocked
                    ? "bg-gray-50 text-gray-400 border-gray-200 opacity-60 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center ${
                    isActive ? "bg-white/30" : "bg-gray-200"
                  }`}
                >
                  {isActive ? (
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <div className="w-2 h-2 rounded-sm bg-gray-400" />
                  )}
                </div>
                <span className={`text-sm font-semibold ${isActive ? "text-white" : "text-gray-800"}`}>
                  {tab.name}
                </span>
              </div>
              <p className={`text-xs ml-6 ${isActive ? "text-white/80" : "text-gray-400"}`}>
                {tab.status === "connected" ? "Connecté" : isLocked ? "Verrouillé" : "Inactif"}
              </p>
            </button>
          );
        })}
      </div>

      {/* ── Configuration Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          {/* Agent Name */}
          <div className="space-y-2">
            <label
              htmlFor="agent-name"
              className="text-sm font-semibold text-gray-800"
            >
              Nom de l&apos;agent
            </label>
            <input
              id="agent-name"
              type="text"
              value={config.agentName}
              onChange={(e) => updateConfig("agentName", e.target.value)}
              placeholder="Nom de votre agent IA"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] transition-all"
            />
          </div>

          {/* AI Prompt Generator */}
          <div
            onClick={() => setShowAIPrompt(!showAIPrompt)}
            className="bg-[#E8F8EF] rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-[#D1FAE5] transition-colors border border-[#25D366]/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-800">
                Générer le prompt avec l&apos;IA
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#25D366]/20 text-[10px] font-bold text-[#16A34A] uppercase tracking-wide">
                Nouveau
              </span>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-[#16A34A] transition-transform duration-200 ${
                showAIPrompt ? "rotate-180" : ""
              }`}
            />
          </div>

          {showAIPrompt && (
            <div className="bg-[#F0FDF4] rounded-xl p-5 border border-[#25D366]/10 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="text-sm text-gray-700">
                Laissez l&apos;IA générer automatiquement des instructions optimisées pour votre agent
                en fonction de votre activité.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    updateConfig(
                      "instructions",
                      "Tu es l'assistante de [Nom de l'entreprise].\nTu réponds aux questions sur nos produits et services.\nTu es professionnelle, chaleureuse et concise."
                    );
                    setShowAIPrompt(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#16A34A] transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Générer
                </button>
                <button
                  onClick={() => setShowAIPrompt(false)}
                  className="px-4 py-2.5 rounded-xl bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Personalized Instructions */}
          <div className="space-y-2">
            <label
              htmlFor="instructions"
              className="text-sm font-semibold text-gray-800"
            >
              Instructions personnalisées
            </label>
            <textarea
              id="instructions"
              value={config.instructions}
              onChange={(e) => updateConfig("instructions", e.target.value)}
              placeholder="Définissez les instructions pour votre agent IA..."
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] focus:bg-white transition-all resize-none leading-relaxed"
            />
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Ces instructions guident l&apos;IA dans ses réponses aux clients.
            </p>
          </div>

          {/* Notification Number */}
          <div className="space-y-2">
            <label
              htmlFor="notif-number"
              className="text-sm font-semibold text-gray-800"
            >
              Numéro de notification commandes
            </label>
            <p className="text-xs text-gray-500 flex items-start gap-1.5">
              <Bell className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-400" />
              Ce numéro WhatsApp reçoit une alerte à chaque nouvelle commande client.
            </p>
            <input
              id="notif-number"
              type="tel"
              value={config.notificationNumber}
              onChange={(e) => updateConfig("notificationNumber", e.target.value)}
              placeholder="Ex: 221760289607 (sans + ni espaces)"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] transition-all"
            />
          </div>
        </div>

        {/* Save Button Footer */}
        <div className="px-6 sm:px-8 py-5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
          {saved ? (
            <div className="flex items-center gap-2 text-sm font-medium text-[#16A34A] animate-in fade-in slide-in-from-left-2 duration-300">
              <CheckCircle2 className="w-4 h-4" />
              Configuration sauvegardée !
            </div>
          ) : (
            <div />
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#16A34A] transition-colors cursor-pointer shadow-sm shadow-[#25D366]/20"
          >
            <Save className="w-4 h-4" />
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
