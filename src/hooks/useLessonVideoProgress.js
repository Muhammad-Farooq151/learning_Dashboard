"use client";

import { useEffect, useRef } from "react";
import { postJSON } from "@/utils/http";
import { getStoredToken } from "@/utils/authStorage";
import {
  readLocalProgress,
  writeLocalProgress,
  addWatchedRange,
  mergeRanges,
  mergeRangesWithOpenSegment,
  computeWatchedPercentFromRanges,
} from "@/utils/videoProgressLocal";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/** Ignore sub-50ms segments (noise / same-frame) */
const MIN_SEGMENT_SEC = 0.05;

/**
 * Forward jump in one timeupdate while not seeking — treat as seek artifact, not play.
 * Backward delta also ignored (scrub / seek).
 */
const MAX_VALID_DELTA_SEC = 2;

/**
 * Reject a single added segment > this fraction of duration (anti-spoof). Not used when allowLongSegment.
 */
const MAX_SINGLE_SEGMENT_FRACTION = 0.5;

/**
 * Watched-only video progress (HLS/MP4-safe; no coupling to proxy URLs or auth).
 *
 * | Event           | Behavior |
 * |-----------------|----------|
 * | `play`          | `isSeekingRef = false`. If no open segment, `segmentStart` / `lastKnown` = `currentTime`. |
 * | `timeupdate`    | Ignored while seeking. Else advance `lastKnown` only if Δ in [0, MAX_VALID_DELTA_SEC]. |
 * | `seeking`       | `isSeekingRef = true`. **No commit** — `lastKnown` stays at last real playback time. |
 * | `seeked`        | Commit `[segmentStart, lastKnown]` (pre-seek). New segment at landed `currentTime`. |
 * | `pause` / `ended` | `commitOpenSegment({ allowLongSegment: true })`, then `segmentStart` / `lastKnown` = `null`. |
 *
 * Pre-seek watch is committed on **`seeked`** (not `seeking`) so skipped timeline is never merged into `lastKnown`.
 * Backend payload unchanged: `watchedRanges: { start, end }[]` (merged / idempotent).
 */
export function useLessonVideoProgress(videoRef, tracking) {
  const rangesRef = useRef([]);
  /** Start of the current play segment; null = no active segment (e.g. after pause commit) */
  const segmentStartRef = useRef(null);
  /** Last time advanced by timeupdate while playing; null with segmentStart */
  const lastKnownTimeRef = useRef(null);
  const isSeekingRef = useRef(false);
  const trackingKeyRef = useRef("");

  useEffect(() => {
    if (
      !tracking?.userId ||
      !tracking?.courseId ||
      !tracking?.lessonId ||
      typeof window === "undefined"
    ) {
      return undefined;
    }

    const { userId, courseId, lessonId, durationSeconds = 0, onProgressUpdate } = tracking;
    const key = `${userId}_${courseId}_${lessonId}`;
    let disposed = false;
    let detachListeners = () => {};

    const attach = (video) => {
      trackingKeyRef.current = key;

      const local = readLocalProgress(userId, courseId, lessonId);
      rangesRef.current = local?.watchedRanges?.length
        ? mergeRanges([...local.watchedRanges])
        : [];

      const duration = () => {
        const dur = video.duration;
        if (Number.isFinite(dur) && dur > 0) return dur;
        return Number(durationSeconds) || 0;
      };

      /**
       * Persist [segmentStart, lastKnown] into merged ranges.
       */
      const commitOpenSegment = (opts = {}) => {
        const { allowLongSegment = false } = opts;
        const d = duration();
        if (!d) return;
        const start = segmentStartRef.current;
        const endRaw = lastKnownTimeRef.current;
        if (start == null || endRaw == null) return;
        const end = Math.min(endRaw, d);
        if (end <= start + MIN_SEGMENT_SEC) return;
        if (!allowLongSegment && end - start > d * MAX_SINGLE_SEGMENT_FRACTION) return;
        rangesRef.current = addWatchedRange(rangesRef.current, start, end);
      };

      const effectiveRangesForSnapshot = () => {
        const d = duration();
        if (!d) return mergeRanges([...rangesRef.current]);
        const ss = segmentStartRef.current;
        const lk = lastKnownTimeRef.current;
        if (ss == null || lk == null) {
          return mergeRanges([...rangesRef.current]);
        }
        if (video.paused || isSeekingRef.current) {
          return mergeRanges([...rangesRef.current]);
        }
        return mergeRangesWithOpenSegment(
          rangesRef.current,
          ss,
          Math.min(lk, d)
        );
      };

      const tickLocal = () => {
        if (disposed || isSeekingRef.current) return;
        const d = duration();
        if (!d) return;
        const now = Math.min(video.currentTime, d);
        if (!video.paused && segmentStartRef.current != null && lastKnownTimeRef.current != null) {
          const delta = now - lastKnownTimeRef.current;
          if (delta < 0 || delta > MAX_VALID_DELTA_SEC) return;
          lastKnownTimeRef.current = Math.max(lastKnownTimeRef.current, now);
        }

        const merged = effectiveRangesForSnapshot();
        const pct = computeWatchedPercentFromRanges(merged, d);

        writeLocalProgress(userId, courseId, lessonId, {
          currentTime: now,
          duration: d,
          watchedPercent: pct,
          watchedRanges: merged,
        });
        onProgressUpdate?.({
          source: "local",
          lessonId,
          watchedPercent: pct,
          currentTime: now,
          duration: d,
          watchedRanges: merged,
          completed: pct >= 90,
        });
      };

      const flush = async (reason) => {
        commitOpenSegment({ allowLongSegment: true });
        const d = duration();
        if (!video.paused && reason !== "ended" && Number.isFinite(d) && d > 0) {
          const boundary = Math.min(video.currentTime, d);
          segmentStartRef.current = boundary;
          lastKnownTimeRef.current = boundary;
        }
        const merged = mergeRanges([...rangesRef.current]);
        const pct = computeWatchedPercentFromRanges(merged, d);
        const now = Math.min(video.currentTime, d || video.currentTime);

        writeLocalProgress(userId, courseId, lessonId, {
          currentTime: now,
          duration: d,
          watchedPercent: pct,
          watchedRanges: merged,
        });

        const snap = readLocalProgress(userId, courseId, lessonId);
        if (!snap?.duration) return;
        try {
          const res = await postJSON("progress/save", {
            userId,
            courseId,
            lessonId,
            currentTime: snap.currentTime,
            duration: snap.duration,
            watchedPercent: snap.watchedPercent,
            watchedRanges: snap.watchedRanges,
            lessonEnded: reason === "ended",
          });
          if (res?.success && res.data) {
            onProgressUpdate?.({
              source: "remote",
              lessonId,
              watchedPercent: res.data.lesson?.watchedPercent,
              coursePercent: res.data.coursePercent,
              courseCompleted: res.data.courseCompleted,
              completed: res.data.lesson?.completed,
              currentTime: snap.currentTime,
              duration: snap.duration,
              watchedRanges: snap.watchedRanges,
            });
          }
        } catch (e) {
          console.warn("[progress] save failed", e?.message || e);
        }
      };

      const flushKeepalive = () => {
        commitOpenSegment({ allowLongSegment: true });
        const d = duration();
        if (!video.paused && Number.isFinite(d) && d > 0) {
          const boundary = Math.min(video.currentTime, d);
          segmentStartRef.current = boundary;
          lastKnownTimeRef.current = boundary;
        }
        const merged = mergeRanges([...rangesRef.current]);
        const pct = computeWatchedPercentFromRanges(merged, d);
        const now = Math.min(video.currentTime, d || video.currentTime);
        writeLocalProgress(userId, courseId, lessonId, {
          currentTime: now,
          duration: d,
          watchedPercent: pct,
          watchedRanges: merged,
        });
        const snap = readLocalProgress(userId, courseId, lessonId);
        if (!snap?.duration) return;
        const url = `${API_BASE.replace(/\/$/, "")}/progress/save`;
        const body = JSON.stringify({
          userId,
          courseId,
          lessonId,
          currentTime: snap.currentTime,
          duration: snap.duration,
          watchedPercent: snap.watchedPercent,
          watchedRanges: snap.watchedRanges,
          lessonEnded: false,
        });
        const headers = { "Content-Type": "application/json" };
        const t = getStoredToken();
        if (t) headers.Authorization = `Bearer ${t}`;
        try {
          fetch(url, {
            method: "POST",
            headers,
            body,
            credentials: "include",
            keepalive: true,
          });
        } catch {
          /* ignore */
        }
      };

      const onLoadedMetadata = () => {
        const d = duration();
        const loc = readLocalProgress(userId, courseId, lessonId);
        if (loc?.watchedRanges?.length) {
          rangesRef.current = mergeRanges([...loc.watchedRanges]);
        }
        if (loc && loc.currentTime > 5 && d > 0) {
          video.currentTime = Math.min(loc.currentTime, Math.max(0, d - 0.25));
        }
        segmentStartRef.current = null;
        lastKnownTimeRef.current = null;
        isSeekingRef.current = false;
        /** seeked (after resume jump) will establish segment at landed time if still paused */
      };

      const onPlay = () => {
        isSeekingRef.current = false;
        const d = duration();
        const t = Math.min(video.currentTime, d || video.currentTime);
        if (segmentStartRef.current == null) {
          segmentStartRef.current = t;
        }
        lastKnownTimeRef.current = t;
      };

      const onTimeUpdate = () => {
        if (isSeekingRef.current) return;
        if (video.paused) return;
        const d = duration();
        if (!d) return;
        const ct = Math.min(video.currentTime, d);

        if (segmentStartRef.current == null) {
          segmentStartRef.current = ct;
          lastKnownTimeRef.current = ct;
          return;
        }
        if (lastKnownTimeRef.current == null) {
          lastKnownTimeRef.current = ct;
          return;
        }

        const delta = ct - lastKnownTimeRef.current;
        if (delta < 0 || delta > MAX_VALID_DELTA_SEC) return;
        lastKnownTimeRef.current = ct;
      };

      const onSeeking = () => {
        if (isSeekingRef.current) return;
        /** Block timeupdate until seeked — lastKnown stays at last real playback time */
        isSeekingRef.current = true;
      };

      const onSeeked = () => {
        /** Commit only actually watched [segmentStart, lastKnown] (pre-seek; seeking blocked timeupdate). */
        commitOpenSegment({ allowLongSegment: false });
        isSeekingRef.current = false;
        const d = duration();
        const t = d ? Math.min(video.currentTime, d) : video.currentTime;
        segmentStartRef.current = t;
        lastKnownTimeRef.current = t;
        if (video.paused) {
          flush("pause");
        }
      };

      const onPause = () => {
        if (isSeekingRef.current) return;
        commitOpenSegment({ allowLongSegment: true });
        segmentStartRef.current = null;
        lastKnownTimeRef.current = null;
        flush("pause");
      };

      const onEnded = () => {
        isSeekingRef.current = false;
        const d = duration();
        if (d) {
          lastKnownTimeRef.current = d;
        }
        commitOpenSegment({ allowLongSegment: true });
        segmentStartRef.current = null;
        lastKnownTimeRef.current = null;
        flush("ended");
      };

      const onVisibility = () => {
        if (document.visibilityState === "hidden") flush("visibility");
      };

      const onBeforeUnload = () => flushKeepalive();

      video.addEventListener("loadedmetadata", onLoadedMetadata);
      video.addEventListener("play", onPlay);
      video.addEventListener("timeupdate", onTimeUpdate);
      video.addEventListener("seeking", onSeeking);
      video.addEventListener("seeked", onSeeked);
      video.addEventListener("pause", onPause);
      video.addEventListener("ended", onEnded);
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("beforeunload", onBeforeUnload);

      const localInterval = setInterval(() => {
        if (disposed || trackingKeyRef.current !== key) return;
        if (!video.paused) tickLocal();
      }, 5000);

      const backupInterval = setInterval(() => {
        if (disposed || trackingKeyRef.current !== key) return;
        flush("interval60");
      }, 60000);

      return () => {
        trackingKeyRef.current = "";
        clearInterval(localInterval);
        clearInterval(backupInterval);
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
        video.removeEventListener("play", onPlay);
        video.removeEventListener("timeupdate", onTimeUpdate);
        video.removeEventListener("seeking", onSeeking);
        video.removeEventListener("seeked", onSeeked);
        video.removeEventListener("pause", onPause);
        video.removeEventListener("ended", onEnded);
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("beforeunload", onBeforeUnload);
      };
    };

    const pollId = setInterval(() => {
      const v = videoRef.current;
      if (!v || disposed) return;
      clearInterval(pollId);
      detachListeners = attach(v) || (() => {});
    }, 50);

    return () => {
      disposed = true;
      clearInterval(pollId);
      detachListeners();
    };
  }, [videoRef, tracking]);
}
