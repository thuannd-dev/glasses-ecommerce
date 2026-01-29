import { Box, Typography } from "@mui/material";

export function EmptyState() {
    return (
        <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography sx={{ fontWeight: 900, fontSize: 18, color: "#111827" }}>
                No items found
            </Typography>
            <Typography sx={{ mt: 0.6, color: "rgba(17,24,39,0.6)" }}>
                Try changing filters or keyword.
            </Typography>
        </Box>
    );
}
