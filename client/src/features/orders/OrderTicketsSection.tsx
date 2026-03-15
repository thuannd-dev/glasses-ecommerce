import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTicketsByOrder } from "../../lib/hooks/useAfterSales";
import type { TicketDetailDto } from "../../lib/types/afterSales";

interface OrderTicketsSectionProps {
  readonly orderId: string;
}

const PALETTE = {
  textMain: "#171717",
  textSecondary: "#6B6B6B",
  textMuted: "#8A8A8A",
  divider: "#F1F1F1",
  cardBorder: "#ECECEC",
  cardBg: "#FFFFFF",
  accent: "#B68C5A",
};

const TICKET_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Return: { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" },
  Warranty: { bg: "#DBEAFE", text: "#1E40AF", border: "#93C5FD" },
  Refund: { bg: "#D1FAE5", text: "#065F46", border: "#A7F3D0" },
  Unknown: { bg: "#F3F4F6", text: "#4B5563", border: "#E5E7EB" },
};

const TICKET_STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Pending: { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" },
  InProgress: { bg: "#DBEAFE", text: "#1E40AF", border: "#93C5FD" },
  Resolved: { bg: "#D1FAE5", text: "#065F46", border: "#A7F3D0" },
  Rejected: { bg: "#FEE2E2", text: "#7F1D1D", border: "#FECACA" },
  Closed: { bg: "#F3F4F6", text: "#4B5563", border: "#E5E7EB" },
};

export function OrderTicketsSection({ orderId }: OrderTicketsSectionProps) {
  const { data: tickets, isLoading, isError, error } = useTicketsByOrder(orderId);
  const [expandedTickets, setExpandedTickets] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (isError || !tickets) {
    return (
      <Alert severity="error">
        {error instanceof Error ? error.message : "Failed to load tickets"}
      </Alert>
    );
  }

  if (tickets.length === 0) {
    return null;
  }

  const toggleTicketExpand = (ticketId: string) => {
    const newExpanded = new Set(expandedTickets);
    if (newExpanded.has(ticketId)) {
      newExpanded.delete(ticketId);
    } else {
      newExpanded.add(ticketId);
    }
    setExpandedTickets(newExpanded);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${PALETTE.cardBorder}`,
        borderRadius: 2.5,
        overflow: "hidden",
        bgcolor: PALETTE.cardBg,
        boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
        mt: 3,
      }}
    >
      <Box
        sx={{
          px: 3,
          pt: 2,
          pb: 1.5,
          borderBottom: `1px solid ${PALETTE.divider}`,
          bgcolor: "#FAFAFA",
        }}
      >
        <Typography
          fontWeight={700}
          fontSize={15}
          sx={{ color: PALETTE.textMain, letterSpacing: 0.2 }}
        >
          Support tickets
        </Typography>
      </Box>
      <Box sx={{ px: 3, py: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {tickets.map((ticket: TicketDetailDto) => {
        const typeColors = TICKET_TYPE_COLORS[ticket.ticketType] || TICKET_TYPE_COLORS.Unknown;
        const statusColors = TICKET_STATUS_COLORS[ticket.ticketStatus] || TICKET_STATUS_COLORS.Pending;
        const isExpanded = expandedTickets.has(ticket.id);

        return (
          <Paper
            key={ticket.id}
            elevation={0}
            sx={{
              border: `1px solid ${PALETTE.cardBorder}`,
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: PALETTE.cardBg,
            }}
          >
            <Box
              onClick={() => toggleTicketExpand(ticket.id)}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                px: 2.5,
                py: 1.5,
                cursor: "pointer",
                "&:hover": { bgcolor: "#FAFAFA", transition: "background-color 180ms ease" },
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography fontSize={13} fontWeight={600} sx={{ color: PALETTE.textMuted }}>
                    Ticket ID:
                  </Typography>
                  <Typography
                    fontSize={13}
                    fontWeight={600}
                    fontFamily="monospace"
                    sx={{ color: PALETTE.textMain, wordBreak: "break-all" }}
                  >
                    {ticket.id.toUpperCase()}
                  </Typography>
                </Box>
                {ticket.refundAmount ? (
                  <Typography fontSize={12} sx={{ color: PALETTE.textSecondary }}>
                    Refund: ${ticket.refundAmount.toFixed(2)}
                  </Typography>
                ) : null}
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
                <Chip
                  size="small"
                  label={ticket.ticketType}
                  sx={{
                    height: 24,
                    fontSize: 12,
                    fontWeight: 600,
                    bgcolor: typeColors.bg,
                    color: typeColors.text,
                    border: `1px solid ${typeColors.border}`,
                  }}
                />
                <Chip
                  size="small"
                  label={ticket.ticketStatus}
                  sx={{
                    height: 24,
                    fontSize: 12,
                    fontWeight: 600,
                    bgcolor: statusColors.bg,
                    color: statusColors.text,
                    border: `1px solid ${statusColors.border}`,
                  }}
                />
                <ExpandMoreIcon
                  sx={{
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 300ms ease",
                    color: PALETTE.textMuted,
                    ml: 0.5,
                  }}
                />
              </Box>
            </Box>

            {isExpanded && (
              <>
                <Box sx={{ borderTop: `1px solid ${PALETTE.divider}` }} />
                <Box sx={{ px: 2.5, py: 2 }}>
                  {/* Reason */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      fontSize={12}
                      fontWeight={600}
                      sx={{ mb: 0.5, color: PALETTE.textSecondary }}
                    >
                      Reason
                    </Typography>
                    <Typography fontSize={13} sx={{ color: PALETTE.textMain }}>
                      {ticket.reason}
                    </Typography>
                  </Box>

                  {/* Products Section */}
                  {ticket.items && ticket.items.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        fontSize={12}
                        fontWeight={600}
                        sx={{ mb: 1, color: PALETTE.textSecondary }}
                      >
                        Products in this ticket
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: "#FAFAFA" }}>
                              <TableCell sx={{ fontSize: 12, fontWeight: 600, color: PALETTE.textSecondary }}>
                                Product
                              </TableCell>
                              <TableCell align="center" sx={{ fontSize: 12, fontWeight: 600, color: PALETTE.textSecondary }}>
                                Qty
                              </TableCell>
                              <TableCell align="right" sx={{ fontSize: 12, fontWeight: 600, color: PALETTE.textSecondary }}>
                                Price
                              </TableCell>
                              <TableCell align="right" sx={{ fontSize: 12, fontWeight: 600, color: PALETTE.textSecondary }}>
                                Total
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {ticket.items.map((item: typeof ticket.items[0]) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    {item.productImageUrl && (
                                      <Avatar
                                        variant="rounded"
                                        src={item.productImageUrl}
                                        sx={{ width: 40, height: 40 }}
                                      />
                                    )}
                                    <Box>
                                      <Typography fontSize={13} sx={{ color: PALETTE.textMain, fontWeight: 500 }}>
                                        {item.productName}
                                      </Typography>
                                      {item.variantName && (
                                        <Typography fontSize={12} sx={{ color: PALETTE.textMuted }}>
                                          {item.variantName}
                                        </Typography>
                                      )}
                                      {item.sku && (
                                        <Typography
                                          fontSize={11}
                                          fontFamily="monospace"
                                          sx={{ color: PALETTE.textMuted }}
                                        >
                                          SKU: {item.sku}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell align="center">
                                  <Typography fontSize={13} sx={{ color: PALETTE.textMain }}>
                                    {item.quantity}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography fontSize={13} sx={{ color: PALETTE.textMain }}>
                                    ${item.unitPrice.toFixed(2)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography
                                    fontSize={13}
                                    fontWeight={600}
                                    sx={{ color: PALETTE.textMain }}
                                  >
                                    ${item.totalPrice.toFixed(2)}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}

                  {/* Additional Info */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box>
                      <Typography
                        fontSize={11}
                        fontWeight={600}
                        sx={{ color: PALETTE.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}
                      >
                        Submitted
                      </Typography>
                      <Typography fontSize={13} sx={{ color: PALETTE.textMain }}>
                        {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </Box>

                    {ticket.staffNotes && (
                      <Box>
                        <Typography
                          fontSize={11}
                          fontWeight={600}
                          sx={{ color: PALETTE.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}
                        >
                          Staff Notes
                        </Typography>
                        <Typography fontSize={13} sx={{ color: PALETTE.textMain }}>
                          {ticket.staffNotes}
                        </Typography>
                      </Box>
                    )}

                    {ticket.policyViolation && (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        <Typography fontSize={12}>{ticket.policyViolation}</Typography>
                      </Alert>
                    )}
                  </Box>
                </Box>
              </>
            )}
          </Paper>
        );
      })}
      </Box>
    </Paper>
  );
}
