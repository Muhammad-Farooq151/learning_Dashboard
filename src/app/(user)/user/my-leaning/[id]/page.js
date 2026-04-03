"use client";

import React, { useEffect, useState, use } from "react";
import CourseLearningPage from "@/components/user/myLearnings/CourseLearningPage";
import { getJSON } from "@/utils/http";
import { courseThumbnailSrc } from "@/utils/mediaProxyUrl";
import { Box, CircularProgress, Typography } from "@mui/material";

function mapCourseResponse(data) {
  return {
    id: data._id,
    title: data.title || "",
    desc: data.description || "",
    progress: 0,
    img: courseThumbnailSrc({
      _id: data._id,
      thumbnailUrl: data.thumbnailUrl,
      thumbnailMediaPath: data.thumbnailMediaPath,
    }),
    fullData: data,
  };
}

/** True while any HLS lesson is still waiting on Cloud Transcoder — refetch until ready/failed */
function courseNeedsTranscodingPoll(lessons) {
  if (!Array.isArray(lessons)) return false;
  return lessons.some(
    (l) =>
      l.videoType === "hls" &&
      (l.transcodingStatus === "pending" || l.transcodingStatus === "processing")
  );
}

function CourseLearningPageRoute({ params }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams?.id;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId) return undefined;

    let cancelled = false;

    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getJSON(`courses/${courseId}`);
        if (cancelled) return;
        if (response?.success && response.data) {
          setCourse(mapCourseResponse(response.data));
        } else {
          setCourse(null);
        }
      } catch (err) {
        console.error("Error loading course for my-learning:", err);
        if (!cancelled) {
          setError(err.message || "Failed to load course");
          setCourse(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCourse();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  /** Poll while transcoding so "Processing…" updates to the player without a manual refresh */
  useEffect(() => {
    if (!courseId || !course?.fullData?.lessons) return undefined;
    if (!courseNeedsTranscodingPoll(course.fullData.lessons)) return undefined;

    const poll = async () => {
      try {
        const response = await getJSON(`courses/${courseId}`);
        if (response?.success && response.data) {
          setCourse(mapCourseResponse(response.data));
        }
      } catch {
        /* keep last good course */
      }
    };

    const id = setInterval(poll, 10000);
    return () => clearInterval(id);
  }, [courseId, course]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && !course) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Failed to load course
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error}
        </Typography>
      </Box>
    );
  }

  return <CourseLearningPage courseId={courseId} course={course} />;
}

export default CourseLearningPageRoute;

