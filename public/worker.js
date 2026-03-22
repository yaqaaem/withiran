function corsHeaders(extra = {}) {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "Content-Type, Authorization",
    ...extra,
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      ...corsHeaders(),
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function normalizeString(value, max = 500) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function badRequest(message, status = 400) {
  return json({ ok: false, error: message }, status);
}

function getClientIp(request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for") ||
    "unknown"
  );
}

async function sha256Hex(input) {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function handleCreateSignature(request, env) {
  if (!env.DB) {
    return badRequest("D1 database binding (DB) is missing.", 500);
  }

  const body = await readJson(request);
  if (!body) {
    return badRequest("JSON ارسالی نامعتبر است.");
  }

  if (normalizeString(body.website, 200)) {
    return badRequest("Spam detected.", 400);
  }

  const now = Date.now();
  const pageLoadedAt = Number(body.page_loaded_at || 0);
  if (!Number.isFinite(pageLoadedAt) || now - pageLoadedAt < 2500) {
    return badRequest("ارسال فرم بیش از حد سریع بود.", 400);
  }

  const displayName = normalizeString(body.display_name, 80);
  const country = normalizeString(body.country, 80);
  const message = normalizeString(body.message, 280);
  const buildVersion = normalizeString(body.build_version, 50);

  if (!displayName || !country) {
    return badRequest("نام و کشور الزامی هستند.");
  }

  const ipHash = await sha256Hex(getClientIp(request));

  const duplicate = await env.DB.prepare(`
    SELECT id
    FROM signatures
    WHERE ip_hash = ?
      AND created_at >= datetime('now', '-30 seconds')
    ORDER BY id DESC
    LIMIT 1
  `).bind(ipHash).first();

  if (duplicate) {
    return badRequest("ثبت تکراری بسیار سریع مجاز نیست.", 429);
  }

  await env.DB.prepare(`
    INSERT INTO signatures (
      display_name,
      country,
      message,
      ip_hash,
      build_version,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `).bind(
    displayName,
    country,
    message,
    ipHash,
    buildVersion
  ).run();

  return json({
    ok: true,
    message: "امضا با موفقیت ثبت شد."
  });
}

async function handleGetSignatures(request, env) {
  if (!env.DB) {
    return badRequest("D1 database binding (DB) is missing.", 500);
  }

  const url = new URL(request.url);
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") || 20)));

  const result = await env.DB.prepare(`
    SELECT id, display_name, country, message, created_at
    FROM signatures
    ORDER BY datetime(created_at) DESC, id DESC
    LIMIT ?
  `).bind(limit).all();

  return json(result.results || []);
}

async function handleGetCountries(env) {
  if (!env.DB) {
    return badRequest("D1 database binding (DB) is missing.", 500);
  }

  const result = await env.DB.prepare(`
    SELECT country, COUNT(*) as count
    FROM signatures
    GROUP BY country
    ORDER BY count DESC, country ASC
  `).all();

  return json(result.results || []);
}

async function handleGetStats(env) {
  if (!env.DB) {
    return badRequest("D1 database binding (DB) is missing.", 500);
  }

  const result = await env.DB.prepare(`
    SELECT
      COUNT(*) as total_signatures,
      COUNT(DISTINCT country) as countries_count
    FROM signatures
  `).first();

  return json({
    ...(result || { total_signatures: 0, countries_count: 0 }),
    generated_at: new Date().toISOString(),
  });
}

async function serveAsset(request, env) {
  if (!env.ASSETS || typeof env.ASSETS.fetch !== "function") {
    return json({ ok: false, error: "Asset binding missing." }, 500);
  }
  return env.ASSETS.fetch(request);
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      if (request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders() });
      }

      if (pathname === "/health" && request.method === "GET") {
        return json({
          ok: true,
          status: "healthy",
          time: new Date().toISOString(),
        });
      }

      if (pathname === "/api/sign" && request.method === "POST") {
        return handleCreateSignature(request, env);
      }

      if (pathname === "/api/signatures" && request.method === "GET") {
        return handleGetSignatures(request, env);
      }

      if (pathname === "/api/countries" && request.method === "GET") {
        return handleGetCountries(env);
      }

      if (pathname === "/api/stats" && request.method === "GET") {
        return handleGetStats(env);
      }

      return serveAsset(request, env);
    } catch (error) {
      return json(
        {
          ok: false,
          error: "Internal Server Error",
          details: error instanceof Error ? error.message : String(error),
        },
        500
      );
    }
  },
};