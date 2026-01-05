"use client";

import React, { useState } from "react";
import {
  Box,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  Grid,
  Link as MLink,
} from "@mui/material";
import { Visibility, VisibilityOff, Email } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { greenColor } from "../utils/Colors";
import { postJSON } from "@/utils/http";

import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

const validationSchema = Yup.object({
  fullName: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string()
    .test("is-valid-phone", "Enter a valid phone number", (value) =>
      value ? isValidPhoneNumber(value) : false
    )
    .required("Phone number is required"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm your password"),
});

export default function SignUp() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [showCPass, setShowCPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        await postJSON("/api/auth/signup", {
          fullName: values.fullName,
          email: values.email,
          phoneNumber: values.phone,
          password: values.password,
        });
        
        await Swal.fire({
          icon: 'success',
          title: 'Verification Link Sent!',
          text: 'We\'ve sent a verification link to your email. Please check your inbox.',
          confirmButtonColor: greenColor,
          confirmButtonText: 'OK',
        });
        
        router.push(`/verify-email-link-sent?email=${encodeURIComponent(values.email)}`);
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          title: 'Signup Failed',
          text: error.message || 'Something went wrong. Please try again.',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK',
        });
      } finally {
        setLoading(false);
      }
    },
  });

  const phoneHasError = formik.touched.phone && Boolean(formik.errors.phone);

  return (
    <Box sx={{ display: "grid", placeItems: "center", px: 2, borderRadius: "20px", py: 4 }}>
      <Box
        sx={{
          width: "100%",
          maxWidth: 550,
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h5" fontWeight={600} fontSize={["18px", "20px", "22px"]} textAlign="center">
              Create Your LearningHub Account
            </Typography>
            <Typography variant="body2" fontWeight={300} fontSize={["16px","16px","16px"]} textAlign="center">
              Start your journey with personalized courses, progress tracking, and
              interactive learning tools designed to help you grow faster.
            </Typography>
          </Stack>

          <Box component="form" noValidate onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
            <Stack spacing={1.25}>
              <Grid container spacing={1.5}>
                <Grid size={{xs:12,md:6}}>
                  <Typography variant="h5" fontWeight={600} fontSize={["14px","14px","14px"]} mb={1}>
                    Full Name
                  </Typography>
                  <TextField
                    fullWidth
                    size="medium"
                    placeholder="eg: John Doe"
                    name="fullName"
                    value={formik.values.fullName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                    helperText={formik.touched.fullName && formik.errors.fullName ? formik.errors.fullName : null}
                    FormHelperTextProps={{ sx: { m: 0, mt: 0.5 } }}
                    InputProps={{ sx: { borderRadius: "8px" ,height:52} }}
                  />
                </Grid>
                <Grid size={{xs:12,md:6}}>
                  <Typography variant="h5" fontWeight={600} fontSize={["14px","14px","14px"]} mb={1}>
                    Email Address
                  </Typography>
                  <TextField
                    fullWidth
                    size="medium"
                    type="email"
                    placeholder="eg: john_doe@gmail.com"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email ? formik.errors.email : null}
                    FormHelperTextProps={{ sx: { m: 0, mt: 0.5 } }}
                    InputProps={{ sx: { borderRadius: "8px" ,height:52} }}
                    autoComplete="email"
                    inputProps={{ inputMode: "email", spellCheck: false }}
                  />
                </Grid>
              </Grid>

              <Typography variant="h5" fontWeight={600} fontSize={["14px","14px","14px"]}>
                Phone Number
              </Typography>

              <Box
                sx={{
                  border: "1px solid",
                  borderColor: phoneHasError ? "error.main" : "rgba(0,0,0,0.23)",
                  borderRadius: "8px",
                  height: 52,                   
                  display: "flex",
                  alignItems: "center",
                  px: 1.2,
                  "&:focus-within": {
                    borderColor: phoneHasError ? "error.main" : "primary.main",
                    boxShadow: phoneHasError
                      ? "0 0 0 3px rgba(211,47,47,0.12)"
                      : "0 0 0 3px rgba(25,118,210,0.15)",
                  },
                }}
              >
                <PhoneInput
                  defaultCountry="US"
                  international
                  countryCallingCodeEditable={false}
                  value={formik.values.phone}
                  onChange={(v) => formik.setFieldValue("phone", v)}
                  onBlur={() => formik.setFieldTouched("phone", true)}
                  className="PhoneInput--mui"
                />
              </Box>
              {formik.touched.phone && formik.errors.phone ? (
                <Typography variant="caption" color="error" sx={{ display: "block", mt: 0.5, lineHeight: 1.3 }}>
                  {formik.errors.phone}
                </Typography>
              ) : null}

              <Typography fontWeight={600} fontSize={["14px","14px","14px"]}>
                Password
              </Typography>
              <TextField
                fullWidth
                size="medium"
                placeholder="eg: Abc!1234"
                type={showPass ? "text" : "password"}
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password ? formik.errors.password : " "}
                FormHelperTextProps={{ sx: { m: 0, mt: 0.5, lineHeight: 1.25 } }}
                InputProps={{
                  sx: { borderRadius: "8px",height:52 },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPass((s) => !s)} edge="end">
                        {showPass ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                autoComplete="new-password"
                inputProps={{ spellCheck: false, autoCapitalize: "none" }}
              />
              {/* <Typography
                variant="caption"
                sx={{ 
                  display: "block", 
                  mt: 0.5, 
                  color: "text.secondary",
                  fontSize: "12px",
                  lineHeight: 1.4
                }}
              >
                Password must be at least 8 characters, include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.
              </Typography> */}

              <Typography fontWeight={600} fontSize={["14px","14px","14px"]}>
                Confirm Password
              </Typography>
              <TextField
                fullWidth
                size="medium"
                placeholder="eg: Abc!1234"
                type={showCPass ? "text" : "password"}
                name="confirmPassword"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword ? formik.errors.confirmPassword : null}
                FormHelperTextProps={{ sx: { m: 0, mt: 0.5 } }}
                InputProps={{
                  sx: { borderRadius: "8px" ,height:52},
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowCPass((s) => !s)} edge="end">
                        {showCPass ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                autoComplete="new-password"
              />
<br/>
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
                    Creating…
                  </Box>
                ) : (
                  "Create My Account"
                )}
              </Button>
            </Stack>

            <Typography variant="body2" fontSize="12px" color="text.secondary" sx={{ mt: 3, textAlign: "center" }} >
              By signing up, you agree to our{" "}
              <MLink component={Link} href="/terms" underline="always">Terms & Conditions</MLink>{" "}
              and{" "}
              <MLink component={Link} href="/privacy" underline="always">Privacy Policy</MLink>.
            </Typography>

            <Divider sx={{ my: 3, fontSize: "14px" }}>OR LOGIN WITH</Divider>

            <Box display="flex" justifyContent="center" gap={6}>
              {/* <Image src="/images/apple.png" alt="Apple" width={34} height={34} style={{ objectFit: "contain" }} priority /> */}
              <Image src="/images/google.png" alt="Google" width={34} height={34} style={{ objectFit: "contain" }} priority />
            </Box>

            <Box display="flex" justifyContent="center" mt={2}>
              <Typography fontSize={"14px"} fontWeight={400}>Already have account</Typography>
              <Link href="/" style={{ marginLeft: 6 }}>
                <Typography
                  sx={{
                    textDecoration: "underline",
                    fontSize: "14px",
                    fontWeight: 600,
                    transition: "0.3s",
                    ":hover": { color: greenColor, transition: "0.3s" },
                  }}
                >
                  Login
                </Typography>
              </Link>
            </Box>
          </Box>
        </CardContent>
      </Box>

      <style jsx global>{`
        .PhoneInput--mui {
          width: 100%;
        }
        .PhoneInput--mui .PhoneInputCountry {
          margin-right: 8px;
        }
        .PhoneInput--mui .PhoneInputInput {
        
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          font-size: 16px;
          line-height: 1.4375em;    
          padding: 0;                
        }
      `}</style>
    </Box>
  );
}
