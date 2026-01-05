"use client";

import React from "react";
import { Box, Card, CardContent, Stack, Typography, Grid } from "@mui/material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { greenColor } from "@/utils/Colors";

const statCards = [
  {
    id: "published",
    icon: <AccessTimeRoundedIcon sx={{ color: greenColor }} />,
    label: "Published Courses",
    value: "542",
    delta: "+12%",
    deltaColor: greenColor,
  },
  {
    id: "learners",
    icon: <MenuBookRoundedIcon sx={{ color: greenColor }} />,
    label: "Active Learners",
    value: "2,847",
    delta: "+1% from last month",
    deltaColor: greenColor,
  },
  {
    id: "completion",
    icon: <TrendingUpRoundedIcon sx={{ color: greenColor }} />,
    label: "Avg. Completion Rate",
    value: "74%",
    delta: "+12%",
    deltaColor: greenColor,
  },
  {
    id: "refunds",
    icon: <BusinessRoundedIcon sx={{ color: greenColor }} />,
    label: "Refunds",
    value: "$2,145",
    delta: "+22.5",
    deltaColor: greenColor,
  },
];

const revenueData = [
  { month: "Jan", revenue: 20, students: 8 },
  { month: "Feb", revenue: 25, students: 12 },
  { month: "Mar", revenue: 30, students: 15 },
  { month: "Apr", revenue: 35, students: 18 },
  { month: "May", revenue: 40, students: 22 },
  { month: "Jun", revenue: 45, students: 24 },
  { month: "Jul", revenue: 50, students: 26 },
  { month: "Aug", revenue: 55, students: 28 },
  { month: "Sep", revenue: 58, students: 30 },
  { month: "Oct", revenue: 60, students: 31 },
  { month: "Nov", revenue: 61, students: 32 },
  { month: "Dec", revenue: 65, students: 33 },
];

const CustomTooltip = ({ active, payload }) => {
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
            {entry.name === "Active Students"
              ? `Active Students ${entry.value}K`
              : `Revenue $${entry.value}00K`}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

const StatCard = ({ item }) => {
  return (
    <Card
      sx={{
        borderRadius: 4,
        border: "1px solid #EDF1F7",
        boxShadow: "none",
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                // bgcolor: "#F1FBF8",
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
            <ArrowUpwardRoundedIcon sx={{ fontSize: 18, color: item.deltaColor }} />
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
      </CardContent>
    </Card>
  );
};

function AdminDashboard() {
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight={700} mb={1}>
        Welcome back, Super Admin!
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Here&apos;s what&apos;s happening with your platform today.
      </Typography>

      <Grid container spacing={2} mb={4}>
        {statCards.map((card) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.id}>
            <StatCard item={card} />
          </Grid>
        ))}
      </Grid>

      <Card
        sx={{
          borderRadius: 4,
          border: "1px solid #EDF1F7",
          boxShadow: "none",
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={1}>
            Revenue & Student Growth
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Monthly revenue and active student trends
          </Typography>
          <Box sx={{ width: "100%", height: 400 }}>
            <ResponsiveContainer>
              <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94A3B8" }}
                  domain={[0, 36]}
                  ticks={[0, 10, 18, 27, 36]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 20 }}
                  iconType="line"
                  formatter={(value) => (
                    <span style={{ color: "#64748B", fontSize: 12 }}>{value}</span>
                  )}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="students"
                  name="Active Students"
                  stroke={greenColor}
                  strokeWidth={3}
                  dot={{ fill: greenColor, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#FFA07A"
                  strokeWidth={3}
                  dot={{ fill: "#FFA07A", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default AdminDashboard;

