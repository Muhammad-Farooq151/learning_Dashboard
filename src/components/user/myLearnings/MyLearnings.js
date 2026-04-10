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
import { courseThumbnailSrc } from "@/utils/mediaProxyUrl";
import { getStoredUserId } from "@/utils/authStorage";
import {
  computeAggregateCoursePercent,
  buildLessonProgressMapFromApi,
  countVideoLessonStats,
} from "@/utils/courseProgressPercent";

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
                    img: courseThumbnailSrc({
                      id: course.id,
                      thumbnailUrl: course.thumbnailUrl,
                      thumbnailMediaPath: course.thumbnailMediaPath,
                    }),
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
                    img: courseThumbnailSrc({
                      id: course.id,
                      thumbnailUrl: course.thumbnailUrl,
                      thumbnailMediaPath: course.thumbnailMediaPath,
                    }),
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
                    img: courseThumbnailSrc({
                      id: course.id,
                      thumbnailUrl: course.thumbnailUrl,
                      thumbnailMediaPath: course.thumbnailMediaPath,
                    }),
                    isComplete: false,
                  };
                }

                const progress = progressResponse.data;
                const progressMap = buildLessonProgressMapFromApi(progress);
                const listPercent = computeAggregateCoursePercent(allLessons, progressMap);
                const { completed, total } = countVideoLessonStats(allLessons, progressMap);
                const isComplete =
                  !!progress.courseCompleted ||
                  (listPercent >= 100 && total > 0);

                return {
                  id: course.id,
                  title: course.title,
                  desc: course.description,
                  progress: listPercent,
                  img: courseThumbnailSrc({
                    _id: courseDetails._id || course.id,
                    thumbnailUrl: courseDetails.thumbnailUrl || course.thumbnailUrl,
                    thumbnailMediaPath:
                      courseDetails.thumbnailMediaPath || course.thumbnailMediaPath,
                  }),
                  isComplete,
                  completedLessons: completed,
                  totalLessons: total,
                };
              } catch (error) {
                console.error(`Error fetching progress for course ${course.id}:`, error);
                return {
                  id: course.id,
                  title: course.title,
                  desc: course.description,
                  progress: 0,
                  img: courseThumbnailSrc({
                    _id: course.id,
                    thumbnailUrl: course.thumbnailUrl,
                    thumbnailMediaPath: course.thumbnailMediaPath,
                  }),
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
      <Card sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, mb: 2, p: 2 }}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={180}
          sx={{ maxWidth: { xs: "100%", sm: 100 }, borderRadius: 1 }}
        />
        <Box sx={{ flex: 1, ml: { xs: 0, sm: 2 }, mt: { xs: 2, sm: 0 } }}>
          <Skeleton width="60%" height={20} />
          <Skeleton width="90%" height={20} />
          <Skeleton width="40%" height={20} />
        </Box>
      </Card>
    </Box>
  );

  const renderCourse = (course, completed = false) => (
    <Card
      key={course.id}
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        mb: 2,
        p: 2,
      }}
    >
      <CardMedia
        component="img"
        sx={{
          width: { xs: "100%", sm: 100 },
          height: { xs: 180, sm: 100 },
          borderRadius: 1,
          objectFit: "cover",
          alignSelf: { xs: "stretch", sm: "flex-start" },
        }}
        image={course.img}
        alt={course.title}
      />
      <CardContent sx={{ flex: 1, px: { xs: 0, sm: 2 }, pb: "16px !important", pt: { xs: 2, sm: 0 } }}>
   <Box display={"flex"} justifyContent={"space-between"} flexDirection={{ xs: "column", sm: "row" }} gap={2}>
      <Box sx={{ minWidth: 0, flex: 1 }}>
           <Box
             display="flex"
             alignItems={{ xs: "flex-start", sm: "center" }}
             justifyContent="space-between"
             flexDirection={{ xs: "column", sm: "row" }}
             gap={1}
           >
          <Typography variant="h6" sx={{ wordBreak: "break-word" }}>{course.title}</Typography>
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
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {course.desc}
        </Typography>
     </Box>

           <Box
             sx={{
               mt: { xs: 0, sm: 2 },
               display: "flex",
               gap: 2,
               flexWrap: "wrap",
               width: { xs: "100%", sm: "auto" },
               justifyContent: { xs: "stretch", sm: "flex-start" },
             }}
           >
          <Button
            variant="contained"
            onClick={() => router.push(`/user/my-leaning/${course.id}`)}
            sx={{
              backgroundColor: greenColor,
              height: 40,
              minWidth: { xs: "100%", sm: 140 },
              mt: { xs: 0, sm: 3 },
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
    <Box >
      {/* <Typography variant="h5" sx={{ mb: 2 }}>
        My Learnings
      </Typography> */}

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
