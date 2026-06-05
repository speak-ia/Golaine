import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@shared/services/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    try {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (err) {
      // Ignore or log error
    }
  }

  // En cas d'échec, redirige vers la page de connexion avec une erreur
  return NextResponse.redirect(`${origin}/login?error=auth-failed`);
}
