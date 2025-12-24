import AdminSidebar from "@/components/admin/bars/AdminSidebar";
import { Box } from "@mui/material";
// import AdminSidebar from "@/components/admin/AdminSidebar";

export default function WebLayout({ children }) {
    return (
      <Box display={"flex"}>
        <Box width={"18%"} position={"fixed"}>
            <AdminSidebar/>
        </Box>
        <Box width={"100%"} ml={"18%"}>
            {/* Navbar */}
               {children}
        </Box>
     </Box>
    );
  }
  