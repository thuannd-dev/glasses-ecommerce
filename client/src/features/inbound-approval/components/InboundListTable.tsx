import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Paper,
  Chip,
  Box,
  Typography,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { InboundRecord, InboundRecordStatus } from "../../../services/inbound.types";

interface InboundListTableProps {
  records: InboundRecord[];
  onViewDetail: (id: string) => void;
  isLoading?: boolean;
}

const sourceTypeLabels: Record<number, string> = {
  0: "Unknown",
  1: "Supplier",
  2: "Return",
  3: "Adjustment",
};

export default function InboundListTable({
  records,
  onViewDetail,
  isLoading = false,
}: InboundListTableProps) {
  return (
    <Paper
      sx={{
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
    >
      {records.length === 0 ? (
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            color: "rgba(15,23,42,0.65)",
          }}
        >
          <Typography>No pending inbound records</Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "rgba(15,23,42,0.05)",
                  borderBottom: "2px solid rgba(15,23,42,0.1)",
                }}
              >
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "rgba(15,23,42,0.92)",
                    fontSize: 13,
                  }}
                >
                  Code / Reference
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "rgba(15,23,42,0.92)",
                    fontSize: 13,
                  }}
                >
                  Source
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "rgba(15,23,42,0.92)",
                    fontSize: 13,
                  }}
                >
                  Created By
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "rgba(15,23,42,0.92)",
                    fontSize: 13,
                  }}
                >
                  Created At
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "rgba(15,23,42,0.92)",
                    fontSize: 13,
                  }}
                >
                  Items
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "rgba(15,23,42,0.92)",
                    fontSize: 13,
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 700,
                    color: "rgba(15,23,42,0.92)",
                    fontSize: 13,
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow
                  key={record.id}
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(15,23,42,0.02)",
                    },
                    borderBottom: "1px solid rgba(15,23,42,0.08)",
                  }}
                >
                  <TableCell sx={{ fontSize: 14, fontWeight: 500 }}>
                    {record.sourceReference || record.id.slice(0, 8)}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, color: "rgba(15,23,42,0.65)" }}>
                    {sourceTypeLabels[record.sourceType]}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, color: "rgba(15,23,42,0.65)" }}>
                    {record.creator?.displayName || "Unknown"}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, color: "rgba(15,23,42,0.65)" }}>
                    {new Date(record.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>
                    {record.totalItems}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        record.status === InboundRecordStatus.PendingApproval
                          ? "Pending"
                          : record.status === InboundRecordStatus.Approved
                            ? "Approved"
                            : "Rejected"
                      }
                      size="small"
                      color={
                        record.status === InboundRecordStatus.PendingApproval
                          ? "warning"
                          : record.status === InboundRecordStatus.Approved
                            ? "success"
                            : "error"
                      }
                      variant="outlined"
                      sx={{
                        fontWeight: 600,
                        fontSize: 12,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="text"
                      startIcon={<Visibility sx={{ fontSize: 16 }} />}
                      onClick={() => onViewDetail(record.id)}
                      disabled={isLoading}
                      sx={{
                        textTransform: "none",
                        fontSize: 12,
                        color: "rgba(25,118,210,0.8)",
                        "&:hover": {
                          backgroundColor: "rgba(25,118,210,0.08)",
                        },
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
      )}
    </Paper>
  );
}
