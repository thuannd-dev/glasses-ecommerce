import { Box, Button, Typography } from "@mui/material";

type Props = {
    onContinue: () => void;
    onChangeOption: () => void;
    isPreOrder?: boolean;
};

export function PrescriptionFlowEntryPanel({ onContinue, onChangeOption, isPreOrder }: Props) {
    return (
        <Box sx={{ width: "100%" }}>
            <Button
                variant="text"
                onClick={onChangeOption}
                sx={{
                    mb: 2,
                    px: 0,
                    minWidth: 0,
                    fontWeight: 700,
                    fontSize: 13,
                    color: "text.secondary",
                    textTransform: "none",
                    "&:hover": { bgcolor: "transparent", color: "#111827" },
                }}
            >
                ← Change option
            </Button>
            <Typography fontWeight={800} fontSize={18} sx={{ mb: 1.5, color: "#111827" }}>
                Prescription lenses
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 1, fontSize: 15, lineHeight: 1.6, maxWidth: 520 }}>
                Next, you’ll enter your prescription and walk through lens options — same steps as before.
            </Typography>
            {isPreOrder && (
                <Typography fontSize={13} color="text.secondary" sx={{ mb: 2, maxWidth: 520 }}>
                    This frame is pre-order; prescription details will be collected below.
                </Typography>
            )}
            <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2, py: 1.2, fontWeight: 900, bgcolor: "#111827", "&:hover": { bgcolor: "#0b1220" } }}
                onClick={onContinue}
            >
                Continue
            </Button>
        </Box>
    );
}
