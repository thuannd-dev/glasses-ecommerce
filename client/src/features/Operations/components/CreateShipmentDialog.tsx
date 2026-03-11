import { useEffect } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  Typography,
} from "@mui/material";

import { formatDate, ORDER_STATUS_LABEL, ORDER_TYPE_LABEL } from "../constants";
import type { OrderDto, OperationsOrderDto } from "../../../lib/types";

type CreateShipmentDialogProps = {
  open: boolean;
  onClose: () => void;
  order: OrderDto | OperationsOrderDto | null;
  carrier: string;
  setCarrier: (v: string) => void;
  trackingNumber: string;
  setTrackingNumber: (v: string) => void;
  trackingUrl: string;
  setTrackingUrl: (v: string) => void;
<<<<<<< Updated upstream
=======
  estimatedDeliveryDate: string;
  setEstimatedDeliveryDate: (v: string) => void;
  shippingNotes: string;
  setShippingNotes: (v: string) => void;
  carriers: string[];
>>>>>>> Stashed changes
  onSubmit: () => void;
  isPending: boolean;
};

export function CreateShipmentDialog({
  open,
  onClose,
  order,
  carrier,
  setCarrier,
  trackingNumber,
  setTrackingNumber,
  trackingUrl,
  setTrackingUrl,
<<<<<<< Updated upstream
  onSubmit,
  isPending,
}: CreateShipmentDialogProps) {
  // Check if this is a full OrderDto with order details
  const isFullOrder = order && 'orderNumber' in order && 'items' in order;
  
=======
  estimatedDeliveryDate,
  setEstimatedDeliveryDate,
  shippingNotes,
  setShippingNotes,
  carriers,
  onSubmit,
  isPending,
}: CreateShipmentDialogProps) {
  // Mapping of carriers to their tracking URLs
  const carrierUrls: Record<string, string> = {
    GHN: "https://ghn.vn",
    GHTK: "https://ghtk.vn",
  };

  // Auto-fill tracking URL when carrier is selected
  useEffect(() => {
    if (carrier && carrierUrls[carrier]) {
      setTrackingUrl(carrierUrls[carrier]);
    }
  }, [carrier, setTrackingUrl, carrierUrls]);

>>>>>>> Stashed changes
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create shipment</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {isFullOrder && order && 'orderNumber' in order && 'items' in order && (
          <>
            <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1.5 }} color="text.secondary">
              Order details
            </Typography>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "rgba(0,0,0,0.03)",
                border: "1px solid rgba(0,0,0,0.06)",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
                <Typography fontWeight={800} fontSize={15}>
                  {(order as OrderDto).orderNumber}
                </Typography>
                <Chip label={ORDER_TYPE_LABEL[(order as OrderDto).orderType]} size="small" sx={{ fontWeight: 600 }} />
                <Chip
                  label={ORDER_STATUS_LABEL[(order as OrderDto).status]}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    bgcolor: "rgba(25,118,210,0.12)",
                    color: "#1976d2",
                  }}
                />
              </Box>
              <Typography fontSize={13} color="text.secondary">
                {(order as OrderDto).customerName} · {(order as OrderDto).customerEmail}
              </Typography>
              <Typography fontSize={13} color="text.secondary" sx={{ mt: 0.5 }}>
                {(order as OrderDto).shippingAddress}
              </Typography>
              <Typography fontSize={13} color="text.secondary" sx={{ mt: 0.5 }}>
                {formatDate((order as OrderDto).createdAt)}
              </Typography>
              {order.orderType === "PreOrder" && order.expectedStockDate && (
                <Typography fontSize={13} color="text.secondary" sx={{ mt: 0.5 }}>
                  Expected stock: {(order as OrderDto).expectedStockDate}
                </Typography>
              )}
              {order.orderType === "Prescription" && order.prescriptionStatus && (
                <Typography fontSize={13} color="text.secondary" sx={{ mt: 0.5 }}>
                  Prescription: {(order as OrderDto).prescriptionStatus}
                </Typography>
              )}
              <Divider sx={{ my: 1.5 }} />
              <Typography fontSize={12} fontWeight={700} color="text.secondary" sx={{ mb: 0.5 }}>
                Items ({order.items?.length || 0})
              </Typography>
              {(order.items || []).map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    fontSize: 13,
                    py: 0.25,
                  }}
                >
                  <Typography fontSize={13}>
                    {item.productName} × {item.quantity}
                  </Typography>
                  <Typography fontSize={13} fontWeight={600}>
                    {(item.price * item.quantity).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                  </Typography>
                </Box>
              ))}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mt: 1, pt: 1, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                <Typography fontSize={14} fontWeight={800}>
                  Total
                </Typography>
                <Typography fontSize={14} fontWeight={800}>
                  {(order as OrderDto).totalAmount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                </Typography>
              </Box>
            </Box>
          </>
        )}
        <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1.5 }} color="text.secondary">
          Shipment
        </Typography>
        <TextField
          fullWidth
          label="Shipping carrier"
          value={carrier}
          onChange={(e) => setCarrier(e.target.value)}
          select
          SelectProps={{
            native: true,
          }}
          sx={{ mt: 1 }}
          disabled={carriers.length === 0}
        >
          {carriers.length === 0 ? (
            <option value="">Loading carriers...</option>
          ) : (
            carriers.map((carrierName) => (
              <option key={carrierName} value={carrierName}>
                {carrierName}
              </option>
            ))
          )}
        </TextField>
        <TextField
          fullWidth
          label="Tracking code"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="e.g. VN123456789"
          required
          error={trackingNumber === "" && false}
          sx={{ mt: 2 }}
        />
        {trackingNumber === "" && (
          <Typography color="error" sx={{ fontSize: 12, mt: 0.5 }}>
            Tracking code is required
          </Typography>
        )}
        <TextField
          fullWidth
          label="Tracking URL"
          value={trackingUrl}
          onChange={(e) => setTrackingUrl(e.target.value)}
          placeholder="e.g. https://ghn.vn"
          sx={{ mt: 2 }}
          helperText="Auto-filled based on carrier. You can edit if needed."
        />
        <TextField
          fullWidth
          label="Estimated delivery date"
          type="date"
          value={estimatedDeliveryDate}
          onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Shipping notes"
          value={shippingNotes}
          onChange={(e) => setShippingNotes(e.target.value)}
          multiline
          rows={3}
          placeholder="Add any additional shipping notes..."
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Tracking URL"
          value={trackingUrl}
          onChange={(e) => setTrackingUrl(e.target.value)}
          placeholder="https://tracking.example.com/..."
          sx={{ mt: 2 }}
          type="url"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={!trackingNumber.trim() || isPending}>
          {isPending ? "Saving…" : "Save shipment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
