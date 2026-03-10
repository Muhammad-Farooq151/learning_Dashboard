import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { SupervisedUserCircle } from "@mui/icons-material";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";

export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <DashboardRoundedIcon /> },
  { label: "Courses", href: "/admin/courses", icon: <MenuBookOutlinedIcon /> },
  { label: "Users", href: "/admin/users", icon: <SupervisedUserCircle /> },
  { label: "Tutors", href: "/admin/tutors", icon: <SchoolOutlinedIcon /> },
  { label: "Admins", href: "/admin/admins", icon: <AdminPanelSettingsOutlinedIcon /> },
  { label: "Emails", href: "/admin/emails", icon: <EmailOutlinedIcon /> },
  { label: "Refunds", href: "/admin/refunds", icon: <WorkspacePremiumOutlinedIcon /> },
  { label: "Settings", href: "/admin/settings", icon: <SettingsOutlinedIcon /> },
];

const ADMIN_ROUTE_META = [
  { match: (pathname) => pathname === "/admin/dashboard", title: "Dashboard" },
  { match: (pathname) => pathname === "/admin/courses", title: "Courses" },
  { match: (pathname) => pathname.startsWith("/admin/courses/new"), title: "New Course" },
  { match: (pathname) => pathname.startsWith("/admin/courses/edit/"), title: "Edit Course" },
  { match: (pathname) => pathname === "/admin/users", title: "Users" },
  { match: (pathname) => pathname === "/admin/tutors", title: "Tutors" },
  { match: (pathname) => pathname.startsWith("/admin/tutors/new"), title: "New Tutor" },
  { match: (pathname) => pathname.startsWith("/admin/tutors/edit/"), title: "Edit Tutor" },
  { match: (pathname) => pathname === "/admin/admins", title: "Admins" },
  { match: (pathname) => pathname.startsWith("/admin/admins/new"), title: "New Admin" },
  { match: (pathname) => pathname.startsWith("/admin/admins/edit/"), title: "Edit Admin" },
  { match: (pathname) => pathname === "/admin/emails", title: "Emails" },
  { match: (pathname) => pathname === "/admin/refunds", title: "Refunds" },
  { match: (pathname) => pathname === "/admin/settings", title: "Settings" },
];

function titleFromSegment(segment = "") {
  return segment
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getAdminRouteTitle(pathname = "") {
  const matchedRoute = ADMIN_ROUTE_META.find((route) => route.match(pathname));
  if (matchedRoute) return matchedRoute.title;

  const fallbackSegment = pathname.split("/").filter(Boolean).pop() || "dashboard";
  return titleFromSegment(fallbackSegment);
}
