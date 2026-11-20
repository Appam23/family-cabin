import { defineMiddleware } from "astro:middleware";

const apiUrl =
  process.env.PUBLIC_API_URL ??
  import.meta.env.PUBLIC_API_URL ??
  "http://localhost:3000";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname, search } = context.url;

  if (!pathname.startsWith("/api/v1/")) {
    return next();
  }

  const request = new Request(`${apiUrl}${pathname}${search}`, {
    method: context.request.method,
    headers: context.request.headers,
    body:
      context.request.method === "GET" || context.request.method === "HEAD"
        ? undefined
        : await context.request.arrayBuffer()
  });

  const response = await fetch(request);
  const headers = new Headers(response.headers);

  if (
    typeof (headers as Headers & { getSetCookie?: () => string[] })
      .getSetCookie === "function"
  ) {
    headers.delete("set-cookie");
  }

  const setCookies = (
    headers as Headers & { getSetCookie?: () => string[] }
  ).getSetCookie?.();

  if (setCookies?.length) {
    headers.set("set-cookie", setCookies.join(", "));
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
});
