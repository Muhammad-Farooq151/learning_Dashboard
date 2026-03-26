"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Stack,
  Grid,
  FormControl,
  FormHelperText,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { borderColor, greenColor } from "@/utils/Colors";
import Swal from "sweetalert2";
import { postJSON, putJSON, getJSON } from "@/utils/http";
import * as Yup from "yup";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "../tutors/tutor-phone-input.css";

// Validation schema
const adminValidationSchema = Yup.object().shape({
  fullName: Yup.string()
    .trim()
    .required("Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters"),
  email: Yup.string()
    .trim()
    .required("Email is required")
    .email("Please enter a valid email address"),
  phoneNumber: Yup.string()
    .trim()
    .required("Phone number is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .when('$isEditMode', {
      is: false,
      then: (schema) => schema.required("Password is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  status: Yup.string()
    .oneOf(['active', 'blocked', 'inactive'], "Invalid status")
    .required("Status is required"),
});

function NewAdmin({ adminId = null }) {
  const router = useRouter();
  const isEditMode = !!adminId;
  const [loading, setLoading] = useState(isEditMode);
  const [adminData, setAdminData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    status: "active",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load admin data when in edit mode
  useEffect(() => {
    const loadAdminData = async () => {
      if (!isEditMode || !adminId) return;

      try {
        setLoading(true);
        const response = await getJSON(`admins/${adminId}`);
        
        if (response && response.success && response.data) {
          const admin = response.data;
          
          setAdminData({
            fullName: admin.fullName || "",
            email: admin.email || "",
            phoneNumber: admin.phoneNumber || "",
            password: "", // Don't load password
            status: admin.status || "active",
          });
        }
      } catch (error) {
        console.error("Error loading admin data:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to load admin data',
        });
        router.push("/admin/admins");
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [adminId, isEditMode, router]);

  const handleChange = (field) => (e) => {
    setAdminData({
      ...adminData,
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

  const handlePhoneChange = (value) => {
    setAdminData({
      ...adminData,
      phoneNumber: value || "",
    });
    if (errors.phoneNumber) {
      setErrors({
        ...errors,
        phoneNumber: "",
      });
    }
  };

  const validateForm = async () => {
    try {
      await adminValidationSchema.validate(adminData, { 
        abortEarly: false,
        context: { isEditMode }
      });
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
        text: 'Please wait while we save the admin',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); },
      });

      const payload = {
        fullName: adminData.fullName.trim(),
        email: adminData.email.trim(),
        phoneNumber: adminData.phoneNumber.trim(),
        status: adminData.status,
      };

      // Only include password if provided (for edit) or required (for new)
      if (!isEditMode || adminData.password) {
        payload.password = adminData.password;
      }

      const response = isEditMode
        ? await putJSON(`admins/${adminId}`, payload)
        : await postJSON('admins', payload);

      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: isEditMode ? 'Updated!' : 'Created!',
          text: isEditMode 
            ? 'Admin has been successfully updated.' 
            : 'Admin has been successfully created.',
          confirmButtonColor: greenColor,
          confirmButtonText: 'OK',
        }).then(() => {
          router.push("/admin/admins");
        });
      }
    } catch (error) {
      console.error('Error saving admin:', error);
      Swal.fire({
        icon: 'error',
        title: isEditMode ? 'Update Failed' : 'Creation Failed',
        text: error.message || 'Failed to save admin. Please try again.',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" alignItems="center" gap={2}>
          <IconButton onClick={() => router.push("/admin/admins")}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography variant="h4" fontWeight={700}>
            {isEditMode ? "Edit Admin" : "Add New Admin"}
          </Typography>
        </Stack>

        {/* Form */}
        <Box sx={{ border: `1px solid ${borderColor}`, borderRadius: 2, p: 3 }}>
          <CardContent sx={{ p: 0 }}>
            <Stack spacing={3}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" fontWeight={500} mb={1}>
                    Full Name *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="eg: John Doe"
                    value={adminData.fullName}
                    onChange={handleChange("fullName")}
                    error={Boolean(errors.fullName)}
                    helperText={errors.fullName}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" fontWeight={500} mb={1}>
                    Email *
                  </Typography>
                  <TextField
                    fullWidth
                    type="email"
                    placeholder="eg: john.doe@example.com"
                    value={adminData.email}
                    onChange={handleChange("email")}
                    error={Boolean(errors.email)}
                    helperText={errors.email}
                    disabled={isEditMode} // Don't allow email change in edit mode
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" fontWeight={500} mb={1}>
                    Phone Number *
                  </Typography>
                  <Box
                    sx={{
                      border: "1px solid",
                      borderColor: errors.phoneNumber ? "error.main" : "rgba(0, 0, 0, 0.23)",
                      borderRadius: 2,
                      minHeight: 56,
                      display: "flex",
                      alignItems: "center",
                      px: 1.75,
                      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": {
                        borderColor: errors.phoneNumber ? "error.main" : "text.primary",
                      },
                      "&:focus-within": {
                        borderColor: errors.phoneNumber ? "error.main" : "primary.main",
                        boxShadow: errors.phoneNumber
                          ? "0 0 0 1px rgba(211, 47, 47, 0.2)"
                          : "0 0 0 1px rgba(25, 118, 210, 0.2)",
                      },
                    }}
                  >
                    <PhoneInput
                      international
                      defaultCountry="PK"
                      value={adminData.phoneNumber}
                      onChange={handlePhoneChange}
                      className="tutor-phone-input"
                    />
                  </Box>
                  {errors.phoneNumber && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block", ml: 1.5 }}>
                      {errors.phoneNumber}
                    </Typography>
                  )}
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" fontWeight={500} mb={1}>
                    Status *
                  </Typography>
                  <FormControl fullWidth error={Boolean(errors.status)}>
                    <Select
                      value={adminData.status}
                      onChange={handleChange("status")}
                      displayEmpty
                      sx={{
                        borderRadius: 2,
                      }}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="blocked">Blocked</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                    {errors.status && (
                      <FormHelperText error>{errors.status}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" fontWeight={500} mb={1}>
                    {isEditMode ? "New Password" : "Password"} {!isEditMode ? "*" : ""}
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder={isEditMode ? "Leave blank to keep current password" : "Enter password"}
                    type={showPassword ? "text" : "password"}
                    value={adminData.password}
                    onChange={handleChange("password")}
                    error={Boolean(errors.password)}
                    helperText={errors.password || (isEditMode ? "Leave blank to keep current password" : "")}
                    required={!isEditMode}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
              </Grid>

              {/* Action Buttons */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="flex-end"
                sx={{ mt: 3 }}
              >
                <Button
                  variant="outlined"
                  onClick={() => router.push("/admin/admins")}
                  disabled={isSubmitting}
                  sx={{ textTransform: "none", width: { xs: "100%", sm: "auto" } }}
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
                    width: { xs: "100%", sm: "auto" },
                    "&:hover": {
                      backgroundColor: greenColor,
                      opacity: 0.9,
                    },
                  }}
                >
                  {isSubmitting ? "Saving..." : isEditMode ? "Update Admin" : "Create Admin"}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Box>
      </Stack>
    </Box>
  );
}

export default NewAdmin;
