import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
} from "@mui/material";
import { OpenInNew } from "@mui/icons-material";
import type { AfterSalesTicket } from "../../../services/afterSales.types";

interface AfterSalesListTableProps {
  tickets: AfterSalesTicket[];
  onViewDetail: (id: string) => void;
  isLoading: boolean;
}

export default function AfterSalesListTable({
  tickets,
  onViewDetail,
  isLoading,
}: AfterSalesListTableProps) {
  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return "warning";
      case 2:
        return "success";
      case 3:
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0:
        return "Pending";
      case 1:
        return "In Progress";
      case 2:
        return "Resolved";
      case 3:
        return "Rejected";
      case 4:
        return "Closed";
      default:
        return "Unknown";
    }
  };

  return (
    <TableContainer component={Paper} sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#FAFAF8" }}>
            <TableCell sx={{ fontWeight: 700, color: "rgba(15,23,42,0.92)" }}>
              Ticket Code
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: "rgba(15,23,42,0.92)" }}>
              Customer
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: "rgba(15,23,42,0.92)" }}>
              Created At
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: "rgba(15,23,42,0.92)" }}>
              Refund Amount
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: "rgba(15,23,42,0.92)" }}>
              Status
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: "rgba(15,23,42,0.92)" }}>
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow
              key={ticket.id}
              sx={{
                "&:hover": { backgroundColor: "rgba(15,23,42,0.02)" },
              }}
            >
              <TableCell sx={{ fontSize: 14, fontWeight: 600 }}>#{ticket.id.substring(7, 13)}</TableCell>
              <TableCell sx={{ fontSize: 14 }}>
                {ticket.customer?.displayName || "Unknown"}
              </TableCell>
              <TableCell sx={{ fontSize: 14 }}>
                {new Date(ticket.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell sx={{ fontSize: 14 }}>
                ${ticket.refundAmount?.toFixed(2) || "—"}
              </TableCell>
              <TableCell>
                <Chip
                  label={getStatusLabel(ticket.ticketStatus)}
                  size="small"
                  color={getStatusColor(ticket.ticketStatus) as any}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Button
                  size="small"
                  endIcon={<OpenInNew sx={{ fontSize: 14 }} />}
                  onClick={() => onViewDetail(ticket.id)}
                  disabled={isLoading}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    color: "rgba(15,23,42,0.75)",
                  }}
                >
                  Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
