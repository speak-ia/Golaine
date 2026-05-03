import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJsonBody } from "@shared/http/parseJsonBody";
import {
  jsonFromUnknownError,
  withRouteHandler,
} from "@shared/http/routeErrors";

const HealthPostSchema = z.object({
  ping: z.literal("ok").optional(),
});

export function GET(): NextResponse {
  try {
    return NextResponse.json({ ok: true, ts: new Date().toISOString() });
  } catch (error: unknown) {
    return jsonFromUnknownError(error);
  }
}

/** Exemple POST avec corps validé par Zod (même pattern pour les futures routes). */
export async function POST(request: Request): Promise<NextResponse> {
  return withRouteHandler(
    async () => {
      const body = await parseJsonBody(request, HealthPostSchema);
      return { ok: true as const, received: body };
    },
    (data) => NextResponse.json(data),
  );
}
