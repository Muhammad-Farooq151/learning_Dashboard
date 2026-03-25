"use client";

import React, { useState, useEffect } from "react";
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
  FormHelperText,
  Select,
  Menu,
  MenuItem,
  Chip,
  Autocomplete,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
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
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { greenColor } from "@/utils/Colors";
import Swal from "sweetalert2";
import { postFormData, putFormData, getJSON } from "@/utils/http";
import * as Yup from "yup";

const steps = ["Course Details", "Upload Course Video", "Ready to Publish"];

// Validation schemas for each step
const step0ValidationSchema = Yup.object().shape({
  title: Yup.string()
    .trim()
    .required("Course title is required")
    .min(5, "Course title must be at least 5 characters")
    .max(200, "Course title must be less than 200 characters"),
  category: Yup.string().required("Category is required"),
  instructor: Yup.string()
    .trim()
    .required("Instructor name is required")
    .min(2, "Instructor name must be at least 2 characters"),
  price: Yup.string()
    .trim()
    .required("Price is required")
    .matches(/^\d+(\.\d{1,2})?$/, "Please enter a valid price (numbers only, e.g., 800 or 800.50)"),
  discountPercentage: Yup.number()
    .typeError("Discount must be a number")
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100%"),
  courseLevel: Yup.string().required("Course level is required"),
  taxPercentage: Yup.number()
    .typeError("Tax must be a number")
    .min(0, "Tax cannot be negative")
    .max(70, "Tax cannot exceed 70%"),
  description: Yup.string()
    .trim()
    .required("Description is required")
    .min(50, "Description must be at least 50 characters")
    .max(5000, "Description must be less than 5000 characters"),
});

// Create validation schema based on edit mode
const createStep1ValidationSchema = (isEditMode) => Yup.object().shape({
  lessons: Yup.array()
    .of(
      Yup.object().shape({
        lessonName: Yup.string()
          .trim()
          .required("Lesson name is required")
          .min(3, "Lesson name must be at least 3 characters"),
        learningOutcomes: Yup.string()
          .trim()
          .required("Learning outcomes are required")
          .min(20, "Learning outcomes must be at least 20 characters"),
        videoFile: isEditMode 
          ? Yup.mixed()
              .nullable()
              .test("fileSize", "Video file size must be less than 800MB", (value) => {
                if (!value) return true; // Optional in edit mode
                return value.size <= 800 * 1024 * 1024;
              })
              .test("fileType", "Only MP4, MOV, and AVI files are allowed", (value) => {
                if (!value) return true; // Optional in edit mode
                const allowedTypes = ["video/mp4", "video/mov", "video/avi", "video/quicktime"];
                return allowedTypes.includes(value.type);
              })
          : Yup.mixed()
              .required("Video file is required")
              .test("fileSize", "Video file size must be less than 800MB", (value) => {
                if (!value) return false;
                return value.size <= 800 * 1024 * 1024;
              })
              .test("fileType", "Only MP4, MOV, and AVI files are allowed", (value) => {
                if (!value) return false;
                const allowedTypes = ["video/mp4", "video/mov", "video/avi", "video/quicktime"];
                return allowedTypes.includes(value.type);
              }),
      })
    )
    .min(1, "At least one lesson is required"),
});

// Create validation schema based on edit mode
const createStep2ValidationSchema = (isEditMode) => Yup.object().shape({
  thumbnailFile: isEditMode
    ? Yup.mixed()
        .nullable()
        .test("fileSize", "Image file size must be less than 10MB", (value) => {
          if (!value) return true; // Optional in edit mode
          return value.size <= 10 * 1024 * 1024;
        })
        .test("fileType", "Only JPEG and PNG images are allowed", (value) => {
          if (!value) return true; // Optional in edit mode
          const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
          return allowedTypes.includes(value.type);
        })
    : Yup.mixed()
        .required("Thumbnail image is required")
        .test("fileSize", "Image file size must be less than 10MB", (value) => {
          if (!value) return false;
          return value.size <= 10 * 1024 * 1024;
        })
        .test("fileType", "Only JPEG and PNG images are allowed", (value) => {
          if (!value) return false;
          const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
          return allowedTypes.includes(value.type);
        }),
});

function NewCourse({ courseId = null }) {
  const router = useRouter();
  const isEditMode = !!courseId;
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(isEditMode);
  const [courseData, setCourseData] = useState({
    title: "",
    category: "",
    instructor: "",
    price: "",
    discountPercentage: "",
    courseLevel: "",
    taxPercentage: "",
    skills: [],
    description: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [tutors, setTutors] = useState([]);
  const [tutorsLoading, setTutorsLoading] = useState(false);
  const [faqs, setFaqs] = useState([
    {
      question: "",
      answer: "",
    },
  ]);
  const [courseResources, setCourseResources] = useState([
    {
      name: "",
      description: "",
      fileType: "",
      file: null,
      fileUrl: null, // For existing files in edit mode
    },
  ]);
  const [lessons, setLessons] = useState([
    {
      lessonName: "",
      skills: [],
      learningOutcomes: "",
      videoFile: null,
      videoUrl: null, // For existing videos in edit mode
    },
  ]);
  const [lessonSkillInputs, setLessonSkillInputs] = useState({});
  const [courseKeywords, setCourseKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [lessonErrors, setLessonErrors] = useState({});
  const [thumbnailError, setThumbnailError] = useState("");
  const [categoryAnchorEl, setCategoryAnchorEl] = useState(null);
  const [courseLevelAnchorEl, setCourseLevelAnchorEl] = useState(null);

  const categoryOptions = [
    "AI Agents & Agentic AI",
    "Programming",
    "Design",
    "Data Science",
    "AI/ML",
  ];

  const courseLevelOptions = ["Beginner", "Intermediate", "Expert"];

  // Fetch tutors
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setTutorsLoading(true);
        const response = await getJSON("tutors");
        if (response && response.success && Array.isArray(response.data)) {
          setTutors(response.data);
        }
      } catch (error) {
        console.error("Error fetching tutors:", error);
      } finally {
        setTutorsLoading(false);
      }
    };

    fetchTutors();
  }, []);

  // Load course data when in edit mode
  useEffect(() => {
    const loadCourseData = async () => {
      if (!isEditMode || !courseId) return;

      try {
        setLoading(true);
        const response = await getJSON(`courses/${courseId}`);
        
        if (response && response.success && response.data) {
          const course = response.data;
          
          // Pre-fill course data
          setCourseData({
            title: course.title || "",
            category: course.category || "",
            instructor: course.instructor || "",
            price: course.price?.toString() || "",
            discountPercentage: course.discountPercentage?.toString() || "0",
            courseLevel: course.courseLevel || "",
            taxPercentage: course.taxPercentage?.toString() || "0",
            skills: course.skills || [],
            description: course.description || "",
          });
          
          // Debug: Log course data to check courseLevel
          console.log("Loaded course data - courseLevel:", course.courseLevel, "taxPercentage:", course.taxPercentage);
          
          // Pre-fill FAQs
          if (course.faqs && course.faqs.length > 0) {
            setFaqs(course.faqs);
          } else {
            setFaqs([{ question: "", answer: "" }]);
          }
          
          // Pre-fill Course Resources
          if (course.resources && course.resources.length > 0) {
            setCourseResources(course.resources.map(resource => ({
              name: resource.name || "",
              description: resource.description || "",
              fileType: resource.fileType || "",
              file: null,
              fileUrl: resource.fileUrl || null,
            })));
          } else {
            setCourseResources([{
              name: "",
              description: "",
              fileType: "",
              file: null,
              fileUrl: null,
            }]);
          }
          
          // Pre-fill lessons
          if (course.lessons && course.lessons.length > 0) {
            const mappedLessons = course.lessons.map(lesson => ({
              lessonName: lesson.lessonName || "",
              skills: lesson.skills || [],
              learningOutcomes: lesson.learningOutcomes || "",
              videoFile: null, // New video file (optional in edit mode)
              videoUrl: lesson.videoUrl || null, // Existing video URL
            }));
            console.log("Loaded lessons with videoUrls:", mappedLessons.map(l => ({ name: l.lessonName, videoUrl: l.videoUrl })));
            setLessons(mappedLessons);
          } else {
            setLessons([{
              lessonName: "",
              skills: [],
              learningOutcomes: "",
              videoFile: null,
              videoUrl: null,
            }]);
          }
          
          // Pre-fill keywords
          setCourseKeywords(course.keywords || []);
          
          // Set existing thumbnail URL
          if (course.thumbnailUrl) {
            setExistingThumbnailUrl(course.thumbnailUrl);
          }
        }
      } catch (error) {
        console.error("Error loading course data:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to load course data',
        });
        router.push("/admin/courses");
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [courseId, isEditMode, router]);

  const handleChange = (field) => (e) => {
    setCourseData({
      ...courseData,
      [field]: e.target.value,
    });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: "",
      });
    }
  };

  const handleCategoryClick = (event) => {
    setCategoryAnchorEl(event.currentTarget);
  };

  const handleCategoryClose = () => {
    setCategoryAnchorEl(null);
  };

  const handleCategorySelect = (category) => {
    setCourseData({
      ...courseData,
      category: category,
    });
    // Clear error when category is selected
    if (errors.category) {
      setErrors({
        ...errors,
        category: "",
      });
    }
    handleCategoryClose();
  };

  const handleCourseLevelClick = (event) => {
    setCourseLevelAnchorEl(event.currentTarget);
  };

  const handleCourseLevelClose = () => {
    setCourseLevelAnchorEl(null);
  };

  const handleCourseLevelSelect = (level) => {
    setCourseData({
      ...courseData,
      courseLevel: level,
    });
    // Clear error when course level is selected
    if (errors.courseLevel) {
      setErrors({
        ...errors,
        courseLevel: "",
      });
    }
    handleCourseLevelClose();
  };

  // Calculate discounted price
  const calculateDiscountedPrice = () => {
    const originalPrice = parseFloat(courseData.price) || 0;
    const discount = parseFloat(courseData.discountPercentage) || 0;
    if (originalPrice > 0 && discount > 0) {
      const discountAmount = (originalPrice * discount) / 100;
      return (originalPrice - discountAmount).toFixed(2);
    }
    return originalPrice.toFixed(2);
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

  const handleResourceChange = (index, field) => (e) => {
    const newResources = [...courseResources];
    if (field === "file") {
      const file = e.target.files[0];
      if (file) {
        // Validate file type
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
          Swal.fire({
            icon: "error",
            title: "Invalid File Type",
            text: "Only PDF, JPEG, and PNG files are allowed",
          });
          return;
        }
        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          Swal.fire({
            icon: "error",
            title: "File Too Large",
            text: "File size must be less than 10MB",
          });
          return;
        }
        newResources[index].file = file;
        // Auto-detect file type
        if (file.type === "application/pdf") {
          newResources[index].fileType = "PDF";
        } else if (file.type === "image/jpeg") {
          newResources[index].fileType = "JPEG";
        } else if (file.type === "image/png") {
          newResources[index].fileType = "PNG";
        }
      }
    } else {
      newResources[index][field] = e.target.value;
    }
    setCourseResources(newResources);
  };

  const handleAddResource = () => {
    setCourseResources([
      ...courseResources,
      {
        name: "",
        description: "",
        fileType: "",
        file: null,
        fileUrl: null,
      },
    ]);
  };

  const handleRemoveResource = (index) => {
    if (courseResources.length > 1) {
      const newResources = courseResources.filter((_, i) => i !== index);
      setCourseResources(newResources);
    }
  };

  const handleLessonChange = (index, field) => (e) => {
    const newLessons = [...lessons];
    newLessons[index][field] = e.target.value;
    setLessons(newLessons);
    // Clear error when user starts typing
    if (lessonErrors[index]?.[field]) {
      setLessonErrors({
        ...lessonErrors,
        [index]: {
          ...lessonErrors[index],
          [field]: "",
        },
      });
    }
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
        videoUrl: null,
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
    // When a new video is uploaded in edit mode, we keep videoUrl for backend reference
    // but videoFile takes priority in UI display
    setLessons(newLessons);
    console.log(`Video uploaded for lesson ${lessonIndex}:`, {
      lessonName: newLessons[lessonIndex].lessonName,
      videoFile: file?.name,
      hasVideoUrl: !!newLessons[lessonIndex].videoUrl,
    });
    // Clear error when file is selected
    if (lessonErrors[lessonIndex]?.videoFile) {
      setLessonErrors({
        ...lessonErrors,
        [lessonIndex]: {
          ...lessonErrors[lessonIndex],
          videoFile: "",
        },
      });
    }
  };

  const handleRemoveVideoFile = (lessonIndex) => {
    const newLessons = [...lessons];
    newLessons[lessonIndex].videoFile = null;
    // In edit mode, if we remove the new video file, keep the existing videoUrl
    // videoUrl will remain for backend reference
    setLessons(newLessons);
    console.log(`Video removed for lesson ${lessonIndex}, keeping videoUrl:`, newLessons[lessonIndex].videoUrl);
    // Clear error when file is removed
    if (lessonErrors[lessonIndex]?.videoFile) {
      setLessonErrors({
        ...lessonErrors,
        [lessonIndex]: {
          ...lessonErrors[lessonIndex],
          videoFile: "",
        },
      });
    }
    // Reset the file input
    const fileInput = document.getElementById(`video-upload-${lessonIndex}`);
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    // Clear error when file is removed
    if (thumbnailError) {
      setThumbnailError("");
    }
    // Reset the file input
    const fileInput = document.getElementById("thumbnail-upload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const validateStep0 = async () => {
    try {
      await step0ValidationSchema.validate({
        title: courseData.title,
        category: courseData.category,
        instructor: courseData.instructor,
        price: courseData.price,
        discountPercentage: courseData.discountPercentage ? parseFloat(courseData.discountPercentage) : 0,
        courseLevel: courseData.courseLevel,
        taxPercentage: courseData.taxPercentage ? parseFloat(courseData.taxPercentage) : 0,
        description: courseData.description,
      }, { abortEarly: false });
      setErrors({});
      return { isValid: true, errors: null };
    } catch (error) {
      const validationErrors = {};
      if (error.inner) {
        error.inner.forEach((err) => {
          validationErrors[err.path] = err.message;
        });
      }
      setErrors(validationErrors);
      return { isValid: false, errors: validationErrors };
    }
  };

  const validateStep1 = async () => {
    try {
      // In edit mode, check if lesson has either videoFile or videoUrl
      if (isEditMode) {
        console.log("Validating lessons:", lessons.map((l, i) => ({ 
          index: i, 
          name: l.lessonName, 
          hasVideoFile: !!l.videoFile, 
          hasVideoUrl: !!l.videoUrl,
          videoUrl: l.videoUrl 
        })));
        
        // Check each lesson individually and provide specific error messages
        const lessonErrs = {};
        let hasInvalidLesson = false;
        
        lessons.forEach((lesson, index) => {
          // In edit mode, a lesson must have either a new video file or an existing video URL
          if (!lesson.videoFile && !lesson.videoUrl) {
            hasInvalidLesson = true;
            if (!lessonErrs[index]) lessonErrs[index] = {};
            lessonErrs[index].videoFile = "Either upload a new video or keep the existing one";
          }
        });
        
        if (hasInvalidLesson) {
          setLessonErrors(lessonErrs);
          return { 
            isValid: false, 
            errors: { 
              lessons: lessonErrs 
            } 
          };
        }
      }
      
      const schema = createStep1ValidationSchema(isEditMode);
      await schema.validate({
        lessons: lessons,
      }, { abortEarly: false });
      setLessonErrors({});
      return { isValid: true, errors: null };
    } catch (error) {
      const validationErrors = {};
      const lessonErrs = {};
      if (error.inner) {
        error.inner.forEach((err) => {
          if (err.path.includes('[')) {
            // Handle array errors
            const match = err.path.match(/\[(\d+)\]/);
            if (match) {
              const index = parseInt(match[1]);
              const field = err.path.split('.').pop();
              if (!validationErrors.lessons) validationErrors.lessons = {};
              if (!validationErrors.lessons[index]) validationErrors.lessons[index] = {};
              validationErrors.lessons[index][field] = err.message;
              
              // Set lesson errors state
              if (!lessonErrs[index]) lessonErrs[index] = {};
              lessonErrs[index][field] = err.message;
            }
          } else {
            validationErrors[err.path] = err.message;
          }
        });
      }
      setLessonErrors(lessonErrs);
      return { isValid: false, errors: validationErrors };
    }
  };

  const validateStep2 = async () => {
    try {
      // In edit mode, check if thumbnailFile or existingThumbnailUrl exists
      if (isEditMode && !thumbnailFile && !existingThumbnailUrl) {
        setThumbnailError("Thumbnail is required. Please upload an image or keep the existing one.");
        return { 
          isValid: false, 
          errors: { 
            thumbnailFile: "Thumbnail is required" 
          } 
        };
      }
      
      const schema = createStep2ValidationSchema(isEditMode);
      await schema.validate({
        thumbnailFile: thumbnailFile,
      }, { abortEarly: false });
      setThumbnailError("");
      return { isValid: true, errors: null };
    } catch (error) {
      const validationErrors = {};
      let thumbError = "";
      if (error.inner) {
        error.inner.forEach((err) => {
          validationErrors[err.path] = err.message;
          if (err.path === 'thumbnailFile') {
            thumbError = err.message;
          }
        });
      }
      setThumbnailError(thumbError);
      return { isValid: false, errors: validationErrors };
    }
  };

  const handleNext = async () => {
    if (activeStep < steps.length - 1) {
      let validationResult = { isValid: true };

      // Validate based on current step
      if (activeStep === 0) {
        validationResult = await validateStep0();
      } else if (activeStep === 1) {
        validationResult = await validateStep1();
      }

      if (!validationResult.isValid) {
        // Show validation errors in SweetAlert2
        const errorMessages = [];
        
        if (activeStep === 0) {
          Object.values(validationResult.errors || {}).forEach((msg) => {
            if (typeof msg === 'string') {
              errorMessages.push(`• ${msg}`);
            }
          });
        } else if (activeStep === 1) {
          if (validationResult.errors?.lessons) {
            Object.keys(validationResult.errors.lessons).forEach((index) => {
              const lessonErrors = validationResult.errors.lessons[index];
              Object.values(lessonErrors).forEach((msg) => {
                errorMessages.push(`• Lesson ${parseInt(index) + 1}: ${msg}`);
              });
            });
          } else {
            Object.values(validationResult.errors || {}).forEach((msg) => {
              if (typeof msg === 'string') {
                errorMessages.push(`• ${msg}`);
              }
            });
          }
        }

        await Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          html: errorMessages.length > 0 
            ? errorMessages.join('<br>')
            : 'Please fill in all required fields correctly.',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK',
        });
        return;
      }

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

  const validateAllSteps = async () => {
    const errorMessages = [];

    // Validate Step 0
    const step0Result = await validateStep0();
    if (!step0Result.isValid) {
      Object.values(step0Result.errors || {}).forEach((msg) => {
        if (typeof msg === 'string') {
          errorMessages.push(`• ${msg}`);
        }
      });
    }

    // Validate Step 1
    const step1Result = await validateStep1();
    if (!step1Result.isValid) {
      if (step1Result.errors?.lessons) {
        Object.keys(step1Result.errors.lessons).forEach((index) => {
          const lessonErrors = step1Result.errors.lessons[index];
          Object.values(lessonErrors).forEach((msg) => {
            errorMessages.push(`• Lesson ${parseInt(index) + 1}: ${msg}`);
          });
        });
      } else {
        Object.values(step1Result.errors || {}).forEach((msg) => {
          if (typeof msg === 'string') {
            errorMessages.push(`• ${msg}`);
          }
        });
      }
    }

    // Validate Step 2
    const step2Result = await validateStep2();
    if (!step2Result.isValid) {
      Object.values(step2Result.errors || {}).forEach((msg) => {
        if (typeof msg === 'string') {
          errorMessages.push(`• ${msg}`);
        }
      });
    }

    return errorMessages.length > 0 ? errorMessages : null;
  };

  const handlePublish = async () => {
    try {
      // Validate all steps using Yup
      const validationErrors = await validateAllSteps();
      if (validationErrors) {
        await Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          html: validationErrors.join('<br>'),
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK',
        });
        return;
      }

      setIsSubmitting(true);

      // Show loading alert
      Swal.fire({
        title: 'Publishing Course...',
        text: 'Please wait while we upload your course',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Create FormData
      const formData = new FormData();
      
      // Add basic fields
      formData.append('title', courseData.title);
      formData.append('category', courseData.category);
      formData.append('instructor', courseData.instructor);
      formData.append('price', courseData.price);
      formData.append('discountPercentage', courseData.discountPercentage || '0');
      if (courseData.courseLevel) formData.append('courseLevel', courseData.courseLevel);
      formData.append('taxPercentage', courseData.taxPercentage || '0');
      formData.append('description', courseData.description);
      formData.append('status', 'published');
      
      // Add arrays as JSON strings
      formData.append('skills', JSON.stringify(courseData.skills || []));
      formData.append('keywords', JSON.stringify(courseKeywords || []));
      formData.append('faqs', JSON.stringify(faqs.filter(faq => faq.question.trim() && faq.answer.trim())));
      
      // Add course resources
      const resourcesData = courseResources
        .filter(resource => resource.name.trim() && (resource.file || resource.fileUrl))
        .map((resource) => ({
          name: resource.name,
          description: resource.description,
          fileType: resource.fileType,
        }));
      formData.append('resources', JSON.stringify(resourcesData));
      
      // Add resource files
      courseResources.forEach((resource) => {
        if (resource.file) {
          formData.append('resourceFiles', resource.file);
        }
      });
      
      // Prepare lessons data (without video files, they'll be added separately)
      const lessonsData = lessons.map(lesson => ({
        lessonName: lesson.lessonName,
        skills: lesson.skills || [],
        learningOutcomes: lesson.learningOutcomes,
      }));
      formData.append('lessons', JSON.stringify(lessonsData));
      
      // Add thumbnail
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
      
      // Add lesson videos with their lesson indices
      // We need to track which lesson each video belongs to
      const videoIndices = [];
      lessons.forEach((lesson, index) => {
        if (lesson.videoFile) {
          formData.append('lessonVideos', lesson.videoFile);
          videoIndices.push(index); // Track which lesson index this video belongs to
        }
      });
      // Send the mapping of video indices to lesson indices
      formData.append('videoIndices', JSON.stringify(videoIndices));

      // Make API call - use PUT for edit mode, POST for new course
      const apiUrl = isEditMode ? `/courses/${courseId}` : '/courses';
      const apiMethod = isEditMode ? putFormData : postFormData;
      const response = await apiMethod(apiUrl, formData);

      if (response.success) {
        await Swal.fire({
          icon: 'success',
          title: isEditMode ? 'Course Updated!' : 'Course Published!',
          text: isEditMode 
            ? 'Your course has been successfully updated.' 
            : 'Your course has been successfully published and is now live.',
          confirmButtonColor: greenColor,
          confirmButtonText: 'Go to Courses',
        });
        router.push("/admin/courses");
      }
    } catch (error) {
      console.error('Error publishing course:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Publish Failed',
        text: error.message || 'Failed to publish course. Please try again.',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      // Validate basic required fields for draft
      if (!courseData.title || !courseData.title.trim()) {
        await Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: 'Course title is required',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK',
        });
        return;
      }

      setIsSubmitting(true);

      // Show loading alert
      Swal.fire({
        title: 'Saving Draft...',
        text: 'Please wait while we save your course',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Create FormData
      const formData = new FormData();
      
      // Add basic fields
      formData.append('title', courseData.title);
      if (courseData.category) formData.append('category', courseData.category);
      if (courseData.instructor) formData.append('instructor', courseData.instructor);
      if (courseData.price) formData.append('price', courseData.price);
      if (courseData.discountPercentage) formData.append('discountPercentage', courseData.discountPercentage);
      if (courseData.courseLevel) formData.append('courseLevel', courseData.courseLevel);
      if (courseData.taxPercentage) formData.append('taxPercentage', courseData.taxPercentage);
      if (courseData.description) formData.append('description', courseData.description);
      formData.append('status', 'draft');
      
      // Add arrays as JSON strings
      formData.append('skills', JSON.stringify(courseData.skills || []));
      formData.append('keywords', JSON.stringify(courseKeywords || []));
      formData.append('faqs', JSON.stringify(faqs.filter(faq => faq.question.trim() && faq.answer.trim())));
      
      // Add course resources
      const resourcesData = courseResources
        .filter(resource => resource.name.trim() && (resource.file || resource.fileUrl))
        .map((resource) => ({
          name: resource.name,
          description: resource.description,
          fileType: resource.fileType,
        }));
      formData.append('resources', JSON.stringify(resourcesData));
      
      // Add resource files
      courseResources.forEach((resource) => {
        if (resource.file) {
          formData.append('resourceFiles', resource.file);
        }
      });
      
      // Prepare lessons data
      const lessonsData = lessons.map(lesson => ({
        lessonName: lesson.lessonName || '',
        skills: lesson.skills || [],
        learningOutcomes: lesson.learningOutcomes || '',
      }));
      formData.append('lessons', JSON.stringify(lessonsData));
      
      // Add thumbnail if provided
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
      
      // Add lesson videos with their lesson indices
      const videoIndices = [];
      lessons.forEach((lesson, index) => {
        if (lesson.videoFile) {
          formData.append('lessonVideos', lesson.videoFile);
          videoIndices.push(index);
        }
      });
      formData.append('videoIndices', JSON.stringify(videoIndices));

      // Make API call - use PUT for edit mode, POST for new course
      const apiUrl = isEditMode ? `/courses/${courseId}` : '/courses';
      const apiMethod = isEditMode ? putFormData : postFormData;
      const response = await apiMethod(apiUrl, formData);

      if (response.success) {
        await Swal.fire({
          icon: 'success',
          title: isEditMode ? 'Course Updated!' : 'Draft Saved!',
          text: isEditMode 
            ? 'Your course has been successfully updated.' 
            : 'Your course has been saved as draft.',
          confirmButtonColor: greenColor,
          confirmButtonText: 'OK',
        });
        router.push("/admin/courses");
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: error.message || 'Failed to save draft. Please try again.',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK',
      });
    } finally {
      setIsSubmitting(false);
    }
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
                    error={Boolean(errors.title)}
                    helperText={errors.title}
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
                  <Box sx={{ position: "relative" }}>
                    <Button
                      variant="outlined"
                      onClick={handleCategoryClick}
                      endIcon={<KeyboardArrowDownRoundedIcon />}
                      fullWidth
                      sx={{
                        justifyContent: "space-between",
                        border: errors.category ? "1px solid #d32f2f" : "1px solid #E2E8F0",
                        height: "56px",
                        bgcolor: "white",
                        color: courseData.category ? "black" : "#64748B",
                        textTransform: "none",
                        borderRadius: 2,
                        "&:hover": {
                          border: errors.category ? "1px solid #d32f2f" : "1px solid #E2E8F0",
                          backgroundColor: "white",
                        },
                      }}
                    >
                      {courseData.category || "Select Category"}
                    </Button>
                    <Menu
                      anchorEl={categoryAnchorEl}
                      open={Boolean(categoryAnchorEl)}
                      onClose={handleCategoryClose}
                      disablePortal={true}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "left",
                      }}
                      PaperProps={{
                        sx: {
                          mt: 0.5,
                          minWidth: 200,
                          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                          borderRadius: 2,
                          border: "1px solid #E2E8F0",
                          maxHeight: 300,
                          overflow: "auto",
                        },
                      }}
                      MenuListProps={{
                        sx: { py: 0.5 },
                      }}
                    >
                      {categoryOptions.map((category) => (
                        <MenuItem
                          key={category}
                          onClick={() => handleCategorySelect(category)}
                          sx={{
                            backgroundColor:
                              courseData.category === category ? "#F1F5F9" : "transparent",
                            "&:hover": { backgroundColor: "#F8FAFC" },
                          }}
                        >
                          {category}
                        </MenuItem>
                      ))}
                    </Menu>
                    {errors.category && (
                      <FormHelperText error sx={{ mt: 0.5, mx: 1.75 }}>
                        {errors.category}
                      </FormHelperText>
                    )}
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" fontWeight={500} mb={1}>
                    Course Level *
                  </Typography>
                  <Box sx={{ position: "relative" }}>
                    <Button
                      variant="outlined"
                      onClick={handleCourseLevelClick}
                      endIcon={<KeyboardArrowDownRoundedIcon />}
                      fullWidth
                      sx={{
                        justifyContent: "space-between",
                        border: errors.courseLevel ? "1px solid #d32f2f" : "1px solid #E2E8F0",
                        height: "56px",
                        bgcolor: "white",
                        color: courseData.courseLevel ? "black" : "#64748B",
                        textTransform: "none",
                        borderRadius: 2,
                        "&:hover": {
                          border: errors.courseLevel ? "1px solid #d32f2f" : "1px solid #E2E8F0",
                          backgroundColor: "white",
                        },
                      }}
                    >
                      {courseData.courseLevel || "Select Course Level"}
                    </Button>
                    <Menu
                      anchorEl={courseLevelAnchorEl}
                      open={Boolean(courseLevelAnchorEl)}
                      onClose={handleCourseLevelClose}
                      disablePortal={true}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "left",
                      }}
                      PaperProps={{
                        sx: {
                          mt: 0.5,
                          minWidth: 200,
                          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                          borderRadius: 2,
                          border: "1px solid #E2E8F0",
                          maxHeight: 300,
                          overflow: "auto",
                        },
                      }}
                      MenuListProps={{
                        sx: { py: 0.5 },
                      }}
                    >
                      {courseLevelOptions.map((level) => (
                        <MenuItem
                          key={level}
                          onClick={() => handleCourseLevelSelect(level)}
                          sx={{
                            backgroundColor:
                              courseData.courseLevel === level ? "#F1F5F9" : "transparent",
                            "&:hover": { backgroundColor: "#F8FAFC" },
                          }}
                        >
                          {level}
                        </MenuItem>
                      ))}
                    </Menu>
                    {errors.courseLevel && (
                      <FormHelperText error sx={{ mt: 0.5, mx: 1.75 }}>
                        {errors.courseLevel}
                      </FormHelperText>
                    )}
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" fontWeight={500} mb={1}>
                    Instructor *
                  </Typography>
                  <Autocomplete
                    options={tutors}
                    getOptionLabel={(option) => option.name || "Unnamed Tutor"}
                    value={tutors.find(t => t.name === courseData.instructor) || null}
                    onChange={(event, newValue) => {
                      setCourseData({
                        ...courseData,
                        instructor: newValue ? newValue.name : "",
                      });
                      if (errors.instructor) {
                        setErrors({
                          ...errors,
                          instructor: "",
                        });
                      }
                    }}
                    loading={tutorsLoading}
                    disabled={tutorsLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={tutorsLoading ? "Loading tutors..." : "Search and select instructor"}
                        error={Boolean(errors.instructor)}
                        helperText={errors.instructor}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    )}
                    sx={{
                      "& .MuiAutocomplete-inputRoot": {
                        borderRadius: 2,
                      },
                    }}
                    noOptionsText="No tutors found"
                    filterOptions={(options, { inputValue }) => {
                      return options.filter((option) =>
                        option.name?.toLowerCase().includes(inputValue.toLowerCase())
                      );
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="body2" fontWeight={500} mb={1}>
                    Original Price ($) * 
                  </Typography>
                  <TextField
                    fullWidth
                    type="text"
                    placeholder="e,g:$80"
                    value={courseData.price}
                    onChange={(e) => {
                      // Only allow numbers and decimal point
                      const value = e.target.value;
                      // Allow: numbers, single decimal point, empty string
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        handleChange("price")(e);
                      }
                    }}
                    onKeyPress={(e) => {
                      // Prevent non-numeric characters except decimal point
                      const char = String.fromCharCode(e.which);
                      if (!/[0-9.]/.test(char)) {
                        e.preventDefault();
                      }
                    }}
                    error={Boolean(errors.price)}
                    helperText={errors.price}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="body2" fontWeight={500} mb={1}>
                    Discount Percentage
                  </Typography>
                  <TextField
                    fullWidth
                    type="text"
                    placeholder="eg: 20% (max 100%)"
                    value={courseData.discountPercentage}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numbers and decimal point, max 100
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        const numValue = parseFloat(value) || 0;
                        if (numValue <= 100 || value === '') {
                          handleChange("discountPercentage")(e);
                        }
                      }
                    }}
                    onKeyPress={(e) => {
                      // Prevent non-numeric characters except decimal point
                      const char = String.fromCharCode(e.which);
                      if (!/[0-9.]/.test(char)) {
                        e.preventDefault();
                      }
                    }}
                    error={Boolean(errors.discountPercentage)}
                    helperText={errors.discountPercentage || "Enter 0-100"}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="body2" fontWeight={500} mb={1}>
                    Tax Percentage *
                  </Typography>
                  <TextField
                    fullWidth
                    type="text"
                    placeholder="eg: 8% (min 0%, max 70%)"
                    value={courseData.taxPercentage}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numbers and decimal point, max 70
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        const numValue = parseFloat(value) || 0;
                        if (numValue <= 70 || value === '') {
                          handleChange("taxPercentage")(e);
                        }
                      }
                    }}
                    onKeyPress={(e) => {
                      // Prevent non-numeric characters except decimal point
                      const char = String.fromCharCode(e.which);
                      if (!/[0-9.]/.test(char)) {
                        e.preventDefault();
                      }
                    }}
                    error={Boolean(errors.taxPercentage)}
                    helperText={errors.taxPercentage || "Minimum 0%, Maximum 70%"}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="body2" fontWeight={500} mb={1}>
                    Discounted Price
                  </Typography>
                  <TextField
                    fullWidth
                    type="text"
                    value={calculateDiscountedPrice()}
                    disabled
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                    helperText="Calculated automatically"
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
                    error={Boolean(errors.description)}
                    helperText={errors.description}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Course Resources Section */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" fontWeight={600} mb={1}>
                Course Resources
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Upload PDF Handouts or resources you have
              </Typography>

              {courseResources.map((resource, index) => (
                <Box key={index} mb={4}>
                  <Grid container spacing={3}>
                    {/* Left Side - File Upload Area */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box
                        sx={{
                          border: "2px dashed",
                          borderColor: greenColor,
                          borderRadius: 2,
                          bgcolor: "#F1FBF8",
                          p: 4,
                          textAlign: "center",
                          position: "relative",
                          minHeight: 300,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {resource.file || resource.fileUrl ? (
                          <Box>
                            <CheckCircleRoundedIcon
                              sx={{ fontSize: 48, color: greenColor, mb: 2 }}
                            />
                            <Typography variant="body2" fontWeight={500} mb={1}>
                              {resource.file?.name || "File Uploaded"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {resource.file
                                ? `${(resource.file.size / 1024 / 1024).toFixed(2)} MB`
                                : "Existing file"}
                            </Typography>
                            <Button
                              component="label"
                              variant="outlined"
                              size="small"
                              sx={{ mt: 2, textTransform: "none" }}
                            >
                              Change File
                              <input
                                type="file"
                                hidden
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleResourceChange(index, "file")}
                              />
                            </Button>
                          </Box>
                        ) : (
                          <>
                            <CloudUploadRoundedIcon
                              sx={{ fontSize: 48, color: greenColor, mb: 2 }}
                            />
                            <Typography variant="body2" fontWeight={500} mb={1}>
                              Drag & Drop File to Upload
                            </Typography>
                            <Typography variant="caption" color="text.secondary" mb={2}>
                              Max File Size: Up to 10MB
                            </Typography>
                            <Typography variant="caption" color="text.secondary" mb={2}>
                              Supported Formats: PDF, JPEG, PNG
                            </Typography>
                            <Button
                              component="label"
                              variant="contained"
                              sx={{
                                bgcolor: greenColor,
                                textTransform: "none",
                                "&:hover": { bgcolor: greenColor },
                              }}
                            >
                              Select File
                              <input
                                type="file"
                                hidden
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleResourceChange(index, "file")}
                              />
                            </Button>
                          </>
                        )}
                      </Box>
                    </Grid>

                    {/* Right Side - Resource Details */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="body2" fontWeight={500} mb={1}>
                            Resource or Handout Name
                          </Typography>
                          <TextField
                            fullWidth
                            placeholder="eg: Complete Agentic AI Engineering Handout"
                            value={resource.name}
                            onChange={handleResourceChange(index, "name")}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                              },
                            }}
                          />
                        </Box>

                        <Box>
                          <Typography variant="body2" fontWeight={500} mb={1}>
                            Short Description
                          </Typography>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="eg: Comprehensive guide with all concepts and examples"
                            value={resource.description}
                            onChange={handleResourceChange(index, "description")}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                              },
                            }}
                          />
                        </Box>

                        <Box>
                          <Typography variant="body2" fontWeight={500} mb={1}>
                            File Type
                          </Typography>
                          <FormControl fullWidth>
                            <Select
                              value={resource.fileType}
                              onChange={handleResourceChange(index, "fileType")}
                              displayEmpty
                              sx={{
                                borderRadius: 2,
                              }}
                            >
                              <MenuItem value="" disabled>
                                eg: PDF, JPEG, PNG
                              </MenuItem>
                              <MenuItem value="PDF">PDF</MenuItem>
                              <MenuItem value="JPEG">JPEG</MenuItem>
                              <MenuItem value="PNG">PNG</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>

                        {courseResources.length > 1 && (
                          <Button
                            startIcon={<DeleteRoundedIcon />}
                            onClick={() => handleRemoveResource(index)}
                            sx={{
                              color: "error.main",
                              textTransform: "none",
                              alignSelf: "flex-start",
                            }}
                          >
                            Remove Resource
                          </Button>
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              ))}

              <Button
                startIcon={<AddRoundedIcon />}
                onClick={handleAddResource}
                sx={{
                  color: greenColor,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#F1FBF8",
                  },
                }}
              >
                 Add Another Resource or Handout
              </Button>
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
                Add More FAQs
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

            {lessons.map((lesson, lessonIndex) => {
              // Debug: Log lesson state for rendering
              if (lesson.videoFile) {
                console.log(`Rendering lesson ${lessonIndex} with videoFile:`, lesson.videoFile.name);
              }
              return (
              <Box
                key={`lesson-${lessonIndex}-${lesson.lessonName || 'new'}`}
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
                    <Box>
                      <Box
                        sx={{
                          border: lessonErrors[lessonIndex]?.videoFile 
                            ? "2px dashed #EF4444" 
                            : "2px dashed #C8F4DC",
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
                            borderColor: lessonErrors[lessonIndex]?.videoFile 
                              ? "#EF4444" 
                              : greenColor,
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
                        <Box sx={{ position: "relative", width: "100%" }}>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveVideoFile(lessonIndex);
                            }}
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              ml: 1,
                              color: "#EF4444",
                              backgroundColor: "#fff",
                              "&:hover": {
                                backgroundColor: "#FEF2F2",
                                color: "#DC2626",
                              },
                            }}
                          >
                            <CloseRoundedIcon />
                          </IconButton>
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
                      ) : lesson.videoUrl ? (
                        <Box sx={{ position: "relative", width: "100%" }}>
                          <PlayArrowRoundedIcon
                            sx={{
                              fontSize: 60,
                              color: greenColor,
                              mb: 2,
                            }}
                          />
                          <Typography variant="body2" fontWeight={500} mb={1}>
                            Existing Video
                          </Typography>
                          <Typography variant="caption" color="text.secondary" mb={2}>
                            Current video will be kept. Upload a new video to replace it.
                          </Typography>
                          <Button
                            component="a"
                            href={lesson.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="outlined"
                            size="small"
                            startIcon={<PlayArrowRoundedIcon />}
                            sx={{
                              borderColor: greenColor,
                              color: greenColor,
                              textTransform: "none",
                              "&:hover": {
                                borderColor: greenColor,
                                backgroundColor: "#F1FBF8",
                              },
                            }}
                          >
                            View Current Video
                          </Button>
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
                    {lessonErrors[lessonIndex]?.videoFile && (
                      <Typography 
                        variant="caption" 
                        color="error" 
                        sx={{ mt: 1, display: "block" }}
                      >
                        {lessonErrors[lessonIndex].videoFile}
                      </Typography>
                    )}
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
                          error={Boolean(lessonErrors[lessonIndex]?.lessonName)}
                          helperText={lessonErrors[lessonIndex]?.lessonName}
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
                          error={Boolean(lessonErrors[lessonIndex]?.learningOutcomes)}
                          helperText={lessonErrors[lessonIndex]?.learningOutcomes}
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
              );
            })}
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
                <Box>
                  <Box
                    sx={{
                      border: thumbnailError 
                        ? "2px dashed #EF4444" 
                        : "2px dashed #C8F4DC",
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
                        borderColor: thumbnailError 
                          ? "#EF4444" 
                          : greenColor,
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
                        // Clear error when file is selected
                        if (thumbnailError) {
                          setThumbnailError("");
                        }
                      }
                    }}
                  />
                  {thumbnailFile ? (
                    <Box sx={{ position: "relative", width: "100%" }}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveThumbnail();
                        }}
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          ml: 1,
                          color: "#EF4444",
                          backgroundColor: "#fff",
                          "&:hover": {
                            backgroundColor: "#FEF2F2",
                            color: "#DC2626",
                          },
                        }}
                      >
                        <CloseRoundedIcon />
                      </IconButton>
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
                  ) : existingThumbnailUrl ? (
                    <Box sx={{ position: "relative", width: "100%" }}>
                      <Box
                        component="img"
                        src={existingThumbnailUrl}
                        alt="Current thumbnail"
                        sx={{
                          maxWidth: "100%",
                          maxHeight: 200,
                          borderRadius: 2,
                          mb: 2,
                        }}
                      />
                      <Typography variant="body2" fontWeight={500} mb={1}>
                        Current Thumbnail
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Upload a new image to replace it
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
                {thumbnailError && (
                  <Typography 
                    variant="caption" 
                    color="error" 
                    sx={{ mt: 1, display: "block" }}
                  >
                    {thumbnailError}
                  </Typography>
                )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
          p: { xs: 2, md: 4 },
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
          {isEditMode ? "Edit Course" : "Add New Course"}
        </Typography>
      </Stack>
      <Typography variant="body1" color="text.secondary" mb={4}>
        {isEditMode ? "Update your course information" : "Create a new course for your platform"}
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
                    disabled={isSubmitting}
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
                      "&:disabled": {
                        opacity: 0.6,
                      },
                    }}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handlePublish}
                    disabled={isSubmitting}
                    sx={{
                      backgroundColor: greenColor,
                      textTransform: "none",
                      borderRadius: 2,
                      px: 3,
                      "&:hover": {
                        backgroundColor: greenColor,
                        opacity: 0.9,
                      },
                      "&:disabled": {
                        opacity: 0.6,
                      },
                    }}
                  >
                    {isSubmitting ? "Publishing..." : "Publish"}
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
