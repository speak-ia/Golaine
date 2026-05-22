import type { PlanTier } from "@shared/types/domainTypes";
import {
  AuthenticationError,
  InternalServerError,
} from "@shared/errors/AppError";
import { pickServiceImplementation } from "@shared/services/pickServiceImplementation";
import { createBrowserSupabaseClient } from "@shared/services/supabase/client";
import { err, ok, type Result } from "@shared/types/Result";
import { logger } from "@shared/utils/logger";

const PLAN_VALUES: PlanTier[] = ["Starter", "Pro", "Business"];

const PLAN_LIMITS: Record<PlanTier, { messages: number; images: number }> = {
  Starter: { messages: 1500, images: 25 },
  Pro: { messages: 5000, images: 50 },
  Business: { messages: 25000, images: 250 },
};

function planFromDb(raw: string | null | undefined): PlanTier {
  if (raw && PLAN_VALUES.includes(raw as PlanTier)) return raw as PlanTier;
  return "Starter";
}

export type PlanProfile = {
  tier: PlanTier;
  messagesUsed: number;
  messagesLimit: number;
  imageAnalysesUsed: number;
  imageAnalysesLimit: number;
};

export interface PlanService {
  getProfile(): Promise<Result<PlanProfile>>;
  updatePlanTier(_tier: PlanTier): Promise<Result<PlanProfile>>;
}

const planServiceMock: PlanService = {
  async getProfile() {
    return ok({
      tier: "Pro",
      messagesUsed: 420,
      messagesLimit: PLAN_LIMITS.Pro.messages,
      imageAnalysesUsed: 8,
      imageAnalysesLimit: PLAN_LIMITS.Pro.images,
    });
  },
  async updatePlanTier(tier) {
    return ok({
      tier,
      messagesUsed: 0,
      messagesLimit: PLAN_LIMITS[tier].messages,
      imageAnalysesUsed: 0,
      imageAnalysesLimit: PLAN_LIMITS[tier].images,
    });
  },
};

const planServiceSupabase: PlanService = {
  async getProfile() {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err(new AuthenticationError());

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "plan_tier, messages_used_month, messages_limit_month, image_analyses_used_month, image_analyses_limit_month",
      )
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      logger.error("[plan] getProfile", { message: error.message });
      return err(new InternalServerError());
    }

    const tier = planFromDb(data?.plan_tier);
    const limits = PLAN_LIMITS[tier];

    return ok({
      tier,
      messagesUsed: data?.messages_used_month ?? 0,
      messagesLimit: data?.messages_limit_month ?? limits.messages,
      imageAnalysesUsed: data?.image_analyses_used_month ?? 0,
      imageAnalysesLimit: data?.image_analyses_limit_month ?? limits.images,
    });
  },

  async updatePlanTier(tier) {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err(new AuthenticationError());

    const limits = PLAN_LIMITS[tier];

    const { data, error } = await supabase
      .from("profiles")
      .update({
        plan_tier: tier,
        messages_limit_month: limits.messages,
        image_analyses_limit_month: limits.images,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select(
        "plan_tier, messages_used_month, messages_limit_month, image_analyses_used_month, image_analyses_limit_month",
      )
      .maybeSingle();

    if (error || !data) {
      logger.error("[plan] updatePlanTier", { message: error?.message });
      return err(new InternalServerError());
    }

    return ok({
      tier: planFromDb(data.plan_tier),
      messagesUsed: data.messages_used_month,
      messagesLimit: data.messages_limit_month,
      imageAnalysesUsed: data.image_analyses_used_month,
      imageAnalysesLimit: data.image_analyses_limit_month,
    });
  },
};

export const planService = pickServiceImplementation(
  planServiceSupabase,
  planServiceMock,
);

export { PLAN_LIMITS };
