import { Box } from "@mui/material";
import { Outlet } from "react-router";
import { SalesProvider } from "./context/SalesContext";

export default function SalesLayout() {
  return (
    <SalesProvider>
      <Box
        sx={{
          bgcolor: "#fafafa",
          color: "rgba(0,0,0,0.87)",
          minHeight: "100%",
        }}
      >
        <Outlet />
      </Box>
    </SalesProvider>
  );
}

