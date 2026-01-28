"use client";

import React, { use } from "react";
import NewTutor from "@/components/admin/tutors/NewTutor";

function EditTutorPage({ params }) {
  const resolvedParams = use(params);
  return <NewTutor tutorId={resolvedParams.id} />;
}

export default EditTutorPage;
