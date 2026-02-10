"use client";

import React, { useEffect, useState, useRef } from "react";
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
  Tooltip,
  IconButton,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { ClipLoader } from "react-spinners";
import { greenColor } from "@/components/utils/Colors";
import { getJSON } from "@/utils/http";
import { getStoredUserId, getStoredUser } from "@/utils/authStorage";
import Swal from "sweetalert2";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/* ========== Brand palette ========== */
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

// Certificate Preview Component
function CertificatePreview({ course, userName, onClose, onDownload, userId }) {
  const certificateRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    setDownloading(true);
    try {
      // Final verification before download
      const courseDetailsResponse = await getJSON(`courses/${course.id}`);
      if (!courseDetailsResponse?.success || !courseDetailsResponse.data) {
        setDownloading(false);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to verify course completion. Please try again.",
          confirmButtonColor: palette.green,
        });
        return;
      }

      const courseDetails = courseDetailsResponse.data;
      const allLessons = courseDetails.lessons || [];

      if (allLessons.length === 0) {
        setDownloading(false);
        Swal.fire({
          icon: "warning",
          title: "Course Not Available",
          text: "This course has no lessons available.",
          confirmButtonColor: palette.green,
        });
        return;
      }

      const progressResponse = await getJSON(`progress/${course.id}?userId=${userId}`);
      if (!progressResponse?.success || !progressResponse.data) {
        setDownloading(false);
        Swal.fire({
          icon: "warning",
          title: "Course Not Completed",
          html: `
            <div style="text-align: left;">
              <p style="margin-bottom: 10px;"><strong>Certificate download is not available.</strong></p>
              <p style="margin-bottom: 5px;">Course: <strong>${course.title}</strong></p>
              <p style="margin-bottom: 5px;">Reason: You have not completed all modules.</p>
              <p style="margin-top: 15px; color: #666; font-size: 14px;">
                <strong>Please complete all modules (100%) to download your certificate.</strong>
              </p>
            </div>
          `,
          confirmButtonColor: palette.green,
          confirmButtonText: "OK, I Understand",
          width: "500px",
        });
        return;
      }

      const progress = progressResponse.data;
      const progressLessons = progress.lessons || [];
      const completedLessons = progressLessons.filter((lp) => lp.completed === true);
      const totalLessons = allLessons.length;
      const isComplete = completedLessons.length === totalLessons && totalLessons > 0;

      if (!isComplete) {
        setDownloading(false);
        const completedCount = completedLessons.length;
        const progressPercentage = totalLessons > 0 
          ? Math.round((completedCount / totalLessons) * 100) 
          : 0;
        
        Swal.fire({
          icon: "warning",
          title: "Course Not Completed",
          html: `
            <div style="text-align: left;">
              <p style="margin-bottom: 10px;"><strong>Certificate download is not available.</strong></p>
              <p style="margin-bottom: 5px;">Course: <strong>${course.title}</strong></p>
              <p style="margin-bottom: 5px;">Progress: <strong>${completedCount} out of ${totalLessons} modules completed (${progressPercentage}%)</strong></p>
              <p style="margin-bottom: 5px;">Remaining: <strong>${totalLessons - completedCount} modules</strong></p>
              <p style="margin-top: 15px; color: #666; font-size: 14px;">
                <strong>Please complete all modules (100%) to download your certificate.</strong>
              </p>
            </div>
          `,
          confirmButtonColor: palette.green,
          confirmButtonText: "OK, I Understand",
          width: "550px",
        });
        return;
      }

      // All verification passed - proceed with download
      // Generate canvas from certificate HTML
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      // Convert canvas to image
      const imgData = canvas.toDataURL("image/png");

      // Create PDF
      const pdf = new jsPDF("landscape", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgScaledWidth = imgWidth * ratio;
      const imgScaledHeight = imgHeight * ratio;
      const xOffset = (pdfWidth - imgScaledWidth) / 2;
      const yOffset = (pdfHeight - imgScaledHeight) / 2;

      pdf.addImage(imgData, "PNG", xOffset, yOffset, imgScaledWidth, imgScaledHeight);
      pdf.save(`${course.title.replace(/[^a-z0-9]/gi, "_")}_Certificate.pdf`);

      setDownloading(false);
      onDownload();
    } catch (error) {
      console.error("Error generating certificate:", error);
      setDownloading(false);
      Swal.fire({
        icon: "error",
        title: "Download Failed",
        text: "Failed to generate certificate. Please try again.",
        confirmButtonColor: palette.green,
      });
    }
  };

  const formatDate = (date) => {
    if (!date) return new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });
    return new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <>
      <DialogTitle sx={{ fontWeight: 700, pr: 6, lineHeight: 1.3, pb: 1 }}>
        Certificate Preview
        <IconButton
          onClick={onClose}
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
      </DialogTitle>

      <DialogContent sx={{ pt: 2, pb: 2 }}>
        <Box
          ref={certificateRef}
          sx={{
            width: "100%",
            minHeight: "400px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 3,
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='a' patternUnits='userSpaceOnUse' width='100' height='100' patternTransform='scale(0.5) rotate(0)'%3E%3Crect x='0' y='0' width='100%25' height='100%25' fill='hsla(0,0%25,100%25,0)'/%3E%3Cpath d='M50 50h50v50H50z' stroke='hsla(0,0%25,100%25,0.1)' stroke-width='1' fill='none'/%3E%3C/pattern%3E%3C/defs%3E%3Crect fill='url(%23a)' width='100%25' height='100%25'/%3E%3C/svg%3E")`,
              opacity: 0.3,
            },
          }}
        >
          {/* Decorative border */}
          <Box
            sx={{
              position: "absolute",
              top: 20,
              left: 20,
              right: 20,
              bottom: 20,
              border: "3px solid rgba(255, 255, 255, 0.3)",
              borderRadius: 2,
            }}
          />

          {/* Certificate Content */}
          <Box sx={{ position: "relative", zIndex: 1, maxWidth: "90%" }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 3,
                fontSize: { xs: "24px", sm: "32px" },
                textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              Certificate of Completion
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mb: 4,
                fontSize: { xs: "14px", sm: "16px" },
                opacity: 0.9,
              }}
            >
              This is to certify that
            </Typography>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 4,
                fontSize: { xs: "28px", sm: "36px" },
                textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
                borderBottom: "2px solid rgba(255, 255, 255, 0.5)",
                pb: 2,
                display: "inline-block",
              }}
            >
              {userName || "Student Name"}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mb: 2,
                fontSize: { xs: "14px", sm: "16px" },
                opacity: 0.9,
              }}
            >
              has successfully completed the course
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                mb: 4,
                fontSize: { xs: "18px", sm: "24px" },
                textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
              }}
            >
              {course.title}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: "12px", sm: "14px" },
                opacity: 0.8,
                mt: 3,
              }}
            >
              Issued on {formatDate(new Date())}
            </Typography>

            {/* Seal/Signature area */}
            <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between", width: "100%" }}>
              <Box sx={{ textAlign: "center", flex: 1 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    border: "2px solid rgba(255, 255, 255, 0.5)",
                    mx: "auto",
                    mb: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "32px",
                  }}
                >
                  ✓
                </Box>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Verified
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
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
          onClick={handleDownload}
          disabled={downloading}
          startIcon={downloading ? <ClipLoader size={16} color="#fff" /> : <DownloadRoundedIcon />}
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
          {downloading ? "Downloading…" : "Download"}
        </Button>
      </DialogActions>
    </>
  );
}

export default function Certifications() {
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        setLoading(true);
        const userId = getStoredUserId();
        const user = getStoredUser();

        if (!userId) {
          setLoading(false);
          return;
        }

        // Get user name and ID
        if (user?.fullName) {
          setUserName(user.fullName);
        }
        setUserId(userId);

        // Fetch enrolled courses
        const coursesResponse = await getJSON(`users/my-courses?userId=${userId}`);
        if (!coursesResponse?.success || !Array.isArray(coursesResponse.data)) {
          setCertificates([]);
          setLoading(false);
          return;
        }

        const enrolledCourses = coursesResponse.data;

        // For each course, check if it's 100% complete
        const completedCourses = await Promise.all(
          enrolledCourses.map(async (course) => {
            try {
              // Fetch full course details to get all lessons
              const courseDetailsResponse = await getJSON(`courses/${course.id}`);
              if (!courseDetailsResponse?.success || !courseDetailsResponse.data) {
                return null;
              }

              const courseDetails = courseDetailsResponse.data;
              const allLessons = courseDetails.lessons || [];

              if (allLessons.length === 0) {
                return null; // No lessons, can't be complete
              }

              // Fetch progress for this course
              const progressResponse = await getJSON(`progress/${course.id}?userId=${userId}`);
              if (!progressResponse?.success || !progressResponse.data) {
                return null; // No progress, not complete
              }

              const progress = progressResponse.data;
              const progressLessons = progress.lessons || [];

              // Check if all lessons are completed
              const completedLessons = progressLessons.filter((lp) => lp.completed === true);
              const isComplete = completedLessons.length === allLessons.length && allLessons.length > 0;

              if (isComplete) {
                return {
                  id: course.id,
                  title: course.title,
                  issuedDate: progress.lastAccessedAt || new Date(),
                  progress: 100,
                };
              }

              return null;
            } catch (error) {
              console.error(`Error checking completion for course ${course.id}:`, error);
              return null;
            }
          })
        );

        // Filter out null values
        const validCertificates = completedCourses.filter((cert) => cert !== null);
        setCertificates(validCertificates);
      } catch (error) {
        console.error("Error loading certificates:", error);
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    };

    loadCertificates();
  }, []);

  const handleDownloadClick = async (course) => {
    if (!course) return;

    try {
      const userId = getStoredUserId();
      if (!userId) {
        Swal.fire({
          icon: "error",
          title: "Authentication Error",
          text: "Please login to download certificates.",
          confirmButtonColor: palette.green,
        });
        return;
      }

      // Re-verify completion status before allowing download
      const courseDetailsResponse = await getJSON(`courses/${course.id}`);
      if (!courseDetailsResponse?.success || !courseDetailsResponse.data) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load course details. Please try again.",
          confirmButtonColor: palette.green,
        });
        return;
      }

      const courseDetails = courseDetailsResponse.data;
      const allLessons = courseDetails.lessons || [];

      if (allLessons.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "Course Not Available",
          text: "This course has no lessons available.",
          confirmButtonColor: palette.green,
        });
        return;
      }

      // Fetch current progress
      const progressResponse = await getJSON(`progress/${course.id}?userId=${userId}`);
      if (!progressResponse?.success || !progressResponse.data) {
        Swal.fire({
          icon: "warning",
          title: "Course Not Completed",
          html: `
            <div style="text-align: left;">
              <p style="margin-bottom: 10px;"><strong>Certificate download is not available.</strong></p>
              <p style="margin-bottom: 5px;">Course: <strong>${course.title}</strong></p>
              <p style="margin-bottom: 5px;">Reason: You have not started this course yet.</p>
              <p style="margin-top: 15px; color: #666; font-size: 14px;">
                <strong>Please complete all modules (100%) to download your certificate.</strong>
              </p>
            </div>
          `,
          confirmButtonColor: palette.green,
          confirmButtonText: "OK, I Understand",
          width: "500px",
        });
        return;
      }

      const progress = progressResponse.data;
      const progressLessons = progress.lessons || [];

      // Check if all lessons are completed
      const completedLessons = progressLessons.filter((lp) => lp.completed === true);
      const totalLessons = allLessons.length;
      const completedCount = completedLessons.length;
      const isComplete = completedCount === totalLessons && totalLessons > 0;

      if (!isComplete) {
        const progressPercentage = totalLessons > 0 
          ? Math.round((completedCount / totalLessons) * 100) 
          : 0;
        
        Swal.fire({
          icon: "warning",
          title: "Course Not Completed",
          html: `
            <div style="text-align: left;">
              <p style="margin-bottom: 10px;"><strong>Certificate download is not available.</strong></p>
              <p style="margin-bottom: 5px;">Course: <strong>${course.title}</strong></p>
              <p style="margin-bottom: 5px;">Progress: <strong>${completedCount} out of ${totalLessons} modules completed (${progressPercentage}%)</strong></p>
              <p style="margin-bottom: 5px;">Remaining: <strong>${totalLessons - completedCount} modules</strong></p>
              <p style="margin-top: 15px; color: #666; font-size: 14px;">
                <strong>Please complete all modules (100%) to download your certificate.</strong>
              </p>
              <p style="margin-top: 10px; color: #37C087; font-size: 13px;">
                ✓ All modules must be 100% complete<br/>
                ✓ You need to finish all lessons in the course
              </p>
            </div>
          `,
          confirmButtonColor: palette.green,
          confirmButtonText: "OK, I Understand",
          width: "550px",
        });
        return;
      }

      // All checks passed - show preview dialog
      setSelectedCourse(course);
      setPreviewOpen(true);
    } catch (error) {
      console.error("Error verifying course completion:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to verify course completion. Please try again.",
        confirmButtonColor: palette.green,
      });
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setSelectedCourse(null);
  };

  const handleDownloadComplete = () => {
    Swal.fire({
      icon: "success",
      title: "Certificate Downloaded",
      text: "Your certificate has been downloaded successfully!",
      confirmButtonColor: palette.green,
      timer: 2000,
    });
    handleClosePreview();
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
          mx: "auto",
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 3 },
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: palette.gray900, mb: 2 }}>
          Certificates
        </Typography>
        <Stack spacing={1.5}>
          {[1, 2].map((i) => (
            <Paper
              key={i}
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
                <Skeleton variant="rectangular" width={36} height={36} sx={{ borderRadius: 1.5 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="text" width="40%" height={16} />
                </Box>
                <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 2 }} />
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        mx: "auto",
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 3 },
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, color: palette.gray900, mb: 2 }}>
        Certificates
      </Typography>

      {certificates.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2.5,
            border: `1px solid ${palette.gray300}`,
            bgcolor: "white",
            p: 4,
            textAlign: "center",
          }}
        >
          <SchoolOutlinedIcon sx={{ fontSize: 48, color: palette.gray500, mb: 2 }} />
          <Typography variant="h6" sx={{ color: palette.gray700, mb: 1 }}>
            No Certificates Available
          </Typography>
          <Typography variant="body2" sx={{ color: palette.gray600 }}>
            Complete 100% of your enrolled courses to earn certificates.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {certificates.map((cert, idx) => (
            <Paper
              key={cert.id}
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
                    sx={{
                      fontWeight: 600,
                      color: "black",
                      fontSize: { xs: "14px", sm: "14px" },
                      mb: 0.25,
                    }}
                  >
                    {cert.title}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CheckCircleOutlineOutlinedIcon
                      sx={{ fontSize: 16, color: palette.gray700, opacity: 0.9 }}
                    />
                    <Typography variant="body2" sx={{ color: palette.gray700, fontSize: 12.5 }}>
                      Issued: {formatDate(cert.issuedDate)}
                    </Typography>
                  </Stack>
                </Box>

                <Box sx={{ display: { xs: "none", sm: "block" } }}>
                  <VerifiedChip />
                </Box>

                <Stack direction="row" alignItems="center" spacing={2} sx={{ ml: { xs: 0.5, sm: 1 } }}>
                  <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />

                  <Tooltip title="Download certificate">
                    <Button
                      variant="outlined"
                      onClick={() => handleDownloadClick(cert)}
                      startIcon={<DownloadRoundedIcon />}
                      sx={{
                        textTransform: "none",
                        fontSize: 13.5,
                        borderRadius: 2,
                        borderColor: palette.gray300,
                        color: palette.gray900,
                        px: 1.5,
                        py: 0.75,
                        whiteSpace: "nowrap",
                        "&:hover": { borderColor: palette.green, bgcolor: palette.greenSoft },
                      }}
                    >
                      Download
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
      )}

      {/* Certificate Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        fullWidth
        maxWidth="md"
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0,0,0,.35)" } },
        }}
        PaperProps={{ sx: { borderRadius: 3, overflow: "visible" } }}
      >
        {selectedCourse && (
          <CertificatePreview
            course={selectedCourse}
            userName={userName}
            onClose={handleClosePreview}
            onDownload={handleDownloadComplete}
            userId={userId}
          />
        )}
      </Dialog>
    </Box>
  );
}
