import { Box } from "@mui/material";
import type { ReactNode } from "react";

const NAV_H = 56;
const FOOT_H = 0; // nếu footer fixed thì set chiều cao ở đây

export default function PageShell({ children }: { children: ReactNode }) {
    return (
        <Box
            component="main"
            sx={{
                pt: `${NAV_H}px`,
                pb: `${FOOT_H}px`,
                minHeight: `calc(100vh - ${NAV_H + FOOT_H}px)`,
                bgcolor: "#fff",
            }}
        >
            {children}
        </Box>
    );
}
