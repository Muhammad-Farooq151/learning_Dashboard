"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  Link as MLink,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { greenColor } from "../utils/Colors";
import { Email } from "@mui/icons-material";
import { postJSON } from "@/utils/http";

const INPUT_HEIGHT = 56;
const RADIUS = 12;

const validationSchema = Yup.object({
  email: Yup.string().email("Enter a valid email").required("Email is required"),
});

export default function ForgetPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const response = await postJSON("/auth/forgot-password", { email: values.email });
        
        await Swal.fire({
          icon: 'success',
          title: 'Reset Link Sent!',
          text: response.message || 'If an account exists with this email, a password reset link has been sent.',
          confirmButtonColor: greenColor,
          confirmButtonText: 'OK',
        });
        
        router.push(`/password-email-sent?email=${encodeURIComponent(values.email)}`);
      } catch (err) {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'Unable to send reset link. Please try again.',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK',
        });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box sx={{ display: "grid", placeItems: "center", px: 2, py: 4 }}>
      <Card
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 550,
          borderRadius: "20px",
          boxShadow: "0 6px 18px rgba(0,0,0,.12)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={1.25} alignItems="center" sx={{ mb: 1 }}>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ fontSize: { xs: 22, sm: 24, md: 26 }, textAlign: "center" }}
            >
              Forgot your Password?
            </Typography>
            <Typography
              variant="body1"
              sx={{ textAlign: "center", color: "black", maxWidth: 440 }}
            >
              Enter your registered email address and we’ll send you a link to create a new password.
            </Typography>
          </Stack>

          <Box component="form" noValidate onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
            <Stack spacing={2}>
              <div>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.75 }}>
                  Email Address
                </Typography>
                <TextField
                  fullWidth
                  name="email"
                  type="email"
                  placeholder="e.g., john_doe@gmail.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={
                    formik.touched.email && formik.errors.email ? formik.errors.email : " "
                  }
                  FormHelperTextProps={{ sx: { m: 0, mt: 0.5, lineHeight: 1.25 } }}
                  InputProps={{
                    sx: { borderRadius: "8px", height: INPUT_HEIGHT },
                  
                  }}
                  autoComplete="email"
                  inputProps={{ inputMode: "email", spellCheck: false }}
                />
              </div>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disableElevation
                disabled={loading}
                sx={{
                  height: 48,
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 16,
                  bgcolor: greenColor,
                  ":hover": { bgcolor: greenColor },
                }}
              >
                {loading ? (
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                    <ClipLoader size={18} />
                    Sending…
                  </Box>
                ) : (
                  "Send Reset Link"
                )}
              </Button>

              <Divider sx={{ my: 1.5 }} />

              <Typography
                variant="body2"
                sx={{ textAlign: "center", color: "text.secondary" }}
              >
                Remembered your password?{" "}
                <MLink component={Link} href="/" underline="always">
                  Back to Login
                </MLink>
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
