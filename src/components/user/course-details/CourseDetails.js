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

function CourseDetails({ course }) {
  const [tab, setTab] = useState("overview");

  const faqs = useMemo(() => course?.faq ?? [], [course]);

  if (!course) {
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
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "1200px", mx: "auto" }}>
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
              <Typography variant="h4" fontWeight={700}>
                {course.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {course.description}
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "flex-start", sm: "center" }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <AccessTimeRoundedIcon color="primary" />
                  <Typography variant="body2" color="text.primary">
                    {course.duration}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <PeopleAltRoundedIcon color="primary" />
                  <Typography variant="body2" color="text.primary">
                    {course.students.toLocaleString()} students
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <StarRoundedIcon sx={{ color: "#FFB400" }} />
                  <Typography variant="body2" color="text.primary">
                    {course.rating.toFixed(1)} ({course.reviews ?? "4.8k"} reviews)
                  </Typography>
                </Stack>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button size="large" variant="contained" color="success">
                  Enroll Now
                </Button>
                <Stack direction="row" spacing={1} alignItems="baseline">
                  <Typography variant="h5" fontWeight={700}>
                    ${course.price.toFixed(2)}
                  </Typography>
                  {course.oldPrice && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textDecoration: "line-through" }}
                    >
                      ${course.oldPrice.toFixed(2)}
                    </Typography>
                  )}
                </Stack>
              </Stack>

              <Stack direction="row" spacing={1}>
                <Chip label={course.level} color="primary" variant="outlined" />
                <Chip label={course.category} variant="outlined" />
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
                src={course.image}
                alt={course.title}
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
            <Tab label="Courses" value="courses" disabled />
            <Tab label="Reviews" value="reviews" disabled />
          </Tabs>

          <Divider />

          {tab === "overview" && (
            <Box sx={{ p: { xs: 2, md: 4 } }}>
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    About This Course
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {course.about}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{xs:12,md:6}}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      What You&apos;ll Learn
                    </Typography>
                    <Stack spacing={1}>
                      {(course.learnPoints ?? []).map((point) => (
                        <Stack
                          key={point}
                          direction="row"
                          spacing={1.5}
                          alignItems="flex-start"
                        >
                          <PlayCircleFilledRoundedIcon
                            fontSize="small"
                            color="primary"
                            sx={{ mt: 0.4 }}
                          />
                          <Typography variant="body2" color="text.primary">
                            {point}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Grid>

                      <Grid size={{xs:12,md:6}}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Skills You&apos;ll Gain
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {(course.skills ?? []).map((skill) => (
                        <Chip key={skill} label={skill} variant="outlined" />
                      ))}
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
                      {course.instructor?.name?.charAt(0) ?? "I"}
                    </Avatar>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {course.instructor?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {course.instructor?.title}
                      </Typography>
                      <Stack direction="row" spacing={2}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <StarRoundedIcon fontSize="small" sx={{ color: "#FFB400" }} />
                          <Typography variant="body2">
                            {course.instructor?.rating}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {course.instructor?.students} learners
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {course.instructor?.courses} courses
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
                      {faqs.map((item) => (
                        <Accordion key={item.question} disableGutters>
                          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {item.question}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2" color="text.secondary">
                              {item.answer}
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
        </Box>
      </Stack>
    </Box>
  );
}

export default CourseDetails;

