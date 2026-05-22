import { resolveGeminiModel } from "@shared/services/gemini/config";
import { toGeminiClientError } from "@shared/services/gemini/errors";
import { logger } from "@shared/utils/logger";

type ChatMessage = { role: "user" | "model"; text: string };

type GeminiPart = { text?: string };
type GeminiResponse = {
  candidates?: { content?: { parts?: GeminiPart[] }; finishReason?: string }[];
  error?: { message?: string };
};

function extractReplyText(data: GeminiResponse): string | null {
  const parts = data.candidates?.[0]?.content?.parts;
  if (!parts?.length) return null;
  const text = parts.map((p) => p.text ?? "").join("").trim();
  return text || null;
}

export function trimHistoryFromFirstUser(messages: ChatMessage[]): ChatMessage[] {
  const firstUser = messages.findIndex((m) => m.role === "user");
  if (firstUser <= 0) return messages;
  return messages.slice(firstUser);
}

export async function generateGeminiReply(
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_NOT_CONFIGURED");
  }

  const trimmed = trimHistoryFromFirstUser(messages);
  if (trimmed.length === 0) {
    throw new Error("Historique invalide");
  }

  const model = resolveGeminiModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const upstream = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: trimmed.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      })),
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    }),
  });

  const raw: unknown = await upstream.json().catch(() => ({}));
  const data = raw as GeminiResponse;

  if (!upstream.ok) {
    const msg = data.error?.message || `Gemini HTTP ${upstream.status}`;
    logger.warn("[gemini] generateContent refusé", {
      status: upstream.status,
      model,
      msg,
    });
    throw toGeminiClientError(upstream.status, msg);
  }

  const text = extractReplyText(data);
  if (!text) {
    throw new Error("Réponse modèle vide ou filtrée");
  }

  return text;
}
