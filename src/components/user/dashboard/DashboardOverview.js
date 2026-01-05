"use client";

import React from "react";
import { Box, Card, CardContent, Stack, Typography,Grid } from "@mui/material";
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

const statCards = [
  {
    id: "courses",
    icon: <MenuBookRoundedIcon sx={{ color: "#2DB888" }} />,
    label: "Courses Completed",
    value: "4",
    delta: "+2.5",
    deltaColor: "#2DB888",
  },
  {
    id: "time",
    icon: <AccessTimeRoundedIcon sx={{ color: "#1CB0F6" }} />,
    label: "Total Learning Time",
    value: "45h",
    delta: "-4.2",
    deltaColor: "#F87171",
  },
  {
    id: "progress",
    icon: <TrendingUpRoundedIcon sx={{ color: "#6B4EFF" }} />,
    label: "Overall Progress",
    value: "68%",
    delta: "+2.25",
    deltaColor: "#2DB888",
  },
];

const monthlyProgress = [
  { month: "Jan", value: 20 },
  { month: "Feb", value: 32 },
  { month: "Mar", value: 48 },
  { month: "Apr", value: 60 },
  { month: "May", value: 78 },
  { month: "Jun", value: 26 },
  { month: "Jul", value: 14 },
  { month: "Aug", value: 72 },
  { month: "Sep", value: 50 },
  { month: "Oct", value: 65 },
  { month: "Nov", value: 42 },
  { month: "Dec", value: 70 },
];

const categoryBreakdown = [
  { name: "Programming", value: 65, color: "#4F7BFF" },
  { name: "Design", value: 25, color: "#FFC657" },
  { name: "Data Science", value: 10, color: "#8CD867" },
];

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

