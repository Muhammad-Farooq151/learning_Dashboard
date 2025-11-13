"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Box,
  Stack,
  Typography,
  Paper,
  Chip,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  TextField,
  Checkbox,
  FormControlLabel,
  Tooltip,
  IconButton,
} from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Toaster, toast } from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { greenColor } from "@/components/utils/Colors";

/* ========== Brand palette (matches your screenshot) ========== */
const palette = {
  green: "#37C087",
  greenHover: "#2ea677",
  greenSoft: "rgba(55, 192, 135, 0.12)",
  greenBorder: "rgba(55, 192, 135, 0.24)",
  gray900: "#111827",
  gray700: "#6B7280",
  gray600: "#4B5563",
  gray500: "#6B7280",
  gray300: "#E5E7EB",
  gray200: "#EEEFF2",
  gray50: "#F9FAFB",
  red: "#ef4444",
  blue: "#0A66C2",
};

const CERTS = [
  {
    title: "Sales Training: Practical Sales Techniques",
    issued: "Dec 2024",
    linkedinUrl: "#",
    downloadUrl: "#",
  },
  {
    title: "The Complete Python Bootcamp From Zero to Hero in Python",
    issued: "Nov 2023",
    linkedinUrl: "#",
    downloadUrl: "#",
  },
  {
    title: "Cyber Security: From Beginner to Expert",
    issued: "Nov 2024",
    linkedinUrl: "#",
    downloadUrl: "#",
  },
  {
    title: "The Complete Agentic AI Engineering Course (2025)",
    issued: "Mar 2024",
    linkedinUrl: "#",
    downloadUrl: "#",
  },
  {
    title: "100 Days of Code: The Complete Python Pro Bootcamp",
    issued: "Jan 2024",
    linkedinUrl: "#",
    downloadUrl: "#",
  },
];

/* small helpers */
function wordCount(str) {
  return (str || "").trim().split(/\s+/).filter(Boolean).length;
}
function VerifiedChip() {
  return (
    <Chip
      icon={<VerifiedRoundedIcon sx={{ fontSize: 16 }} />}
      label="Verified"
      size="small"
      sx={{
        height: 26,
        borderRadius: 20,
        px: 1,
        fontSize: 12,
        color: palette.green,
        bgcolor: palette.greenSoft,
        border: `1px solid ${palette.greenBorder}`,
        ".MuiChip-icon": { color: palette.green, ml: 0.5 },
      }}
    />
  );
}

export default function Certifications() {
  /* List + download */
  const [downloadingIdx, setDownloadingIdx] = useState(null);

  /* Dialog state */
  const [rateOpen, setRateOpen] = useState(false);
  const [activeCert, setActiveCert] = useState(null);

  /* Form state */
  const [stars, setStars] = useState(4);
  const [fullName, setFullName] = useState("");
  const [rememberTop, setRememberTop] = useState(false);
  const [rememberBottom, setRememberBottom] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [file, setFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const wc = useMemo(() => wordCount(feedback), [feedback]);
  const overLimit = wc > 400;

  const openRate = (cert) => {
    setActiveCert(cert);
    setRateOpen(true);
    // reset fields for fresh UX
    setStars(4);
    setFullName("");
    setRememberTop(false);
    setRememberBottom(false);
    setFeedback("");
    setFile(null);
  };
  const closeRate = () => setRateOpen(false);

  /* File upload validations exactly as requested: JPG/JPEG/PNG, 2MB */
  const onPickFile = () => fileInputRef.current?.click();
  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const okTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!okTypes.includes(f.type)) {
      toast.error("Only JPEG, JPG, PNG allowed");
      e.target.value = "";
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      toast.error("Max size is 2MB");
      e.target.value = "";
      return;
    }
    setFile(f);
  };

  const onSubmit = async () => {
    if (!fullName.trim()) return toast.error("Please enter your full name");
    if (overLimit) return toast.error("Feedback exceeds 400 words");

    setSubmitting(true);
    try {
      // TODO: call your API here
      // const form = new FormData();
      // form.append("stars", String(stars));
      // form.append("fullName", fullName);
      // form.append("rememberTop", String(!!rememberTop));
      // form.append("rememberBottom", String(!!rememberBottom));
      // form.append("feedback", feedback);
      // if (file) form.append("file", file);
      // await fetch("/api/feedback", { method: "POST", body: form });

      await new Promise((r) => setTimeout(r, 1200));
      toast.success("Thanks! Your feedback has been submitted.");
      closeRate();
    } catch (e) {
      toast.error("Submission failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const onDownload = async (cert, idx) => {
    setDownloadingIdx(idx);
    try {
      // if you have a real link, open it here:
      // window.open(cert.downloadUrl, "_blank");
      await new Promise((r) => setTimeout(r, 900));
      toast.success("Download started");
    } catch {
      toast.error("Download failed");
    } finally {
      setDownloadingIdx(null);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        // maxWidth: 980,
        mx: "auto",
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 3 },
      }}
    >
      {/* <Toaster position="bottom-center" /> */}
      <Typography variant="h6" sx={{ fontWeight: 700, color: palette.gray900, mb: 2 }}>
        Certificates
      </Typography>

      <Stack spacing={1.5}>
        {CERTS.map((c, idx) => (
          <Paper
            key={idx}
            elevation={0}
            sx={{
              borderRadius: 2.5,
              border: `1px solid ${palette.gray300}`,
              bgcolor: "white",
              px: { xs: 1.25, sm: 2 },
              py: { xs: 1.25, sm: 1.5 },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  bgcolor: palette.gray50,
                  border: `1px solid ${palette.gray300}`,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <SchoolOutlinedIcon sx={{ fontSize: 20, color: palette.gray700 }} />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  noWrap
                  sx={{ fontWeight: 600, color: "black", fontSize: { xs: "14px", sm: "14px" }, mb: 0.25 }}
                >
                  {c.title}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 16, color: palette.gray700, opacity: 0.9 }} />
                  <Typography variant="body2" sx={{ color: palette.gray700, fontSize: 12.5 }}>
                    Issued: {c.issued}
                  </Typography>
                </Stack>
              </Box>

              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <VerifiedChip />
              </Box>

              <Stack direction="row" alignItems="center" spacing={2} sx={{ ml: { xs: 0.5, sm: 1 } }}>
                <Link href={c.linkedinUrl} style={{ textDecoration: "none" }}>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      color: greenColor,
                      fontWeight: 600,
                       textDecoration:"underLine",
                      "&:hover": { textDecoration: "underline" },
                      whiteSpace: "nowrap",
                    }}
                  >
                    Add To LinkedIn
                  </Typography>
                </Link>

                <Button
                  onClick={() => openRate(c)}
                  sx={{
                    textTransform: "none",
                    fontSize: 14,
                    textDecoration:"underLine",
                    fontWeight: 600,
                    color: greenColor,
                    // "&:hover": { , textDecoration: "underline" },
                    p: 0,
                    minWidth: 0,
                  }}
                >
                  Rate Us
                </Button>

                <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />

                <Tooltip title="Download certificate">
                  <Button
                    variant="outlined"
                    onClick={() => onDownload(c, idx)}
                    startIcon={
                      downloadingIdx === idx ? (
                        <ClipLoader size={16} />
                      ) : (
                        <DownloadRoundedIcon />
                      )
                    }
                    sx={{
                      textTransform: "none",
                      fontSize: 13.5,
                      borderRadius: 2,
                      borderColor: palette.gray300,
                      color: palette.gray900,
                      px: 1.5,
                      py: 0.75,
                      whiteSpace: "nowrap",
                      "&:hover": { borderColor: palette.gray300, bgcolor: palette.gray50 },
                    }}
                  >
                    {downloadingIdx === idx ? "Downloading…" : "Download"}
                  </Button>
                </Tooltip>
              </Stack>
            </Stack>

            <Box sx={{ mt: 1, display: { xs: "block", sm: "none" } }}>
              <VerifiedChip />
            </Box>
          </Paper>
        ))}
      </Stack>

      {/* =================== RATE US DIALOG =================== */}
      <Dialog
        open={rateOpen}
        onClose={closeRate}
        fullWidth
        maxWidth="sm"
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0,0,0,.35)" } },
        }}
        PaperProps={{ sx: { borderRadius: 3, overflow: "visible" } }}
      >
        {/* Close icon in the corner (like screenshot) */}
        <IconButton
          onClick={closeRate}
          sx={{
            position: "absolute",
            right: 10,
            top: 10,
            bgcolor: "white",
            border: `1px solid ${palette.gray300}`,
            "&:hover": { bgcolor: palette.gray50 },
            zIndex: 2,
          }}
        >
          <CloseRoundedIcon />
        </IconButton>

        <DialogTitle sx={{ fontWeight: 700, pr: 6, lineHeight: 1.3, pb: 0.5 }}>
          Submit your Feedback
        </DialogTitle>

        <DialogContent sx={{ pt: 1.5 }}>
          {/* Stars row */}
          <Stack alignItems="flex-start" sx={{ mb: 1.5 }}>
            <Rating
              value={stars}
              onChange={(_, v) => setStars(v || 0)}
              precision={1}
              icon={<StarRoundedIcon sx={{ color: "#F59E0B" }} />}
              emptyIcon={<StarRoundedIcon sx={{ color: palette.gray200 }} />}
            />
          </Stack>

          {/* Upload card */}
          <Paper
            variant="outlined"
            onClick={onPickFile}
            sx={{
              borderRadius: 2,
              borderColor: palette.gray300,
              bgcolor: palette.gray50,
              height: 120,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              mb: 2,
              ":hover": { bgcolor: "#F6F7F9" },
            }}
          >
            <Stack alignItems="center" spacing={0.5}>
              <CloudUploadOutlinedIcon sx={{ color: palette.gray600 }} />
              <Typography sx={{ color: palette.gray600, fontWeight: 600, fontSize: 13 }}>
                Click here to Upload
              </Typography>
              <Typography sx={{ color: palette.gray700, fontSize: 11, lineHeight: 1 }}>
                Accept format: JPEG, JPG, PNG
              </Typography>
              <Typography sx={{ color: palette.gray700, fontSize: 11, lineHeight: 1 }}>
                Maximum size: 2MB
              </Typography>
              {file && (
                <Typography sx={{ color: palette.green, fontSize: 12, mt: 0.5 }}>
                  Selected: {file.name}
                </Typography>
              )}
            </Stack>
            <input ref={fileInputRef} type="file" hidden onChange={onFileChange} />
          </Paper>

          {/* Full Name */}
          <Typography sx={{ fontSize: 13, color: palette.gray900, mb: 0.75 }}>Full Name</Typography>
          <TextField
            fullWidth
            placeholder="e.g. John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            sx={{
              mb: 0.75,
              "& .MuiOutlinedInput-root": { borderRadius: 1.5, height: 44 },
            }}
          />

          {/* Row: Remember + Forgot */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberTop}
                  onChange={(e) => setRememberTop(e.target.checked)}
                  sx={{ p: 0.5 }}
                />
              }
              label={<Typography sx={{ fontSize: 13, color: palette.gray700 }}>Remember Me</Typography>}
            />
            <Link href="#" style={{ textDecoration: "none" }}>
              <Typography sx={{ fontSize: 13, color: palette.gray700, textDecoration: "underline" }}>
                Forgot password?
              </Typography>
            </Link>
          </Stack>

          {/* Feedback area */}
          <Typography sx={{ fontSize: 13, color: palette.gray900, mb: 0.75 }}>
            What did you like or dislike
          </Typography>
          <TextField
            multiline
            minRows={4}
            fullWidth
            placeholder="Type here"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: 1.5, alignItems: "flex-start" },
            }}
          />
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 0.5 }}>
            <Typography sx={{ fontSize: 12, color: overLimit ? palette.red : palette.gray700 }}>
              {wc} / 400 Words Only
            </Typography>
          </Stack>

          {/* Row: Remember + Forgot (bottom) */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberBottom}
                  onChange={(e) => setRememberBottom(e.target.checked)}
                  sx={{ p: 0.5 }}
                />
              }
              label={<Typography sx={{ fontSize: 13, color: palette.gray700 }}>Remember Me</Typography>}
            />
            <Link href="#" style={{ textDecoration: "none" }}>
              <Typography sx={{ fontSize: 13, color: palette.gray700, textDecoration: "underline" }}>
                Forgot password?
              </Typography>
            </Link>
          </Stack>
        </DialogContent>

        {/* Actions exactly like screenshot */}
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button
            variant="outlined"
            onClick={closeRate}
            sx={{
              textTransform: "none",
              color: palette.gray900,
              borderColor: palette.gray300,
              borderRadius: 2,
              px: 3,
              height: 40,
              "&:hover": { bgcolor: palette.gray50, borderColor: palette.gray300 },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={submitting}
            startIcon={submitting ? <ClipLoader size={16} color="#fff" /> : null}
            sx={{
              textTransform: "none",
              bgcolor: palette.green,
              "&:hover": { bgcolor: palette.greenHover },
              borderRadius: 2,
              px: 4,
              height: 40,
              fontWeight: 600,
            }}
          >
            {submitting ? "Submitting…" : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
