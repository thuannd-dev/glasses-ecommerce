import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Warning } from "@mui/icons-material";
import { Box } from "@mui/material";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  loading?: boolean;
}

export default function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  loading = false,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: 18 }}>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", pt: 2 }}>
          <Warning sx={{ color: "#e74c3c", fontSize: 28, mt: 0.5, flexShrink: 0 }} />
          <Typography sx={{ color: "rgba(15,23,42,0.8)", lineHeight: 1.6 }}>
            {message}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: "#e74c3c",
            "&:hover": { backgroundColor: "#c0392b" },
            "&:disabled": { backgroundColor: "rgba(231, 76, 60, 0.5)" },
          }}
        >
          {loading && <CircularProgress size={20} sx={{ mr: 1 }} />}
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
