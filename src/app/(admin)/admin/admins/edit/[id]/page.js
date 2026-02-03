"use client";

import React, { use } from "react";
import NewAdmin from "@/components/admin/admins/NewAdmin";

function EditAdminPage({ params }) {
  const resolvedParams = use(params);
  const adminId = resolvedParams?.id;

  return <NewAdmin adminId={adminId} />;
}

export default EditAdminPage;
