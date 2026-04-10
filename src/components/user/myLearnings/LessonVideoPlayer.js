"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useLessonVideoProgress } from "@/hooks/useLessonVideoProgress";
import Hls from "hls.js";
import { Box, Typography, CircularProgress } from "@mui/material";
import { getStoredToken, getStoredUser } from "@/utils/authStorage";
import {
  getBackendOrigin,
  proxiedGcsHlsUrl,
  gcsUrlShouldUseProxy,
  resolveLessonMediaUrl,
} from "@/utils/mediaProxyUrl";

/**
 * Serialize hls.js ErrorData for logs. Next.js dev overlay often renders a second `console.error`
 * object argument as `{}` — log one string only. Include xhr `response.code` (0 = CORS/network).
 */
function serializeHlsError(data) {
  if (data == null) return "data=null";
  const chunks = [];
  const push = (k, v) => {
    if (v !== undefined && v !== null && v !== "") chunks.push(`${k}=${String(v)}`);
  };

  push("type", data.type);
  push("details", data.details);
  push("fatal", data.fatal);
  push("reason", data.reason);
  push("url", data.url);
  if (data.frag?.url) push("fragUrl", data.frag.url);

  const ctx = data.context;
  if (ctx?.url) push("contextUrl", ctx.url);

  const res = data.response;
  if (res != null) {
    push("httpStatus", res.code);
    if (res.code === 0) push("hint", "status0_often_CORS_or_blocked");
    const t = res.text;
    if (typeof t === "string" && t.length) push("responseSnippet", t.slice(0, 160).replace(/\s+/g, " "));
  }

  const err = data.error;
  if (err instanceof Error) {
    push("errorMessage", err.message);
    if (err.stack) push("errorStack", err.stack.split("\n").slice(0, 3).join(" ← "));
  } else if (typeof err === "string") {
    push("error", err);
  }

  if (chunks.length === 0) {
    try {
      return `keys=${Object.keys(data).join(",")} json=${JSON.stringify(data, (_k, v) => (v instanceof Error ? v.message : v))}`;
    } catch {
      return String(data);
    }
  }
  return chunks.join(" | ");
}

function logHlsError(data) {
  console.warn("[HLS] " + serializeHlsError(data));
}

/**
 * MP4 or HLS (adaptive). HLS uses hls.js where needed; Safari uses native playback.
 * GCS HLS: default proxy mode uses /api/hls-proxy. Section 6 — NEXT_PUBLIC_MEDIA_DELIVERY=signed loads
 * storage.googleapis.com playlist URL from GET /api/lessons/:lessonId/stream (no CDN domain swap); segments via /api/media/chunk.
 */
function isSignedMediaDeliveryEnabled() {
  if (typeof window === "undefined") return false;
  return String(process.env.NEXT_PUBLIC_MEDIA_DELIVERY || "").toLowerCase() === "signed";
}

function hasAuthSession() {
  return Boolean(getStoredToken()) || Boolean(getStoredUser());
}

/**
 * @param {string} [lessonId] — required when NEXT_PUBLIC_MEDIA_DELIVERY=signed (Doc §5–6)
 */
export default function LessonVideoPlayer({
  url,
  videoType = "mp4",
  transcodingStatus,
  lessonId,
  /** { userId, courseId, lessonId, durationSeconds, onProgressUpdate } — omit for no tracking */
  progressTracking,
}) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [hlsFatal, setHlsFatal] = useState(false);
  const [hlsErrorHint, setHlsErrorHint] = useState("");

  const trackingMemo = useMemo(() => {
    if (!progressTracking?.userId || !progressTracking?.courseId || !progressTracking?.lessonId) {
      return null;
    }
    return progressTracking;
  }, [progressTracking]);

  useLessonVideoProgress(videoRef, trackingMemo);

  useEffect(() => {
    setHlsFatal(false);
    setHlsErrorHint("");
  }, [url, videoType, transcodingStatus]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return undefined;

    if (videoType !== "hls") {
      let cancelled = false;
      (async () => {
        const mp4 = await resolveLessonMediaUrl(url, "mp4");
        if (cancelled || !videoRef.current) return;
        if (!mp4) {
          video.removeAttribute("src");
          return;
        }
        video.src = mp4;
      })();
      return () => {
        cancelled = true;
        video.removeAttribute("src");
        video.load();
      };
    }

    if (transcodingStatus === "pending" || transcodingStatus === "processing") {
      video.removeAttribute("src");
      return undefined;
    }

    const signedDelivery = isSignedMediaDeliveryEnabled() && lessonId;

    if (signedDelivery && Hls.isSupported()) {
      let cancelled = false;
      let networkRecoveryUsed = false;
      let mediaRecoveryUsed = false;

      const origin = getBackendOrigin();
      (async () => {
        try {
          const res = await fetch(`${origin}/api/lessons/${lessonId}/stream`, {
            credentials: "include",
          });
          const data = await res.json().catch(() => ({}));
          if (cancelled || !res.ok || !data?.signedUrl) {
            if (!res.ok) {
              console.warn("[HLS signed]", res.status, data?.message || "");
            }
            return;
          }
          if (cancelled) return;
          const playbackUrl = data.signedUrl;
          const hls = new Hls({
            enableWorker: false,
            lowLatencyMode: false,
            xhrSetup: (xhr, reqUrl) => {
              if (reqUrl.includes("storage.googleapis.com")) {
                const chunkUrl = `${origin}/api/media/chunk?u=${encodeURIComponent(reqUrl)}`;
                xhr.open("GET", chunkUrl, true);
              } else {
                xhr.open("GET", reqUrl, true);
              }
              xhr.withCredentials = true;
              const token = getStoredToken();
              if (token) {
                xhr.setRequestHeader("Authorization", `Bearer ${token}`);
              }
            },
          });
          hlsRef.current = hls;
          hls.loadSource(playbackUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.ERROR, (_, data) => {
            if (!data?.fatal) return;
            logHlsError(data);
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR && !networkRecoveryUsed) {
              networkRecoveryUsed = true;
              hls.startLoad();
              return;
            }
            if (data.type === Hls.ErrorTypes.MEDIA_ERROR && !mediaRecoveryUsed) {
              mediaRecoveryUsed = true;
              hls.recoverMediaError();
              return;
            }
            setHlsErrorHint(serializeHlsError(data));
            setHlsFatal(true);
          });
        } catch (e) {
          console.warn("[HLS signed] setup failed", e);
        }
      })();

      return () => {
        cancelled = true;
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };
    }

    if (Hls.isSupported()) {
      let networkRecoveryUsed = false;
      let mediaRecoveryUsed = false;

      const playbackUrl = proxiedGcsHlsUrl(url);
      if (!playbackUrl) {
        return undefined;
      }

      const hls = new Hls({
        // Main-thread loader: easier to debug CORS / clearer errors than default worker
        enableWorker: false,
        lowLatencyMode: false,
        xhrSetup: (xhr) => {
          const token = getStoredToken();
          if (token) {
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          }
        },
      });
      hlsRef.current = hls;
      hls.loadSource(playbackUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!data?.fatal) return;

        logHlsError(data);

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR && !networkRecoveryUsed) {
          networkRecoveryUsed = true;
          console.warn("[HLS] retry after NETWORK_ERROR (startLoad)");
          hls.startLoad();
          return;
        }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR && !mediaRecoveryUsed) {
          mediaRecoveryUsed = true;
          console.warn("[HLS] retry after MEDIA_ERROR (recoverMediaError)");
          hls.recoverMediaError();
          return;
        }

        setHlsErrorHint(serializeHlsError(data));
        setHlsFatal(true);
      });
      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (signedDelivery) {
        let cancelled = false;
        (async () => {
          const origin = getBackendOrigin();
          const res = await fetch(`${origin}/api/lessons/${lessonId}/stream`, {
            credentials: "include",
          });
          const data = await res.json().catch(() => ({}));
          if (cancelled || !res.ok || !data?.signedUrl) return;
          video.src = data.signedUrl;
        })();
        return () => {
          cancelled = true;
          video.removeAttribute("src");
          video.load();
        };
      }
      const playbackUrl = proxiedGcsHlsUrl(url);
      if (!playbackUrl) return undefined;
      video.src = playbackUrl;
      return () => {
        video.removeAttribute("src");
        video.load();
      };
    }

    console.warn("[HLS] Playback not supported in this browser");
    return undefined;
  }, [url, videoType, transcodingStatus, lessonId]);

  if (
    videoType === "hls" &&
    (transcodingStatus === "pending" || transcodingStatus === "processing")
  ) {
    return (
      <Box sx={{ p: 4, textAlign: "center", bgcolor: "#000", color: "#fff", minHeight: 220 }}>
        <CircularProgress size={32} sx={{ color: "#fff", mb: 2 }} />
        <Typography variant="body2">
          {transcodingStatus === "processing"
            ? "Transcoding is in progress. Playback will be available shortly."
            : "This video is being prepared for adaptive playback. Please try again in a few minutes."}
        </Typography>
      </Box>
    );
  }

  if (videoType === "hls" && transcodingStatus === "failed") {
    return (
      <Box sx={{ p: 4, textAlign: "center", bgcolor: "#000", color: "#fff", minHeight: 220 }}>
        <Typography variant="body2">Video processing failed. Please contact support.</Typography>
      </Box>
    );
  }

  const mustSignInForMedia =
    url &&
    !hasAuthSession() &&
    ((videoType === "hls" && gcsUrlShouldUseProxy(url, "hls")) ||
      (videoType !== "hls" && gcsUrlShouldUseProxy(url, "file")));

  if (mustSignInForMedia) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          bgcolor: "#000",
          color: "#fff",
          minHeight: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body2">
          Sign in to watch this lesson. Protected video requires an account and course access.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#000", minHeight: 220 }}>
      {videoType === "hls" && hlsFatal && (
        <Box sx={{ p: 2, borderBottom: "1px solid #333" }}>
          <Typography variant="body2" color="error.light" sx={{ mb: 1 }}>
            Playback failed. HLS uses the API server proxy (see <code>/api/hls-proxy</code> on the backend). If this
            persists, set GCS bucket CORS or check the error details below.
          </Typography>
          {hlsErrorHint ? (
            <Typography variant="caption" component="pre" sx={{ display: "block", opacity: 0.85, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {hlsErrorHint}
            </Typography>
          ) : null}
        </Box>
      )}
      <video
        ref={videoRef}
        controls
        controlsList="nodownload"
        disablePictureInPicture
        playsInline
        style={{ width: "100%", backgroundColor: "black", display: "block", minHeight: 220 }}
        preload="metadata"
      />
    </Box>
  );
}
