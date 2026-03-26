"use client";

import React, { useState, useEffect } from "react";
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
  Skeleton,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { bggreen, bgred, greenColor, tableHeaderBg, tableHeaderText } from "@/utils/Colors";
import Image from "next/image";
import { getJSON, deleteJSON } from "@/utils/http";
import Swal from "sweetalert2";

function CoursesManagement() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [instructorFilter, setInstructorFilter] = useState("All Instructors");
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [instructorAnchorEl, setInstructorAnchorEl] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [instructors, setInstructors] = useState([]);

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

  const handleDeleteClick = async (course) => {
    // Extract the actual course ID - it might be stored as _id in the original data
    const courseId = course.originalId || course.id.replace(/^CS/, '');
    
    // Show SweetAlert2 confirmation dialog
    const result = await Swal.fire({
      title: 'Delete Course?',
      text: `Are you sure you want to delete "${course.title}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    // If user confirmed deletion
    if (result.isConfirmed) {
      try {
        // Show loading state
        Swal.fire({
          title: 'Deleting...',
          text: 'Please wait while we delete the course',
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await deleteJSON(`courses/${courseId}`);
        
        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Course has been deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
        });

        // Remove course from state
        setCourses(courses.filter(c => c.id !== course.id));
      } catch (error) {
        console.error('Error deleting course:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to delete course. Please try again.',
          confirmButtonText: 'OK',
        });
      }
    }
  };

  const handleEditClick = (course) => {
    // Use the original ID for navigation
    const courseId = course.originalId || course.id.replace(/^CS/, '');
    router.push(`/admin/courses/edit/${courseId}`);
  };

  // Fetch courses from API
  useEffect(() => {
    let isMounted = true;
    
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await getJSON('courses').catch((err) => {
          // Catch and handle the error here to prevent unhandled promise rejection
          if (isMounted) {
            // Log more detailed error information
            if (err.response) {
              console.error('Error fetching courses - Server responded with error:', {
                status: err.response.status,
                statusText: err.response.statusText,
                data: err.response.data,
                message: err.message
              });
            } else if (err.request) {
              console.error('Error fetching courses - No response from server:', {
                message: err.message,
                url: err.request.responseURL || 'http://localhost:5000/api/courses',
                baseURL: 'http://localhost:5000/api'
              });
            } else {
              console.error('Error fetching courses:', err.message || err);
            }
            setCourses([]);
            setInstructors([]);
            setLoading(false);
          }
          return null;
        });

        if (!isMounted) return;

        if (response && response.success && response.data && Array.isArray(response.data)) {
          // Map API response to match the component structure
          const mappedCourses = response.data.map((course) => ({
            id: course._id || course.id || `CS${String(course._id || '').slice(-4)}`,
            originalId: course._id || course.id, // Store original ID for API calls
            title: course.title || 'Untitled Course',
            instructor: course.instructor || 'Unknown Instructor',
            enrolled: course.enrolled || 0,
            status: course.status === 'published' ? 'Published' : course.status === 'draft' ? 'Save in Draft' : course.status || 'Draft',
            lastUpdated: course.updatedAt 
              ? new Date(course.updatedAt).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })
              : course.createdAt 
                ? new Date(course.createdAt).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })
                : 'N/A',
          }));
          setCourses(mappedCourses);
          
          // Extract unique instructors
          const uniqueInstructors = [...new Set(mappedCourses.map(c => c.instructor).filter(Boolean))];
          setInstructors(uniqueInstructors);
        } else {
          setCourses([]);
          setInstructors([]);
        }
      } catch (error) {
        // Silently handle errors - show empty state
        if (isMounted) {
          console.error('Error fetching courses:', error.message || error);
          setCourses([]);
          setInstructors([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCourses();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCourses = courses.filter((course) => {
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
              overflowX: "auto",
              overflowY: "hidden",
              maxWidth: { xs: "100%", md: "100%" },
            }}
          >
            <Table sx={{ minWidth: { xs: 800, md: "auto" } }}>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: tableHeaderBg,
                    "& th": {
                      color: tableHeaderText,
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
                {loading ? (
                  // Skeleton loading rows
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        "& td": {
                          borderBottom: "1px solid #E2E8F0",
                          py: 2,
                        },
                      }}
                    >
                      <TableCell>
                        <Skeleton variant="text" width={80} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={200} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={150} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={80} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 100 }} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={120} />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Skeleton variant="rectangular" width={44} height={36} sx={{ borderRadius: 1 }} />
                          <Skeleton variant="rectangular" width={44} height={36} sx={{ borderRadius: 1 }} />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" color="text.secondary">
                        {courses.length === 0 
                          ? "No courses added yet" 
                          : "No courses match your filters"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map((course, index) => (
                    <TableRow
                      key={course.id || index}
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
                          <Tooltip title="Delete">
                            <Box 
                              bgcolor={bgred} 
                              py={"8px"} 
                              px={"12px"} 
                              borderRadius={"6px"} 
                              sx={{cursor: "pointer"}}
                              onClick={() => handleDeleteClick(course)}
                            >
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
                            <Box 
                              bgcolor={bggreen} 
                              py={"8px"} 
                              px={"12px"} 
                              borderRadius={"6px"} 
                              sx={{cursor: "pointer"}}
                              onClick={() => handleEditClick(course)}
                            >
                              <Image 
                                src="/images/comp/greenedit.png"
                                alt="edit"
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
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

export default CoursesManagement;

