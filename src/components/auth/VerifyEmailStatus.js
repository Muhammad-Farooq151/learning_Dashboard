"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  CircularProgress,
} from "@mui/material";
import { CheckCircleOutline, ErrorOutline } from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";
import { postJSON } from "@/utils/http";
import { toast } from "react-hot-toast";
import { greenColor } from "../utils/Colors";

const STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

export default function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = useMemo(() => searchParams.get("email") || "", [searchParams]);
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [status, setStatus] = useState(
    email && token ? STATUS.LOADING : STATUS.ERROR
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verify() {
      if (!email || !token) {
        setMessage("Verification link is invalid or incomplete.");
        setStatus(STATUS.ERROR);
        return;
      }
      try {
        setStatus(STATUS.LOADING);
        await postJSON("/api/auth/verify-otp", { email, token });
        setStatus(STATUS.SUCCESS);
        setMessage("Your account is verified. You can now sign in to LearningHub.");
      } catch (error) {
        setStatus(STATUS.ERROR);
        const msg = error.message || "Verification failed. Request a new link.";
        setMessage(msg);
        toast.error(msg);
      }
    }
    verify();
  }, [email, token]);

  const isSuccess = status === STATUS.SUCCESS;
  const isLoading = status === STATUS.LOADING;

  return (
    <Box sx={{ display: "grid", placeItems: "center", px: 2, py: 4 }}>
      <Card
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 520,
          borderRadius: "20px",
          boxShadow: "0 6px 18px rgba(0,0,0,.12)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={2} alignItems="center" textAlign="center">
            {isLoading && <CircularProgress />}
            {!isLoading && isSuccess && (
              <CheckCircleOutline sx={{ fontSize: 48, color: greenColor }} />
            )}
            {!isLoading && !isSuccess && (
              <ErrorOutline sx={{ fontSize: 48, color: "#EF4444" }} />
            )}

            <Typography variant="h5" fontWeight={700}>
              {isLoading
                ? "Verifying your email…"
                : isSuccess
                  ? "Email Verified!"
                  : "Verification Failed"}
            </Typography>
            <Typography variant="body1" sx={{ color: "black" }}>
              {message ||
                "Hang tight while we confirm your verification link."}
            </Typography>

            {!isLoading && (
              <Stack direction="row" spacing={1.5} mt={2}>
                {isSuccess ? (
                  <Button
                    variant="contained"
                    sx={{
                      textTransform: "none",
                      bgcolor: greenColor,
                      ":hover": { bgcolor: greenColor },
                    }}
                    onClick={() => router.push("/")}
                  >
                    Go to Login
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    sx={{ textTransform: "none" }}
                    onClick={() =>
                      router.push(
                        email
                          ? `/verify-email-link-sent?email=${encodeURIComponent(
                              email
                            )}`
                          : "/signup"
                      )
                    }
                  >
                    Request New Link
                  </Button>
                )}
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

