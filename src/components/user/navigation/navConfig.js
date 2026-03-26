export const USER_NAV_ITEMS = [
  { label: "Dashboard", href: "/user/dashboard", iconPath: "/images/sidebar/user/dashboard.svg" },
  { label: "My Learnings", href: "/user/my-leaning", iconPath: "/images/sidebar/user/mylearnings.svg" },
  { label: "Certificates", href: "/user/certifications", iconPath: "/images/sidebar/user/cetificates.svg" },
  { label: "AI Tutor", href: "/user/ai-tutor", iconPath: "/images/sidebar/user/aitutor.svg" },
  { label: "Explore Courses", href: "/user/explore-courses", iconPath: "/images/sidebar/user/explore.svg" },
  { label: "Settings", href: "/user/settings", iconPath: "/images/sidebar/user/settings.svg" },
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
