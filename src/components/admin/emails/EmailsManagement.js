"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { greenColor } from "@/utils/Colors";
import { getJSON, postJSON } from "@/utils/http";
import {
  FRONTEND_EMAIL_TEMPLATES,
  TEMPLATE_ICON_MAP,
} from "@/components/admin/emails/defaultTemplates";

const EMAIL_TYPES = {
  CUSTOM: "custom",
  ONBOARDING: "onboarding",
  COURSE_LAUNCH: "course-launch",
  PROMOTION: "promotion",
  CERTIFICATE: "certificate",
};

const sendEmailValidationSchema = Yup.object({
  recipients: Yup.array()
    .min(1, "Please select at least one learner")
    .required("Recipients are required"),
  course: Yup.mixed().nullable().when("type", {
    is: (value) => [EMAIL_TYPES.COURSE_LAUNCH, EMAIL_TYPES.CERTIFICATE].includes(value),
    then: (schema) => schema.required("Please select a related course"),
    otherwise: (schema) => schema.nullable(),
  }),
  category: Yup.string().trim().required("Category is required"),
  subject: Yup.string().trim().required("Subject is required"),
  heading: Yup.string().trim().required("Heading is required"),
  body: Yup.string().trim().required("Body is required"),
  ctaUrl: Yup.string()
    .trim()
    .test("cta-url", "CTA URL must start with http://, https://, or /", (value) => {
      if (!value) return true;
      return /^(https?:\/\/|\/)/i.test(value);
    }),
});

const templateValidationSchema = Yup.object({
  name: Yup.string().trim().required("Template name is required"),
  category: Yup.string().trim().required("Category is required"),
  description: Yup.string().trim().required("Description is required"),
  subject: Yup.string().trim().required("Subject is required"),
  heading: Yup.string().trim().required("Heading is required"),
  body: Yup.string().trim().required("Body is required"),
  ctaUrl: Yup.string()
    .trim()
    .test("cta-url", "CTA URL must start with http://, https://, or /", (value) => {
      if (!value) return true;
      return /^(https?:\/\/|\/)/i.test(value);
    }),
});

const createTemplateForm = () => ({
  name: "",
  category: "Custom",
  description: "",
  type: EMAIL_TYPES.CUSTOM,
  subject: "",
  heading: "",
  body: "",
  ctaText: "",
  ctaUrl: "",
});

const createSendState = () => ({
  type: EMAIL_TYPES.CUSTOM,
  templateName: "",
  templateSource: "manual",
  category: "Custom",
  subject: "",
  heading: "",
  body: "",
  ctaText: "",
  ctaUrl: "",
  recipients: [],
  course: null,
  promoCode: "",
  discount: "",
});

const formatDateTime = (value) => {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleString();
};

const replacePreviewTokens = (value = "", replacements = {}) =>
  Object.entries(replacements).reduce((result, [key, replacement]) => {
    return result.replace(new RegExp(`{{\\s*${key}\\s*}}`, "gi"), replacement ?? "");
  }, value || "");

const buildPreviewPayload = (template, sendState = null) => {
  const currentCourse = sendState?.course || null;
  const currentRecipients = sendState?.recipients || [];
  const previewUser = currentRecipients[0] || null;
  const previewData = {
    name: previewUser?.fullName || "Learner",
    email: previewUser?.email || "learner@example.com",
    courseTitle: currentCourse?.title || "your selected course",
    promoCode: sendState?.promoCode || "WELCOME20",
    discount: sendState?.discount ? `${sendState.discount}%` : "20%",
    courseUrl: currentCourse?._id
      ? `/user/my-leaning/${currentCourse._id}`
      : "/user/explore-courses",
  };

  return {
    templateName: template?.name || sendState?.templateName || "Email Template",
    subject: replacePreviewTokens(sendState?.subject || template?.subject || "", previewData),
    heading: replacePreviewTokens(sendState?.heading || template?.heading || "", previewData),
    body: replacePreviewTokens(sendState?.body || template?.body || "", previewData),
    ctaText: replacePreviewTokens(sendState?.ctaText || template?.ctaText || "", previewData),
    ctaUrl: replacePreviewTokens(sendState?.ctaUrl || template?.ctaUrl || "", previewData),
  };
};

const fireDialogAlert = async (options) => {
  const previousDidOpen = options?.didOpen;

  return Swal.fire({
    ...options,
    didOpen: (...args) => {
      const container = Swal.getContainer();
      if (container) {
        container.style.zIndex = "2000";
      }
      if (typeof previousDidOpen === "function") {
        previousDidOpen(...args);
      }
    },
  });
};

function MetricCard({ icon, value, label, helper, color = greenColor }) {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 4,
        border: "1px solid #E2E8F0",
        boxShadow: "none",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" spacing={1.5} alignItems="flex-start">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              bgcolor: `${color}15`,
              color,
            }}
          >
            {icon}
          </Box>
          <Typography variant="caption" color="text.secondary" textAlign="right">
            {helper}
          </Typography>
        </Stack>
        <Typography variant="h4" fontWeight={800} sx={{ mt: 2 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

function TemplateCard({ template, onPreview, onSend }) {
  const IconComponent = TEMPLATE_ICON_MAP[template.iconKey || "custom"] || AutoAwesomeRoundedIcon;

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 4,
        border: "1px solid #E2E8F0",
        boxShadow: "none",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
        },
      }}
    >
      <CardContent sx={{ p: 2.25, display: "flex", flexDirection: "column", height: "100%" }}>
        <Stack direction="row" justifyContent="space-between" spacing={1.5} alignItems="flex-start">
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              bgcolor: template.source === "frontend" ? `${greenColor}16` : "#EFF6FF",
              color: template.source === "frontend" ? greenColor : "#2563EB",
              flexShrink: 0,
            }}
          >
            <IconComponent fontSize="small" />
          </Box>

          <Chip
            size="small"
            label={template.source === "frontend" ? "Frontend" : "Database"}
            sx={{
              fontWeight: 700,
              bgcolor: template.source === "frontend" ? "#E8F5E9" : "#EFF6FF",
              color: template.source === "frontend" ? "#166534" : "#1D4ED8",
            }}
          />
        </Stack>

        <Typography variant="h6" fontWeight={800} sx={{ mt: 2, mb: 0.75 }}>
          {template.name}
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.25 }}>
          <Chip size="small" label={template.category || "General"} variant="outlined" />
          <Chip size="small" label={template.type || EMAIL_TYPES.CUSTOM} variant="outlined" />
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            minHeight: 44,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {template.description || "Professional reusable email template for this project."}
        </Typography>

        <Box
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: 3,
            bgcolor: "#F8FAFC",
            border: "1px solid #E2E8F0",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Subject
          </Typography>
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{
              mt: 0.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {template.subject}
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={1.25} sx={{ mt: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<VisibilityRoundedIcon />}
            onClick={() => onPreview(template)}
            sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
          >
            Preview
          </Button>
          <Button
            fullWidth
            variant="contained"
            startIcon={<SendRoundedIcon />}
            onClick={() => onSend(template)}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
              bgcolor: "#111827",
              "&:hover": { bgcolor: "#0F172A" },
            }}
          >
            Send
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function PreviewDialog({ open, onClose, preview }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableScrollLock
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <DialogTitle sx={{ fontWeight: 800 }}>Email Preview</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Template
        </Typography>
        <Typography fontWeight={700} sx={{ mb: 2.5 }}>
          {preview?.templateName || "Template preview"}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Subject
        </Typography>
        <Typography fontWeight={700} sx={{ mb: 2.5 }}>
          {preview?.subject || "Email subject"}
        </Typography>

        <Paper
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            border: "1px solid #E2E8F0",
            bgcolor: "#fff",
          }}
        >
          <Box
            sx={{
              px: { xs: 2.5, md: 4 },
              py: 3,
              background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
            }}
          >
            <Chip
              label="LEARNING HUB"
              sx={{
                bgcolor: "rgba(255,255,255,0.14)",
                color: "#D1FAE5",
                fontWeight: 800,
                mb: 2,
              }}
            />
            <Typography variant="h4" sx={{ color: "#fff", fontWeight: 800 }}>
              {preview?.heading || "Email heading"}
            </Typography>
          </Box>

          <Box sx={{ px: { xs: 2.5, md: 4 }, py: 3.5 }}>
            {(preview?.body || "").split("\n").filter(Boolean).map((line, index) => (
              <Typography
                key={`${line}-${index}`}
                variant="body1"
                sx={{ color: "#475569", mb: 2, lineHeight: 1.8 }}
              >
                {line}
              </Typography>
            ))}

            {preview?.ctaText ? (
              <Button
                variant="contained"
                sx={{
                  mt: 1,
                  borderRadius: 999,
                  px: 3,
                  bgcolor: greenColor,
                  "&:hover": { bgcolor: greenColor, opacity: 0.92 },
                }}
              >
                {preview.ctaText}
              </Button>
            ) : null}

            {preview?.ctaUrl ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
                CTA URL: {preview.ctaUrl}
              </Typography>
            ) : null}
          </Box>
        </Paper>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function EmailsManagement() {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [customTemplates, setCustomTemplates] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [templateForm, setTemplateForm] = useState(createTemplateForm());
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [previewPayload, setPreviewPayload] = useState(null);
  const [sendState, setSendState] = useState(createSendState());
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [usersPage, setUsersPage] = useState(0);
  const [usersRowsPerPage, setUsersRowsPerPage] = useState(5);

  const sendFormik = useFormik({
    enableReinitialize: true,
    initialValues: sendState,
    validationSchema: sendEmailValidationSchema,
    onSubmit: async (values) => {
      try {
        setSending(true);

        const payload = {
          type: values.type || EMAIL_TYPES.CUSTOM,
          recipients: values.recipients.map((user) => user.email),
          subject: values.subject.trim(),
          heading: values.heading.trim(),
          body: values.body.trim(),
          courseId: values.course?._id || null,
          courseTitle: values.course?.title || null,
          promoCode: values.promoCode.trim() || null,
          discount: values.discount.trim() || null,
          ctaText: values.ctaText.trim() || null,
          ctaUrl: values.ctaUrl.trim() || null,
          templateName: values.templateName || "Manual campaign",
          templateSource: values.templateSource || "manual",
        };

        const response = await postJSON("admins/send-email", payload);

        if (!response?.success) {
          throw new Error(response?.message || "Failed to send emails");
        }

        setEmailLogs((prev) => [
          {
            _id: `${Date.now()}`,
            templateName: payload.templateName,
            templateSource: payload.templateSource === "database" ? "database" : "frontend",
            subject: payload.subject,
            heading: payload.heading,
            recipientCount: values.recipients.length,
            successCount: response?.data?.successful ?? values.recipients.length,
            failedCount: response?.data?.failed ?? 0,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);

        setSendDialogOpen(false);
        setActiveTemplate(null);
        setSendState(createSendState());

        await fireDialogAlert({
          icon: "success",
          title: "Emails Sent",
          text: `Campaign processed for ${payload.recipients.length} recipient(s).`,
          confirmButtonColor: greenColor,
        });
      } catch (error) {
        console.error("Error sending emails:", error);
        await fireDialogAlert({
          icon: "error",
          title: "Send Failed",
          text: error.message || "Failed to send emails. Please try again.",
          confirmButtonColor: greenColor,
        });
      } finally {
        setSending(false);
      }
    },
  });

  const templateFormik = useFormik({
    enableReinitialize: true,
    initialValues: templateForm,
    validationSchema: templateValidationSchema,
    onSubmit: async (values) => {
      try {
        setSavingTemplate(true);
        const response = await postJSON("admins/email-templates", {
          name: values.name.trim(),
          category: values.category.trim(),
          description: values.description.trim(),
          type: values.type,
          subject: values.subject.trim(),
          heading: values.heading.trim(),
          body: values.body.trim(),
          ctaText: values.ctaText.trim(),
          ctaUrl: values.ctaUrl.trim(),
        });

        if (!response?.success || !response?.data) {
          throw new Error(response?.message || "Failed to save template");
        }

        setCustomTemplates((prev) => [
          {
            id: response.data._id,
            source: "database",
            type: response.data.type || EMAIL_TYPES.CUSTOM,
            name: response.data.name,
            category: response.data.category || "Custom",
            description: response.data.description || "",
            subject: response.data.subject || "",
            heading: response.data.heading || "",
            body: response.data.body || "",
            ctaText: response.data.ctaText || "",
            ctaUrl: response.data.ctaUrl || "",
            iconKey: "custom",
            createdAt: response.data.createdAt,
          },
          ...prev,
        ]);

        setTemplateDialogOpen(false);
        setTemplateForm(createTemplateForm());

        await fireDialogAlert({
          icon: "success",
          title: "Template Saved",
          text: "Custom template has been saved to the database.",
          confirmButtonColor: greenColor,
        });
      } catch (error) {
        await fireDialogAlert({
          icon: "error",
          title: "Save Failed",
          text: error.message || "Unable to save template right now.",
          confirmButtonColor: greenColor,
        });
      } finally {
        setSavingTemplate(false);
      }
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [usersRes, coursesRes, templatesRes, logsRes] = await Promise.all([
          getJSON("users"),
          getJSON("courses"),
          getJSON("admins/email-templates").catch(() => ({ success: false, data: [] })),
          getJSON("admins/email-logs").catch(() => ({ success: false, data: [] })),
        ]);

        if (usersRes?.success && Array.isArray(usersRes.data)) {
          setUsers(usersRes.data.filter((user) => user.role === "user"));
        }

        if (coursesRes?.success && Array.isArray(coursesRes.data)) {
          setCourses(coursesRes.data);
        }

        if (templatesRes?.success && Array.isArray(templatesRes.data)) {
          setCustomTemplates(
            templatesRes.data.map((template) => ({
              id: template._id,
              source: "database",
              type: template.type || EMAIL_TYPES.CUSTOM,
              name: template.name,
              category: template.category || "Custom",
              description: template.description || "",
              subject: template.subject || "",
              heading: template.heading || "",
              body: template.body || "",
              ctaText: template.ctaText || "",
              ctaUrl: template.ctaUrl || "",
              iconKey: "custom",
              createdAt: template.createdAt,
            }))
          );
        }

        if (logsRes?.success && Array.isArray(logsRes.data)) {
          setEmailLogs(logsRes.data);
        }
      } catch (error) {
        console.error("Error loading email data:", error);
        fireDialogAlert({
          icon: "error",
          title: "Load Failed",
          text: "Unable to load the email workspace right now.",
          confirmButtonColor: greenColor,
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    setUsersPage(0);
  }, [userSearch]);

  const activeUsers = useMemo(
    () => users.filter((user) => user.status === "active"),
    [users]
  );

  const allTemplates = useMemo(
    () => [...FRONTEND_EMAIL_TEMPLATES, ...customTemplates],
    [customTemplates]
  );

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return activeUsers;

    return activeUsers.filter((user) => {
      const fullName = (user.fullName || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      return fullName.includes(query) || email.includes(query);
    });
  }, [activeUsers, userSearch]);

  const paginatedUsers = useMemo(() => {
    const start = usersPage * usersRowsPerPage;
    return filteredUsers.slice(start, start + usersRowsPerPage);
  }, [filteredUsers, usersPage, usersRowsPerPage]);

  const selectedUsersFromTable = useMemo(() => {
    if (selectedUserIds.length === 0) return [];
    const selectedSet = new Set(selectedUserIds);
    return activeUsers.filter((user) => selectedSet.has(user._id));
  }, [activeUsers, selectedUserIds]);

  const allFilteredSelected =
    filteredUsers.length > 0 && filteredUsers.every((user) => selectedUserIds.includes(user._id));

  const someFilteredSelected =
    filteredUsers.some((user) => selectedUserIds.includes(user._id)) && !allFilteredSelected;

  const stats = useMemo(() => {
    const deliveredCount = emailLogs.reduce((sum, log) => sum + (log.successCount || 0), 0);
    return {
      templateCount: allTemplates.length,
      frontendCount: FRONTEND_EMAIL_TEMPLATES.length,
      learnerCount: activeUsers.length,
      deliveredCount,
    };
  }, [allTemplates.length, activeUsers.length, emailLogs]);

  const openPreviewDialog = (template, currentSendState = null) => {
    setPreviewPayload(buildPreviewPayload(template, currentSendState));
    setPreviewOpen(true);
  };

  const openSendDialog = (template) => {
    const initialRecipients = selectedUsersFromTable;
    setActiveTemplate(template);
    setSendState({
      type: template.type || EMAIL_TYPES.CUSTOM,
      templateName: template.name,
      templateSource: template.source || "manual",
      category: template.category || "Custom",
      subject: template.subject || "",
      heading: template.heading || "",
      body: template.body || "",
      ctaText: template.ctaText || "",
      ctaUrl: template.ctaUrl || "",
      recipients: initialRecipients,
      course: null,
      promoCode: "",
      discount: "",
    });
    setSendDialogOpen(true);
  };

  const handlePreviewFromSendDialog = () => {
    openPreviewDialog(activeTemplate, sendFormik.values);
  };

  const handleToggleUserSelection = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleToggleSelectAllFiltered = () => {
    const filteredIds = filteredUsers.map((user) => user._id);

    setSelectedUserIds((prev) => {
      if (filteredIds.every((id) => prev.includes(id))) {
        return prev.filter((id) => !filteredIds.includes(id));
      }

      return Array.from(new Set([...prev, ...filteredIds]));
    });
  };

  const handleUsersPageChange = (event, nextPage) => {
    setUsersPage(nextPage);
  };

  const handleUsersRowsPerPageChange = (event) => {
    setUsersRowsPerPage(parseInt(event.target.value, 10));
    setUsersPage(0);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", lg: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Email Campaigns
          </Typography>
          <Typography color="text.secondary">
            Template cards are the primary workflow now. Preview and sending both happen inside professional dialogs.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => setTemplateDialogOpen(true)}
          sx={{
            borderRadius: 999,
            bgcolor: greenColor,
            textTransform: "none",
            px: 2.5,
            fontWeight: 700,
            "&:hover": { bgcolor: greenColor, opacity: 0.92 },
          }}
        >
          Add Custom Template
        </Button>
      </Stack>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            icon={<MailOutlineRoundedIcon />}
            value={stats.templateCount}
            label="Total Templates"
            helper={`${stats.frontendCount} frontend defaults`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            icon={<AutoAwesomeRoundedIcon />}
            value={customTemplates.length}
            label="Custom Templates"
            helper="Saved in MongoDB"
            color="#2563EB"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            icon={<GroupsRoundedIcon />}
            value={activeUsers.length}
            label="Active Learners"
            helper="Available for campaigns"
            color="#7C3AED"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            icon={<HistoryRoundedIcon />}
            value={emailLogs.length}
            label="Campaign Logs"
            helper={`${stats.deliveredCount} successful sends`}
            color="#EA580C"
          />
        </Grid>
      </Grid>

      {loading ? <LinearProgress sx={{ mb: 3, borderRadius: 999 }} /> : null}

      <Card
        sx={{
          borderRadius: 4,
          border: "1px solid #E2E8F0",
          boxShadow: "none",
          mb: 3,
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={1.5}
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Template Cards
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click `Preview` to inspect the template and `Send` to configure recipients in a dialog.
              </Typography>
            </Box>
            {/* <Alert severity="info" sx={{ borderRadius: 3, py: 0 }}>
              Frontend templates stay permanent. Custom templates are stored in the database.
            </Alert> */}
          </Stack>

          <Grid container spacing={2.5}>
            {allTemplates.map((template) => (
              <Grid key={template.id} size={{ xs: 12, sm: 6, xl: 3 }}>
                <TemplateCard
                  template={template}
                  onPreview={(selected) => openPreviewDialog(selected)}
                  onSend={(selected) => openSendDialog(selected)}
                />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Card
        sx={{
          borderRadius: 4,
          border: "1px solid #E2E8F0",
          boxShadow: "none",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>
            Recent Campaign Activity
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Latest sends from the admin panel with delivery counts.
          </Typography>

          {emailLogs.length === 0 ? (
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px dashed #CBD5E1",
                bgcolor: "#F8FAFC",
              }}
            >
              <Typography fontWeight={700} sx={{ mb: 0.5 }}>
                No campaign logs yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Once a template is sent from its dialog, recent activity will appear here automatically.
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={1.5}>
              {emailLogs.map((log) => (
                <Paper
                  key={log._id}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: "1px solid #E2E8F0",
                    boxShadow: "none",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", lg: "row" }}
                    justifyContent="space-between"
                    spacing={1.5}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 0.75 }}>
                        <Chip
                          size="small"
                          label={log.templateName || "Custom Campaign"}
                          sx={{ bgcolor: "#ECFDF3", color: "#166534", fontWeight: 700 }}
                        />
                        <Chip
                          size="small"
                          label={log.templateSource === "database" ? "DB template" : "Frontend/manual"}
                          variant="outlined"
                        />
                      </Stack>
                      <Typography fontWeight={700}>{log.subject}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {log.heading || "Professional email campaign"}
                      </Typography>
                    </Box>

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                      alignItems={{ xs: "flex-start", sm: "center" }}
                    >
                      <Chip
                        label={`${log.successCount || 0} delivered`}
                        sx={{ bgcolor: "#E8F5E9", color: "#166534", fontWeight: 700 }}
                      />
                      <Chip
                        label={`${log.failedCount || 0} failed`}
                        sx={{ bgcolor: "#FEF2F2", color: "#B91C1C", fontWeight: 700 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {log.recipientCount || 0} recipients • {formatDateTime(log.createdAt)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Card
        sx={{
          borderRadius: 4,
          border: "1px solid #E2E8F0",
          boxShadow: "none",
          mt: 3,
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Learner Selection Table
              </Typography>
              <Typography variant="body2" color="text.secondary" maxWidth={"400px"}>
                Search learners, select rows, and your selected users will be prefilled when you open any template send dialog.
              </Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems={"center"}> 
              <TextField
                size="small"
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
                placeholder="Search by name or email"
                sx={{ minWidth: { xs: "100%", sm: 280 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="outlined"
                onClick={handleToggleSelectAllFiltered}
                sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 ,minWidth:"110px",maxHeight:"40px"}}
              >
                {allFilteredSelected ? "Unselect All" : "Select All"}
              </Button>
              <Chip
                label={`${selectedUsersFromTable.length} selected`}
                sx={{
                  alignSelf: "center",
                  bgcolor: "#ECFDF3",
                  color: "#166534",
                  fontWeight: 700,
                }}
              />
            </Stack>
          </Stack>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 3, overflow: "hidden" }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={allFilteredSelected}
                      indeterminate={someFilteredSelected}
                      onChange={handleToggleSelectAllFiltered}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Learner</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Enrolled Courses</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ py: 5, textAlign: "center", color: "text.secondary" }}>
                      No learners found for the current search.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => {
                    const checked = selectedUserIds.includes(user._id);

                    return (
                      <TableRow
                        key={user._id}
                        hover
                        selected={checked}
                        sx={{ cursor: "pointer" }}
                        onClick={() => handleToggleUserSelection(user._id)}
                      >
                        <TableCell padding="checkbox" onClick={(event) => event.stopPropagation()}>
                          <Checkbox
                            checked={checked}
                            onChange={() => handleToggleUserSelection(user._id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={700}>{user.fullName || "Learner"}</Typography>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={user.status || "active"}
                            sx={{
                              bgcolor: user.status === "active" ? "#E8F5E9" : "#FEF2F2",
                              color: user.status === "active" ? "#166534" : "#B91C1C",
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>
                        <TableCell>{Array.isArray(user.enrolledCourses) ? user.enrolledCourses.length : 0}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredUsers.length}
            page={usersPage}
            onPageChange={handleUsersPageChange}
            rowsPerPage={usersRowsPerPage}
            onRowsPerPageChange={handleUsersRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </CardContent>
      </Card>

      <PreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        preview={previewPayload}
      />

      <Dialog
        open={sendDialogOpen}
        onClose={() => setSendDialogOpen(false)}
        disableScrollLock
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Send Email
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {sendFormik.values.templateName || "Template"} campaign configuration
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.25 }}>
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                multiple
                options={activeUsers}
                getOptionLabel={(option) => `${option.fullName || "Learner"} (${option.email})`}
                value={sendFormik.values.recipients}
                onChange={(event, newValue) => {
                  sendFormik.setFieldValue("recipients", newValue);
                  sendFormik.setFieldTouched("recipients", true, false);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Recipients"
                    placeholder="Select learners to send this template"
                    onBlur={() => sendFormik.setFieldTouched("recipients", true, true)}
                    error={sendFormik.touched.recipients && Boolean(sendFormik.errors.recipients)}
                    helperText={sendFormik.touched.recipients ? sendFormik.errors.recipients : ""}
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

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                <Button
                  size="small"
                  onClick={() => {
                    sendFormik.setFieldValue("recipients", activeUsers);
                    sendFormik.setFieldTouched("recipients", true, false);
                  }}
                >
                  Select all active learners
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    sendFormik.setFieldValue("recipients", []);
                    sendFormik.setFieldTouched("recipients", true, false);
                  }}
                >
                  Clear recipients
                </Button>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                options={courses}
                getOptionLabel={(option) => option.title || ""}
                value={sendFormik.values.course}
                onChange={(event, newValue) => {
                  sendFormik.setFieldValue("course", newValue);
                  sendFormik.setFieldTouched("course", true, false);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Related course"
                    placeholder="Optional unless template needs course context"
                    onBlur={() => sendFormik.setFieldTouched("course", true, true)}
                    error={sendFormik.touched.course && Boolean(sendFormik.errors.course)}
                    helperText={sendFormik.touched.course ? sendFormik.errors.course : ""}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                name="category"
                label="Category"
                value={sendFormik.values.category}
                onChange={sendFormik.handleChange}
                onBlur={sendFormik.handleBlur}
                error={sendFormik.touched.category && Boolean(sendFormik.errors.category)}
                helperText={sendFormik.touched.category ? sendFormik.errors.category : ""}
              />
            </Grid>

            {sendFormik.values.type === EMAIL_TYPES.PROMOTION ? (
              <>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    name="promoCode"
                    label="Promo code"
                    value={sendFormik.values.promoCode}
                    onChange={sendFormik.handleChange}
                    onBlur={sendFormik.handleBlur}
                    error={sendFormik.touched.promoCode && Boolean(sendFormik.errors.promoCode)}
                    helperText={sendFormik.touched.promoCode ? sendFormik.errors.promoCode : ""}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    name="discount"
                    label="Discount"
                    value={sendFormik.values.discount}
                    onChange={sendFormik.handleChange}
                    onBlur={sendFormik.handleBlur}
                    error={sendFormik.touched.discount && Boolean(sendFormik.errors.discount)}
                    helperText={sendFormik.touched.discount ? sendFormik.errors.discount : ""}
                    placeholder="e.g. 20"
                  />
                </Grid>
              </>
            ) : null}

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                name="subject"
                label="Subject"
                value={sendFormik.values.subject}
                onChange={sendFormik.handleChange}
                onBlur={sendFormik.handleBlur}
                error={sendFormik.touched.subject && Boolean(sendFormik.errors.subject)}
                helperText={sendFormik.touched.subject ? sendFormik.errors.subject : ""}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                name="heading"
                label="Heading"
                value={sendFormik.values.heading}
                onChange={sendFormik.handleChange}
                onBlur={sendFormik.handleBlur}
                error={sendFormik.touched.heading && Boolean(sendFormik.errors.heading)}
                helperText={sendFormik.touched.heading ? sendFormik.errors.heading : ""}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={8}
                name="body"
                label="Body"
                value={sendFormik.values.body}
                onChange={sendFormik.handleChange}
                onBlur={sendFormik.handleBlur}
                error={sendFormik.touched.body && Boolean(sendFormik.errors.body)}
                helperText={sendFormik.touched.body ? sendFormik.errors.body : ""}
                placeholder="Use placeholders like {{name}}, {{email}}, {{courseTitle}}, {{promoCode}}, {{discount}}"
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.8, display: "block" }}>
                {"Supported placeholders: {{name}}, {{email}}, {{courseTitle}}, {{promoCode}}, {{discount}}"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                name="ctaText"
                label="CTA button text"
                value={sendFormik.values.ctaText}
                onChange={sendFormik.handleChange}
                onBlur={sendFormik.handleBlur}
                error={sendFormik.touched.ctaText && Boolean(sendFormik.errors.ctaText)}
                helperText={sendFormik.touched.ctaText ? sendFormik.errors.ctaText : ""}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                name="ctaUrl"
                label="CTA URL"
                value={sendFormik.values.ctaUrl}
                onChange={sendFormik.handleChange}
                onBlur={sendFormik.handleBlur}
                error={sendFormik.touched.ctaUrl && Boolean(sendFormik.errors.ctaUrl)}
                helperText={sendFormik.touched.ctaUrl ? sendFormik.errors.ctaUrl : ""}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
          <Button
            variant="outlined"
            startIcon={<VisibilityRoundedIcon />}
            onClick={handlePreviewFromSendDialog}
            sx={{ borderRadius: 999 }}
          >
            Preview
          </Button>

          <Stack direction="row" spacing={1.25}>
            <Button onClick={() => setSendDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={sendFormik.submitForm}
              disabled={sending}
              startIcon={sending ? <ClipLoader size={16} color="#fff" /> : <SendRoundedIcon />}
              sx={{
                borderRadius: 999,
                bgcolor: "#111827",
                textTransform: "none",
                fontWeight: 700,
                "&:hover": { bgcolor: "#0F172A" },
              }}
            >
              {sending ? "Sending..." : "Send Email"}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      <Dialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        disableScrollLock
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Create Custom Template</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.25 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                name="name"
                label="Template name"
                value={templateFormik.values.name}
                onChange={templateFormik.handleChange}
                onBlur={templateFormik.handleBlur}
                error={templateFormik.touched.name && Boolean(templateFormik.errors.name)}
                helperText={templateFormik.touched.name ? templateFormik.errors.name : ""}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                name="category"
                label="Category"
                value={templateFormik.values.category}
                onChange={templateFormik.handleChange}
                onBlur={templateFormik.handleBlur}
                error={templateFormik.touched.category && Boolean(templateFormik.errors.category)}
                helperText={templateFormik.touched.category ? templateFormik.errors.category : ""}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                name="description"
                label="Description"
                value={templateFormik.values.description}
                onChange={templateFormik.handleChange}
                onBlur={templateFormik.handleBlur}
                error={templateFormik.touched.description && Boolean(templateFormik.errors.description)}
                helperText={templateFormik.touched.description ? templateFormik.errors.description : ""}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                name="subject"
                label="Subject"
                value={templateFormik.values.subject}
                onChange={templateFormik.handleChange}
                onBlur={templateFormik.handleBlur}
                error={templateFormik.touched.subject && Boolean(templateFormik.errors.subject)}
                helperText={templateFormik.touched.subject ? templateFormik.errors.subject : ""}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                name="heading"
                label="Heading"
                value={templateFormik.values.heading}
                onChange={templateFormik.handleChange}
                onBlur={templateFormik.handleBlur}
                error={templateFormik.touched.heading && Boolean(templateFormik.errors.heading)}
                helperText={templateFormik.touched.heading ? templateFormik.errors.heading : ""}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={8}
                name="body"
                label="Body"
                value={templateFormik.values.body}
                onChange={templateFormik.handleChange}
                onBlur={templateFormik.handleBlur}
                error={templateFormik.touched.body && Boolean(templateFormik.errors.body)}
                helperText={templateFormik.touched.body ? templateFormik.errors.body : ""}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                name="ctaText"
                label="CTA text"
                value={templateFormik.values.ctaText}
                onChange={templateFormik.handleChange}
                onBlur={templateFormik.handleBlur}
                error={templateFormik.touched.ctaText && Boolean(templateFormik.errors.ctaText)}
                helperText={templateFormik.touched.ctaText ? templateFormik.errors.ctaText : ""}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                name="ctaUrl"
                label="CTA URL"
                value={templateFormik.values.ctaUrl}
                onChange={templateFormik.handleChange}
                onBlur={templateFormik.handleBlur}
                error={templateFormik.touched.ctaUrl && Boolean(templateFormik.errors.ctaUrl)}
                helperText={templateFormik.touched.ctaUrl ? templateFormik.errors.ctaUrl : ""}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={templateFormik.submitForm}
            disabled={savingTemplate}
            startIcon={savingTemplate ? <ClipLoader size={16} color="#fff" /> : <SaveRoundedIcon />}
            sx={{
              borderRadius: 999,
              bgcolor: greenColor,
              textTransform: "none",
              fontWeight: 700,
              "&:hover": { bgcolor: greenColor, opacity: 0.92 },
            }}
          >
            {savingTemplate ? "Saving..." : "Save Template"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
