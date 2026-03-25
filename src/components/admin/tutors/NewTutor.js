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
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { greenColor } from "@/utils/Colors";
import Swal from "sweetalert2";
import { postJSON, putJSON, getJSON } from "@/utils/http";
import * as Yup from "yup";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "./tutor-phone-input.css";

// Validation schema
const tutorValidationSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: Yup.string()
    .trim()
    .required("Email is required")
    .email("Please enter a valid email address"),
  speciality: Yup.string()
    .trim()
    .required("Speciality is required")
    .min(2, "Speciality must be at least 2 characters"),
  phoneNumber: Yup.string()
    .trim()
    .required("Phone number is required"),
  courses: Yup.array().of(Yup.string().trim().required("Course cannot be empty")),
});

function NewTutor({ tutorId = null }) {
  const router = useRouter();
  const isEditMode = !!tutorId;
  const [loading, setLoading] = useState(isEditMode);
  const [tutorData, setTutorData] = useState({
    name: "",
    email: "",
    speciality: "",
    phoneNumber: "",
    courses: [],
  });
  const [availableCourses, setAvailableCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch available courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true);
        const response = await getJSON("courses");
        if (response && response.success && Array.isArray(response.data)) {
          setAvailableCourses(response.data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Load tutor data when in edit mode
  useEffect(() => {
    const loadTutorData = async () => {
      if (!isEditMode || !tutorId) return;

      try {
        setLoading(true);
        const response = await getJSON(`tutors/${tutorId}`);
        
        if (response && response.success && response.data) {
          const tutor = response.data;
          
          setTutorData({
            name: tutor.name || "",
            email: tutor.email || "",
            speciality: tutor.speciality || "",
            phoneNumber: tutor.phoneNumber || "",
            courses: tutor.courses?.map(c => typeof c === 'object' ? c._id : c) || [],
          });
        }
      } catch (error) {
        console.error("Error loading tutor data:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to load tutor data',
        });
        router.push("/admin/tutors");
      } finally {
        setLoading(false);
      }
    };

    loadTutorData();
  }, [tutorId, isEditMode, router]);

  const handleChange = (field) => (e) => {
    setTutorData({
      ...tutorData,
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

  const handleCourseChange = (event) => {
    const value = event.target.value;
    setTutorData({
      ...tutorData,
      courses: typeof value === 'string' ? value.split(',') : value,
    });
    if (errors.courses) {
      setErrors({
        ...errors,
        courses: "",
      });
    }
  };

  const handleRemoveCourse = (courseId) => {
    setTutorData({
      ...tutorData,
      courses: tutorData.courses.filter((c) => c !== courseId),
    });
  };

  const validateForm = async () => {
    try {
      await tutorValidationSchema.validate(tutorData, { abortEarly: false });
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

  const handleSubmit = async () => {
    const validation = await validateForm();
    if (!validation.isValid) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fix the errors in the form',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      Swal.fire({
        title: isEditMode ? 'Updating...' : 'Creating...',
        text: 'Please wait while we save the tutor',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); },
      });

      // Make API call
      const apiUrl = isEditMode ? `tutors/${tutorId}` : 'tutors';
      const apiMethod = isEditMode ? putJSON : postJSON;
      const response = await apiMethod(apiUrl, {
        name: tutorData.name,
        email: tutorData.email,
        speciality: tutorData.speciality,
        phoneNumber: tutorData.phoneNumber,
        courses: tutorData.courses || [],
      });

      if (response.success) {
        await Swal.fire({
          icon: 'success',
          title: isEditMode ? 'Tutor Updated!' : 'Tutor Created!',
          text: isEditMode 
            ? 'Tutor has been successfully updated.' 
            : 'Tutor has been successfully created.',
          confirmButtonColor: greenColor,
          confirmButtonText: 'Go to Tutors',
        });
        router.push("/admin/tutors");
      }
    } catch (error) {
      console.error('Error saving tutor:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: error.message || 'Failed to save tutor. Please try again.',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton onClick={() => router.push("/admin/tutors")}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography variant="h4" fontWeight={700}>
            {isEditMode ? "Edit Tutor" : "Add New Tutor"}
          </Typography>
        </Stack>

        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Grid container spacing={2}>
                {/* Name */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" fontWeight={500} mb={1}>
                    Name *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="eg: John Doe"
                    value={tutorData.name}
                    onChange={handleChange("name")}
                    error={Boolean(errors.name)}
                    helperText={errors.name}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>

                {/* Email */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" fontWeight={500} mb={1}>
                    Email *
                  </Typography>
                  <TextField
                    fullWidth
                    type="email"
                    placeholder="eg: john.doe@example.com"
                    value={tutorData.email}
                    onChange={handleChange("email")}
                    error={Boolean(errors.email)}
                    helperText={errors.email}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>

                {/* Speciality */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" fontWeight={500} mb={1}>
                    Speciality *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="eg: Mathematics, Physics, etc."
                    value={tutorData.speciality}
                    onChange={handleChange("speciality")}
                    error={Boolean(errors.speciality)}
                    helperText={errors.speciality}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>

                {/* Phone Number */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" fontWeight={500} mb={1}>
                    Phone Number *
                  </Typography>
                  <Box
                    sx={{
                      border: errors.phoneNumber ? "1px solid #d32f2f" : "1px solid #e0e0e0",
                      borderRadius: 2,
                      "&:hover": {
                        borderColor: errors.phoneNumber ? "#d32f2f" : greenColor,
                      },
                      "&:focus-within": {
                        borderColor: greenColor,
                        borderWidth: "2px",
                      },
                    }}
                  >
                    <PhoneInput
                      international
                      defaultCountry="PK"
                      value={tutorData.phoneNumber}
                      onChange={(value) => {
                        setTutorData({
                          ...tutorData,
                          phoneNumber: value || "",
                        });
                        if (errors.phoneNumber) {
                          setErrors({
                            ...errors,
                            phoneNumber: "",
                          });
                        }
                      }}
                      className="tutor-phone-input"
                    />
                  </Box>
                  {errors.phoneNumber && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block", ml: 1.5 }}>
                      {errors.phoneNumber}
                    </Typography>
                  )}
                </Grid>
              </Grid>

              {/* Courses */}
              <Box>
                <Typography variant="body2" fontWeight={500} mb={1}>
                  Courses (Optional)
                </Typography>
                <FormControl fullWidth error={Boolean(errors.courses)}>
                  <Select
                    multiple
                    value={tutorData.courses}
                    onChange={handleCourseChange}
                    displayEmpty
                    sx={{
                      borderRadius: 2,
                    }}
                    disabled={coursesLoading}
                    renderValue={(selected) => {
                      if (selected.length === 0) {
                        return <Typography color="text.secondary">Select courses</Typography>;
                      }
                      return `${selected.length} course(s) selected`;
                    }}
                  >
                    {coursesLoading ? (
                      <MenuItem disabled>Loading courses...</MenuItem>
                    ) : availableCourses.length === 0 ? (
                      <MenuItem disabled>No courses available</MenuItem>
                    ) : (
                      availableCourses.map((course) => (
                        <MenuItem key={course._id || course.id} value={course._id || course.id}>
                          {course.title || "Untitled Course"}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {errors.courses && (
                    <FormHelperText>{errors.courses}</FormHelperText>
                  )}
                </FormControl>

                {/* Selected Courses */}
                {tutorData.courses.length > 0 && (
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mt={2}>
                    {tutorData.courses.map((courseId) => {
                      const course = availableCourses.find(c => (c._id || c.id) === courseId);
                      return (
                        <Chip
                          key={courseId}
                          label={course?.title || courseId}
                          onDelete={() => handleRemoveCourse(courseId)}
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
                      );
                    })}
                  </Stack>
                )}
              </Box>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => router.push("/admin/tutors")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  sx={{
                    backgroundColor: greenColor,
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: greenColor,
                      opacity: 0.9,
                    },
                  }}
                >
                  {isSubmitting ? "Saving..." : isEditMode ? "Update Tutor" : "Create Tutor"}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

export default NewTutor;
