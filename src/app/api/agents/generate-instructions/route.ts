import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJsonBody } from "@shared/http/parseJsonBody";
import { withRouteHandler } from "@shared/http/routeErrors";
import { resolveGeminiModel } from "@shared/services/gemini/config";
import { toGeminiClientError } from "@shared/services/gemini/errors";
import { logger } from "@shared/utils/logger";

const BodySchema = z.object({
  activityDescription: z.string().min(10).max(8_000),
  businessName: z.string().max(200).optional(),
});

const PROMPT_SYSTEM = `Tu rédiges des instructions système pour un agent commercial IA sur WhatsApp (boutiques au Sénégal / Afrique de l'Ouest).
Réponds UNIQUEMENT avec le texte des instructions, en français, structuré en paragraphes courts.
Inclus : rôle, ton, ce que l'agent doit faire (accueil, produits, commandes, livraison), et limites (pas d'invention de prix si inconnu).`;

type GeminiPart = { text?: string };
type GeminiResponse = {
  candidates?: { content?: { parts?: GeminiPart[] } }[];
  error?: { message?: string };
};

function extractText(data: GeminiResponse): string | null {
  const parts = data.candidates?.[0]?.content?.parts;
  if (!parts?.length) return null;
  const text = parts.map((p) => p.text ?? "").join("").trim();
  return text || null;
}

export async function POST(request: Request): Promise<NextResponse> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error: {
          code: "GEMINI_NOT_CONFIGURED",
          message:
            "Ajoutez GEMINI_API_KEY dans .env.local pour générer les instructions avec l'IA.",
        },
      },
      { status: 503 },
    );
  }

  return withRouteHandler(
    async () => {
      const body = await parseJsonBody(request, BodySchema);
      const shop = body.businessName?.trim() || "la boutique";
      const model = resolveGeminiModel();
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const userText = `Boutique : ${shop}\n\nDescription de l'activité :\n${body.activityDescription.trim()}\n\nRédige les instructions système pour l'agent WhatsApp.`;

      const upstream = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: PROMPT_SYSTEM }] },
          contents: [{ role: "user", parts: [{ text: userText }] }],
          generationConfig: { temperature: 0.6, maxOutputTokens: 2048 },
        }),
      });

      const raw: unknown = await upstream.json().catch(() => ({}));
      const data = raw as GeminiResponse;

      if (!upstream.ok) {
        throw toGeminiClientError(
          upstream.status,
          data.error?.message || `Gemini HTTP ${upstream.status}`,
        );
      }

      const text = extractText(data);
      if (!text) {
        logger.warn("[agents/generate-instructions] réponse vide");
        throw new Error("Réponse IA vide");
      }

      return { text };
    },
    (data) => NextResponse.json(data),
  );
}
