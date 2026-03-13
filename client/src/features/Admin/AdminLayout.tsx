import { Box } from "@mui/material";
import { Outlet } from "react-router";

export default function AdminLayout() {
  return (
    <Box
      sx={{
        px: { xs: 2, md: 4, lg: 6 },
        py: 4,
        bgcolor: "#FAFAF8",
        color: "#171717",
        minHeight: "100%",
      }}
    >
      <Outlet />
    </Box>
  );
}
