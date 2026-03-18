"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import PowerSettingsNewOutlinedIcon from "@mui/icons-material/PowerSettingsNewOutlined";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { clearAuthToken } from "@/utils/authStorage";
import { greenColor, grayColor } from "@/utils/Colors";
import { getUserRouteMeta, USER_NAV_ITEMS } from "@/components/user/navigation/navConfig";

function MobileNavItem({ item, active, onNavigate }) {
  return (
    <ListItemButton
      onClick={() => onNavigate(item.href)}
      sx={{
        borderRadius: 2,
        px: 1.5,
        py: 1.25,
        mb: 0.5,
        bgcolor: active ? greenColor : "transparent",
        color: active ? "common.white" : "text.primary",
        "& .MuiListItemIcon-root": {
          minWidth: 38,
          color: active ? "common.white" : "text.secondary",
        },
        "&:hover": {
          bgcolor: active ? greenColor : "rgba(0,0,0,0.04)",
        },
      }}
    >
      <ListItemIcon>{item.icon}</ListItemIcon>
      <ListItemText
        primary={
          <Typography fontSize="0.95rem" fontWeight={active ? 700 : 500}>
            {item.label}
          </Typography>
        }
      />
      <ChevronRightRoundedIcon sx={{ color: active ? "#fff" : "#94A3B8" }} />
    </ListItemButton>
  );
}

function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navLoading, setNavLoading] = useState(false);
  const [navigationStartPath, setNavigationStartPath] = useState(null);

  const routeMeta = useMemo(() => getUserRouteMeta(pathname), [pathname]);

  useEffect(() => {
    if (navLoading && navigationStartPath !== null && pathname !== navigationStartPath) {
      setNavLoading(false);
      setNavigationStartPath(null);
      setDrawerOpen(false);
    }
  }, [pathname, navLoading, navigationStartPath]);

  useEffect(() => {
    if (!navLoading) return undefined;

    const timeout = setTimeout(() => {
      setNavLoading(false);
      setNavigationStartPath(null);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [navLoading]);

  const handleNavigate = useCallback(
    (href) => {
      if (href === pathname) {
        setDrawerOpen(false);
        return;
      }

      setNavigationStartPath(pathname);
      setNavLoading(true);
      router.push(href);
    },
    [pathname, router]
  );

  const handleLogout = useCallback(async () => {
    setNavLoading(true);
    setDrawerOpen(false);

    try {
      clearAuthToken();
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      setNavLoading(false);
      toast.error("Failed to logout. Please try again.");
    }
  }, [router]);

  return (
    <>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 2.5 },
          bgcolor: "#fff",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <IconButton
            onClick={() => setDrawerOpen(true)}
            sx={{
              display: { xs: "inline-flex", md: "none" },
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "#fff",
              color: "text.primary",
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.03)",
              },
            }}
          >
            <MenuRoundedIcon />
          </IconButton>

          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: "20px", sm: "22px", md: "24px" },
              fontWeight: 600,
              color: grayColor,
              whiteSpace: "nowrap",
            }}
          >
            {routeMeta.title}
          </Typography>
        </Stack>
      </Box>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        disableScrollLock
        PaperProps={{
          sx: {
            width: 310,
            borderTopRightRadius: 20,
            borderBottomRightRadius: 20,
            p: 2,
            bgcolor: "#fff",
          },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={800} color="text.primary">
            LEARNING HUB
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>

        <List disablePadding>
          {USER_NAV_ITEMS.map((item) => (
            <MobileNavItem
              key={item.href}
              item={item}
              active={pathname?.startsWith(item.href)}
              onNavigate={handleNavigate}
            />
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Button
          onClick={handleLogout}
          startIcon={<PowerSettingsNewOutlinedIcon />}
          sx={{
            justifyContent: "flex-start",
            textTransform: "none",
            borderRadius: 2,
            px: 1.5,
            py: 1.2,
            color: "#b42318",
            fontWeight: 700,
            "&:hover": {
              bgcolor: "rgba(180, 35, 24, 0.06)",
            },
          }}
        >
          Logout
        </Button>
      </Drawer>

      <Backdrop
        open={navLoading}
        sx={{
          zIndex: 9999,
          bgcolor: "rgba(255,255,255,0.72)",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress sx={{ color: greenColor }} thickness={4.5} />
          <Typography sx={{ color: "#0f172a", fontWeight: 700 }}>
            Loading your page...
          </Typography>
        </Stack>
      </Backdrop>
    </>
  );
}

export default Navbar;