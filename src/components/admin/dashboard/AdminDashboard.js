"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Grid,
  Skeleton,
  Chip,
  Divider,
} from "@mui/material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Cell,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { greenColor } from "@/utils/Colors";
import { getJSON } from "@/utils/http";

// Skeleton Loader Component
const StatCardSkeleton = () => (
  <Card
    sx={{
      borderRadius: 4,
      border: "1px solid #EDF1F7",
      boxShadow: "none",
      height: "100%",
    }}
  >
    <CardContent sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Skeleton variant="rectangular" width={44} height={44} sx={{ borderRadius: 2 }} />
        <Skeleton variant="text" width={80} height={20} />
      </Stack>
      <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="40%" height={40} />
    </CardContent>
  </Card>
);

const ChartSkeleton = ({ height = 400 }) => (
  <Box sx={{ width: "100%", height }}>
    <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 2 }} />
  </Box>
);

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: "#fff",
          border: "1px solid #E2E8F0",
          borderRadius: 2,
          p: 1.5,
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography variant="body2" fontWeight={600} mb={1}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography
            key={index}
            variant="body2"
            sx={{
              color: entry.color,
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            {entry.name}: {typeof entry.value === 'number' 
              ? entry.name.includes('$') || entry.name.includes('Revenue') || entry.name.includes('Amount')
                ? `$${entry.value.toLocaleString()}`
                : entry.name.includes('%') || entry.name.includes('Rate')
                ? `${entry.value.toFixed(1)}%`
                : entry.value.toLocaleString()
              : entry.value}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

// Colors for charts
const CHART_COLORS = [
  greenColor,
  "#FFA07A",
  "#9370DB",
  "#20B2AA",
  "#FFD700",
  "#FF6347",
  "#4682B4",
  "#32CD32",
];

// Stat Card Component
const StatCard = ({ item, loading = false }) => {
  if (loading) {
    return <StatCardSkeleton />;
  }

  const isPositive = item.delta && !item.delta.includes("-");
  const DeltaIcon = isPositive ? ArrowUpwardRoundedIcon : ArrowDownwardRoundedIcon;

  return (
    <Card
      sx={{
        borderRadius: 4,
        border: "1px solid #EDF1F7",
        boxShadow: "none",
        height: "100%",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.08)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Stack direction="row" spacing={1.5} alignItems="center" flex={1}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: `${item.iconColor || greenColor}15`,
                display: "grid",
                placeItems: "center",
              }}
            >
              {item.icon}
            </Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {item.label}
            </Typography>
          </Stack>
          {item.delta && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <DeltaIcon
                sx={{
                  fontSize: 16,
                  color: isPositive ? greenColor : "#EF4444",
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: isPositive ? greenColor : "#EF4444",
                }}
              >
                {item.delta}
              </Typography>
            </Stack>
          )}
        </Stack>

        <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
          {item.value}
        </Typography>
        {item.subValue && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
            {item.subValue}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    courses: { total: 0, published: 0, draft: 0, data: [] },
    users: { total: 0, active: 0, blocked: 0, data: [] },
    transactions: { total: 0, paid: 0, pending: 0, cancelled: 0, totalRevenue: 0, data: [] },
    tutors: { total: 0, data: [] },
    admins: { total: 0, data: [] },
  });

  // Fetch all data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [coursesRes, usersRes, transactionsRes, tutorsRes, adminsRes] = await Promise.all([
          getJSON("courses?limit=1000").catch(() => ({ success: false, data: [] })),
          getJSON("users").catch(() => ({ success: false, data: [] })),
          getJSON("transactions").catch(() => ({ success: false, transactions: [] })),
          getJSON("tutors").catch(() => ({ success: false, data: [] })),
          getJSON("admins").catch(() => ({ success: false, data: [] })),
        ]);

        // Process Courses
        const courses = coursesRes.success ? coursesRes.data || [] : [];
        const publishedCourses = courses.filter((c) => c.status === "published");
        const draftCourses = courses.filter((c) => c.status === "draft");

        // Process Users
        const users = usersRes.success ? usersRes.data || [] : [];
        const activeUsers = users.filter((u) => u.status === "active" && u.role === "user");
        const blockedUsers = users.filter((u) => u.status === "blocked");

        // Process Transactions
        const transactions = transactionsRes.success ? transactionsRes.transactions || [] : [];
        const paidTransactions = transactions.filter((t) => t.status === "Paid");
        const pendingTransactions = transactions.filter((t) => t.status === "Pending");
        const cancelledTransactions = transactions.filter((t) => t.status === "Cancel");
        const totalRevenue = paidTransactions.reduce((sum, t) => sum + (t.total || 0), 0);

        // Process Tutors
        const tutors = tutorsRes.success ? tutorsRes.data || [] : [];

        // Process Admins
        const admins = adminsRes.success ? adminsRes.data || [] : [];

        setStats({
          courses: {
            total: courses.length,
            published: publishedCourses.length,
            draft: draftCourses.length,
            data: courses,
          },
          users: {
            total: users.length,
            active: activeUsers.length,
            blocked: blockedUsers.length,
            data: users,
          },
          transactions: {
            total: transactions.length,
            paid: paidTransactions.length,
            pending: pendingTransactions.length,
            cancelled: cancelledTransactions.length,
            totalRevenue,
            data: transactions,
          },
          tutors: {
            total: tutors.length,
            data: tutors,
          },
          admins: {
            total: admins.length,
            data: admins,
          },
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate statistics for cards
  const statCards = useMemo(() => {
    const prevMonthRevenue = stats.transactions.totalRevenue * 0.85; // Simulated
    const revenueChange = prevMonthRevenue > 0
      ? ((stats.transactions.totalRevenue - prevMonthRevenue) / prevMonthRevenue * 100).toFixed(1)
      : 0;

    return [
      {
        id: "courses",
        icon: <MenuBookRoundedIcon sx={{ color: greenColor }} />,
        iconColor: greenColor,
        label: "Total Courses",
        value: stats.courses.total.toLocaleString(),
        subValue: `${stats.courses.published} published, ${stats.courses.draft} drafts`,
        delta: stats.courses.published > 0 ? `${((stats.courses.published / stats.courses.total) * 100).toFixed(0)}% published` : "0%",
        deltaColor: greenColor,
      },
      {
        id: "users",
        icon: <PeopleRoundedIcon sx={{ color: "#4682B4" }} />,
        iconColor: "#4682B4",
        label: "Total Users",
        value: stats.users.total.toLocaleString(),
        subValue: `${stats.users.active} active, ${stats.users.blocked} blocked`,
        delta: stats.users.active > 0 ? `${((stats.users.active / stats.users.total) * 100).toFixed(0)}% active` : "0%",
        deltaColor: greenColor,
      },
      {
        id: "revenue",
        icon: <AccountBalanceWalletRoundedIcon sx={{ color: "#FFA07A" }} />,
        iconColor: "#FFA07A",
        label: "Total Revenue",
        value: `$${stats.transactions.totalRevenue.toLocaleString()}`,
        subValue: `${stats.transactions.paid} successful transactions`,
        delta: revenueChange > 0 ? `+${revenueChange}%` : `${revenueChange}%`,
        deltaColor: revenueChange > 0 ? greenColor : "#EF4444",
      },
      {
        id: "transactions",
        icon: <TrendingUpRoundedIcon sx={{ color: "#9370DB" }} />,
        iconColor: "#9370DB",
        label: "Transactions",
        value: stats.transactions.total.toLocaleString(),
        subValue: `${stats.transactions.paid} paid, ${stats.transactions.pending} pending`,
        delta: stats.transactions.paid > 0 ? `${((stats.transactions.paid / stats.transactions.total) * 100).toFixed(0)}% success` : "0%",
        deltaColor: greenColor,
      },
      {
        id: "tutors",
        icon: <SchoolRoundedIcon sx={{ color: "#20B2AA" }} />,
        iconColor: "#20B2AA",
        label: "Tutors",
        value: stats.tutors.total.toLocaleString(),
        delta: "",
        deltaColor: greenColor,
      },
      {
        id: "admins",
        icon: <AdminPanelSettingsRoundedIcon sx={{ color: "#FFD700" }} />,
        iconColor: "#FFD700",
        label: "Administrators",
        value: stats.admins.total.toLocaleString(),
        delta: "",
        deltaColor: greenColor,
      },
    ];
  }, [stats]);

  // Prepare chart data
  const revenueChartData = useMemo(() => {
    const last6Months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString("en-US", { month: "short" });
      
      const monthTransactions = stats.transactions.data.filter((t) => {
        const tDate = new Date(t.createdAt);
        return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
      });
      
      const monthRevenue = monthTransactions
        .filter((t) => t.status === "Paid")
        .reduce((sum, t) => sum + (t.total || 0), 0);
      
      const monthEnrollments = monthTransactions.length;
      
      last6Months.push({
        month: monthName,
        revenue: monthRevenue,
        transactions: monthEnrollments,
        paid: monthTransactions.filter((t) => t.status === "Paid").length,
      });
    }
    
    return last6Months;
  }, [stats.transactions.data]);

  // Course category distribution
  const categoryData = useMemo(() => {
    const categoryMap = {};
    stats.courses.data.forEach((course) => {
      const category = course.category || "Uncategorized";
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });
    
    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
    }));
  }, [stats.courses.data]);

  // User growth data
  const userGrowthData = useMemo(() => {
    const last6Months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString("en-US", { month: "short" });
      
      const monthUsers = stats.users.data.filter((u) => {
        const uDate = new Date(u.createdAt);
        return uDate.getMonth() === date.getMonth() && uDate.getFullYear() === date.getFullYear();
      });
      
      last6Months.push({
        month: monthName,
        users: monthUsers.length,
        active: monthUsers.filter((u) => u.status === "active").length,
      });
    }
    
    return last6Months;
  }, [stats.users.data]);

  // Transaction status pie data
  const transactionStatusData = useMemo(() => {
    return [
      { name: "Paid", value: stats.transactions.paid, color: greenColor },
      { name: "Pending", value: stats.transactions.pending, color: "#F59E0B" },
      { name: "Cancelled", value: stats.transactions.cancelled, color: "#EF4444" },
    ].filter((item) => item.value > 0);
  }, [stats.transactions]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight={700} mb={1}>
        Welcome back, Super Admin!
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Here&apos;s what&apos;s happening with your platform today.
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={2} mb={4}>
        {statCards.map((card) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }} key={card.id}>
            <StatCard item={card} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* Revenue & Transactions Chart */}
      <Grid container spacing={2} mb={4}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card
            sx={{
              borderRadius: 4,
              border: "1px solid #EDF1F7",
              boxShadow: "none",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography variant="h6" fontWeight={600} mb={0.5}>
                    Revenue & Transactions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly revenue and transaction trends
                  </Typography>
                </Box>
                <Chip
                  label={`Total: $${stats.transactions.totalRevenue.toLocaleString()}`}
                  sx={{ bgcolor: `${greenColor}15`, color: greenColor, fontWeight: 600 }}
                />
              </Stack>
              {loading ? (
                <ChartSkeleton height={400} />
              ) : (
                <Box sx={{ width: "100%", height: 400, mt: 2 }}>
                  <ResponsiveContainer>
                    <AreaChart data={revenueChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={greenColor} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={greenColor} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FFA07A" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#FFA07A" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#94A3B8" }}
                      />
                      <YAxis
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#94A3B8" }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#94A3B8" }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        wrapperStyle={{ paddingTop: 20 }}
                        formatter={(value) => (
                          <span style={{ color: "#64748B", fontSize: 12 }}>{value}</span>
                        )}
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue ($)"
                        stroke={greenColor}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="transactions"
                        name="Transactions"
                        stroke="#FFA07A"
                        fillOpacity={1}
                        fill="url(#colorTransactions)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Transaction Status Pie Chart */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card
            sx={{
              borderRadius: 4,
              border: "1px solid #EDF1F7",
              boxShadow: "none",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={0.5}>
                Transaction Status
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Distribution of transaction statuses
              </Typography>
              {loading ? (
                <ChartSkeleton height={300} />
              ) : transactionStatusData.length > 0 ? (
                <Box sx={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={transactionStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {transactionStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
                  <Typography color="text.secondary">No transaction data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* User Growth & Course Categories */}
      <Grid container spacing={2} mb={4}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card
            sx={{
              borderRadius: 4,
              border: "1px solid #EDF1F7",
              boxShadow: "none",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={0.5}>
                User Growth
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                New user registrations over time
              </Typography>
              {loading ? (
                <ChartSkeleton height={350} />
              ) : (
                <Box sx={{ width: "100%", height: 350 }}>
                  <ResponsiveContainer>
                    <BarChart data={userGrowthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#94A3B8" }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#94A3B8" }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        formatter={(value) => (
                          <span style={{ color: "#64748B", fontSize: 12 }}>{value}</span>
                        )}
                      />
                      <Bar dataKey="users" name="Total Users" fill={greenColor} radius={[8, 8, 0, 0]} />
                      <Bar dataKey="active" name="Active Users" fill="#4682B4" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Card
            sx={{
              borderRadius: 4,
              border: "1px solid #EDF1F7",
              boxShadow: "none",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={0.5}>
                Course Categories
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Distribution of courses by category
              </Typography>
              {loading ? (
                <ChartSkeleton height={350} />
              ) : categoryData.length > 0 ? (
                <Box sx={{ width: "100%", height: 350 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={categoryData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94A3B8" }} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#94A3B8" }}
                        width={70}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Courses" fill={greenColor} radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 350 }}>
                  <Typography color="text.secondary">No course data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Line Chart - Revenue Trend */}
      <Card
        sx={{
          borderRadius: 4,
          border: "1px solid #EDF1F7",
          boxShadow: "none",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={0.5}>
            Detailed Revenue Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Comprehensive revenue and transaction analysis with trend lines
          </Typography>
          {loading ? (
            <ChartSkeleton height={450} />
          ) : (
            <Box sx={{ width: "100%", height: 450 }}>
              <ResponsiveContainer>
                <LineChart data={revenueChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#94A3B8" }}
                  />
                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#94A3B8" }}
                    label={{ value: "Revenue ($)", angle: -90, position: "insideLeft", fill: "#64748B" }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#94A3B8" }}
                    label={{ value: "Count", angle: 90, position: "insideRight", fill: "#64748B" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: 20 }}
                    formatter={(value) => (
                      <span style={{ color: "#64748B", fontSize: 12 }}>{value}</span>
                    )}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue ($)"
                    stroke={greenColor}
                    strokeWidth={3}
                    dot={{ fill: greenColor, r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="transactions"
                    name="Transactions"
                    stroke="#FFA07A"
                    strokeWidth={3}
                    dot={{ fill: "#FFA07A", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="paid"
                    name="Paid Transactions"
                    stroke="#4682B4"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: "#4682B4", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default AdminDashboard;

