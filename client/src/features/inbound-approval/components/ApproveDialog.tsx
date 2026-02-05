import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { InboundRecord } from "../../../services/inbound.types";

interface ApproveDialogProps {
  open: boolean;
  record: InboundRecord | null;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function ApproveDialog({
  open,
  record,
  onClose,
  onConfirm,
  isLoading = false,
}: ApproveDialogProps) {
  if (!record) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: 16 }}>Approve Inbound Record</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Typography sx={{ mb: 2, color: "rgba(15,23,42,0.65)", fontSize: 13 }}>
          Approving this record will update inventory stock for all items below.
        </Typography>

        <Box sx={{ mb: 2, p: 2, backgroundColor: "rgba(15,23,42,0.02)", borderRadius: 1 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 1, color: "rgba(15,23,42,0.75)" }}>
            Record Details
          </Typography>
          <Typography sx={{ fontSize: 12, color: "rgba(15,23,42,0.65)" }}>
            <strong>Reference:</strong> {record.sourceReference || "N/A"}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "rgba(15,23,42,0.65)", mt: 0.5 }}>
            <strong>Items:</strong> {record.totalItems} variant(s)
          </Typography>
        </Box>

        <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 1, color: "rgba(15,23,42,0.75)" }}>
          Items to be added to inventory:
        </Typography>
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "rgba(15,23,42,0.05)" }}>
                <TableCell sx={{ fontSize: 11, fontWeight: 600 }}>Product</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 600 }}>SKU</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 600, textAlign: "right" }}>
                  Qty
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {record.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell sx={{ fontSize: 11 }}>
                    {item.productVariant?.variantName || item.product?.productName || "N/A"}
                  </TableCell>
                  <TableCell sx={{ fontSize: 11 }}>
                    {item.productVariant?.sku || "N/A"}
                  </TableCell>
                  <TableCell sx={{ fontSize: 11, textAlign: "right", fontWeight: 600 }}>
                    {item.quantity}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} disabled={isLoading} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="success"
          disabled={isLoading}
          sx={{ textTransform: "none" }}
        >
          {isLoading ? "Approving..." : "Approve"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
