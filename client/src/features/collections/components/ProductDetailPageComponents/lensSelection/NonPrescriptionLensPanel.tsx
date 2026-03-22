import { Box, Button, Typography } from "@mui/material";

type Props = {
    onAddToCart: () => void;
    onChangeOption: () => void;
    disabled: boolean;
    submitting: boolean;
};

export function NonPrescriptionLensPanel({
    onAddToCart,
    onChangeOption,
    disabled,
    submitting,
}: Props) {
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
                Non-prescription lenses
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3, fontSize: 15, lineHeight: 1.6, maxWidth: 520 }}>
                These lenses have no vision correction and are suitable for everyday wear / fashion use.
            </Typography>
            <Button
                variant="contained"
                fullWidth
                disabled={disabled || submitting}
                sx={{ py: 1.2, fontWeight: 900, bgcolor: "#111827", "&:hover": { bgcolor: "#0b1220" } }}
                onClick={onAddToCart}
            >
                {submitting ? "Adding…" : "Add to Cart"}
            </Button>
        </Box>
    );
}
