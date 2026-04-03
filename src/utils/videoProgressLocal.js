/**
 * localStorage buffer for video progress — key: progress_userId_courseId_lessonId
 * Range merge matches server/utils/rangeUtils (no duplicate coverage counting).
 */

const LS_PREFIX = "progress_";
const STALE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function progressStorageKey(userId, courseId, lessonId) {
  return `${LS_PREFIX}${userId}_${courseId}_${lessonId}`;
}

export function mergeRanges(ranges) {
  if (!ranges?.length) return [];
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const merged = [];
  for (const range of sorted) {
    const s = Number(range.start);
    const e = Number(range.end);
    if (!Number.isFinite(s) || !Number.isFinite(e) || e < s) continue;
    if (merged.length === 0) {
      merged.push({ start: s, end: e });
      continue;
    }
    const last = merged[merged.length - 1];
    if (s <= last.end) {
      last.end = Math.max(last.end, e);
    } else {
      merged.push({ start: s, end: e });
    }
  }
  return merged;
}

/**
 * Merge watched segments as `[start, end]` tuples or `{ start, end }` objects.
 * Overlaps are merged so total duration is not double-counted.
 */
export function mergeSegments(segments) {
  if (!segments?.length) return [];
  const asObjects = segments
    .map((s) => {
      if (Array.isArray(s) && s.length >= 2) {
        return { start: Number(s[0]), end: Number(s[1]) };
      }
      if (s && typeof s === "object" && "start" in s && "end" in s) {
        return { start: Number(s.start), end: Number(s.end) };
      }
      return null;
    })
    .filter(Boolean);
  return mergeRanges(asObjects);
}

function calculateWatchedSeconds(ranges) {
  if (!ranges?.length) return 0;
  return ranges.reduce((total, range) => {
    const start = Number(range.start);
    const end = Number(range.end);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return total;
    if (Number.isInteger(start) && Number.isInteger(end)) {
      return total + (end - start + 1);
    }
    return total + (end - start);
  }, 0);
}

export function addWatchedRange(existingRanges, start, end) {
  if (start >= end) return existingRanges || [];
  return mergeRanges([...(existingRanges || []), { start, end }]);
}

export function getResumeTimeFromRanges(ranges) {
  if (!ranges?.length) return 0;
  return Math.max(...ranges.map((r) => r.end));
}

/**
 * @returns {{ currentTime: number, duration: number, watchedPercent: number, watchedRanges: {start:number,end:number}[], savedAt: number } | null}
 */
export function readLocalProgress(userId, courseId, lessonId) {
  if (typeof window === "undefined") return null;
  const key = progressStorageKey(userId, courseId, lessonId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;
    if (data.savedAt && Date.now() - data.savedAt > STALE_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return {
      currentTime: Number(data.currentTime) || 0,
      duration: Number(data.duration) || 0,
      watchedPercent: Math.min(100, Math.max(0, Number(data.watchedPercent) || 0)),
      watchedRanges: Array.isArray(data.watchedRanges) ? data.watchedRanges : [],
      savedAt: data.savedAt || Date.now(),
    };
  } catch {
    return null;
  }
}

export function writeLocalProgress(userId, courseId, lessonId, payload) {
  if (typeof window === "undefined") return;
  const key = progressStorageKey(userId, courseId, lessonId);
  const merged = {
    currentTime: payload.currentTime ?? 0,
    duration: payload.duration ?? 0,
    watchedPercent: Math.min(100, Math.max(0, payload.watchedPercent ?? 0)),
    watchedRanges: mergeRanges(payload.watchedRanges || []),
    savedAt: Date.now(),
  };
  localStorage.setItem(key, JSON.stringify(merged));
}

export function computeWatchedPercentFromRanges(watchedRanges, durationSeconds) {
  if (!durationSeconds || durationSeconds <= 0) return 0;
  const sec = calculateWatchedSeconds(watchedRanges);
  return Math.min(100, Math.round((sec / durationSeconds) * 100));
}

/** Closed ranges plus optional in-progress segment (while playing). */
export function mergeRangesWithOpenSegment(closedRanges, openStart, openEnd) {
  const closed = mergeRanges(closedRanges || []);
  if (
    !Number.isFinite(openStart) ||
    !Number.isFinite(openEnd) ||
    openEnd <= openStart + 0.05
  ) {
    return closed;
  }
  return mergeRanges([...closed, { start: openStart, end: openEnd }]);
}

export { calculateWatchedSeconds };
