"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  Box,
  Collapse,
  Stack,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
} from "@mui/material";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import PowerSettingsNewOutlinedIcon from "@mui/icons-material/PowerSettingsNewOutlined";
import { ClipLoader } from "react-spinners";
import { greenColor } from "@/components/utils/Colors";
import Swal from "sweetalert2";
import { clearAuthToken } from "@/utils/authStorage";
import { ADMIN_NAV_ITEMS } from "@/components/admin/navigation/navConfig";

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

function NavItem({ item, active, onNavigate, pathname }) {
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
            padding: "13px",
            color: isTreeActive ? "common.white" : "text.primary",
            bgcolor: isTreeActive ? greenColor : "transparent",
            "& .MuiListItemIcon-root": {
              minWidth: 36,
              color: isTreeActive ? "common.white" : "text.secondary",
            },
            "&:hover": {
              bgcolor: isTreeActive ? greenColor : "rgba(0,0,0,0.04)",
            },
            transition: "background-color .2s ease, color .2s ease",
          }}
        >
          <ListItemIcon sx={{ height: "22px", width: "22px" }}>
            <AdminNavIcon src={item.iconPath} active={isTreeActive} />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="body2" fontSize={"14px"} fontWeight={700}>
                {item.label}
              </Typography>
            }
          />
          {open ? (
            <ExpandLessRoundedIcon fontSize="small" />
          ) : (
            <ExpandMoreRoundedIcon fontSize="small" />
          )}
        </ListItemButton>

        <Collapse in={open} timeout="auto" unmountOnExit>
          <List disablePadding sx={{ mt: 0.5, pl: 2 }}>
            {item.children.map((child) => {
              const childActive = pathname === child.href;
              return (
                <ListItemButton
                  key={child.href}
                  onClick={() => onNavigate(child.href)}
                  sx={{
                    borderRadius: 2,
                    py: 1.1,
                    px: 1.5,
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
                      <Typography variant="body2" fontSize="13px" fontWeight={childActive ? 700 : 500}>
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
      <ListItemIcon sx={{ height: "22px", width: "22px" }}>
        <AdminNavIcon src={item.iconPath} active={active} />
      </ListItemIcon>
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

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [navLoading, setNavLoading] = useState(false);
  const [navigationStartPath, setNavigationStartPath] = useState(null);
  const [mounted, setMounted] = useState(false);
  const isLoading = navLoading;

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
    for (const n of ADMIN_NAV_ITEMS) {
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

  const handleLogoutRequest = useCallback(async () => {
    const result = await Swal.fire({
      title: 'Confirm Logout',
      text: 'Are you sure you want to logout? This will clear your saved session from this device.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      // Show loading
      Swal.fire({
        title: 'Logging out...',
        text: 'Please wait while we log you out.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        // Simulate logout process
        clearAuthToken();
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Show success
        await Swal.fire({
          icon: 'success',
          title: 'Logged Out!',
          text: 'You have been successfully logged out.',
          confirmButtonColor: greenColor,
          confirmButtonText: 'OK',
        });

        // Redirect to admin login
        router.push("/admin-login");
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Logout Failed',
          text: 'Failed to logout. Please try again.',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK',
        });
      }
    }
  }, [router]);

  return (
    <>
      <Box
        sx={{
          height: "100dvh",
          borderColor: "divider",
          position: "sticky",
          top: 0,
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          px: 1,
          py: 1.5,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{ px: 1, mb: 1.5, letterSpacing: 0.4, flexShrink: 0 }}
        >
          LEARNING HUB
        </Typography>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            pr: 0.5,
            mr: -0.5,
            scrollbarWidth: "thin",
            scrollbarColor: "#CBD5E1 transparent",
            "&::-webkit-scrollbar": {
              width: 6,
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#CBD5E1",
              borderRadius: 999,
            },
          }}
        >
          <List disablePadding sx={{ px: 0.5 }}>
            {ADMIN_NAV_ITEMS.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                active={activeKey === item.href}
                onNavigate={onNavigate}
                pathname={pathname}
              />
            ))}
          </List>
        </Box>

        <Stack
          direction="row"
          alignItems="center"
          sx={{
            px: 1,
            pb: 0.5,
            pt: 1.5,
            mt: 1,
            borderTop: "1px solid",
            borderColor: "divider",
            flexShrink: 0,
            bgcolor: "background.paper",
          }}
        >
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

      {/* Full-viewport overlay loader - Revamped with Portal (Light Background) */}
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
