"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  InputAdornment,
  IconButton,
  Switch,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  Stack,
  Alert,
  Grid,
  Chip,
  CircularProgress,
} from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "@/components/user/settings/settings-phone-input.css";
import { greenColor } from "@/utils/Colors";
import { getStoredUser } from "@/utils/authStorage";
import { getJSON } from "@/utils/http";

const GreenSwitch = ({ checked, onChange, ...props }) => (
  <Switch
    checked={checked}
    onChange={onChange}
    sx={{
      "& .MuiSwitch-switchBase.Mui-checked": {
        color: greenColor,
      },
      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
        backgroundColor: greenColor,
      },
    }}
    {...props}
  />
);

function AdminSettings() {
  const [adminInfo, setAdminInfo] = useState(null);
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState({
    refundRequest: true,
    newUserRegistration: true,
  });

  const [aiTutorSettings, setAiTutorSettings] = useState({
    enableAiTutor: true,
    quizGeneration: false,
    maxQuestionsPerDay: "50",
    responseLength: "Medium",
  });

  const [userRegistration, setUserRegistration] = useState({
    allowNewRegistrations: true,
    requireEmailVerification: true,
    enableCertificates: true,
    maintenanceMode: false,
  });

  const handleEmailNotificationChange = (key) => (event) => {
    setEmailNotifications({
      ...emailNotifications,
      [key]: event.target.checked,
    });
  };

  const handleAiTutorChange = (key) => (event) => {
    setAiTutorSettings({
      ...aiTutorSettings,
      [key]: event.target.checked,
    });
  };

  const handleAiTutorSelectChange = (key) => (event) => {
    setAiTutorSettings({
      ...aiTutorSettings,
      [key]: event.target.value,
    });
  };

  const handleUserRegistrationChange = (key) => (event) => {
    setUserRegistration({
      ...userRegistration,
      [key]: event.target.checked,
    });
  };

  // Load admin information
  useEffect(() => {
    const loadAdminInfo = async () => {
      try {
        setLoadingAdmin(true);
        const storedUser = getStoredUser();
        
        if (storedUser?.id) {
          // Fetch full admin details from API
          try {
            const response = await getJSON(`admins/${storedUser.id}`);
            if (response.success && response.data) {
              setAdminInfo(response.data);
              // Populate form with admin data
              setProfileData({
                fullName: response.data.fullName || "",
                email: response.data.email || "",
                phoneNumber: response.data.phoneNumber || "",
              });
            } else {
              // Fallback to stored user data
              setAdminInfo({
                fullName: storedUser.fullName || "",
                email: storedUser.email || "",
                phoneNumber: storedUser.phoneNumber || "",
                role: storedUser.role || "admin",
              });
              setProfileData({
                fullName: storedUser.fullName || "",
                email: storedUser.email || "",
                phoneNumber: storedUser.phoneNumber || "",
              });
            }
          } catch (error) {
            // Fallback to stored user data if API fails
            setAdminInfo({
              fullName: storedUser.fullName || "",
              email: storedUser.email || "",
              phoneNumber: storedUser.phoneNumber || "",
              role: storedUser.role || "admin",
            });
            setProfileData({
              fullName: storedUser.fullName || "",
              email: storedUser.email || "",
              phoneNumber: storedUser.phoneNumber || "",
            });
          }
        }
      } catch (error) {
        console.error("Error loading admin info:", error);
      } finally {
        setLoadingAdmin(false);
      }
    };

    loadAdminInfo();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name) => {
    if (!name) return "A";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight={700} mb={1}>
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Manage platform settings and configurations
      </Typography>

      {/* Admin Information Card */}
      {loadingAdmin ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : adminInfo ? (
        <Card
          sx={{
            borderRadius: 4,
            border: "1px solid #EDF1F7",
            boxShadow: "none",
            mb: 3,
            background: `linear-gradient(135deg, ${greenColor}15 0%, ${greenColor}05 100%)`,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: greenColor,
                  fontSize: "1.5rem",
                  fontWeight: 600,
                }}
              >
                {getInitials(adminInfo.fullName)}
              </Avatar>
              <Box flex={1}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <Typography variant="h5" fontWeight={700}>
                    {adminInfo.fullName || "Admin User"}
                  </Typography>
                  <Chip
                    icon={<AdminPanelSettingsOutlinedIcon />}
                    label="Administrator"
                    size="small"
                    sx={{
                      bgcolor: greenColor,
                      color: "white",
                      fontWeight: 600,
                      "& .MuiChip-icon": {
                        color: "white",
                      },
                    }}
                  />
                </Stack>
                <Stack spacing={1} mt={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EmailOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                      {adminInfo.email || "N/A"}
                    </Typography>
                  </Stack>
                  {adminInfo.phoneNumber && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PhoneRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary">
                        {adminInfo.phoneNumber}
                      </Typography>
                    </Stack>
                  )}
                  {adminInfo.createdAt && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarTodayRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary">
                        Member since {formatDate(adminInfo.createdAt)}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      {/* Profile Section */}
      <Card
        sx={{
          borderRadius: 4,
          border: "1px solid #EDF1F7",
          boxShadow: "none",
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={3}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <PersonOutlineOutlinedIcon sx={{ color: greenColor }} />
              <Typography variant="h6" fontWeight={600}>
                Profile
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {adminInfo?.createdAt ? `Member since ${formatDate(adminInfo.createdAt)}` : "Update your profile"}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Update your personal details
          </Typography>

       

          <Grid container spacing={2} mb={3}>
          <Grid size={{ xs:2 }} >
          <Box display={"flex"} flexDirection={"column"} gap={1} justifyContent={"center"} alignItems={"center"}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: greenColor,
                fontSize: "2rem",
                fontWeight: 600,
              }}
            >
              {getInitials(profileData.fullName || adminInfo?.fullName)}
            </Avatar>
        <Button
        fullWidth
                variant="contained"
                sx={{
                  border:"1px solid black",
                  color:"black",
                  backgroundColor: "transparent",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: greenColor,
                    opacity: 0.9,
                  },
                }}
              >
                Update Image
              </Button>
              <Button
                variant="text"
                sx={{
                  color: "#EF4444",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#FEE2E2",
                  },
                }}
              >
                Remove
              </Button>
          </Box>
          </Grid>
          <Grid size={{ xs: 10 }}>
          <Grid size={{ xs: 12 }}>
              <Typography variant="body2" fontWeight={500} mb={1}>
                Full Name
              </Typography>
              <TextField
                fullWidth
                placeholder="eg: John Doe"
                value={profileData.fullName}
                onChange={(e) =>
                  setProfileData({ ...profileData, fullName: e.target.value })
                }
                sx={{
                  mb:1,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" fontWeight={500} mb={1}>
                Email Address
              </Typography>
              <TextField
                fullWidth
                placeholder="eg: john_doe@gmail.com"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                sx={{
                  mb:1,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  border: "1px solid #E5E7EB",
                  borderRadius: 3,
                  px: 1.5,
                  py: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  mb:1,
                  "&:focus-within": {
                    borderColor: greenColor,
                    boxShadow: `0 0 0 3px rgba(76, 188, 153, 0.1)`,
                  },
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  Phone Number
                </Typography>
                <PhoneInput
                  international
                  defaultCountry="GB"
                  value={profileData.phoneNumber || ""}
                  onChange={(value) =>
                    setProfileData({ ...profileData, phoneNumber: value || "" })
                  }
                  placeholder="eg: 1234 5678 90"
                  className="settings-phone-input"
                />
              </Box>
            </Grid>
          </Grid>
          </Grid>

          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="contained"
              sx={{
                backgroundColor: greenColor,
                textTransform: "none",
                px: 3,
                "&:hover": {
                  backgroundColor: greenColor,
                  opacity: 0.9,
                },
              }}
            >
              Update Profile Details
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Update Password Section */}
      <Card
        sx={{
          borderRadius: 4,
          border: "1px solid #EDF1F7",
          boxShadow: "none",
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            <LockOutlinedIcon sx={{ color: greenColor }} />
            <Typography variant="h6" fontWeight={600}>
              Update Password
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Keep your account secure by setting a new password.
          </Typography>

          <Grid container spacing={2} mb={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body2" fontWeight={500} mb={1}>
                Old Password
              </Typography>
              <TextField
                fullWidth
                type={showOldPassword ? "text" : "password"}
                placeholder="eg: **********"
                value={passwordData.oldPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    oldPassword: e.target.value,
                  })
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        edge="end"
                      >
                        {showOldPassword ? (
                          <VisibilityOffOutlinedIcon />
                        ) : (
                          <VisibilityOutlinedIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body2" fontWeight={500} mb={1}>
                New Password
              </Typography>
              <TextField
                fullWidth
                type={showNewPassword ? "text" : "password"}
                placeholder="eg: Abc1234"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                      >
                        {showNewPassword ? (
                          <VisibilityOffOutlinedIcon />
                        ) : (
                          <VisibilityOutlinedIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body2" fontWeight={500} mb={1}>
                New Confirm Password
              </Typography>
              <TextField
                fullWidth
                type={showConfirmPassword ? "text" : "password"}
                placeholder="eg: Abc1234"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOffOutlinedIcon />
                        ) : (
                          <VisibilityOutlinedIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          <Alert
            icon={<InfoOutlinedIcon />}
            sx={{
              backgroundColor: "#F1FBF8",
              color: "#065F46",
              mb: 3,
              borderRadius: 2,
              "& .MuiAlert-icon": {
                color: greenColor,
              },
            }}
          >
            <Typography variant="body2" fontWeight={600} mb={1}>
              Before you continue, please note:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ m: 0, pl: 2 }}>
              <li>You&apos;ll be logged out from all other devices.</li>
              <li>You&apos;ll need to sign in again with your new password.</li>
            </Typography>
          </Alert>

          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="contained"
              sx={{
                backgroundColor: greenColor,
                textTransform: "none",
                px: 3,
                "&:hover": {
                  backgroundColor: greenColor,
                  opacity: 0.9,
                },
              }}
            >
              Update Password
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Email Notification Preferences Section */}
      <Card
        sx={{
          borderRadius: 4,
          border: "1px solid #EDF1F7",
          boxShadow: "none",
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            <EmailOutlinedIcon sx={{ color: greenColor }} />
            <Typography variant="h6" fontWeight={600}>
              Email Notification Preferences
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Configure which notifications you receive via email
          </Typography>

          <Stack spacing={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2">Refund Request</Typography>
              <GreenSwitch
                checked={emailNotifications.refundRequest}
                onChange={handleEmailNotificationChange("refundRequest")}
              />
            </Stack>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2">New User Registration</Typography>
              <GreenSwitch
                checked={emailNotifications.newUserRegistration}
                onChange={handleEmailNotificationChange("newUserRegistration")}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* AI Tutor Settings Section */}
      <Card
        sx={{
          borderRadius: 4,
          border: "1px solid #EDF1F7",
          boxShadow: "none",
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            <SmartToyOutlinedIcon sx={{ color: greenColor }} />
            <Typography variant="h6" fontWeight={600}>
              AI Tutor Settings
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Configure AI-powered learning assistance
          </Typography>

          <Stack spacing={3}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2">Enable AI Tutor</Typography>
              <GreenSwitch
                checked={aiTutorSettings.enableAiTutor}
                onChange={handleAiTutorChange("enableAiTutor")}
              />
            </Stack>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2">Quiz Generation</Typography>
              <GreenSwitch
                checked={aiTutorSettings.quizGeneration}
                onChange={handleAiTutorChange("quizGeneration")}
              />
            </Stack>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2">Max Questions Per Day</Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={aiTutorSettings.maxQuestionsPerDay}
                  onChange={handleAiTutorSelectChange("maxQuestionsPerDay")}
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  <MenuItem value="25">25</MenuItem>
                  <MenuItem value="50">50</MenuItem>
                  <MenuItem value="75">75</MenuItem>
                  <MenuItem value="100">100</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2">Response Length</Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={aiTutorSettings.responseLength}
                  onChange={handleAiTutorSelectChange("responseLength")}
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  <MenuItem value="Short">Short</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Long">Long</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>

          <Stack direction="row" justifyContent="flex-end" mt={3}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: greenColor,
                textTransform: "none",
                px: 3,
                "&:hover": {
                  backgroundColor: greenColor,
                  opacity: 0.9,
                },
              }}
            >
              Update AI Tutor Settings
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* User Registration Section */}
      <Card
        sx={{
          borderRadius: 4,
          border: "1px solid #EDF1F7",
          boxShadow: "none",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            <PeopleOutlinedIcon sx={{ color: greenColor }} />
            <Typography variant="h6" fontWeight={600}>
              User Registration
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Control user registration and verification
          </Typography>

          <Stack spacing={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2">Allow New Registrations</Typography>
              <GreenSwitch
                checked={userRegistration.allowNewRegistrations}
                onChange={handleUserRegistrationChange("allowNewRegistrations")}
              />
            </Stack>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2">Require Email Verification</Typography>
              <GreenSwitch
                checked={userRegistration.requireEmailVerification}
                onChange={handleUserRegistrationChange(
                  "requireEmailVerification"
                )}
              />
            </Stack>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2">Enable Certificates</Typography>
              <GreenSwitch
                checked={userRegistration.enableCertificates}
                onChange={handleUserRegistrationChange("enableCertificates")}
              />
            </Stack>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2">Maintenance Mode</Typography>
              <GreenSwitch
                checked={userRegistration.maintenanceMode}
                onChange={handleUserRegistrationChange("maintenanceMode")}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default AdminSettings;

