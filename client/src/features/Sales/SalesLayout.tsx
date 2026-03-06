import { Box } from "@mui/material";
import { Outlet } from "react-router";
import { SalesProvider } from "./context/SalesContext";

export default function SalesLayout() {
  return (
    <SalesProvider>
      <Box
        sx={{
          bgcolor: "#FAFAF8",
          color: "#171717",
          minHeight: "100%",
        }}
      >
        <Outlet />
      </Box>
    </SalesProvider>
  );
}

