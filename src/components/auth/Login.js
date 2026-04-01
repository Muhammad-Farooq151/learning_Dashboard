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
import { motion } from "framer-motion";
import { greenColor } from "../utils/Colors";
import Link from "next/link";
import { postJSON } from "@/utils/http";
import { persistAuthToken } from "@/utils/authStorage";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const smoothReveal = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 115,
      damping: 18,
      mass: 0.9,
    },
  },
};

const sectionStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.11,
      delayChildren: 0.1,
    },
  },
};

const sectionFade = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 130,
      damping: 20,
      mass: 0.8,
    },
  },
};

export default function LoginPage() {
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
        const response = await postJSON("/auth/login", values);

        if (response.success && response.data) {
          persistAuthToken(response.data.token, response.data.user, rememberMe);

          await Swal.fire({
            icon: 'success',
            title: 'Welcome Back!',
            text: 'You have successfully logged in to LearningHub.',
            confirmButtonColor: greenColor,
            confirmButtonText: 'Continue',
          });
          
          router.push("/user/dashboard");
        }
      } catch (e) {
        const msg = e.message || "";
        const isAdminPortal =
          /admin accounts cannot sign in here|admin login page/i.test(msg) ||
          e.response?.data?.code === "ADMIN_USE_ADMIN_LOGIN";
        if (isAdminPortal) {
          await Swal.fire({
            icon: "info",
            title: "Use admin sign-in",
            text: msg || "Administrator accounts must use the admin login page.",
            confirmButtonColor: greenColor,
            confirmButtonText: "Open admin login",
          });
          router.push("/admin-login");
        } else {
          await Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: msg || 'Invalid email or password. Please try again.',
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK',
          });
        }
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box
      sx={{
        // minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        px: 2,
        borderRadius: "20px",
        py: 4,
      }}
    >
      <Box
        component={motion.div}
        initial="hidden"
        animate="visible"
        variants={smoothReveal}
        sx={{ width: "100%", maxWidth: 550, borderRadius: 4, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
 }}
      >
        <CardContent
          component={motion.div}
          initial="hidden"
          animate="visible"
          variants={sectionStagger}
          sx={{ p: { xs: 3, sm: 4 } }}
        >
          <Stack
            component={motion.div}
            variants={sectionFade}
            spacing={2}
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Typography variant="h5" fontWeight={600} fontSize={["18px","20px","22px"]} textAlign="center">
              Welcome Back to LearningHub
            </Typography>
            <Typography variant="body2" fontWeight={300} fontSize={["16px","16px","16px"]} textAlign="center">
              Pick up right where you left off — continue your lessons, check your progress, and explore new learning opportunities.
            </Typography>
          </Stack>

          <Box
            component={motion.form}
            variants={sectionFade}
            noValidate
            onSubmit={formik.handleSubmit}
            sx={{ mt: 2 }}
          >
            <Stack component={motion.div} variants={sectionStagger} spacing={1.25}>
              <Box component={motion.div} variants={sectionFade}>
                <Typography variant="h5" fontWeight={600} fontSize={["14px","14px","14px"]}>
                  Email Address
                </Typography>

                <TextField
                  fullWidth
                  size="medium"
                  placeholder="eg: john_doe@gmail.com"
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
                    },}}
                />
              </Box>

              <Box component={motion.div} variants={sectionFade}>
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
              </Box>

              <Box component={motion.div} variants={sectionFade} display={"flex"} justifyContent={"space-between"} sx={{py:1}}>
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

                <Link href={"/forget-password"}>
                  <Typography sx={{ textDecoration: "underline", fontSize: "14px", fontWeight: 400,transition:"0.3s",":hover":{
                    color:greenColor,transition:"0.3s"
                }  }}>
                    Forgot password?
                  </Typography>
                </Link>
              </Box>

              <Box component={motion.div} variants={sectionFade}>
                <Button
                  component={motion.button}
                  whileTap={{ scale: loading ? 1 : 0.994 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 18,
                  }}
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
                    "Login"
                  )}
                </Button>
              </Box>
            </Stack>

            <Box
              component={motion.div}
              variants={sectionFade}
            >
              <Divider sx={{ my: 4, fontSize: "14px" }}>OR LOGIN WITH</Divider>
            </Box>

            <Box
              component={motion.div}
              variants={sectionFade}
              display={"flex"}
              justifyContent={"center"}
            >
              {/* <Box width={"20%"} display={"flex"} justifyContent={"center"}>
                <Image
                  src="/images/apple.png"
                  alt="Apple"
                  width={34}
                  height={34}
                  style={{ objectFit: "contain" }}
                  priority
                />
              </Box> */}
              <Box width={"20%"} display={"flex"} justifyContent={"center"}>
                <Image
                  src="/images/google.png"
                  alt="Google"
                  width={34}
                  height={34}
                  style={{ objectFit: "contain" }}
                  priority
                />
              </Box>
            </Box>

            <Box
              component={motion.div}
              variants={sectionFade}
              display={"flex"}
              justifyContent={"center"}
              mt={2}
            >
              <Typography fontSize={"14px"} fontWeight={400}>
                Don’t have account
              </Typography>
              <Link href={"/signup"}>
                <Typography sx={{ textDecoration: "underline", fontSize: "14px", fontWeight: 600, ml: 1,transition:"0.3s",":hover":{
                    color:greenColor,transition:"0.3s"
                } }}>
                  Signup
                </Typography>
              </Link>
            </Box>

          
          </Box>
        </CardContent>
      </Box>
    </Box>
  );
}
