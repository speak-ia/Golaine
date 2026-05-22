import { NextResponse } from "next/server";
import { listWhatsAppSlots } from "@features/whatsapp/server/slotService";
import { withRouteHandler } from "@shared/http/routeErrors";

export async function GET() {
  return withRouteHandler(
    () => listWhatsAppSlots(),
    (data) => NextResponse.json(data),
  );
}
