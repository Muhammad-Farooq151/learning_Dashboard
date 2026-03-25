"use client";

import React, { useEffect, useState } from "react";
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
  IconButton,
  Stack,
  Skeleton,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { bggreen, bgred, borderColor, greenColor } from "@/utils/Colors";
import { getJSON, deleteJSON } from "@/utils/http";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Image from "next/image";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
  Divider,
} from "@mui/material";

function TutorsManagement() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [specialityFilter, setSpecialityFilter] = useState("All Specialities");
  const [courseFilter, setCourseFilter] = useState("All Tutors");
  const [specialityAnchorEl, setSpecialityAnchorEl] = useState(null);
  const [courseAnchorEl, setCourseAnchorEl] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTutors = async () => {
      try {
        setLoading(true);
        const response = await getJSON("tutors");

        if (!isMounted) return;

        if (response && response.success && Array.isArray(response.data)) {
          setTutors(response.data);
        } else {
          setTutors([]);
        }
      } catch (error) {
        console.error("Error fetching tutors:", error);
        if (isMounted) setTutors([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTutors();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDeleteClick = async (tutor) => {
    const result = await Swal.fire({
      title: 'Delete Tutor?',
      text: `Are you sure you want to delete "${tutor.name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: 'Deleting...',
          text: 'Please wait while we delete the tutor',
          allowOutsideClick: false,
          didOpen: () => { Swal.showLoading(); },
        });
        
        await deleteJSON(`tutors/${tutor._id || tutor.id}`);
        
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Tutor deleted successfully',
          timer: 2000,
          showConfirmButton: false,
        });
        
        setTutors(tutors.filter(t => (t._id || t.id) !== (tutor._id || tutor.id)));
      } catch (error) {
        console.error('Error deleting tutor:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to delete tutor. Please try again.',
        });
      }
    }
  };

  const handleEditClick = (tutor) => {
    const tutorId = tutor._id || tutor.id;
    router.push(`/admin/tutors/edit/${tutorId}`);
  };

  const handleViewClick = (tutor) => {
    setSelectedTutor(tutor);
    setViewOpen(true);
  };

  const handleViewClose = () => {
    setViewOpen(false);
    setSelectedTutor(null);
  };

  const handleSpecialityClick = (event) => {
    setSpecialityAnchorEl(event.currentTarget);
  };

  const handleSpecialityClose = () => {
    setSpecialityAnchorEl(null);
  };

  const handleSpecialitySelect = (value) => {
    setSpecialityFilter(value);
    handleSpecialityClose();
  };

  const handleCourseClick = (event) => {
    setCourseAnchorEl(event.currentTarget);
  };

  const handleCourseClose = () => {
    setCourseAnchorEl(null);
  };

  const handleCourseSelect = (value) => {
    setCourseFilter(value);
    handleCourseClose();
  };

  const specialityOptions = [
    "All Specialities",
    ...Array.from(
      new Set(
        tutors
          .map((tutor) => tutor.speciality?.trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b)),
  ];

  const filteredTutors = tutors.filter((tutor) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (
      tutor.name?.toLowerCase().includes(searchLower) ||
      tutor.email?.toLowerCase().includes(searchLower) ||
      tutor.speciality?.toLowerCase().includes(searchLower) ||
      tutor.phoneNumber?.toLowerCase().includes(searchLower)
    );

    const matchesSpeciality =
      specialityFilter === "All Specialities" ||
      tutor.speciality === specialityFilter;

    const courseCount = Array.isArray(tutor.courses) ? tutor.courses.length : 0;
    const matchesCourseFilter =
      courseFilter === "All Tutors" ||
      (courseFilter === "Assigned Courses" && courseCount > 0) ||
      (courseFilter === "No Courses" && courseCount === 0);

    return matchesSearch && matchesSpeciality && matchesCourseFilter;
  });

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          flexWrap="wrap"
          gap={2}
        >
          <Typography variant="h4" fontWeight={600}>
            Tutors Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => router.push("/admin/tutors/new")}
            sx={{
              backgroundColor: greenColor,
              textTransform: "none",
              width: { xs: "100%", sm: "auto" },
              alignSelf: { xs: "stretch", sm: "auto" },
              "&:hover": {
                backgroundColor: greenColor,
                opacity: 0.9,
              },
            }}
          >
            Add New Tutor
          </Button>
        </Stack>
        <Box sx={{ border: `1px solid ${borderColor}`, borderRadius: 2 }}>

        {/* Search */}
        <Card
          sx={{
            // borderRadius: 4,
            // border: `1px solid ${borderColor}`,
            boxShadow: "none",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <TextField
                fullWidth
                placeholder="Search tutors by name, email, speciality, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: "black" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: "100%",
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
              />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ width: { xs: "100%", md: "auto" } }}
              >
              <Box sx={{ position: "relative", width: { xs: "100%", sm: "50%", md: "auto" } }}>
                <Button
                  variant="outlined"
                  onClick={handleSpecialityClick}
                  endIcon={<KeyboardArrowDownRoundedIcon />}
                  sx={{
                    border: "none",
                    height: "56px",
                    bgcolor: "rgba(244, 244, 244, 1)",
                    color: "#64748B",
                    textTransform: "none",
                    minWidth: { xs: "100%", md: 180 },
                    width: "100%",
                    borderRadius: 2,
                    justifyContent: "space-between",
                    "&:hover": {
                      border: "none",
                      backgroundColor: "rgba(244, 244, 244, 1)",
                    },
                  }}
                >
                  {specialityFilter}
                </Button>

                <Menu
                  anchorEl={specialityAnchorEl}
                  open={Boolean(specialityAnchorEl)}
                  onClose={handleSpecialityClose}
                  disableScrollLock
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
                      minWidth: { xs: 220, md: 180 },
                      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                      borderRadius: 2,
                      border: "1px solid #E2E8F0",
                    },
                  }}
                  MenuListProps={{
                    sx: { py: 0.5 },
                  }}
                >
                  {specialityOptions.map((option) => (
                    <MenuItem
                      key={option}
                      onClick={() => handleSpecialitySelect(option)}
                      sx={{
                        backgroundColor:
                          specialityFilter === option ? "#F1F5F9" : "transparent",
                        "&:hover": { backgroundColor: "#F8FAFC" },
                      }}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>

              <Box sx={{ position: "relative", width: { xs: "100%", sm: "50%", md: "auto" } }}>
                <Button
                  variant="outlined"
                  onClick={handleCourseClick}
                  endIcon={<KeyboardArrowDownRoundedIcon />}
                  sx={{
                    border: "none",
                    height: "56px",
                    bgcolor: "rgba(244, 244, 244, 1)",
                    color: "#64748B",
                    textTransform: "none",
                    minWidth: { xs: "100%", md: 170 },
                    width: "100%",
                    borderRadius: 2,
                    justifyContent: "space-between",
                    "&:hover": {
                      border: "none",
                      backgroundColor: "rgba(244, 244, 244, 1)",
                    },
                  }}
                >
                  {courseFilter}
                </Button>

                <Menu
                  anchorEl={courseAnchorEl}
                  open={Boolean(courseAnchorEl)}
                  onClose={handleCourseClose}
                  disableScrollLock
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
                      minWidth: { xs: 220, md: 170 },
                      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                      borderRadius: 2,
                      border: "1px solid #E2E8F0",
                    },
                  }}
                  MenuListProps={{
                    sx: { py: 0.5 },
                  }}
                >
                  {["All Tutors", "Assigned Courses", "No Courses"].map((option) => (
                    <MenuItem
                      key={option}
                      onClick={() => handleCourseSelect(option)}
                      sx={{
                        backgroundColor:
                          courseFilter === option ? "#F1F5F9" : "transparent",
                        "&:hover": { backgroundColor: "#F8FAFC" },
                      }}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Table */}
        <Card
          sx={{
            // borderRadius: 4,
            // border: `1px solid ${borderColor}`,
            boxShadow: "none",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            {loading ? (
              <Stack spacing={2}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} variant="rectangular" height={60} />
                ))}
              </Stack>
            ) : filteredTutors.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  {searchQuery ? "No tutors found matching your search" : "No tutors available"}
                </Typography>
              </Box>
            ) : (
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table sx={{ minWidth: { xs: 760, md: "auto" } }}>
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
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Speciality</TableCell>
                      <TableCell>Phone Number</TableCell>
                      <TableCell>Courses</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTutors.map((tutor) => (
                      <TableRow key={tutor._id || tutor.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {tutor.name || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {tutor.email || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={tutor.speciality || "N/A"}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {tutor.phoneNumber || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                            {tutor.courses && tutor.courses.length > 0 ? (
                              tutor.courses.slice(0, 2).map((course, idx) => {
                                const courseTitle = typeof course === 'object' ? course.title : course;
                                return (
                                  <Chip
                                    key={idx}
                                    label={courseTitle || "Course"}
                                    size="small"
                                    sx={{ fontSize: "0.7rem", height: 20 }}
                                  />
                                );
                              })
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No courses
                              </Typography>
                            )}
                            {tutor.courses && tutor.courses.length > 2 && (
                              <Chip
                                label={`+${tutor.courses.length - 2} more`}
                                size="small"
                                sx={{ fontSize: "0.7rem", height: 20 }}
                              />
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="View">
                              <IconButton
                                size="small"
                                onClick={() => handleViewClick(tutor)}
                                sx={{
                                  bgcolor: "#EFF6FF",
                                  color: "#2563EB",
                                  borderRadius: 1.5,
                                  "&:hover": {
                                    bgcolor: "#DBEAFE",
                                  },
                                }}
                              >
                                <VisibilityRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <Box
                                onClick={() => handleEditClick(tutor)}
                                sx={{
                                  bgcolor: bggreen,
                                  py: "8px",
                                  px: "12px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  "&:hover": {
                                    bgcolor: "#D8F8EC",
                                  },
                                }}
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
                            <Tooltip title="Delete">
                              <Box
                                onClick={() => handleDeleteClick(tutor)}
                                sx={{
                                  bgcolor: bgred,
                                  py: "8px",
                                  px: "12px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  "&:hover": {
                                    bgcolor: "#FFE4E8",
                                  },
                                }}
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
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
        </Box>
      </Stack>

      <Dialog open={viewOpen} onClose={handleViewClose} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Tutor Details</DialogTitle>
        <DialogContent dividers>
          {selectedTutor && (
            <Stack spacing={2.25}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {selectedTutor.name || "N/A"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{selectedTutor.email || "N/A"}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Speciality
                </Typography>
                <Typography variant="body1">{selectedTutor.speciality || "N/A"}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Phone Number
                </Typography>
                <Typography variant="body1">{selectedTutor.phoneNumber || "N/A"}</Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Assigned Courses
                </Typography>
                {selectedTutor.courses && selectedTutor.courses.length > 0 ? (
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mt={1}>
                    {selectedTutor.courses.map((course, index) => {
                      const courseTitle = typeof course === "object" ? course.title : course;
                      return (
                        <Chip
                          key={`${courseTitle}-${index}`}
                          label={courseTitle || "Course"}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      );
                    })}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    No courses assigned yet.
                  </Typography>
                )}
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <MuiButton onClick={handleViewClose} sx={{ textTransform: "none" }}>
            Close
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TutorsManagement;
