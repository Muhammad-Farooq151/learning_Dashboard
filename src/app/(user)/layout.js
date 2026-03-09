"use client";

import Sidebar from "@/components/user/dashboard/Sidebar";
import { Box } from "@mui/material";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkTokenExpiry, getStoredToken } from "@/utils/authStorage";
import Swal from "sweetalert2";
import Navbar from "@/components/user/bars/Navbar";

export default function UserLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    // Check token expiry on mount and periodically
    const checkAuth = () => {
      const token = getStoredToken();
      if (!token || !checkTokenExpiry()) {
        Swal.fire({
          icon: 'warning',
          title: 'Session Expired',
          text: 'Your session has expired. Please login again.',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Go to Login',
        }).then(() => {
          router.push('/');
        });
        return;
      }
    };

    // Check immediately
    checkAuth();

    // Check every 5 minutes
    const interval = setInterval(checkAuth, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <Box display={"flex"}>
      <Box width={["0%","0%","18%"]} position={"fixed"} sx={{display:["none","none","block"]}}>
        <Sidebar />
      </Box>
      <Box width={["100%","100%","82%"]} ml={["0%","0%","18%"]} >
        {/* Navbar */}
        <Navbar/>
       <Box p={2}>{children}</Box>
      </Box>
    </Box>
  );
}