"use client";

import React, { useEffect, useState } from "react";
import CourseLearningPage from "@/components/user/myLearnings/CourseLearningPage";
import { getJSON } from "@/utils/http";
import { Box, CircularProgress, Typography } from "@mui/material";

function CourseLearningPageRoute({ params }) {
  const courseId = params?.id;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getJSON(`courses/${courseId}`);
        if (response?.success && response.data) {
          const data = response.data;
          setCourse({
            id: data._id,
            title: data.title || "",
            desc: data.description || "",
            progress: 0,
            img: data.thumbnailUrl || "/images/default-course.png",
          });
        } else {
          setCourse(null);
        }
      } catch (err) {
        console.error("Error loading course for my-learning:", err);
        setError(err.message || "Failed to load course");
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

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

