import { NextResponse } from "next/server";
import {
  listTestableSlots,
  loadAgentTestContext,
} from "@features/agents/server/testContext";
import { withRouteHandler } from "@shared/http/routeErrors";

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const slotParam = searchParams.get("slot");
  const slotIndex = slotParam ? Number.parseInt(slotParam, 10) : 1;

  return withRouteHandler(async () => {
    const slots = await listTestableSlots();
    const active =
      slots.find((s) => s.slotIndex === slotIndex && s.status !== "locked") ??
      slots.find((s) => s.status === "connected") ??
      slots.find((s) => s.status !== "locked");

    const index = active?.slotIndex ?? 1;
    const ctx = await loadAgentTestContext(index);

    return { slots, context: ctx };
  }, (data) => NextResponse.json(data));
}
