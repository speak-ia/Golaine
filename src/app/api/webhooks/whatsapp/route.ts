import { NextResponse } from "next/server";
import { handleWhatsAppWebhook } from "@features/whatsapp/server/webhookHandler";
import { logger } from "@shared/utils/logger";

function webhookAuthorized(request: Request): boolean {
  const secret = process.env.WHATSAPP_WEBHOOK_SECRET?.trim();
  if (!secret) return true;
  const header =
    request.headers.get("x-webhook-secret") ??
    request.headers.get("apikey") ??
    "";
  return header === secret;
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!webhookAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    const result = await handleWhatsAppWebhook(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    logger.error("[whatsapp/webhook] handler", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: "whatsapp_webhook_ready" });
}
