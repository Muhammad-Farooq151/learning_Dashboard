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
  Stack,
  Skeleton,
  Chip,
  Tooltip,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { greenColor, redColor, bggreen, bgred, borderColor, tableHeaderBg, tableHeaderText } from "@/utils/Colors";
import { getJSON, deleteJSON } from "@/utils/http";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Image from "next/image";

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
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          flexWrap="wrap"
          gap={2}
        >
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
              width: { xs: "100%", sm: "auto" },
              alignSelf: { xs: "stretch", sm: "auto" },
              "&:hover": {
                backgroundColor: greenColor,
                opacity: 0.9,
              },
            }}
          >
            Add New Admin
          </Button>
        </Stack>
        <Box sx={{ border: `1px solid ${borderColor}`, borderRadius: 2 }}>

        {/* Search */}
        <Card
          sx={{
            boxShadow: "none",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <TextField
              fullWidth
              placeholder="Search admins by name, email, or phone..."
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
          </CardContent>
        </Card>

        {/* Table */}
        <Card
          sx={{
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
                      <TableRow
                        key={admin._id || admin.id}
                        hover
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
                            <Tooltip title="Edit">
                              <Box
                                onClick={() => handleEditClick(admin)}
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
                                onClick={() => handleDeleteClick(admin)}
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
    </Box>
  );
}

export default AdminsManagement;
