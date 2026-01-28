import AdminSidebar from "@/components/admin/bars/AdminSidebar";
import { Box } from "@mui/material";
// import AdminSidebar from "@/components/admin/AdminSidebar";

export default function WebLayout({ children }) {
    return (
      <Box display={"flex"}>
        <Box width={["0%","0%","18%"]} position={"fixed"} sx={{display:["none","none","block"]}}>
            <AdminSidebar/>
        </Box>
        <Box width={"100%"} ml={["0%","0%","18%"]} >
            {/* Navbar */}
               {children}
        </Box>
     </Box>
    );
  }
  