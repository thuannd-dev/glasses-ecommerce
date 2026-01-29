import { Outlet } from "react-router";
import { Box } from "@mui/material";

export default function AuthLayout() {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                width: "100vw",
                overflow: "hidden",
                display: "flex",
            }}
        >
            <Outlet />
        </Box>
    );
}
