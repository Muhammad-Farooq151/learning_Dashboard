"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  Box,
  Stack,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PowerSettingsNewOutlinedIcon from "@mui/icons-material/PowerSettingsNewOutlined";
import { ClipLoader } from "react-spinners";
import { greenColor } from "@/components/utils/Colors";
import { toast } from "react-hot-toast";
import { clearAuthToken } from "@/utils/authStorage";

const NAV = [
  { label: "Dashboard", href: "/user/dashboard", icon: <DashboardRoundedIcon /> },
  { label: "My Learnings", href: "/user/my-leaning", icon: <MenuBookOutlinedIcon /> },
  { label: "Certificates", href: "/user/certifications", icon: <WorkspacePremiumOutlinedIcon /> },
  { label: "AI Tutor", href: "/user/ai-tutor", icon: <AutoAwesomeOutlinedIcon /> },
  { label: "Explore Courses", href: "/user/explore-courses", icon: <ExploreOutlinedIcon /> },
  { label: "Settings", href: "/user/settings", icon: <SettingsOutlinedIcon /> },
];

function NavItem({ item, active, onNavigate }) {
  return (
    <ListItemButton
      onClick={() => onNavigate(item.href)}
      sx={{
        position: "relative",
        borderRadius: 2,
        // px: 1.25,
        // py: 1.1,
        padding:"13px",
        mb: 0.5,
        color: active ? "common.white" : "text.primary",
        bgcolor: active ? greenColor : "transparent",
        "& .MuiListItemIcon-root": {
          minWidth: 36,
          color: active ? "common.white" : "text.secondary",
        },
        "&:hover": {
          bgcolor: active ? greenColor : "rgba(0,0,0,0.04)",
        },
        transition: "background-color .2s ease, color .2s ease",
        "&::before": active
          ? {
              content: '""',
              position: "absolute",
              left: -8,
              top: 8,
              bottom: 8,
              width: 4,
              borderRadius: 999,
              backgroundColor: greenColor,
            }
          : {},
      }}
    >
      <ListItemIcon sx={{height:"22px",width:"22px"}}>{item.icon}</ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="body2" fontSize={"14px"} fontWeight={active ? 600 : 500}>
            {item.label}
          </Typography>
        }
      />
    </ListItemButton>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [navLoading, setNavLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [navigationStartPath, setNavigationStartPath] = useState(null);
  const [mounted, setMounted] = useState(false);
  const isLoading = navLoading || logoutLoading;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when loading
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [isLoading]);

  const activeKey = useMemo(() => {
    let best = "";
    for (const n of NAV) {
      if (pathname?.startsWith(n.href) && n.href.length > best.length) best = n.href;
    }
    return best;
  }, [pathname]);

  // hide loader only when route (pathname) actually changes
  useEffect(() => {
    if (navLoading && navigationStartPath !== null) {
      // Only turn off loader if pathname has actually changed from when navigation started
      if (pathname !== navigationStartPath) {
        setNavLoading(false);
        setNavigationStartPath(null);
      }
    }
  }, [pathname, navLoading, navigationStartPath]);

  // Timeout fallback in case navigation fails completely
  useEffect(() => {
    if (navLoading) {
      const timeout = setTimeout(() => {
        // If still loading after 5 seconds, turn off loader (navigation might have failed)
        if (navLoading) {
          setNavLoading(false);
          setNavigationStartPath(null);
        }
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [navLoading]);

  const onNavigate = useCallback(
    (href) => {
      if (href === pathname) {
        // Already on this route, no navigation needed
        return;
      }
      // Store current pathname before navigation
      setNavigationStartPath(pathname);
      setNavLoading(true);
      router.push(href);
    },
    [router, pathname]
  );

  const handleLogoutRequest = () => setConfirmOpen(true);
  const handleCancelLogout = () => {
    if (!logoutLoading) setConfirmOpen(false);
  };

  const performLogout = useCallback(async () => {
    setConfirmOpen(false);
    setLogoutLoading(true);
    try {
      clearAuthToken();
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      setLogoutLoading(false);
      toast.error("Failed to logout. Please try again.");
    }
  }, [router]);

  return (
    <>
      <Box
        sx={{
          // width: 240,
          // minWidth: 240,
          height: "100dvh",
          // borderRight: "1px solid",
          borderColor: "divider",
          position: "sticky",
          top: 0,
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          px: 0.5,
          py: 1.5,
        }}
      >
        {/* Brand */}
        <Typography variant="h6" fontWeight={800} sx={{ px: 1, mb: 1, letterSpacing: 0.4 }}>
          LEARNING HUB
        </Typography>

        {/* <Divider sx={{ mb: 1 }} /> */}

        {/* Nav */}
        <List disablePadding sx={{ px: 0.5 }}>
          {NAV.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              active={activeKey === item.href}
              onNavigate={onNavigate}
            />
          ))}
        </List>

        <Box sx={{ flexGrow: 1 }} />

        {/* Logout */}
        <Stack direction="row" alignItems="center" sx={{ px: 1, pb: 1, pt: 0.5 }}>
          <IconButton
            onClick={handleLogoutRequest}
            size="small"
            sx={{
              mr: 1,
              bgcolor: "rgba(0,0,0,0.04)",
              ":hover": { bgcolor: "rgba(0,0,0,0.06)" },
            }}
          >
            <PowerSettingsNewOutlinedIcon fontSize="small" />
          </IconButton>
          <Typography variant="body2" sx={{ cursor: "pointer" }} onClick={handleLogoutRequest}>
            Logout
          </Typography>
        </Stack>
      </Box>

      <Dialog open={confirmOpen} onClose={handleCancelLogout} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText color="text.primary">
            Are you sure you want to logout? This will clear your saved session from this device.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancelLogout} sx={{ textTransform: "none" }} disabled={logoutLoading}>
            Cancel
          </Button>
          <Button
            onClick={performLogout}
            variant="contained"
            color="error"
            sx={{ textTransform: "none" }}
            disabled={logoutLoading}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Full-viewport overlay loader - Revamped with Portal */}
      {isLoading && mounted && createPortal(
        <Box
          component="div"
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 999999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            pointerEvents: "all",
            isolation: "isolate",
            overflow: "hidden",
            // Ensure it's above everything
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.6)",
              zIndex: -1,
            },
          }}
          style={{
            zIndex: 999999,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              pointerEvents: "auto",
              position: "relative",
              zIndex: 1000000,
            }}
          >
            <ClipLoader size={60} color={greenColor} />
            <Typography
              variant="body2"
              sx={{
                color: greenColor,
                fontWeight: 600,
                animation: "pulse 2s ease-in-out infinite",
                "@keyframes pulse": {
                  "0%, 100%": {
                    opacity: 1,
                  },
                  "50%": {
                    opacity: 0.5,
                  },
                },
              }}
            >
              Loading...
            </Typography>
          </Box>
        </Box>,
        document.body
      )}
    </>
  );
}
