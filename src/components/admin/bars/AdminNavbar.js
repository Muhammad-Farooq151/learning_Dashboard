"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Backdrop,
  Box,
  Button,
  Collapse,
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
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import PowerSettingsNewOutlinedIcon from "@mui/icons-material/PowerSettingsNewOutlined";
import { usePathname, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { clearAuthToken } from "@/utils/authStorage";
import { greenColor } from "@/components/utils/Colors";
import {
  ADMIN_NAV_ITEMS,
  getAdminRouteTitle,
} from "@/components/admin/navigation/navConfig";

function AdminNavIcon({ src, active }) {
  return (
    <Box
      sx={{
        width: 22,
        height: 22,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: "22px",
          height: "22px",
          display: "block",
          bgcolor: active ? "#FFFFFF" : "#000000",
          WebkitMaskImage: `url(${src})`,
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          WebkitMaskSize: "contain",
          maskImage: `url(${src})`,
          maskRepeat: "no-repeat",
          maskPosition: "center",
          maskSize: "contain",
        }}
      />
    </Box>
  );
}

function MobileNavItem({ item, active, onNavigate, pathname }) {
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const isTreeActive = hasChildren && item.children.some((child) => pathname === child.href);
  const [open, setOpen] = useState(isTreeActive);

  useEffect(() => {
    if (isTreeActive) {
      setOpen(true);
    }
  }, [isTreeActive]);

  if (hasChildren) {
    return (
      <Box sx={{ mb: 0.5 }}>
        <ListItemButton
          onClick={() => setOpen((prev) => !prev)}
          sx={{
            borderRadius: 2,
            px: 1.5,
            py: 1.25,
            bgcolor: isTreeActive ? greenColor : "transparent",
            color: isTreeActive ? "common.white" : "text.primary",
            "& .MuiListItemIcon-root": {
              minWidth: 38,
              color: isTreeActive ? "common.white" : "text.secondary",
            },
            "&:hover": {
              bgcolor: isTreeActive ? greenColor : "rgba(0,0,0,0.04)",
            },
          }}
        >
          <ListItemIcon>
            <AdminNavIcon src={item.iconPath} active={isTreeActive} />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography fontSize="0.95rem" fontWeight={700}>
                {item.label}
              </Typography>
            }
          />
          {open ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
        </ListItemButton>

        <Collapse in={open} timeout="auto" unmountOnExit>
          <List disablePadding sx={{ pl: 2, mt: 0.5 }}>
            {item.children.map((child) => {
              const childActive = pathname === child.href;
              return (
                <ListItemButton
                  key={child.href}
                  onClick={() => onNavigate(child.href)}
                  sx={{
                    borderRadius: 2,
                    px: 1.5,
                    py: 1.1,
                    mb: 0.5,
                    bgcolor: childActive ? "rgba(50, 157, 123, 0.12)" : "transparent",
                    color: childActive ? greenColor : "text.secondary",
                    "&:hover": {
                      bgcolor: childActive ? "rgba(50, 157, 123, 0.16)" : "rgba(0,0,0,0.04)",
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography fontSize="0.88rem" fontWeight={childActive ? 700 : 500}>
                        {child.label}
                      </Typography>
                    }
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Collapse>
      </Box>
    );
  }

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
      <ListItemIcon>
        <AdminNavIcon src={item.iconPath} active={active} />
      </ListItemIcon>
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

function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navLoading, setNavLoading] = useState(false);
  const [navigationStartPath, setNavigationStartPath] = useState(null);

  const routeTitle = useMemo(() => getAdminRouteTitle(pathname), [pathname]);

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
    const result = await Swal.fire({
      title: "Confirm Logout",
      text: "Are you sure you want to logout from the admin panel?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    setNavLoading(true);
    setDrawerOpen(false);

    try {
      clearAuthToken();
      await new Promise((resolve) => setTimeout(resolve, 600));
      router.push("/admin-login");
    } catch (error) {
      setNavLoading(false);
      Swal.fire({
        icon: "error",
        title: "Logout Failed",
        text: "Failed to logout. Please try again.",
        confirmButtonColor: "#d33",
      });
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
              fontSize: { xs: "1.3rem", sm: "1.6rem", md: "2rem" },
              fontWeight: 700,
              color: "text.primary",
              whiteSpace: "nowrap",
            }}
          >
            {routeTitle}
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
          {ADMIN_NAV_ITEMS.map((item) => (
            <MobileNavItem
              key={item.href}
              item={item}
              active={pathname?.startsWith(item.href)}
              onNavigate={handleNavigate}
              pathname={pathname}
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

export default AdminNavbar;