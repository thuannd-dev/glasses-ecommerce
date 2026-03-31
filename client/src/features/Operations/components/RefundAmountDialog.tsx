import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Typography } from "@mui/material";
import { useState } from "react";

interface RefundAmountDialogProps {
  readonly open: boolean;
  readonly maxAmount: number;
  readonly onConfirm: (amount: number) => void;
  readonly onCancel: () => void;
  readonly isLoading?: boolean;
}

export function RefundAmountDialog({
  open,
  maxAmount,
  onConfirm,
  onCancel,
  isLoading,
}: RefundAmountDialogProps) {
  const [amount, setAmount] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleConfirm = () => {
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount)) {
      setError("Please enter a valid amount");
      return;
    }
    
    if (numAmount <= 0) {
      setError("Amount must be greater than zero");
      return;
    }
    
    if (numAmount > maxAmount) {
      setError(`Amount cannot exceed maximum of $${maxAmount.toFixed(2)}`);
      return;
    }
    
    onConfirm(numAmount);
    setAmount("");
    setError("");
  };

  const handleClose = () => {
    setAmount("");
    setError("");
    onCancel();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: 16, fontWeight: 700, color: "#171717" }}>
        Enter Refund Amount
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box>
            <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600, mb: 0.75 }}>
              Maximum Refund Amount
            </Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#16A34A" }}>
              ${maxAmount.toFixed(2)}
            </Typography>
          </Box>

          <TextField
            autoFocus
            type="number"
            label="Refund Amount"
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError("");
            }}
            inputProps={{ step: "0.01", min: "0.01", max: maxAmount.toFixed(2) }}
            fullWidth
            error={!!error}
            helperText={error}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: 14,
                fontWeight: 600,
              },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          variant="outlined"
          sx={{
            color: "#6B6B6B",
            borderColor: "#D1D5DB",
            "&:hover": { borderColor: "#9CA3AF" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isLoading || !amount}
          variant="contained"
          sx={{
            bgcolor: "#16A34A",
            color: "#FFFFFF",
            fontWeight: 700,
            "&:hover": { bgcolor: "#15803D" },
            "&:disabled": { bgcolor: "#D1D5DB", color: "#9CA3AF" },
          }}
        >
          {isLoading ? "Processing..." : "Confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
