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
  Paper,
  IconButton,
  Stack,
  Skeleton,
  Chip,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { greenColor } from "@/utils/Colors";
import { getJSON, deleteJSON } from "@/utils/http";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

function TutorsManagement() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const filteredTutors = tutors.filter((tutor) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      tutor.name?.toLowerCase().includes(searchLower) ||
      tutor.email?.toLowerCase().includes(searchLower) ||
      tutor.speciality?.toLowerCase().includes(searchLower) ||
      tutor.phoneNumber?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Typography variant="h4" fontWeight={700}>
            Tutors Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => router.push("/admin/tutors/new")}
            sx={{
              backgroundColor: greenColor,
              textTransform: "none",
              "&:hover": {
                backgroundColor: greenColor,
                opacity: 0.9,
              },
            }}
          >
            Add New Tutor
          </Button>
        </Stack>

        {/* Search */}
        <Card>
          <CardContent>
            <TextField
              fullWidth
              placeholder="Search tutors by name, email, speciality, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent>
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
                <Table>
                  <TableHead>
                    <TableRow>
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
                            <IconButton
                              size="small"
                              onClick={() => handleEditClick(tutor)}
                              sx={{ color: greenColor }}
                            >
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(tutor)}
                              sx={{ color: "error.main" }}
                            >
                              <DeleteRoundedIcon fontSize="small" />
                            </IconButton>
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
      </Stack>
    </Box>
  );
}

export default TutorsManagement;
