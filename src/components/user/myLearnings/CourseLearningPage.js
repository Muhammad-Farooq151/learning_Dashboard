"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Button,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Rating,
  Avatar,
  Paper,
  CircularProgress,
} from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ImageIcon from "@mui/icons-material/Image";
import { greenColor } from "@/components/utils/Colors";
import Link from "next/link";
import { getJSON } from "@/utils/http";
import LessonVideoPlayer from "@/components/user/myLearnings/LessonVideoPlayer";

// Helper function to format duration from seconds to "X Minutes" or "X Hours Y Minutes"
const formatDuration = (seconds) => {
  if (!seconds) return "0 Minutes";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours} ${hours === 1 ? "Hour" : "Hours"} ${minutes} ${minutes === 1 ? "Minute" : "Minutes"}`;
  }
  if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? "Minute" : "Minutes"}`;
  }
  return `${secs} ${secs === 1 ? "Second" : "Seconds"}`;
};

/** Progress / Socket.io tracking disabled — zeroed UI until re-enabled */
const noTrackingSnapshot = () => ({
  watched: 0,
  watchedSeconds: 0,
  completed: false,
  watchedRanges: [],
  progressPercent: 0,
});

function CourseLearningPage({ courseId, course }) {
  const [tab, setTab] = useState("course-material");
  const [expandedSections, setExpandedSections] = useState({ 0: true });
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Load reviews when reviews tab is selected
  useEffect(() => {
    const loadReviews = async () => {
      if (tab !== "reviews" || !courseId) return;
      
      setLoadingReviews(true);
      try {
        const response = await getJSON(`feedback/course/${courseId}`);
        if (response?.success && Array.isArray(response.data)) {
          setReviews(response.data);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error("Error loading reviews:", error);
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };

    loadReviews();
  }, [tab, courseId]);

  // Transform API lessons data into curriculum format (progress tracking disabled)
  const curriculum = useMemo(() => {
    if (!course?.fullData?.lessons || !Array.isArray(course.fullData.lessons)) {
      return { sections: [] };
    }

    const lessons = course.fullData.lessons.map((lesson, index) => {
      const lessonId = lesson._id ? lesson._id.toString() : index.toString();
      const lessonDuration = lesson.duration || 0;
      const progress = noTrackingSnapshot();
      
      return {
        id: lessonId,
        title: lesson.lessonName || `Lesson ${index + 1}`,
        duration: formatDuration(lessonDuration),
        durationSeconds: lessonDuration,
        type: lesson.videoUrl ? "Video" : "Quiz",
        completed: progress.completed,
        progress: progress.progressPercent,
        watched: progress.watched || 0, // Resume position
        watchedSeconds: progress.watchedSeconds || 0, // Actual watched time from ranges
        summary: lesson.learningOutcomes || "",
        objectives: lesson.skills || [],
        videoUrl: lesson.videoUrl || null,
        videoType: lesson.videoType || "mp4",
        transcodingStatus: lesson.transcodingStatus || null,
        order: lesson.order || index,
      };
    });

    const totalMinutes = Math.floor(
      lessons.reduce((sum, lesson) => sum + lesson.durationSeconds, 0) / 60
    );

    return {
      sections: [
        {
          id: 0,
          title: "Course Lessons",
          lessons: lessons.sort((a, b) => a.order - b.order),
          totalMinutes: totalMinutes,
        },
      ],
    };
  }, [course]);

  const totalLessons = useMemo(
    () => curriculum.sections.reduce((sum, section) => sum + section.lessons.length, 0),
    [curriculum]
  );

  const totalMinutes = useMemo(
    () => curriculum.sections.reduce((sum, section) => sum + section.totalMinutes, 0),
    [curriculum]
  );

  const selectedLessonId = selectedLesson?.id || null;

  const selectedLessonProgress = useMemo(() => noTrackingSnapshot(), [selectedLessonId]);

  const courseProgress = 0;

  const handleSectionToggle = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !(prev[sectionId] ?? false),
    }));
  };

  // Get all lessons in a flat array for navigation
  const allLessons = useMemo(() => {
    return curriculum.sections.flatMap((section) =>
      section.lessons.map((lesson) => ({
        ...lesson,
        sectionTitle: section.title,
      }))
    );
  }, [curriculum]);

  const handleLessonClick = (lesson, section) => {
    setSelectedLesson({
      ...lesson,
      sectionTitle: section.title,
    });
  };

  const closeLessonDialog = () => {
    setSelectedLesson(null);
  };

  // Get current lesson index and next/previous lessons
  const currentLessonIndex = useMemo(() => {
    if (!selectedLesson) return -1;
    return allLessons.findIndex((lesson) => lesson.id === selectedLesson.id);
  }, [selectedLesson, allLessons]);

  const nextLesson = useMemo(() => {
    if (currentLessonIndex === -1 || currentLessonIndex >= allLessons.length - 1) {
      return null;
    }
    return allLessons[currentLessonIndex + 1];
  }, [currentLessonIndex, allLessons]);

  const previousLesson = useMemo(() => {
    if (currentLessonIndex <= 0) {
      return null;
    }
    return allLessons[currentLessonIndex - 1];
  }, [currentLessonIndex, allLessons]);

  const handleNextLesson = () => {
    if (nextLesson) {
      setSelectedLesson(nextLesson);
    }
  };

  const handlePreviousLesson = () => {
    if (previousLesson) {
      setSelectedLesson(previousLesson);
    }
  };

  /** When parent refetches course (e.g. HLS transcoding poll), keep open dialog in sync with latest transcodingStatus / videoUrl */
  useEffect(() => {
    if (!selectedLesson?.id) return;
    const fresh = allLessons.find((l) => l.id === selectedLesson.id);
    if (!fresh) return;
    setSelectedLesson((prev) => {
      if (!prev || prev.id !== fresh.id) return prev;
      const same =
        prev.transcodingStatus === fresh.transcodingStatus &&
        prev.videoUrl === fresh.videoUrl &&
        prev.videoType === fresh.videoType;
      if (same) return prev;
      return { ...fresh };
    });
  }, [allLessons, selectedLesson?.id]);

  if (!course) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Course not found
        </Typography>
        <Button component={Link} href="/user/my-leaning" variant="contained" sx={{ mt: 2 }}>
          Back to My Learnings
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{  minHeight: "100vh" }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton component={Link} href="/user/my-leaning" size="small">
              <ArrowBackIosNewRoundedIcon fontSize="small" />
            </IconButton>
            <Typography variant="h5" fontWeight={600}>
              My Learnings
            </Typography>
          </Box>
        </Box>

        {/* Course Info Card */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {course.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {course.desc}
            </Typography>
            
            {/* Course Stats */}
            <Box sx={{ display: "flex", gap: 3, mb: 2, flexWrap: "wrap" }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total Lessons
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {totalLessons}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total Duration
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formatDuration(
                    curriculum.sections.reduce(
                      (sum, section) =>
                        sum +
                        section.lessons.reduce(
                          (lessonSum, lesson) => lessonSum + (lesson.durationSeconds || 0),
                          0
                        ),
                      0
                    )
                  )}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" fontWeight={500}>
                  Progress
                </Typography>
                <Typography variant="body2" fontWeight={600} color={greenColor}>
                  {courseProgress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={courseProgress}
                sx={{
                  height: 8,
                  borderRadius: 5,
                  backgroundColor: "#E5FFF7",
                  [`& .MuiLinearProgress-bar`]: {
                    backgroundColor: greenColor,
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <Box sx={{ position: "relative" }}>
            <Tabs
              value={tab}
              onChange={(e, v) => setTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                px: { xs: 1, md: 3 },
                minHeight: 52,
                "& .MuiTabs-flexContainer": {
                  gap: { xs: 0.5, md: 1.5 },
                },
                "& .MuiTabs-scrollButtons": {
                  width: 30,
                  color: greenColor,
                  "&.Mui-disabled": {
                    opacity: 0.25,
                  },
                },
                "& .MuiTabs-scrollButtons.MuiButtonBase-root": {
                  display: { xs: "flex", md: "none" },
                },
              }}
            >
              <Tab
                label="Course Material"
                value="course-material"
                sx={{ minHeight: 52, whiteSpace: "nowrap", minWidth: "max-content", px: 1.5 }}
              />
              <Tab
                label="Resources"
                value="resources"
                sx={{ minHeight: 52, whiteSpace: "nowrap", minWidth: "max-content", px: 1.5 }}
              />
              <Tab
                label="Reviews"
                value="reviews"
                sx={{ minHeight: 52, whiteSpace: "nowrap", minWidth: "max-content", px: 1.5 }}
              />
              <Tab
                label="Overview"
                value="overview"
                sx={{ minHeight: 52, whiteSpace: "nowrap", minWidth: "max-content", px: 1.5 }}
              />
            </Tabs>

            <Box
              sx={{
                display: { xs: "flex", md: "none" },
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 0.5,
                px: 2,
                py: 0.75,
                color: "text.secondary",
                fontSize: "0.72rem",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <ArrowBackRoundedIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption" color="inherit">
                Swipe tabs
              </Typography>
              <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
            </Box>
          </Box>

          {/* Tab Content */}
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            {tab === "course-material" && (
              <Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={3}
                >
                  <Typography variant="h6" fontWeight={600}>
                    Course Curriculum
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {totalLessons} lessons · {totalMinutes} total minutes
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  {curriculum.sections.map((section) => {
                    const isExpanded = expandedSections[section.id] ?? false;
                    return (
                      <Accordion
                        key={section.id}
                        expanded={isExpanded}
                        onChange={() => handleSectionToggle(section.id)}
                        sx={{
                          boxShadow: "0px 2px 8px rgba(0,0,0,0.06)",
                          borderRadius: 2,
                          "&:before": { display: "none" },
                        }}
                      >
                        <AccordionSummary
                          sx={{
                            px: 2,
                            py: 1.5,
                            "& .MuiAccordionSummary-content": {
                              my: 0,
                            },
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                            pr={2}
                          >
                            <Typography variant="subtitle1" fontWeight={600}>
                              {section.title}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Typography variant="body2" color="text.secondary">
                                {section.lessons.length} lessons · {section.totalMinutes} total minutes
                              </Typography>
                              {isExpanded ? (
                                <ExpandLessRoundedIcon />
                              ) : (
                                <ExpandMoreRoundedIcon />
                              )}
                            </Box>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ px: 2, pb: 2 }}>
                          <Stack spacing={1.5}>
                            {section.lessons.map((lesson) => (
                              <Box
                                key={lesson.id}
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                sx={{
                                  p: 1.5,
                                  borderRadius: 2,
                                  bgcolor: "#F9FAFB",
                                  cursor: "pointer",
                                  "&:hover": {
                                    bgcolor: "#F3F4F6",
                                  },
                                }}
                                onClick={() => handleLessonClick(lesson, section)}
                              >
                                <Box display="flex" alignItems="center" gap={2} flex={1}>
                                  {lesson.type === "Video" ? (
                                    <PlayCircleOutlineRoundedIcon
                                      sx={{ color: greenColor, fontSize: 28 }}
                                    />
                                  ) : (
                                    <QuizRoundedIcon
                                      sx={{ color: "#0EA5E9", fontSize: 28 }}
                                    />
                                  )}
                                  <Box flex={1}>
                                    <Typography variant="body2" fontWeight={500}>
                                      {lesson.title}
                                    </Typography>
                                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                      <Typography variant="caption" color="text.secondary">
                                        {lesson.duration}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        ·
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {lesson.type}
                                      </Typography>
                                      {lesson.progress > 0 && (
                                        <>
                                          <Typography variant="caption" color="text.secondary">
                                            ·
                                          </Typography>
                                          <Typography variant="caption" color={greenColor} fontWeight={500}>
                                            {lesson.progress}% watched
                                          </Typography>
                                        </>
                                      )}
                                    </Box>
                                    {lesson.progress > 0 && lesson.progress < 100 && (
                                      <Box sx={{ mt: 1, width: "100%" }}>
                                        <LinearProgress
                                          variant="determinate"
                                          value={lesson.progress}
                                          sx={{
                                            height: 4,
                                            borderRadius: 2,
                                            backgroundColor: "#E5FFF7",
                                            [`& .MuiLinearProgress-bar`]: {
                                              backgroundColor: greenColor,
                                            },
                                          }}
                                        />
                                      </Box>
                                    )}
                                  </Box>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                  {lesson.completed && (
                                    <CheckCircleRoundedIcon
                                      sx={{ color: greenColor, fontSize: 20 }}
                                    />
                                  )}
                                  <ArrowForwardRoundedIcon
                                    sx={{ color: "text.secondary", fontSize: 20 }}
                                  />
                                </Box>
                              </Box>
                            ))}
                          </Stack>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </Stack>
              </Box>
            )}

            {tab === "resources" && (
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Course Resources
                </Typography>
                
                {course?.fullData?.resources && course.fullData.resources.length > 0 ? (
                  <Stack spacing={2} sx={{ mt: 3 }}>
                    {course.fullData.resources.map((resource, index) => (
                      <Card
                        key={resource._id || index}
                        sx={{
                          borderRadius: 2,
                          boxShadow: "0px 2px 8px rgba(0,0,0,0.06)",
                          "&:hover": {
                            boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box
                            display="flex"
                            alignItems="flex-start"
                            justifyContent="space-between"
                            gap={2}
                          >
                            {/* Left Side - Icon and Info */}
                            <Box display="flex" gap={2} flex={1}>
                              <Box
                                sx={{
                                  bgcolor: "#F1FBF8",
                                  borderRadius: 2,
                                  p: 1.5,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  minWidth: 48,
                                  height: 48,
                                }}
                              >
                                <DescriptionOutlinedIcon
                                  sx={{ fontSize: 28, color: greenColor }}
                                />
                              </Box>
                              
                              <Box flex={1}>
                                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                  {resource.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mb: 1.5 }}
                                >
                                  {resource.description || "No description available"}
                                </Typography>
                                
                                {/* File Details */}
                                <Box display="flex" gap={1} flexWrap="wrap">
                                  {resource.fileType && (
                                    <Chip
                                      label={resource.fileType}
                                      size="small"
                                      sx={{
                                        bgcolor: "#F3F4F6",
                                        color: "#374151",
                                        fontWeight: 500,
                                        fontSize: "0.75rem",
                                      }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            </Box>
                            
                            {/* Right Side - Download Button */}
                            <Button
                              variant="contained"
                              startIcon={<DownloadRoundedIcon />}
                              href={resource.fileUrl}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                bgcolor: greenColor,
                                textTransform: "none",
                                px: 3,
                                "&:hover": {
                                  bgcolor: greenColor,
                                  opacity: 0.9,
                                },
                              }}
                            >
                              Download
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 6,
                      px: 3,
                    }}
                  >
                    <DescriptionOutlinedIcon
                      sx={{ fontSize: 64, color: "text.secondary", mb: 2, opacity: 0.5 }}
                    />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Resources Available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Additional resources and materials will be available here.
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {tab === "reviews" && (
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                  Course Reviews
                </Typography>

                {loadingReviews ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : reviews.length === 0 ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      textAlign: "center",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                    }}
                  >
                    <StarRoundedIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Reviews Yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Be the first to review this course!
                    </Typography>
                  </Paper>
                ) : (
                  <Stack spacing={2}>
                    {reviews.map((review, index) => (
                      <Paper
                        key={review._id || index}
                        elevation={0}
                        sx={{
                          p: 3,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 2,
                        }}
                      >
                        <Stack spacing={2}>
                          {/* User Info and Rating */}
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar
                              sx={{
                                bgcolor: greenColor,
                                width: 48,
                                height: 48,
                                fontSize: "1.2rem",
                                fontWeight: 600,
                              }}
                            >
                              {(review.fullName || review.userId?.fullName || "U")?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {review.fullName || review.userId?.fullName || "Anonymous User"}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                <Rating
                                  value={review.rating || 0}
                                  readOnly
                                  precision={0.5}
                                  size="small"
                                  icon={<StarRoundedIcon sx={{ color: "#F59E0B" }} />}
                                  emptyIcon={<StarRoundedIcon sx={{ color: "action.disabled" }} />}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {review.createdAt
                                    ? new Date(review.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })
                                    : ""}
                                </Typography>
                              </Stack>
                            </Box>
                          </Stack>

                          {/* Feedback Text */}
                          {review.feedback && (
                            <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.7 }}>
                              {review.feedback}
                            </Typography>
                          )}

                          {/* Uploaded Image */}
                          {review.fileUrl && (
                            <Box
                              sx={{
                                mt: 1,
                                borderRadius: 1.5,
                                overflow: "hidden",
                                border: "1px solid",
                                borderColor: "divider",
                                maxWidth: 400,
                              }}
                            >
                              <Box
                                component="img"
                                src={review.fileUrl}
                                alt="Review attachment"
                                sx={{
                                  width: "100%",
                                  height: "auto",
                                  display: "block",
                                  cursor: "pointer",
                                  "&:hover": { opacity: 0.9 },
                                }}
                                onClick={() => window.open(review.fileUrl, "_blank")}
                              />
                            </Box>
                          )}

                          {index < reviews.length - 1 && <Divider sx={{ mt: 1 }} />}
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>
            )}

            {tab === "overview" && (
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Course Overview
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 3 }}>
                  {course.desc}
                </Typography>

                {/* Course Details */}
                {course?.fullData && (
                  <Box sx={{ mt: 3 }}>
                    <Stack spacing={2}>
                      {course.fullData.courseLevel && (
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            Course Level
                          </Typography>
                          <Chip
                            label={course.fullData.courseLevel}
                            size="small"
                            sx={{
                              bgcolor: "#E8F5E9",
                              color: "#2E7D32",
                              fontWeight: 500,
                            }}
                          />
                        </Box>
                      )}

                      {course.fullData.category && (
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            Category
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {course.fullData.category}
                          </Typography>
                        </Box>
                      )}

                      {course.fullData.instructor && (
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            Instructor
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {course.fullData.instructor}
                          </Typography>
                        </Box>
                      )}

                      {course.fullData.skills && course.fullData.skills.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            Skills You&apos;ll Learn
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                            {course.fullData.skills.map((skill, index) => (
                              <Chip
                                key={index}
                                label={skill}
                                size="small"
                                sx={{
                                  bgcolor: "#F3F4F6",
                                  color: "#374151",
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}

                      {course.fullData.faqs && course.fullData.faqs.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            Frequently Asked Questions
                          </Typography>
                          <Stack spacing={2} sx={{ mt: 2 }}>
                            {course.fullData.faqs.map((faq, index) => (
                              <Box
                                key={faq._id || index}
                                sx={{
                                  p: 2,
                                  bgcolor: "#F9FAFB",
                                  borderRadius: 2,
                                }}
                              >
                                <Typography variant="body2" fontWeight={600} gutterBottom>
                                  {faq.question}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {faq.answer}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Card>
      </Stack>

      <Dialog
        open={Boolean(selectedLesson)}
        onClose={closeLessonDialog}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: { borderRadius: 3, overflow: "hidden" },
        }}
      >
        {selectedLesson && (
          <>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {selectedLesson.sectionTitle}
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {selectedLesson.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedLesson.duration} · {selectedLesson.type}
                </Typography>
              </Box>
              <IconButton onClick={closeLessonDialog}>
                <CloseRoundedIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
              {selectedLesson.type === "Video" ? (
                selectedLesson.videoUrl ? (
                  <Box sx={{ position: "relative", bgcolor: "#000" }}>
                    {/* No poster (was course PNG — looked like a static image). No crossOrigin — avoids GCS CORS blocking playback from localhost */}
                    <LessonVideoPlayer
                      key={`${selectedLesson.id}-${selectedLesson.videoUrl}-${selectedLesson.videoType}`}
                      url={selectedLesson.videoUrl}
                      videoType={selectedLesson.videoType || "mp4"}
                      transcodingStatus={selectedLesson.transcodingStatus}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1,
                      }}
                    >
                      <Box
                        sx={{
                          height: 4,
                          bgcolor: "rgba(255, 255, 255, 0.3)",
                        }}
                      >
                        <Box
                          sx={{
                            height: "100%",
                            width: `${selectedLessonProgress.progressPercent}%`,
                            bgcolor: greenColor,
                            transition: "width 0.3s ease",
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 8,
                          right: 8,
                          bgcolor: "rgba(0, 0, 0, 0.7)",
                          color: "white",
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: "0.875rem",
                          fontWeight: 600,
                        }}
                      >
                        {selectedLessonProgress.progressPercent}%
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ p: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      No video is attached to this lesson yet.
                    </Typography>
                  </Box>
                )
              ) : (
                <Box sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Ready for the quiz?
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    This interactive quiz helps reinforce the concepts from this module. You&apos;ll need at
                    least 70% to unlock the next section.
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{ mt: 2, textTransform: "none", bgcolor: greenColor, ":hover": { bgcolor: greenColor } }}
                  >
                    Start Quiz
                  </Button>
                </Box>
              )}
              <Box sx={{ p: { xs: 2, md: 3 } }}>
                {selectedLesson.type === "Video" && selectedLesson.videoUrl && (
                  <Box
                    sx={{
                      mb: 2,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "#F9FAFB",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" fontWeight={600}>
                        Live Progress
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color={greenColor}>
                        {selectedLessonProgress.progressPercent}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={selectedLessonProgress.progressPercent}
                      sx={{
                        height: 8,
                        borderRadius: 5,
                        backgroundColor: "#E5FFF7",
                        [`& .MuiLinearProgress-bar`]: {
                          backgroundColor: greenColor,
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                      Progress updates instantly while the video plays. Already watched seconds are
                      preserved and only new watched time is added.
                    </Typography>
                  </Box>
                )}
                {selectedLesson.summary && (
                  <>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Learning Outcomes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedLesson.summary}
                    </Typography>
                  </>
                )}
                {selectedLesson.objectives && selectedLesson.objectives.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Skills Covered
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                      {selectedLesson.objectives.map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          size="small"
                          sx={{
                            bgcolor: "#E8F5E9",
                            color: "#2E7D32",
                            fontWeight: 500,
                          }}
                        />
                      ))}
                    </Box>
                  </>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, bgcolor: "#F9FAFB", display: "flex", justifyContent: "space-between" }}>
              <Box>
                {previousLesson && (
                  <Button
                    onClick={handlePreviousLesson}
                    startIcon={<ArrowBackRoundedIcon />}
                    sx={{ textTransform: "none", mr: 1 }}
                  >
                    Previous
                  </Button>
                )}
              </Box>
              <Box display="flex" gap={1}>
                <Button onClick={closeLessonDialog} sx={{ textTransform: "none" }}>
                  Close
                </Button>
                {nextLesson ? (
                  <Button
                    variant="contained"
                    onClick={handleNextLesson}
                    sx={{ textTransform: "none", bgcolor: greenColor, ":hover": { bgcolor: greenColor } }}
                    endIcon={<ArrowForwardRoundedIcon />}
                  >
                    Next Lesson
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    disabled
                    sx={{ textTransform: "none", bgcolor: greenColor }}
                    endIcon={<CheckCircleRoundedIcon />}
                  >
                    Course Complete
                  </Button>
                )}
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default CourseLearningPage;
