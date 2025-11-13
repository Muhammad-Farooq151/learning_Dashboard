"use client";

import React, { useMemo, useState } from "react";
import {
  Box,
  Chip,
  FormControl,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import Link from "next/link";
import { courses } from "@/data/courses";

const levelFilters = ["All Level", "Beginner", "Intermediate", "Advanced"];
const categoryFilters = [
  "All Categories",
  "Programming",
  "Data Science",
  "AI/ML",
  "Design",
  "Data",
];

function ExploreCourses() {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState(levelFilters[0]);
  const [category, setCategory] = useState(categoryFilters[0]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase());
      const matchesLevel =
        level === "All Level" || course.level === level;
      const matchesCategory =
        category === "All Categories" || course.category === category;

      return matchesSearch && matchesLevel && matchesCategory;
    });
  }, [search, level, category]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "1200px", mx: "auto" }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Courses
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={1}>
            Explore curated courses tailored to your interests and skill level.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <TextField
            placeholder="Search here"
            size="small"
            fullWidth
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            width={{ xs: "100%", md: "auto" }}
          >
            <FormControl size="small" fullWidth>
              <Select
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                displayEmpty
              >
                {levelFilters.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <Select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                displayEmpty
              >
                {categoryFilters.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          {filteredCourses.map((course) => (
            <Grid key={course.id} size={{xs:12,sm:6,lg:4}}>
              <Box
                component={Link}
                href={`/user/explore-courses/${course.id}`}
                sx={{ textDecoration: "none" }}
              >
                <Box
                  sx={{
                    bgcolor: "#ffffff",
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow:
                      "0px 12px 30px rgba(15, 23, 42, 0.08), 0px 0px 1px rgba(15, 23, 42, 0.08)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow:
                        "0px 16px 40px rgba(15, 23, 42, 0.12), 0px 0px 1px rgba(15, 23, 42, 0.16)",
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={course.image}
                    alt={course.title}
                    sx={{
                      width: "100%",
                      height: 200,
                      objectFit: "cover",
                    }}
                  />

                  <Box sx={{ p: 3, display: "flex", flexDirection: "column", flex: 1 }}>
                    <Stack direction="row" spacing={1} mb={1}>
                      <Chip
                        label={course.level}
                        size="small"
                        sx={{ fontWeight: 600, textTransform: "uppercase" }}
                      />
                      <Chip label={course.category} size="small" variant="outlined" />
                    </Stack>

                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {course.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      {course.description}
                    </Typography>

<Grid container spacing={2} justifyContent="space-between">
<Grid size={{xs:12,md:3}}>
                      <Typography variant="body2" color="text.primary">
                        {course.duration}
                      </Typography>
                    </Grid>
          |
                    {/* <Grid size={{xs:12,md:3}} display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" color="text.primary">
                        {course.lessons} 
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                      lessons
                      </Typography>
                    </Grid> */}
                    <Grid size={{xs:12,md:3}} display="flex" alignItems="center" gap={1}>
                    <PeopleAltRoundedIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {course.students.toLocaleString()}
                      </Typography>
                    </Grid>
                    |
                    <Grid size={{xs:12,md:3}} display="flex" alignItems="center" gap={1}>
                    <StarRoundedIcon fontSize="small" sx={{ color: "#FFB400" }} />
                      <Typography variant="body2" color="text.secondary">
                        {course.rating.toFixed(1)}
                      </Typography>
                    </Grid>
    </Grid>                  
      {/* <Stack direction="row" spacing={2} justifyContent="space-between">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AccessTimeRoundedIcon fontSize="small" color="primary" />
                        <Typography variant="body2" color="text.primary">
                          {course.duration}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <PlayCircleFilledRoundedIcon fontSize="small" color="primary" />
                        <Typography variant="body2" color="text.primary">
                          {course.lessons} lessons
                        </Typography>
                      </Stack>
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={2}
                      justifyContent="space-between"
                      mt={2}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PeopleAltRoundedIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {course.students.toLocaleString()}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <StarRoundedIcon fontSize="small" sx={{ color: "#FFB400" }} />
                        <Typography variant="body2" color="text.secondary">
                          {course.rating.toFixed(1)}
                        </Typography>
                      </Stack>
                    </Stack> */}
                    
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}

          {!filteredCourses.length && (
            <Grid size={{xs:12}}>
              <Box
                sx={{
                  borderRadius: 3,
                  border: "1px dashed",
                  borderColor: "divider",
                  p: 6,
                  textAlign: "center",
                  color: "text.secondary",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  No courses found
                </Typography>
                <Typography variant="body2">
                  Try adjusting your search or filter criteria.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Stack>
    </Box>
  );
}

export default ExploreCourses;