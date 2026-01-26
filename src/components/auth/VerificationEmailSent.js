"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
  Link as MLink,
  Button,
} from "@mui/material";
import { CheckCircleOutline } from "@mui/icons-material";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { greenColor } from "../utils/Colors";
import { postJSON } from "@/utils/http";

const COOLDOWN_SECS = 30;

export default function VerificationEmailSent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = useMemo(() => searchParams.get("email") || "", [searchParams]);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!cooldown) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    if (!email) {
      toast.error("Email address is missing.");
      return;
    }
    try {
      setResending(true);
      await postJSON("/auth/resend-otp", { email });
      toast.success("Verification link sent again.");
      setCooldown(COOLDOWN_SECS);
    } catch (error) {
      toast.error(error.message || "Unable to resend. Try again.");
    } finally {
      setResending(false);
    }
  }, [email]);

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
          <Stack spacing={2} alignItems="center" textAlign="center">
            <CheckCircleOutline sx={{ fontSize: 48, color: greenColor }} />
            <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: 22, sm: 24, md: 26 } }}>
              Verification Link Sent
            </Typography>
            <Typography variant="body1" sx={{ color: "black", maxWidth: 520 }}>
              We&apos;ve emailed a verification link to {email || "your inbox"}. Open it to activate your LearningHub
              account.
            </Typography>

            <Divider sx={{ width: "100%", my: 2 }} />

            <Typography variant="body2" sx={{ color: "black" }}>
              Didn&apos;t get the email? Check your spam folder or{" "}
              <MLink
                component="button"
                type="button"
                underline="always"
                onClick={handleResend}
                disabled={!!cooldown || resending}
                sx={{
                  cursor: cooldown || resending ? "not-allowed" : "pointer",
                  opacity: cooldown || resending ? 0.6 : 1,
                }}
              >
                {cooldown ? `Resend (${cooldown}s)` : "Resend"}
              </MLink>
              .
            </Typography>

            <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mt: 1 }}>
              <Button
                variant="text"
                component={Link}
                href="/"
                sx={{ textTransform: "none" }}
              >
                Back to Login
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

