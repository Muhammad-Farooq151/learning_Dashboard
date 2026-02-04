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
import { greenColor, redColor, bggreen, bgred } from "@/utils/Colors";
import { getJSON, deleteJSON } from "@/utils/http";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const formatStatus = (status) => {
  const s = String(status || "active").toLowerCase();
  if (s === "blocked") return "Blocked";
  if (s === "inactive") return "Inactive";
  return "Active";
};

const formatDate = (date) => {
  if (!date) return "N/A";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
};

function AdminsManagement() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchAdmins = async () => {
      try {
        setLoading(true);
        const response = await getJSON("admins");

        if (!isMounted) return;

        if (response && response.success && Array.isArray(response.data)) {
          setAdmins(response.data);
        } else {
          setAdmins([]);
        }
      } catch (error) {
        console.error("Error fetching admins:", error);
        if (isMounted) setAdmins([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAdmins();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDeleteClick = async (admin) => {
    const result = await Swal.fire({
      title: 'Delete Admin?',
      text: `Are you sure you want to delete "${admin.fullName}"? This action cannot be undone.`,
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
          text: 'Please wait while we delete the admin',
          allowOutsideClick: false,
          didOpen: () => { Swal.showLoading(); },
        });
        
        await deleteJSON(`admins/${admin._id || admin.id}`);
        
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Admin deleted successfully',
          timer: 2000,
          showConfirmButton: false,
        });
        
        setAdmins(admins.filter(a => (a._id || a.id) !== (admin._id || admin.id)));
      } catch (error) {
        console.error('Error deleting admin:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to delete admin. Please try again.',
        });
      }
    }
  };

  const handleEditClick = (admin) => {
    const adminId = admin._id || admin.id;
    router.push(`/admin/admins/edit/${adminId}`);
  };

  const filteredAdmins = admins.filter((admin) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      admin.fullName?.toLowerCase().includes(searchLower) ||
      admin.email?.toLowerCase().includes(searchLower) ||
      admin.phoneNumber?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Typography variant="h4" fontWeight={700}>
            Admins Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => router.push("/admin/admins/new")}
            sx={{
              backgroundColor: greenColor,
              textTransform: "none",
              "&:hover": {
                backgroundColor: greenColor,
                opacity: 0.9,
              },
            }}
          >
            Add New Admin
          </Button>
        </Stack>

        {/* Search */}
        <Card>
          <CardContent>
            <TextField
              fullWidth
              placeholder="Search admins by name, email, or phone..."
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
            ) : filteredAdmins.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  {searchQuery ? "No admins found matching your search" : "No admins available"}
                </Typography>
              </Box>
            ) : (
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone Number</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created At</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAdmins.map((admin) => (
                      <TableRow key={admin._id || admin.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {admin.fullName || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {admin.email || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {admin.phoneNumber || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={admin.role || "Admin"}
                            size="small"
                            sx={{
                              bgcolor: "#E3F2FD",
                              color: "#1976D2",
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={formatStatus(admin.status)}
                            size="small"
                            sx={{
                              bgcolor: admin.status === 'active' ? bggreen : bgred,
                              color: admin.status === 'active' ? greenColor : redColor,
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(admin.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <IconButton
                              size="small"
                              onClick={() => handleEditClick(admin)}
                              sx={{ color: greenColor }}
                            >
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(admin)}
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

export default AdminsManagement;
