import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

export const USER_NAV_ITEMS = [
  { label: "Dashboard", href: "/user/dashboard", icon: <DashboardRoundedIcon /> },
  { label: "My Learnings", href: "/user/my-leaning", icon: <MenuBookOutlinedIcon /> },
  { label: "Certificates", href: "/user/certifications", icon: <WorkspacePremiumOutlinedIcon /> },
  { label: "AI Tutor", href: "/user/ai-tutor", icon: <AutoAwesomeOutlinedIcon /> },
  { label: "Explore Courses", href: "/user/explore-courses", icon: <ExploreOutlinedIcon /> },
  { label: "Settings", href: "/user/settings", icon: <SettingsOutlinedIcon /> },
];

const ROUTE_META = [
  {
    match: (pathname) => pathname === "/user/dashboard",
    title: "Dashboard",
    subtitle: "Track progress, monitor activity, and continue learning from one place.",
  },
  {
    match: (pathname) => pathname.startsWith("/user/my-leaning/") && pathname !== "/user/my-leaning",
    title: "Learning Details",
    subtitle: "Continue lessons, review modules, and stay on top of your course progress.",
  },
  {
    match: (pathname) => pathname === "/user/my-leaning",
    title: "My Learnings",
    subtitle: "Manage your enrolled courses and jump back into active lessons.",
  },
  {
    match: (pathname) => pathname === "/user/certifications",
    title: "Certificates",
    subtitle: "View earned certificates and manage your completion records.",
  },
  {
    match: (pathname) => pathname === "/user/ai-tutor",
    title: "AI Tutor",
    subtitle: "Ask questions, get guidance, and learn with real-time AI support.",
  },
  {
    match: (pathname) =>
      pathname.startsWith("/user/explore-courses/") && pathname !== "/user/explore-courses",
    title: "Course Details",
    subtitle: "Review course highlights, pricing, and enrollment details before you start.",
  },
  {
    match: (pathname) => pathname === "/user/explore-courses",
    title: "Explore Courses",
    subtitle: "Browse curated courses tailored to your interests and skill level.",
  },
  {
    match: (pathname) => pathname === "/user/settings",
    title: "Settings",
    subtitle: "Update your profile, preferences, and account details securely.",
  },
];

function titleFromSegment(segment = "") {
  return segment
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getUserRouteMeta(pathname = "") {
  const matchedRoute = ROUTE_META.find((route) => route.match(pathname));
  if (matchedRoute) {
    return { title: matchedRoute.title, subtitle: matchedRoute.subtitle };
  }

  const fallbackSegment = pathname.split("/").filter(Boolean).pop() || "dashboard";
  const title = titleFromSegment(fallbackSegment);

  return {
    title,
    subtitle: "Navigate your learning workspace with quick access to core sections.",
  };
}
