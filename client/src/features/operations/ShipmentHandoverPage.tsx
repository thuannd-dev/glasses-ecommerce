import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

interface ShipmentInfo {
  orderId: string;
  orderNumber: string;
  carrierName: string;
  trackingCode?: string;
  trackingUrl?: string;
  packageWeight?: number;
  packageDimensions?: string;
  shippingNotes?: string;
  estimatedDeliveryAt?: string;
}

const ShipmentHandoverPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    carrierName: "GHN",
    trackingCode: "",
    trackingUrl: "",
    packageWeight: "",
    packageDimensions: "",
    shippingNotes: "",
    estimatedDeliveryAt: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  // Carrier options
  const carriers = [
    { value: "GHN", label: "Giao Hàng Nhanh (GHN)" },
    { value: "GHTK", label: "Giao Hàng Tiết Kiệm (GHTK)" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const payload = {
        carrierName: formData.carrierName,
        trackingCode: formData.trackingCode || null,
        trackingUrl: formData.trackingUrl || null,
        packageWeight: formData.packageWeight
          ? parseFloat(formData.packageWeight)
          : null,
        packageDimensions: formData.packageDimensions || null,
        shippingNotes: formData.shippingNotes || null,
        estimatedDeliveryAt: formData.estimatedDeliveryAt || null,
      };

      const response = await fetch(`/api/orders/${orderId}/shipment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create shipment");
      }

      toast.success("Shipment created successfully!");
      setOpenConfirmDialog(false);

      // Navigate to success page or list
      setTimeout(() => {
        navigate("/operations/picking");
      }, 1500);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create shipment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        🚚 Handover to Carrier
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Complete the shipping information to handover this order to the carrier.
        The order status will be updated to "Shipped".
      </Alert>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            {/* Carrier Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Shipping Carrier *</InputLabel>
                <Select
                  name="carrierName"
                  value={formData.carrierName}
                  onChange={handleInputChange as any}
                  label="Shipping Carrier *"
                >
                  {carriers.map((carrier) => (
                    <MenuItem key={carrier.value} value={carrier.value}>
                      {carrier.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Tracking Code */}
            <Grid item xs={12} md={6}>
              <TextField
                name="trackingCode"
                label="Tracking Code"
                value={formData.trackingCode}
                onChange={handleInputChange}
                fullWidth
                placeholder="e.g., 1234567890"
              />
            </Grid>

            {/* Tracking URL */}
            <Grid item xs={12}>
              <TextField
                name="trackingUrl"
                label="Tracking URL"
                value={formData.trackingUrl}
                onChange={handleInputChange}
                fullWidth
                placeholder="e.g., https://track.example.com/..."
                type="url"
              />
            </Grid>

            {/* Package Weight */}
            <Grid item xs={12} md={6}>
              <TextField
                name="packageWeight"
                label="Package Weight (kg)"
                value={formData.packageWeight}
                onChange={handleInputChange}
                fullWidth
                type="number"
                inputProps={{ step: "0.1", min: "0" }}
              />
            </Grid>

            {/* Package Dimensions */}
            <Grid item xs={12} md={6}>
              <TextField
                name="packageDimensions"
                label="Package Dimensions (cm)"
                value={formData.packageDimensions}
                onChange={handleInputChange}
                fullWidth
                placeholder="e.g., 20x30x15"
              />
            </Grid>

            {/* Estimated Delivery */}
            <Grid item xs={12} md={6}>
              <TextField
                name="estimatedDeliveryAt"
                label="Estimated Delivery Date"
                value={formData.estimatedDeliveryAt}
                onChange={handleInputChange}
                fullWidth
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Shipping Notes */}
            <Grid item xs={12}>
              <TextField
                name="shippingNotes"
                label="Shipping Notes"
                value={formData.shippingNotes}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4}
                placeholder="Add any special instructions for the carrier..."
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => setOpenConfirmDialog(true)}
              disabled={isSubmitting || !formData.carrierName}
            >
              Confirm Handover
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <DialogTitle>Confirm Carrier Handover</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography gutterBottom>
              <strong>Carrier:</strong> {formData.carrierName}
            </Typography>
            {formData.trackingCode && (
              <Typography gutterBottom>
                <strong>Tracking Code:</strong> {formData.trackingCode}
              </Typography>
            )}
            <Typography sx={{ mt: 2, color: "#666" }}>
              Once confirmed, the order status will be updated to "Shipped" and
              the customer will be notified about the shipment details.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenConfirmDialog(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            color="success"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShipmentHandoverPage;
