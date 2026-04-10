/**
 * Shared course progress math — same rules on /user/my-leaning (list) and /user/my-leaning/[id] (learning page).
 */

/**
 * Overall course % — duration-weighted over video lessons; weight 1 when duration is 0 (matches learning page header).
 */
export function computeAggregateCoursePercent(lessons, progressMap) {
  if (!Array.isArray(lessons) || !progressMap) return 0;
  let sumWeighted = 0;
  let sumWeight = 0;
  for (const lesson of lessons) {
    if (!lesson?.videoUrl) continue;
    const lid = lesson._id != null ? String(lesson._id) : "";
    if (!lid) continue;
    const saved = progressMap[lid];
    const pct = Math.min(100, Math.max(0, Number(saved?.watchedPercent) || 0));
    const durFromLesson = Number(lesson.duration) || 0;
    const durFromProgress = Number(saved?.videoDurationSec) || 0;
    const dur = durFromLesson > 0 ? durFromLesson : durFromProgress;
    const weight = dur > 0 ? dur : 1;
    sumWeighted += pct * weight;
    sumWeight += weight;
  }
  if (sumWeight <= 0) return 0;
  return Math.min(100, Math.round(sumWeighted / sumWeight));
}

/**
 * Build the same per-lesson map the learning page uses from GET /api/progress/:courseId.
 */
export function buildLessonProgressMapFromApi(progressData) {
  const map = {};
  if (!progressData?.lessons || !Array.isArray(progressData.lessons)) return map;
  for (const l of progressData.lessons) {
    const lid = String(l.lessonId?._id || l.lessonId);
    const dur = Number(l.duration) || 0;
    const wp =
      Number(l.watchedPercent) >= 0
        ? Math.min(100, Number(l.watchedPercent))
        : dur > 0 && l.watched != null
          ? Math.min(100, Math.round((Number(l.watched) / dur) * 100))
          : 0;
    map[lid] = {
      watchedPercent: wp,
      completed: !!l.completed,
      watched: l.watched ?? l.resumeTime ?? 0,
      watchedRanges: Array.isArray(l.watchedRanges) ? l.watchedRanges : [],
      videoDurationSec: Number(l.duration) || 0,
    };
  }
  return map;
}

/**
 * Video lessons only — counts for "X of Y modules" line on cards.
 */
export function countVideoLessonStats(lessons, progressMap) {
  if (!Array.isArray(lessons)) return { completed: 0, total: 0 };
  let completed = 0;
  let total = 0;
  for (const lesson of lessons) {
    if (!lesson?.videoUrl) continue;
    const lid = lesson._id != null ? String(lesson._id) : "";
    if (!lid) continue;
    total += 1;
    const saved = progressMap[lid];
    if (saved?.completed || (Number(saved?.watchedPercent) || 0) >= 100) {
      completed += 1;
    }
  }
  return { completed, total };
}
