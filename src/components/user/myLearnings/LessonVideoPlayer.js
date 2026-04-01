"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Box, Typography, CircularProgress } from "@mui/material";

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
 * Same-origin playback URL: /api/hls-proxy proxies GCS so the browser does not need bucket CORS.
 * Optional NEXT_PUBLIC_HLS_PROXY_URL_PREFIXES (comma-separated). Disable with NEXT_PUBLIC_HLS_PROXY_DISABLED=true.
 */
function resolveHlsPlaybackUrl(originalUrl) {
  if (typeof window === "undefined" || !originalUrl) return originalUrl;
  if (String(process.env.NEXT_PUBLIC_HLS_PROXY_DISABLED).toLowerCase() === "true") {
    return originalUrl;
  }
  const raw =
    process.env.NEXT_PUBLIC_HLS_PROXY_URL_PREFIXES ||
    "https://storage.googleapis.com/vixhunter-processed-videos";
  const prefixes = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const allowed = prefixes.some((p) => originalUrl.startsWith(p));
  if (!allowed) return originalUrl;
  return `${window.location.origin}/api/hls-proxy?u=${encodeURIComponent(originalUrl)}`;
}

/**
 * MP4 or HLS (adaptive). HLS uses hls.js where needed; Safari uses native playback.
 * GCS HLS defaults to same-origin proxy (see /api/hls-proxy) so learners need not configure bucket CORS.
 */
export default function LessonVideoPlayer({
  url,
  videoType = "mp4",
  transcodingStatus,
}) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [hlsFatal, setHlsFatal] = useState(false);
  const [hlsErrorHint, setHlsErrorHint] = useState("");

  useEffect(() => {
    setHlsFatal(false);
    setHlsErrorHint("");
  }, [url, videoType, transcodingStatus]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return undefined;

    if (videoType !== "hls") {
      video.src = url;
      return () => {
        video.removeAttribute("src");
        video.load();
      };
    }

    if (transcodingStatus === "pending" || transcodingStatus === "processing") {
      video.removeAttribute("src");
      return undefined;
    }

    if (Hls.isSupported()) {
      let networkRecoveryUsed = false;
      let mediaRecoveryUsed = false;

      const playbackUrl = resolveHlsPlaybackUrl(url);

      const hls = new Hls({
        // Main-thread loader: easier to debug CORS / clearer errors than default worker
        enableWorker: false,
        lowLatencyMode: false,
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
      video.src = resolveHlsPlaybackUrl(url);
      return () => {
        video.removeAttribute("src");
        video.load();
      };
    }

    console.warn("[HLS] Playback not supported in this browser");
    return undefined;
  }, [url, videoType, transcodingStatus]);

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

  return (
    <Box sx={{ bgcolor: "#000", minHeight: 220 }}>
      {videoType === "hls" && hlsFatal && (
        <Box sx={{ p: 2, borderBottom: "1px solid #333" }}>
          <Typography variant="body2" color="error.light" sx={{ mb: 1 }}>
            Playback failed. HLS normally uses the same-origin proxy <code>/api/hls-proxy</code>. If this
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
