import React from "react";
import CourseDetails from "@/components/user/course-details/CourseDetails";
import { courses } from "@/data/courses";

function CourseDetailsPage({ params }) {
  const course = courses.find((item) => item.id === params.id);
  return <CourseDetails course={course} />;
}

export default CourseDetailsPage;

