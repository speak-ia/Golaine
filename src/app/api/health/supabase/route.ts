import { NextResponse } from "next/server";

/** Extrait le claim `ref` (identifiant projet) du JWT anon, sans valider la signature. */
function projectRefFromAnonJwt(jwt: string): string | null {
  const parts = jwt.split(".");
  if (parts.length < 2) return null;
  try {
    let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4;
    if (pad) b64 += "=".repeat(4 - pad);
    const json: unknown = JSON.parse(atob(b64));
    if (json && typeof json === "object" && "ref" in json) {
      const ref = (json as { ref?: unknown }).ref;
      return typeof ref === "string" ? ref : null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Vérifie que les variables Supabase sont présentes et que l’instance répond (Auth health).
 * Ne logue aucun secret ; `projectRef` permet de vérifier que la clé correspond au bon projet.
 */
export async function GET(): Promise<NextResponse> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!base || !anon) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        projectRef: null,
        supabaseHost: null,
        message:
          "Définir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY (voir .env.local), puis redémarrer `npm run dev`.",
      },
      { status: 200 },
    );
  }

  let supabaseHost: string | null = null;
  try {
    supabaseHost = new URL(base).hostname;
  } catch {
    supabaseHost = null;
  }

  const projectRef = projectRefFromAnonJwt(anon);

  try {
    const res = await fetch(`${base}/auth/v1/health`, {
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
      },
      cache: "no-store",
    });
    const data: unknown = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          configured: true,
          reachable: false,
          projectRef,
          supabaseHost,
          status: res.status,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      configured: true,
      reachable: true,
      projectRef,
      supabaseHost,
      auth: data,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        reachable: false,
        projectRef,
        supabaseHost,
        message: "Impossible de joindre l’URL Supabase (réseau ou URL incorrecte).",
      },
      { status: 503 },
    );
  }
}
