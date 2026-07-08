import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJsonBody } from "@shared/http/parseJsonBody";
import { withRouteHandler } from "@shared/http/routeErrors";
import { generateGeminiReply } from "@shared/services/gemini/generateContent";

const ChatPostSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        text: z.string().min(1).max(48_000),
      }),
    )
    .min(1)
    .max(64),
});

const LUUMO_SYSTEM = `Tu es Sophia, assistante virtuelle de Luumo Boutique (mode, textiles, Sénégal).
Réponds en français, ton chaleureux et professionnel, messages concis adaptés au chat WhatsApp.
Si une info manque (stock, prix exact), dis-le honnêtement et propose de mettre le client en relation avec la boutique.`;

export async function POST(request: Request): Promise<NextResponse> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error: {
          code: "GEMINI_NOT_CONFIGURED",
          message:
            "Variable GEMINI_API_KEY manquante. Ajoute-la dans .env.local pour activer le chat IA.",
        },
      },
      { status: 503 },
    );
  }

  return withRouteHandler(
    async () => {
      const body = await parseJsonBody(request, ChatPostSchema);
      const text = await generateGeminiReply(LUUMO_SYSTEM, body.messages);
      return { text };
    },
    (data) => NextResponse.json(data),
  );
}
