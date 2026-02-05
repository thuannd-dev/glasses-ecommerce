import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Box,
  Paper,
  Typography,
} from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import type { DataRow } from "../types";

interface DataTableProps {
  data: DataRow[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const statusColors: Record<string, "default" | "warning" | "error"> = {
  active: "default",
  pending: "warning",
  inactive: "error",
};

export default function DataTable({
  data,
  onView,
  onEdit,
  onDelete,
}: DataTableProps) {
  return (
    <Paper
      sx={{
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
    >
      {data.length === 0 ? (
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            color: "rgba(15,23,42,0.65)",
          }}
        >
          <Typography>No data available</Typography>
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
                  Name
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
                  sx={{
                    fontWeight: 700,
                    color: "rgba(15,23,42,0.92)",
                    fontSize: 13,
                  }}
                >
                  Created Date
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "rgba(15,23,42,0.92)",
                    fontSize: 13,
                  }}
                >
                  Email
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "rgba(15,23,42,0.92)",
                    fontSize: 13,
                  }}
                >
                  Amount
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 700,
                    color: "rgba(15,23,42,0.92)",
                    fontSize: 13,
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(15,23,42,0.02)",
                    },
                    borderBottom: "1px solid rgba(15,23,42,0.08)",
                  }}
                >
                  <TableCell sx={{ fontSize: 14, fontWeight: 500 }}>
                    {row.name}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                      size="small"
                      color={statusColors[row.status]}
                      variant="outlined"
                      sx={{
                        fontWeight: 600,
                        fontSize: 12,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, color: "rgba(15,23,42,0.65)" }}>
                    {new Date(row.createdDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, color: "rgba(15,23,42,0.65)" }}>
                    {row.email}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>
                    ${row.amount?.toLocaleString()}
                  </TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.75,
                        justifyContent: "center",
                      }}
                    >
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<Visibility sx={{ fontSize: 16 }} />}
                        onClick={() => onView?.(row.id)}
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
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<Edit sx={{ fontSize: 16 }} />}
                        onClick={() => onEdit?.(row.id)}
                        sx={{
                          textTransform: "none",
                          fontSize: 12,
                          color: "rgba(255,152,0,0.8)",
                          "&:hover": {
                            backgroundColor: "rgba(255,152,0,0.08)",
                          },
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<Delete sx={{ fontSize: 16 }} />}
                        onClick={() => onDelete?.(row.id)}
                        sx={{
                          textTransform: "none",
                          fontSize: 12,
                          color: "rgba(244,67,54,0.8)",
                          "&:hover": {
                            backgroundColor: "rgba(244,67,54,0.08)",
                          },
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
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
