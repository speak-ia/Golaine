import { NextResponse } from "next/server";
import { pollWhatsAppSlotStatus } from "@features/whatsapp/server/slotService";
import { withRouteHandler } from "@shared/http/routeErrors";

function parseSlotIndex(raw: string): number {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1 || n > 3) {
    throw new Error("INVALID_SLOT");
  }
  return n;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slotIndex: string }> },
) {
  const { slotIndex: slotIndexRaw } = await context.params;

  return withRouteHandler(
    () => pollWhatsAppSlotStatus(parseSlotIndex(slotIndexRaw)),
    (data) => NextResponse.json(data),
  );
}
