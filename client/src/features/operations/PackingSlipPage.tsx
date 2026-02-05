import React, { useRef, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

interface PackingSlipItem {
  productName: string;
  variantName: string;
  pickedQuantity: number;
  notes?: string;
  isChecked: boolean;
}

interface PackingSlip {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  customerInfo: {
    name: string;
    email: string;
    phoneNumber: string;
  };
  shippingAddress: {
    recipientName: string;
    recipientPhone: string;
    venue: string;
    ward: string;
    district: string;
    city: string;
    postalCode: string;
  };
  items: PackingSlipItem[];
  customerNote?: string;
  printedAt: string;
}

const PackingSlipPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [openHandoverDialog, setOpenHandoverDialog] = useState(false);

  // Fetch packing slip
  const { data: slip, isLoading, error } = useQuery<PackingSlip>({
    queryKey: ["packing-slip", orderId],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${orderId}/packing-slip`);
      if (!response.ok) throw new Error("Failed to fetch packing slip");
      const result = await response.json();
      return result.value;
    },
    enabled: !!orderId,
  });

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open("", "", "height=700,width=900");
      if (printWindow) {
        printWindow.document.write("<html><head><title>Packing Slip</title>");
        printWindow.document.write("<style>");
        printWindow.document.write("body { font-family: Arial, sans-serif; margin: 20px; }");
        printWindow.document.write("table { border-collapse: collapse; width: 100%; margin: 10px 0; }");
        printWindow.document.write("th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }");
        printWindow.document.write("th { background-color: #f0f0f0; }");
        printWindow.document.write("h2 { color: #333; }");
        printWindow.document.write(".section { margin-bottom: 20px; }");
        printWindow.document.write("</style></head><body>");
        printWindow.document.write(printRef.current.innerHTML);
        printWindow.document.write("</body></html>");
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleCheckItem = (index: number) => {
    setCheckedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleContinueToHandover = () => {
    navigate(`/operations/shipment/${orderId}`);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !slip) {
    return <Alert severity="error">Failed to load packing slip</Alert>;
  }

  const allItemsChecked = slip.items.every((_, idx) => checkedItems[idx]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        📋 Packing Slip & Checklist
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePrint}
            sx={{ mr: 2 }}
          >
            🖨️ Print Packing Slip
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => setOpenHandoverDialog(true)}
            disabled={!allItemsChecked}
          >
            ✓ All Items Verified - Handover to Carrier
          </Button>
        </Grid>
      </Grid>

      {/* Printable Section */}
      <Box
        ref={printRef}
        sx={{
          display: "none",
          "@media print": {
            display: "block",
          },
        }}
      >
        <PackingSlipPrintContent slip={slip} />
      </Box>

      {/* Screen Display */}
      <Box sx={{ "@media print": { display: "none" } }}>
        <PackingSlipDisplay slip={slip} />
      </Box>

      {/* Checklist Table */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            ✅ Item Verification Checklist
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell sx={{ width: 50, fontWeight: "bold" }}>
                    ✓
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Variant</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                    Quantity
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {slip.items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Checkbox
                        checked={checkedItems[idx] || false}
                        onChange={() => handleCheckItem(idx)}
                      />
                    </TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{item.variantName}</TableCell>
                    <TableCell align="center">{item.pickedQuantity}</TableCell>
                    <TableCell>{item.notes || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Handover Dialog */}
      <Dialog
        open={openHandoverDialog}
        onClose={() => setOpenHandoverDialog(false)}
      >
        <DialogTitle>Ready for Carrier Handover</DialogTitle>
        <DialogContent>
          <Typography>
            All items have been verified. Proceed to handover this order to the
            shipping carrier?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHandoverDialog(false)}>Cancel</Button>
          <Button
            onClick={handleContinueToHandover}
            color="success"
            variant="contained"
          >
            Continue to Handover
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Printable content component
const PackingSlipPrintContent: React.FC<{ slip: PackingSlip }> = ({ slip }) => (
  <Box sx={{ p: 4 }}>
    <Typography variant="h4" sx={{ textAlign: "center", mb: 4 }}>
      PACKING SLIP
    </Typography>

    <Grid container spacing={4} sx={{ mb: 4 }}>
      <Grid item xs={6}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
          Order Information
        </Typography>
        <Typography>Order Number: {slip.orderNumber}</Typography>
        <Typography>Order Date: {new Date(slip.orderDate).toLocaleDateString()}</Typography>
        <Typography>Total Amount: ${slip.totalAmount.toFixed(2)}</Typography>
      </Grid>

      <Grid item xs={6}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
          Ship To
        </Typography>
        <Typography>{slip.shippingAddress.recipientName}</Typography>
        <Typography>{slip.shippingAddress.venue}</Typography>
        <Typography>
          {slip.shippingAddress.ward}, {slip.shippingAddress.district}
        </Typography>
        <Typography>
          {slip.shippingAddress.city}, {slip.shippingAddress.postalCode}
        </Typography>
        <Typography>Phone: {slip.shippingAddress.recipientPhone}</Typography>
      </Grid>
    </Grid>

    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
      Items
    </Typography>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ border: "1px solid #000", padding: "8px" }}>Product</th>
          <th style={{ border: "1px solid #000", padding: "8px" }}>Variant</th>
          <th style={{ border: "1px solid #000", padding: "8px" }}>Qty</th>
        </tr>
      </thead>
      <tbody>
        {slip.items.map((item, idx) => (
          <tr key={idx}>
            <td style={{ border: "1px solid #000", padding: "8px" }}>
              {item.productName}
            </td>
            <td style={{ border: "1px solid #000", padding: "8px" }}>
              {item.variantName}
            </td>
            <td style={{ border: "1px solid #000", padding: "8px" }}>
              {item.pickedQuantity}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {slip.customerNote && (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Customer Note
        </Typography>
        <Typography>{slip.customerNote}</Typography>
      </Box>
    )}
  </Box>
);

// Screen display component
const PackingSlipDisplay: React.FC<{ slip: PackingSlip }> = ({ slip }) => (
  <Card>
    <CardContent>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
            Order Information
          </Typography>
          <Card variant="outlined">
            <CardContent>
              <Typography>
                <strong>Order Number:</strong> {slip.orderNumber}
              </Typography>
              <Typography>
                <strong>Order Date:</strong>{" "}
                {new Date(slip.orderDate).toLocaleDateString()}
              </Typography>
              <Typography>
                <strong>Total Amount:</strong> ${slip.totalAmount.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
            Shipping Address
          </Typography>
          <Card variant="outlined">
            <CardContent>
              <Typography>{slip.shippingAddress.recipientName}</Typography>
              <Typography>{slip.shippingAddress.venue}</Typography>
              <Typography>
                {slip.shippingAddress.ward}, {slip.shippingAddress.district}
              </Typography>
              <Typography>
                {slip.shippingAddress.city}, {slip.shippingAddress.postalCode}
              </Typography>
              <Typography>📞 {slip.shippingAddress.recipientPhone}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ fontWeight: "bold", my: 2 }}>
        Items to Pack
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Product</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Variant</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Quantity
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {slip.items.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item.productName}</TableCell>
                <TableCell>{item.variantName}</TableCell>
                <TableCell align="center">{item.pickedQuantity}</TableCell>
                <TableCell>{item.notes || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {slip.customerNote && (
        <Card variant="outlined" sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Customer Note
            </Typography>
            <Typography>{slip.customerNote}</Typography>
          </CardContent>
        </Card>
      )}
    </CardContent>
  </Card>
);

export default PackingSlipPage;
