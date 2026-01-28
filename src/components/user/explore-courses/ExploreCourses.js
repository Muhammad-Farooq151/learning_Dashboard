"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Chip,
  FormControl,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Button,
  Menu,
  Skeleton,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import Link from "next/link";
import { getJSON } from "@/utils/http";
import { greenColor, bggreen } from "@/utils/Colors";

function ExploreCourses() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [instructorFilter, setInstructorFilter] = useState("All Instructors");
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [instructorAnchorEl, setInstructorAnchorEl] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [instructors, setInstructors] = useState([]);

  // Fetch courses from API
  useEffect(() => {
    let isMounted = true;
    
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await getJSON('courses').catch((err) => {
          if (isMounted) {
            if (err.response) {
              console.error('Error fetching courses:', {
                status: err.response.status,
                statusText: err.response.statusText,
                data: err.response.data,
                message: err.message
              });
            } else if (err.request) {
              console.error('Error fetching courses - No response from server:', {
                message: err.message,
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
          // Filter only published courses for user view
          const publishedCourses = response.data.filter(course => course.status === 'published');
          
          // Map API response to match the component structure
          const mappedCourses = publishedCourses.map((course) => {
            // Calculate price with discount
            const originalPrice = parseFloat(course.price) || 0;
            const discountPercentage = course.discountPercentage || 0;
            let finalPrice = originalPrice;
            let hasDiscount = false;
            
            if (discountPercentage > 0 && originalPrice > 0) {
              const discountAmount = (originalPrice * discountPercentage) / 100;
              finalPrice = originalPrice - discountAmount;
              hasDiscount = true;
            }

            return {
              id: course._id || course.id,
              title: course.title || 'Untitled Course',
              instructor: course.instructor || 'Unknown Instructor',
              category: course.category || 'Uncategorized',
              description: course.description || '',
              thumbnailUrl: course.thumbnailUrl || '/images/default-course.jpg',
              enrolled: course.enrolled || 0,
              price: finalPrice, // Final price after discount
              originalPrice: hasDiscount ? originalPrice : null, // Original price if discount exists
              discountPercentage: discountPercentage,
              status: course.status || 'draft',
              lessons: course.lessons?.length || 0,
            };
          });
          
          setCourses(mappedCourses);
          
          // Extract unique instructors
          const uniqueInstructors = [...new Set(mappedCourses.map(c => c.instructor).filter(Boolean))];
          setInstructors(uniqueInstructors);
        } else {
          setCourses([]);
          setInstructors([]);
        }
      } catch (error) {
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

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.instructor.toLowerCase().includes(search.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus =
        statusFilter === "All Status" ||
        (statusFilter === "Published" && course.status === "published");
      const matchesInstructor =
        instructorFilter === "All Instructors" ||
        course.instructor === instructorFilter;

      return matchesSearch && matchesStatus && matchesInstructor;
    });
  }, [search, statusFilter, instructorFilter, courses]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "1200px", mx: "auto" }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Courses
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={1}>
            Explore curated courses tailored to your interests and skill level.
          </Typography>
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                height: "56px",
                bgcolor: "rgba(244, 244, 244, 1)",
                border: "none",
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
                    backgroundColor:
                      statusFilter === "All Status" ? "#F1F5F9" : "transparent",
                    "&:hover": { backgroundColor: "#F8FAFC" },
                  }}
                >
                  All Status
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

        <Grid container spacing={3}>
          {loading ? (
            // Skeleton loading cards
            Array.from({ length: 6 }).map((_, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Box
                  sx={{
                    bgcolor: "#ffffff",
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow:
                      "0px 12px 30px rgba(15, 23, 42, 0.08), 0px 0px 1px rgba(15, 23, 42, 0.08)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Skeleton variant="rectangular" width="100%" height={200} />
                  <Box sx={{ p: 3, display: "flex", flexDirection: "column", flex: 1 }}>
                    <Stack direction="row" spacing={1} mb={1}>
                      <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
                      <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 1 }} />
                    </Stack>
                    <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="90%" height={20} sx={{ mb: 3 }} />
                    <Stack direction="row" spacing={2} justifyContent="space-between">
                      <Skeleton variant="text" width={60} height={20} />
                      <Skeleton variant="text" width={60} height={20} />
                    </Stack>
                  </Box>
                </Box>
              </Grid>
            ))
          ) : filteredCourses.length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  borderRadius: 3,
                  border: "1px dashed",
                  borderColor: "divider",
                  p: 6,
                  textAlign: "center",
                  color: "text.secondary",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {courses.length === 0 ? "No courses available" : "No courses found"}
                </Typography>
                <Typography variant="body2">
                  {courses.length === 0 
                    ? "There are no published courses available at the moment." 
                    : "Try adjusting your search or filter criteria."}
                </Typography>
              </Box>
            </Grid>
          ) : (
            filteredCourses.map((course) => (
              <Grid key={course.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Box
                  component={Link}
                  href={`/user/explore-courses/${course.id}`}
                  sx={{ textDecoration: "none" }}
                >
                  <Box
                    sx={{
                      bgcolor: "#ffffff",
                      borderRadius: 3,
                      overflow: "hidden",
                      boxShadow:
                        "0px 12px 30px rgba(15, 23, 42, 0.08), 0px 0px 1px rgba(15, 23, 42, 0.08)",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow:
                          "0px 16px 40px rgba(15, 23, 42, 0.12), 0px 0px 1px rgba(15, 23, 42, 0.16)",
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={course.thumbnailUrl || '/images/default-course.jpg'}
                      alt={course.title}
                      sx={{
                        width: "100%",
                        height: 200,
                        objectFit: "cover",
                      }}
                    />

                    <Box sx={{ p: 3, display: "flex", flexDirection: "column", flex: 1 }}>
                      <Stack direction="row" spacing={1} mb={1}>
                        <Chip
                          label={course.status === 'published' ? 'Published' : 'Draft'}
                          size="small"
                          sx={{ 
                            fontWeight: 600, 
                            textTransform: "uppercase",
                            backgroundColor: course.status === 'published' ? greenColor : bggreen,
                            color: course.status === 'published' ? '#fff' : greenColor,
                          }}
                        />
                        <Chip 
                          label={course.category} 
                          size="small" 
                          variant="outlined" 
                        />
                      </Stack>

                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {course.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                      >
                        {course.description?.substring(0, 100) || 'No description available'}...
                      </Typography>

                      <Grid container spacing={2} justifyContent="space-between">
                        <Grid size={{ xs: 12, md: 4 }} display="flex" alignItems="center" gap={1}>
                          <PeopleAltRoundedIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {course.enrolled?.toLocaleString() || 0}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }} display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
                          {course.originalPrice ? (
                            <>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ 
                                  textDecoration: "line-through",
                                  textDecorationColor: "#64748B",
                                }}
                              >
                                ${course.originalPrice.toFixed(2)}
                              </Typography>
                              <Typography variant="body2" color="success.main" fontWeight={600}>
                                ${course.price.toFixed(2)}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="body2" color="text.primary" fontWeight={600}>
                              ${course.price.toFixed(2)}
                            </Typography>
                          )}
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }} display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" color="text.secondary">
                            {course.lessons || 0} lessons
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))
          )}
        </Grid>
      </Stack>
    </Box>
  );
}

export default ExploreCourses;