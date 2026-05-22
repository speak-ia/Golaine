"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  Loader2,
  AlertCircle,
} from "lucide-react";
import { ToggleSwitch } from "@shared/components/feedback/ToggleSwitch";
import { agentsConfigService } from "@features/agents/service";
import { createDefaultAgentConfig } from "@features/agents/defaults";
import type { AgentConfig, AgentSlotTab, SectionTab } from "@features/agents/types";

const languages = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
  { value: "wo", label: "Wolof" },
  { value: "ar", label: "العربية" },
];

const sectionTabs: { id: SectionTab; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "Général", icon: Bot },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "horaires", label: "Horaires", icon: Clock },
  { id: "avance", label: "Avancé", icon: Shield },
];

export default function AgentsPage() {
  const [slots, setSlots] = useState<AgentSlotTab[]>([]);
  const [configs, setConfigs] = useState<Record<number, AgentConfig>>({});
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeSlot, setActiveSlot] = useState(0);
  const [activeSection, setActiveSection] = useState<SectionTab>("general");
  const [aiPromptOpen, setAiPromptOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showInstructionsPreview, setShowInstructionsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);

  const reload = useCallback(async () => {
    const result = await agentsConfigService.loadPageData();
    if (!result.success) {
      setLoadError(result.error.message);
      return;
    }
    setSlots(result.data.slots);
    setConfigs(result.data.configs);
    setBusinessName(result.data.businessName);
    setLoadError(null);
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await reload();
      setLoading(false);
    })();
  }, [reload]);

  const current = slots[activeSlot];
  const slotIndex = current?.slotIndex ?? 1;
  const config =
    configs[slotIndex] ?? createDefaultAgentConfig(businessName);
  const isLocked = current?.status === "locked";

  const update = (key: keyof AgentConfig, value: string | boolean) => {
    setConfigs((prev) => ({
      ...prev,
      [slotIndex]: { ...(prev[slotIndex] ?? config), [key]: value },
    }));
  };

  const handleGenerate = async () => {
    const userInput = promptTextareaRef.current?.value?.trim();
    if (!userInput || isLocked) return;
    setIsGenerating(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/agents/generate-instructions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityDescription: userInput,
          businessName,
        }),
      });
      const data = (await res.json()) as { text?: string; error?: { message?: string } };
      if (!res.ok) {
        setSaveError(data.error?.message ?? "Génération impossible");
        return;
      }
      if (data.text) {
        update("instructions", data.text);
        setAiPromptOpen(false);
      }
    } catch {
      setSaveError("Erreur réseau lors de la génération IA");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (isLocked) return;
    setIsSaving(true);
    setSaveError(null);
    const result = await agentsConfigService.saveSlotConfig(slotIndex, config);
    setIsSaving(false);
    if (!result.success) {
      setSaveError(result.error.message);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = async () => {
    if (isLocked) return;
    const result = await agentsConfigService.resetSlotConfig(slotIndex);
    if (!result.success) {
      setSaveError(result.error.message);
      return;
    }
    setConfigs((prev) => ({ ...prev, [slotIndex]: result.data }));
    setSaveError(null);
  };

  const charCount = config.instructions.length;

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[#22c55e]" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {loadError}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Agent IA
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Configurez votre agent intelligent pour automatiser vos conversations WhatsApp.
        </p>
      </div>

      {saveError && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {slots.map((slot, i) => {
          const isActive = i === activeSlot;
          return (
            <button
              key={slot.slotIndex}
              type="button"
              onClick={() => {
                setActiveSlot(i);
                setActiveSection("general");
              }}
              className={`group relative cursor-pointer rounded-xl border p-4 text-left transition-all duration-200 ${
                isActive
                  ? "border-[#22c55e] bg-[#22c55e] shadow-lg shadow-[#22c55e]/20"
                  : slot.status === "locked"
                    ? "border-gray-200 bg-gray-50 opacity-70"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                      isActive ? "bg-white/20" : "bg-gray-100"
                    }`}
                  >
                    {isActive ? (
                      <Check className="h-5 w-5 text-white" strokeWidth={2.5} />
                    ) : (
                      <Bot className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        isActive ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {slot.displayName}
                    </p>
                    <p
                      className={`mt-0.5 text-xs ${
                        isActive ? "text-white/70" : "text-gray-400"
                      }`}
                    >
                      {slot.status === "connected"
                        ? "Connecté"
                        : slot.status === "locked"
                          ? "Plan supérieur"
                          : "Inactif"}
                    </p>
                  </div>
                </div>
                {slot.status === "connected" && (
                  <span className="flex items-center gap-1">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isActive ? "animate-pulse bg-white" : "bg-[#22c55e]"
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
                  className={`mt-2 ml-[52px] text-xs ${
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

      {isLocked && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Ce slot nécessite un plan supérieur. Passez au plan Pro ou Business dans Mon Plan.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="border-b border-gray-100 bg-gray-50/50">
          <div className="flex overflow-x-auto">
            {sectionTabs.map((tab) => {
              const isActive = activeSection === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSection(tab.id)}
                  disabled={isLocked}
                  className={`relative flex cursor-pointer items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    isActive
                      ? "border-[#22c55e] text-[#22c55e]"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${isActive ? "text-[#22c55e]" : "text-gray-400"}`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5 sm:p-7">
          {activeSection === "general" && (
            <div className="animate-in fade-in space-y-6 duration-200">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Bot className="h-4 w-4 text-gray-400" />
                  Nom de l&apos;agent
                </label>
                <input
                  type="text"
                  value={config.agentName}
                  onChange={(e) => update("agentName", e.target.value)}
                  disabled={isLocked}
                  placeholder="Ex: Assistant, SalesBot..."
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10 disabled:opacity-60"
                />
                <p className="text-xs text-gray-400">
                  Ce nom sera visible par vos clients dans les conversations.
                </p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Bell className="h-4 w-4 text-gray-400" />
                  Numéro de notification commandes
                </label>
                <input
                  type="tel"
                  value={config.notificationNumber}
                  onChange={(e) => update("notificationNumber", e.target.value)}
                  disabled={isLocked}
                  placeholder="Ex: 22375904436 (chiffres uniquement)"
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10 disabled:opacity-60"
                />
                <p className="text-xs text-gray-400">
                  Ce numéro WhatsApp reçoit une alerte à chaque nouvelle commande client.
                </p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Globe className="h-4 w-4 text-gray-400" />
                  Langue de l&apos;agent
                </label>
                <select
                  value={config.language}
                  onChange={(e) => update("language", e.target.value)}
                  disabled={isLocked}
                  className="w-full cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10 disabled:opacity-60"
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

          {activeSection === "messages" && (
            <div className="animate-in fade-in space-y-6 duration-200">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Sparkles className="h-4 w-4 text-[#22c55e]" />
                  Générateur IA de prompt
                </label>
                <div
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-[#dcfce7] bg-[#f0fdf4] px-4 py-3 transition-colors hover:bg-[#ecfdf5]"
                  onClick={() => !isLocked && setAiPromptOpen(!aiPromptOpen)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#22c55e]">
                      <Zap className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Décrivez votre activité, l&apos;IA génère le prompt
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#16a34a] transition-transform duration-200 ${
                      aiPromptOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {aiPromptOpen && !isLocked && (
                  <div className="animate-in fade-in space-y-3 rounded-xl border border-[#dcfce7] bg-[#f0fdf4] p-4 duration-200">
                    <textarea
                      ref={promptTextareaRef}
                      rows={3}
                      placeholder="Ex: Je vends des vêtements à Bamako, prix de 5 000 à 50 000 FCFA..."
                      className="w-full resize-none rounded-lg border border-[#bbf7d0] bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setAiPromptOpen(false)}
                        className="cursor-pointer rounded-lg px-3.5 py-2 text-xs font-medium text-gray-500 hover:bg-white"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleGenerate()}
                        disabled={isGenerating}
                        className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#22c55e] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#16a34a] disabled:opacity-70"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Génération...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5" />
                            Générer
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    Instructions personnalisées
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowInstructionsPreview(!showInstructionsPreview)}
                    className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600"
                  >
                    {showInstructionsPreview ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                    {showInstructionsPreview ? "Masquer aperçu" : "Aperçu"}
                  </button>
                </div>
                {showInstructionsPreview && config.instructions && (
                  <div className="animate-in fade-in rounded-xl border border-gray-100 bg-gray-50 p-4 duration-200">
                    <p className="text-sm whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {config.instructions}
                    </p>
                  </div>
                )}
                <textarea
                  ref={textareaRef}
                  value={config.instructions}
                  onChange={(e) => update("instructions", e.target.value)}
                  disabled={isLocked}
                  rows={7}
                  className="w-full resize-none rounded-lg border border-gray-200 bg-[#fafbfc] px-4 py-3 text-sm leading-relaxed text-gray-900 outline-none focus:border-[#22c55e] focus:bg-white focus:ring-2 focus:ring-[#22c55e]/10 disabled:opacity-60"
                />
                <p className="text-right text-xs text-gray-400">{charCount} caractères</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Message de bienvenue
                </label>
                <textarea
                  value={config.welcomeMessage}
                  onChange={(e) => update("welcomeMessage", e.target.value)}
                  disabled={isLocked}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10 disabled:opacity-60"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Réponse automatique</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    L&apos;agent répond automatiquement aux messages entrants.
                  </p>
                </div>
                <ToggleSwitch
                  enabled={config.autoResponse}
                  onToggle={() => update("autoResponse", !config.autoResponse)}
                />
              </div>
            </div>
          )}

          {activeSection === "horaires" && (
            <div className="animate-in fade-in space-y-6 duration-200">
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Heures de travail</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    L&apos;agent ne répond qu&apos;aux heures ouvrables définies.
                  </p>
                </div>
                <ToggleSwitch
                  enabled={config.workingHours}
                  onToggle={() => update("workingHours", !config.workingHours)}
                />
              </div>
              {config.workingHours && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="time"
                      value={config.startTime}
                      onChange={(e) => update("startTime", e.target.value)}
                      disabled={isLocked}
                      className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm disabled:opacity-60"
                    />
                    <span className="text-sm text-gray-400">à</span>
                    <input
                      type="time"
                      value={config.endTime}
                      onChange={(e) => update("endTime", e.target.value)}
                      disabled={isLocked}
                      className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm disabled:opacity-60"
                    />
                  </div>
                  <select
                    value={config.timezone}
                    onChange={(e) => update("timezone", e.target.value)}
                    disabled={isLocked}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm disabled:opacity-60"
                  >
                    <option value="Africa/Dakar">GMT (Dakar)</option>
                    <option value="Europe/Paris">GMT+1 (Paris)</option>
                    <option value="Africa/Lagos">GMT+1 (Lagos)</option>
                    <option value="Africa/Abidjan">GMT (Abidjan)</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {activeSection === "avance" && (
            <div className="animate-in fade-in space-y-6 duration-200">
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Transfert vers un humain</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Rediriger si l&apos;agent ne peut pas répondre.
                  </p>
                </div>
                <ToggleSwitch
                  enabled={config.fallbackToHuman}
                  onToggle={() => update("fallbackToHuman", !config.fallbackToHuman)}
                />
              </div>
              {current?.status === "connected" && (
                <p className="text-xs text-gray-500">
                  Conversations actives sur ce compte : {current.conversations}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/50 px-5 py-4 sm:px-7">
          <p className="hidden text-xs text-gray-400 sm:block">
            Les modifications sont enregistrées dans Supabase par slot WhatsApp.
          </p>
          <div className="ml-auto flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => void handleReset()}
              disabled={isLocked || isSaving}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Réinitialiser</span>
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isLocked || isSaving}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#22c55e] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#16a34a] disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : saved ? (
                <>
                  <Check className="h-4 w-4" />
                  Enregistré !
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
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
