"use client";

import AdminSidebar from "@/components/admin/bars/AdminSidebar";
import { Box, CircularProgress, Typography, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, getStoredToken } from "@/utils/authStorage";
import AdminNavbar from "@/components/admin/bars/AdminNavbar";

export default function WebLayout({ children }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminAccess = () => {
      try {
        const token = getStoredToken();
        const user = getStoredUser();

        // Check if user is logged in
        if (!token || !user) {
          router.push("/admin-login");
          return;
        }

        // Check if user has admin role
        if (user.role !== 'admin') {
          router.push("/admin-login");
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Error checking admin access:", error);
        router.push("/admin-login");
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminAccess();
  }, [router]);

  if (isChecking) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary">
            Verifying admin access...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect to admin-login
  }

  return (
    <Box display={"flex"}>
      <Box width={["0%","0%","18%"]} position={"fixed"} sx={{display:["none","none","block"]}}>
        <AdminSidebar/>
      </Box>
      <Box width={"100%"} ml={["0%","0%","18%"]} >
        {/* Navbar */}
        <AdminNavbar/>
        {children}
      </Box>
    </Box>
  );
}
  