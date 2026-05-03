"use client";

import { useState, useRef } from "react";
import {
  Sparkles,
  ChevronDown,
  Check,
  Bell,
  Bot,
  MessageSquare,
  Zap,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Phone,
  Globe,
  Shield,
  Clock,
} from "lucide-react";
import { ToggleSwitch } from "@shared/components/feedback/ToggleSwitch";

/* ──────────────────── Types ──────────────────── */
type TabSlot = {
  name: string;
  phone: string;
  status: "connected" | "inactive";
  conversations: number;
};

type AgentConfig = {
  agentName: string;
  instructions: string;
  notificationNumber: string;
  autoResponse: boolean;
  welcomeMessage: string;
  workingHours: boolean;
  startTime: string;
  endTime: string;
  timezone: string;
  language: string;
  fallbackToHuman: boolean;
};

/* ──────────────────── Mock Data ──────────────────── */
const slots: TabSlot[] = [
  { name: "Alou Shop", phone: "+221 76 028 96 07", status: "connected", conversations: 24 },
  { name: "Numéro 2", phone: "", status: "inactive", conversations: 0 },
  { name: "Numéro 3", phone: "", status: "inactive", conversations: 0 },
];

const defaultConfigs: Record<string, AgentConfig> = {
  "Alou Shop": {
    agentName: "Assistan",
    instructions:
      "Tu es l'assistante de [Nom de l'entreprise].\nTu réponds aux questions sur nos produits et services.\nTu es professionnelle, chaleureuse et concise.",
    notificationNumber: "",
    autoResponse: true,
    welcomeMessage: "Bonjour ! 👋 Bienvenue chez [Nom de l'entreprise]. Comment puis-je vous aider aujourd'hui ?",
    workingHours: false,
    startTime: "08:00",
    endTime: "20:00",
    timezone: "Africa/Dakar",
    language: "fr",
    fallbackToHuman: false,
  },
  "Numéro 2": {
    agentName: "",
    instructions: "",
    notificationNumber: "",
    autoResponse: false,
    welcomeMessage: "",
    workingHours: false,
    startTime: "08:00",
    endTime: "20:00",
    timezone: "Africa/Dakar",
    language: "fr",
    fallbackToHuman: false,
  },
  "Numéro 3": {
    agentName: "",
    instructions: "",
    notificationNumber: "",
    autoResponse: false,
    welcomeMessage: "",
    workingHours: false,
    startTime: "08:00",
    endTime: "20:00",
    timezone: "Africa/Dakar",
    language: "fr",
    fallbackToHuman: false,
  },
};

const languages = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
  { value: "wo", label: "Wolof" },
  { value: "ar", label: "العربية" },
];

/* Note: Toggle extrait en ToggleSwitch réutilisable */

/* ──────────────────── Tab Content Sections ──────────────────── */
type SectionTab = "general" | "messages" | "horaires" | "avance";

const sectionTabs: { id: SectionTab; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "Général", icon: Bot },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "horaires", label: "Horaires", icon: Clock },
  { id: "avance", label: "Avancé", icon: Shield },
];

/* ──────────────────── Main Component ──────────────────── */
export default function AgentsPage() {
  const [activeSlot, setActiveSlot] = useState(0);
  const [activeSection, setActiveSection] = useState<SectionTab>("general");
  const [configs, setConfigs] = useState<Record<string, AgentConfig>>(defaultConfigs);
  const [aiPromptOpen, setAiPromptOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showInstructionsPreview, setShowInstructionsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);

  const current = slots[activeSlot];
  const config = configs[current.name];

  const update = (key: keyof AgentConfig, value: string | boolean) => {
    setConfigs((prev) => ({
      ...prev,
      [current.name]: { ...prev[current.name], [key]: value },
    }));
  };

  const handleGenerate = () => {
    const userInput = promptTextareaRef.current?.value?.trim();
    if (!userInput) return;
    setIsGenerating(true);
    setTimeout(() => {
      const generated = `Tu es l'assistante IA de [Nom de l'entreprise], une boutique spécialisée dans la vente de produits de qualité.\n\nDescription de l'activité :\n${userInput}\n\nTon rôle :\n- Accueillir chaleureusement chaque client\n- Répondre aux questions sur les produits, prix et disponibilités\n- Aider les clients à passer commande\n- Fournir des informations sur la livraison et le paiement\n\nTon ton : professionnel, amical et concis.\nTu réponds toujours en français sauf si le client écrit dans une autre langue.`;
      update("instructions", generated);
      setIsGenerating(false);
      setAiPromptOpen(false);
    }, 2000);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 1200);
  };

  const handleReset = () => {
    setConfigs((prev) => ({
      ...prev,
      [current.name]: defaultConfigs[current.name],
    }));
  };

  const charCount = config.instructions.length;

  return (
    <div className="w-full space-y-6">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Agent IA</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configurez votre agent intelligent pour automatiser vos conversations WhatsApp.
        </p>
      </div>

      {/* ── Number Selection Tabs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {slots.map((slot, i) => {
          const isActive = i === activeSlot;
          return (
            <button
              key={slot.name}
              onClick={() => {
                setActiveSlot(i);
                setActiveSection("general");
              }}
              className={`relative group text-left rounded-xl border p-4 transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#22c55e] border-[#22c55e] shadow-lg shadow-[#22c55e]/20"
                  : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      isActive ? "bg-white/20" : "bg-gray-100"
                    }`}
                  >
                    {isActive ? (
                      <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
                    ) : (
                      <Bot className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        isActive ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {slot.name}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${
                        isActive ? "text-white/70" : "text-gray-400"
                      }`}
                    >
                      {slot.status === "connected" ? "Connecté" : "Inactif"}
                    </p>
                  </div>
                </div>
                {slot.status === "connected" && (
                  <span className="flex items-center gap-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isActive ? "bg-white animate-pulse" : "bg-[#22c55e]"
                      }`}
                    />
                    {slot.conversations > 0 && (
                      <span
                        className={`text-xs font-medium ${
                          isActive ? "text-white/80" : "text-gray-400"
                        }`}
                      >
                        {slot.conversations}
                      </span>
                    )}
                  </span>
                )}
              </div>
              {slot.phone && (
                <p
                  className={`text-xs mt-2 ml-[52px] ${
                    isActive ? "text-white/60" : "text-gray-400"
                  }`}
                >
                  {slot.phone}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Section Tabs + Content ── */}
      <div className="bg-white rounded-2xl border border-gray-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
        {/* Section Tab Bar */}
        <div className="border-b border-gray-100 bg-gray-50/50">
          <div className="flex overflow-x-auto">
            {sectionTabs.map((tab) => {
              const isActive = activeSection === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
                    isActive
                      ? "text-[#22c55e] border-[#22c55e]"
                      : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#22c55e]" : "text-gray-400"}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Content */}
        <div className="p-5 sm:p-7">
          {/* ── GENERAL TAB ── */}
          {activeSection === "general" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Agent Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Bot className="w-4 h-4 text-gray-400" />
                  Nom de l&apos;agent
                </label>
                <input
                  type="text"
                  value={config.agentName}
                  onChange={(e) => update("agentName", e.target.value)}
                  placeholder="Ex: Assistan, SalesBot, Service Client..."
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10"
                />
                <p className="text-xs text-gray-400">
                  Ce nom sera visible par vos clients dans les conversations.
                </p>
              </div>

              {/* Notification Number */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Bell className="w-4 h-4 text-gray-400" />
                  Numéro de notification commandes
                </label>
                <input
                  type="tel"
                  value={config.notificationNumber}
                  onChange={(e) => update("notificationNumber", e.target.value)}
                  placeholder="Ex: 221760289607 (sans + ni espaces)"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10"
                />
                <p className="text-xs text-gray-400">
                  Ce numéro WhatsApp reçoit une alerte à chaque nouvelle commande client.
                </p>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Globe className="w-4 h-4 text-gray-400" />
                  Langue de l&apos;agent
                </label>
                <select
                  value={config.language}
                  onChange={(e) => update("language", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 outline-none transition-all focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10"
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ── MESSAGES TAB ── */}
          {activeSection === "messages" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* AI Prompt Generator */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Sparkles className="w-4 h-4 text-[#22c55e]" />
                  Générateur IA de prompt
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold text-[#16a34a] bg-[#dcfce7] uppercase tracking-wider leading-none">
                    Nouveau
                  </span>
                </label>

                <div
                  className="flex items-center justify-between px-4 py-3 rounded-lg bg-[#f0fdf4] border border-[#dcfce7] cursor-pointer hover:bg-[#ecfdf5] transition-colors"
                  onClick={() => setAiPromptOpen(!aiPromptOpen)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-[#22c55e] flex items-center justify-center flex-shrink-0">
                      <Zap className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Décrivez votre activité, l&apos;IA génère le prompt
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#16a34a] flex-shrink-0 transition-transform duration-200 ${
                      aiPromptOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {aiPromptOpen && (
                  <div className="bg-[#f0fdf4] rounded-xl p-4 border border-[#dcfce7] space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Décrivez votre activité en quelques phrases. L&apos;IA générera des instructions
                      optimisées pour votre agent commercial.
                    </p>
                    <textarea
                      ref={promptTextareaRef}
                      rows={3}
                      placeholder="Ex: Je vends des vêtements et accessoires de mode pour femmes à Dakar. Nos prix vont de 5 000 à 50 000 FCFA..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#bbf7d0] bg-white text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10 resize-none"
                    />
                    <div className="flex items-center gap-2 justify-end pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAiPromptOpen(false);
                        }}
                        className="px-3.5 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-white hover:text-gray-700 transition-colors cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerate();
                        }}
                        disabled={isGenerating}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#22c55e] text-white text-xs font-semibold hover:bg-[#16a34a] transition-colors cursor-pointer disabled:opacity-70 shadow-sm"
                      >
                        {isGenerating ? (
                          <>
                            <svg
                              className="w-3.5 h-3.5 animate-spin"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
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
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    Instructions personnalisées
                  </label>
                  <button
                    onClick={() => setShowInstructionsPreview(!showInstructionsPreview)}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {showInstructionsPreview ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                    {showInstructionsPreview ? "Masquer aperçu" : "Aperçu"}
                  </button>
                </div>

                {/* Preview Mode */}
                {showInstructionsPreview && config.instructions && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 animate-in fade-in slide-in-from-top-1 duration-200">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">
                      Aperçu des instructions
                    </p>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {config.instructions}
                    </div>
                  </div>
                )}

                <textarea
                  ref={textareaRef}
                  value={config.instructions}
                  onChange={(e) => update("instructions", e.target.value)}
                  placeholder="Définissez les instructions pour votre agent IA..."
                  rows={7}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-[#fafbfc] text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10 focus:bg-white resize-none leading-relaxed"
                />
                <p className="text-xs text-gray-400 text-right">{charCount} caractères</p>
              </div>

              {/* Welcome Message */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  Message de bienvenue
                </label>
                <textarea
                  value={config.welcomeMessage}
                  onChange={(e) => update("welcomeMessage", e.target.value)}
                  placeholder="Le premier message envoyé automatiquement à chaque nouveau client..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-[#fafbfc] text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10 focus:bg-white resize-none leading-relaxed"
                />
                <p className="text-xs text-gray-400">
                  Ce message sera envoyé automatiquement lorsqu&apos;un client contacte votre numéro pour la première fois.
                </p>
              </div>

              {/* Auto Response Toggle */}
              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#dcfce7] flex items-center justify-center">
                    <Zap className="w-4 h-4 text-[#16a34a]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Réponse automatique</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      L&apos;agent répond automatiquement à tous les messages entrants.
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={config.autoResponse}
                  onToggle={() => update("autoResponse", !config.autoResponse)}
                />
              </div>
            </div>
          )}

          {/* ── HORAIRES TAB ── */}
          {activeSection === "horaires" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Working Hours Toggle */}
              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Heures de travail</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      L&apos;agent ne répond qu&apos;aux heures ouvrables définies.
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={config.workingHours}
                  onToggle={() => update("workingHours", !config.workingHours)}
                />
              </div>

              {config.workingHours && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Time Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Plage horaire
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="time"
                        value={config.startTime}
                        onChange={(e) => update("startTime", e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 outline-none transition-all focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10"
                      />
                      <span className="text-sm text-gray-400 font-medium">à</span>
                      <input
                        type="time"
                        value={config.endTime}
                        onChange={(e) => update("endTime", e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 outline-none transition-all focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10"
                      />
                    </div>
                  </div>

                  {/* Timezone */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Globe className="w-4 h-4 text-gray-400" />
                      Fuseau horaire
                    </label>
                    <select
                      value={config.timezone}
                      onChange={(e) => update("timezone", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 outline-none transition-all focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10"
                    >
                      <option value="Africa/Dakar">GMT (Dakar)</option>
                      <option value="Europe/Paris">GMT+1 (Paris)</option>
                      <option value="Africa/Lagos">GMT+1 (Lagos)</option>
                      <option value="Africa/Abidjan">GMT (Abidjan)</option>
                    </select>
                  </div>

                  {/* Info card */}
                  <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-100">
                    <p className="text-xs text-amber-700 leading-relaxed">
                      <strong>Info :</strong> En dehors de ces heures, les messages seront mis en file d&apos;attente
                      et traités dès la réouverture. Vous pouvez activer le transfert vers un humain
                      dans les paramètres avancés.
                    </p>
                  </div>
                </div>
              )}

              {!config.workingHours && (
                <div className="bg-green-50/60 rounded-xl p-4 border border-green-100">
                  <p className="text-xs text-green-700 leading-relaxed">
                    <strong>Mode 24h/24 actif.</strong> Votre agent répond à tout moment, y compris la nuit
                    et les week-ends.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── AVANCÉ TAB ── */}
          {activeSection === "avance" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Fallback to Human */}
              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Transfert vers un humain</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Transférer automatiquement la conversation si l&apos;agent ne peut pas répondre.
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={config.fallbackToHuman}
                  onToggle={() => update("fallbackToHuman", !config.fallbackToHuman)}
                />
              </div>

              {config.fallbackToHuman && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Numéro de transfert
                    </label>
                    <input
                      type="tel"
                      value={config.notificationNumber}
                      onChange={(e) => update("notificationNumber", e.target.value)}
                      placeholder="Ex: 221760289607"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10"
                    />
                  </div>
                  <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100">
                    <p className="text-xs text-blue-700 leading-relaxed">
                      <strong>Comment ça marche :</strong> Lorsque l&apos;agent détecte une requête complexe
                      ou un mécontentement client, la conversation sera automatiquement redirigée
                      vers ce numéro.
                    </p>
                  </div>
                </div>
              )}

              {/* Stats Card */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Statistiques de l&apos;agent</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { label: "Messages traités", value: "1 247", color: "text-[#22c55e]" },
                    { label: "Taux de résolution", value: "94%", color: "text-[#22c55e]" },
                    { label: "Temps de réponse", value: "~2s", color: "text-[#22c55e]" },
                    { label: "Transferts", value: "8", color: "text-gray-500" },
                    { label: "Satisfaction", value: "4.8/5", color: "text-amber-500" },
                    { label: "Conversations actives", value: "3", color: "text-blue-500" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-gray-50 rounded-xl p-3.5 border border-gray-100"
                    >
                      <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="space-y-3 pt-2">
                <p className="text-sm font-medium text-red-600">Zone de danger</p>
                <div className="border border-red-100 rounded-xl p-4 bg-red-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Réinitialiser la configuration</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Remettre tous les paramètres par défaut.
                      </p>
                    </div>
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Réinitialiser
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer Actions ── */}
        <div className="border-t border-gray-100 bg-gray-50/50 px-5 sm:px-7 py-4 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-400 hidden sm:block">
            Les modifications sont appliquées après enregistrement.
          </p>
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Réinitialiser</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer shadow-sm ${
                saved
                  ? "bg-[#22c55e] text-white"
                  : "bg-[#22c55e] text-white hover:bg-[#16a34a] active:scale-[0.98]"
              }`}
            >
              {isSaving ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Enregistrement...
                </>
              ) : saved ? (
                <>
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                  Enregistré !
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
