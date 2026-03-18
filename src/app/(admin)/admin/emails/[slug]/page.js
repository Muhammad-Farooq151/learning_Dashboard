import React from "react";
import { notFound } from "next/navigation";
import EmailsManagement from "@/components/admin/emails/EmailsManagement";

const EMAIL_PAGE_CONFIG = {
  "course-updates": {
    pageTitle: "Course Updates",
    pageDescription:
      "Send course-related updates only to learners who have turned on Course Updates in their notification preferences.",
    preferenceKey: "course-updates",
    allowedTemplateTypes: ["course-launch"],
  },
  "promotions-offers": {
    pageTitle: "Promotions & Offers",
    pageDescription:
      "Reach only the learners who opted in for Promotions & Offers from their account settings.",
    preferenceKey: "promotions-offers",
    allowedTemplateTypes: ["promotion"],
  },
  "refund-status": {
    pageTitle: "Refund Status",
    pageDescription:
      "Manage refund-related communication for learners who enabled Refund Status notifications.",
    preferenceKey: "refund-status",
    allowedTemplateTypes: ["refund-status"],
  },
  "recommended-courses": {
    pageTitle: "Recommended Courses",
    pageDescription:
      "Target learners who want personalized course recommendations based on their notification preferences.",
    preferenceKey: "recommended-courses",
    allowedTemplateTypes: ["recommended-courses"],
  },
};

export default async function AdminEmailPreferencePage({ params }) {
  const resolvedParams = await params;
  const config = EMAIL_PAGE_CONFIG[resolvedParams?.slug];

  if (!config) {
    notFound();
  }

  return <EmailsManagement {...config} />;
}
