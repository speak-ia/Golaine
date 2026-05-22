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

function planFromDb(raw: string | null | undefined): PlanTier {
  if (raw && PLAN_VALUES.includes(raw as PlanTier)) return raw as PlanTier;
  return "Starter";
}

export interface SettingsProfile {
  name: string;
  email: string;
  planTier: PlanTier;
}

/** Profil onglet « Informations personnelles » (hors e-mail = auth.users). */
export interface ProfileDetails {
  displayName: string;
  email: string;
  planTier: PlanTier;
  phone: string;
  locale: string;
  timezone: string;
  avatarUrl: string | null;
}

export interface ProfileDetailsUpdate {
  displayName: string;
  phone: string;
  locale: string;
  timezone: string;
  avatarUrl: string | null;
}

export interface BusinessSettings {
  legalName: string;
  description: string;
  address: string;
  sector: string;
  website: string;
  logoUrl: string | null;
}

export interface SettingsService {
  getProfile(): Promise<Result<SettingsProfile>>;
  getProfileDetails(): Promise<Result<ProfileDetails>>;
  updateProfileDetails(data: ProfileDetailsUpdate): Promise<Result<void>>;
  getBusiness(): Promise<Result<BusinessSettings>>;
  saveBusiness(data: BusinessSettings): Promise<Result<void>>;
}

const settingsServiceMock: SettingsService = {
  async getProfile() {
    return ok({
      name: "Utilisateur",
      email: "user@example.com",
      planTier: "Pro",
    });
  },
  async getProfileDetails() {
    return ok({
      displayName: "Alassane Amadou Diallo",
      email: "alassane@golaine.sn",
      planTier: "Pro",
      phone: "+221 77 000 00 67",
      locale: "fr",
      timezone: "Africa/Dakar",
      avatarUrl: null,
    });
  },
  async updateProfileDetails() {
    return ok(undefined);
  },
  async getBusiness() {
    return ok({
      legalName: "Boutique Alassane Mode",
      description:
        "Boutique de mode africaine contemporaine, spécialisée dans les vêtements wax et les accessoires artisanaux.",
      address: "Plateau, Dakar, Sénégal",
      sector: "Mode",
      website: "www.alassanemode.sn",
      logoUrl: null,
    });
  },
  async saveBusiness() {
    return ok(undefined);
  },
};

const settingsServiceSupabase: SettingsService = {
  async getProfile() {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err(new AuthenticationError());

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("display_name, plan_tier")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      logger.error("[settings] getProfile", { message: error.message });
      return err(new InternalServerError());
    }

    return ok({
      name: profile?.display_name?.trim() || user.email?.split("@")[0] || "Utilisateur",
      email: user.email ?? "",
      planTier: planFromDb(profile?.plan_tier),
    });
  },

  async getProfileDetails() {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err(new AuthenticationError());

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("display_name, plan_tier, phone, locale, timezone, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      logger.error("[settings] getProfileDetails", { message: error.message });
      return err(new InternalServerError());
    }

    return ok({
      displayName:
        profile?.display_name?.trim() || user.email?.split("@")[0] || "Utilisateur",
      email: user.email ?? "",
      planTier: planFromDb(profile?.plan_tier),
      phone: profile?.phone?.trim() ?? "",
      locale: profile?.locale?.trim() || "fr",
      timezone: profile?.timezone?.trim() || "Africa/Dakar",
      avatarUrl: profile?.avatar_url?.trim() || null,
    });
  },

  async updateProfileDetails(data: ProfileDetailsUpdate) {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err(new AuthenticationError());

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: data.displayName.trim(),
        phone: data.phone.trim(),
        locale: data.locale,
        timezone: data.timezone,
        avatar_url: data.avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      logger.error("[settings] updateProfileDetails", { message: error.message });
      return err(new InternalServerError());
    }

    const { error: metaErr } = await supabase.auth.updateUser({
      data: { full_name: data.displayName.trim() },
    });
    if (metaErr) {
      logger.warn("[settings] updateUser metadata", { message: metaErr.message });
    }

    return ok(undefined);
  },

  async getBusiness() {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err(new AuthenticationError());

    const { data: row, error } = await supabase
      .from("businesses")
      .select("legal_name, description, address, sector, website, logo_url")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      logger.error("[settings] getBusiness", { message: error.message });
      return err(new InternalServerError());
    }

    if (!row) {
      return ok({
        legalName: "",
        description: "",
        address: "",
        sector: "",
        website: "",
        logoUrl: null,
      });
    }

    return ok({
      legalName: row.legal_name ?? "",
      description: row.description ?? "",
      address: row.address ?? "",
      sector: row.sector ?? "",
      website: row.website ?? "",
      logoUrl: row.logo_url?.trim() || null,
    });
  },

  async saveBusiness(data: BusinessSettings) {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err(new AuthenticationError());

    const { error } = await supabase.from("businesses").upsert(
      {
        user_id: user.id,
        legal_name: data.legalName.trim(),
        description: data.description.trim(),
        address: data.address.trim(),
        sector: data.sector.trim(),
        website: data.website.trim(),
        logo_url: data.logoUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (error) {
      logger.error("[settings] saveBusiness", { message: error.message });
      return err(new InternalServerError());
    }

    return ok(undefined);
  },
};

export const settingsService = pickServiceImplementation(
  settingsServiceSupabase,
  settingsServiceMock,
);
