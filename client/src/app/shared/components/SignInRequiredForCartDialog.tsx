import CloseIcon from "@mui/icons-material/Close";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
} from "@mui/material";
import type { SignInForCartDialogProps } from "../../../lib/types/signInForCartDialog";

export function SignInRequiredForCartDialog({
    open,
    onClose,
    onLogin,
    onRegister,
}: SignInForCartDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                root: {
                    sx: { zIndex: (theme) => theme.zIndex.modal + 100 },
                },
            }}
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
            <DialogTitle
                sx={{
                    pr: 5,
                    fontWeight: 800,
                    fontSize: 20,
                    color: "#111827",
                }}
            >
                Sign in required
                <IconButton
                    aria-label="Close"
                    onClick={onClose}
                    sx={{ position: "absolute", right: 8, top: 8, color: "text.secondary" }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Typography color="text.secondary" sx={{ fontSize: 15, lineHeight: 1.6 }}>
                    Please log in or create an account to add products to your cart.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, pt: 0, gap: 1, flexWrap: "wrap" }}>
                <Button
                    variant="outlined"
                    color="inherit"
                    onClick={onRegister}
                    sx={{
                        fontWeight: 700,
                        borderColor: "rgba(17,24,39,0.2)",
                        color: "#111827",
                        textTransform: "none",
                    }}
                >
                    Register
                </Button>
                <Button
                    variant="contained"
                    onClick={onLogin}
                    sx={{
                        fontWeight: 800,
                        bgcolor: "#111827",
                        textTransform: "none",
                        "&:hover": { bgcolor: "#0b1220" },
                    }}
                >
                    Login
                </Button>
            </DialogActions>
        </Dialog>
    );
}
