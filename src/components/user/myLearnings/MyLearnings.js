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

// Dummy API simulation
const fetchCourses = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        inProgress: [
          {
            id: 1,
            title: "Full Stack Web Developer Career Accelerator",
            desc: "Deep dive into advanced JavaScript concepts, closures, prototypes, and modern ES6+ features",
            progress: 24,
            img: "/images/python.png",
          },
          {
            id: 2,
            title: "Advanced JavaScript",
            desc: "Deep dive into advanced JavaScript concepts, closures, prototypes, and modern ES6+ features",
            progress: 24,
            img: "/images/js.png",
          },
          {
            id: 3,
            title: "Machine Learning Basics",
            desc: "Introduction to machine learning algorithms and practical implementation with real-world examples",
            progress: 24,
            img: "/images/ml.png",
          },
        ],
        completed: [
          {
            id: 2,
            title: "Advanced JavaScript",
            desc: "Deep dive into advanced JavaScript concepts, closures, prototypes, and modern ES6+ features",
            progress: 100,
            img: "/images/js.png",
          },
          {
            id: 3,
            title: "Machine Learning Basics",
            desc: "Introduction to machine learning algorithms and practical implementation with real-world examples",
            progress: 100,
            img: "/images/ml.png",
          },
        ],
      });
    }, 1800); 
  });

function MyLearnings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [courses, setCourses] = useState({ inProgress: [], completed: [] });

  useEffect(() => {
    let mounted = true;

    fetchCourses()
      .then((res) => {
        if (mounted) {
          setCourses(res);
          setLoading(false);
          toast.success("Courses loaded successfully!", { id: "courses" });
        }
      })
      .catch(() => {
        toast.error("Failed to load courses", { id: "courses" });
      });

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

           <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
          {completed ? (
            <>
              <Button size="small">Add To LinkedIn</Button>
              <Button size="small">Rate Us</Button>
              <Button size="small">Download</Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={() => router.push(`/user/my-leaning/${course.id}`)}
              sx={{
                backgroundColor: greenColor,
                "&:hover": { opacity: 0.9, backgroundColor: greenColor },
              }}
            >
              Continue
            </Button>
          )}
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
          {tab === 0 &&
            courses.inProgress.map((c) => renderCourse(c, false))}
          {tab === 1 &&
            courses.completed.map((c) => renderCourse(c, true))}
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
