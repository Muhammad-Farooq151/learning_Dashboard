"use client";

import React, { useState } from "react";
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
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  Select,
  Divider,
  Grid,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { bggreen, bgred, greenColor, redColor } from "@/utils/Colors";
import Image from "next/image";

const usersData = [
  {
    name: "Cindy Metz V",
    email: "Ebony_Brekke91@yahoo.com",
    courses: 8,
    status: "Blocked",
    joiningDate: "Feb 03 2025",
    memberSince: "2023-11-15",
    enrolledCourses: [
      { name: "React Fundamentals", progress: 75, enrolledDate: "Jan 10, 2024" },
      { name: "UI/UX Design Principles", progress: 45, enrolledDate: "Dec 15, 2023" },
      { name: "Python for Data Science", progress: 90, enrolledDate: "Nov 20, 2023" },
    ],
  },
  {
    name: "Jose Reynolds",
    email: "Schuyler_Feil34@hotmail.com",
    courses: 3,
    status: "Active",
    joiningDate: "Jan 23 2025",
    memberSince: "2023-11-15",
    enrolledCourses: [
      { name: "React Fundamentals", progress: 75, enrolledDate: "Jan 10, 2024" },
      { name: "UI/UX Design Principles", progress: 45, enrolledDate: "Dec 15, 2023" },
    ],
  },
  {
    name: "Katherine Robel PhD",
    email: "Einar_Bosco35@gmail.com",
    courses: 6,
    status: "Active",
    joiningDate: "May 14 2025",
    memberSince: "2023-11-15",
    enrolledCourses: [
      { name: "React Fundamentals", progress: 75, enrolledDate: "Jan 10, 2024" },
      { name: "UI/UX Design Principles", progress: 45, enrolledDate: "Dec 15, 2023" },
      { name: "Python for Data Science", progress: 90, enrolledDate: "Nov 20, 2023" },
    ],
  },
  {
    name: "Edward Prohaska",
    email: "Elise_Veum75@gmail.com",
    courses: 1,
    status: "Blocked",
    joiningDate: "May 20 2025",
    memberSince: "2023-11-15",
    enrolledCourses: [
      { name: "React Fundamentals", progress: 75, enrolledDate: "Jan 10, 2024" },
    ],
  },
  {
    name: "Christina Kihn",
    email: "Marilyne95@gmail.com",
    courses: 7,
    status: "Active",
    joiningDate: "Aug 28 2025",
    memberSince: "2023-11-15",
    enrolledCourses: [
      { name: "React Fundamentals", progress: 75, enrolledDate: "Jan 10, 2024" },
      { name: "UI/UX Design Principles", progress: 45, enrolledDate: "Dec 15, 2023" },
      { name: "Python for Data Science", progress: 90, enrolledDate: "Nov 20, 2023" },
    ],
  },
];

const deleteReasons = [
  "User Request",
  "Spam Account",
  "Inactive Account",
  "Other",
];

function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [users, setUsers] = useState(usersData);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [reasonAnchorEl, setReasonAnchorEl] = useState(null);

  const handleStatusClick = (event) => {
    setStatusAnchorEl(event.currentTarget);
  };

  const handleStatusClose = () => {
    setStatusAnchorEl(null);
  };

  const handleStatusSelect = (status) => {
    setStatusFilter(status);
    handleStatusClose();
  };

  const handleDetailsClick = (user) => {
    setSelectedUser(user);
    setDetailsDialogOpen(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteFromDetails = () => {
    setDetailsDialogOpen(false);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedUser) {
      setUsers(users.filter((u) => u.email !== selectedUser.email));
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      setDeleteReason("");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteReason("");
    setSelectedUser(null);
  };

  const handleReasonClick = (event) => {
    setReasonAnchorEl(event.currentTarget);
  };

  const handleReasonClose = () => {
    setReasonAnchorEl(null);
  };

  const handleReasonSelect = (reason) => {
    setDeleteReason(reason);
    handleReasonClose();
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All Status" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight={700} mb={1}>
        Users Management
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Manage learners and instructors on your platform
      </Typography>

      <Card
        sx={{
          borderRadius: 4,
          border: "1px solid #EDF1F7",
          boxShadow: "none",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={1}>
            All Learners
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Manage learner accounts and enrollment
          </Typography>

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
                  onClick={() => handleStatusSelect("Active")}
                  sx={{
                    backgroundColor:
                      statusFilter === "Active" ? "#F1F5F9" : "transparent",
                    "&:hover": { backgroundColor: "#F8FAFC" },
                  }}
                >
                  Active
                </MenuItem>
                <MenuItem
                  onClick={() => handleStatusSelect("Blocked")}
                  sx={{
                    backgroundColor:
                      statusFilter === "Blocked" ? "#F1F5F9" : "transparent",
                    "&:hover": { backgroundColor: "#F8FAFC" },
                  }}
                >
                  Blocked
                </MenuItem>
              </Menu>
            </Box>
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
                  <TableCell>Name</TableCell>
                  <TableCell>Email Address</TableCell>
                  <TableCell>Courses</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joining Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user, index) => (
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
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {user.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.courses}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        size="small"
                        sx={{
                          backgroundColor:
                            user.status === "Active" ? greenColor : bggreen,
                          color: user.status === "Active" ? "#fff" : greenColor,
                          fontWeight: 500,
                          borderRadius: 112,
                          height: 24,
                          fontSize: "0.75rem",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.joiningDate}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                      <Box 
                        bgcolor={bgred} 
                        py={"8px"} 
                        px={"12px"} 
                        borderRadius={"6px"} 
                        sx={{cursor: "pointer"}}
                        onClick={() => handleDeleteClick(user)}
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
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleDetailsClick(user)}
                          sx={{
                            backgroundColor: greenColor,
                            textTransform: "none",
                            borderRadius: "6px",
                            px: 2,py:1,
                            "&:hover": {
                              backgroundColor: greenColor,
                              opacity: 0.9,
                            },
                          }}
                        >
                          Details
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Learner Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Learner Details
          </Typography>
          <IconButton
            onClick={() => setDetailsDialogOpen(false)}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3, color: "text.primary" }}>
            Your course is now live and visible to learners. You can track
            enrollments, manage lessons, and update content anytime from the
            Courses tab.
          </DialogContentText>

          <Divider sx={{ mb: 3 }} />

          <Typography variant="subtitle2" fontWeight={600} mb={2}>
            Personal Information
          </Typography>
          <Grid container spacing={2} mb={4}>
            <Grid size={{xs:12}}>
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                Full Name
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedUser?.name}
              </Typography>
            </Grid>
            <Grid size={{xs:12}}>
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                Email
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedUser?.email}
              </Typography>
            </Grid>
              <Grid size={{xs:12}}>
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                Member Since
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedUser?.memberSince}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3 }} />

          <Typography variant="subtitle2" fontWeight={600} mb={2}>
            Enrolled Courses
          </Typography>
          <Stack spacing={2.5}>
            {selectedUser?.enrolledCourses?.map((course, index) => (
              <Box key={index}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="body1" fontWeight={500}>
                    {course.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {course.progress}%
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Enrolled: {course.enrolledDate}
                </Typography>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Box
          width={"100%"}
            onClick={() => {
              setDetailsDialogOpen(false);
            }}
            variant="outlined"
            sx={{
              py:"14px",
              px:"28px",
              textAlign:"center",
              fontWeight:600,
              fontSize:"18px",
              borderRadius: "10px",
              border: "1px solid rgba(217, 217, 217, 1)",
              color:"#000",
              textTransform: "none",
              borderColor: "#000",
              color: "#000",
              "&:hover": {
                borderColor: "#000",
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            Block Account
          </Box>
          <Box
          width={"100%"}
        
            onClick={handleDeleteFromDetails}
            sx={{
              py:"14px",
              px:"28px",
              textAlign:"center",
              color:"white",
              fontWeight:600,
              fontSize:"18px",
              borderRadius: "10px",
              border: "1px solid rgba(217, 217, 217, 1)",
              // color:"#000",
              textTransform: "none",
              // color:"black",
              backgroundColor: redColor,
              "&:hover": {
                backgroundColor: redColor,
                // opacity: 0.9,
              },
            }}
          >
            Delete Account
          </Box>
        </DialogActions>
      </Dialog>

      {/* Confirm Account Deletion Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 2,
          }}
        >
          <Typography fontSize={"20px"} fontWeight={600}>
            Confirm Account Deletion
          </Typography>
          <IconButton
            onClick={handleDeleteCancel}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3, color: "text.primary" }}>
            Are you sure you want to delete {selectedUser?.name}&apos;s account?
            This action cannot be undone.
          </DialogContentText>

          <Box sx={{ position: "relative", mb: 3 }}>
            <Typography variant="body2" fontWeight={500} mb={1}>
              Reason for deletion
            </Typography>
            <TextField
              placeholder="eg: john_doe@gmail.com"
              fullWidth
              value={deleteReason}
              onClick={handleReasonClick}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "& fieldset": {
                    borderColor: "#E2E8F0",
                  },
                  "&:hover fieldset": {
                    borderColor: "#E2E8F0",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#E2E8F0",
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <KeyboardArrowDownRoundedIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Menu
              anchorEl={reasonAnchorEl}
              open={Boolean(reasonAnchorEl)}
              onClose={handleReasonClose}
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
                  minWidth: 200,
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  borderRadius: 2,
                  border: "1px solid #E2E8F0",
                  bgcolor: "#1E293B",
                },
              }}
              MenuListProps={{
                sx: { py: 0.5 },
              }}
            >
              <MenuItem
                onClick={() => handleReasonSelect("User Request")}
                sx={{
                  color: "#fff",
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                }}
              >
                User Request
              </MenuItem>
              <MenuItem
                onClick={() => handleReasonSelect("Spam Account")}
                sx={{
                  color: "#fff",
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                }}
              >
                Spam Account
              </MenuItem>
              <MenuItem
                onClick={() => handleReasonSelect("Inactive Account")}
                sx={{
                  color: "#fff",
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                }}
              >
                Inactive Account
              </MenuItem>
              <MenuItem
                onClick={() => handleReasonSelect("Other")}
                sx={{
                  color: "#fff",
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                }}
              >
                Other
              </MenuItem>
            </Menu>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
       <Box display={"flex"} width={"100%"} justifyContent={"space-between"} alignItems={"center"} >
       <Box
            onClick={handleDeleteCancel}
            sx={{
              width: "49%",
              textTransform: "none",
              borderColor: "#000",
              borderRadius: "10px",
              py:"14px",
              px:"28px",
              textAlign:"center",
              fontWeight:600,
              fontSize:"18px",
              border: "1px solid rgba(217, 217, 217, 1)",
              color: "#000",
              "&:hover": {
                borderColor: "#000",
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            Block Account
          </Box>
          <Box
            onClick={handleDeleteConfirm}
            disabled={!deleteReason}
            sx={{
              width: "49%",
              py:"14px",
              px:"28px",
              textAlign:"center",
              color:"white",
              fontWeight:600,
              fontSize:"18px",
              borderRadius: "10px",
              border: "1px solid rgba(217, 217, 217, 1)",
              textTransform: "none",
              // color:"black",
              backgroundColor: redColor,
              "&:hover": {
                backgroundColor: redColor,
                // opacity: 0.9,
              },
              "&.Mui-disabled": {
                // backgroundColor: "rgba(0, 0, 0, 0.12)",
                color: "rgba(0, 0, 0, 0.26)",
              },
            }}
          >
            Delete Account
          </Box>
       </Box>

        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UsersManagement;

