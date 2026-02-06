import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";

interface RejectDialogProps {
  open: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export interface RejectFormData {
  reason: string;
}

export default function RejectDialog({
  open,
  onConfirm,
  onCancel,
  isLoading,
}: RejectDialogProps) {
  const { control, handleSubmit, reset } = useForm<RejectFormData>({
    defaultValues: {
      reason: "Damaged, send to disposal",
    },
  });

  const handleClose = () => {
    reset();
    onCancel();
  };

  const onSubmit = (data: RejectFormData) => {
    onConfirm(data.reason);
    reset();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: 18 }}>Reject Return</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Typography sx={{ fontSize: 14, mb: 2, color: "rgba(15,23,42,0.75)" }}>
          Please provide a reason for rejecting this return:
        </Typography>
        <Controller
          name="reason"
          control={control}
          rules={{ required: "Reason is required" }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              multiline
              rows={4}
              placeholder="e.g., Damaged, send to disposal"
              error={!!error}
              helperText={error?.message}
              sx={{ mt: 1 }}
            />
          )}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isLoading}
          sx={{ backgroundColor: "#e74c3c", textTransform: "none", fontWeight: 600 }}
        >
          {isLoading ? "Processing..." : "Reject Return"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
