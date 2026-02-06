import { useState } from "react";
import {
  Box,
  Card,
  Stack,
  Alert,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
} from "@mui/material";
import { useGetTickets } from "../../../../lib/ticketApi";
import TicketDetailDialog from "./TicketDetailDialog";

interface FilterState {
  email: string;
  type: string;
  status: string;
  fromDate: string;
  toDate: string;
}

interface Ticket {
  id: string;
  ticketNumber: string;
  ticketType: string;
  ticketStatus: string;
  customerEmail: string;
  createdAt: string;
  policyViolation?: string;
}

function getTypeColor(type: string): "default" | "primary" | "secondary" | "error" | "warning" | "info" | "success" {
  switch (type) {
    case "Warranty":
      return "primary";
    case "Return":
      return "warning";
    case "Refund":
      return "error";
    default:
      return "default";
  }
}

function getStatusColor(status: string): "default" | "primary" | "secondary" | "error" | "warning" | "info" | "success" {
  switch (status) {
    case "Pending":
      return "warning";
    case "InProgress":
      return "info";
    case "Resolved":
      return "success";
    case "Rejected":
      return "error";
    default:
      return "default";
  }
}

export default function ProcessTickets() {
  const [filters, setFilters] = useState<FilterState>({
    email: "",
    type: "",
    status: "",
    fromDate: "",
    toDate: "",
  });

  const [openDetail, setOpenDetail] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const { data: ticketsData, isLoading } = useGetTickets(1, 10, {
    customerEmail: filters.email,
    type: filters.type,
    status: filters.status,
    fromDate: filters.fromDate,
    toDate: filters.toDate,
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleTicketRowClick = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setOpenDetail(true);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack spacing={2}>
          <Alert severity="info">
            System will automatically deny tickets that violate policy constraints:
            <br /> • Warranty: within 6 months of purchase
            <br /> • Return: within 7 days of purchase
            <br /> • Refund tickets are processed in the Operation tab
          </Alert>

          <Stack
            spacing={2}
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 2,
            }}
          >
            <TextField
              label="Customer Email"
              size="small"
              fullWidth
              value={filters.email}
              onChange={(e) => handleFilterChange("email", e.target.value)}
              placeholder="Search by email"
            />
            <TextField
              label="Ticket Type"
              select
              size="small"
              fullWidth
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
            >
              <option value="">All Types</option>
              <option value="Warranty">Warranty</option>
              <option value="Return">Return</option>
              <option value="Refund">Refund</option>
            </TextField>
            <TextField
              label="Ticket Status"
              select
              size="small"
              fullWidth
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="InProgress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
              <option value="Closed">Closed</option>
            </TextField>
            <TextField
              label="From Date"
              type="date"
              size="small"
              fullWidth
              value={filters.fromDate}
              onChange={(e) => handleFilterChange("fromDate", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="To Date"
              type="date"
              size="small"
              fullWidth
              value={filters.toDate}
              onChange={(e) => handleFilterChange("toDate", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>
        </Stack>
      </Card>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell>Ticket #</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Customer Email</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell>Policy Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ticketsData?.items?.map((ticket: Ticket) => (
                  <TableRow
                    key={ticket.id}
                    hover
                    onClick={() => handleTicketRowClick(ticket.id)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>{ticket.ticketNumber}</TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.ticketType}
                        color={getTypeColor(ticket.ticketType)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.ticketStatus}
                        color={getStatusColor(ticket.ticketStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{ticket.customerEmail}</TableCell>
                    <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {ticket.policyViolation ? (
                        <Chip label="Violation" color="error" size="small" />
                      ) : (
                        <Chip label="OK" color="success" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTicketRowClick(ticket.id);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {selectedTicketId && (
            <TicketDetailDialog
              ticketId={selectedTicketId}
              open={openDetail}
              onClose={() => {
                setOpenDetail(false);
                setSelectedTicketId(null);
              }}
            />
          )}
        </>
      )}
    </Box>
  );
}
