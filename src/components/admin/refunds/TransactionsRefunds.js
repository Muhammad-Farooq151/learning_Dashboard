"use client";

import React, { useState, useEffect } from "react";
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
  Menu,
  MenuItem,
  Stack,
  Select,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Divider,
  Grid,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import { bggreen, greenColor } from "@/utils/Colors";
import { getJSON, putJSON } from "@/utils/http";
import Swal from "sweetalert2";

const dateRangeOptions = [
  "This Week",
  "This Month",
  "Past 3 Months",
  "Past 6 Months",
  "Past 9 Months",
  "1 Year",
];

const statusOptions = ["Paid", "Pending", "Cancel"];

function TransactionsRefunds() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("Date Range");
  const [dateRangeAnchorEl, setDateRangeAnchorEl] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState({});
  const [updatingStatus, setUpdatingStatus] = useState({});

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getJSON("transactions");
      if (response.success) {
        setTransactions(response.transactions || []);
      } else {
        setError(response.message || "Failed to fetch transactions");
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err.message || "Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeClick = (event) => {
    setDateRangeAnchorEl(event.currentTarget);
  };

  const handleDateRangeClose = () => {
    setDateRangeAnchorEl(null);
  };

  const handleDateRangeSelect = (range) => {
    setDateRange(range);
    handleDateRangeClose();
  };

  const handleStatusMenuOpen = (event, transactionId) => {
    event.stopPropagation();
    setStatusMenuAnchor((prev) => ({ ...prev, [transactionId]: event.currentTarget }));
  };

  const handleStatusMenuClose = (transactionId) => {
    setStatusMenuAnchor((prev) => {
      const newState = { ...prev };
      delete newState[transactionId];
      return newState;
    });
  };

  const handleStatusChange = async (transactionId, newStatus) => {
    handleStatusMenuClose(transactionId);

    // Show SweetAlert2 confirmation
    const result = await Swal.fire({
      title: "Change Status?",
      text: `Are you sure you want to change the status to "${newStatus}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: greenColor,
      cancelButtonColor: "#64748B",
      confirmButtonText: "Yes, change it",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setUpdatingStatus((prev) => ({ ...prev, [transactionId]: true }));
      const response = await putJSON(`transactions/${transactionId}/status`, {
        status: newStatus,
      });

      if (response.success) {
        // Update the transaction in the list
        setTransactions((prev) =>
          prev.map((t) => (t._id === transactionId ? response.transaction : t))
        );

        await Swal.fire({
          icon: "success",
          title: "Status Updated",
          text: `Transaction status has been changed to "${newStatus}".`,
          confirmButtonColor: greenColor,
        });
      } else {
        throw new Error(response.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating transaction status:", err);
      await Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.message || "Failed to update transaction status. Please try again.",
        confirmButtonColor: greenColor,
      });
    } finally {
      setUpdatingStatus((prev) => {
        const newState = { ...prev };
        delete newState[transactionId];
        return newState;
      });
    }
  };

  const handleInfoClick = (transaction) => {
    setSelectedTransaction(transaction);
    setInfoDialogOpen(true);
  };

  const handleInfoDialogClose = () => {
    setInfoDialogOpen(false);
    setSelectedTransaction(null);
  };

  const handleRefund = async (transaction) => {
    // First confirmation
    const firstConfirm = await Swal.fire({
      title: "Process Refund?",
      text: `Are you sure you want to refund $${(transaction.total || 0).toFixed(2)} for transaction ${transaction.transactionId}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Yes, proceed",
      cancelButtonText: "Cancel",
    });

    if (!firstConfirm.isConfirmed) {
      return;
    }

    // Second confirmation
    const secondConfirm = await Swal.fire({
      title: "Final Confirmation",
      text: `This action cannot be undone. Refund $${(transaction.total || 0).toFixed(2)} to ${transaction.userId?.fullName || "the user"}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Yes, refund now",
      cancelButtonText: "Cancel",
      input: "text",
      inputPlaceholder: "Type 'REFUND' to confirm",
      inputValidator: (value) => {
        if (!value || value.toUpperCase() !== "REFUND") {
          return "Please type 'REFUND' to confirm";
        }
      },
    });

    if (!secondConfirm.isConfirmed) {
      return;
    }

    try {
      // Update transaction status to Cancel (or you can create a separate refund endpoint)
      const response = await putJSON(`transactions/${transaction._id}/status`, {
        status: "Cancel",
      });

      if (response.success) {
        // Update the transaction in the list
        setTransactions((prev) =>
          prev.map((t) => (t._id === transaction._id ? response.transaction : t))
        );

        await Swal.fire({
          icon: "success",
          title: "Refund Processed",
          text: `Refund of $${(transaction.total || 0).toFixed(2)} has been processed successfully.`,
          confirmButtonColor: greenColor,
        });
      } else {
        throw new Error(response.message || "Failed to process refund");
      }
    } catch (err) {
      console.error("Error processing refund:", err);
      await Swal.fire({
        icon: "error",
        title: "Refund Failed",
        text: err.message || "Failed to process refund. Please try again.",
        confirmButtonColor: greenColor,
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return greenColor;
      case "Pending":
        return "#F59E0B";
      case "Cancel":
        return "#EF4444";
      default:
        return "#64748B";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "Paid":
        return bggreen;
      case "Pending":
        return "#FEF3C7";
      case "Cancel":
        return "#FEE2E2";
      default:
        return "#F1F5F9";
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.userId?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.courseId?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight={700} mb={1}>
        Transactions & Refunds
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Monitor payments and handle refund requests
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
            All Transactions
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            View and manage platform transactions
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
                onClick={handleDateRangeClick}
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
                {dateRange}
              </Button>

              <Menu
                anchorEl={dateRangeAnchorEl}
                open={Boolean(dateRangeAnchorEl)}
                onClose={handleDateRangeClose}
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
                  onClick={() => handleDateRangeSelect("Date Range")}
                  sx={{
                    backgroundColor:
                      dateRange === "Date Range" ? "#F1F5F9" : "transparent",
                    "&:hover": { backgroundColor: "#F8FAFC" },
                  }}
                >
                  Date Range
                </MenuItem>
                {dateRangeOptions.map((option) => (
                  <MenuItem
                    key={option}
                    onClick={() => handleDateRangeSelect(option)}
                    sx={{
                      backgroundColor:
                        dateRange === option ? "#F1F5F9" : "transparent",
                      "&:hover": { backgroundColor: "#F8FAFC" },
                    }}
                  >
                    {option}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Stack>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="error">{error}</Typography>
              <Button
                variant="outlined"
                onClick={fetchTransactions}
                sx={{ mt: 2 }}
              >
                Retry
              </Button>
            </Box>
          ) : filteredTransactions.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="text.secondary">
                No transactions found
              </Typography>
            </Box>
          ) : (
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
                    <TableCell>Transaction ID</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow
                      key={transaction._id}
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
                          {transaction.transactionId || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {transaction.userId?.fullName || "N/A"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {transaction.userId?.email || ""}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {transaction.courseId?.title || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          ${(transaction.total || 0).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={transaction.status || "Paid"}
                            onChange={(e) =>
                              handleStatusChange(transaction._id, e.target.value)
                            }
                            disabled={updatingStatus[transaction._id]}
                            sx={{
                              height: 32,
                              fontSize: "0.75rem",
                              fontWeight: 500,
                              backgroundColor: getStatusBgColor(transaction.status),
                              color: getStatusColor(transaction.status),
                              borderRadius: 112,
                              "& .MuiOutlinedInput-notchedOutline": {
                                border: "none",
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                border: "none",
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                border: "none",
                              },
                              "& .MuiSelect-icon": {
                                color: getStatusColor(transaction.status),
                              },
                            }}
                          >
                            {statusOptions.map((status) => (
                              <MenuItem key={status} value={status}>
                                {status}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(transaction.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={() => handleInfoClick(transaction)}
                            sx={{
                              color: greenColor,
                              "&:hover": {
                                backgroundColor: bggreen,
                              },
                            }}
                          >
                            <InfoRoundedIcon fontSize="small" />
                          </IconButton>
                          {transaction.status === "Paid" && (
                            <IconButton
                              size="small"
                              onClick={() => handleRefund(transaction)}
                              sx={{
                                color: "#EF4444",
                                "&:hover": {
                                  backgroundColor: "#FEE2E2",
                                },
                              }}
                              title="Process Refund"
                            >
                              <AccountBalanceWalletRoundedIcon fontSize="small" />
                            </IconButton>
                          )}
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

      {/* Info Dialog */}
      <Dialog
        open={infoDialogOpen}
        onClose={handleInfoDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={600}>
              Transaction Details
            </Typography>
            <IconButton onClick={handleInfoDialogClose} size="small">
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Transaction ID
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {selectedTransaction.transactionId || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight={500}
                  sx={{ color: getStatusColor(selectedTransaction.status) }}
                >
                  {selectedTransaction.status || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  User Name
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {selectedTransaction.userId?.fullName || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  User Email
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {selectedTransaction.userId?.email || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Phone Number
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {selectedTransaction.phoneNumber || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Course
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {selectedTransaction.courseId?.title || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Original Price
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  ${(selectedTransaction.originalPrice || 0).toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Discount Percentage
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {selectedTransaction.discountPercentage || 0}%
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Discount Amount
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  ${(selectedTransaction.discountAmount || 0).toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Tax (8%)
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  ${(selectedTransaction.tax || 0).toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ color: greenColor }}>
                  ${(selectedTransaction.total || 0).toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Payment Method
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {selectedTransaction.paymentMethod || "Card"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Stripe Payment Intent ID
                </Typography>
                <Typography variant="body2" fontWeight={500} sx={{ wordBreak: "break-all" }}>
                  {selectedTransaction.stripePaymentIntentId || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Currency
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {(selectedTransaction.currency || "usd").toUpperCase()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Transaction Date
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {formatDate(selectedTransaction.createdAt)}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleInfoDialogClose} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TransactionsRefunds;
