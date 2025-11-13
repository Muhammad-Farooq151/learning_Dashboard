import Sidebar from "@/components/user/dashboard/Sidebar";
import { Box } from "@mui/material";

export default function UserLayout({ children }) {
  return (
   
     <Box display={"flex"}>
        <Box width={"18%"} position={"fixed"}>
            <Sidebar/>
        </Box>
        <Box width={"100%"} ml={"18%"}>
            {/* Navbar */}
               {children}
        </Box>
     </Box>
     
  );
}