"use client";

import React, { useEffect, useState, use } from "react";
import CourseDetails from "@/components/user/course-details/CourseDetails";
import { getJSON } from "@/utils/http";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import Link from "next/link";

function CourseDetailsPage({ params }) {
  const resolvedParams = use(params);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await getJSON(`courses/${resolvedParams.id}`);
        
        if (response && response.success && response.data) {
          setCourse(response.data);
        } else {
          setError("Course not found");
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        setError(err.message || "Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams.id) {
      fetchCourse();
    }
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !course) {
    return (
      <Box
        sx={{
          maxWidth: "1200px",
          mx: "auto",
          p: { xs: 3, md: 6 },
          textAlign: "center",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Course not found
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          {error || "We couldn't find the course you are looking for."}
        </Typography>
        <Button component={Link} href="/user/explore-courses" variant="contained">
          Back to Courses
        </Button>
      </Box>
    );
  }

  return <CourseDetails course={course} />;
}

export default CourseDetailsPage;

