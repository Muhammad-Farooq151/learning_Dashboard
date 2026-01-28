"use client";

import React, { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CourseReviews from "./CourseReviews";
import CourseCurriculum from "./CourseCurriculum";

function CourseDetails({ course }) {
  const router = useRouter();
  const [tab, setTab] = useState("overview");

  // Map API course data to component structure
  const mappedCourse = useMemo(() => {
    if (!course) return null;

    // Calculate total duration from lessons
    const totalDuration = course.lessons?.reduce((total, lesson) => {
      return total + (lesson.duration || 0);
    }, 0) || 0;
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);
    const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    // Calculate price with discount
    const originalPrice = typeof course.price === 'string' ? parseFloat(course.price) || 0 : (course.price || 0);
    const discountPercentage = course.discountPercentage || 0;
    let finalPrice = originalPrice;
    let hasDiscount = false;
    
    if (discountPercentage > 0 && originalPrice > 0) {
      const discountAmount = (originalPrice * discountPercentage) / 100;
      finalPrice = originalPrice - discountAmount;
      hasDiscount = true;
    }

    return {
      id: course._id || course.id,
      title: course.title || 'Untitled Course',
      description: course.description || '',
      about: course.description || '', // Use description as about if no separate about field
      image: course.thumbnailUrl || '/images/default-course.jpg',
      price: finalPrice, // Final price after discount
      originalPrice: hasDiscount ? originalPrice : null, // Original price if discount exists
      discountPercentage: discountPercentage,
      duration: duration,
      students: course.enrolled || 0,
      rating: 4.8, // Default rating if not in API
      reviews: "4.8k", // Default reviews
      level: "Beginner", // Default level
      category: course.category || 'Uncategorized',
      skills: course.skills || [],
      learnPoints: course.lessons?.map(lesson => lesson.learningOutcomes || lesson.lessonName) || [],
      instructor: {
        name: course.instructor || 'Unknown Instructor',
        title: 'Course Instructor',
        rating: 4.9,
        students: course.enrolled || 0,
        courses: 1,
      },
      faq: course.faqs || [],
      lessons: course.lessons || [],
    };
  }, [course]);

  const faqs = useMemo(() => mappedCourse?.faq ?? [], [mappedCourse]);

  if (!mappedCourse) {
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
          We couldn&apos;t find the course you are looking for. Please return to
          the catalog to explore available courses.
        </Typography>
        <Button component={Link} href="/user/explore-courses" variant="contained">
          Back to Courses
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2, mx: "auto", maxWidth: "1200px" }}>
      <Stack spacing={4}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton component={Link} href="/user/explore-courses">
            <ArrowBackIosNewRoundedIcon fontSize="small" />
          </IconButton>
          <Typography variant="subtitle1" color="text.secondary">
            Course Details
          </Typography>
        </Stack>

        <Grid
          container
          spacing={4}
          sx={{
            alignItems: { xs: "stretch", md: "center" },
          }}
        >
          <Grid size={{xs:12,md:7}}>
            <Stack spacing={2}>
              <Typography 
                variant="h4" 
                fontWeight={700}
                sx={{
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                }}
              >
                {mappedCourse.title}
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap",
                }}
              >
                {mappedCourse.description}
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "flex-start", sm: "center" }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <AccessTimeRoundedIcon color="primary" />
                  <Typography variant="body2" color="text.primary">
                    {mappedCourse.duration}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <PeopleAltRoundedIcon color="primary" />
                  <Typography variant="body2" color="text.primary">
                    {mappedCourse.students.toLocaleString()} students
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <StarRoundedIcon sx={{ color: "#FFB400" }} />
                  <Typography variant="body2" color="text.primary">
                    {mappedCourse.rating.toFixed(1)} ({mappedCourse.reviews ?? "4.8k"} reviews)
                  </Typography>
                </Stack>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button 
                  size="large" 
                  variant="contained" 
                  color="success"
                  onClick={() => router.push(`/checkout/${mappedCourse.id}`)}
                >
                  Enroll Now
                </Button>
                <Stack direction="row" spacing={1} alignItems="baseline" flexWrap="wrap">
                  {mappedCourse.originalPrice ? (
                    <>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ 
                          textDecoration: "line-through",
                          textDecorationColor: "#64748B",
                        }}
                      >
                        ${mappedCourse.originalPrice.toFixed(2)}
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color="success.main">
                        ${mappedCourse.price.toFixed(2)}
                      </Typography>
                      {mappedCourse.discountPercentage > 0 && (
                        <Chip 
                          label={`${mappedCourse.discountPercentage}% OFF`}
                          size="small"
                          color="success"
                          sx={{ 
                            fontWeight: 600,
                            height: 24,
                            fontSize: "0.75rem",
                          }}
                        />
                      )}
                    </>
                  ) : (
                    <Typography variant="h5" fontWeight={700}>
                      ${mappedCourse.price.toFixed(2)}
                    </Typography>
                  )}
                </Stack>
              </Stack>

              <Stack direction="row" spacing={1}>
                <Chip label={mappedCourse.level} color="primary" variant="outlined" />
                <Chip label={mappedCourse.category} variant="outlined" />
              </Stack>
            </Stack>
          </Grid>
          <Grid size={{xs:12,md:5}}>
            <Box
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                boxShadow:
                  "0px 20px 45px rgba(15, 23, 42, 0.12), 0px 0px 1px rgba(15, 23, 42, 0.16)",
              }}
            >
              <Box
                component="img"
                src={mappedCourse.image}
                alt={mappedCourse.title}
                sx={{ width: "100%", height: { xs: 240, md: 280 }, objectFit: "cover" }}
              />
            </Box>
          </Grid>
        </Grid>

        <Box
          sx={{
            bgcolor: "#ffffff",
            borderRadius: 3,
            boxShadow:
              "0px 12px 30px rgba(15, 23, 42, 0.08), 0px 0px 1px rgba(15, 23, 42, 0.1)",
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            textColor="primary"
            indicatorColor="primary"
            sx={{ px: { xs: 2, md: 3 }, pt: 2 }}
          >
            <Tab label="Overview" value="overview" />
            <Tab label="Courses" value="courses" />
            <Tab label="Reviews" value="reviews" />
          </Tabs>

          <Divider />

          {tab === "overview" && (
            <Box sx={{ p: { xs: 2, md: 4 } }}>
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    About This Course
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {mappedCourse.about}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{xs:12,md:6}}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      What You&apos;ll Learn
                    </Typography>
                    <Stack spacing={1}>
                      {(mappedCourse.learnPoints ?? []).length > 0 ? (
                        mappedCourse.learnPoints.map((point, index) => (
                          <Stack
                            key={index}
                            direction="row"
                            spacing={1.5}
                            alignItems="flex-start"
                          >
                            <PlayCircleFilledRoundedIcon
                              fontSize="small"
                              color="primary"
                              sx={{ mt: 0.4 }}
                            />
                            <Typography 
                              variant="body2" 
                              color="text.primary"
                              sx={{
                                wordWrap: "break-word",
                                overflowWrap: "break-word",
                                wordBreak: "break-word",
                              }}
                            >
                              {point}
                            </Typography>
                          </Stack>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Learning outcomes will be added soon.
                        </Typography>
                      )}
                    </Stack>
                  </Grid>

                  <Grid size={{xs:12,md:6}}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Skills You&apos;ll Gain
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {(mappedCourse.skills ?? []).length > 0 ? (
                        mappedCourse.skills.map((skill) => (
                          <Chip key={skill} label={skill} variant="outlined" />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Skills will be added soon.
                        </Typography>
                      )}
                    </Stack>
                  </Grid>
                </Grid>

                <Divider />

                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Meet Your Instructor
                  </Typography>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                  >
                    <Avatar sx={{ width: 64, height: 64 }}>
                      {mappedCourse.instructor?.name?.charAt(0) ?? "I"}
                    </Avatar>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {mappedCourse.instructor?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {mappedCourse.instructor?.title}
                      </Typography>
                      <Stack direction="row" spacing={2}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <StarRoundedIcon fontSize="small" sx={{ color: "#FFB400" }} />
                          <Typography variant="body2">
                            {mappedCourse.instructor?.rating}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {mappedCourse.instructor?.students?.toLocaleString()} learners
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {mappedCourse.instructor?.courses} courses
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </Box>

                {!!faqs.length && (
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Frequently Asked Questions
                    </Typography>
                    <Stack spacing={1.5}>
                      {faqs.map((item, index) => (
                        <Accordion key={index} disableGutters>
                          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                            <Typography 
                              variant="subtitle1" 
                              fontWeight={600}
                              sx={{
                                wordWrap: "break-word",
                                overflowWrap: "break-word",
                                wordBreak: "break-word",
                              }}
                            >
                              {item.question || item.q || 'Question'}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{
                                wordWrap: "break-word",
                                overflowWrap: "break-word",
                                wordBreak: "break-word",
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {item.answer || item.a || 'Answer'}
                            </Typography>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Box>
          )}

          {tab === "courses" && (
            <CourseCurriculum course={mappedCourse} />
          )}

          {tab === "reviews" && (
            <CourseReviews course={mappedCourse} />
          )}
        </Box>
      </Stack>
    </Box>
  );
}

export default CourseDetails;

