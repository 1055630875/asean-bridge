import { askHandler } from "../lib/ask-core";

/**
 * Vercel Node function for /api/ask.
 * Reuses the same retrieval + citation verification core as the local and
 * edge adapters; only the request/response adapter is platform-specific.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }

  const body =
    typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});
  const result = await askHandler({ httpMethod: "POST", body });

  res.status(result.statusCode ?? 200);
  for (const [key, value] of Object.entries(result.headers ?? {})) {
    if (typeof value === "string") res.setHeader(key, value);
  }
  res.send(result.body ?? "");
}
