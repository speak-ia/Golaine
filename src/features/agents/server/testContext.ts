import {
  AuthenticationError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "@shared/errors/AppError";
import type { PlanTier } from "@shared/types/domainTypes";
import { createDefaultAgentConfig } from "@features/agents/defaults";
import type { AgentConfig } from "@features/agents/types";
import { getMaxWhatsAppSlots } from "@shared/services/whatsapp/planLimits";
import { createServerSupabaseClient } from "@shared/services/supabase/server";

const PLAN_VALUES: PlanTier[] = ["Starter", "Pro", "Business"];

const LANG_LABELS: Record<AgentConfig["language"], string> = {
  fr: "français",
  en: "anglais",
  wo: "wolof",
  ar: "arabe",
};

function planFromDb(raw: string | null | undefined): PlanTier {
  if (raw && PLAN_VALUES.includes(raw as PlanTier)) return raw as PlanTier;
  return "Starter";
}

function formatTime(raw: string): string {
  return raw?.slice(0, 5) || "08:00";
}

function rowToConfig(
  row: Record<string, unknown> | null | undefined,
  businessName: string,
): AgentConfig {
  const defaults = createDefaultAgentConfig(businessName);
  if (!row) return defaults;
  const lang = row.language;
  return {
    agentName: String(row.agent_name ?? "").trim() || defaults.agentName,
    instructions: String(row.system_prompt ?? "").trim() || defaults.instructions,
    notificationNumber: String(row.notification_phone ?? "").trim(),
    autoResponse: Boolean(row.auto_response ?? defaults.autoResponse),
    welcomeMessage: String(row.welcome_message ?? "").trim() || defaults.welcomeMessage,
    workingHours: Boolean(row.working_hours_enabled ?? false),
    startTime: formatTime(String(row.work_start ?? "08:00")),
    endTime: formatTime(String(row.work_end ?? "20:00")),
    timezone: String(row.timezone ?? "").trim() || defaults.timezone,
    language:
      lang === "en" || lang === "wo" || lang === "ar" ? lang : "fr",
    fallbackToHuman: Boolean(row.fallback_to_human ?? false),
  };
}

export type AgentTestContext = {
  slotIndex: number;
  displayName: string;
  phone: string | null;
  status: "connected" | "inactive" | "locked";
  agentName: string;
  welcomeMessage: string;
  systemPrompt: string;
  autoResponse: boolean;
};

function buildSystemPrompt(
  config: AgentConfig,
  businessName: string,
  displayName: string,
): string {
  const shop = businessName.trim() || displayName;
  const lang = LANG_LABELS[config.language] ?? "français";

  const hoursNote = config.workingHours
    ? `Heures actives : ${config.startTime}–${config.endTime} (${config.timezone}). Hors plage, indique que la boutique répondra plus tard.`
    : "Tu réponds 24h/24.";

  const instructions =
    config.instructions.trim() ||
    `Tu aides les clients de ${shop} sur WhatsApp.`;

  return `${instructions}

Contexte :
- Tu es « ${config.agentName.trim() || "Assistant"} » pour « ${displayName} » (${shop}).
- Réponds en ${lang}, messages courts style WhatsApp.
- ${hoursNote}
- Ne invente pas de prix ni de stock ; propose de confirmer les commandes.`;
}

export async function loadAgentTestContext(
  slotIndex: number,
): Promise<AgentTestContext> {
  if (slotIndex < 1 || slotIndex > 3) {
    throw new ValidationError("Slot invalide (1 à 3)");
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AuthenticationError();

  const [{ data: profile }, { data: business }, { data: waSlot }, { data: agentRow }] =
    await Promise.all([
      supabase.from("profiles").select("plan_tier").eq("id", user.id).maybeSingle(),
      supabase.from("businesses").select("legal_name").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("whatsapp_slots")
        .select("display_name, phone, connection_status")
        .eq("user_id", user.id)
        .eq("slot_index", slotIndex)
        .maybeSingle(),
      supabase
        .from("agent_slot_settings")
        .select("*")
        .eq("user_id", user.id)
        .eq("slot_index", slotIndex)
        .maybeSingle(),
    ]);

  const maxSlots = getMaxWhatsAppSlots(planFromDb(profile?.plan_tier));
  const status =
    slotIndex > maxSlots
      ? "locked"
      : waSlot?.connection_status === "connected"
        ? "connected"
        : "inactive";

  if (!waSlot) {
    throw new NotFoundError("Slot WhatsApp");
  }

  const businessName =
    business?.legal_name?.trim() || waSlot.display_name?.trim() || "votre entreprise";
  const config = rowToConfig(agentRow, businessName);

  return {
    slotIndex,
    displayName: waSlot.display_name?.trim() || `Numéro ${slotIndex}`,
    phone: waSlot.phone?.trim() || null,
    status,
    agentName: config.agentName,
    welcomeMessage: config.welcomeMessage,
    systemPrompt: buildSystemPrompt(config, businessName, waSlot.display_name),
    autoResponse: config.autoResponse,
  };
}

export async function listTestableSlots(): Promise<
  { slotIndex: number; displayName: string; status: AgentTestContext["status"] }[]
> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AuthenticationError();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan_tier")
    .eq("id", user.id)
    .maybeSingle();

  const maxSlots = getMaxWhatsAppSlots(planFromDb(profile?.plan_tier));

  const { data: slots, error } = await supabase
    .from("whatsapp_slots")
    .select("slot_index, display_name, connection_status")
    .eq("user_id", user.id)
    .order("slot_index");

  if (error) {
    throw new InternalServerError();
  }

  return (slots ?? []).map((s) => ({
    slotIndex: s.slot_index,
    displayName: s.display_name?.trim() || `Numéro ${s.slot_index}`,
    status:
      s.slot_index > maxSlots
        ? "locked"
        : s.connection_status === "connected"
          ? "connected"
          : "inactive",
  }));
}
