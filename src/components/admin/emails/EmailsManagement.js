"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Grid,
  Autocomplete,
  Divider,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import RecommendRoundedIcon from "@mui/icons-material/RecommendRounded";
import { greenColor } from "@/components/utils/Colors";
import { getJSON, postJSON } from "@/utils/http";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";

const EMAIL_TYPES = {
  COURSE_UPDATE: "course-update",
  PROMOTION: "promotion",
  RECOMMENDED: "recommended",
};

function EmailsManagement() {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Form states
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, coursesRes] = await Promise.all([
        getJSON("users"),
        getJSON("courses"),
      ]);

      if (usersRes?.success && Array.isArray(usersRes.data)) {
        setUsers(usersRes.data);
      }
      if (coursesRes?.success && Array.isArray(coursesRes.data)) {
        setCourses(coursesRes.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load data. Please refresh the page.",
        confirmButtonColor: greenColor,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    // Reset form when switching tabs
    setSubject("");
    setMessage("");
    setPromoCode("");
    setDiscount("");
    setSelectedUsers([]);
    setSelectedCourse(null);
  };

  const handleSendEmail = async () => {
    if (selectedUsers.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Recipients",
        text: "Please select at least one user to send the email.",
        confirmButtonColor: greenColor,
      });
      return;
    }

    if (!subject.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Subject Required",
        text: "Please enter an email subject.",
        confirmButtonColor: greenColor,
      });
      return;
    }

    if (!message.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Message Required",
        text: "Please enter an email message.",
        confirmButtonColor: greenColor,
      });
      return;
    }

    let emailType = EMAIL_TYPES.COURSE_UPDATE;
    if (tab === 1) emailType = EMAIL_TYPES.PROMOTION;
    if (tab === 2) emailType = EMAIL_TYPES.RECOMMENDED;

    // Validation based on email type
    if (emailType === EMAIL_TYPES.COURSE_UPDATE && !selectedCourse) {
      Swal.fire({
        icon: "warning",
        title: "Course Required",
        text: "Please select a course for the update email.",
        confirmButtonColor: greenColor,
      });
      return;
    }

    if (emailType === EMAIL_TYPES.RECOMMENDED && !selectedCourse) {
      Swal.fire({
        icon: "warning",
        title: "Course Required",
        text: "Please select a course to recommend.",
        confirmButtonColor: greenColor,
      });
      return;
    }

    try {
      setSending(true);

      const emailData = {
        type: emailType,
        recipients: selectedUsers.map((u) => u.email),
        subject: subject.trim(),
        message: message.trim(),
        courseId: selectedCourse?._id || null,
        courseTitle: selectedCourse?.title || null,
        promoCode: promoCode.trim() || null,
        discount: discount.trim() || null,
      };

      const response = await postJSON("admins/send-email", emailData);

      if (response?.success) {
        Swal.fire({
          icon: "success",
          title: "Emails Sent!",
          text: `Successfully sent emails to ${selectedUsers.length} user(s).`,
          confirmButtonColor: greenColor,
        });

        // Reset form
        setSubject("");
        setMessage("");
        setPromoCode("");
        setDiscount("");
        setSelectedUsers([]);
        setSelectedCourse(null);
      } else {
        throw new Error(response?.message || "Failed to send emails");
      }
    } catch (error) {
      console.error("Error sending emails:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to send emails. Please try again.",
        confirmButtonColor: greenColor,
      });
    } finally {
      setSending(false);
    }
  };

  const getDefaultSubject = () => {
    if (tab === 0) return "Course Update - New Content Available";
    if (tab === 1) return "Special Promotion - Limited Time Offer";
    if (tab === 2) return "Recommended Course for You";
    return "";
  };

  const getDefaultMessage = () => {
    if (tab === 0 && selectedCourse) {
      return `We're excited to inform you that "${selectedCourse.title}" has been updated with new content!\n\nCheck out the latest additions and continue your learning journey.\n\nHappy Learning!`;
    }
    if (tab === 1) {
      return "We have an exclusive promotion just for you! Don't miss out on this limited-time offer.\n\nUse the promo code to get amazing discounts on our courses.\n\nHappy Learning!";
    }
    if (tab === 2 && selectedCourse) {
      return `Based on your interests, we think you'll love "${selectedCourse.title}"!\n\nThis course is perfect for you. Enroll now and start learning.\n\nHappy Learning!`;
    }
    return "";
  };

  useEffect(() => {
    if (tab !== null) {
      setSubject(getDefaultSubject());
      setMessage(getDefaultMessage());
    }
  }, [tab, selectedCourse]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        Email Management
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab
              icon={<EmailRoundedIcon />}
              iconPosition="start"
              label="Course Updates"
            />
            <Tab
              icon={<CampaignRoundedIcon />}
              iconPosition="start"
              label="Promotions & Offers"
            />
            <Tab
              icon={<RecommendRoundedIcon />}
              iconPosition="start"
              label="Recommended Courses"
            />
          </Tabs>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {/* Recipients Selection */}
            <Grid size={{xs:12}}>
              <FormControl fullWidth>
                <Autocomplete
                  multiple
                  options={users}
                  getOptionLabel={(option) =>
                    `${option.fullName || "User"} (${option.email})`
                  }
                  value={selectedUsers}
                  onChange={(event, newValue) => {
                    setSelectedUsers(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Recipients"
                      placeholder="Choose users to send email"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option._id || index}
                        label={option.fullName || option.email}
                      />
                    ))
                  }
                />
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Selected: {selectedUsers.length} user(s)
              </Typography>
            </Grid>

            {/* Course Selection (for Course Update and Recommended) */}
            {(tab === 0 || tab === 2) && (
              <Grid size={{xs:12}}>
                <FormControl fullWidth>
                  <Autocomplete
                    options={courses}
                    getOptionLabel={(option) => option.title || ""}
                    value={selectedCourse}
                    onChange={(event, newValue) => {
                      setSelectedCourse(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={tab === 0 ? "Select Course" : "Recommended Course"}
                        placeholder="Choose a course"
                      />
                    )}
                  />
                </FormControl>
              </Grid>
            )}

            {/* Promo Code & Discount (for Promotions) */}
            {tab === 1 && (
              <>
                <Grid size={{xs:12,sm:6}}>
                  <TextField
                    fullWidth
                    label="Promo Code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="e.g., SUMMER2024"
                  />
                </Grid>
                <Grid size={{xs:12,sm:6}}>
                  <TextField
                    fullWidth
                    label="Discount Percentage"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="e.g., 20"
                    type="number"
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Grid>
              </>
            )}

            {/* Subject */}
            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                label="Email Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </Grid>

            {/* Message */}
            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                label="Email Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                multiline
                rows={8}
                required
                placeholder="Enter your email message here..."
              />
            </Grid>

            {/* Send Button */}
                <Grid size={{xs:12}}>
              <Button
                variant="contained"
                onClick={handleSendEmail}
                disabled={sending || loading}
                startIcon={
                  sending ? (
                    <ClipLoader size={16} color="#fff" />
                  ) : (
                    <SendRoundedIcon />
                  )
                }
                sx={{
                  backgroundColor: greenColor,
                  "&:hover": { backgroundColor: greenColor, opacity: 0.9 },
                  px: 4,
                  py: 1.5,
                }}
              >
                {sending ? "Sending..." : `Send Email to ${selectedUsers.length} User(s)`}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Paper sx={{ p: 2, bgcolor: "#f5f5f5" }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Note:</strong> Emails will be sent to all selected users. Make sure to
          review the content before sending.
        </Typography>
      </Paper>
    </Box>
  );
}

export default EmailsManagement;
