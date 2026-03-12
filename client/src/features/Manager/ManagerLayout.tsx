import { Box } from "@mui/material";
import { Outlet } from "react-router";

export default function ManagerLayout() {
  return (
    <Box
      sx={{
        bgcolor: "#FAFAF8",
        color: "#171717",
        minHeight: "100%",
      }}
    >
      <Outlet />
    </Box>
  );
}
