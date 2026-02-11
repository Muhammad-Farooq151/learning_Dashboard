"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
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
import { useRouter } from "next/navigation";
import { greenColor } from "@/components/utils/Colors";
import Link from "next/link";
import { getJSON, postJSON } from "@/utils/http";
import { getStoredUserId } from "@/utils/authStorage";

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

// Helper function to format duration as HH:MM:SS
const formatDurationTime = (seconds) => {
  if (!seconds) return "00:00";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

function CourseLearningPage({ courseId, course }) {
  const router = useRouter();
  const [tab, setTab] = useState("course-material");
  const [expandedSections, setExpandedSections] = useState({ 0: true });
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonProgress, setLessonProgress] = useState({}); // { lessonId: { watched: seconds, completed: boolean } }
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  
  // Initialize currentVideoTime when lesson is selected
  useEffect(() => {
    if (selectedLesson?.id && lessonProgress[selectedLesson.id]) {
      setCurrentVideoTime(lessonProgress[selectedLesson.id].watched || 0);
    } else if (selectedLesson) {
      setCurrentVideoTime(0);
    }
  }, [selectedLesson?.id, lessonProgress]);

  // Load progress from database on mount
  useEffect(() => {
    const loadProgress = async () => {
      if (!courseId) return;
      
      const userId = getStoredUserId();
      if (!userId) return;

      try {
        const response = await getJSON(`progress/${courseId}?userId=${userId}`);
        if (response?.success && response.data) {
          const progressData = response.data;
          // Convert progress data to lessonProgress format
          const progressMap = {};
          if (progressData.lessons && Array.isArray(progressData.lessons)) {
            progressData.lessons.forEach((lesson) => {
              // Convert lessonId to string for consistent matching
              const lessonIdStr = lesson.lessonId?.toString() || lesson.lessonId;
              progressMap[lessonIdStr] = {
                watched: lesson.watched || 0,
                completed: lesson.completed || false,
              };
            });
          }
          setLessonProgress(progressMap);
        }
      } catch (error) {
        console.error("Error loading progress from database:", error);
        // Fallback to localStorage if API fails
        const savedProgress = localStorage.getItem(`course_progress_${courseId}`);
        if (savedProgress) {
          try {
            setLessonProgress(JSON.parse(savedProgress));
          } catch (e) {
            console.error("Error loading progress from localStorage:", e);
          }
        }
      }
    };

    loadProgress();
  }, [courseId]);

  // Save progress to database (helper function)
  const saveProgressToDB = async (lessonId, watched, completed) => {
    const userId = getStoredUserId();
    if (!userId || !courseId || !lessonId) return;

    try {
      await postJSON('progress/update', {
        userId,
        courseId,
        lessonId,
        watched,
        completed,
      });
    } catch (error) {
      console.error("Error saving progress to database:", error);
      // Fallback: save to localStorage
      setLessonProgress((prev) => {
        const newProgress = {
          ...prev,
          [lessonId]: { watched, completed },
        };
        localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(newProgress));
        return newProgress;
      });
    }
  };

  // Transform API lessons data into curriculum format
  const curriculum = useMemo(() => {
    if (!course?.fullData?.lessons || !Array.isArray(course.fullData.lessons)) {
      return { sections: [] };
    }

    // Group lessons into a single section (or you can group by category if needed)
    const lessons = course.fullData.lessons.map((lesson, index) => {
      // Convert lessonId to string for consistent matching with progress data
      const lessonId = lesson._id ? lesson._id.toString() : index.toString();
      const progress = lessonProgress[lessonId] || { watched: 0, completed: false };
      const progressPercent = lesson.duration > 0 
        ? Math.min(100, Math.round((progress.watched / lesson.duration) * 100))
        : 0;
      
      return {
        id: lessonId,
        title: lesson.lessonName || `Lesson ${index + 1}`,
        duration: formatDuration(lesson.duration),
        durationSeconds: lesson.duration || 0,
        type: lesson.videoUrl ? "Video" : "Quiz",
        completed: progress.completed || progressPercent >= 90, // Mark as completed if 90%+ watched
        progress: progressPercent,
        watched: progress.watched,
        summary: lesson.learningOutcomes || "",
        objectives: lesson.skills || [],
        videoUrl: lesson.videoUrl || null,
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
  }, [course, lessonProgress]);

  const totalLessons = useMemo(
    () => curriculum.sections.reduce((sum, section) => sum + section.lessons.length, 0),
    [curriculum]
  );

  const totalMinutes = useMemo(
    () => curriculum.sections.reduce((sum, section) => sum + section.totalMinutes, 0),
    [curriculum]
  );

  // Calculate overall course progress - use database completed flag as source of truth
  const courseProgress = useMemo(() => {
    if (!curriculum.sections.length || !totalLessons) return 0;
    const allLessons = curriculum.sections.flatMap((s) => s.lessons);
    // Only count lessons where completed flag is true in database (not just 90% watched)
    const completedLessons = allLessons.filter((l) => {
      // Ensure lessonId is string for matching
      const lessonId = l.id?.toString() || l.id;
      const progress = lessonProgress[lessonId];
      // Use database completed flag as source of truth
      return progress?.completed === true;
    }).length;
    return Math.round((completedLessons / totalLessons) * 100);
  }, [curriculum, totalLessons, lessonProgress]);

  // Video ref for tracking
  const videoRef = useRef(null);

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

  const closeLessonDialog = () => setSelectedLesson(null);

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

  // Video event handlers
  useEffect(() => {
    if (!selectedLesson) {
      setCurrentVideoTime(0);
      return;
    }

    let lastSavedTime = 0;
    let lastSavedToDB = 0; // Track last time saved to database
    let saveInterval = null;
    let updateInterval = null;
    let saveTimeout = null; // Debounce timer for database saves

    // Wait a bit for video element to mount
    const setupTracking = () => {
      const video = videoRef.current;
      if (!video) {
        console.warn("Video element not found, retrying...");
        setTimeout(setupTracking, 100);
        return;
      }

      console.log("Setting up video tracking for lesson:", selectedLesson.id);

      // Reset currentVideoTime when lesson changes
      if (selectedLesson.id && lessonProgress[selectedLesson.id]) {
        const savedTime = lessonProgress[selectedLesson.id].watched || 0;
        setCurrentVideoTime(savedTime);
      } else {
        setCurrentVideoTime(0);
      }

      const handleTimeUpdate = () => {
        if (!video) return;
        const currentTime = video.currentTime || 0;
        const timeInSeconds = Math.floor(currentTime);
        
        // Get saved progress for this lesson
        const savedProgress = lessonProgress[selectedLesson.id];
        const savedWatched = savedProgress?.watched || 0;
        
        // Only update if current time is greater than saved time (user is progressing forward)
        // Or if video is already complete, keep it at 100%
        if (selectedLesson.id) {
          const totalDuration = selectedLesson.durationSeconds || 0;
          
          // If video is already complete, keep it at 100%
          if (savedProgress?.completed && totalDuration > 0) {
            const finalTime = totalDuration;
            setCurrentVideoTime(finalTime);
            return; // Don't update progress if already complete
          }
          
          // Only update if user is watching forward (not seeking backward)
          if (timeInSeconds >= savedWatched) {
            setCurrentVideoTime(timeInSeconds);
            
            const isCompleted = totalDuration > 0 && (timeInSeconds >= totalDuration * 0.9 || timeInSeconds >= totalDuration - 1);
            
            // Update local state (UI only, fast operation)
            setLessonProgress((prev) => {
              const newProgress = {
                ...prev,
                [selectedLesson.id]: { watched: timeInSeconds, completed: isCompleted },
              };
              // Save to localStorage immediately (fast, no API call)
              localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(newProgress));
              return newProgress;
            });
            
            // Debounced save to database (only after 10 seconds of inactivity)
            debouncedSave(timeInSeconds);
          } else {
            // If user seeks backward, still update display but don't decrease saved progress
            setCurrentVideoTime(timeInSeconds);
          }
        } else {
          setCurrentVideoTime(timeInSeconds);
        }
      };

      const handlePlay = () => {
        if (video) {
          const currentTime = video.currentTime || 0;
          setCurrentVideoTime(Math.floor(currentTime));
        }
      };

      // Save to database with intelligent throttling (only when significant progress or pause)
      const saveProgressToDatabase = async (timeInSeconds, forceSave = false) => {
        if (selectedLesson.id && video) {
          const savedProgress = lessonProgress[selectedLesson.id];
          const savedWatched = savedProgress?.watched || 0;
          
          // CRITICAL: If already complete (100%), NEVER make API call
          if (savedProgress?.completed) {
            console.log("Lesson already 100% complete, skipping API call");
            return;
          }
          
          const totalDuration = selectedLesson.durationSeconds || 0;
          
          // Also check if current time indicates completion
          const isCurrentlyCompleted = totalDuration > 0 && timeInSeconds >= totalDuration * 0.9;
          
          // If we're about to mark as complete, allow this one final save
          // But after that, no more API calls
          if (isCurrentlyCompleted && savedProgress?.completed) {
            console.log("Lesson already marked as complete, skipping API call");
            return;
          }
          
          // Only save if:
          // 1. Progressing forward (timeInSeconds >= savedWatched)
          // 2. Significant change (at least 5 seconds difference from last saved)
          // 3. Or forced save (like on pause/end) - but only if not already complete
          const significantChange = Math.abs(timeInSeconds - lastSavedToDB) >= 5;
          const isProgressingForward = timeInSeconds >= savedWatched;
          
          if (forceSave || (isProgressingForward && significantChange)) {
            // Final check: don't save if already complete
            if (savedProgress?.completed) {
              console.log("Lesson already complete, skipping API call");
              return;
            }
            
            lastSavedToDB = timeInSeconds;
            const isCompleted = totalDuration > 0 && timeInSeconds >= totalDuration * 0.9;
            
            const userId = getStoredUserId();
            if (!userId || !courseId) return;

            // Update local state immediately
            setLessonProgress((prev) => {
              const newProgress = {
                ...prev,
                [selectedLesson.id]: { watched: timeInSeconds, completed: isCompleted },
              };
              // Also save to localStorage as backup (this is fast, no API call)
              localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(newProgress));
              return newProgress;
            });

            // Save to database (throttled) - only if not already complete
            if (!savedProgress?.completed) {
              try {
                await postJSON('progress/update', {
                  userId,
                  courseId,
                  lessonId: selectedLesson.id,
                  watched: timeInSeconds,
                  completed: isCompleted,
                });
                console.log("Progress saved to database:", { timeInSeconds, isCompleted });
              } catch (error) {
                console.error("Error saving progress to database:", error);
              }
            } else {
              console.log("Skipping API call - lesson already complete");
            }
          }
        }
      };

      // Debounced save function (only saves after user stops watching for 10 seconds)
      const debouncedSave = (timeInSeconds) => {
        // Don't set up debounced save if already complete
        const savedProgress = lessonProgress[selectedLesson.id];
        if (savedProgress?.completed) {
          return; // Skip debounced save if already complete
        }
        
        if (saveTimeout) {
          clearTimeout(saveTimeout);
        }
        saveTimeout = setTimeout(() => {
          // Double check before saving
          const currentProgress = lessonProgress[selectedLesson.id];
          if (!currentProgress?.completed) {
            saveProgressToDatabase(timeInSeconds, false);
          }
        }, 10000); // Save 10 seconds after user stops watching
      };

      const handleEnded = async () => {
        if (selectedLesson.id) {
          const totalDuration = selectedLesson.durationSeconds || 0;
          setCurrentVideoTime(totalDuration);
          
          // Force save on video end
          await saveProgressToDatabase(totalDuration, true);
        }
      };

      const handlePause = () => {
        // Save when user pauses video (only if not already complete)
        if (selectedLesson.id && video) {
          const savedProgress = lessonProgress[selectedLesson.id];
          if (savedProgress?.completed) {
            return; // Skip save on pause if already complete
          }
          
          const currentTime = video.currentTime || 0;
          const timeInSeconds = Math.floor(currentTime);
          saveProgressToDatabase(timeInSeconds, true);
        }
      };

      const handleLoadedMetadata = () => {
        if (selectedLesson.id && lessonProgress[selectedLesson.id]) {
          const savedProgress = lessonProgress[selectedLesson.id];
          const savedTime = savedProgress.watched || 0;
          const totalDuration = selectedLesson.durationSeconds || 0;
          
          // If video is already complete, set to end
          if (savedProgress.completed && totalDuration > 0) {
            video.currentTime = totalDuration;
            setCurrentVideoTime(totalDuration);
          } else if (savedTime > 5) {
            // Restore saved position if more than 5 seconds watched
            video.currentTime = savedTime;
            setCurrentVideoTime(savedTime);
          }
        }
      };

      // Add event listeners
      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("play", handlePlay);
      video.addEventListener("playing", handlePlay);
      video.addEventListener("ended", handleEnded);
      video.addEventListener("pause", handlePause); // Save on pause
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      
      // Save progress every 30 seconds (reduced from 3 seconds to minimize API calls)
      saveInterval = setInterval(() => {
        if (video && !video.paused && selectedLesson.id) {
          // Check if already complete before saving
          const savedProgress = lessonProgress[selectedLesson.id];
          if (savedProgress?.completed) {
            return; // Skip interval save if already complete
          }
          
          const currentTime = video.currentTime || 0;
          const timeInSeconds = Math.floor(currentTime);
          saveProgressToDatabase(timeInSeconds, false);
        }
      }, 30000); // 30 seconds instead of 3 seconds
      
      // Also set up interval to update currentVideoTime as fallback (UI only, no API calls)
      updateInterval = setInterval(() => {
        if (video && !video.paused) {
          const currentTime = video.currentTime || 0;
          const timeInSeconds = Math.floor(currentTime);
          
          if (selectedLesson.id) {
            const savedProgress = lessonProgress[selectedLesson.id];
            const savedWatched = savedProgress?.watched || 0;
            const totalDuration = selectedLesson.durationSeconds || 0;
            
            // If already complete, keep at 100%
            if (savedProgress?.completed && totalDuration > 0) {
              setCurrentVideoTime(totalDuration);
              return;
            }
            
            // Only update if progressing forward
            if (timeInSeconds >= savedWatched) {
              setCurrentVideoTime(timeInSeconds);
              
              // Update local state only (no API call)
              setLessonProgress((prev) => {
                const newProgress = {
                  ...prev,
                  [selectedLesson.id]: { 
                    watched: timeInSeconds, 
                    completed: prev[selectedLesson.id]?.completed || false 
                  },
                };
                // Save to localStorage (fast, no API call)
                localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(newProgress));
                return newProgress;
              });
            } else {
              // Still update display even if seeking backward
              setCurrentVideoTime(timeInSeconds);
            }
          } else {
            setCurrentVideoTime(timeInSeconds);
          }
        }
      }, 1000); // Reduced frequency from 500ms to 1000ms (1 second)

      // Return cleanup function
      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("playing", handlePlay);
        video.removeEventListener("ended", handleEnded);
        video.removeEventListener("pause", handlePause);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        if (saveInterval) clearInterval(saveInterval);
        if (updateInterval) clearInterval(updateInterval);
        if (saveTimeout) clearTimeout(saveTimeout);
        
        // Final save on cleanup (when user closes video or switches lesson)
        if (selectedLesson.id && video && !video.paused) {
          const savedProgress = lessonProgress[selectedLesson.id];
          // Only save on cleanup if not already complete
          if (!savedProgress?.completed) {
            const currentTime = video.currentTime || 0;
            const timeInSeconds = Math.floor(currentTime);
            saveProgressToDatabase(timeInSeconds, true);
          }
        }
      };
    };

    const timeoutId = setTimeout(setupTracking, 100);
    let cleanupFn = null;

    const checkVideo = setInterval(() => {
      if (videoRef.current && !cleanupFn) {
        cleanupFn = setupTracking();
        clearInterval(checkVideo);
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(checkVideo);
      if (cleanupFn) cleanupFn();
    };
  }, [selectedLesson?.id, courseId, lessonProgress]);

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
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh" }}>
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
          <Tabs
            value={tab}
            onChange={(e, v) => setTab(v)}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              px: { xs: 2, md: 3 },
            }}
          >
            <Tab label="Course Material" value="course-material" />
            <Tab label="Resources" value="resources" />
            <Tab label="Reviews" value="reviews" />
            <Tab label="Overview" value="overview" />
          </Tabs>

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
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Course Reviews
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Reviews and ratings will be displayed here.
                </Typography>
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
                <Box sx={{ position: "relative" }}>
                  <video
                    ref={videoRef}
                    src={selectedLesson.videoUrl}
                    controls
                    poster={course?.img || "/images/reactc.png"}
                    style={{ width: "100%", backgroundColor: "black", display: "block" }}
                  />
                  {/* Progress Bar Overlay with Percentage */}
                  {(() => {
                    const totalDuration = selectedLesson.durationSeconds || 0;
                    let progressPercent = 0;
                    
                    if (totalDuration > 0) {
                      progressPercent = Math.min(100, Math.round((currentVideoTime / totalDuration) * 100));
                      if (videoRef.current && (videoRef.current.ended || currentVideoTime >= totalDuration - 0.5)) {
                        progressPercent = 100;
                      }
                    }
                    
                    return (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          zIndex: 1,
                        }}
                      >
                        {/* Progress Bar */}
                        <Box
                          sx={{
                            height: 4,
                            bgcolor: "rgba(255, 255, 255, 0.3)",
                          }}
                        >
                          <Box
                            sx={{
                              height: "100%",
                              width: `${progressPercent}%`,
                              bgcolor: greenColor,
                              transition: "width 0.3s ease",
                            }}
                          />
                        </Box>
                        {/* Percentage Display */}
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
                          {progressPercent}%
                        </Box>
                      </Box>
                    );
                  })()}
                </Box>
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
