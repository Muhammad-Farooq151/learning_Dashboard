import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";

export const FRONTEND_EMAIL_TEMPLATES = [
  {
    id: "frontend-welcome-learners",
    source: "frontend",
    type: "onboarding",
    name: "Welcome Learners",
    category: "Onboarding",
    description: "A clean welcome message for newly registered learners.",
    subject: "Welcome to Learning Hub, {{name}}",
    heading: "Your learning journey starts now",
    body:
      "Hello {{name}},\n\nWelcome to Learning Hub. Your account is ready and you can start exploring courses, tracking progress, and learning at your own pace.\n\nOpen your dashboard to continue where you left off.",
    ctaText: "Go to Dashboard",
    ctaUrl: "{{courseUrl}}",
    iconKey: "onboarding",
  },
  {
    id: "frontend-new-course-drop",
    source: "frontend",
    type: "course-launch",
    name: "New Course Launch",
    category: "Courses",
    description: "Announce a newly published course or updated learning path.",
    subject: "New learning opportunity: {{courseTitle}}",
    heading: "A fresh course is now available",
    body:
      "Hello {{name}},\n\nWe have added {{courseTitle}} to Learning Hub. It is a great pick if you want to build practical skills with guided lessons and progress tracking.\n\nTake a look and start learning today.",
    ctaText: "View Course",
    ctaUrl: "{{courseUrl}}",
    iconKey: "course",
  },
  {
    id: "frontend-weekly-promo",
    source: "frontend",
    type: "promotion",
    name: "Promotion Campaign",
    category: "Marketing",
    description: "Share a promotional campaign with optional discount details.",
    subject: "Special offer for you, {{name}}",
    heading: "A limited-time offer is live",
    body:
      "Hello {{name}},\n\nWe are running a special offer on Learning Hub for a short time.\n\nPromo code: {{promoCode}}\nDiscount: {{discount}}\n\nUse the offer before it expires and keep your learning momentum strong.",
    ctaText: "Explore Courses",
    ctaUrl: "{{courseUrl}}",
    iconKey: "promotion",
  },
  {
    id: "frontend-certificate-ready",
    source: "frontend",
    type: "certificate",
    name: "Certificate Ready",
    category: "Achievement",
    description: "Notify learners that they can now access their certificate.",
    subject: "Your certificate is ready, {{name}}",
    heading: "You completed your course successfully",
    body:
      "Hello {{name}},\n\nCongratulations on completing your course. Your certificate is now available in your Learning Hub account.\n\nOpen the platform to preview or download your certificate.",
    ctaText: "Open Learning Hub",
    ctaUrl: "{{courseUrl}}",
    iconKey: "certificate",
  },
];

export const TEMPLATE_ICON_MAP = {
  onboarding: AutoStoriesRoundedIcon,
  course: NotificationsActiveRoundedIcon,
  promotion: CampaignRoundedIcon,
  certificate: WorkspacePremiumRoundedIcon,
  custom: AutoStoriesRoundedIcon,
};
