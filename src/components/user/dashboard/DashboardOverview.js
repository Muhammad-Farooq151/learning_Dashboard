"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Grid,
  CircularProgress,
  Skeleton,
  Chip,
} from "@mui/material";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import FiberManualRecordRoundedIcon from "@mui/icons-material/FiberManualRecordRounded";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { getJSON } from "@/utils/http";
import { getStoredUserId } from "@/utils/authStorage";
import { greenColor } from "@/utils/Colors";

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
    <CardContent sx={{ p: 3 }}>
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

// Enhanced Custom Tooltip
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
        {label && (
          <Typography variant="body2" fontWeight={600} mb={1}>
            {label}
          </Typography>
        )}
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
              ? entry.name.includes('%') || entry.name.includes('Progress')
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

const StatCard = ({ item }) => {
  const isPositive = item.delta.startsWith("+");
  return (
    <Card
      sx={{
        borderRadius: 4,
        border: "1px solid #EDF1F7",
        boxShadow: "0px 10px 30px rgba(15, 23, 42, 0.05)",
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: "#F1FBF8",
                display: "grid",
                placeItems: "center",
              }}
            >
              {item.icon}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {item.label}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            {isPositive ? (
              <ArrowUpwardRoundedIcon sx={{ fontSize: 18, color: item.deltaColor }} />
            ) : (
              <ArrowDownwardRoundedIcon sx={{ fontSize: 18, color: item.deltaColor }} />
            )}
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: item.deltaColor }}
            >
              {item.delta}
            </Typography>
          </Stack>
        </Stack>

        <Typography variant="h4" fontWeight={700} sx={{ mt: 2 }}>
          {item.value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {item.label}
        </Typography>
      </CardContent>
    </Card>
  );
};

function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [statCards, setStatCards] = useState([
    {
      id: "courses",
      icon: <MenuBookRoundedIcon sx={{ color: "#2DB888" }} />,
      label: "Courses Completed",
      value: "0",
      delta: "+0",
      deltaColor: "#2DB888",
    },
    {
      id: "time",
      icon: <AccessTimeRoundedIcon sx={{ color: "#1CB0F6" }} />,
      label: "Total Learning Time",
      value: "0h",
      delta: "+0",
      deltaColor: "#2DB888",
    },
    {
      id: "progress",
      icon: <TrendingUpRoundedIcon sx={{ color: "#6B4EFF" }} />,
      label: "Overall Progress",
      value: "0%",
      delta: "+0",
      deltaColor: "#2DB888",
    },
  ]);
  const [monthlyProgress, setMonthlyProgress] = useState([
    { month: "Jan", value: 0 },
    { month: "Feb", value: 0 },
    { month: "Mar", value: 0 },
    { month: "Apr", value: 0 },
    { month: "May", value: 0 },
    { month: "Jun", value: 0 },
    { month: "Jul", value: 0 },
    { month: "Aug", value: 0 },
    { month: "Sep", value: 0 },
    { month: "Oct", value: 0 },
    { month: "Nov", value: 0 },
    { month: "Dec", value: 0 },
  ]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([
    { name: "No courses", value: 100, color: "#95A5A6" },
  ]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const userId = getStoredUserId();
        if (!userId) {
          setLoading(false);
          return;
        }

        const response = await getJSON(`users/dashboard-stats?userId=${userId}`);
        if (response && response.success && response.data) {
          const stats = response.data;

          // Update stat cards
          setStatCards([
            {
              id: "courses",
              icon: <MenuBookRoundedIcon sx={{ color: "#2DB888" }} />,
              label: "Courses Completed",
              value: stats.coursesCompleted?.toString() || "0",
              delta: "+0",
              deltaColor: "#2DB888",
            },
            {
              id: "time",
              icon: <AccessTimeRoundedIcon sx={{ color: "#1CB0F6" }} />,
              label: "Total Learning Time",
              value: stats.totalLearningTime || "0h",
              delta: "+0",
              deltaColor: "#2DB888",
            },
            {
              id: "progress",
              icon: <TrendingUpRoundedIcon sx={{ color: "#6B4EFF" }} />,
              label: "Overall Progress",
              value: `${stats.overallProgress || 0}%`,
              delta: "+0",
              deltaColor: "#2DB888",
            },
          ]);

          // Update monthly progress
          if (stats.monthlyProgress && Array.isArray(stats.monthlyProgress)) {
            setMonthlyProgress(stats.monthlyProgress);
          }

          // Update category breakdown
          if (stats.categoryBreakdown && Array.isArray(stats.categoryBreakdown) && stats.categoryBreakdown.length > 0) {
            setCategoryBreakdown(stats.categoryBreakdown);
          } else {
            setCategoryBreakdown([
              { name: "No courses", value: 100, color: "#95A5A6" },
            ]);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Prepare detailed chart data
  const detailedProgressData = useMemo(() => {
    return monthlyProgress.map((item) => ({
      ...item,
      target: 100,
      average: 50,
    }));
  }, [monthlyProgress]);

  // Weekly progress data (simulated from monthly)
  const weeklyProgressData = useMemo(() => {
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const weekIndex = monthlyProgress.length - 1 - Math.floor(i / 3);
      const monthData = monthlyProgress[weekIndex] || { value: 0 };
      weeks.push({
        week: `Week ${4 - i}`,
        progress: monthData.value || 0,
        completed: Math.floor((monthData.value || 0) / 10),
      });
    }
    return weeks;
  }, [monthlyProgress]);

  return (
    <Box >
      {/* <Typography variant="h4" fontWeight={700} mb={1}>
        Welcome back!
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Here&apos;s your learning progress and statistics.
      </Typography> */}

      {/* Statistics Cards - Keep Same */}
      <Grid container spacing={2} mb={4}>
        {statCards.map((card) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.id}>
            {loading ? <StatCardSkeleton /> : <StatCard item={card} />}
          </Grid>
        ))}
      </Grid>

      {/* Enhanced Charts Section */}
      <Grid container spacing={2} mb={4}>
        {/* Monthly Progress - Area Chart */}
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
                    Monthly Learning Progress
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your learning activity over the past year
                  </Typography>
                </Box>
                <Chip
                  label={`Overall: ${statCards.find((c) => c.id === "progress")?.value || "0%"}`}
                  sx={{ bgcolor: `${greenColor}15`, color: greenColor, fontWeight: 600 }}
                />
              </Stack>
              {loading ? (
                <ChartSkeleton height={350} />
              ) : (
                <Box sx={{ width: "100%", height: 350, mt: 2 }}>
                  <ResponsiveContainer>
                    <AreaChart data={monthlyProgress} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={greenColor} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={greenColor} stopOpacity={0} />
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
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#94A3B8" }}
                        domain={[0, 100]}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        formatter={(value) => (
                          <span style={{ color: "#64748B", fontSize: 12 }}>{value}</span>
                        )}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        name="Progress (%)"
                        stroke={greenColor}
                        fillOpacity={1}
                        fill="url(#colorProgress)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Category Breakdown - Pie Chart */}
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
                Learning by Category
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Distribution of your enrolled courses
              </Typography>
              {loading ? (
                <ChartSkeleton height={300} />
              ) : categoryBreakdown.length > 0 && categoryBreakdown[0].name !== "No courses" ? (
                <>
                  <Box sx={{ width: "100%", height: 250 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={categoryBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Stack spacing={1} mt={2}>
                    {categoryBreakdown.map((item) => (
                      <Stack
                        key={item.name}
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <FiberManualRecordRoundedIcon sx={{ fontSize: 12, color: item.color }} />
                          <Typography variant="body2">{item.name}</Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                          {item.value}%
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </>
              ) : (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
                  <Typography color="text.secondary">No course data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Progress Analysis */}
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
                Progress Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Monthly progress with target and average lines
              </Typography>
              {loading ? (
                <ChartSkeleton height={350} />
              ) : (
                <Box sx={{ width: "100%", height: 350 }}>
                  <ResponsiveContainer>
                    <LineChart data={detailedProgressData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                        domain={[0, 100]}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        formatter={(value) => (
                          <span style={{ color: "#64748B", fontSize: 12 }}>{value}</span>
                        )}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Your Progress"
                        stroke={greenColor}
                        strokeWidth={3}
                        dot={{ fill: greenColor, r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="target"
                        name="Target"
                        stroke="#FFA07A"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="average"
                        name="Average"
                        stroke="#4682B4"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        dot={false}
                      />
                    </LineChart>
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
                Weekly Activity
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Recent weekly learning activity
              </Typography>
              {loading ? (
                <ChartSkeleton height={350} />
              ) : (
                <Box sx={{ width: "100%", height: 350 }}>
                  <ResponsiveContainer>
                    <BarChart data={weeklyProgressData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis
                        dataKey="week"
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
                      <Bar dataKey="progress" name="Progress (%)" fill={greenColor} radius={[8, 8, 0, 0]} />
                      <Bar dataKey="completed" name="Completed" fill="#4682B4" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardOverview;

