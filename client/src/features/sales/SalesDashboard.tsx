import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  LinearProgress,
  Select,
  MenuItem,
  IconButton,
  Collapse,
} from "@mui/material";
import { useAccount } from "../../lib/hooks/useAccount";
import { useState } from "react";
import { useLocation } from "react-router";
import { OperationsProvider, useOperations } from "../Operations/context/OperationsContext";
import { OrderCard } from "../Operations/components/OrderCard";

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

const SAMPLE_TICKETS: Ticket[] = [
  { id: "t1", ticketNumber: "TCK-2026-001", type: "return", status: "pending", createdAt: "2026-02-20T10:00:00Z", customerName: "Nguyễn Văn A", amount: 49.99, details: "Wrong size" },
  { id: "t2", ticketNumber: "TCK-2026-002", type: "refund", status: "processing", createdAt: "2026-02-18T09:15:00Z", customerName: "Trần Thị B", amount: 129.0, details: "Damaged on arrival" },
  { id: "t3", ticketNumber: "TCK-2026-003", type: "warranty", status: "completed", createdAt: "2026-02-15T14:30:00Z", customerName: "Lê Văn C", amount: 0, details: "Lens replacement" },
  { id: "t4", ticketNumber: "TCK-2026-004", type: "return", status: "processing", createdAt: "2026-02-14T12:00:00Z", customerName: "Phạm Thị D", amount: 79.5, details: "Not as described" },
  { id: "t5", ticketNumber: "TCK-2026-005", type: "refund", status: "pending", createdAt: "2026-02-10T08:45:00Z", customerName: "Hoàng Văn E", amount: 59.99, details: "Changed mind" },
];

function TicketCard({ ticket, onChangeStatus }: { ticket: Ticket; onChangeStatus: (id: string, status: Ticket["status"]) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid rgba(0,0,0,0.06)" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography fontWeight={800}>{ticket.ticketNumber}</Typography>
          <Typography fontSize={13} color="text.secondary">
            {ticket.type.toUpperCase()} · {new Date(ticket.createdAt).toLocaleString()} · {ticket.customerName}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography fontWeight={700}>{ticket.amount ? `$${ticket.amount.toFixed(2)}` : "—"}</Typography>
          <Select size="small" value={ticket.status} onChange={(e) => onChangeStatus(ticket.id, e.target.value as any)}>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
          <IconButton onClick={() => setOpen((s) => !s)} size="small">
            <Chip label="Details" size="small" />
          </IconButton>
        </Box>
      </Box>
      <Collapse in={open}>
        <Box sx={{ mt: 2 }}>
          <Typography fontSize={13} color="text.secondary">{ticket.details}</Typography>
        </Box>
      </Collapse>
    </Paper>
  );
}

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
        <Typography sx={{ mt: 1, color: "text.secondary", maxWidth: 520, fontSize: 14 }}>
          Track revenue, orders, and top performing products at a glance.
        </Typography>
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
          <Grid container spacing={2}>
            {tickets.map((t) => (
              <Grid item xs={12} md={6} key={t.id}>
                <TicketCard ticket={t} onChangeStatus={handleChangeTicketStatus} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}

function OrdersTab() {
  const { orders, ordersLoading, updateStatus, openCreateShipment, expandedOrderId, setExpandedOrderId } = useOperations();

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)" }}>
      {ordersLoading ? (
        <LinearProgress sx={{ borderRadius: 1 }} />
      ) : orders.length === 0 ? (
        <Typography color="text.secondary">No orders yet.</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              expanded={expandedOrderId === order.id}
              onToggleExpand={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
              onUpdateStatus={(status) => updateStatus.mutate({ orderId: order.id, status })}
              onCreateShipment={() => openCreateShipment(order.id)}
              canCreateShipment={order.status === "ready_to_ship" && !order.shipmentId}
            />
          ))}
        </Box>
      )}
    </Paper>
  );
}
