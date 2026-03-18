"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Alert,
  Box,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "./settings-phone-input.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { postJSON, putJSON } from "@/utils/http";
import { clearAuthToken, getStoredUser, updateStoredUser } from "@/utils/authStorage";
import { ClipLoader } from "react-spinners";
import { toast } from "react-hot-toast";

const toggleSettings = [
  {
    id: "course-updates",
    label: "Course Updates",
    desc: "Get important info like enrollment confirmations, new lessons, and course completion status.",
    defaultChecked: true,
  },
  {
    id: "promotions",
    label: "Promotions & Offers",
    desc: "Receive special deals, discounts, and exclusive learning packages.",
    defaultChecked: true,
  },
  {
    id: "refund-status",
    label: "Refund Status",
    desc: "Stay updated on the progress of your refund requests for paid courses.",
    defaultChecked: false,
  },
  {
    id: "recommended-courses",
    label: "Recommended Courses",
    desc: "Get personalized suggestions based on your interests and past learning activity.",
    defaultChecked: true,
  },
];

const defaultNotificationState = () =>
  toggleSettings.reduce((acc, curr) => {
    acc[curr.id] = curr.defaultChecked;
    return acc;
  }, {});

const notificationPreferenceMap = {
  "course-updates": "courseUpdates",
  promotions: "promotionsOffers",
  "refund-status": "refundStatus",
  "recommended-courses": "recommendedCourses",
};

const preferencesToSwitchState = (preferences = {}) => ({
  "course-updates":
    typeof preferences.courseUpdates === "boolean" ? preferences.courseUpdates : true,
  promotions:
    typeof preferences.promotionsOffers === "boolean" ? preferences.promotionsOffers : true,
  "refund-status":
    typeof preferences.refundStatus === "boolean" ? preferences.refundStatus : false,
  "recommended-courses":
    typeof preferences.recommendedCourses === "boolean"
      ? preferences.recommendedCourses
      : true,
});

const switchStateToPreferences = (switches = {}) => ({
  courseUpdates: Boolean(switches["course-updates"]),
  promotionsOffers: Boolean(switches.promotions),
  refundStatus: Boolean(switches["refund-status"]),
  recommendedCourses: Boolean(switches["recommended-courses"]),
});

const inputStyles = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
  },
};

const passwordFields = [
  {
    id: "old",
    label: "Old Password",
    placeholder: "eg: ********",
    helper: "Current password is incorrect.",
  },
  {
    id: "new",
    label: "New Password",
    placeholder: "eg: Abc1234",
    helper: "At least 8 characters, 1 number, 1 special character",
  },
  {
    id: "confirm",
    label: "New Confirm Password",
    placeholder: "eg: Abc1234",
    helper: "New password must differ from current.",
  },
];

const SectionHeader = ({ icon, title, subtitle, meta }) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems={{ xs: "flex-start", sm: "center" }}
    spacing={2}
    sx={{ mb: 2 }}
  >
    <Stack direction="row" spacing={2} alignItems="center">
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          bgcolor: "#F6F8FB",
          display: "grid",
          placeItems: "center",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
    {meta}
  </Stack>
);

const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 48,
  height: 28,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(20px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#16A249",
        opacity: 1,
        border: 0,
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 24,
    height: 24,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: "#E4E7EC",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 250,
    }),
  },
}));

const strongPassword = Yup.string()
  .required("At least 8 characters, 1 number, 1 special character")
  .min(8, "At least 8 characters, 1 number, 1 special character")
  .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])/, "Use at least 1 number & 1 special character");

const passwordSchema = Yup.object({
  oldPassword: Yup.string().required("Current password is incorrect."),
  newPassword: strongPassword.notOneOf(
    [Yup.ref("oldPassword")],
    "New password must differ from current."
  ),
  confirmPassword: Yup.string()
    .required("New password must match.")
    .oneOf([Yup.ref("newPassword")], "New password must match new password."),
});

const createPasswordSchema = Yup.object({
  password: strongPassword,
  confirmPassword: Yup.string()
    .required("Passwords must match.")
    .oneOf([Yup.ref("password")], "Passwords must match."),
});

function SettingsPage() {
  const router = useRouter();
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
  });
  const [profileSnapshot, setProfileSnapshot] = useState(null);
  const [profileMeta, setProfileMeta] = useState({ createdAt: null });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileConfirmOpen, setProfileConfirmOpen] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [notificationSavingId, setNotificationSavingId] = useState("");
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [createPasswordVisibility, setCreatePasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });
  const [notifications, setNotifications] = useState(defaultNotificationState);

  const handleToggleChange = async (id) => {
    const storedUser = getStoredUser();
    const currentSetting = toggleSettings.find((item) => item.id === id);
    const isEnabled = !notifications[id];
    if (!storedUser?.id) {
      await Swal.fire({
        icon: "error",
        title: "Session Expired",
        text: "Please log in again to update notification preferences.",
        scrollbarPadding: false,
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
      });
      return;
    }

    const nextNotifications = {
      ...notifications,
      [id]: !notifications[id],
    };

    setNotifications(nextNotifications);
    setNotificationSavingId(id);

    try {
      await putJSON("users/notification-preferences", {
        userId: storedUser.id,
        emailPreferences: switchStateToPreferences(nextNotifications),
      });
      await Swal.fire({
        icon: "success",
        title: "Preferences Updated",
        text: `${currentSetting?.label || "Notification preference"} has been ${
          isEnabled ? "enabled" : "disabled"
        } successfully.`,
        scrollbarPadding: false,
        confirmButtonColor: "#16A249",
        confirmButtonText: "OK",
      });
    } catch (error) {
      setNotifications(notifications);
      await Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message || "Failed to update notification preferences.",
        scrollbarPadding: false,
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
      });
    } finally {
      setNotificationSavingId("");
    }
  };

  const formik = useFormik({
    initialValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
    validationSchema: passwordSchema,
    onSubmit: async (values, helpers) => {
      const storedUser = getStoredUser();

      if (!storedUser?.id) {
        toast.error("Session expired. Please log in again.");
        return;
      }

      setPasswordSubmitting(true);
      try {
        await putJSON("users/password", {
          userId: storedUser.id,
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        });
        helpers.resetForm();
        await Swal.fire({
          icon: "success",
          title: "Password Changed",
          text: "Your password has been changed. Please log in again.",
          scrollbarPadding: false,
          confirmButtonColor: "#16A249",
          confirmButtonText: "OK",
        });
        clearAuthToken();
        router.replace("/");
      } catch (error) {
        if ((error.message || "").toLowerCase().includes("current password")) {
          helpers.setFieldError("oldPassword", error.message);
          helpers.setFieldTouched("oldPassword", true, false);
        } else if ((error.message || "").toLowerCase().includes("differ from current")) {
          helpers.setFieldError("newPassword", error.message);
          helpers.setFieldTouched("newPassword", true, false);
        } else {
          toast.error(error.message || "Failed to update password.");
        }
      } finally {
        setPasswordSubmitting(false);
      }
    },
  });

  const createPasswordFormik = useFormik({
    initialValues: { password: "", confirmPassword: "" },
    validationSchema: createPasswordSchema,
    onSubmit: async (values, helpers) => {
      toast.success("Password created successfully.");
      helpers.resetForm();
    },
  });

  const getFieldError = (field) =>
    (formik.touched[field] || formik.submitCount > 0) && formik.errors[field];

  const passwordFieldHelpers = useMemo(
    () => ({
      old: "Current password is incorrect.",
      new: "At least 8 characters, 1 number, 1 special character",
      confirm: "New password must differ from current.",
    }),
    []
  );

  const memberSinceText = useMemo(() => {
    if (!profileMeta.createdAt) return "Member since —";
    const date = new Date(profileMeta.createdAt);
    if (Number.isNaN(date.getTime())) return "Member since —";
    return `Member since ${date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })}`;
  }, [profileMeta]);

  const handleProfileFieldChange = (field) => (event) => {
    const value = event.target.value;
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (value) => {
    setProfileForm((prev) => ({ ...prev, phoneNumber: value || "" }));
  };

  const hasProfileChanges = useMemo(() => {
    if (!profileSnapshot) return false;
    return (
      profileSnapshot.fullName !== profileForm.fullName ||
      (profileSnapshot.phoneNumber || "") !== (profileForm.phoneNumber || "")
    );
  }, [profileSnapshot, profileForm]);

  const handleProfileReset = () => {
    if (profileSnapshot) {
      setProfileForm(profileSnapshot);
    }
  };

  const handleProfileUpdateRequest = () => {
    if (!hasProfileChanges) return;
    setProfileConfirmOpen(true);
  };

  const handleProfileConfirmClose = () => {
    if (!profileSubmitting) setProfileConfirmOpen(false);
  };

  const submitProfileUpdate = async () => {
    const storedUser = getStoredUser();
    if (!storedUser?.id) {
      toast.error("Session expired. Please log in again.");
      return;
    }
    setProfileSubmitting(true);
    try {
      const payload = {
        userId: storedUser.id,
        fullName: profileForm.fullName.trim(),
        phoneNumber: profileForm.phoneNumber || "",
      };
      const response = await putJSON("users/profile", payload);
      const updatedProfile = {
        fullName: response.user.fullName || "",
        email: response.user.email || "",
        phoneNumber: response.user.phoneNumber || "",
      };
      setProfileForm(updatedProfile);
      setProfileSnapshot(updatedProfile);
      setProfileMeta((prev) => ({ ...prev, createdAt: response.user.createdAt || prev.createdAt }));
      updateStoredUser({
        id: response.user.id,
        fullName: updatedProfile.fullName,
        email: updatedProfile.email,
        phoneNumber: updatedProfile.phoneNumber,
      });
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleProfileConfirmSubmit = async () => {
    setProfileConfirmOpen(false);
    await submitProfileUpdate();
  };

  useEffect(() => {
    async function loadProfile() {
      const storedUser = getStoredUser();
      if (!storedUser?.id) {
        setProfileError("Session expired. Please log in again to view your profile.");
        setProfileLoading(false);
        return;
      }
      setProfileLoading(true);
      try {
        const response = await postJSON("users/profile", { userId: storedUser.id });
        const profile = response?.user || storedUser;
        const snapshot = {
          fullName: profile.fullName || "",
          email: profile.email || "",
          phoneNumber: profile.phoneNumber || "",
        };
        setProfileForm(snapshot);
        setProfileSnapshot(snapshot);
        setProfileMeta({ createdAt: profile.createdAt || null });
        setNotifications(preferencesToSwitchState(profile.emailPreferences));
        updateStoredUser({
          id: profile.id || storedUser.id,
          fullName: profile.fullName,
          email: profile.email,
          phoneNumber: profile.phoneNumber,
        });
        setProfileError("");
      } catch (error) {
        setProfileError(error.message || "Failed to load profile details.");
      } finally {
        setProfileLoading(false);
      }
    }
    loadProfile();
  }, []);

  return (
    <Box >
      {/* <Typography variant="h5" fontWeight={600} mb={3}>
        Settings
      </Typography> */}

      <Stack spacing={3}>
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: "0px 12px 30px rgba(15, 23, 42, 0.06)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <SectionHeader
              icon={<PersonOutlineOutlinedIcon sx={{ color: "#16A249" }} />}
              title="Profile"
              subtitle="Update your personal details"
              meta={<Typography color="text.secondary">{memberSinceText}</Typography>}
            />

            {profileLoading ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 220,
                }}
              >
                <CircularProgress size={32} />
              </Box>
            ) : profileError ? (
              <Alert severity="error">{profileError}</Alert>
            ) : (
              <Grid container spacing={3} mt={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 2 }}>
                  <Stack spacing={1.5} alignItems="center">
                    <Avatar
                      src="/images/reactc.png"
                      alt="Profile avatar"
                      sx={{ width: 92, height: 92, borderRadius: 3 }}
                    />
                    <Stack spacing={1} alignItems="center">
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ textTransform: "none" }}
                        startIcon={<PhotoCameraRoundedIcon />}
                      >
                        Update Image
                      </Button>
                      <Button
                        variant="text"
                        size="small"
                        color="error"
                        sx={{ textTransform: "none" }}
                      >
                        Remove
                      </Button>
                    </Stack>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, sm: 10 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Full Name"
                        placeholder="eg: John Doe"
                        fullWidth
                        sx={inputStyles}
                        value={profileForm.fullName}
                        onChange={handleProfileFieldChange("fullName")}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Email Address"
                        placeholder="eg: john_doe@gmail.com"
                        fullWidth
                        sx={inputStyles}
                        value={profileForm.email}
                        InputProps={{ readOnly: true }}
                        helperText="Email address cannot be edited. Contact support for changes."
                      />
                      {/* <Typography variant="caption" color="text.secondary">
                        We lock your verified email for security reasons.
                      </Typography> */}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box
                        sx={{
                          border: "1px solid #E5E7EB",
                          borderRadius: 3,
                          px: 1.5,
                          py: 1,
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
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
                          defaultCountry="US"
                          value={profileForm.phoneNumber || ""}
                          onChange={handlePhoneChange}
                          placeholder="eg: 1234 5678 90"
                          className="settings-phone-input"
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12 }} display="flex" justifyContent="flex-end" gap={2}>
                      <Button
                        variant="outlined"
                        sx={{ textTransform: "none" }}
                        onClick={handleProfileReset}
                        disabled={!hasProfileChanges || profileLoading || profileSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        sx={{
                          textTransform: "none",
                          bgcolor: "#16A249",
                          ":hover": { bgcolor: "#13873C" },
                        }}
                        disabled={!hasProfileChanges || profileLoading || profileSubmitting}
                        onClick={handleProfileUpdateRequest}
                      >
                        {profileSubmitting ? (
                          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                            <ClipLoader size={18} color="#fff" />
                            Saving…
                          </Box>
                        ) : (
                          "Update Profile Details"
                        )}
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>

        <Dialog open={profileConfirmOpen} onClose={handleProfileConfirmClose} maxWidth="xs" fullWidth>
          <DialogTitle fontWeight={700}>Save profile changes?</DialogTitle>
          <DialogContent>
            <DialogContentText color="text.primary">
              We’ll update your name and phone number. Email stays locked for security. Continue?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleProfileConfirmClose} sx={{ textTransform: "none" }} disabled={profileSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleProfileConfirmSubmit}
              variant="contained"
              color="success"
              sx={{ textTransform: "none" }}
              disabled={profileSubmitting}
            >
              {profileSubmitting ? <ClipLoader size={18} color="#fff" /> : "Confirm"}
            </Button>
          </DialogActions>
        </Dialog>

        <Card
          sx={{
            borderRadius: 4,
            boxShadow: "0px 12px 30px rgba(15, 23, 42, 0.06)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <SectionHeader
              icon={<LockOutlinedIcon sx={{ color: "#0EA5E9" }} />}
              title="Update Password"
              subtitle="Keep your account secure by setting a new password."
            />

            <Box component="form" onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                {passwordFields.map((field) => (
                  <Grid size={{ xs: 12, md: 4 }} key={field.id}>
                    <TextField
                      name={
                        field.id === "old"
                          ? "oldPassword"
                          : field.id === "new"
                            ? "newPassword"
                            : "confirmPassword"
                      }
                      type={showPassword[field.id] ? "text" : "password"}
                      label={field.label}
                      placeholder={field.placeholder}
                      fullWidth
                      value={
                        field.id === "old"
                          ? formik.values.oldPassword
                          : field.id === "new"
                            ? formik.values.newPassword
                            : formik.values.confirmPassword
                      }
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={Boolean(
                        getFieldError(
                          field.id === "old"
                            ? "oldPassword"
                            : field.id === "new"
                              ? "newPassword"
                              : "confirmPassword"
                        )
                      )}
                      helperText={
                        getFieldError(
                          field.id === "old"
                            ? "oldPassword"
                            : field.id === "new"
                              ? "newPassword"
                              : "confirmPassword"
                        ) ?? passwordFieldHelpers[field.id]
                      }
                      sx={inputStyles}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() =>
                                setShowPassword((prev) => ({
                                  ...prev,
                                  [field.id]: !prev[field.id],
                                }))
                              }
                            >
                              {showPassword[field.id] ? (
                                <VisibilityOutlinedIcon fontSize="small" />
                              ) : (
                                <VisibilityOffOutlinedIcon fontSize="small" />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                ))}
              </Grid>

            <Box
              sx={{
                mt: 3,
                bgcolor: "#E8FFF4",
                borderRadius: 3,
                p: 2,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start" mb={1}>
                <InfoOutlinedIcon sx={{ color: "#0F9D58" }} />
                <Typography variant="body2" fontWeight={600}>
                  Before you continue, please note:
                </Typography>
              </Stack>
              <Box pl={3}>
                <Typography variant="body2" color="text.secondary">
                  • You&apos;ll be logged out from all other devices.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • You&apos;ll need to sign in again with your new password.
                </Typography>
              </Box>
            </Box>

              <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
                <Button
                  variant="outlined"
                  sx={{ textTransform: "none" }}
                  onClick={formik.handleReset}
                  disabled={passwordSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={passwordSubmitting}
                  sx={{
                    textTransform: "none",
                    bgcolor: "#16A249",
                    ":hover": { bgcolor: "#13873C" },
                  }}
                >
                  {passwordSubmitting ? (
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                      <ClipLoader size={18} color="#fff" />
                      Updating...
                    </Box>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* <Card
          sx={{
            borderRadius: 4,
            boxShadow: "0px 12px 30px rgba(15, 23, 42, 0.06)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <SectionHeader
              icon={<LockOutlinedIcon sx={{ color: "#16A249" }} />}
              title="Create Password"
              subtitle="Set a password if you signed up with Google or Apple."
            />

            <Box component="form" onSubmit={createPasswordFormik.handleSubmit}>
              <Grid container spacing={2}>
                {["password", "confirmPassword"].map((field) => (
                  <Grid size={{ xs: 12, md: 6 }} key={field}>
                    <TextField
                      name={field}
                      label={field === "password" ? "New Password" : "Confirm Password"}
                      placeholder="eg: Abc!1234"
                      type={createPasswordVisibility[field] ? "text" : "password"}
                      fullWidth
                      sx={inputStyles}
                      value={createPasswordFormik.values[field]}
                      onChange={createPasswordFormik.handleChange}
                      onBlur={createPasswordFormik.handleBlur}
                      error={
                        Boolean(
                          createPasswordFormik.touched[field] && createPasswordFormik.errors[field]
                        )
                      }
                      helperText={
                        (createPasswordFormik.touched[field] && createPasswordFormik.errors[field]) ||
                        (field === "password"
                          ? "Use 8+ chars with a mix of letters, numbers & symbols."
                          : "Repeat the same password to confirm.")
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() =>
                                setCreatePasswordVisibility((prev) => ({
                                  ...prev,
                                  [field]: !prev[field],
                                }))
                              }
                            >
                              {createPasswordVisibility[field] ? (
                                <VisibilityOutlinedIcon fontSize="small" />
                              ) : (
                                <VisibilityOffOutlinedIcon fontSize="small" />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                ))}
              </Grid>

              <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
                <Button
                  variant="contained"
                  sx={{
                    textTransform: "none",
                    bgcolor: "#16A249",
                    ":hover": { bgcolor: "#13873C" },
                  }}
                  type="submit"
                >
                  Create Password
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card> */}

        <Card
          sx={{
            borderRadius: 4,
            boxShadow: "0px 12px 30px rgba(15, 23, 42, 0.06)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <SectionHeader
              icon={<NotificationsNoneOutlinedIcon sx={{ color: "#F59E0B" }} />}
              title="Email Notification Preferences"
              subtitle="Tell us what you’d like to hear from us. Stay updated with course progress, new learning opportunities, and personalized tips — or keep it simple."
            />

            <Grid container spacing={3}>
              {toggleSettings.map((item) => (
                <Grid size={{ xs: 12, md: 6 }} key={item.id}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {item.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.desc}
                      </Typography>
                    </Box>
                    <IOSSwitch
                      checked={notifications[item.id]}
                      onChange={() => handleToggleChange(item.id)}
                      disabled={notificationSavingId === item.id}
                    />
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: 4,
            boxShadow: "0px 12px 30px rgba(15, 23, 42, 0.06)",
            border: "1px solid rgba(248, 113, 113, 0.4)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <SectionHeader
              icon={<DeleteOutlineOutlinedIcon sx={{ color: "#F43F5E" }} />}
              title="Delete Account"
              subtitle="Deleting your account will remove all your data permanently. This action cannot be undone."
            />
            <Button
              variant="contained"
              color="error"
              sx={{ textTransform: "none" }}
            >
              Delete My Account
            </Button>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

export default SettingsPage;

