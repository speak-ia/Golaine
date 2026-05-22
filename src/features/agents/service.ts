import type { AgentIA, PlanTier } from "@shared/types/domainTypes";
import {
  AuthenticationError,
  InternalServerError,
  ValidationError,
} from "@shared/errors/AppError";
import { pickServiceImplementation } from "@shared/services/pickServiceImplementation";
import { createBrowserSupabaseClient } from "@shared/services/supabase/client";
import { getMaxWhatsAppSlots } from "@shared/services/whatsapp/planLimits";
import { err, ok, type Result } from "@shared/types/Result";
import { logger } from "@shared/utils/logger";
import { createDefaultAgentConfig } from "./defaults";
import { agentConfigSchema, type AgentConfigInput } from "./schemas";
import type {
  AgentConfig,
  AgentSlotStatus,
  AgentSlotTab,
  AgentsPageData,
} from "./types";
import { MOCK_AGENTS_IA } from "./data/mockAgents";

const PLAN_VALUES: PlanTier[] = ["Starter", "Pro", "Business"];

function planFromDb(raw: string | null | undefined): PlanTier {
  if (raw && PLAN_VALUES.includes(raw as PlanTier)) return raw as PlanTier;
  return "Starter";
}

type SlotRow = {
  slot_index: number;
  display_name: string;
  phone: string;
  connection_status: string;
};

type AgentSlotRow = {
  slot_index: number;
  agent_name: string;
  notification_phone: string;
  language: string;
  timezone: string;
  system_prompt: string;
  welcome_message: string;
  auto_response: boolean;
  working_hours_enabled: boolean;
  work_start: string;
  work_end: string;
  fallback_to_human: boolean;
};

function formatTime(raw: string): string {
  if (!raw) return "08:00";
  return raw.slice(0, 5);
}

function rowToConfig(row: AgentSlotRow | undefined, businessName: string): AgentConfig {
  const defaults = createDefaultAgentConfig(businessName);
  if (!row) return defaults;
  return {
    agentName: row.agent_name?.trim() || defaults.agentName,
    instructions: row.system_prompt?.trim() || defaults.instructions,
    notificationNumber: row.notification_phone?.trim() || "",
    autoResponse: row.auto_response ?? defaults.autoResponse,
    welcomeMessage: row.welcome_message?.trim() || defaults.welcomeMessage,
    workingHours: row.working_hours_enabled ?? false,
    startTime: formatTime(row.work_start),
    endTime: formatTime(row.work_end),
    timezone: row.timezone?.trim() || defaults.timezone,
    language:
      row.language === "en" || row.language === "wo" || row.language === "ar"
        ? row.language
        : "fr",
    fallbackToHuman: row.fallback_to_human ?? false,
  };
}

function configToRow(config: AgentConfigInput) {
  return {
    agent_name: config.agentName.trim(),
    notification_phone: config.notificationNumber.replace(/\D/g, ""),
    language: config.language,
    timezone: config.timezone,
    system_prompt: config.instructions.trim(),
    welcome_message: config.welcomeMessage.trim(),
    auto_response: config.autoResponse,
    working_hours_enabled: config.workingHours,
    work_start: config.startTime,
    work_end: config.endTime,
    fallback_to_human: config.fallbackToHuman,
    updated_at: new Date().toISOString(),
  };
}

function mapSlotStatus(
  connectionStatus: string,
  slotIndex: number,
  maxSlots: number,
): AgentSlotStatus {
  if (slotIndex > maxSlots) return "locked";
  if (connectionStatus === "connected") return "connected";
  return "inactive";
}

export interface AgentsConfigService {
  loadPageData(): Promise<Result<AgentsPageData>>;
  saveSlotConfig(slotIndex: number, config: AgentConfigInput): Promise<Result<void>>;
  resetSlotConfig(slotIndex: number): Promise<Result<AgentConfig>>;
  listAgentsForProducts(): Promise<Result<AgentIA[]>>;
}

const agentsConfigServiceMock: AgentsConfigService = {
  async loadPageData() {
    const configs: Record<number, AgentConfig> = {
      1: createDefaultAgentConfig("Alou Shop"),
      2: createDefaultAgentConfig("Numéro 2"),
      3: createDefaultAgentConfig("Numéro 3"),
    };
    return ok({
      slots: [
        {
          slotIndex: 1,
          displayName: "Alou Shop",
          phone: "+221 76 028 96 07",
          status: "connected",
          conversations: 24,
        },
        {
          slotIndex: 2,
          displayName: "Numéro 2",
          phone: null,
          status: "inactive",
          conversations: 0,
        },
        {
          slotIndex: 3,
          displayName: "Numéro 3",
          phone: null,
          status: "locked",
          conversations: 0,
        },
      ],
      configs,
      businessName: "Alou Shop",
      maxSlots: 2,
    });
  },
  async saveSlotConfig() {
    return ok(undefined);
  },
  async resetSlotConfig(slotIndex: number) {
    return ok(createDefaultAgentConfig(`Numéro ${slotIndex}`));
  },
  async listAgentsForProducts() {
    return ok([...MOCK_AGENTS_IA]);
  },
};

const agentsConfigServiceSupabase: AgentsConfigService = {
  async loadPageData() {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err(new AuthenticationError());

    const [{ data: profile }, { data: business }, { data: waSlots }, { data: agentRows }, { count }] =
      await Promise.all([
        supabase.from("profiles").select("plan_tier").eq("id", user.id).maybeSingle(),
        supabase.from("businesses").select("legal_name").eq("user_id", user.id).maybeSingle(),
        supabase
          .from("whatsapp_slots")
          .select("slot_index, display_name, phone, connection_status")
          .eq("user_id", user.id)
          .order("slot_index", { ascending: true }),
        supabase.from("agent_slot_settings").select("*").eq("user_id", user.id),
        supabase
          .from("conversation_threads")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

    const planTier = planFromDb(profile?.plan_tier);
    const maxSlots = getMaxWhatsAppSlots(planTier);
    const businessName =
      business?.legal_name?.trim() ||
      waSlots?.[0]?.display_name?.trim() ||
      "votre entreprise";

    const waRows = (waSlots ?? []) as SlotRow[];
    const agentBySlot = new Map(
      ((agentRows ?? []) as AgentSlotRow[]).map((r) => [r.slot_index, r]),
    );

    const totalConversations = count ?? 0;
    const slots: AgentSlotTab[] = [1, 2, 3].map((slotIndex) => {
      const wa = waRows.find((r) => r.slot_index === slotIndex);
      const status = mapSlotStatus(
        wa?.connection_status ?? "empty",
        slotIndex,
        maxSlots,
      );
      return {
        slotIndex,
        displayName: wa?.display_name?.trim() || `Numéro ${slotIndex}`,
        phone: wa?.phone?.trim() || null,
        status,
        conversations: status === "connected" ? totalConversations : 0,
      };
    });

    const configs: Record<number, AgentConfig> = {};
    for (const slotIndex of [1, 2, 3]) {
      configs[slotIndex] = rowToConfig(agentBySlot.get(slotIndex), businessName);
    }

    return ok({ slots, configs, businessName, maxSlots });
  },

  async saveSlotConfig(slotIndex: number, config: AgentConfigInput) {
    const parsed = agentConfigSchema.safeParse(config);
    if (!parsed.success) {
      return err(new ValidationError("Configuration agent invalide"));
    }

    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err(new AuthenticationError());

    if (slotIndex < 1 || slotIndex > 3) {
      return err(new ValidationError("Slot invalide"));
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_tier")
      .eq("id", user.id)
      .maybeSingle();

    if (slotIndex > getMaxWhatsAppSlots(planFromDb(profile?.plan_tier))) {
      return err(new ValidationError("Ce slot nécessite un plan supérieur."));
    }

    const row = configToRow(parsed.data);

    const { error: agentError } = await supabase.from("agent_slot_settings").upsert(
      { user_id: user.id, slot_index: slotIndex, ...row },
      { onConflict: "user_id,slot_index" },
    );

    if (agentError) {
      logger.error("[agents] saveSlotConfig", { message: agentError.message });
      return err(new InternalServerError());
    }

    const { data: waSlot } = await supabase
      .from("whatsapp_slots")
      .select("display_name, phone, connection_status")
      .eq("user_id", user.id)
      .eq("slot_index", slotIndex)
      .maybeSingle();

    if (waSlot) {
      await supabase.from("agent_settings").upsert(
        {
          user_id: user.id,
          slot_name: waSlot.display_name,
          agent_name: row.agent_name,
          phone: waSlot.phone,
          status: waSlot.connection_status === "connected" ? "connected" : "inactive",
          system_prompt: row.system_prompt,
          updated_at: row.updated_at,
        },
        { onConflict: "user_id" },
      );
    }

    return ok(undefined);
  },

  async resetSlotConfig(slotIndex: number) {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err(new AuthenticationError());

    const { data: business } = await supabase
      .from("businesses")
      .select("legal_name")
      .eq("user_id", user.id)
      .maybeSingle();

    const businessName = business?.legal_name?.trim() || "votre entreprise";
    const defaults = createDefaultAgentConfig(businessName);

    const { error } = await supabase.from("agent_slot_settings").upsert(
      {
        user_id: user.id,
        slot_index: slotIndex,
        ...configToRow(defaults),
      },
      { onConflict: "user_id,slot_index" },
    );

    if (error) {
      logger.error("[agents] resetSlotConfig", { message: error.message });
      return err(new InternalServerError());
    }

    return ok(defaults);
  },

  async listAgentsForProducts() {
    const page = await this.loadPageData();
    if (!page.success) return page;

    const agents: AgentIA[] = page.data.slots.map((slot) => ({
      id: `slot-${slot.slotIndex}`,
      slotName: slot.displayName,
      agentName: page.data.configs[slot.slotIndex]?.agentName ?? "",
      phone: slot.phone ?? "",
      status: slot.status === "connected" ? "connected" : "inactive",
    }));

    return ok(agents);
  },
};

export const agentsConfigService = pickServiceImplementation(
  agentsConfigServiceSupabase,
  agentsConfigServiceMock,
);

/** Liste agents pour la page Produits (compatibilité). */
export const agentsService = {
  list: () => agentsConfigService.listAgentsForProducts(),
};
