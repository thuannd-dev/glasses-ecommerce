import { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  TextField,
} from "@mui/material";
import { usePreOrderSummary } from "../../../lib/hooks/useOperationsInventory";

function PreOrderSummaryScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: preOrderData, isLoading } = usePreOrderSummary(false);

  const filteredItems = useMemo(() => {
    if (!preOrderData?.items) return [];
    return preOrderData.items.filter(
      (item) =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.variantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [preOrderData?.items, searchTerm]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const summaryStats = [
    {
      label: "Total PreOrder Variants",
      value: preOrderData?.totalPreOrderVariants ?? 0,
      color: "#6366F1",
    },
    {
      label: "Total Demand",
      value: preOrderData?.totalPreOrderDemand ?? 0,
      color: "#F97316",
    },
    {
      label: "Fulfilled",
      value: preOrderData?.totalFulfilledQuantity ?? 0,
      color: "#22C55E",
    },
    {
      label: "Pending",
      value: preOrderData?.totalPendingQuantity ?? 0,
      color: "#EF4444",
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Pre-Order Summary
        </Typography>
        <Typography variant="body2" color="#6B7280">
          Track all pre-order demand and fulfillment status across variants
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr 1fr" },
          gap: 2,
          mb: 4,
        }}
      >
        {summaryStats.map((stat, idx) => (
          <Card key={idx} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography color="#6B7280" variant="body2" sx={{ mb: 1 }}>
                {stat.label}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: stat.color }}>
                {stat.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search by product, variant, or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          size="small"
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 1.5,
              backgroundColor: "#FAFAF8",
            },
          }}
        />
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#FAFAF8" }}>
              <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Variant</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Demand
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Fulfilled
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Pending
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: "center", py: 4 }}>
                  <Typography color="#9CA3AF" variant="body2">
                    {searchTerm ? "No pre-orders match your search" : "No pending pre-orders"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.variantId} sx={{ "&:hover": { backgroundColor: "#FAFAF8" } }}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.productName}
                    </Typography>
                    {item.brand && (
                      <Typography variant="caption" color="#9CA3AF">
                        {item.brand}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{item.variantName || "—"}</TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: "monospace", color: "#6B6B6B" }}>
                      {item.sku}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.quantityPreOrdered}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ color: "#22C55E", fontWeight: 600 }}>
                      {item.quantityReserved}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{
                        color: item.quantityPending > 0 ? "#EF4444" : "#22C55E",
                        fontWeight: 600,
                      }}
                    >
                      {item.quantityPending}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {item.quantityPending === 0 ? (
                      <Chip
                        label="Fulfilled"
                        size="small"
                        sx={{
                          backgroundColor: "rgba(34,197,94,0.1)",
                          color: "#15803D",
                          fontWeight: 600,
                          height: 22,
                        }}
                      />
                    ) : (
                      <Chip
                        label={`Pending (${item.quantityPending})`}
                        size="small"
                        sx={{
                          backgroundColor: "rgba(239,68,68,0.1)",
                          color: "#DC2626",
                          fontWeight: 600,
                          height: 22,
                        }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summary text */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: "#FAFAF8", borderRadius: 1.5 }}>
        <Typography variant="body2" color="#6B7280">
          Showing {filteredItems.length} of {preOrderData?.items?.length ?? 0} pre-order variants
          {searchTerm && ` (filtered by "${searchTerm}")`}
        </Typography>
      </Box>
    </Box>
  );
}

export default PreOrderSummaryScreen;
