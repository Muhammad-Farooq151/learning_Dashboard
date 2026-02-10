"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  LinearProgress,
  Button,
  Tabs,
  Tab,
  Skeleton,
  Chip,
} from "@mui/material";
import { greenColor } from "@/components/utils/Colors";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useRouter } from "next/navigation";
import { getJSON } from "@/utils/http";
import { getStoredUserId } from "@/utils/authStorage";

function MyLearnings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [courses, setCourses] = useState({ inProgress: [], completed: [] });

  useEffect(() => {
    let mounted = true;

    const loadMyCourses = async () => {
      try {
        const userId = getStoredUserId();
        if (!userId) {
          setLoading(false);
          return;
        }

        setLoading(true);
        const response = await getJSON(`users/my-courses?userId=${userId}`);

        if (!mounted) return;

        if (response?.success && Array.isArray(response.data)) {
          // Fetch progress for each course
          const coursesWithProgress = await Promise.all(
            response.data.map(async (course) => {
              try {
                // Fetch full course details to get all lessons
                const courseDetailsResponse = await getJSON(`courses/${course.id}`);
                if (!courseDetailsResponse?.success || !courseDetailsResponse.data) {
                  return {
                    id: course.id,
                    title: course.title,
                    desc: course.description,
                    progress: 0,
                    img: course.thumbnailUrl || "/images/default-course.png",
                    isComplete: false,
                  };
                }

                const courseDetails = courseDetailsResponse.data;
                const allLessons = courseDetails.lessons || [];

                if (allLessons.length === 0) {
                  return {
                    id: course.id,
                    title: course.title,
                    desc: course.description,
                    progress: 0,
                    img: course.thumbnailUrl || "/images/default-course.png",
                    isComplete: false,
                  };
                }

                // Fetch progress for this course
                const progressResponse = await getJSON(`progress/${course.id}?userId=${userId}`);
                if (!progressResponse?.success || !progressResponse.data) {
                  return {
                    id: course.id,
                    title: course.title,
                    desc: course.description,
                    progress: 0,
                    img: course.thumbnailUrl || "/images/default-course.png",
                    isComplete: false,
                  };
                }

                const progress = progressResponse.data;
                const progressLessons = progress.lessons || [];

                // Create a map of lessonId to progress for quick lookup
                const progressMap = {};
                progressLessons.forEach((lp) => {
                  const lessonIdStr = lp.lessonId?.toString() || lp.lessonId;
                  progressMap[lessonIdStr] = lp;
                });

                // Check each lesson from the course against progress data
                let completedCount = 0;
                allLessons.forEach((lesson) => {
                  const lessonIdStr = lesson._id?.toString() || lesson._id;
                  const lessonProgress = progressMap[lessonIdStr];
                  // Only count as completed if explicitly marked as completed in database
                  if (lessonProgress && lessonProgress.completed === true) {
                    completedCount++;
                  }
                });

                // Calculate progress percentage based on all lessons
                const progressPercentage =
                  allLessons.length > 0
                    ? Math.round((completedCount / allLessons.length) * 100)
                    : 0;

                // Check if course is 100% complete (all lessons must be completed)
                const isComplete = completedCount === allLessons.length && allLessons.length > 0;

                return {
                  id: course.id,
                  title: course.title,
                  desc: course.description,
                  progress: progressPercentage,
                  img: course.thumbnailUrl || "/images/default-course.png",
                  isComplete: isComplete,
                  completedLessons: completedCount,
                  totalLessons: allLessons.length,
                };
              } catch (error) {
                console.error(`Error fetching progress for course ${course.id}:`, error);
                return {
                  id: course.id,
                  title: course.title,
                  desc: course.description,
                  progress: 0,
                  img: course.thumbnailUrl || "/images/default-course.png",
                  isComplete: false,
                  completedLessons: 0,
                  totalLessons: 0,
                };
              }
            })
          );

          // Separate into in progress and completed
          const inProgress = coursesWithProgress.filter((c) => !c.isComplete);
          const completed = coursesWithProgress.filter((c) => c.isComplete);

          setCourses({
            inProgress,
            completed,
          });
          toast.success("Courses loaded successfully!", { id: "courses" });
        } else {
          setCourses({ inProgress: [], completed: [] });
        }
      } catch (error) {
        console.error("Failed to load my courses:", error);
        if (mounted) {
          toast.error(error.message || "Failed to load courses", { id: "courses" });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadMyCourses();

    return () => {
      mounted = false;
    };
  }, []);

  const renderSkeleton = () => (
    <Box mb={2}>
      <Card sx={{ display: "flex", mb: 2, p: 2 }}>
        <Skeleton variant="rectangular" width={100} height={80} />
        <Box sx={{ flex: 1, ml: 2 }}>
          <Skeleton width="60%" height={20} />
          <Skeleton width="90%" height={20} />
          <Skeleton width="40%" height={20} />
        </Box>
      </Card>
    </Box>
  );

  const renderCourse = (course, completed = false) => (
    <Card key={course.id} sx={{ display: "flex", mb: 2, p: 2 }}>
      <CardMedia
        component="img"
        sx={{ width: 100, borderRadius: 1 }}
        image={course.img}
        alt={course.title}
      />
      <CardContent sx={{ flex: 1 }}>
   <Box display={"flex"} justifyContent={"space-between"}>
      <Box>
           <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{course.title}</Typography>
          {completed && (
            <Chip
              icon={<CheckCircleIcon style={{ color: greenColor }} />}
              label="Verified"
              variant="outlined"
              sx={{
                color: greenColor,
                borderColor: greenColor,
                fontWeight: 500,
              }}
            />
          )}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {course.desc}
        </Typography>
     </Box>

           <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            onClick={() => router.push(`/user/my-leaning/${course.id}`)}
            sx={{
              backgroundColor: greenColor,
              "&:hover": { opacity: 0.9, backgroundColor: greenColor },
            }}
          >
            {completed ? "View Course" : "Continue"}
          </Button>
        </Box>

   </Box>
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={course.progress}
            sx={{
              height: 8,
              borderRadius: 5,
              backgroundColor: "#E5FFF7", 
              [`& .MuiLinearProgress-bar`]: {
                backgroundColor: greenColor, 
              },
            }}
          />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Progress: {course.progress}%
            {course.totalLessons > 0 && (
              <span style={{ color: "#666", marginLeft: 8 }}>
                ({course.completedLessons || 0} of {course.totalLessons} modules completed)
              </span>
            )}
          </Typography>
        </Box>
     
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        My Learnings
      </Typography>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="In Progress" />
        <Tab label="Completed" />
      </Tabs>

      {loading ? (
        <>
          {renderSkeleton()}
          {renderSkeleton()}
        </>
      ) : (
        <>
          {tab === 0 && (
            <>
              {courses.inProgress.length > 0 ? (
                courses.inProgress.map((c) => renderCourse(c, false))
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 6,
                    px: 2,
                  }}
                >
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No courses in progress
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Start learning by enrolling in a course
                  </Typography>
                </Box>
              )}
            </>
          )}
          {tab === 1 && (
            <>
              {courses.completed.length > 0 ? (
                courses.completed.map((c) => renderCourse(c, true))
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 6,
                    px: 2,
                  }}
                >
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No courses completed yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Complete your enrolled courses to see them here
                  </Typography>
                </Box>
              )}
            </>
          )}
        </>
      )}

      {loading && (
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <ClipLoader color={greenColor} size={30} />
        </Box>
      )}
    </Box>
  );
}

export default MyLearnings;
