"use client";

import React, { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  Paper,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { greenColor } from "@/utils/Colors";

function CourseReviews({ reviews = [], loading = false, stats }) {
  const [activeFilter, setActiveFilter] = useState("All");

  const fallbackStats = useMemo(() => {
    const list = reviews || [];
    const n = list.length;
    if (!n) {
      return {
        average: 0,
        count: 0,
        distribution: [5, 4, 3, 2, 1].map((stars) => ({ stars, percent: 0 })),
      };
    }
    let sum = 0;
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    list.forEach((r) => {
      const raw = Number(r.rating);
      const rating = Number.isFinite(raw) ? raw : 0;
      sum += rating;
      const star = Math.min(5, Math.max(1, Math.round(rating)));
      counts[star] += 1;
    });
    const average = sum / n;
    const distribution = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      percent: Math.round((counts[stars] / n) * 100),
    }));
    return { average, count: n, distribution };
  }, [reviews]);

  const { average, count, distribution } = stats || fallbackStats;

  const filteredReviews = useMemo(() => {
    if (activeFilter === "All") return reviews;
    const stars = parseInt(activeFilter, 10);
    return reviews.filter((r) => {
      const raw = Number(r.rating);
      const rating = Number.isFinite(raw) ? raw : 0;
      return Math.round(rating) === stars;
    });
  }, [activeFilter, reviews]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!count) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <StarRoundedIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Reviews Yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Be the first to review this course after you enroll and complete it.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Reviews
          </Typography>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={3}>
              <Stack spacing={0.5} alignItems={{ xs: "flex-start", md: "center" }}>
                <Typography variant="h2" fontWeight={700} lineHeight={1}>
                  {average.toFixed(1)}
                </Typography>
                <Rating
                  value={average}
                  readOnly
                  precision={0.1}
                  icon={<StarRoundedIcon sx={{ color: "#FFB400" }} />}
                  emptyIcon={<StarRoundedIcon sx={{ color: "action.disabled" }} />}
                />
                <Typography variant="body2" color="text.secondary">
                  {count} {count === 1 ? "review" : "reviews"}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} md={9}>
              <Stack spacing={1.2}>
                {distribution.map((row) => (
                  <Stack key={row.stars} direction="row" alignItems="center" spacing={1}>
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 56 }}>
                      <Typography variant="body2">{row.stars}</Typography>
                      <StarRoundedIcon sx={{ color: "#FFB400", fontSize: 16 }} />
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
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40, textAlign: "right" }}>
                      {row.percent}%
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          {["All", "5", "4", "3", "2", "1"].map((label) => {
            const isAll = label === "All";
            const chipLabel = isAll ? "All" : `${label} Star`;
            const value = isAll ? "All" : label;
            const color = value === activeFilter ? "primary" : "default";
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

        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Comments
          </Typography>

          {filteredReviews.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No reviews match this filter.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {filteredReviews.map((review, index) => (
                <Grid item xs={12} md={6} key={review._id || index}>
                  <Box
                    sx={{
                      bgcolor: "#ffffff",
                      borderRadius: 3,
                      p: 3,
                      boxShadow:
                        "0px 12px 30px rgba(15, 23, 42, 0.06), 0px 0px 1px rgba(15, 23, 42, 0.08)",
                      height: "100%",
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" mb={1.5}>
                      <Avatar
                        sx={{
                          bgcolor: greenColor,
                          width: 48,
                          height: 48,
                          fontSize: "1rem",
                          fontWeight: 600,
                        }}
                      >
                        {(review.fullName || review.userId?.fullName || "U")?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Stack spacing={0.2} sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={600} noWrap title={review.fullName || review.userId?.fullName}>
                          {review.fullName || review.userId?.fullName || "Anonymous User"}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Rating
                            value={Number(review.rating) || 0}
                            readOnly
                            precision={0.5}
                            size="small"
                            icon={<StarRoundedIcon sx={{ color: "#F59E0B" }} />}
                            emptyIcon={<StarRoundedIcon sx={{ color: "action.disabled" }} />}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {review.createdAt
                              ? new Date(review.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : ""}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>

                    {review.feedback && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: review.fileUrl ? 1.5 : 0 }}>
                        {review.feedback}
                      </Typography>
                    )}

                    {review.fileUrl && (
                      <Box
                        sx={{
                          borderRadius: 1.5,
                          overflow: "hidden",
                          border: "1px solid",
                          borderColor: "divider",
                          maxWidth: "100%",
                        }}
                      >
                        <Box
                          component="img"
                          src={review.fileUrl}
                          alt="Review attachment"
                          sx={{
                            width: "100%",
                            maxHeight: 220,
                            objectFit: "cover",
                            display: "block",
                            cursor: "pointer",
                            "&:hover": { opacity: 0.92 },
                          }}
                          onClick={() => window.open(review.fileUrl, "_blank")}
                        />
                      </Box>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Stack>
    </Box>
  );
}

export default CourseReviews;
