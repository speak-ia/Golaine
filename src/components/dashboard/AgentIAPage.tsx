"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  ChevronDown,
  Check,
  Bell,
} from "lucide-react";

/* ──────────────────── Types ──────────────────── */
type TabSlot = {
  name: string;
  phone: string;
  status: "connected" | "inactive";
};

type AgentConfig = {
  agentName: string;
  instructions: string;
  notificationNumber: string;
};

/* ──────────────────── Mock Data ──────────────────── */
const slots: TabSlot[] = [
  { name: "Alou Shop", phone: "+221760289607", status: "connected" },
  { name: "Numéro 2", phone: "", status: "inactive" },
  { name: "Numéro 3", phone: "", status: "inactive" },
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

/* ──────────────────── Custom CSS (pixel-perfect) ──────────────────── */
const agentStyles = `
  .agent-tab {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    padding: 14px 16px;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
    min-width: 0;
  }
  .agent-tab:hover:not(.agent-tab--active) {
    border-color: #d1d5db;
  }
  .agent-tab--active {
    background: #22c55e;
    border-color: #22c55e;
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
  }
  .agent-tab__checkbox {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    border: 1.5px solid #9ca3af;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: #f3f4f6;
  }
  .agent-tab--active .agent-tab__checkbox {
    border-color: rgba(255,255,255,0.6);
    background: rgba(255,255,255,0.25);
  }

  .agent-field {
    width: 100%;
    padding: 10px 14px;
    border-radius: 8px;
    border: 1.5px solid #e5e7eb;
    background: #ffffff;
    font-size: 14px;
    color: #111827;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
    line-height: 1.5;
  }
  .agent-field::placeholder {
    color: #9ca3af;
  }
  .agent-field:focus {
    border-color: #22c55e;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.12);
  }

  .agent-textarea {
    width: 100%;
    padding: 14px;
    border-radius: 8px;
    border: 1.5px solid #e5e7eb;
    background: #f9fafb;
    font-size: 14px;
    color: #111827;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    resize: none;
    line-height: 1.7;
  }
  .agent-textarea:focus {
    border-color: #22c55e;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.12);
    background: #ffffff;
  }

  .ai-prompt-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-radius: 10px;
    background: #f0fdf4;
    border: 1px solid #dcfce7;
    cursor: pointer;
    transition: background 0.15s ease;
  }
  .ai-prompt-bar:hover {
    background: #ecfdf5;
  }

  .section-label {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 8px;
    display: block;
  }
`;

/* ──────────────────── Main Component ──────────────────── */
export default function AgentIAPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [configs, setConfigs] = useState<Record<string, AgentConfig>>(defaultConfigs);
  const [aiPromptOpen, setAiPromptOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const current = slots[activeTab];
  const config = configs[current.name];

  const update = (key: keyof AgentConfig, value: string) => {
    setConfigs((prev) => ({
      ...prev,
      [current.name]: { ...prev[current.name], [key]: value },
    }));
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      update(
        "instructions",
        "Tu es l'assistante de [Nom de l'entreprise].\nTu réponds aux questions sur nos produits et services.\nTu es professionnelle, chaleureuse et concise."
      );
      setIsGenerating(false);
      setAiPromptOpen(false);
    }, 1800);
  };

  // Auto-focus name input on tab switch
  const nameInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: agentStyles }} />

      <div className="max-w-2xl mx-auto px-0">
        {/* ── Number Tabs ── */}
        <div className="flex gap-2 mb-6">
          {slots.map((slot, i) => {
            const active = i === activeTab;
            return (
              <button
                key={slot.name}
                onClick={() => setActiveTab(i)}
                className={`agent-tab ${active ? "agent-tab--active" : ""}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="agent-tab__checkbox">
                    {active && (
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium truncate ${
                      active ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {slot.name}
                  </span>
                </div>
                <span
                  className={`text-[11px] ml-[29px] ${
                    active ? "text-white/75" : "text-gray-400"
                  }`}
                >
                  {slot.status === "connected" ? "Connecté" : "Inactif"}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Form Card ── */}
        <div className="bg-white rounded-xl border border-gray-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6 sm:p-7 space-y-5">

          {/* 1. Nom de l'agent */}
          <div>
            <label className="section-label" htmlFor="agent-name">
              Nom de l&apos;agent
            </label>
            <input
              ref={nameInputRef}
              id="agent-name"
              type="text"
              value={config.agentName}
              onChange={(e) => update("agentName", e.target.value)}
              placeholder="Nom de votre agent IA"
              className="agent-field"
            />
          </div>

          {/* 2. AI Prompt Generator Bar */}
          <div
            className="ai-prompt-bar"
            onClick={() => setAiPromptOpen(!aiPromptOpen)}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#22c55e] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-800">
                Générer le prompt avec l&apos;IA
              </span>
              <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold text-[#16a34a] bg-[#dcfce7] uppercase tracking-wide leading-none">
                Nouveau
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-[#16a34a] flex-shrink-0 transition-transform duration-200 ${
                aiPromptOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {/* AI Prompt Expanded Panel */}
          {aiPromptOpen && (
            <div className="bg-[#f0fdf4] rounded-lg p-4 border border-[#dcfce7] space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
              <p className="text-[13px] text-gray-600 leading-relaxed">
                Décrivez votre activité et l&apos;IA générera des instructions optimisées
                pour votre agent commercial.
              </p>
              <textarea
                rows={2}
                placeholder="Ex: Je vends des vêtements et accessoires de mode pour femmes à Dakar..."
                className="agent-field text-[13px] bg-white"
              />
              <div className="flex items-center gap-2 justify-end pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAiPromptOpen(false);
                  }}
                  className="px-3.5 py-2 rounded-lg text-[13px] font-medium text-gray-500 hover:bg-white hover:text-gray-700 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerate();
                  }}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#22c55e] text-white text-[13px] font-semibold hover:bg-[#16a34a] transition-colors cursor-pointer disabled:opacity-70"
                >
                  {isGenerating ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      Génération...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Générer
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 3. Instructions personnalisées */}
          <div>
            <label className="section-label" htmlFor="instructions">
              Instructions personnalisées
            </label>
            <textarea
              ref={textareaRef}
              id="instructions"
              value={config.instructions}
              onChange={(e) => update("instructions", e.target.value)}
              placeholder="Définissez les instructions pour votre agent IA..."
              rows={5}
              className="agent-textarea"
            />
          </div>

          {/* 4. Numéro de notification commandes */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Bell className="w-3.5 h-3.5 text-gray-400" />
              <label className="section-label !mb-0" htmlFor="notif-number">
                Numéro de notification commandes
              </label>
            </div>
            <p className="text-[12px] text-gray-400 mb-2.5 ml-5 leading-relaxed">
              Ce numéro WhatsApp reçoit une alerte à chaque nouvelle commande client.
            </p>
            <input
              id="notif-number"
              type="tel"
              value={config.notificationNumber}
              onChange={(e) => update("notificationNumber", e.target.value)}
              placeholder="Ex: 221760289607 (sans + ni espaces)"
              className="agent-field"
            />
          </div>
        </div>
      </div>
    </>
  );
}
