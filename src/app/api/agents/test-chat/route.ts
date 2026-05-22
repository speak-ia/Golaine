import { NextResponse } from "next/server";
import { z } from "zod";
import { loadAgentTestContext } from "@features/agents/server/testContext";
import { parseJsonBody } from "@shared/http/parseJsonBody";
import { withRouteHandler } from "@shared/http/routeErrors";
import { generateGeminiReply } from "@shared/services/gemini/generateContent";

const BodySchema = z.object({
  slotIndex: z.number().int().min(1).max(3),
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

export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.GEMINI_API_KEY?.trim()) {
    return NextResponse.json(
      {
        error: {
          code: "GEMINI_NOT_CONFIGURED",
          message:
            "Ajoutez GEMINI_API_KEY dans .env.local pour tester l'agent avec Gemini.",
        },
      },
      { status: 503 },
    );
  }

  return withRouteHandler(
    async () => {
      const body = await parseJsonBody(request, BodySchema);
      const ctx = await loadAgentTestContext(body.slotIndex);
      const text = await generateGeminiReply(ctx.systemPrompt, body.messages);
      return { text, agentName: ctx.agentName };
    },
    (data) => NextResponse.json(data),
  );
}
