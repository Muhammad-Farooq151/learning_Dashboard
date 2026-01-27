"use client";

import React, { useMemo } from "react";
import {
  Box,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

function formatDuration(totalSeconds = 0) {
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes || 0} total minutes`;
}

function CourseCurriculum({ course }) {
  const lessons = course?.lessons ?? [];

  const { totalLessons, totalDurationSeconds } = useMemo(() => {
    const total = lessons.length;
    const duration = lessons.reduce(
      (sum, lesson) => sum + (lesson.duration || 0),
      0
    );
    return { totalLessons: total, totalDurationSeconds: duration };
  }, [lessons]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="subtitle2" color="text.secondary">
            Course Curriculum
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {totalLessons} lessons •{" "}
            {formatDuration(totalDurationSeconds)}
          </Typography>
        </Stack>

        <Divider />

        {/* Accordions per lesson (mimicking sections) */}
        <Stack spacing={1.5}>
          {lessons.map((lesson, index) => {
            const lessonDuration = formatDuration(lesson.duration || 0);
            const learningPoints = Array.isArray(lesson.learningOutcomes)
              ? lesson.learningOutcomes
              : lesson.learningOutcomes
              ? [lesson.learningOutcomes]
              : [];

            const skills =
              Array.isArray(lesson.skills) && lesson.skills.length > 0
                ? lesson.skills
                : course.skills || [];

            return (
              <Accordion
                key={lesson._id || index}
                disableGutters
                sx={{
                  borderRadius: 3,
                  "&::before": { display: "none" },
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "hidden",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreRoundedIcon />}
                  sx={{
                    "& .MuiAccordionSummary-content": {
                      alignItems: "center",
                      gap: 2,
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ minWidth: 24 }}
                  >
                    {index + 1}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600} flex={1}>
                    {lesson.lessonName || `Lesson ${index + 1}`}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    {lessonDuration}
                  </Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <Grid container spacing={2}>
                    {/* What You'll Learn */}
                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        gutterBottom
                      >
                        What You&apos;ll Learn
                      </Typography>
                      <Stack spacing={1}>
                        {learningPoints.length > 0 ? (
                          learningPoints.map((point, i) => (
                            <Stack
                              key={i}
                              direction="row"
                              spacing={1}
                              alignItems="flex-start"
                            >
                              <CheckCircleRoundedIcon
                                fontSize="small"
                                color="success"
                                sx={{ mt: 0.2 }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {point}
                              </Typography>
                            </Stack>
                          ))
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            Learning outcomes will be added soon.
                          </Typography>
                        )}
                      </Stack>
                    </Grid>

                    {/* Skills you'll gain */}
                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        gutterBottom
                      >
                        Skills you&apos;ll gain
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        {skills && skills.length > 0 ? (
                          skills.map((skill) => (
                            <Chip
                              key={skill}
                              size="small"
                              label={skill}
                              variant="outlined"
                            />
                          ))
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            Skills will be added soon.
                          </Typography>
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            );
          })}

          {lessons.length === 0 && (
            <Box
              sx={{
                borderRadius: 3,
                border: "1px dashed",
                borderColor: "divider",
                p: 4,
                textAlign: "center",
              }}
            >
              <Typography variant="body1" gutterBottom>
                Curriculum will be added soon.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This course doesn&apos;t have lessons configured yet.
              </Typography>
            </Box>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

export default CourseCurriculum;

