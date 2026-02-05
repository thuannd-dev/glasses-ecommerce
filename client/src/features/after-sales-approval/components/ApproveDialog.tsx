import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import type { AfterSalesTicket } from "../../../services/afterSales.types";

interface ApproveDialogProps {
  open: boolean;
  ticket: AfterSalesTicket | null;
  onConfirm: (data: ApproveFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export interface ApproveFormData {
  items: {
    itemId: string;
    approvedQuantity: number;
  }[];
}

export default function ApproveDialog({
  open,
  ticket,
  onConfirm,
  onCancel,
  isLoading,
}: ApproveDialogProps) {
  const { handleSubmit, reset } = useForm<ApproveFormData>({
    defaultValues: {
      items: ticket?.items.map((item) => ({
        itemId: item.id,
        approvedQuantity: item.returnedQuantity,
      })) || [],
    },
  });

  const handleClose = () => {
    reset();
    onCancel();
  };

  const onSubmit = (data: ApproveFormData) => {
    onConfirm(data);
    reset();
  };

  if (!ticket) return null;

  const prescriptionItems = ticket.items.filter((item) => !item.canRestock);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: 18 }}>
        Approve Return - Confirm Details
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {prescriptionItems.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
              ⚠️ Prescription/Customized Items Cannot Be Restocked
            </Typography>
            <Typography sx={{ fontSize: 12, mt: 0.5 }}>
              {prescriptionItems.length} item(s) cannot be returned to inventory.
            </Typography>
          </Alert>
        )}

        <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 1.5, mt: 2 }}>
          Return Items
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#FAFAF8" }}>
                <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>Product</TableCell>
                <TableCell sx={{ fontSize: 12, fontWeight: 600 }} align="right">
                  Returned Qty
                </TableCell>
                <TableCell sx={{ fontSize: 12, fontWeight: 600 }} align="center">
                  Can Restock
                </TableCell>
                <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>Condition</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ticket.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell sx={{ fontSize: 13 }}>
                    {item.orderItem?.product?.productName}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }} align="right">
                    {item.returnedQuantity}
                  </TableCell>
                  <TableCell align="center">
                    {item.canRestock ? (
                      <Typography sx={{ fontSize: 13, color: "green", fontWeight: 600 }}>
                        ✓ Yes
                      </Typography>
                    ) : (
                      <Typography sx={{ fontSize: 13, color: "orange", fontWeight: 600 }}>
                        ✗ No
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{item.condition}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mb: 2, p: 2, backgroundColor: "rgba(15,23,42,0.04)", borderRadius: 1 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1 }}>
            Refund Information
          </Typography>
          <Typography sx={{ fontSize: 13 }}>
            Total Refund Amount: <strong>${ticket.refundAmount?.toFixed(2)}</strong>
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isLoading}
          sx={{ backgroundColor: "#2ecc71", textTransform: "none", fontWeight: 600 }}
        >
          {isLoading ? "Processing..." : "Approve & Process Refund"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
