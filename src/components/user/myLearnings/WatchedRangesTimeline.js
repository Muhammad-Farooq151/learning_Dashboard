"use client";

import { Box } from "@mui/material";
import { greenColor } from "@/components/utils/Colors";

/**
 * Full-width track with one green bar per merged watched range (timeline-accurate).
 * @param {"overlay"|"panel"} variant — overlay on black video; panel on light card
 */
export default function WatchedRangesTimeline({
  ranges = [],
  durationSeconds = 0,
  /** If ranges are empty (old saves) but % is known — single bar 0→percent */
  fallbackPercent = null,
  variant = "overlay",
  sx = {},
}) {
  const list = Array.isArray(ranges) ? ranges : [];
  const maxEndFromRanges = list.reduce((m, r) => Math.max(m, Number(r?.end) || 0), 0);

  let d = Number(durationSeconds);
  if (!Number.isFinite(d) || d <= 0) {
    d = maxEndFromRanges > 0 ? maxEndFromRanges : 0;
  }

  const trackBg =
    variant === "panel" ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.42)";
  const height = variant === "panel" ? 8 : 5;

  const baseSx = {
    position: "relative",
    height,
    minHeight: height,
    overflow: "hidden",
    borderRadius: 1,
    bgcolor: trackBg,
    ...sx,
  };

  if (list.length > 0 && d > 0) {
    return (
      <Box sx={baseSx}>
        {list.map((r, i) => {
          const start = Math.max(0, Math.min(Number(r?.start) || 0, d));
          const end = Math.max(start, Math.min(Number(r?.end) || 0, d));
          if (end - start < 0.02) return null;
          const leftPct = (start / d) * 100;
          const widthPct = ((end - start) / d) * 100;
          return (
            <Box
              key={`wr-${i}-${start.toFixed(2)}-${end.toFixed(2)}`}
              sx={{
                position: "absolute",
                top: 0,
                left: `${leftPct}%`,
                width: `${widthPct}%`,
                height: "100%",
                bgcolor: greenColor,
                borderRadius: 0.5,
                transition: "width 0.2s ease, left 0.2s ease",
              }}
            />
          );
        })}
      </Box>
    );
  }

  const fp =
    fallbackPercent != null ? Math.min(100, Math.max(0, Number(fallbackPercent))) : 0;
  if (fp > 0) {
    return (
      <Box sx={baseSx}>
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            width: `${fp}%`,
            height: "100%",
            bgcolor: greenColor,
            borderRadius: 1,
          }}
        />
      </Box>
    );
  }

  return <Box sx={{ ...baseSx, bgcolor: trackBg }} />;
}
