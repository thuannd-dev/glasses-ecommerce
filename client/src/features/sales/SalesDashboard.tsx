import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  LinearProgress,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useAccount } from "../../lib/hooks/useAccount";
import { useState } from "react";
import { useLocation } from "react-router";
import { OperationsProvider, useOperations } from "../Operations/context/OperationsContext";
import { ORDER_TYPE_LABEL, ORDER_STATUS_LABEL } from "../Operations/constants";

type Ticket = {
  id: string;
  ticketNumber: string;
  type: "return" | "refund" | "warranty";
  status: "pending" | "processing" | "completed";
  createdAt: string;
  customerName: string;
  amount: number;
  details?: string;
};

const TICKET_TYPE_LABEL: Record<Ticket['type'], string> = {
  return: 'Return',
  refund: 'Refund',
  warranty: 'Warranty',
};

const TICKET_STATUS_LABEL: Record<Ticket['status'], string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
};

const TICKET_STATUS_COLORS: Record<
  Ticket['status'],
  { bg: string; color: string }
> = {
  pending: { bg: 'rgba(25,118,210,0.12)', color: '#1976d2' },
  processing: { bg: 'rgba(245,124,0,0.12)', color: '#f57c00' },
  completed: { bg: 'rgba(46,125,50,0.12)', color: '#2e7d32' },
};

const SAMPLE_TICKETS: Ticket[] = [
  { id: "t1", ticketNumber: "TCK-2026-001", type: "return", status: "pending", createdAt: "2026-02-20T10:00:00Z", customerName: "Nguyễn Văn A", amount: 49.99, details: "Wrong size" },
  { id: "t2", ticketNumber: "TCK-2026-002", type: "refund", status: "processing", createdAt: "2026-02-18T09:15:00Z", customerName: "Trần Thị B", amount: 129.0, details: "Damaged on arrival" },
  { id: "t3", ticketNumber: "TCK-2026-003", type: "warranty", status: "completed", createdAt: "2026-02-15T14:30:00Z", customerName: "Lê Văn C", amount: 0, details: "Lens replacement" },
  { id: "t4", ticketNumber: "TCK-2026-004", type: "return", status: "processing", createdAt: "2026-02-14T12:00:00Z", customerName: "Phạm Thị D", amount: 79.5, details: "Not as described" },
  { id: "t5", ticketNumber: "TCK-2026-005", type: "refund", status: "pending", createdAt: "2026-02-10T08:45:00Z", customerName: "Hoàng Văn E", amount: 59.99, details: "Changed mind" },
];


export default function SalesDashboard() {
  const { currentUser } = useAccount();
  const location = useLocation();
  const [tickets, setTickets] = useState<Ticket[]>(SAMPLE_TICKETS);

  function handleChangeTicketStatus(id: string, status: Ticket["status"]) {
    setTickets((t) => t.map((x) => (x.id === id ? { ...x, status } : x)));
  }

  const pathname = location.pathname.replace(/\/$/, "");
  const showOrders = pathname === "/sales/orders";
  const showAfterSales = pathname === "/sales/after-sales";
  const showOverview = pathname === "/sales" || pathname === "";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 2, md: 6, lg: 10 },
        py: 6,
        bgcolor: "#fafafa",
        color: "rgba(0,0,0,0.87)",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography sx={{ fontSize: 12, letterSpacing: 6, textTransform: "uppercase", color: "text.secondary" }}>
          Sales Console
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 30, fontWeight: 900, color: "text.primary" }}>
          Welcome{currentUser?.displayName ? `, ${currentUser.displayName}` : ""}.
        </Typography>
        {showOverview && (
          <Typography sx={{ mt: 1, color: "text.secondary", maxWidth: 520, fontSize: 14 }}>
            Track revenue, orders, and top performing products at a glance.
          </Typography>
        )}
      </Box>

      {showOverview && (
        <>
          {/* Top metrics */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <Typography fontSize={13} color="text.secondary">
                  Today&apos;s revenue
                </Typography>
                <Typography fontSize={26} fontWeight={900} mt={1} color="text.primary">
                  $12,840
                </Typography>
                <Chip
                  label="+18% vs yesterday"
                  size="small"
                  sx={{
                    mt: 1.5,
                    bgcolor: "rgba(46,125,50,0.12)",
                    color: "#2e7d32",
                    fontWeight: 700,
                  }}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <Typography fontSize={13} color="text.secondary">
                  Orders in progress
                </Typography>
                <Typography fontSize={26} fontWeight={900} mt={1} color="text.primary">
                  74
                </Typography>
                <Typography fontSize={12} color="text.secondary" mt={1}>
                  12 awaiting payment · 9 awaiting shipment
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <Typography fontSize={13} color="text.secondary">
                  Conversion funnel
                </Typography>
                <Typography fontSize={12} color="text.secondary" mt={1}>
                  Visitors → Added to cart → Purchased
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography fontSize={11} color="text.secondary">
                    Cart conversion
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={68}
                    sx={{
                      mt: 0.5,
                      height: 6,
                      borderRadius: 999,
                      bgcolor: "rgba(25,118,210,0.2)",
                      "& .MuiLinearProgress-bar": { bgcolor: "primary.main" },
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Bottom section: fake tables */}
          <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <Typography fontSize={14} fontWeight={800} mb={1.5} color="text.primary">
                  Top products
                </Typography>
                {["Aviator Classic", "Studio Round", "Midnight Square"].map(
                  (name, idx) => (
                    <Box
                      key={name}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 1,
                        borderTop: idx === 0 ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(0,0,0,0.06)",
                      }}
                    >
                      <Box>
                        <Typography fontSize={13.5} fontWeight={700} color="text.primary">
                          {name}
                        </Typography>
                        <Typography fontSize={12} color="text.secondary">
                          32 orders · $4,280
                        </Typography>
                      </Box>
                      <Chip
                        label="In stock"
                        size="small"
                        sx={{
                          bgcolor: "rgba(46,125,50,0.12)",
                          color: "#2e7d32",
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  ),
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <Typography fontSize={14} fontWeight={800} mb={1.5} color="text.primary">
                  Recent orders
                </Typography>
                {["#1024", "#1023", "#1022"].map((code, idx) => (
                  <Box
                    key={code}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 1,
                      borderTop: idx === 0 ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <Box>
                      <Typography fontSize={13.5} fontWeight={700} color="text.primary">
                        Order {code}
                      </Typography>
                      <Typography fontSize={12} color="text.secondary">
                        3 items · $289.00 · 5 min ago
                      </Typography>
                    </Box>
                    <Chip
                      label="Paid"
                      size="small"
                      sx={{
                        bgcolor: "rgba(25,118,210,0.12)",
                        color: "primary.main",
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      {showOrders && (
        <OperationsProvider>
          <Box>
            <Typography fontSize={14} fontWeight={800} mb={2}>
              Orders
            </Typography>
            <OrdersTab />
          </Box>
        </OperationsProvider>
      )}

      {showAfterSales && (
        <Box>
          <Typography fontSize={14} fontWeight={800} mb={2}>
            Return / Refund / Warranty Requests
          </Typography>
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 3, bgcolor: "#ffffff", border: "1px solid rgba(0,0,0,0.08)" }}
          >
            {tickets.length === 0 ? (
              <Typography color="text.secondary">No requests yet.</Typography>
            ) : (
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: 12,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          color: "text.secondary",
                          bgcolor: "rgba(0,0,0,0.02)",
                          borderBottom: "1px solid rgba(0,0,0,0.08)",
                          py: 2,
                          px: 3,
                        }}
                      >
                        Ticket #
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: 12,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          color: "text.secondary",
                          bgcolor: "rgba(0,0,0,0.02)",
                          borderBottom: "1px solid rgba(0,0,0,0.08)",
                          py: 2,
                          px: 3,
                        }}
                      >
                        Type
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: 12,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          color: "text.secondary",
                          bgcolor: "rgba(0,0,0,0.02)",
                          borderBottom: "1px solid rgba(0,0,0,0.08)",
                          py: 2,
                          px: 3,
                        }}
                      >
                        Status
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: 12,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          color: "text.secondary",
                          bgcolor: "rgba(0,0,0,0.02)",
                          borderBottom: "1px solid rgba(0,0,0,0.08)",
                          py: 2,
                          px: 3,
                        }}
                      >
                        Date
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: 12,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          color: "text.secondary",
                          bgcolor: "rgba(0,0,0,0.02)",
                          borderBottom: "1px solid rgba(0,0,0,0.08)",
                          py: 2,
                          px: 3,
                        }}
                      >
                        Customer
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                          fontSize: 12,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          color: "text.secondary",
                          bgcolor: "rgba(0,0,0,0.02)",
                          borderBottom: "1px solid rgba(0,0,0,0.08)",
                          py: 2,
                          px: 3,
                        }}
                      >
                        Amount
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tickets.map((t) => (
                      <TableRow
                        key={t.id}
                        hover
                        sx={{
                          "&:last-child td": { borderBottom: 0 },
                          "& td": {
                            borderBottom: "1px solid rgba(0,0,0,0.06)",
                            py: 2,
                            px: 3,
                            fontSize: 14,
                          },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 600 }}>{t.ticketNumber}</TableCell>
                        <TableCell>
                          <Chip
                            label={TICKET_TYPE_LABEL[t.type]}
                            size="small"
                            sx={{ fontWeight: 600, borderRadius: 1 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            size="small"
                            value={t.status}
                            onChange={(e) => handleChangeTicketStatus(t.id, e.target.value as any)}
                            renderValue={(val) => (
                              <Chip
                                label={TICKET_STATUS_LABEL[val as Ticket['status']]}
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  borderRadius: 1,
                                  bgcolor: TICKET_STATUS_COLORS[val as Ticket['status']].bg,
                                  color: TICKET_STATUS_COLORS[val as Ticket['status']].color,
                                }}
                              />
                            )}
                            sx={{
                              minWidth: 120,
                              '& .MuiSelect-select': { p: 0 },
                            }}
                          >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="processing">Processing</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary" }}>
                          {new Date(t.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>{t.customerName}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {t.amount ? t.amount.toLocaleString("en-US", { style: "currency", currency: "USD" }) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
}

function OrdersTab() {
  const { orders, ordersLoading, updateStatus, openCreateShipment } = useOperations();

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: "#ffffff", border: "1px solid rgba(0,0,0,0.08)" }}>
      {ordersLoading ? (
        <LinearProgress sx={{ borderRadius: 1 }} />
      ) : orders.length === 0 ? (
        <Typography color="text.secondary">No orders yet.</Typography>
      ) : (
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    color: "text.secondary",
                    bgcolor: "rgba(0,0,0,0.02)",
                    borderBottom: "1px solid rgba(0,0,0,0.08)",
                    py: 2,
                    px: 3,
                  }}
                >
                  Order #
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    color: "text.secondary",
                    bgcolor: "rgba(0,0,0,0.02)",
                    borderBottom: "1px solid rgba(0,0,0,0.08)",
                    py: 2,
                    px: 3,
                  }}
                >
                  Type
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    color: "text.secondary",
                    bgcolor: "rgba(0,0,0,0.02)",
                    borderBottom: "1px solid rgba(0,0,0,0.08)",
                    py: 2,
                    px: 3,
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    color: "text.secondary",
                    bgcolor: "rgba(0,0,0,0.02)",
                    borderBottom: "1px solid rgba(0,0,0,0.08)",
                    py: 2,
                    px: 3,
                  }}
                >
                  Date
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    color: "text.secondary",
                    bgcolor: "rgba(0,0,0,0.02)",
                    borderBottom: "1px solid rgba(0,0,0,0.08)",
                    py: 2,
                    px: 3,
                  }}
                >
                  Customer
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    color: "text.secondary",
                    bgcolor: "rgba(0,0,0,0.02)",
                    borderBottom: "1px solid rgba(0,0,0,0.08)",
                    py: 2,
                    px: 3,
                  }}
                >
                  Amount
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow
                  key={order.id}
                  hover
                  sx={{
                    "&:last-child td": { borderBottom: 0 },
                    "& td": {
                      borderBottom: "1px solid rgba(0,0,0,0.06)",
                      py: 2,
                      px: 3,
                      fontSize: 14,
                    },
                  }}
                >
                  <TableCell sx={{ fontWeight: 600 }}>{order.orderNumber}</TableCell>
                  <TableCell>
                    <Chip label={ORDER_TYPE_LABEL[order.orderType]} size="small" sx={{ fontWeight: 600, borderRadius: 1 }} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ORDER_STATUS_LABEL[order.status]}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        borderRadius: 1,
                        bgcolor: order.status === "shipped" || order.status === "delivered" ? "rgba(46,125,50,0.12)" : "rgba(25,118,210,0.12)",
                        color: order.status === "shipped" || order.status === "delivered" ? "#2e7d32" : "#1976d2",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{new Date(order.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {order.totalAmount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}
