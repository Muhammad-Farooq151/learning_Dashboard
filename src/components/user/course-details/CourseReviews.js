"use client";

import React, { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import StarRoundedIcon from "@mui/icons-material/StarRounded";

const DEFAULT_DISTRIBUTION = [
  { stars: 5, percent: 80 },
  { stars: 4, percent: 10 },
  { stars: 3, percent: 4 },
  { stars: 2, percent: 1 },
  { stars: 1, percent: 5 },
];

const MOCK_REVIEWS = [
  {
    id: 1,
    name: "John Doe",
    avatar: "J",
    timeAgo: "1 week ago",
    rating: 5,
    text: "This course exceeded my expectations! The instructor's teaching style is clear and engaging. I was able to land a new job within 3 months of completing this course.",
  },
  {
    id: 2,
    name: "Emily Rodriguez",
    avatar: "E",
    timeAgo: "1 week ago",
    rating: 5,
    text: "Excellent content and great hands-on projects. The real-world examples really helped me understand complex concepts. Highly recommended!",
  },
  {
    id: 3,
    name: "David Kim",
    avatar: "D",
    timeAgo: "1 week ago",
    rating: 4,
    text: "Great course overall. Some sections could be more detailed, but the instructor is very knowledgeable and responsive to questions.",
  },
  {
    id: 4,
    name: "John Doe",
    avatar: "J",
    timeAgo: "1 week ago",
    rating: 5,
    text: "This course exceeded my expectations! The instructor's teaching style is clear and engaging. I was able to land a new job within 3 months of completing this course.",
  },
];

function CourseReviews({ course }) {
  const [activeFilter, setActiveFilter] = useState("All");

  const rating = course?.rating ?? 4.8;
  const totalReviews =
    typeof course?.reviews === "number"
      ? course.reviews
      : course?.reviews
      ? parseInt(String(course.reviews).replace(/\D/g, ""), 10) || 256
      : 256;

  const distribution = course?.ratingDistribution || DEFAULT_DISTRIBUTION;

  const filteredReviews = useMemo(() => {
    if (activeFilter === "All") return MOCK_REVIEWS;
    const stars = parseInt(activeFilter, 10);
    return MOCK_REVIEWS.filter((r) => r.rating === stars);
  }, [activeFilter]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack spacing={4}>
        {/* Rating summary */}
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Reviews
          </Typography>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={3}>
              <Stack spacing={0.5} alignItems={{ xs: "flex-start", md: "center" }}>
                <Typography variant="h2" fontWeight={700} lineHeight={1}>
                  {rating.toFixed(1)}
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <StarRoundedIcon
                      key={idx}
                      sx={{ color: "#FFB400", fontSize: 20 }}
                    />
                  ))}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {totalReviews.toLocaleString()} Reviews
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} md={9}>
              <Stack spacing={1.2}>
                {distribution.map((row) => (
                  <Stack
                    key={row.stars}
                    direction="row"
                    alignItems="center"
                    spacing={1}
                  >
                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                      sx={{ minWidth: 56 }}
                    >
                      <Typography variant="body2">{row.stars}</Typography>
                      <StarRoundedIcon
                        sx={{ color: "#FFB400", fontSize: 16 }}
                      />
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={row.percent}
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 999,
                        backgroundColor: "#E5E7EB",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 999,
                          backgroundColor: "#22C55E",
                        },
                      }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ minWidth: 40, textAlign: "right" }}
                    >
                      {row.percent}%
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Filters */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {["All", "5", "4", "3", "2", "1"].map((label, index) => {
            const isAll = label === "All";
            const chipLabel = isAll ? "All" : `${label} Star`;
            const value = isAll ? "All" : label;
            const color =
              value === activeFilter ? "primary" : "default";
            return (
              <Chip
                key={value}
                label={chipLabel}
                clickable
                color={color}
                onClick={() => setActiveFilter(value)}
                variant={value === activeFilter ? "filled" : "outlined"}
                sx={{ borderRadius: 999 }}
              />
            );
          })}
        </Stack>

        {/* Comments */}
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Comments
          </Typography>

          <Grid container spacing={3}>
            {filteredReviews.map((review) => (
              <Grid item xs={12} md={6} key={review.id}>
                <Box
                  sx={{
                    bgcolor: "#ffffff",
                    borderRadius: 3,
                    p: 3,
                    boxShadow:
                      "0px 12px 30px rgba(15, 23, 42, 0.06), 0px 0px 1px rgba(15, 23, 42, 0.08)",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    mb={1.5}
                  >
                    <Avatar>{review.avatar}</Avatar>
                    <Stack spacing={0.2}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {review.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {review.timeAgo}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Stack direction="row" spacing={0.5} mb={1}>
                    {Array.from({ length: review.rating }).map((_, idx) => (
                      <StarRoundedIcon
                        key={idx}
                        sx={{ color: "#FFB400", fontSize: 18 }}
                      />
                    ))}
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    {review.text}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Stack>
    </Box>
  );
}

export default CourseReviews;

