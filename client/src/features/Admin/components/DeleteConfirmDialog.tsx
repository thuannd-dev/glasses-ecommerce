import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface DeleteConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  itemName?: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  open,
  title = "Delete Item",
  message,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: 20,
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 2.5,
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent sx={{ pt: 4, pb: 3 }}>
        <Typography sx={{ color: "text.secondary", lineHeight: 1.7, fontSize: 15.5 }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{ textTransform: "none", fontWeight: 700, fontSize: 15 }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={isDeleting}
          sx={{ textTransform: "none", fontWeight: 700, fontSize: 15 }}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
