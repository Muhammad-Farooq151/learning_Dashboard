"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

const quickLinks = [
  {
    title: "Go to Login",
    description: "Return to the main login screen and sign in from the primary entry point.",
    href: "/",
    icon: LockOpenRoundedIcon,
  },
  {
    title: "Go to Dashboard",
    description: "Open your learning dashboard and continue from where you left off.",
    href: "/user/dashboard",
    icon: DashboardRoundedIcon,
  },
  {
    title: "Go to Sign Up",
    description: "Create a new account and start using the platform with a fresh profile.",
    href: "/signup",
    icon: PersonAddAlt1RoundedIcon,
  },
];

export default function NotFound() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        bgcolor: "#f4fbf8",
        background:
          "radial-gradient(circle at top left, rgba(76,188,153,0.24) 0%, transparent 28%), radial-gradient(circle at bottom right, rgba(50,157,123,0.18) 0%, transparent 30%), linear-gradient(180deg, #f7fffc 0%, #eef8f4 100%)",
        py: { xs: 5, md: 8 },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: "auto auto 8% 4%",
          width: 220,
          height: 220,
          borderRadius: "50%",
          bgcolor: "rgba(76,188,153,0.16)",
          filter: "blur(10px)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: "8% 6% auto auto",
          width: 280,
          height: 280,
          borderRadius: "50%",
          bgcolor: "rgba(50,157,123,0.14)",
          filter: "blur(18px)",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: { xs: 4, md: 8 },
            border: "1px solid rgba(50,157,123,0.14)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,255,252,0.98) 100%)",
            backdropFilter: "blur(18px)",
            boxShadow: "0 30px 80px rgba(17, 38, 31, 0.14)",
            overflow: "hidden",
          }}
        >
          <Grid container>
            <Grid size={{ xs: 12, md: 7 }}>
              <Box sx={{ p: { xs: 3, sm: 4, md: 6 } }}>
                <Stack spacing={3}>
                  <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                    <Chip
                      icon={<ErrorOutlineRoundedIcon />}
                      label="Page Not Found"
                      sx={{
                        px: 1,
                        fontWeight: 700,
                        bgcolor: "rgba(76,188,153,0.12)",
                        color: "#1f6f58",
                        borderRadius: "999px",
                        "& .MuiChip-icon": {
                          color: "#329d7b",
                        },
                      }}
                    />
                    <Chip
                      label="Error 404"
                      variant="outlined"
                      sx={{
                        fontWeight: 700,
                        color: "#2d5448",
                        borderColor: "rgba(50,157,123,0.2)",
                        bgcolor: "rgba(255,255,255,0.7)",
                      }}
                    />
                  </Stack>

                  <Box>
                    <Typography
                      variant="h1"
                      sx={{
                        fontSize: { xs: "3.6rem", sm: "4.8rem", md: "6rem" },
                        lineHeight: 0.95,
                        fontWeight: 800,
                        color: "#329d7b",
                        letterSpacing: "-0.05em",
                        mb: 1,
                      }}
                    >
                      404
                    </Typography>
                    <Typography
                      variant="h3"
                      sx={{
                        fontSize: { xs: "2rem", md: "3rem" },
                        lineHeight: 1.05,
                        fontWeight: 800,
                        color: "#10221b",
                        maxWidth: 620,
                      }}
                    >
                      This page could not be found, but the right next step is below.
                    </Typography>
                  </Box>

                  <Typography
                    variant="body1"
                    sx={{
                      maxWidth: 680,
                      color: "#4a5f58",
                      fontSize: { xs: "1rem", md: "1.06rem" },
                      lineHeight: 1.9,
                    }}
                  >
                    The route you opened is not available in the client app. Use one of these
                    quick actions to go back to login, continue to your dashboard, or create a new
                    account.
                  </Typography>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <Button
                      component={Link}
                      href="/"
                      variant="contained"
                      endIcon={<ArrowForwardRoundedIcon />}
                      sx={{
                        minHeight: 54,
                        px: 3,
                        borderRadius: 3,
                        textTransform: "none",
                        fontSize: "1rem",
                        fontWeight: 700,
                        bgcolor: "#329d7b",
                        boxShadow: "0 14px 30px rgba(50,157,123,0.28)",
                        "&:hover": {
                          bgcolor: "#2b8a6c",
                          boxShadow: "0 18px 36px rgba(50,157,123,0.32)",
                        },
                      }}
                    >
                      Go to Login
                    </Button>

                    <Button
                      component={Link}
                      href="/user/dashboard"
                      variant="outlined"
                      sx={{
                        minHeight: 54,
                        px: 3,
                        borderRadius: 3,
                        textTransform: "none",
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "#163228",
                        borderColor: "rgba(50,157,123,0.22)",
                        bgcolor: "rgba(255,255,255,0.82)",
                        "&:hover": {
                          borderColor: "#329d7b",
                          bgcolor: "#f4fffb",
                        },
                      }}
                    >
                      Go to Dashboard
                    </Button>

                    <Button
                      component={Link}
                      href="/signup"
                      variant="text"
                      sx={{
                        minHeight: 54,
                        px: 1.5,
                        borderRadius: 3,
                        textTransform: "none",
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "#329d7b",
                        "&:hover": {
                          bgcolor: "rgba(50,157,123,0.08)",
                        },
                      }}
                    >
                      Go to Sign Up
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  height: "100%",
                  p: { xs: 3, sm: 4, md: 5 },
                  background:
                    "linear-gradient(180deg, rgba(50,157,123,0.08) 0%, rgba(255,255,255,0.56) 100%)",
                  borderLeft: { xs: "none", md: "1px solid rgba(50,157,123,0.10)" },
                }}
              >
                <Stack spacing={2}>
                  {quickLinks.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <Card
                        key={item.title}
                        elevation={0}
                        sx={{
                          borderRadius: 4,
                          p: 2.25,
                          border: "1px solid rgba(50,157,123,0.12)",
                          bgcolor: index === 0 ? "#ecfbf5" : "rgba(255,255,255,0.86)",
                          boxShadow: "0 12px 30px rgba(18, 36, 30, 0.06)",
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Box
                            sx={{
                              width: 52,
                              height: 52,
                              display: "grid",
                              placeItems: "center",
                              borderRadius: 3,
                              bgcolor: "rgba(50,157,123,0.12)",
                              color: "#329d7b",
                              flexShrink: 0,
                            }}
                          >
                            <Icon />
                          </Box>

                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: "#173127" }}>
                              {item.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ mt: 0.75, color: "#567168", lineHeight: 1.8 }}
                            >
                              {item.description}
                            </Typography>
                            <Button
                              component={Link}
                              href={item.href}
                              size="small"
                              endIcon={<ArrowForwardRoundedIcon />}
                              sx={{
                                mt: 1.5,
                                px: 0,
                                minWidth: 0,
                                textTransform: "none",
                                fontWeight: 700,
                                color: "#329d7b",
                                "&:hover": {
                                  bgcolor: "transparent",
                                  color: "#256f57",
                                },
                              }}
                            >
                              Open
                            </Button>
                          </Box>
                        </Stack>
                      </Card>
                    );
                  })}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Container>
    </Box>
  );
}
