import { Box, Paper, Typography } from "@mui/material";
import type { LensSelectionOption } from "../../../../../lib/types/lensSelection";

type Props = {
    onSelect: (option: LensSelectionOption) => void;
};

const cardSx = {
    p: 3,
    width: "100%",
    boxSizing: "border-box",
    cursor: "pointer",
    borderRadius: 2,
    border: "2px solid",
    borderColor: "rgba(17,24,39,0.12)",
    bgcolor: "#fff",
    transition: "border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
    "&:hover": {
        borderColor: "#111827",
        boxShadow: "0 12px 40px rgba(17,24,39,0.08)",
        transform: "translateY(-2px)",
    },
} as const;

export function PrescriptionModeSelector({ onSelect }: Props) {
    return (
        <Box sx={{ width: "100%" }}>
            <Typography fontWeight={800} fontSize={{ xs: 20, sm: 22 }} sx={{ mb: 0.75, color: "#111827" }}>
                How will you use these lenses?
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3, fontSize: 14, lineHeight: 1.5, maxWidth: 520 }}>
                Select an option to continue. You can change your choice before adding to cart.
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: { xs: 2, sm: 2.5 },
                    width: "100%",
                    alignItems: "stretch",
                }}
            >
                <Box sx={{ width: "100%" }}>
                    <Paper elevation={0} onClick={() => onSelect("non-prescription")} sx={cardSx}>
                        <Typography fontWeight={800} fontSize={16} sx={{ mb: 1, color: "#111827" }}>
                            Non-Prescription
                        </Typography>
                        <Typography fontSize={13} color="text.secondary" sx={{ lineHeight: 1.5 }}>
                            Plano lenses — no vision correction. Ideal for fashion or display wear.
                        </Typography>
                    </Paper>
                </Box>
                <Box sx={{ width: "100%" }}>
                    <Paper elevation={0} onClick={() => onSelect("prescription")} sx={cardSx}>
                        <Typography fontWeight={800} fontSize={16} sx={{ mb: 1, color: "#111827" }}>
                            Prescription
                        </Typography>
                        <Typography fontSize={13} color="text.secondary" sx={{ lineHeight: 1.5 }}>
                            Enter your RX details, then customize lens type and add-ons.
                        </Typography>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
}
