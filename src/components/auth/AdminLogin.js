"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { greenColor } from "../utils/Colors";
import { postJSON } from "@/utils/http";
import { persistAuthToken } from "@/utils/authStorage";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const response = await postJSON("/auth/admin-login", values);
        
        if (response.success && response.data) {
          // Verify role is admin
          if (response.data.user.role !== 'admin') {
            throw new Error('Access denied. Admin privileges required.');
          }
          
          persistAuthToken(response.data.token, response.data.user, rememberMe);
          
          await Swal.fire({
            icon: 'success',
            title: 'Welcome Admin!',
            text: 'You have successfully logged in to the admin panel.',
            confirmButtonColor: greenColor,
            confirmButtonText: 'Continue',
          });
          
          router.push("/admin/dashboard");
        }
      } catch (e) {
        await Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: e.message || 'Invalid email or password. Please try again.',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK',
        });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        px: 2,
        borderRadius: "20px",
        py: 4,
      }}
    >
      <Box
        sx={{ width: "100%", maxWidth: 550, borderRadius: 4, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h5" fontWeight={600} fontSize={["18px","20px","22px"]} textAlign="center">
              Admin Login - LearningHub
            </Typography>
            <Typography variant="body2" fontWeight={300} fontSize={["16px","16px","16px"]} textAlign="center">
              Access the admin panel to manage courses, users, transactions, and more.
            </Typography>
          </Stack>

          <Box component="form" noValidate onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
            <Stack spacing={1.25}>
              <Typography variant="h5" fontWeight={600} fontSize={["14px","14px","14px"]}>
                Email Address
              </Typography>

              <TextField
                fullWidth
                size="medium"
                placeholder="eg: admin@learninghub.com"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={
                  formik.touched.email && formik.errors.email ? formik.errors.email : null
                } 
                FormHelperTextProps={{ sx: { m: 0, mt: 0.5 } }} 
                InputProps={{
                  sx:{
                    borderRadius:"8px",
                  },
                }}
              />

              <Typography fontWeight={600} fontSize={["14px","14px","14px"]}>
                Password
              </Typography>

              <TextField
                fullWidth
                size="medium"
                placeholder="Enter your password"
                type={showPass ? "text" : "password"}
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={
                  formik.touched.password && formik.errors.password ? formik.errors.password : null
                } 
                FormHelperTextProps={{ sx: { m: 0, mt: 0.5 } }}
                InputProps={{
                  sx:{
                    borderRadius:"8px",
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPass((s) => !s)} edge="end">
                        {showPass ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box display={"flex"} justifyContent={"space-between"} sx={{py:1}}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      size="small"
                      sx={{
                        color: '#666',
                        '&.Mui-checked': {
                          color: greenColor,
                        },
                      }}
                    />
                  }
                  label={
                    <Typography fontSize={"14px"} fontWeight={400}>
                      Remember Me
                    </Typography>
                  }
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disableElevation
                disabled={loading}
                sx={{ py: 1.25, borderRadius: 2, textTransform: "none", fontWeight: 600, fontSize: "18px", bgcolor: greenColor }}
              >
                {loading ? (
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                    <ClipLoader size={18} />
                    Logging in…
                  </Box>
                ) : (
                  "Login as Admin"
                )}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Box>
    </Box>
  );
}
