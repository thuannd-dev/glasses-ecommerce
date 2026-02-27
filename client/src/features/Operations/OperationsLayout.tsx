import { Box } from "@mui/material";
import { Outlet } from "react-router";

import { OperationsProvider } from "./context/OperationsContext";

export default function OperationsLayout() {
  return (
    <OperationsProvider>
      <Box
        sx={{
          px: { xs: 2, md: 4, lg: 6 },
          py: 4,
          bgcolor: "#fafafa",
          color: "rgba(0,0,0,0.87)",
          minHeight: "100%",
        }}
      >
        <Outlet />
      </Box>
    </OperationsProvider>
  );
}
