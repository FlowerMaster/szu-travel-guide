const ACCESS_COOKIE = "__Host-szu_guide_access";
const UNLOCK_PATH = "/__access/unlock";
const SESSION_SECONDS = 60 * 60 * 24 * 30;
const encoder = new TextEncoder();

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (url.pathname === UNLOCK_PATH && request.method === "POST") {
    return handleUnlock(request, env, url);
  }

  if (await hasValidSession(request, env)) {
    const response = await context.next();
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "private, no-store");
    headers.set("X-Robots-Tag", "noindex, nofollow");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return gatePage("", safeNext(`${url.pathname}${url.search}`), 401);
}

async function handleUnlock(request, env, requestUrl) {
  if (request.headers.get("Origin") !== requestUrl.origin) {
    return gatePage("", "/", 403);
  }

  if (!env.ACCESS_CODE || !env.SESSION_SECRET) {
    return gatePage("unavailable", "/", 503);
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return gatePage("invalid", "/", 400);
  }

  const rawCode = form.get("access-code");
  const candidate = normalizeCode(typeof rawCode === "string" ? rawCode : "");
  const expected = normalizeCode(env.ACCESS_CODE);

  if (!candidate || candidate.length > 64 || !constantTimeEqual(candidate, expected)) {
    return gatePage("invalid", safeNext(form.get("next")), 401);
  }

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const signature = await sign(env.SESSION_SECRET, `szu-guide-session:${expiresAt}`);
  const cookieValue = `${expiresAt}.${signature}`;
  const headers = new Headers({
    Location: safeNext(form.get("next")),
    "Cache-Control": "no-store",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
  });
  headers.append(
    "Set-Cookie",
    `${ACCESS_COOKIE}=${cookieValue}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Lax`,
  );

  return new Response(null, { status: 303, headers });
}

async function hasValidSession(request, env) {
  if (!env.SESSION_SECRET) return false;

  const cookieHeader = request.headers.get("Cookie") || "";
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ACCESS_COOKIE}=`));
  if (!cookie) return false;

  const value = cookie.slice(ACCESS_COOKIE.length + 1);
  const separator = value.indexOf(".");
  if (separator < 1) return false;

  const expiresAt = Number(value.slice(0, separator));
  const signature = value.slice(separator + 1);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now || expiresAt > now + SESSION_SECONDS + 60) {
    return false;
  }

  const expected = await sign(env.SESSION_SECRET, `szu-guide-session:${expiresAt}`);
  return constantTimeEqual(signature, expected);
}

async function sign(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

function normalizeCode(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/gu, "");
}

function constantTimeEqual(left, right) {
  const length = Math.max(left.length, right.length);
  let difference = left.length ^ right.length;
  for (let i = 0; i < length; i += 1) {
    difference |= (left.charCodeAt(i) || 0) ^ (right.charCodeAt(i) || 0);
  }
  return difference === 0;
}

function safeNext(value) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/";
  }
  if (/[\r\n\u0000-\u001f]/u.test(value)) return "/";
  return value.slice(0, 1500);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/gu, (character) => {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return entities[character];
  });
}

function gatePage(state, next, status) {
  const messages = {
    invalid: '<p id="error-message" class="message error" role="alert">访问码不正确，请检查后重试。</p>',
    unavailable: '<p id="service-message" class="message error" role="alert">访问码服务暂时不可用，请稍后再试。</p>',
  };
  const message = messages[state] || '<p class="message" id="hint">输入购买后获得的访问码即可继续。</p>';
  const describedBy = state === "invalid" ? "error-message" : state === "unavailable" ? "service-message" : "hint";
  const safeNextValue = escapeHtml(safeNext(next));
  const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <meta name="referrer" content="no-referrer">
    <meta name="robots" content="noindex,nofollow">
    <title>访问深大漫游指南</title>
    <style>
      :root { color-scheme: light dark; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif; background: #f7f4ef; color: #211c24; --bg: #f7f4ef; --surface: #fff; --text: #211c24; --muted: #746b76; --line: #ded8e0; --accent: #4a275a; --error: #9e3535; }
      * { box-sizing: border-box; }
      body { min-width: 320px; min-height: 100dvh; margin: 0; display: grid; place-items: center; padding: 24px; background: var(--bg); color: var(--text); }
      main { width: min(100%, 460px); padding: clamp(28px, 6vw, 52px); border: 1px solid var(--line); border-radius: 20px; background: var(--surface); box-shadow: 0 20px 55px rgba(54, 33, 60, .1); }
      .brand { margin: 0 0 42px; color: var(--accent); font-size: 13px; font-weight: 800; letter-spacing: .04em; }
      h1 { margin: 0; font-size: clamp(27px, 7vw, 36px); line-height: 1.2; letter-spacing: -.035em; }
      .intro { margin: 14px 0 30px; color: var(--muted); font-size: 15px; line-height: 1.7; }
      label { display: block; margin: 0 0 9px; font-size: 14px; font-weight: 700; }
      input { width: 100%; min-height: 52px; padding: 12px 15px; border: 1px solid var(--line); border-radius: 10px; background: var(--bg); color: var(--text); font: inherit; font-size: 16px; letter-spacing: .04em; }
      input:focus-visible, button:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }
      button { width: 100%; min-height: 52px; margin-top: 16px; border: 1px solid var(--accent); border-radius: 10px; background: var(--accent); color: #fff; font: inherit; font-weight: 750; transition: transform .16s ease, background .16s ease; }
      button:hover { background: #32183e; }
      button:active { transform: translateY(1px); }
      .message { min-height: 24px; margin: -17px 0 20px; color: var(--muted); font-size: 13px; line-height: 1.6; }
      .message.error { color: var(--error); }
      @media (prefers-color-scheme: dark) {
        :root { background: #211c24; color: #f6f1f7; --bg: #211c24; --surface: #2b2530; --text: #f6f1f7; --muted: #c0b6c4; --line: #4c4350; --accent: #b998c8; --error: #ff9b9b; }
        button { border-color: #4a275a; background: #4a275a; color: #fff; }
        button:hover { background: #32183e; }
      }
      @media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; } }
    </style>
  </head>
  <body>
    <main>
      <p class="brand">来深圳大学怎么玩</p>
      <h1>继续查看游玩攻略</h1>
      <p class="intro">请输入购买后收到的访问码，打开互动路线、校园地图和地点介绍。</p>
      ${message}
      <form action="${UNLOCK_PATH}" method="post">
        <input type="hidden" name="next" value="${safeNextValue}">
        <label for="access-code">访问码</label>
        <input id="access-code" name="access-code" type="password" autocomplete="current-password" autocapitalize="characters" spellcheck="false" maxlength="64" required aria-describedby="${describedBy}" autofocus>
        <button type="submit">进入攻略</button>
      </form>
    </main>
  </body>
</html>`;

  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
