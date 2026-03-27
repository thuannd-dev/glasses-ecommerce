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
  InputAdornment,
} from "@mui/material";
import { Search, TrendingUp, Package, CheckCircle, AlertCircle } from "lucide-react";
import { usePreOrderSummary } from "../../../lib/hooks/useOperationsInventory";

function PreOrderSummaryScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: preOrderData, isLoading } = usePreOrderSummary(false);

  const filteredItems = useMemo(() => {
    if (!preOrderData?.items) return [];
    const filtered = preOrderData.items.filter(
      (item) =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.variantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    const withStockGap = filtered.map((item) => ({
      ...item,
      stockGap: Math.max(0, item.quantityPreOrdered - item.quantityReserved),
    }));
    return withStockGap.sort((a, b) => b.stockGap - a.stockGap);
  }, [preOrderData?.items, searchTerm]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const totalStockGap = filteredItems.reduce((sum, item) => sum + item.stockGap, 0);

  const summaryStats = [
    {
      label: "Total PreOrder Variants",
      value: preOrderData?.totalPreOrderVariants ?? 0,
      color: "#6366F1",
    },
    {
      label: "Total Customer Orders",
      value: preOrderData?.totalPreOrderDemand ?? 0,
      color: "#F97316",
    },
    {
      label: "Total In Stock",
      value: preOrderData?.totalFulfilledQuantity ?? 0,
      color: "#22C55E",
    },
    {
      label: "Total Need to Order",
      value: totalStockGap,
      color: "#EF4444",
    },
  ];

  return (
    <Box sx={{ p: 4, minHeight: "100vh", backgroundColor: "#F8F9FA" }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: "#1F2937" }}>
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
          gap: 3,
          mb: 4,
        }}
      >
        {summaryStats.map((stat, idx) => {
          const icons = [Package, TrendingUp, CheckCircle, AlertCircle];
          const IconComponent = icons[idx];
          return (
            <Card
              key={idx}
              sx={{
                borderRadius: 2.5,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                border: "1px solid rgba(0,0,0,0.05)",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Typography color="#6B7280" variant="caption" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, fontSize: "11px" }}>
                    {stat.label}
                  </Typography>
                  <Box
                    sx={{
                      p: 1.2,
                      borderRadius: 1.5,
                      backgroundColor: `${stat.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconComponent size={20} color={stat.color} strokeWidth={2.5} />
                  </Box>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#1F2937", fontSize: "28px" }}>
                  {stat.value.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Search */}
      <Box sx={{ mb: 4 }}>
        <TextField
          placeholder="Search by product, variant, or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          size="small"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} color="#9CA3AF" />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              transition: "all 0.3s ease",
              fontSize: "14px",
              "& fieldset": {
                borderColor: "#E5E7EB",
              },
              "&:hover fieldset": {
                borderColor: "#D1D5DB",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#6366F1",
                boxShadow: "0 0 0 3px rgba(99,102,241,0.1)",
              },
            },
            "& .MuiOutlinedInput-input": {
              padding: "12px 14px",
              "&::placeholder": {
                color: "#9CA3AF",
                opacity: 1,
              },
            },
          }}
        />
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF" }}>
        <Table sx={{ tableLayout: "fixed" }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#F3F4F6", borderBottom: "2px solid #E5E7EB" }}>
              <TableCell sx={{ fontWeight: 700, color: "#374151", fontSize: "11px", textTransform: "uppercase", letterSpacing: 0.5, padding: "14px 16px", flex: "1 1 30%", width: "30%" }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#374151", fontSize: "11px", textTransform: "uppercase", letterSpacing: 0.5, padding: "14px 16px", flex: "0 0 15%", width: "15%" }}>Variant</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#374151", fontSize: "11px", textTransform: "uppercase", letterSpacing: 0.5, padding: "14px 16px", flex: "0 0 12%", width: "12%" }}>SKU</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: "#374151", fontSize: "11px", textTransform: "uppercase", letterSpacing: 0.5, padding: "14px 16px", flex: "0 0 12%", width: "12%" }}>
                Orders
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: "#374151", fontSize: "11px", textTransform: "uppercase", letterSpacing: 0.5, padding: "14px 16px", flex: "0 0 12%", width: "12%" }}>
                Stock
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: "#374151", fontSize: "11px", textTransform: "uppercase", letterSpacing: 0.5, padding: "14px 16px", flex: "0 0 19%", width: "19%" }}>
                Need
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: "center", py: 5 }}>
                  <Typography color="#9CA3AF" variant="body2" sx={{ fontSize: "14px" }}>
                    {searchTerm ? "No pre-orders match your search" : "No pending pre-orders"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item, idx) => {
                const isGapZero = item.stockGap === 0;
                return (
                  <TableRow
                    key={item.variantId}
                    sx={{
                      backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#F9FAFB",
                      borderBottom: "1px solid #E5E7EB",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "#F3F4F6",
                      },
                      opacity: isGapZero ? 0.7 : 1,
                    }}
                  >
                    <TableCell sx={{ padding: "14px 16px", flex: "1 1 30%", width: "30%", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#1F2937", fontSize: "13px" }}>
                        {item.productName}
                      </Typography>
                      {item.brand && (
                        <Typography variant="caption" sx={{ color: "#9CA3AF", fontSize: "11px", display: "block", mt: 0.5 }}>
                          {item.brand}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ padding: "14px 16px", flex: "0 0 15%", width: "15%", color: "#6B7280", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis" }}>{item.variantName || "—"}</TableCell>
                    <TableCell sx={{ padding: "14px 16px", flex: "0 0 12%", width: "12%" }}>
                      <Typography variant="caption" sx={{ fontFamily: "monospace", color: "#374151", fontSize: "12px", fontWeight: 600, backgroundColor: "#F3F4F6", px: 1, py: 0.5, borderRadius: 0.8, display: "inline-block" }}>
                        {item.sku}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ padding: "14px 16px", flex: "0 0 12%", width: "12%" }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#1F2937", fontSize: "13px" }}>
                        {item.quantityPreOrdered}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ padding: "14px 16px", flex: "0 0 12%", width: "12%" }}>
                      <Typography variant="body2" sx={{ color: "#10B981", fontWeight: 700, fontSize: "13px" }}>
                        {item.quantityReserved}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ padding: "14px 16px", flex: "0 0 19%", width: "19%", pr: 2 }}>
                      {item.stockGap === 0 ? (
                        <Chip
                          icon={<CheckCircle size={14} />}
                          label="No action"
                          size="small"
                          sx={{
                            backgroundColor: "rgba(16, 185, 129, 0.1)",
                            color: "#10B981",
                            fontWeight: 700,
                            fontSize: "11px",
                            height: 26,
                            "& .MuiChip-icon": {
                              marginLeft: "4px",
                              marginRight: "-4px",
                            },
                          }}
                        />
                      ) : (
                        <Chip
                          icon={<AlertCircle size={14} />}
                          label={`${item.stockGap} needed`}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            color: "#DC2626",
                            fontWeight: 700,
                            fontSize: "11px",
                            height: 26,
                            "& .MuiChip-icon": {
                              marginLeft: "4px",
                              marginRight: "-4px",
                            },
                          }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summary text */}
      <Box sx={{ mt: 4, p: 3, backgroundColor: "#FFFFFF", borderRadius: 2, border: "1px solid #E5E7EB" }}>
        <Typography variant="body2" color="#6B7280" sx={{ fontSize: "13px", fontWeight: 500 }}>
          Showing <span style={{ fontWeight: 700, color: "#1F2937" }}>{filteredItems.length}</span> of{" "}
          <span style={{ fontWeight: 700, color: "#1F2937" }}>{preOrderData?.items?.length ?? 0}</span> pre-order variants
          {searchTerm && (
            <>
              {" "}
              (filtered by "<span style={{ fontWeight: 700, color: "#1F2937" }}>{searchTerm}</span>")
            </>
          )}
        </Typography>
      </Box>
    </Box>
  );
}

export default PreOrderSummaryScreen;
