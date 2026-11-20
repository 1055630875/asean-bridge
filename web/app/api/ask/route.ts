import type { NextRequest } from "next/server";
import { askHandler } from "@/lib/ask-core";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const result = await askHandler({ httpMethod: "POST", body });

  return new Response(result.body ?? "", {
    status: result.statusCode ?? 200,
    headers: result.headers as HeadersInit,
  });
}
