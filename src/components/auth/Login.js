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
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ClipLoader } from "react-spinners";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { greenColor } from "../utils/Colors";
import Link from "next/link";
import { postJSON } from "@/utils/http";
import { persistAuthToken } from "@/utils/authStorage";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const data = await postJSON("/api/auth/login", values);
        persistAuthToken(data.token, data.user);
        toast.success("Welcome back to LearningHub");
        router.push("/user/dashboard");
      } catch (e) {
        toast.error(e.message || "Login failed. Try again.");
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
        sx={{ width: "100%", maxWidth: 550, borderRadius: 4, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
 }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h5" fontWeight={600} fontSize={["18px","20px","22px"]} textAlign="center">
              Welcome Back to LearningHub
            </Typography>
            <Typography variant="body2" fontWeight={300} fontSize={["16px","16px","16px"]} textAlign="center">
              Pick up right where you left off — continue your lessons, check your progress, and explore new learning opportunities.
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

              <Box display={"flex"} justifyContent={"space-between"} sx={{py:1}}>
                <Stack direction="row" alignItems="center" spacing={1} >
                  <input type="checkbox" id="remember" style={{ width: 16, height: 16 }} />
                  <Typography fontSize={"14px"} fontWeight={400}>
                    Remember Me
                  </Typography>
                </Stack>

                <Link href={"/forget-password"}>
                  <Typography sx={{ textDecoration: "underline", fontSize: "14px", fontWeight: 400,transition:"0.3s",":hover":{
                    color:greenColor,transition:"0.3s"
                }  }}>
                    Forgot password?
                  </Typography>
                </Link>
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
                  "Login"
                )}
              </Button>
            </Stack>

            <Divider sx={{ my: 4, fontSize: "14px" }}>OR LOGIN WITH</Divider>

            <Box display={"flex"} justifyContent={"center"}>
              <Box width={"20%"} display={"flex"} justifyContent={"center"}>
                <Image
                  src="/images/apple.png"
                  alt="Apple"
                  width={34}
                  height={34}
                  style={{ objectFit: "contain" }}
                  priority
                />
              </Box>
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

            <Box display={"flex"} justifyContent={"center"} mt={2}>
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
