"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";
import { Box, Typography, CircularProgress } from "@mui/material";

/**
 * MP4 or HLS (adaptive). HLS uses hls.js where needed; Safari uses native playback.
 */
export default function LessonVideoPlayer({
  url,
  videoType = "mp4",
  transcodingStatus,
}) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

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
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error("[HLS] fatal error", data);
        }
      });
      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
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
    <video
      ref={videoRef}
      controls
      controlsList="nodownload"
      disablePictureInPicture
      playsInline
      style={{ width: "100%", backgroundColor: "black", display: "block", minHeight: 220 }}
      preload="metadata"
    />
  );
}
