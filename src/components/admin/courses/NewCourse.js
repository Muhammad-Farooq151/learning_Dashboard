"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Grid,
  FormControl,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { greenColor } from "@/utils/Colors";

const steps = ["Course Details", "Upload Course Video", "Ready to Publish"];

function NewCourse() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [courseData, setCourseData] = useState({
    title: "",
    category: "",
    instructor: "",
    price: "",
    skills: [],
    description: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [faqs, setFaqs] = useState([
    {
      question: "",
      answer: "",
    },
  ]);
  const [lessons, setLessons] = useState([
    {
      lessonName: "",
      skills: [],
      learningOutcomes: "",
      videoFile: null,
    },
  ]);
  const [lessonSkillInputs, setLessonSkillInputs] = useState({});
  const [courseKeywords, setCourseKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (field) => (e) => {
    setCourseData({
      ...courseData,
      [field]: e.target.value,
    });
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !courseData.skills.includes(skillInput.trim())) {
      setCourseData({
        ...courseData,
        skills: [...courseData.skills, skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setCourseData({
      ...courseData,
      skills: courseData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleFaqChange = (index, field) => (e) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = e.target.value;
    setFaqs(newFaqs);
  };

  const handleAddFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const handleLessonChange = (index, field) => (e) => {
    const newLessons = [...lessons];
    newLessons[index][field] = e.target.value;
    setLessons(newLessons);
  };

  const handleAddLessonSkill = (lessonIndex) => {
    const skillInput = lessonSkillInputs[lessonIndex] || "";
    if (skillInput.trim()) {
      const newLessons = [...lessons];
      if (!newLessons[lessonIndex].skills.includes(skillInput.trim())) {
        newLessons[lessonIndex].skills.push(skillInput.trim());
        setLessons(newLessons);
      }
      setLessonSkillInputs({
        ...lessonSkillInputs,
        [lessonIndex]: "",
      });
    }
  };

  const handleRemoveLessonSkill = (lessonIndex, skillToRemove) => {
    const newLessons = [...lessons];
    newLessons[lessonIndex].skills = newLessons[lessonIndex].skills.filter(
      (skill) => skill !== skillToRemove
    );
    setLessons(newLessons);
  };

  const handleAddLesson = () => {
    setLessons([
      ...lessons,
      {
        lessonName: "",
        skills: [],
        learningOutcomes: "",
        videoFile: null,
      },
    ]);
  };

  const handleRemoveLesson = (index) => {
    if (lessons.length > 1) {
      const newLessons = lessons.filter((_, i) => i !== index);
      setLessons(newLessons);
    }
  };

  const handleVideoFileChange = (lessonIndex, file) => {
    const newLessons = [...lessons];
    newLessons[lessonIndex].videoFile = file;
    setLessons(newLessons);
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !courseKeywords.includes(keywordInput.trim())) {
      setCourseKeywords([...courseKeywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keywordToRemove) => {
    setCourseKeywords(
      courseKeywords.filter((keyword) => keyword !== keywordToRemove)
    );
  };

  const handlePublish = () => {
    // Handle course publication logic here
    console.log("Publishing course:", {
      ...courseData,
      lessons,
      faqs,
      courseKeywords,
      thumbnailFile,
    });
    setShowSuccessModal(true);
  };

  const handleSaveAsDraft = () => {
    // Handle save as draft logic here
    console.log("Saving as draft:", {
      ...courseData,
      lessons,
      faqs,
      courseKeywords,
      thumbnailFile,
    });
    router.push("/admin/courses");
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    router.push("/admin/courses");
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            {/* Course Overview Section */}
            <Box mb={4}>
              <Typography variant="h6" fontWeight={600} mb={1}>
                Course Overview
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Fill in the information for the new course
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" fontWeight={500} mb={1}>
                    Course Title
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="eg: The Complete Agentic AI Engineering Course (2025)"
                    value={courseData.title}
                    onChange={handleChange("title")}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" fontWeight={500} mb={1}>
                    Category
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={courseData.category}
                      onChange={handleChange("category")}
                      displayEmpty
                      sx={{
                        borderRadius: 2,
                      }}
                    >
                      <MenuItem value="">Select Category</MenuItem>
                      <MenuItem value="AI Agents & Agentic AI">
                        AI Agents & Agentic AI
                      </MenuItem>
                      <MenuItem value="Programming">Programming</MenuItem>
                      <MenuItem value="Design">Design</MenuItem>
                      <MenuItem value="Data Science">Data Science</MenuItem>
                      <MenuItem value="AI/ML">AI/ML</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" fontWeight={500} mb={1}>
                    Instructor
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="eg: Luke Ledner"
                    value={courseData.instructor}
                    onChange={handleChange("instructor")}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" fontWeight={500} mb={1}>
                    Price
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="eg: $800"
                    value={courseData.price}
                    onChange={handleChange("price")}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" fontWeight={500} mb={1}>
                    Skills that Student gain
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={1}>
                    {courseData.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        onDelete={() => handleRemoveSkill(skill)}
                        deleteIcon={<CloseRoundedIcon />}
                        sx={{
                          backgroundColor: "#F1F5F9",
                          color: "#1E293B",
                          "& .MuiChip-deleteIcon": {
                            color: "#64748B",
                            "&:hover": {
                              color: "#EF4444",
                            },
                          },
                        }}
                      />
                    ))}
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth
                      placeholder="Add a skill"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleAddSkill}
                      sx={{
                        minWidth: "auto",
                        px: 2,
                        borderRadius: 2,
                        borderColor: "#E2E8F0",
                        "&:hover": {
                          borderColor: "#CBD5E1",
                          backgroundColor: "#F8FAFC",
                        },
                      }}
                    >
                      <AddRoundedIcon />
                    </Button>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" fontWeight={500} mb={1}>
                    Description
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    placeholder="eg: 2025 is the year that Agents enter the..."
                    value={courseData.description}
                    onChange={handleChange("description")}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* FAQs Section */}
            <Box>
              <Typography variant="h6" fontWeight={600} mb={1}>
                FAQs
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Add Relevant FAQs
              </Typography>

              {faqs.map((faq, index) => (
                <Box key={index} mb={3}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body2" fontWeight={500} mb={1}>
                        Question
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="eg: What is a Full-Stack Web Developer?"
                        value={faq.question}
                        onChange={handleFaqChange(index, "question")}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body2" fontWeight={500} mb={1}>
                        Answer
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="eg: A full-stack web developer is someone who is skilled in both front-end and back-end development. They build the user-facing side of applications (front-end) and also work with databases, servers, and frameworks (back-end). Full-stack developers can build and manage entire web applications from start to finish."
                        value={faq.answer}
                        onChange={handleFaqChange(index, "answer")}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}

              <Button
                startIcon={<AddRoundedIcon />}
                onClick={handleAddFaq}
                sx={{
                  color: greenColor,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#F1FBF8",
                  },
                }}
              >
                + Add More FAQs
              </Button>
            </Box>
          </>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" fontWeight={600} mb={1}>
              Upload Course Video
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={4}>
              Upload Video and add some Relevant details about the video lecture
            </Typography>

            {lessons.map((lesson, lessonIndex) => (
              <Box
                key={lessonIndex}
                sx={{
                  mb: 4,
                  p: 3,
                  border: "1px solid #E2E8F0",
                  borderRadius: 3,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={3}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    Lesson {lessonIndex + 1}
                  </Typography>
                  {lessons.length > 1 && (
                    <IconButton
                      onClick={() => handleRemoveLesson(lessonIndex)}
                      sx={{
                        color: "#EF4444",
                        "&:hover": {
                          backgroundColor: "#FEE2E2",
                        },
                      }}
                    >
                      <DeleteRoundedIcon />
                    </IconButton>
                  )}
                </Stack>

                <Grid container spacing={3} mb={3}>
                  {/* Video Upload Area */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box
                      sx={{
                        border: "2px dashed #C8F4DC",
                        borderRadius: 3,
                        p: 4,
                        backgroundColor: "#F1FBF8",
                        textAlign: "center",
                        minHeight: 300,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        position: "relative",
                        "&:hover": {
                          backgroundColor: "#E8F8F3",
                          borderColor: greenColor,
                        },
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file) {
                          handleVideoFileChange(lessonIndex, file);
                        }
                      }}
                    >
                      <input
                        type="file"
                        accept="video/mp4,video/mov,video/avi"
                        style={{ display: "none" }}
                        id={`video-upload-${lessonIndex}`}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleVideoFileChange(lessonIndex, file);
                          }
                        }}
                      />
                      {lesson.videoFile ? (
                        <Box>
                          <PlayArrowRoundedIcon
                            sx={{
                              fontSize: 60,
                              color: greenColor,
                              mb: 2,
                            }}
                          />
                          <Typography variant="body2" fontWeight={500} mb={1}>
                            {lesson.videoFile.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Click to change video
                          </Typography>
                        </Box>
                      ) : (
                        <>
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              border: "2px solid #C8F4DC",
                              borderRadius: 2,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mb: 2,
                            }}
                          >
                            <PlayArrowRoundedIcon
                              sx={{
                                fontSize: 40,
                                color: greenColor,
                              }}
                            />
                          </Box>
                          <Typography variant="body1" fontWeight={500} mb={1}>
                            Drag & Drop video File to Upload
                          </Typography>
                          <Typography variant="caption" color="text.secondary" mb={2}>
                            Max File Size: Up to 800MB
                          </Typography>
                          <Typography variant="caption" color="text.secondary" mb={2}>
                            Supported Formats: MP4, MOV, AVI
                          </Typography>
                        </>
                      )}
                      <label htmlFor={`video-upload-${lessonIndex}`}>
                        <Button
                          component="span"
                          variant="outlined"
                          startIcon={<CloudUploadRoundedIcon />}
                          sx={{
                            mt: 2,
                            borderColor: greenColor,
                            color: greenColor,
                            textTransform: "none",
                            "&:hover": {
                              borderColor: greenColor,
                              backgroundColor: "#F1FBF8",
                            },
                          }}
                        >
                          Select Video
                        </Button>
                      </label>
                    </Box>
                  </Grid>

                  {/* Lesson Details */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={3}>
                      <Box>
                        <Typography variant="body2" fontWeight={500} mb={1}>
                          Lesson Name
                        </Typography>
                        <TextField
                          fullWidth
                          placeholder="eg: The Complete Agentic AI Engineering Course (2025)"
                          value={lesson.lessonName}
                          onChange={handleLessonChange(lessonIndex, "lessonName")}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Box>

                      <Box>
                        <Typography variant="body2" fontWeight={500} mb={1}>
                          Skills that Student gain
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          gap={1}
                          mb={1}
                        >
                          {lesson.skills.map((skill, skillIndex) => (
                            <Chip
                              key={skillIndex}
                              label={skill}
                              onDelete={() =>
                                handleRemoveLessonSkill(lessonIndex, skill)
                              }
                              deleteIcon={<CloseRoundedIcon />}
                              sx={{
                                backgroundColor: "#F1FBF8",
                                border: "1px solid #C8F4DC",
                                color: "#065F46",
                                "& .MuiChip-deleteIcon": {
                                  color: "#64748B",
                                  "&:hover": {
                                    color: "#EF4444",
                                  },
                                },
                              }}
                            />
                          ))}
                        </Stack>
                        <Stack direction="row" spacing={1}>
                          <TextField
                            fullWidth
                            placeholder="Add a skill"
                            value={lessonSkillInputs[lessonIndex] || ""}
                            onChange={(e) =>
                              setLessonSkillInputs({
                                ...lessonSkillInputs,
                                [lessonIndex]: e.target.value,
                              })
                            }
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddLessonSkill(lessonIndex);
                              }
                            }}
                            size="small"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                              },
                            }}
                          />
                          <Button
                            variant="outlined"
                            onClick={() => handleAddLessonSkill(lessonIndex)}
                            sx={{
                              minWidth: "auto",
                              px: 2,
                              borderRadius: 2,
                              borderColor: "#E2E8F0",
                              "&:hover": {
                                borderColor: "#CBD5E1",
                                backgroundColor: "#F8FAFC",
                              },
                            }}
                          >
                            <AddRoundedIcon />
                          </Button>
                        </Stack>
                      </Box>

                      <Box>
                        <Typography variant="body2" fontWeight={500} mb={1}>
                          What a Student Learn
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={6}
                          placeholder="• Distinguish between front-end, back-end, and full-stack developers.&#10;• Create and style a webpage with HTML and CSS.&#10;• The benefits of working with UI frameworks."
                          value={lesson.learningOutcomes}
                          onChange={handleLessonChange(
                            lessonIndex,
                            "learningOutcomes"
                          )}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" fontWeight={600} mb={1}>
              Ready To Publish
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={4}>
              Just make some updates and your Course is ready to upload.
            </Typography>

            <Grid container spacing={3}>
              {/* Course Keywords */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" fontWeight={500} mb={1}>
                  Course Keywords
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  gap={1}
                  mb={1}
                >
                  {courseKeywords.map((keyword, index) => (
                    <Chip
                      key={index}
                      label={keyword}
                      onDelete={() => handleRemoveKeyword(keyword)}
                      deleteIcon={<CloseRoundedIcon />}
                      sx={{
                        backgroundColor: "#F1F5F9",
                        color: "#1E293B",
                        "& .MuiChip-deleteIcon": {
                          color: "#64748B",
                          "&:hover": {
                            color: "#EF4444",
                          },
                        },
                      }}
                    />
                  ))}
                </Stack>
                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    placeholder="Add a keyword"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddKeyword();
                      }
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddKeyword}
                    sx={{
                      minWidth: "auto",
                      px: 2,
                      borderRadius: 2,
                      borderColor: "#E2E8F0",
                      "&:hover": {
                        borderColor: "#CBD5E1",
                        backgroundColor: "#F8FAFC",
                      },
                    }}
                  >
                    <AddRoundedIcon />
                  </Button>
                </Stack>
              </Grid>

              {/* Thumbnail Upload */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" fontWeight={500} mb={1}>
                  Thumbnail
                </Typography>
                <Box
                  sx={{
                    border: "2px dashed #C8F4DC",
                    borderRadius: 3,
                    p: 4,
                    backgroundColor: "#F1FBF8",
                    textAlign: "center",
                    minHeight: 300,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    position: "relative",
                    "&:hover": {
                      backgroundColor: "#E8F8F3",
                      borderColor: greenColor,
                    },
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
                      setThumbnailFile(file);
                    }
                  }}
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    style={{ display: "none" }}
                    id="thumbnail-upload"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setThumbnailFile(file);
                      }
                    }}
                  />
                  {thumbnailFile ? (
                    <Box>
                      <ImageRoundedIcon
                        sx={{
                          fontSize: 60,
                          color: greenColor,
                          mb: 2,
                        }}
                      />
                      <Typography variant="body2" fontWeight={500} mb={1}>
                        {thumbnailFile.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Click to change image
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <ImageRoundedIcon
                        sx={{
                          fontSize: 80,
                          color: greenColor,
                          mb: 2,
                        }}
                      />
                      <Typography variant="body1" fontWeight={500} mb={1}>
                        Drag & Drop Thumbnail File to Upload
                      </Typography>
                      <Typography variant="caption" color="text.secondary" mb={1}>
                        Supported Formats: JPEG, PNG
                      </Typography>
                      <Typography variant="caption" color="text.secondary" mb={1}>
                        Max File Size: Up to 10MB
                      </Typography>
                      <Typography variant="caption" color="text.secondary" mb={2}>
                        Size: 1920 x 1080
                      </Typography>
                    </>
                  )}
                  <label htmlFor="thumbnail-upload">
                    <Button
                      component="span"
                      variant="outlined"
                      sx={{
                        mt: 2,
                        borderColor: "#E2E8F0",
                        color: "#64748B",
                        textTransform: "none",
                        backgroundColor: "#fff",
                        "&:hover": {
                          borderColor: "#CBD5E1",
                          backgroundColor: "#F8FAFC",
                        },
                      }}
                    >
                      Select Image
                    </Button>
                  </label>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => router.push("/admin/courses")}
          sx={{
            textTransform: "none",
            color: "text.secondary",
            "&:hover": {
              backgroundColor: "#F8FAFC",
            },
          }}
        >
          Back
        </Button>
        <Typography variant="h4" fontWeight={700}>
          Add New Course
        </Typography>
      </Stack>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Create a new course for your platform
      </Typography>

      {/* Progress Stepper */}
      <Box mb={4}>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            "& .MuiStepConnector-line": {
              borderTopWidth: 2,
              borderColor: "#E2E8F0",
              borderStyle: "dashed",
            },
            "& .MuiStepConnector-active .MuiStepConnector-line": {
              borderColor: greenColor,
            },
            "& .MuiStepConnector-completed .MuiStepConnector-line": {
              borderColor: greenColor,
            },
          }}
        >
          {steps.map((label, index) => {
            const isCompleted = index < activeStep;
            const isActive = index === activeStep;
            return (
              <Step key={label} completed={isCompleted}>
                <StepLabel
                  StepIconComponent={(props) => {
                    if (props.completed) {
                      return (
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            backgroundColor: greenColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                          }}
                        >
                          <CheckRoundedIcon sx={{ fontSize: 20 }} />
                        </Box>
                      );
                    }
                    return (
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          backgroundColor: isActive ? "#1E293B" : "#E2E8F0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: isActive ? "#fff" : "#94A3B8",
                          fontWeight: 600,
                          fontSize: "14px",
                        }}
                      >
                        {index + 1}
                      </Box>
                    );
                  }}
                  sx={{
                    "& .MuiStepLabel-label": {
                      color: isActive ? "#1E293B" : isCompleted ? "#1E293B" : "#94A3B8",
                      fontWeight: isActive || isCompleted ? 600 : 400,
                      fontSize: "14px",
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Box>

      <Card
        sx={{
          borderRadius: 4,
          border: "1px solid #EDF1F7",
          boxShadow: "0px 10px 30px rgba(15, 23, 42, 0.05)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {renderStepContent()}

          <Stack
            direction="row"
            spacing={2}
            justifyContent="space-between"
            mt={4}
            pt={3}
            borderTop="1px solid #E2E8F0"
          >
            <Box>
              {activeStep === 1 && (
                <Button
                  startIcon={<AddRoundedIcon />}
                  onClick={handleAddLesson}
                  sx={{
                    color: greenColor,
                    textTransform: "none",
                    borderColor: greenColor,
                    "&:hover": {
                      backgroundColor: "#F1FBF8",
                      borderColor: greenColor,
                    },
                  }}
                  variant="outlined"
                >
                  Add Another Lesson
                </Button>
              )}
            </Box>
            <Stack direction="row" spacing={2}>
              {activeStep > 0 && (
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    px: 3,
                    borderColor: "#E2E8F0",
                    color: "#64748B",
                    "&:hover": {
                      borderColor: "#CBD5E1",
                      backgroundColor: "#F8FAFC",
                    },
                  }}
                >
                  Back
                </Button>
              )}
              {activeStep === steps.length - 1 ? (
                <>
                  <Button
                    variant="outlined"
                    onClick={handleSaveAsDraft}
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      px: 3,
                      borderColor: "#E2E8F0",
                      color: "#64748B",
                      backgroundColor: "#fff",
                      "&:hover": {
                        borderColor: "#CBD5E1",
                        backgroundColor: "#F8FAFC",
                      },
                    }}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handlePublish}
                    sx={{
                      backgroundColor: greenColor,
                      textTransform: "none",
                      borderRadius: 2,
                      px: 3,
                      "&:hover": {
                        backgroundColor: greenColor,
                        opacity: 0.9,
                      },
                    }}
                  >
                    Publish
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    backgroundColor: greenColor,
                    textTransform: "none",
                    borderRadius: 2,
                    px: 3,
                    "&:hover": {
                      backgroundColor: greenColor,
                      opacity: 0.9,
                    },
                  }}
                >
                  Next
                </Button>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Success Modal */}
      <Dialog
        open={showSuccessModal}
        onClose={handleCloseSuccessModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
          },
        }}
      >
        <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
          <IconButton
            onClick={handleCloseSuccessModal}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "text.secondary",
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
          <Box
            sx={{
              width: 120,
              height: 120,
              mx: "auto",
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                border: "2px solid #E2E8F0",
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <CheckCircleRoundedIcon
                sx={{
                  fontSize: 60,
                  color: greenColor,
                }}
              />
            </Box>
          </Box>
          <Typography variant="h5" fontWeight={600} mb={2}>
            Course Published Successfully
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", pb: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Your course is now live and visible to learners. You can track
            enrollments, manage lessons, and update content anytime from the
            Courses tab.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button
            variant="contained"
            onClick={handleCloseSuccessModal}
            sx={{
              backgroundColor: greenColor,
              textTransform: "none",
              borderRadius: 2,
              px: 4,
              "&:hover": {
                backgroundColor: greenColor,
                opacity: 0.9,
              },
            }}
          >
            Go to Courses
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default NewCourse;
