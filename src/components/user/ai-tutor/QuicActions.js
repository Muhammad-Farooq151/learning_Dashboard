"use client";

import React from "react";
import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined";
import { greenColor, bggreen } from "@/utils/Colors";

const quickActions = [
  {
    id: "summarize",
    title: "Summarize my progress",
    description: "Get a summary of your learning progress.",
    icon: <CreateOutlinedIcon sx={{ fontSize: 32, color: greenColor }} />,
  },
  {
    id: "quiz",
    title: "Generate a quiz",
    description: "Create a quiz based on your recent courses.",
    icon: <HelpOutlineOutlinedIcon sx={{ fontSize: 32, color: greenColor }} />,
  },
  {
    id: "learning-path",
    title: "Learning path",
    description: "Get personalized course recommendations.",
    icon: <MenuBookOutlinedIcon sx={{ fontSize: 32, color: greenColor }} />,
  },
  {
    id: "explain",
    title: "Explain a concept",
    description: "Get detailed explanations of complex topics.",
    icon: <ArrowDownwardOutlinedIcon sx={{ fontSize: 32, color: greenColor }} />,
  },
];

function QuickActionCard({ action }) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid #EDF1F7",
        boxShadow: "0px 2px 8px rgba(15, 23, 42, 0.05)",
        cursor: "pointer",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0px 4px 12px rgba(15, 23, 42, 0.1)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2} alignItems="center" justifyContent="center">
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: bggreen,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {action.icon}
          </Box>
          <Stack spacing={0.5}>
            <Typography variant="subtitle1" fontWeight={600}>
              {action.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
              {action.description}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function QuicActions() {
  return (
    <Box sx={{ mb: 4, flexShrink: 0 }}>
      {/* <Typography variant="h5" fontWeight={600} mb={3}>
        Quick Actions
      </Typography> */}
      <Grid container spacing={2}>
        {quickActions.map((action) => (
          <Grid size={{ xs: 12, sm: 6 }} key={action.id}>
            <QuickActionCard action={action} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default QuicActions;
