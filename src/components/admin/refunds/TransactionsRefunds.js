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
  Menu,
  MenuItem,
  Stack,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { bggreen, greenColor } from "@/utils/Colors";

const transactionsData = [
  {
    id: "TXN002",
    user: "Jon Brekke",
    course: "UI/UX Design Principles",
    amount: 149.0,
    status: "Paid",
    date: "Jan 23 2025",
  },
  {
    id: "TXN001",
    user: "Suzanne Skilles DDS",
    course: "React Fundamentals",
    amount: 99.0,
    status: "Pending",
    date: "Feb 03 2025",
  },
  {
    id: "TXN003",
    user: "Antoinette Donnelly",
    course: "Python for Data Science",
    amount: 199.0,
    status: "Paid",
    date: "May 14 2025",
  },
  {
    id: "TXN005",
    user: "Kerry Beer",
    course: "Mobile App Development",
    amount: 79.0,
    status: "Paid",
    date: "Aug 28 2025",
  },
  {
    id: "TXN004",
    user: "Tracey Roob",
    course: "Advanced JavaScript",
    amount: 129.0,
    status: "Pending",
    date: "May 20 2025",
  },
];

const dateRangeOptions = [
  "This Week",
  "This Month",
  "Past 3 Months",
  "Past 6 Months",
  "Past 9 Months",
  "1 Year",
];

function TransactionsRefunds() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("Date Range");
  const [dateRangeAnchorEl, setDateRangeAnchorEl] = useState(null);

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

  const filteredTransactions = transactionsData.filter((transaction) => {
    const matchesSearch =
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.course.toLowerCase().includes(searchQuery.toLowerCase());
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
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((transaction, index) => (
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
                        {transaction.id}
                      </Typography>
                    </TableCell>
                    <TableCell>{transaction.user}</TableCell>
                    <TableCell>{transaction.course}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        ${transaction.amount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status}
                        size="small"
                        sx={{
                          backgroundColor:
                            transaction.status === "Paid"
                              ? greenColor
                              : bggreen,
                          color: transaction.status === "Paid" ? "#fff" : greenColor,
                          fontWeight: 500,
                          borderRadius: 112,
                          height: 24,
                          fontSize: "0.75rem",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {transaction.date}
                      </Typography>
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

export default TransactionsRefunds;

