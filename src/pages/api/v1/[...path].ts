import type { APIRoute } from "astro";

const apiUrl =
  process.env.PUBLIC_API_URL ??
  import.meta.env.PUBLIC_API_URL ??
  "https://family-cabin-api.onrender.com";

export const ALL: APIRoute = async ({ params, request, url }) => {
  const apiRequest = new Request(
    `${apiUrl}/api/v1/${params.path}${url.search}`,
    {
      method: request.method,
      headers: request.headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await request.arrayBuffer(),
      redirect: "manual"
    }
  );

  try {
    const apiResponse = await fetch(apiRequest);
    const headers = new Headers(apiResponse.headers);
    const setCookie = apiResponse.headers.get("set-cookie");

    if (setCookie) {
      const sameOriginCookie = setCookie
        .replace(/;\s*Domain=[^;]*/gi, "")
        .replace(/;\s*SameSite=(?:None|Strict)/gi, "; SameSite=Lax");
      headers.set("set-cookie", sameOriginCookie);
    }

    return new Response(apiResponse.body, {
      status: apiResponse.status,
      statusText: apiResponse.statusText,
      headers
    });
  } catch (error) {
    console.error("API route proxy failed", error);
    return new Response(
      JSON.stringify({ error: "Unable to reach the server" }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
