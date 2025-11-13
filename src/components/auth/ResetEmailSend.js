"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Divider,
  Link as MLink,
} from "@mui/material";
import { CheckCircleOutline } from "@mui/icons-material";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { greenColor } from "../utils/Colors"; // adjust path if needed

const RADIUS = 12;
const COOLDOWN_SECS = 30;

export default function ResetEmailSend() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = useMemo(() => searchParams.get("email") || "", [searchParams]);

  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!cooldown) return;
    const t = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    if (!email) {
      toast.error("Email address is missing.");
      return;
    }
    try {
      setResending(true);
      // TODO: replace with your real API call:
      // await axios.post("/api/auth/forgot-password", { email });
      await new Promise((r) => setTimeout(r, 800));

      toast.success("Reset link sent again.");
      setCooldown(COOLDOWN_SECS);
    } catch (e) {
      toast.error("Unable to resend. Try again.");
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
          <Stack spacing={2} alignItems="center" sx={{ textAlign: "center" }}>
            <CheckCircleOutline sx={{ fontSize: 48, color: greenColor }} />
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ fontSize: { xs: 22, sm: 24, md: 26 } }}
            >
              Password Reset Email Sent
            </Typography>

            <Typography variant="body1" sx={{ color: "black", maxWidth: 520 }}>
              Check your inbox{email ? ` (${email})` : ""}. We’ve sent you instructions to
              reset your password. Follow the link to securely create a new one.
            </Typography>

            <Divider sx={{ width: "100%", my: 2 }} />

            <Typography variant="body2" sx={{ color: "black" }}>
              Didn’t receive the email? 
            
            </Typography>
              <Typography variant="body2" sx={{ color: "black" ,pt:-2}}>
            
              Check your spam folder or{" "}
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

            {/* <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mt: 1 }}>
              <Button
                component={Link}
                href="/forgot-password"
                variant="text"
                sx={{ textTransform: "none" }}
              >
                Change email
              </Button>

              <Button
                variant="contained"
                disableElevation
                onClick={() => router.push("/")}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: RADIUS,
                  bgcolor: greenColor,
                  ":hover": { bgcolor: greenColor },
                }}
              >
                Back to Login
              </Button>
            </Stack> */}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
