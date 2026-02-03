"use client";

import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Stack, Typography, Grid, CircularProgress } from "@mui/material";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import FiberManualRecordRoundedIcon from "@mui/icons-material/FiberManualRecordRounded";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getJSON } from "@/utils/http";
import { getStoredUserId } from "@/utils/authStorage";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: "#0F172A",
          color: "#fff",
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          fontSize: 12,
        }}
      >
        {payload[0].value}
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

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Dashboard
      </Typography>

      <Grid container spacing={2} mb={3}>
        {statCards.map((card) => (
          <Grid size={{xs:12,sm:6,md:4}} key={card.id}>
            <StatCard item={card} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{xs:12,md:8}}>
          <Card
            sx={{
              borderRadius: 4,
              border: "1px solid #EDF1F7",
              boxShadow: "0px 10px 30px rgba(15, 23, 42, 0.05)",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Monthly Learning Progress
              </Typography>
              <Box sx={{ width: "100%", height: 260, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyProgress} barSize={20}>
                    <CartesianGrid vertical={false} stroke="#F1F5F9" />
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
                      ticks={[0, 25, 50, 75, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
                    <Bar radius={[8, 8, 0, 0]} dataKey="value" fill="#C8F4DC" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs:12,md:4}}>
          <Card
            sx={{
              borderRadius: 4,
              border: "1px solid #EDF1F7",
              boxShadow: "0px 10px 30px rgba(15, 23, 42, 0.05)",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Learning by Category
              </Typography>
              <Box sx={{ width: "100%", height: 220, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryBreakdown.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              <Stack spacing={1}>
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
                    <Typography variant="body2" color="text.secondary">
                      {item.value}%
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardOverview;

