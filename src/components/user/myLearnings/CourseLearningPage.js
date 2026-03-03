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
import { useRouter } from "next/navigation";
import { greenColor } from "@/components/utils/Colors";
import Link from "next/link";
import { getJSON, postJSON } from "@/utils/http";
import { getStoredUserId } from "@/utils/authStorage";
import { connectSocket, disconnectSocket, getSocket } from "@/utils/socket";

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
  const [lessonProgress, setLessonProgress] = useState({}); // { lessonId: { watched: seconds, watchedSeconds: number, completed: boolean, watchedRanges: [] } }
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [socket, setSocket] = useState(null);
  const [progressUpdateTrigger, setProgressUpdateTrigger] = useState(0); // Force re-render for progress
  
  // SCORM-style watched segments tracking (Set of watched seconds)
  const watchedSegmentsRef = useRef(new Map()); // { lessonId: Set<seconds> }
  const lastTimeRef = useRef(new Map()); // { lessonId: lastTime } for skip detection
  
  // Initialize Socket.io connection
  useEffect(() => {
    const socketInstance = connectSocket();
    setSocket(socketInstance);

    console.log('[Socket.io] Initializing connection...');

    socketInstance.on('connect', () => {
      console.log('[Socket.io] ✅ Connected to server');
    });

    socketInstance.on('disconnect', () => {
      console.log('[Socket.io] ❌ Disconnected from server');
    });

    // Save progress before page unload/reload
    const handleBeforeUnload = () => {
      if (selectedLesson?.id && socketInstance && socketInstance.connected && videoRef.current) {
        const video = videoRef.current;
        const currentTime = video.currentTime || 0;
        const totalDuration = selectedLesson.durationSeconds || 0;
        
        console.log('[Socket.io] Saving progress before page unload:', {
          lessonId: selectedLesson.id,
          currentTime: Math.floor(currentTime),
        });
        
        socketInstance.emit('video:progress', {
          courseId,
          lessonId: selectedLesson.id,
          currentTime: Math.floor(currentTime),
          videoDuration: totalDuration,
          isPlaying: false, // Pause to trigger immediate save
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    // Handle socket events - REAL progress from watchedRanges
    socketInstance.on('video:progress:saved', (data) => {
      console.log('[Socket.io] ✅ Progress saved with ranges:', {
        lessonId: data.lessonId,
        watched: data.watched,
        watchedSeconds: data.watchedSeconds,
        completed: data.completed,
        progressPercent: data.progressPercent,
      });
      
      // Update for any lesson (not just selectedLesson) to handle multiple lessons
      if (data.lessonId) {
        // Use resumeTime if available (from watchedRanges), otherwise use watched
        const resumeTime = data.resumeTime !== undefined ? data.resumeTime : (data.watched || 0);
        
        // Restore watched segments from server response if available
        // This ensures segments are synced with server (SCORM-style)
        if (data.watchedRanges && Array.isArray(data.watchedRanges)) {
          const watchedSegments = new Set();
          data.watchedRanges.forEach(range => {
            for (let i = Math.floor(range.start); i <= Math.floor(range.end); i++) {
              watchedSegments.add(i);
            }
          });
          watchedSegmentsRef.current.set(data.lessonId, watchedSegments);
        }
        
        setLessonProgress((prev) => {
          const updated = {
            ...prev,
            [data.lessonId]: {
              watched: resumeTime, // Resume position
              watchedSeconds: data.watchedSeconds || 0, // REAL progress from ranges
              completed: data.completed || false,
              resumeTime: resumeTime,
              watchedRanges: data.watchedRanges || prev[data.lessonId]?.watchedRanges || [],
            },
          };
          
          // Also update localStorage as backup
          if (courseId) {
            localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(updated));
          }
          
          // If this is the currently selected lesson, update UI
          if (selectedLesson?.id === data.lessonId) {
            setCurrentVideoTime(resumeTime);
            // Force re-render of progress bar
            setProgressUpdateTrigger((prev) => prev + 1);
          }
          
          return updated;
        });
      }
    });

    socketInstance.on('video:progress:warning', (data) => {
      console.warn('[Socket.io] ⚠️ Progress warning:', data);
    });

    socketInstance.on('video:progress:error', (error) => {
      console.error('[Socket.io] ❌ Progress error:', error);
    });

    socketInstance.on('video:ended:saved', (data) => {
      console.log('[Socket.io] ✅ Video ended saved:', data);
      if (selectedLesson?.id && data.success) {
        setLessonProgress((prev) => ({
          ...prev,
          [selectedLesson.id]: {
            watched: selectedLesson.durationSeconds || 0,
            completed: true,
          },
        }));
      }
    });

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      console.log('[Socket.io] Cleaning up connection...');
      disconnectSocket();
    };
  }, [selectedLesson?.id, courseId]);

  // Initialize currentVideoTime when lesson is selected - reload from database
  useEffect(() => {
    if (selectedLesson?.id) {
      // Reload progress from database when lesson is selected to get latest data
      const loadLessonProgress = async () => {
        const userId = getStoredUserId();
        if (userId && courseId) {
          try {
            const response = await getJSON(`progress/${courseId}?userId=${userId}`);
            if (response?.success && response.data?.lessons) {
              const lessonProgressData = response.data.lessons.find(
                l => l.lessonId?.toString() === selectedLesson.id
              );
              
              if (lessonProgressData) {
                const savedTime = lessonProgressData.watched || 0;
                const watchedRanges = lessonProgressData.watchedRanges || [];
                
                // Restore watched segments from watchedRanges (SCORM-style)
                const watchedSegments = new Set();
                watchedRanges.forEach(range => {
                  for (let i = Math.floor(range.start); i <= Math.floor(range.end); i++) {
                    watchedSegments.add(i);
                  }
                });
                watchedSegmentsRef.current.set(selectedLesson.id, watchedSegments);
                lastTimeRef.current.set(selectedLesson.id, savedTime);
                
                setCurrentVideoTime(savedTime);
                
                // Update lessonProgress state with latest data
                setLessonProgress((prev) => ({
                  ...prev,
                  [selectedLesson.id]: {
                    watched: savedTime,
                    watchedSeconds: lessonProgressData.watchedSeconds || 0,
                    completed: lessonProgressData.completed || false,
                    watchedRanges: watchedRanges,
                  },
                }));
                
                console.log('[Progress] Loaded and initialized video time and segments for lesson:', {
                  lessonId: selectedLesson.id,
                  savedTime,
                  completed: lessonProgressData.completed,
                  watchedSegmentsCount: watchedSegments.size,
                  watchedRangesCount: watchedRanges.length,
                });
              } else {
                setCurrentVideoTime(0);
                // Initialize empty segments for new lesson
                watchedSegmentsRef.current.set(selectedLesson.id, new Set());
                lastTimeRef.current.set(selectedLesson.id, 0);
              }
            }
          } catch (error) {
            console.error('[Progress] Error loading lesson progress:', error);
            // Fallback to existing progress
            const savedProgress = lessonProgress[selectedLesson.id];
            if (savedProgress) {
              setCurrentVideoTime(savedProgress.watched || 0);
            } else {
              setCurrentVideoTime(0);
            }
          }
        } else {
          // Fallback to existing progress
          const savedProgress = lessonProgress[selectedLesson.id];
          if (savedProgress) {
            setCurrentVideoTime(savedProgress.watched || 0);
          } else {
            setCurrentVideoTime(0);
          }
        }
      };
      
      loadLessonProgress();
    } else {
      setCurrentVideoTime(0);
    }
  }, [selectedLesson?.id, courseId]); // Removed lessonProgress from dependencies to avoid loops

  // Force progress bar update when currentVideoTime changes
  useEffect(() => {
    if (selectedLesson?.id && currentVideoTime >= 0) {
      setProgressUpdateTrigger((prev) => prev + 1);
    }
  }, [currentVideoTime, selectedLesson?.id]);

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
              
              // Use resumeTime if available (from watchedRanges), otherwise use watched
              const resumeTime = lesson.resumeTime !== undefined ? lesson.resumeTime : (lesson.watched || 0);
              
              // Calculate watchedSeconds from watchedRanges if available
              const watchedSeconds = lesson.watchedSeconds || 0;
              const watchedRanges = lesson.watchedRanges || [];
              
              // Restore watched segments from watchedRanges (SCORM-style)
              const watchedSegments = new Set();
              watchedRanges.forEach(range => {
                for (let i = Math.floor(range.start); i <= Math.floor(range.end); i++) {
                  watchedSegments.add(i);
                }
              });
              watchedSegmentsRef.current.set(lessonIdStr, watchedSegments);
              
              progressMap[lessonIdStr] = {
                watched: resumeTime, // Use resumeTime for resume position
                watchedSeconds: watchedSeconds,
                completed: lesson.completed || false,
                resumeTime: resumeTime,
                watchedRanges: watchedRanges, // Store ranges for reference
              };
            });
          }
          setLessonProgress(progressMap);
          console.log('[Progress] Loaded from database with ranges:', progressMap);
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

  // Note: Progress saving is now handled via Socket.io in the video tracking useEffect
  // No need for direct API calls anymore

  // Transform API lessons data into curriculum format
  const curriculum = useMemo(() => {
    if (!course?.fullData?.lessons || !Array.isArray(course.fullData.lessons)) {
      return { sections: [] };
    }

    // Group lessons into a single section (or you can group by category if needed)
    const lessons = course.fullData.lessons.map((lesson, index) => {
      // Convert lessonId to string for consistent matching with progress data
      const lessonId = lesson._id ? lesson._id.toString() : index.toString();
      const progress = lessonProgress[lessonId] || { watched: 0, watchedSeconds: 0, completed: false };
      const lessonDuration = lesson.duration || 0;
      
      // Calculate progress percentage from watchedSeconds (actual watched time from ranges)
      // NOT from currentTime (which can be faked by dragging)
      // IMPORTANT: Use watchedSeconds, not completed flag alone (prevents fake 100%)
      let progressPercent = 0;
      if (lessonDuration > 0) {
        const watchedSeconds = progress.watchedSeconds || 0;
        
        // Calculate from watchedSeconds (REAL progress from ranges)
        progressPercent = Math.min(100, Math.round((watchedSeconds / lessonDuration) * 100));
        
        // Only show 100% if actually watched 90%+ AND completed flag is true
        // This prevents showing 100% when only completed flag is set but not enough watched
        if (progress.completed && watchedSeconds >= lessonDuration * 0.9) {
          progressPercent = 100;
        } else if (progress.completed && watchedSeconds < lessonDuration * 0.9) {
          // If completed flag is true but not enough watched, use actual progress
          // Don't force 100% - use calculated progressPercent
        }
      }
      
      return {
        id: lessonId,
        title: lesson.lessonName || `Lesson ${index + 1}`,
        duration: formatDuration(lessonDuration),
        durationSeconds: lessonDuration,
        type: lesson.videoUrl ? "Video" : "Quiz",
        completed: progress.completed || progressPercent >= 90,
        progress: progressPercent,
        watched: progress.watched || 0, // Resume position
        watchedSeconds: progress.watchedSeconds || 0, // Actual watched time from ranges
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

  const closeLessonDialog = async () => {
    // SCORM-style: Save progress before closing dialog
    // IMPORTANT: Do NOT reset watchedSegments on close (they persist in ref)
    // This ensures already watched parts are remembered
    if (selectedLesson?.id) {
      const video = videoRef.current;
      let currentTime = 0;
      let timeInSeconds = 0;
      
      // Get current time from video element if available
      if (video && video.readyState >= 2) {
        currentTime = video.currentTime || 0;
        timeInSeconds = Math.floor(currentTime);
      } else {
        // Fallback to state if video not ready
        timeInSeconds = Math.floor(currentVideoTime);
        currentTime = currentVideoTime;
      }
      
      // Get watched segments count (SCORM-style - REAL progress)
      const watchedSegments = watchedSegmentsRef.current.get(selectedLesson.id) || new Set();
      const watchedSecondsCount = watchedSegments.size;
      
      const totalDuration = selectedLesson.durationSeconds || 0;
      // Calculate progress from watched segments (not currentTime - prevents fake progress)
      const progressPercent = totalDuration > 0 
        ? Math.round((watchedSecondsCount / totalDuration) * 100) 
        : 0;
      const isCompleted = progressPercent >= 90 || (lessonProgress[selectedLesson.id]?.completed || false);
      
      console.log('[Dialog Close] Calculating and saving progress (SCORM-style):', {
        lessonId: selectedLesson.id,
        currentTime: currentTime.toFixed(2),
        timeInSeconds,
        watchedSegmentsCount: watchedSecondsCount,
        totalDuration,
        progressPercent,
        isCompleted,
      });
      
      const userId = getStoredUserId();
      if (userId && courseId && selectedLesson.id) {
        // Always save progress, even if timeInSeconds is 0 (might be at start)
        try {
          const response = await postJSON('progress/update', {
            userId,
            courseId,
            lessonId: selectedLesson.id,
            watched: timeInSeconds,
            completed: isCompleted,
          });
          
          console.log('[API] ✅ Progress saved on dialog close:', {
            lessonId: selectedLesson.id,
            watched: timeInSeconds,
            progressPercent,
            isCompleted,
            response: response?.data,
          });
          
          // Update local state with saved progress (SCORM-style)
          // IMPORTANT: watchedSegments persist in ref - NOT reset on close
          setLessonProgress((prev) => {
            const updated = {
              ...prev,
              [selectedLesson.id]: {
                watched: timeInSeconds, // Resume position
                watchedSeconds: watchedSecondsCount, // REAL progress from segments
                completed: isCompleted,
                watchedRanges: prev[selectedLesson.id]?.watchedRanges || [], // Preserve ranges
              },
            };
            if (courseId) {
              localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(updated));
            }
            return updated;
          });
        } catch (error) {
          console.error('[API] ❌ Error saving progress on dialog close:', error);
        }
      }
      
      // Also send via Socket.io for real-time sync - include watched segments
      if (socket && socket.connected) {
        const watchedSegments = watchedSegmentsRef.current.get(selectedLesson.id) || new Set();
        socket.emit('video:progress', {
          courseId,
          lessonId: selectedLesson.id,
          currentTime: timeInSeconds,
          videoDuration: totalDuration,
          isPlaying: false,
          watchedSegments: Array.from(watchedSegments), // Send watched segments (SCORM-style)
          watchedSegmentsCount: watchedSegments.size,
        });
      }
    }
    
    // SCORM-style: Close dialog WITHOUT resetting state
    // watchedSegments persist in ref (like SCORM suspend_data)
    // This ensures already watched parts are remembered on reopen
    setSelectedLesson(null);
    // Note: watchedSegmentsRef and lastTimeRef are NOT cleared - they persist
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

  // Video event handlers with Socket.io
  useEffect(() => {
    if (!selectedLesson || !socket || !socket.connected) {
      if (!selectedLesson) setCurrentVideoTime(0);
      return;
    }

    let progressInterval = null;

    // Wait a bit for video element to mount
    const setupTracking = () => {
      const video = videoRef.current;
      if (!video) {
        console.warn("Video element not found, retrying...");
        setTimeout(setupTracking, 100);
        return;
      }

      console.log("[Socket.io] Setting up video tracking for lesson:", selectedLesson.id);

      // Initialize currentVideoTime (don't set video.currentTime here - let loadedmetadata handle it)
      if (selectedLesson.id && lessonProgress[selectedLesson.id]) {
        const savedTime = lessonProgress[selectedLesson.id].watched || 0;
        setCurrentVideoTime(savedTime);
      } else {
        setCurrentVideoTime(0);
      }

      const handleTimeUpdate = () => {
        if (!video || !selectedLesson.id) return;
        
        const currentTime = video.currentTime || 0;
        const timeInSeconds = Math.floor(currentTime);
        const totalDuration = selectedLesson.durationSeconds || 0;
        
        // SCORM-style watched segments tracking
        // Get or create watched segments Set for this lesson
        if (!watchedSegmentsRef.current.has(selectedLesson.id)) {
          watchedSegmentsRef.current.set(selectedLesson.id, new Set());
        }
        const watchedSegments = watchedSegmentsRef.current.get(selectedLesson.id);
        
        // Get last time for skip detection (SCORM-style)
        const lastTime = lastTimeRef.current.get(selectedLesson.id) || 0;
        
        // SCORM-style skip detection: Only add if normal progression (not a seek)
        // If current - lastTime <= 1.5, it's normal playback (add to watched)
        // If current - lastTime > 1.5, it's a seek (skip, don't add)
        const timeDiff = currentTime - lastTime;
        const isNormalPlayback = timeDiff <= 1.5 || lastTime === 0; // Allow first second or normal progression
        
        // Only add to watched segments if normal playback (not seeking)
        // This prevents fake progress from dragging to end
        if (isNormalPlayback && timeInSeconds >= 0 && timeInSeconds <= totalDuration) {
          // Add current second to watched segments (SCORM-style)
          watchedSegments.add(timeInSeconds);
          
          // Also add previous second if we're in the middle of it (for smooth tracking)
          if (currentTime - timeInSeconds > 0.5 && timeInSeconds > 0) {
            watchedSegments.add(timeInSeconds - 1);
          }
        }
        
        // Update last time (always, even if seeking, for next comparison)
        lastTimeRef.current.set(selectedLesson.id, currentTime);
        
        // Calculate real progress from watched segments (SCORM-style)
        const watchedSecondsCount = watchedSegments.size;
        const realProgressPercent = totalDuration > 0 
          ? Math.min(100, Math.round((watchedSecondsCount / totalDuration) * 100))
          : 0;
        
        // Always update UI in real-time (this is what user sees in dialog progress bar)
        const timeDiffUI = Math.abs(currentTime - currentVideoTime);
        if (timeDiffUI >= 0.25) {
          setCurrentVideoTime(currentTime);
          setProgressUpdateTrigger((prev) => prev + 1);
        }
        
        // Update lessonProgress with REAL progress from segments
        setLessonProgress((prev) => {
          const prevWatched = prev[selectedLesson.id]?.watched || 0;
          const prevWatchedSeconds = prev[selectedLesson.id]?.watchedSeconds || 0;
          
          // Use watched segments count as watchedSeconds (REAL progress)
          const newWatchedSeconds = Math.max(prevWatchedSeconds, watchedSecondsCount);
          
          if (timeInSeconds >= prevWatched || timeInSeconds > 0) {
            const newProgress = {
              ...prev,
              [selectedLesson.id]: { 
                watched: timeInSeconds, // Resume position
                watchedSeconds: newWatchedSeconds, // REAL progress from segments
                completed: prev[selectedLesson.id]?.completed || (realProgressPercent >= 90)
              },
            };
            // Update localStorage as backup
            if (courseId) {
              localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(newProgress));
            }
            return newProgress;
          }
          return prev;
        });
        
        // Debug log (remove in production)
        if (timeInSeconds % 5 === 0) { // Log every 5 seconds to avoid spam
          console.log('[Video] Real-time update (SCORM-style):', {
            currentTime: currentTime.toFixed(2),
            timeInSeconds,
            watchedSegmentsCount: watchedSegments.size,
            realProgressPercent,
            totalDuration,
            isSeeking,
          });
        }
      };

      const handlePlay = async () => {
        if (video && selectedLesson.id) {
          const currentTime = video.currentTime || 0;
          const timeInSeconds = Math.floor(currentTime);
          setCurrentVideoTime(timeInSeconds);
          
          // Save progress via API when video starts
          const userId = getStoredUserId();
          if (userId && courseId && selectedLesson.id) {
            try {
              const totalDuration = selectedLesson.durationSeconds || 0;
              const progressPercent = totalDuration > 0 
                ? Math.round((timeInSeconds / totalDuration) * 100) 
                : 0;
              const isCompleted = progressPercent >= 90;
              
              await postJSON('progress/update', {
                userId,
                courseId,
                lessonId: selectedLesson.id,
                watched: timeInSeconds,
                completed: isCompleted,
              });
              
              console.log('[API] ✅ Progress saved on video start:', {
                lessonId: selectedLesson.id,
                watched: timeInSeconds,
                progressPercent,
              });
            } catch (error) {
              console.error('[API] ❌ Error saving progress on video start:', error);
            }
          }
        }
      };

      const handleEnded = async () => {
        if (selectedLesson.id) {
          const totalDuration = selectedLesson.durationSeconds || 0;
          setCurrentVideoTime(totalDuration);
          
          // Update local state immediately first (for instant UI update)
          setLessonProgress((prev) => {
            const newProgress = {
              ...prev,
              [selectedLesson.id]: { 
                watched: totalDuration, 
                watchedSeconds: totalDuration,
                completed: true 
              },
            };
            // Save to localStorage as backup
            if (courseId) {
              localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(newProgress));
            }
            return newProgress;
          });
          
          // Save progress via API when video ends
          const userId = getStoredUserId();
          if (userId && courseId && selectedLesson.id) {
            try {
              const response = await postJSON('progress/update', {
                userId,
                courseId,
                lessonId: selectedLesson.id,
                watched: totalDuration,
                completed: true,
              });
              
              console.log('[API] ✅ Progress saved on video end:', {
                lessonId: selectedLesson.id,
                watched: totalDuration,
                completed: true,
                response: response?.data,
              });
              
              // Update local state with server response to ensure sync
              if (response?.data?.lessons) {
                const lessonProgressData = response.data.lessons.find(
                  l => l.lessonId?.toString() === selectedLesson.id
                );
                if (lessonProgressData) {
                  setLessonProgress((prev) => {
                    const updated = {
                      ...prev,
                      [selectedLesson.id]: {
                        watched: lessonProgressData.watched || totalDuration,
                        completed: lessonProgressData.completed !== undefined ? lessonProgressData.completed : true,
                      },
                    };
                    if (courseId) {
                      localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(updated));
                    }
                    return updated;
                  });
                }
              }
            } catch (error) {
              console.error('[API] ❌ Error saving progress on video end:', error);
            }
          }
          
          // Also send via Socket.io (backup)
          if (socket && socket.connected) {
            socket.emit('video:ended', {
              courseId,
              lessonId: selectedLesson.id,
              videoDuration: totalDuration,
            });
          }
        }
      };

      const handlePause = async () => {
        // Save progress via API immediately on pause
        if (selectedLesson.id && video) {
          const currentTime = video.currentTime || 0;
          const timeInSeconds = Math.floor(currentTime);
          const totalDuration = selectedLesson.durationSeconds || 0;
          const progressPercent = totalDuration > 0 
            ? Math.round((timeInSeconds / totalDuration) * 100) 
            : 0;
          const isCompleted = progressPercent >= 90;
          
          const userId = getStoredUserId();
          if (userId && courseId && selectedLesson.id) {
            try {
              await postJSON('progress/update', {
                userId,
                courseId,
                lessonId: selectedLesson.id,
                watched: timeInSeconds,
                completed: isCompleted,
              });
              
              console.log('[API] ✅ Progress saved on pause:', {
                lessonId: selectedLesson.id,
                watched: timeInSeconds,
                progressPercent,
              });
            } catch (error) {
              console.error('[API] ❌ Error saving progress on pause:', error);
            }
          }
          
          // Also send via Socket.io (backup) - include watched segments
          if (socket && socket.connected) {
            const watchedSegments = watchedSegmentsRef.current.get(selectedLesson.id) || new Set();
            socket.emit('video:progress', {
              courseId,
              lessonId: selectedLesson.id,
              currentTime: timeInSeconds,
              videoDuration: totalDuration,
              isPlaying: false,
              watchedSegments: Array.from(watchedSegments), // Send watched segments (SCORM-style)
              watchedSegmentsCount: watchedSegments.size,
            });
          }
        }
      };

      const handleLoadedMetadata = () => {
        if (!video || !selectedLesson.id) return;
        
        // Reload progress from state to ensure latest data
        const savedProgress = lessonProgress[selectedLesson.id];
        if (!savedProgress) {
          console.log('[Video] No saved progress found');
          return;
        }
        
        const savedTime = savedProgress.watched || 0;
        const totalDuration = selectedLesson.durationSeconds || 0;
        
        console.log('[Video] Metadata loaded, restoring position:', {
          lessonId: selectedLesson.id,
          savedTime,
          totalDuration,
          completed: savedProgress.completed,
          videoReadyState: video.readyState,
          videoDuration: video.duration,
        });
        
        // Wait for video to be ready
        const restorePosition = () => {
          if (!video || video.readyState < 2) {
            setTimeout(restorePosition, 100);
            return;
          }
          
          if (savedProgress.completed && totalDuration > 0) {
            // Video is completed - set to end
            const endTime = Math.min(totalDuration, video.duration || totalDuration);
            setCurrentVideoTime(endTime);
            video.currentTime = endTime;
            console.log('[Video] Position restored to end (completed):', endTime);
          } else if (savedTime > 0 && totalDuration > 0) {
            // Restore saved position (don't set to exact end to allow continuation)
            const restoreTime = Math.min(savedTime, totalDuration - 1, (video.duration || totalDuration) - 1);
            video.currentTime = restoreTime;
            setCurrentVideoTime(restoreTime);
            console.log('[Video] Position restored to:', restoreTime, 'of', totalDuration);
          } else {
            // No saved progress, start from beginning
            video.currentTime = 0;
            setCurrentVideoTime(0);
            console.log('[Video] Starting from beginning');
          }
        };
        
        // Try to restore immediately, or wait a bit
        if (video.readyState >= 2) {
          setTimeout(restorePosition, 100);
        } else {
          video.addEventListener('canplay', restorePosition, { once: true });
        }
      };

      // Add event listeners
      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("play", handlePlay);
      video.addEventListener("playing", handlePlay);
      video.addEventListener("ended", handleEnded);
      video.addEventListener("pause", handlePause);
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      
      // Save progress via Socket.io when video is playing (every 1 second)
      // API calls only on pause/end/close for reliability
      progressInterval = setInterval(() => {
        if (video && !video.paused && selectedLesson.id) {
          const savedProgress = lessonProgress[selectedLesson.id];
          
          // Don't send if already complete
          if (savedProgress?.completed) {
            return;
          }
          
          const currentTime = video.currentTime || 0;
          const timeInSeconds = Math.floor(currentTime);
          const totalDuration = selectedLesson.durationSeconds || 0;
          
          // Get watched segments for this lesson (SCORM-style)
          const watchedSegments = watchedSegmentsRef.current.get(selectedLesson.id) || new Set();
          
          // Send via Socket.io (primary method for real-time updates)
          // Include watched segments array for server-side tracking (Cloudinary + Socket.io)
          if (socket && socket.connected) {
            socket.emit('video:progress', {
              courseId,
              lessonId: selectedLesson.id,
              currentTime: currentTime, // Send actual currentTime (not floored) for accuracy
              videoDuration: totalDuration,
              isPlaying: true,
              watchedSegments: Array.from(watchedSegments), // Send watched seconds array (SCORM-style)
              watchedSegmentsCount: watchedSegments.size, // Send segments count for validation
            });
          } else {
            // If socket not connected, try to reconnect
            console.warn('[Socket.io] Socket not connected, attempting to reconnect...');
            const newSocket = connectSocket();
            setSocket(newSocket);
          }
        } else {
          // Debug: log why not sending
          if (!selectedLesson.id) console.warn('[Progress] No lesson selected');
          else if (video?.paused) console.log('[Progress] Video paused, not saving');
        }
      }, 1000); // Send every 1 second when playing

      // Return cleanup function
      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("playing", handlePlay);
        video.removeEventListener("ended", handleEnded);
        video.removeEventListener("pause", handlePause);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        if (progressInterval) clearInterval(progressInterval);
        
        // Send final pause event on cleanup - include watched segments
        if (selectedLesson.id && video && socket && socket.connected) {
          const currentTime = video.currentTime || 0;
          const totalDuration = selectedLesson.durationSeconds || 0;
          const watchedSegments = watchedSegmentsRef.current.get(selectedLesson.id) || new Set();
          
          socket.emit('video:progress', {
            courseId,
            lessonId: selectedLesson.id,
            currentTime: Math.floor(currentTime),
            videoDuration: totalDuration,
            isPlaying: false,
            watchedSegments: Array.from(watchedSegments), // Send watched segments (SCORM-style)
            watchedSegmentsCount: watchedSegments.size,
          });
        }
      };
    };

    const timeoutId = setTimeout(setupTracking, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [selectedLesson?.id, courseId, socket]); // Removed lessonProgress from dependencies to prevent re-runs

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
                <Box sx={{ position: "relative" }}>
                  <video
                    ref={videoRef}
                    src={selectedLesson.videoUrl}
                    controls
                    controlsList="nodownload" // Prevent download (Cloudinary video)
                    disablePictureInPicture // Disable picture-in-picture
                    poster={course?.img || "/images/reactc.png"}
                    style={{ width: "100%", backgroundColor: "black", display: "block" }}
                    crossOrigin="anonymous" // For Cloudinary CORS support
                    preload="metadata" // Load metadata for duration
                  />
                  {/* Progress Bar Overlay with Percentage - Real-time Updates */}
                  {(() => {
                    const totalDuration = selectedLesson.durationSeconds || 0;
                    let progressPercent = 0;
                    
                    // Get current time - prioritize video.currentTime for accuracy, fallback to state
                    const video = videoRef.current;
                    let actualCurrentTime = currentVideoTime;
                    
                    // If video is ready and available, use video.currentTime for most accurate real-time display
                    // This ensures the progress bar updates smoothly as video plays
                    if (video && video.readyState >= 2) {
                      // Use video.currentTime for real-time accuracy (updates every frame)
                      actualCurrentTime = video.currentTime || currentVideoTime;
                    }
                    
                    // Calculate progress percentage from watchedSegments (REAL progress - SCORM-style)
                    // NOT from currentTime (which can be faked by dragging to end)
                    const savedProgress = lessonProgress[selectedLesson.id];
                    const watchedSeconds = savedProgress?.watchedSeconds || 0;
                    
                    // Get real-time watched segments count (SCORM-style)
                    const watchedSegments = watchedSegmentsRef.current.get(selectedLesson.id) || new Set();
                    const watchedSegmentsCount = watchedSegments.size;
                    
                    // Use watchedSegments count if available (real-time), otherwise use watchedSeconds from DB
                    const realWatchedSeconds = watchedSegmentsCount > 0 ? watchedSegmentsCount : watchedSeconds;
                    
                    if (totalDuration > 0) {
                      // Calculate from real watched time (segments or DB)
                      if (realWatchedSeconds > 0) {
                        progressPercent = Math.min(100, Math.round((realWatchedSeconds / totalDuration) * 100));
                      } else {
                        // Fallback: use currentTime if no watched time yet (initial state)
                        progressPercent = Math.min(100, Math.round((actualCurrentTime / totalDuration) * 100));
                      }
                      
                      // If completed flag is true AND watched enough, show 100%
                      if (savedProgress?.completed && realWatchedSeconds >= totalDuration * 0.9) {
                        progressPercent = 100;
                      }
                      
                      // If video ended, show 100% (but only if actually watched enough)
                      if (video && video.ended) {
                        // Only mark as 100% if watched enough
                        if (realWatchedSeconds >= totalDuration * 0.9) {
                          progressPercent = 100;
                        }
                      }
                    }
                    
                    // Use progressUpdateTrigger to force re-render when state changes
                    // This ensures React re-renders the progress bar when currentVideoTime updates
                    // The trigger dependency ensures the calculation runs on every render
                    const _trigger = progressUpdateTrigger;
                    
                    // Log for debugging (can be removed in production)
                    if (progressPercent > 0 && progressPercent % 10 === 0) {
                      console.log('[Progress Bar] Real-time update:', {
                        actualCurrentTime: actualCurrentTime.toFixed(2),
                        watchedSegmentsCount,
                        watchedSeconds,
                        realWatchedSeconds,
                        totalDuration,
                        progressPercent,
                        completed: savedProgress?.completed,
                      });
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
