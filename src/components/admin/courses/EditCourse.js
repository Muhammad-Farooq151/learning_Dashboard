"use client";

import React from "react";
import NewCourse from "./NewCourse";

function EditCourse({ courseId }) {
  return <NewCourse courseId={courseId} />;
}

export default EditCourse;
