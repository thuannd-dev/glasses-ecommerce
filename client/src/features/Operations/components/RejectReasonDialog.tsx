import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from "@mui/material";

interface RejectReasonDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (reason: string) => Promise<void>;
  readonly isLoading?: boolean;
}

export function RejectReasonDialog({ open, onClose, onSubmit, isLoading }: RejectReasonDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Rejection reason is required");
      return;
    }

    if (reason.length < 10) {
      setError("Reason must be at least 10 characters long");
      return;
    }

    try {
      await onSubmit(reason);
      setReason("");
      setError("");
    } catch {
      // Error is handled in the parent component
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason("");
      setError("");
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: 18,
          fontWeight: 700,
          color: "#171717",
          pb: 1,
        }}
      >
        Reject Ticket
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography sx={{ fontSize: 14, color: "#6B6B6B" }}>
            Please provide the reason for rejecting this ticket. This information will be recorded in the system.
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Enter rejection reason..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError("");
            }}
            disabled={isLoading}
            error={!!error}
            helperText={error}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          sx={{
            color: "#6B6B6B",
            "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !reason.trim()}
          variant="contained"
          sx={{
            bgcolor: "#DC2626",
            color: "#FFFFFF",
            fontWeight: 700,
            "&:hover": { bgcolor: "#991B1B" },
            "&:disabled": { bgcolor: "#D1D5DB", color: "#9CA3AF" },
          }}
        >
          {isLoading ? "Rejecting..." : "Confirm Rejection"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
