import { Box } from "@mui/material";
import { Outlet } from "react-router";

export default function ManagerLayout() {
  return (
    <Box
      sx={{
        bgcolor: "#fafafa",
        color: "rgba(0,0,0,0.87)",
        minHeight: "100%",
      }}
    >
      <Outlet />
    </Box>
  );
}
