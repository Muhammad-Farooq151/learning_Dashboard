"use client";

import React from "react";
import CourseLearningPage from "@/components/user/myLearnings/CourseLearningPage";

// Mock course data - replace with actual API call
const mockCourses = {
  1: {
    id: 1,
    title: "Full Stack Web Developer Career Accelerator",
    desc: "Deep dive into advanced JavaScript concepts, closures, prototypes, and modern ES6+ features",
    progress: 24,
    img: "/images/python.png",
  },
  2: {
    id: 2,
    title: "Advanced JavaScript",
    desc: "Deep dive into advanced JavaScript concepts, closures, prototypes, and modern ES6+ features",
    progress: 24,
    img: "/images/js.png",
  },
  3: {
    id: 3,
    title: "Machine Learning Basics",
    desc: "Introduction to machine learning algorithms and practical implementation with real-world examples",
    progress: 24,
    img: "/images/ml.png",
  },
};

function CourseLearningPageRoute({ params }) {
  const courseId = params?.id;
  const course = mockCourses[courseId] || null;

  return <CourseLearningPage courseId={courseId} course={course} />;
}

export default CourseLearningPageRoute;

