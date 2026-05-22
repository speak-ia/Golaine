import type { SupabaseClient } from "@supabase/supabase-js";
import {
  AuthenticationError,
  InternalServerError,
  NotFoundError,
  ServiceUnavailableError,
  ValidationError,
} from "@shared/errors/AppError";
import type { PlanTier } from "@shared/types/domainTypes";
import {
  ensureEvolutionInstance,
  fetchEvolutionConnectionState,
  fetchEvolutionQr,
  isWhatsAppGatewayConfigured,
  logoutEvolutionInstance,
} from "@shared/services/whatsapp/evolutionApi";
import { getWhatsAppWebhookUrl } from "@shared/services/whatsapp/appUrl";
import {
  buildWhatsAppInstanceName,
  maskPhone,
  normalizePhoneDigits,
} from "@shared/services/whatsapp/instanceName";
import { getMaxWhatsAppSlots } from "@shared/services/whatsapp/planLimits";
import { createServerSupabaseClient } from "@shared/services/supabase/server";
import { logger } from "@shared/utils/logger";
import type { WhatsAppSlotDto, WhatsAppSlotsResponse } from "../types";

const PLAN_VALUES: PlanTier[] = ["Starter", "Pro", "Business"];

function planFromDb(raw: string | null | undefined): PlanTier {
  if (raw && PLAN_VALUES.includes(raw as PlanTier)) return raw as PlanTier;
  return "Starter";
}

type SlotRow = {
  slot_index: number;
  display_name: string;
  phone: string;
  instance_name: string | null;
  connection_status: string;
};

async function requireUser(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AuthenticationError();
  return user;
}

async function fetchPlanTier(
  supabase: SupabaseClient,
  userId: string,
): Promise<PlanTier> {
  const { data, error } = await supabase
    .from("profiles")
    .select("plan_tier")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    logger.error("[whatsapp] fetchPlanTier", { message: error.message });
    throw new InternalServerError();
  }
  return planFromDb(data?.plan_tier);
}

export async function ensureWhatsAppSlots(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const defaults = [
    { slot_index: 1, display_name: "Numéro 1" },
    { slot_index: 2, display_name: "Numéro 2" },
    { slot_index: 3, display_name: "Numéro 3" },
  ];

  const { data: business } = await supabase
    .from("businesses")
    .select("legal_name")
    .eq("user_id", userId)
    .maybeSingle();

  const slot1Name =
    business?.legal_name?.trim() || defaults[0].display_name;

  for (const slot of defaults) {
    const display_name = slot.slot_index === 1 ? slot1Name : slot.display_name;
    const { error } = await supabase.from("whatsapp_slots").upsert(
      {
        user_id: userId,
        slot_index: slot.slot_index,
        display_name,
      },
      { onConflict: "user_id,slot_index", ignoreDuplicates: true },
    );
    if (error) {
      logger.error("[whatsapp] ensureSlots", { message: error.message });
      throw new InternalServerError();
    }
  }
}

function mapSlotDto(
  row: SlotRow,
  slotIndex: number,
  maxSlots: number,
): WhatsAppSlotDto {
  const locked = slotIndex > maxSlots;
  let status: WhatsAppSlotDto["status"] = "empty";
  if (locked) {
    status = "locked";
  } else if (row.connection_status === "connected") {
    status = "connected";
  } else if (row.connection_status === "pending") {
    status = "pending";
  }

  return {
    slotIndex,
    displayName: row.display_name || `Numéro ${slotIndex}`,
    phone: row.phone?.trim() || null,
    status,
    phoneMasked: row.phone ? maskPhone(row.phone) : null,
  };
}

export async function listWhatsAppSlots(): Promise<WhatsAppSlotsResponse> {
  const supabase = await createServerSupabaseClient();
  const user = await requireUser(supabase);
  await ensureWhatsAppSlots(supabase, user.id);

  const planTier = await fetchPlanTier(supabase, user.id);
  const maxSlots = getMaxWhatsAppSlots(planTier);

  const { data, error } = await supabase
    .from("whatsapp_slots")
    .select("slot_index, display_name, phone, instance_name, connection_status")
    .eq("user_id", user.id)
    .order("slot_index", { ascending: true });

  if (error) {
    logger.error("[whatsapp] listSlots", { message: error.message });
    throw new InternalServerError();
  }

  const rows = (data ?? []) as SlotRow[];
  const slots: WhatsAppSlotDto[] = [1, 2, 3].map((idx) => {
    const row = rows.find((r) => r.slot_index === idx);
    return mapSlotDto(
      row ?? {
        slot_index: idx,
        display_name: `Numéro ${idx}`,
        phone: "",
        instance_name: null,
        connection_status: "empty",
      },
      idx,
      maxSlots,
    );
  });

  const connectedCount = slots.filter((s) => s.status === "connected").length;

  return {
    planTier,
    maxSlots,
    connectedCount,
    gatewayConfigured: isWhatsAppGatewayConfigured(),
    slots,
  };
}

async function getSlotRow(
  supabase: SupabaseClient,
  userId: string,
  slotIndex: number,
): Promise<SlotRow> {
  const { data, error } = await supabase
    .from("whatsapp_slots")
    .select("slot_index, display_name, phone, instance_name, connection_status")
    .eq("user_id", userId)
    .eq("slot_index", slotIndex)
    .maybeSingle();

  if (error) {
    logger.error("[whatsapp] getSlotRow", { message: error.message });
    throw new InternalServerError();
  }
  if (!data) throw new NotFoundError("Slot WhatsApp");
  return data as SlotRow;
}

async function assertSlotAllowed(
  supabase: SupabaseClient,
  userId: string,
  slotIndex: number,
): Promise<PlanTier> {
  if (slotIndex < 1 || slotIndex > 3) {
    throw new ValidationError("Index de slot invalide (1 à 3)");
  }
  const planTier = await fetchPlanTier(supabase, userId);
  if (slotIndex > getMaxWhatsAppSlots(planTier)) {
    throw new ValidationError(
      "Ce slot nécessite un plan supérieur. Passez au plan Pro ou Business.",
    );
  }
  return planTier;
}

async function syncLegacyConnection(
  supabase: SupabaseClient,
  userId: string,
  connected: boolean,
  phone: string,
  displayName: string,
): Promise<void> {
  const phoneMasked = phone ? maskPhone(phone) : null;

  await supabase.from("whatsapp_connections").upsert(
    {
      user_id: userId,
      connected,
      phone_masked: phoneMasked,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  await supabase.from("agent_settings").upsert(
    {
      user_id: userId,
      slot_name: displayName,
      phone,
      status: connected ? "connected" : "inactive",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
}

export async function startWhatsAppConnect(
  slotIndex: number,
  displayName: string,
  phone: string,
): Promise<{ qrBase64: string; expiresInSeconds: number }> {
  if (!isWhatsAppGatewayConfigured()) {
    throw new ServiceUnavailableError(
      "La passerelle WhatsApp n'est pas configurée. Ajoutez WHATSAPP_API_URL et WHATSAPP_API_KEY sur le serveur (Evolution API).",
    );
  }

  const digits = normalizePhoneDigits(phone);
  if (digits.length < 8) {
    throw new ValidationError("Numéro de téléphone invalide");
  }
  if (!displayName.trim()) {
    throw new ValidationError("Le nom du numéro est requis");
  }

  const supabase = await createServerSupabaseClient();
  const user = await requireUser(supabase);
  await ensureWhatsAppSlots(supabase, user.id);
  await assertSlotAllowed(supabase, user.id, slotIndex);

  const instanceName = buildWhatsAppInstanceName(user.id, slotIndex);
  const formattedPhone = phone.trim().startsWith("+")
    ? phone.trim()
    : `+${digits}`;

  const { error: upsertError } = await supabase.from("whatsapp_slots").upsert(
    {
      user_id: user.id,
      slot_index: slotIndex,
      display_name: displayName.trim(),
      phone: formattedPhone,
      instance_name: instanceName,
      connection_status: "pending",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,slot_index" },
  );

  if (upsertError) {
    logger.error("[whatsapp] startConnect upsert", {
      message: upsertError.message,
    });
    throw new InternalServerError();
  }

  const webhookUrl = getWhatsAppWebhookUrl();
  const createResponse = await ensureEvolutionInstance(
    instanceName,
    webhookUrl,
  );
  const { qrBase64 } = await fetchEvolutionQr(instanceName, createResponse);

  return { qrBase64, expiresInSeconds: 900 };
}

export async function refreshWhatsAppQr(
  slotIndex: number,
): Promise<{ qrBase64: string; expiresInSeconds: number }> {
  if (!isWhatsAppGatewayConfigured()) {
    throw new ServiceUnavailableError(
      "La passerelle WhatsApp n'est pas configurée.",
    );
  }

  const supabase = await createServerSupabaseClient();
  const user = await requireUser(supabase);
  await assertSlotAllowed(supabase, user.id, slotIndex);

  const row = await getSlotRow(supabase, user.id, slotIndex);
  const instanceName =
    row.instance_name ?? buildWhatsAppInstanceName(user.id, slotIndex);
  const digits = normalizePhoneDigits(row.phone);

  const webhookUrl = getWhatsAppWebhookUrl();
  const createResponse = await ensureEvolutionInstance(
    instanceName,
    webhookUrl,
  );
  const { qrBase64 } = await fetchEvolutionQr(instanceName, createResponse);

  await supabase
    .from("whatsapp_slots")
    .update({
      connection_status: "pending",
      instance_name: instanceName,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("slot_index", slotIndex);

  return { qrBase64, expiresInSeconds: 900 };
}

export async function pollWhatsAppSlotStatus(
  slotIndex: number,
): Promise<{
  status: "empty" | "pending" | "connected";
  displayName: string;
  phone: string | null;
}> {
  const supabase = await createServerSupabaseClient();
  const user = await requireUser(supabase);
  const row = await getSlotRow(supabase, user.id, slotIndex);

  if (row.connection_status === "connected") {
    return {
      status: "connected",
      displayName: row.display_name,
      phone: row.phone || null,
    };
  }

  const instanceName =
    row.instance_name ?? buildWhatsAppInstanceName(user.id, slotIndex);

  if (!isWhatsAppGatewayConfigured()) {
    return {
      status: row.connection_status === "pending" ? "pending" : "empty",
      displayName: row.display_name,
      phone: row.phone || null,
    };
  }

  const evolutionState = await fetchEvolutionConnectionState(instanceName);

  if (evolutionState === "open") {
    const now = new Date().toISOString();
    await supabase
      .from("whatsapp_slots")
      .update({
        connection_status: "connected",
        connected_at: now,
        updated_at: now,
      })
      .eq("user_id", user.id)
      .eq("slot_index", slotIndex);

    await syncLegacyConnection(
      supabase,
      user.id,
      true,
      row.phone,
      row.display_name,
    );

    return {
      status: "connected",
      displayName: row.display_name,
      phone: row.phone || null,
    };
  }

  return {
    status: row.connection_status === "pending" ? "pending" : "empty",
    displayName: row.display_name,
    phone: row.phone || null,
  };
}

export async function disconnectWhatsAppSlot(
  slotIndex: number,
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const user = await requireUser(supabase);
  const row = await getSlotRow(supabase, user.id, slotIndex);

  const instanceName =
    row.instance_name ?? buildWhatsAppInstanceName(user.id, slotIndex);

  if (isWhatsAppGatewayConfigured() && row.instance_name) {
    await logoutEvolutionInstance(instanceName);
  }

  await supabase
    .from("whatsapp_slots")
    .update({
      connection_status: "empty",
      connected_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("slot_index", slotIndex);

  const { data: anyConnected } = await supabase
    .from("whatsapp_slots")
    .select("slot_index")
    .eq("user_id", user.id)
    .eq("connection_status", "connected")
    .limit(1);

  const stillConnected = (anyConnected?.length ?? 0) > 0;

  if (!stillConnected) {
    await syncLegacyConnection(supabase, user.id, false, "", row.display_name);
  }
}
