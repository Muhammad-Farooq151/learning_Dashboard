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
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ClipLoader } from "react-spinners";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { greenColor } from "../utils/Colors"; 

const INPUT_HEIGHT = 56;
const RADIUS = "8px";

const validationSchema = Yup.object({
  password: Yup.string()
    .required("Password is required")
    .min(8, "At least 8 characters")
    .matches(/[0-9]/, "Must contain a number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Must contain a special character"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm your password"),
});

export default function CreateNewPassword() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [showCPass, setShowCPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { password: "", confirmPassword: "" },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        // 👉 replace with your real API call
        // await axios.post("/api/auth/reset-password", values);
        await new Promise((r) => setTimeout(r, 800));
        toast.success("Password updated successfully");
        router.push("/"); // back to login/home
      } catch (e) {
        toast.error("Failed to update password. Try again.");
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
          <Stack spacing={2} sx={{ textAlign: "center", mb: 2 }}>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ fontSize: { xs: 22, sm: 24, md: 26 } }}
            >
              Create a New Password
            </Typography>
            <Typography variant="body1" sx={{ color: "black" }}>
              Enter a new password to secure your account. <br/> Make sure it’s strong and
              easy for you to remember.
            </Typography>
            
          </Stack>

          <Box component="form" noValidate onSubmit={formik.handleSubmit}>
            <Stack spacing={2}>
              {/* Password */}
              <div>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.75, textAlign: "left" }}>
                  Password
                </Typography>
                <TextField
                  fullWidth
                  placeholder="eg: ********"
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password ? formik.errors.password : " "}
                  FormHelperTextProps={{ sx: { m: 0, mt: 0.5, lineHeight: 1.25 } }}
                  InputProps={{
                    sx: { borderRadius: RADIUS, height: INPUT_HEIGHT },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPass((s) => !s)} edge="end">
                          {showPass ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  autoComplete="new-password"
                  inputProps={{ spellCheck: false }}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.75, textAlign: "left" }}>
                  Confirm Password
                </Typography>
                <TextField
                  fullWidth
                  placeholder="eg: Abc!1234"
                  type={showCPass ? "text" : "password"}
                  name="confirmPassword"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                  helperText={
                    formik.touched.confirmPassword && formik.errors.confirmPassword
                      ? formik.errors.confirmPassword
                      : " "
                  }
                  FormHelperTextProps={{ sx: { m: 0, mt: 0.5, lineHeight: 1.25 } }}
                  InputProps={{
                    sx: { borderRadius: RADIUS, height: INPUT_HEIGHT },
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
              </div>

              {/* Rules */}
              <Typography
                variant="caption"
                sx={{ textAlign: "center", color: "black", fontSize:"14px",lineHeight: 1.4,fontWeight:400 }}
              >
                Password must be at least 8 characters, include 1 number, 1 special character,
                and not repeat old passwords.
              </Typography>

              {/* Save Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disableElevation
                disabled={loading}
                sx={{
                  height: 48,
                  borderRadius: RADIUS,
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
                    Saving…
                  </Box>
                ) : (
                  "Save Password"
                )}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
