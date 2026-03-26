export const ADMIN_EMAIL_NAV_ITEMS = [
  { label: "Emails", href: "/admin/emails" },
  { label: "Course Updates", href: "/admin/emails/course-updates" },
  { label: "Promotions & Offers", href: "/admin/emails/promotions-offers" },
  { label: "Refund Status", href: "/admin/emails/refund-status" },
  { label: "Recommended Courses", href: "/admin/emails/recommended-courses" },
];

export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", iconPath: "/images/sidebar/admin/dashboard.svg" },
  { label: "Courses", href: "/admin/courses", iconPath: "/images/sidebar/admin/courses.svg" },
  { label: "Users", href: "/admin/users", iconPath: "/images/sidebar/admin/users.svg" },
  { label: "Tutors", href: "/admin/tutors", iconPath: "/images/sidebar/admin/tutors.svg" },
  { label: "Admins", href: "/admin/admins", iconPath: "/images/sidebar/admin/admins.svg" },
  {
    label: "Emails",
    href: "/admin/emails",
    iconPath: "/images/sidebar/admin/emails.svg",
    children: ADMIN_EMAIL_NAV_ITEMS,
  },
  { label: "Refunds", href: "/admin/refunds", iconPath: "/images/sidebar/admin/refunds.svg" },
  { label: "Settings", href: "/admin/settings", iconPath: "/images/sidebar/admin/setttings.svg" },
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
  { match: (pathname) => pathname === "/admin/emails/course-updates", title: "Course Updates" },
  { match: (pathname) => pathname === "/admin/emails/promotions-offers", title: "Promotions & Offers" },
  { match: (pathname) => pathname === "/admin/emails/refund-status", title: "Refund Status" },
  { match: (pathname) => pathname === "/admin/emails/recommended-courses", title: "Recommended Courses" },
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
