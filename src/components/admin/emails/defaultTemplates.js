import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import RecommendRoundedIcon from "@mui/icons-material/RecommendRounded";

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
  {
    id: "frontend-refund-status",
    source: "frontend",
    type: "refund-status",
    name: "Refund Status Update",
    category: "Refunds",
    description: "Keep learners informed about their refund request progress.",
    subject: "Refund status update for {{name}}",
    heading: "Your refund request has a new update",
    body:
      "Hello {{name}},\n\nThere is an update regarding your refund request on Learning Hub.\n\nPlease review the latest status and any next steps directly from your account.",
    ctaText: "Open Refund Details",
    ctaUrl: "{{courseUrl}}",
    iconKey: "refund",
  },
  {
    id: "frontend-recommended-courses",
    source: "frontend",
    type: "recommended-courses",
    name: "Recommended Courses",
    category: "Recommendations",
    description: "Share personalized course suggestions with engaged learners.",
    subject: "Recommended courses for {{name}}",
    heading: "Fresh course picks you may like",
    body:
      "Hello {{name}},\n\nBased on your learning activity, we selected a few recommended courses that may help you keep growing your skills on Learning Hub.\n\nOpen the platform and explore what fits your goals best.",
    ctaText: "Explore Recommendations",
    ctaUrl: "{{courseUrl}}",
    iconKey: "recommended",
  },
];

export const TEMPLATE_ICON_MAP = {
  onboarding: AutoStoriesRoundedIcon,
  course: NotificationsActiveRoundedIcon,
  promotion: CampaignRoundedIcon,
  certificate: WorkspacePremiumRoundedIcon,
  refund: ReceiptLongRoundedIcon,
  recommended: RecommendRoundedIcon,
  custom: AutoStoriesRoundedIcon,
};
