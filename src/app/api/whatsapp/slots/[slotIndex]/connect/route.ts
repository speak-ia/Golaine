import { NextResponse } from "next/server";
import { z } from "zod";
import { startWhatsAppConnect } from "@features/whatsapp/server/slotService";
import { parseJsonBody } from "@shared/http/parseJsonBody";
import { withRouteHandler } from "@shared/http/routeErrors";

const ConnectBodySchema = z.object({
  displayName: z.string().min(1).max(120),
  phone: z.string().min(8).max(32),
});

function parseSlotIndex(raw: string): number {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1 || n > 3) {
    throw new Error("INVALID_SLOT");
  }
  return n;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slotIndex: string }> },
) {
  const { slotIndex: slotIndexRaw } = await context.params;

  return withRouteHandler(async () => {
    const slotIndex = parseSlotIndex(slotIndexRaw);
    const body = await parseJsonBody(request, ConnectBodySchema);

    return startWhatsAppConnect(slotIndex, body.displayName, body.phone);
  }, (data) => NextResponse.json(data));
}
