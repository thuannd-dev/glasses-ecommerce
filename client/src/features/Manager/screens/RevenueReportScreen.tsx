import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  TextField,
  MenuItem,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { toast } from "react-toastify";
import type { RevenueReportDto } from "../../../lib/types/inventory";

const SOURCE_OPTIONS = [
  { value: "", label: "All Sources" },
  { value: "Online", label: "Online" },
  { value: "Offline", label: "Offline" },
];

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getDefaultFromDate() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().split("T")[0];
}

function getDefaultToDate() {
  return new Date().toISOString().split("T")[0];
}

export default function RevenueReportScreen() {
  const [report, setReport] = useState<RevenueReportDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [sourceFilter, setSourceFilter] = useState("");
  const [fromDate, setFromDate] = useState(getDefaultFromDate());
  const [toDate, setToDate] = useState(getDefaultToDate());

  const loadReport = async () => {
    setLoading(true);
    try {
      // TODO: Implement revenue report API integration
      toast.info("Revenue report feature coming soon");
      setReport(null);
    } catch (error) {
      toast.error("Failed to load revenue report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleApplyFilter = () => {
    loadReport();
  };

  const completionRate =
    report && report.totalOrders > 0
      ? ((report.completedOrders / report.totalOrders) * 100).toFixed(1)
      : "0";

  const cancellationRate =
    report && report.totalOrders > 0
      ? ((report.cancelledOrders / report.totalOrders) * 100).toFixed(1)
      : "0";

  return (
    <Box sx={{ px: { xs: 2, md: 4, lg: 6 }, py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          sx={{
            fontSize: 12,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "text.secondary",
            mb: 1,
          }}
        >
          Financial Reports
        </Typography>
        <Typography
          sx={{ fontSize: 28, fontWeight: 900, color: "text.primary", mb: 1 }}
        >
          Revenue Dashboard
        </Typography>
        <Typography sx={{ color: "text.secondary", maxWidth: 600 }}>
          Comprehensive revenue overview with breakdown by sales channel.
          Filter by source and date range.
        </Typography>
      </Box>

      {/* Filters */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 2,
          bgcolor: "#ffffff",
          border: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ sm: "center" }}
        >
          <TextField
            select
            size="small"
            label="Source"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            {SOURCE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            type="date"
            size="small"
            label="From"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />
          <TextField
            type="date"
            size="small"
            label="To"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />
          <Button
            variant="contained"
            onClick={handleApplyFilter}
            disabled={loading}
            sx={{ textTransform: "none", fontWeight: 600, px: 3 }}
          >
            Apply
          </Button>
        </Stack>
      </Paper>

      {loading && !report ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 8,
          }}
        >
          <CircularProgress />
        </Box>
      ) : report ? (
        <>
          {/* Date range indicator */}
          <Box sx={{ mb: 3 }}>
            <Typography fontSize={13} color="text.secondary">
              Reporting period:{" "}
              <Typography
                component="span"
                fontSize={13}
                fontWeight={700}
                color="text.primary"
              >
                {formatDate(report.fromDate)} — {formatDate(report.toDate)}
              </Typography>
              {" · "}Source:{" "}
              <Chip
                label={report.orderSource}
                size="small"
                sx={{
                  fontWeight: 600,
                  bgcolor: "rgba(25,118,210,0.1)",
                  color: "#1565c0",
                }}
              />
            </Typography>
          </Box>

          {/* KPI Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Net Revenue */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <Typography fontSize={12} color="text.secondary" fontWeight={600}>
                  Net Revenue
                </Typography>
                <Typography
                  fontSize={28}
                  fontWeight={900}
                  mt={1}
                  color="#2e7d32"
                >
                  {formatCurrency(report.netRevenue)}
                </Typography>
                <Typography fontSize={12} color="text.secondary" mt={0.5}>
                  After discounts applied
                </Typography>
              </Paper>
            </Grid>

            {/* Total Revenue */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <Typography fontSize={12} color="text.secondary" fontWeight={600}>
                  Gross Revenue
                </Typography>
                <Typography
                  fontSize={28}
                  fontWeight={900}
                  mt={1}
                  color="text.primary"
                >
                  {formatCurrency(report.totalRevenue)}
                </Typography>
                <Typography fontSize={12} color="text.secondary" mt={0.5}>
                  Before discounts
                </Typography>
              </Paper>
            </Grid>

            {/* Total Discount */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <Typography fontSize={12} color="text.secondary" fontWeight={600}>
                  Total Discount
                </Typography>
                <Typography
                  fontSize={28}
                  fontWeight={900}
                  mt={1}
                  color="#e65100"
                >
                  {formatCurrency(report.totalDiscount)}
                </Typography>
                <Typography fontSize={12} color="text.secondary" mt={0.5}>
                  Promo & coupon applied
                </Typography>
              </Paper>
            </Grid>

            {/* Total Orders */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <Typography fontSize={12} color="text.secondary" fontWeight={600}>
                  Total Orders
                </Typography>
                <Typography
                  fontSize={28}
                  fontWeight={900}
                  mt={1}
                  color="text.primary"
                >
                  {report.totalOrders.toLocaleString()}
                </Typography>
                <Stack direction="row" spacing={1} mt={0.5}>
                  <Chip
                    label={`${report.completedOrders} completed`}
                    size="small"
                    sx={{
                      fontSize: 11,
                      bgcolor: "rgba(46,125,50,0.12)",
                      color: "#2e7d32",
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    label={`${report.cancelledOrders} cancelled`}
                    size="small"
                    sx={{
                      fontSize: 11,
                      bgcolor: "rgba(211,47,47,0.12)",
                      color: "#c62828",
                      fontWeight: 600,
                    }}
                  />
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Performance Metrics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <Typography fontSize={12} color="text.secondary" fontWeight={600}>
                  Completion Rate
                </Typography>
                <Typography fontSize={24} fontWeight={900} mt={1} color="#2e7d32">
                  {completionRate}%
                </Typography>
                <Box
                  sx={{
                    mt: 1.5,
                    height: 6,
                    borderRadius: 999,
                    bgcolor: "rgba(46,125,50,0.15)",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: `${completionRate}%`,
                      height: "100%",
                      bgcolor: "#2e7d32",
                      borderRadius: 999,
                      transition: "width 0.6s ease",
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <Typography fontSize={12} color="text.secondary" fontWeight={600}>
                  Cancellation Rate
                </Typography>
                <Typography fontSize={24} fontWeight={900} mt={1} color="#c62828">
                  {cancellationRate}%
                </Typography>
                <Box
                  sx={{
                    mt: 1.5,
                    height: 6,
                    borderRadius: 999,
                    bgcolor: "rgba(211,47,47,0.15)",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: `${cancellationRate}%`,
                      height: "100%",
                      bgcolor: "#c62828",
                      borderRadius: 999,
                      transition: "width 0.6s ease",
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Revenue by Source Table */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              bgcolor: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 2.5, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
                Revenue by Channel
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "rgba(0,0,0,0.04)" }}>
                    <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                      Source
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, color: "text.primary" }}
                    >
                      Orders
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700, color: "text.primary" }}
                    >
                      Revenue
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700, color: "text.primary" }}
                    >
                      Discount
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700, color: "text.primary" }}
                    >
                      Net Revenue
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.bySource.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No data available for the selected period
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {report.bySource.map((row: any) => (
                        <TableRow
                          key={row.source}
                          hover
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                            borderBottom: "1px solid rgba(0,0,0,0.06)",
                          }}
                        >
                          <TableCell>
                            <Chip
                              label={row.source}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                bgcolor:
                                  row.source === "Online"
                                    ? "rgba(25,118,210,0.12)"
                                    : row.source === "Offline"
                                      ? "rgba(245,124,0,0.12)"
                                      : "rgba(0,0,0,0.08)",
                                color:
                                  row.source === "Online"
                                    ? "#1565c0"
                                    : row.source === "Offline"
                                      ? "#e65100"
                                      : "text.primary",
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography fontWeight={600}>
                              {row.orderCount.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={600}>
                              {formatCurrency(row.revenue)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography color="#e65100" fontWeight={600}>
                              -{formatCurrency(row.discount)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography color="#2e7d32" fontWeight={700}>
                              {formatCurrency(row.netRevenue)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Totals row */}
                      <TableRow
                        sx={{
                          bgcolor: "rgba(0,0,0,0.03)",
                          "& td": { borderBottom: 0 },
                        }}
                      >
                        <TableCell>
                          <Typography fontWeight={800} fontSize={13}>
                            TOTAL
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography fontWeight={800}>
                            {report.bySource
                              .reduce((s: number, r: any) => s + r.orderCount, 0)
                              .toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={800}>
                            {formatCurrency(report.totalRevenue)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={800} color="#e65100">
                            -{formatCurrency(report.totalDiscount)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={800} color="#2e7d32">
                            {formatCurrency(report.netRevenue)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      ) : (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography color="text.secondary">
            No report data available. Try adjusting the filters.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
