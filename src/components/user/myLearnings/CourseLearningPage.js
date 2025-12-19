"use client";

import React, { useState, useMemo } from "react";
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
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useRouter } from "next/navigation";
import { greenColor } from "@/components/utils/Colors";
import Link from "next/link";

// Mock curriculum data - replace with actual API call
const mockCurriculum = {
  sections: [
    {
      id: 1,
      title: "Foundation & Setup",
      lessons: [
        {
          id: 1,
          title: "Course Introduction & Overview",
          duration: "13 Minutes",
          type: "Video",
          completed: true,
          summary:
            "Meet your lead instructor and understand how this accelerator is structured. We'll walk through the milestone roadmap, point system, and support resources so you feel confident before diving in.",
          objectives: [
            "Understand the milestones and certification rubrics",
            "Learn how to submit checkpoints and get mentor feedback",
            "Preview the final certification project requirements",
          ],
          videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        },
        {
          id: 2,
          title: "Setting up Your Development Environment",
          duration: "9 Minutes",
          type: "Video",
          completed: true,
          summary:
            "Configure VS Code, Node.js, browsers, and recommended extensions so you can move fast without tooling headaches.",
          objectives: [
            "Install the course starter kit",
            "Configure formatters, linters, and testing helpers",
            "Learn how to request help when your setup breaks",
          ],
          videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        },
        {
          id: 3,
          title: "Knowledge Assessment",
          duration: "24 Minutes",
          type: "Quiz",
          completed: true,
          summary:
            "Benchmark your current knowledge so we can personalize recommendations throughout the accelerator.",
          objectives: [
            "Complete a timed quiz that covers HTML, CSS, and basic JavaScript",
            "Review personalized follow-up resources",
          ],
        },
      ],
      totalMinutes: 45,
    },
    {
      id: 2,
      title: "Core Development",
      lessons: [
        {
          id: 4,
          title: "Introduction to Core Concepts",
          duration: "15 Minutes",
          type: "Video",
          completed: false,
        },
        {
          id: 5,
          title: "Practical Exercises",
          duration: "15 Minutes",
          type: "Video",
          completed: false,
        },
      ],
      totalMinutes: 30,
    },
    {
      id: 3,
      title: "Advanced Concepts",
      lessons: [
        {
          id: 6,
          title: "Advanced Techniques",
          duration: "20 Minutes",
          type: "Video",
          completed: false,
        },
        {
          id: 7,
          title: "Real-world Applications",
          duration: "15 Minutes",
          type: "Video",
          completed: false,
        },
        {
          id: 8,
          title: "Case Studies",
          duration: "12 Minutes",
          type: "Video",
          completed: false,
        },
        {
          id: 9,
          title: "Advanced Quiz",
          duration: "20 Minutes",
          type: "Quiz",
          completed: false,
        },
      ],
      totalMinutes: 67,
    },
    {
      id: 4,
      title: "Final Project & Certification",
      lessons: [
        {
          id: 10,
          title: "Project Setup",
          duration: "12 Minutes",
          type: "Video",
          completed: false,
        },
        {
          id: 11,
          title: "Project Implementation",
          duration: "15 Minutes",
          type: "Video",
          completed: false,
        },
        {
          id: 12,
          title: "Final Assessment",
          duration: "7 Minutes",
          type: "Quiz",
          completed: false,
        },
      ],
      totalMinutes: 34,
    },
  ],
};

function CourseLearningPage({ courseId, course }) {
  const router = useRouter();
  const [tab, setTab] = useState("course-material");
  const [expandedSections, setExpandedSections] = useState({ 1: true });
  const [selectedLesson, setSelectedLesson] = useState(null);

  const curriculum = useMemo(() => mockCurriculum, []);

  const totalLessons = useMemo(
    () => curriculum.sections.reduce((sum, section) => sum + section.lessons.length, 0),
    [curriculum]
  );

  const totalMinutes = useMemo(
    () => curriculum.sections.reduce((sum, section) => sum + section.totalMinutes, 0),
    [curriculum]
  );

  const handleSectionToggle = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !(prev[sectionId] ?? false),
    }));
  };

  const handleLessonClick = (lesson, section) => {
    setSelectedLesson({
      ...lesson,
      sectionTitle: section.title,
    });
  };

  const closeLessonDialog = () => setSelectedLesson(null);

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
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#F5F7FB", minHeight: "100vh" }}>
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
            <Box sx={{ mt: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" fontWeight={500}>
                  Progress
                </Typography>
                <Typography variant="body2" fontWeight={600} color={greenColor}>
                  {course.progress}%
                </Typography>
              </Box>
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
                              {section.id}. {section.title}
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
                                    </Box>
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
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Additional resources and materials will be available here.
                </Typography>
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
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {course.desc}
                </Typography>
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
                <Box
                  component="video"
                  src={selectedLesson.videoUrl}
                  controls
                  poster="/images/reactc.png"
                  sx={{ width: "100%", bgcolor: "black" }}
                />
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
                      Lesson Overview
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedLesson.summary}
                    </Typography>
                  </>
                )}
                {selectedLesson.objectives && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Key Takeaways
                    </Typography>
                    <Stack spacing={1}>
                      {selectedLesson.objectives.map((item) => (
                        <Stack key={item} direction="row" spacing={1.5} alignItems="flex-start">
                          <CheckCircleRoundedIcon sx={{ color: greenColor, fontSize: 18, mt: 0.4 }} />
                          <Typography variant="body2" color="text.secondary">
                            {item}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, bgcolor: "#F9FAFB" }}>
              <Button onClick={closeLessonDialog} sx={{ textTransform: "none" }}>
                Close
              </Button>
              <Button
                variant="contained"
                sx={{ textTransform: "none", bgcolor: greenColor, ":hover": { bgcolor: greenColor } }}
                endIcon={<ArrowForwardRoundedIcon />}
              >
                Next Lesson
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default CourseLearningPage;

