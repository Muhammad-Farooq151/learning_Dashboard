"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  Select,
  Stack,
  Tooltip,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { bggreen, bgred, greenColor } from "@/utils/Colors";
import Image from "next/image";

const coursesData = [
  {
    id: "CS001",
    title: "React Fundamentals",
    instructor: "Mike Chen",
    enrolled: 0,
    status: "Published",
    lastUpdated: "Thu Jan 23 2025",
  },
  {
    id: "CS001",
    title: "Advanced JavaScript",
    instructor: "Manuel O'Keefe",
    enrolled: 2468,
    status: "Save in Draft",
    lastUpdated: "Mon Feb 03 2025",
  },
  {
    id: "CS001",
    title: "UI/UX Design Principles",
    instructor: "Alyssa Wolff",
    enrolled: 123,
    status: "Save in Draft",
    lastUpdated: "Tue May 20 2025",
  },
  {
    id: "CS001",
    title: "Python for Data Science",
    instructor: "Inez Howe II",
    enrolled: 198,
    status: "Published",
    lastUpdated: "Wed May 14 2025",
  },
  {
    id: "CS001",
    title: "Mobile App Development",
    instructor: "Luke Ledner",
    enrolled: 2464,
    status: "Published",
    lastUpdated: "Thu Aug 28 2025",
  },
];

const instructors = [
  "Mike Chen",
  "Manuel O'Keefe",
  "Alyssa Wolff",
  "Inez Howe II",
  "Luke Ledner",
];

function CoursesManagement() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [instructorFilter, setInstructorFilter] = useState("All Instructors");
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [instructorAnchorEl, setInstructorAnchorEl] = useState(null);

  const handleStatusClick = (event) => {
    setStatusAnchorEl(event.currentTarget);
  };

  const handleStatusClose = () => {
    setStatusAnchorEl(null);
  };

  const handleInstructorClick = (event) => {
    setInstructorAnchorEl(event.currentTarget);
  };

  const handleInstructorClose = () => {
    setInstructorAnchorEl(null);
  };

  const handleStatusSelect = (status) => {
    setStatusFilter(status);
    handleStatusClose();
  };

  const handleInstructorSelect = (instructor) => {
    setInstructorFilter(instructor);
    handleInstructorClose();
  };

  const filteredCourses = coursesData.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All Status" ||
      (statusFilter === "Draft" && course.status === "Save in Draft") ||
      (statusFilter === "Published" && course.status === "Published");
    const matchesInstructor =
      instructorFilter === "All Instructors" ||
      course.instructor === instructorFilter;
    return matchesSearch && matchesStatus && matchesInstructor;
  });

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight={700} mb={1}>
        Courses Management
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Manage all courses on your platform
      </Typography>

      <Card
        sx={{
          borderRadius: 4,
          border: "1px solid #EDF1F7",
          boxShadow: "none",
        }}
      >
        <CardContent sx={{ p: 3 }}>
        <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
          <Box>
          <Typography variant="h6" fontWeight={600} mb={1}>
            All Courses
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            View and manage your courses
          </Typography>
          </Box>
          <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => router.push("/admin/courses/new")}
                sx={{
                  backgroundColor: greenColor,
                  textTransform: "none",
                  borderRadius: 2,
                  px: 3,
                  "&:hover": {
                    backgroundColor: greenColor,
                    opacity: 0.9,
                  },
                }}
              >
                Add New Course
              </Button>
        </Box>
        

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            mb={3}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            <TextField
              placeholder="Search"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                // flex: { xs: 1, md: "0 0 300px" },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  height:"56  ",
                  bgcolor:"rgba(244, 244, 244, 1)",
                  border:"none",
                  "& fieldset": {
                    border: "none",
                  },
                  "&:hover fieldset": {
                    border: "none",
                  },
                  "&.Mui-focused fieldset": {
                    border: "none",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: "black" }} />
                  </InputAdornment>
                ),
              }}
            />

            <Stack
              direction="row"
              spacing={2}
              sx={{ width: { xs: "100%", md: "auto" }, position: "relative" }}
            >
              <Box sx={{ position: "relative" }}>
                <Button
                  variant="outlined"
                  onClick={handleStatusClick}
                  endIcon={<KeyboardArrowDownRoundedIcon />}
                  sx={{
                    border: "none",
                    height: "56px",
                    bgcolor: "rgba(244, 244, 244, 1)",
                    color: "#64748B",
                    textTransform: "none",
                    minWidth: 150,
                    borderRadius: 2,
                    "&:hover": {
                      border: "none",
                      backgroundColor: "rgba(244, 244, 244, 1)",
                    },
                  }}
                >
                  {statusFilter}
                </Button>

              <Menu
                anchorEl={statusAnchorEl}
                open={Boolean(statusAnchorEl)}
                onClose={handleStatusClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                PaperProps={{
                  sx: {
                    mt: 0.5,
                    minWidth: 150,
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                    borderRadius: 2,
                    border: "1px solid #E2E8F0",
                  },
                }}
                MenuListProps={{
                  sx: { py: 0.5 },
                }}
              >
                <MenuItem
                  onClick={() => handleStatusSelect("All Status")}
                  sx={{
                    color: "black",
                    backgroundColor:
                    
                      statusFilter === "All Status" ? "#F1F5F9" : "transparent",
                    "&:hover": { backgroundColor: "#F8FAFC" },
                  }}
                >
                  All Status
                </MenuItem>
                <MenuItem
                  onClick={() => handleStatusSelect("Draft")}
                  sx={{
                    backgroundColor:
                      statusFilter === "Draft" ? "#F1F5F9" : "transparent",
                    "&:hover": { backgroundColor: "#F8FAFC" },
                  }}
                >
                  Draft
                </MenuItem>
                <MenuItem
                  onClick={() => handleStatusSelect("Published")}
                  sx={{
                    backgroundColor:
                      statusFilter === "Published" ? "#F1F5F9" : "transparent",
                    "&:hover": { backgroundColor: "#F8FAFC" },
                  }}
                >
                  Published
                </MenuItem>
              </Menu>
              </Box>

              <Box sx={{ position: "relative" }}>
                <Button
                  variant="outlined"
                  onClick={handleInstructorClick}
                  endIcon={<KeyboardArrowDownRoundedIcon />}
                  sx={{
                    border: "none",
                    height: "56px",
                    bgcolor: "rgba(244, 244, 244, 1)",
                    color: "#64748B",
                    textTransform: "none",
                    minWidth: 150,
                    borderRadius: 2,
                    "&:hover": {
                      border: "none",
                      backgroundColor: "rgba(244, 244, 244, 1)",
                    },
                  }}
                >
                  {instructorFilter}
                </Button>

              <Menu
                anchorEl={instructorAnchorEl}
                open={Boolean(instructorAnchorEl)}
                onClose={handleInstructorClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                PaperProps={{
                  sx: {
                    mt: 0.5,
                    minWidth: 150,
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                    borderRadius: 2,
                    maxHeight: 300,
                    border: "1px solid #E2E8F0",
                  },
                }}
                MenuListProps={{
                  sx: { py: 0.5 },
                }}
              >
                <MenuItem
                  onClick={() => handleInstructorSelect("All Instructors")}
                  sx={{
                    backgroundColor:
                      instructorFilter === "All Instructors"
                        ? "#F1F5F9"
                        : "transparent",
                    "&:hover": { backgroundColor: "#F8FAFC" },
                  }}
                >
                  All Instructors
                </MenuItem>
                {instructors.map((instructor) => (
                  <MenuItem
                    key={instructor}
                    onClick={() => handleInstructorSelect(instructor)}
                    sx={{
                      backgroundColor:
                        instructorFilter === instructor
                          ? "#F1F5F9"
                          : "transparent",
                      "&:hover": { backgroundColor: "#F8FAFC" },
                    }}
                  >
                    {instructor}
                  </MenuItem>
                ))}
              </Menu>
              </Box>

           
            </Stack>
          </Stack>

          <TableContainer
            component={Paper}
            sx={{
              boxShadow: "none",
              border: "1px solid #E2E8F0",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: "#1E293B",
                    "& th": {
                      color: "#fff",
                      fontWeight: 600,
                      borderBottom: "none",
                      py: 2,
                    },
                  }}
                >
                  <TableCell>Course ID</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Instructor</TableCell>
                  <TableCell>Enrolled</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCourses.map((course, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#F8FAFC",
                      },
                      "& td": {
                        borderBottom: "1px solid #E2E8F0",
                        py: 2,
                      },
                    }}
                  >
                    <TableCell>{course.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {course.title}
                      </Typography>
                    </TableCell>
                    <TableCell>{course.instructor}</TableCell>
                    <TableCell>{course.enrolled.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={course.status}
                        size="small"
                        sx={{
                          backgroundColor:
                            course.status === "Published"
                              ? greenColor
                              : bggreen,
                          color:
                            course.status === "Published" ? "#fff" : greenColor,
                          fontWeight: 500,
                          borderRadius: 100,
                          height: 24,
                          fontSize: "0.75rem",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {course.lastUpdated}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {/* <IconButton
                          size="small"
                          sx={{
                            color: "#EF4444",
                            "&:hover": {
                              backgroundColor: "#FEE2E2",
                            },
                          }}
                        >
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton> */}
                        <Tooltip title="Delete">
                        <Box bgcolor={bgred} py={"8px"} px={"12px"} borderRadius={"6px"} 
                        sx={{cursor: "pointer"}}>
                          <Image 
                            src="/images/comp/redbin.png"
                            alt="delete"
                            width={1000}
                            height={1000}
                            style={{
                              width: "20px",
                              height: "20px",
                            }}
                          />
                        </Box>
                        </Tooltip>
                        <Tooltip title="Edit">
                     <Box bgcolor={bggreen} py={"8px"} px={"12px"} borderRadius={"6px"} 
                     sx={{cursor: "pointer"}}>
                      <Image 
                            src="/images/comp/greenedit.png"
                            alt="delete"
                            width={1000}
                            height={1000}
                            style={{
                              width: "20px",
                              height: "20px",
                            }}
                          />
                     </Box>
                     </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

export default CoursesManagement;

