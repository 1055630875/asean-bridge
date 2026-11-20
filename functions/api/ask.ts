import { askHandler } from "../../web/lib/ask-core";

/**
 * Cloudflare Pages Function for /api/ask.
 * Static pages live in web/out; this adapter only translates the Web request
 * into the shared ask core and back into a Web Response.
 */
export const onRequestPost = async (context: any) => {
  const body = await context.request.text();
  const result = await askHandler(
    { httpMethod: "POST", body },
    context.env ?? {},
  );

  return new Response(result.body ?? "", {
    status: result.statusCode ?? 200,
    headers: result.headers as HeadersInit,
  });
};
