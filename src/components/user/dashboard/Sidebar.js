"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
      component="a"
      href={item.href}
      onClick={(e) => {
        e.preventDefault();           // use client navigation + show loader
        onNavigate(item.href);
      }}
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
  const [loading, setLoading] = useState(false);

  const activeKey = useMemo(() => {
    let best = "";
    for (const n of NAV) {
      if (pathname?.startsWith(n.href) && n.href.length > best.length) best = n.href;
    }
    return best;
  }, [pathname]);

  // hide loader when route (pathname) changes
  useEffect(() => {
    if (loading) setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const onNavigate = useCallback(
    (href) => {
      if (href === pathname) return; // no-op if already there
      setLoading(true);
      router.push(href);
    },
    [router, pathname]
  );

  const handleLogout = () => {
    // TODO: clear auth, call API, remove tokens, etc.
    setLoading(true);
    router.push("/"); // go to login
  };

  return (
    <>
      <Box
        sx={{
          // width: 240,
          minWidth: 240,
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
            onClick={handleLogout}
            size="small"
            sx={{
              mr: 1,
              bgcolor: "rgba(0,0,0,0.04)",
              ":hover": { bgcolor: "rgba(0,0,0,0.06)" },
            }}
          >
            <PowerSettingsNewOutlinedIcon fontSize="small" />
          </IconButton>
          <Typography variant="body2" sx={{ cursor: "pointer" }} onClick={handleLogout}>
            Logout
          </Typography>
        </Stack>
      </Box>

      {/* Full-viewport overlay loader (same page) */}
      {loading && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "grid",
            placeItems: "center",
            backgroundColor: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(1.5px)",
          }}
        >
          <ClipLoader size={60} color={greenColor} />
        </Box>
      )}
    </>
  );
}
