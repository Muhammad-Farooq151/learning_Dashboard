import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Same-origin HLS proxy: browser → localhost:3000/api/hls-proxy → GCS.
 * Avoids GCS bucket CORS for .m3u8 / .ts (hls.js XHR is same-origin).
 *
 * Security: only URLs matching allowed prefix(es) — set HLS_PROXY_ALLOW_PREFIXES
 * (comma-separated) or default processed-videos bucket.
 */
function allowedPrefixes() {
  const raw = process.env.HLS_PROXY_ALLOW_PREFIXES;
  if (raw && raw.trim()) {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return ["https://storage.googleapis.com/vixhunter-processed-videos/"];
}

function isAllowedUrl(url) {
  return allowedPrefixes().some((p) => url.startsWith(p));
}

function getRequestOrigin(request) {
  const proto = request.headers.get("x-forwarded-proto") || "http";
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!host) return "http://localhost:3000";
  return `${proto}://${host}`;
}

function toProxyPath(origin, absoluteUrl) {
  return `${origin}/api/hls-proxy?u=${encodeURIComponent(absoluteUrl)}`;
}

/** Rewrite playlist lines so relative segment / variant URLs go through this proxy */
function rewritePlaylistBody(text, playlistUrlString, origin) {
  let playlistUrl;
  try {
    playlistUrl = new URL(playlistUrlString);
  } catch {
    return text;
  }
  const baseDir = playlistUrl.href.slice(0, playlistUrl.href.lastIndexOf("/") + 1);

  return text.split(/\r?\n/).map((line) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("#")) {
      const uriMatch = trimmed.match(/URI="([^"]+)"/);
      if (uriMatch) {
        const inner = uriMatch[1];
        const abs = inner.startsWith("http://") || inner.startsWith("https://")
          ? inner
          : new URL(inner, baseDir).href;
        if (isAllowedUrl(abs)) {
          return line.replace(uriMatch[0], `URI="${toProxyPath(origin, abs)}"`);
        }
      }
      return line;
    }

    if (!trimmed) return line;

    const abs =
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : new URL(trimmed, baseDir).href;

    if (isAllowedUrl(abs)) {
      return toProxyPath(origin, abs);
    }
    return line;
  }).join("\n");
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const u = searchParams.get("u");
  if (!u) {
    return NextResponse.json({ error: "missing u" }, { status: 400 });
  }

  let target;
  try {
    target = decodeURIComponent(u);
  } catch {
    return NextResponse.json({ error: "bad url" }, { status: 400 });
  }

  if (!target.startsWith("http://") && !target.startsWith("https://")) {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  if (!isAllowedUrl(target)) {
    return NextResponse.json({ error: "forbidden url" }, { status: 403 });
  }

  const range = request.headers.get("Range");
  const upstreamHeaders = {};
  if (range) upstreamHeaders.Range = range;

  let res;
  try {
    res = await fetch(target, { headers: upstreamHeaders, cache: "no-store" });
  } catch {
    return NextResponse.json({ error: "upstream fetch failed" }, { status: 502 });
  }

  const ct = res.headers.get("content-type") || "";
  const looksLikePlaylist =
    target.includes(".m3u8") ||
    ct.includes("application/vnd.apple.mpegurl") ||
    ct.includes("application/x-mpegURL");

  const origin = getRequestOrigin(request);

  if (looksLikePlaylist && res.ok) {
    const text = await res.text();
    const rewritten = rewritePlaylistBody(text, target, origin);
    return new NextResponse(rewritten, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const out = new Headers();
  for (const h of ["content-type", "content-length", "content-range", "accept-ranges", "last-modified", "etag"]) {
    const v = res.headers.get(h);
    if (v) out.set(h, v);
  }

  return new NextResponse(res.body, {
    status: res.status,
    headers: out,
  });
}
