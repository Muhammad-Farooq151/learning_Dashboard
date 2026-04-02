"use client";

import { getStoredToken, hasSessionForMediaProxy } from "@/utils/authStorage";

/** Backend base (Express), e.g. http://localhost:5000 — from NEXT_PUBLIC_API_URL */
export function getBackendOrigin() {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  return raw.replace(/\/api\/?$/i, "").replace(/\/$/, "") || "http://localhost:5000";
}

const DEFAULT_HLS_PREFIXES = "https://storage.googleapis.com/vixhunter-processed-videos";
const DEFAULT_FILE_PREFIXES =
  "https://storage.googleapis.com/vixhunter-processed-videos,https://storage.googleapis.com/vixhunter-static-assets";

function parsePrefixes(envValue, fallback) {
  const raw = envValue || fallback;
  return String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function matchesPrefix(url, prefixes) {
  return prefixes.some((p) => url.startsWith(p));
}

/**
 * True if this HTTPS URL should go through the authenticated backend proxy (not direct GCS).
 */
export function gcsUrlShouldUseProxy(url, kind) {
  if (typeof window === "undefined" || !url || !url.startsWith("http")) return false;
  if (kind === "hls") {
    if (String(process.env.NEXT_PUBLIC_HLS_PROXY_DISABLED).toLowerCase() === "true") return false;
    const prefixes = parsePrefixes(
      process.env.NEXT_PUBLIC_HLS_PROXY_URL_PREFIXES,
      DEFAULT_HLS_PREFIXES
    );
    return matchesPrefix(url, prefixes);
  }
  if (kind === "file") {
    if (String(process.env.NEXT_PUBLIC_FILE_PROXY_DISABLED).toLowerCase() === "true") return false;
    const prefixes = parsePrefixes(
      process.env.NEXT_PUBLIC_FILE_PROXY_URL_PREFIXES,
      DEFAULT_FILE_PREFIXES
    );
    return matchesPrefix(url, prefixes);
  }
  return false;
}

/**
 * HLS master / segments — requires login + token on the proxy. No token → null (caller shows sign-in UI).
 */
export function proxiedGcsHlsUrl(originalUrl) {
  if (typeof window === "undefined" || !originalUrl) return originalUrl;
  if (String(process.env.NEXT_PUBLIC_HLS_PROXY_DISABLED).toLowerCase() === "true") {
    return originalUrl;
  }
  const prefixes = parsePrefixes(
    process.env.NEXT_PUBLIC_HLS_PROXY_URL_PREFIXES,
    DEFAULT_HLS_PREFIXES
  );
  if (!matchesPrefix(originalUrl, prefixes)) return originalUrl;

  const token = getStoredToken();
  if (!token) {
    return null;
  }

  let base = `${getBackendOrigin()}/api/hls-proxy?u=${encodeURIComponent(originalUrl)}`;
  base += `&token=${encodeURIComponent(token)}`;
  return base;
}

/**
 * Images / PDF / MP4 — requires JWT on the proxy. No token → fallback (never raw GCS for protected buckets).
 * @param {string} [fallback='/images/default-course.jpg'] — used when logged out or no token
 */
/**
 * Course card / detail image (API may omit raw GCS URLs; use thumbnailMediaPath + token).
 */
export function courseThumbnailSrc(course, fallback = "/images/default-course.jpg") {
  if (!course) return fallback;
  if (course.thumbnailMediaPath) {
    if (!hasSessionForMediaProxy()) return fallback;
    const token = getStoredToken();
    let url = `${getBackendOrigin()}${course.thumbnailMediaPath}`;
    if (token) url += `?token=${encodeURIComponent(token)}`;
    return url;
  }
  if (course.thumbnailUrl) {
    return proxiedGcsFileUrl(course.thumbnailUrl, fallback);
  }
  return fallback;
}

export function proxiedGcsFileUrl(originalUrl, fallback = "/images/default-course.jpg") {
  if (typeof window === "undefined" || !originalUrl) return originalUrl;
  if (!originalUrl.startsWith("http://") && !originalUrl.startsWith("https://")) {
    return originalUrl;
  }
  if (String(process.env.NEXT_PUBLIC_FILE_PROXY_DISABLED).toLowerCase() === "true") {
    return originalUrl;
  }
  const prefixes = parsePrefixes(
    process.env.NEXT_PUBLIC_FILE_PROXY_URL_PREFIXES,
    DEFAULT_FILE_PREFIXES
  );
  if (!matchesPrefix(originalUrl, prefixes)) return originalUrl;

  const token = getStoredToken();
  if (!token && !hasSessionForMediaProxy()) {
    return fallback;
  }

  let base = `${getBackendOrigin()}/api/file-proxy?u=${encodeURIComponent(originalUrl)}`;
  if (token) base += `&token=${encodeURIComponent(token)}`;
  return base;
}

/**
 * Admin "open in new tab" for lesson video — uses HLS vs file proxy with optional ?token=.
 * Returns null only when a proxied GCS URL is required but there is no session.
 */
export function adminLessonPreviewUrl(videoUrl, videoType) {
  if (!videoUrl || typeof videoUrl !== "string") return null;

  const isHls =
    videoType === "hls" || /\.m3u8(\?|$)/i.test(videoUrl);

  if (isHls) {
    if (String(process.env.NEXT_PUBLIC_HLS_PROXY_DISABLED).toLowerCase() === "true") {
      return videoUrl;
    }
    if (!gcsUrlShouldUseProxy(videoUrl, "hls")) return videoUrl;
    return proxiedGcsHlsUrl(videoUrl);
  }

  if (String(process.env.NEXT_PUBLIC_FILE_PROXY_DISABLED).toLowerCase() === "true") {
    return videoUrl;
  }
  if (!gcsUrlShouldUseProxy(videoUrl, "file")) return videoUrl;

  const token = getStoredToken();
  if (!token && !hasSessionForMediaProxy()) return null;

  let base = `${getBackendOrigin()}/api/file-proxy?u=${encodeURIComponent(videoUrl)}`;
  if (token) base += `&token=${encodeURIComponent(token)}`;
  return base;
}
