export const courses = [
  {
    id: "1",
    title: "React Complete Course",
    category: "Programming",
    level: "Beginner",
    duration: "12 hours",
    lessons: 32,
    students: 1250,
    rating: 4.9,
    image: "/images/reactc.png",
    price: 41.97,
    oldPrice: 59.97,
    description:
      "Master React from basics to advanced concepts including hooks, context, and performance optimization.",
    about:
      "Master React from basics to advanced concepts including hooks, context, and performance optimization. This comprehensive course is designed to take you from fundamentals to advanced techniques. You'll work on real-world projects, learn industry best practices, and gain hands-on experience that you can immediately apply in your career.",
    learnPoints: [
      "Build production-ready applications from scratch",
      "Implement advanced architectural patterns",
      "Apply industry best practices and coding standards",
      "Deploy applications to cloud platforms",
      "Debug and optimize application performance",
      "Work with APIs and external integrations",
      "Understand security principles and implementation",
    ],
    skills: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Bootstrap (Front-end Framework)",
      "Git (Version Control System)",
      "REST",
      "Object Oriented Programming (OOP)",
      "Database Design",
    ],
    instructor: {
      name: "Dr. Sarah Johnson",
      title: "Senior Solutions Engineer at Google",
      rating: 4.9,
      students: "43,200",
      courses: 12,
    },
    faq: [
      {
        question: "Who are Career Accelerators for?",
        answer:
          "Career Accelerators are designed for ambitious learners ready to fast-track their professional growth through intensive, real-world focused training.",
      },
      {
        question: "Is any prior knowledge or experience required?",
        answer:
          "No prior experience is required. We start from fundamentals and guide you through advanced concepts with hands-on projects.",
      },
      {
        question: "How are courses selected for Career Accelerators?",
        answer:
          "Each course is selected based on industry demand, practical application, and instructor expertise to ensure maximum career impact.",
      },
      {
        question: "What is a Full-Stack Web Developer?",
        answer:
          "A full-stack web developer is proficient in both front-end and back-end development, enabling them to build complete web applications from start to finish.",
      },
      {
        question: "How long does it take to become a Full-Stack Developer?",
        answer:
          "Learners typically complete the full program in 10-12 weeks with consistent effort and completion of all project work.",
      },
      {
        question: "Can I become a Full-Stack Developer with no experience?",
        answer:
          "Absolutely. The program starts from the basics and builds your expertise through structured learning paths and guided projects.",
      },
    ],
  },
  {
    id: "2",
    title: "Advanced JavaScript Concepts",
    category: "Programming",
    level: "Advanced",
    duration: "10 hours",
    lessons: 28,
    students: 980,
    rating: 4.8,
    image: "/images/js.png",
    price: 39.5,
    oldPrice: 54.0,
    description:
      "Go deep into advanced JavaScript concepts, closures, prototypes, and modern ES features.",
    about:
      "Take your JavaScript skills to the next level with advanced concepts, design patterns, and performance optimizations. This course helps you build a strong foundation for creating complex, scalable applications.",
    learnPoints: [
      "Master asynchronous JavaScript patterns",
      "Leverage modern ES features effectively",
      "Optimize application performance",
      "Implement advanced module architectures",
      "Write testable, maintainable code",
    ],
    skills: [
      "JavaScript",
      "ES Modules",
      "TypeScript",
      "Testing",
      "Performance",
      "Design Patterns",
    ],
    instructor: {
      name: "Jason Lee",
      title: "Principal Frontend Engineer",
      rating: 4.8,
      students: "28,400",
      courses: 9,
    },
    faq: [
      {
        question: "What background is needed?",
        answer:
          "You should be comfortable with JavaScript fundamentals, including functions, objects, and basic asynchronous patterns.",
      },
      {
        question: "Does the course cover TypeScript?",
        answer:
          "Yes, we cover how to integrate TypeScript into advanced JavaScript workflows for safer, more maintainable code.",
      },
    ],
  },
  {
    id: "3",
    title: "Python for Data Science",
    category: "Data Science",
    level: "Intermediate",
    duration: "21 hours",
    lessons: 45,
    students: 1835,
    rating: 4.9,
    image: "/images/python.png",
    price: 44.0,
    oldPrice: 64.0,
    description:
      "Learn Python programming for data analysis and machine learning applications.",
    about:
      "From data wrangling to predictive modeling, build real-world data science solutions with Python and essential libraries.",
    learnPoints: [
      "Clean and transform complex datasets",
      "Build predictive models with scikit-learn",
      "Visualize insights with Matplotlib and Seaborn",
      "Deploy models to production environments",
    ],
    skills: [
      "Python",
      "Pandas",
      "NumPy",
      "scikit-learn",
      "Data Visualization",
      "Machine Learning",
    ],
    instructor: {
      name: "Priya Sharma",
      title: "Lead Data Scientist",
      rating: 4.9,
      students: "31,800",
      courses: 14,
    },
    faq: [
      {
        question: "Do I need coding experience?",
        answer:
          "Basic programming knowledge is recommended. We provide optional prep modules for complete beginners.",
      },
    ],
  },
  {
    id: "4",
    title: "Machine Learning Basics",
    category: "AI/ML",
    level: "Intermediate",
    duration: "17 hours",
    lessons: 38,
    students: 1670,
    rating: 4.7,
    image: "/images/ml.png",
    price: 42.0,
    oldPrice: 58.0,
    description:
      "Introduction to machine learning algorithms and practical model-building exercises.",
    about:
      "Understand the fundamentals of machine learning, build models, and evaluate performance with hands-on labs.",
    learnPoints: [
      "Build supervised and unsupervised models",
      "Tune hyperparameters for better accuracy",
      "Use ML pipelines for reproducibility",
    ],
    skills: ["Machine Learning", "Python", "TensorFlow", "Model Evaluation"],
    instructor: {
      name: "Miguel Alvarez",
      title: "AI Engineer",
      rating: 4.7,
      students: "19,200",
      courses: 8,
    },
    faq: [
      {
        question: "Is deep learning covered?",
        answer:
          "We introduce core concepts and provide resources for further study, focusing on foundational ML understanding.",
      },
    ],
  },
  {
    id: "5",
    title: "Web Design Fundamentals",
    category: "Design",
    level: "Beginner",
    duration: "12 hours",
    lessons: 26,
    students: 1180,
    rating: 4.8,
    image: "/images/reactc.png",
    price: 35.0,
    oldPrice: 49.0,
    description:
      "Master the essentials of layout, typography, color, and user-friendly design.",
    about:
      "Learn modern design principles, create polished mockups, and craft responsive experiences.",
    learnPoints: [
      "Design responsive layouts",
      "Apply visual hierarchy effectively",
      "Create accessible interfaces",
    ],
    skills: ["Figma", "UI Design", "Accessibility", "Color Theory"],
    instructor: {
      name: "Lisa Morgan",
      title: "Product Designer",
      rating: 4.8,
      students: "12,600",
      courses: 6,
    },
    faq: [
      {
        question: "Do I need design software?",
        answer:
          "We'll guide you through using free tools like Figma; no paid software is required.",
      },
    ],
  },
  {
    id: "6",
    title: "Database Design & SQL",
    category: "Data",
    level: "Intermediate",
    duration: "9 hours",
    lessons: 20,
    students: 1340,
    rating: 4.7,
    image: "/images/js.png",
    price: 33.0,
    oldPrice: 47.0,
    description:
      "Learn to structure databases, write SQL, and manage data efficiently.",
    about:
      "Design relational databases, write optimized queries, and maintain data integrity in production systems.",
    learnPoints: [
      "Design normalized database schemas",
      "Write advanced SQL queries",
      "Implement indexing strategies",
    ],
    skills: ["SQL", "PostgreSQL", "Database Design", "Normalization"],
    instructor: {
      name: "Anthony Walker",
      title: "Database Architect",
      rating: 4.7,
      students: "24,500",
      courses: 11,
    },
    faq: [
      {
        question: "Is NoSQL covered?",
        answer:
          "We cover relational databases in depth and provide comparisons with NoSQL systems.",
      },
    ],
  },
];

