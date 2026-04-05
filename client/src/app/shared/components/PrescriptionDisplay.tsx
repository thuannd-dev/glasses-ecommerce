import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import type { PrescriptionData } from "../../../lib/types/prescription";
import { EYE_LABELS } from "../../../lib/types/prescription";

const formatVal = (n: number | null) =>
  n == null ? "—" : Number.isInteger(n) ? String(n) : n.toFixed(2);

const CELL_BORDER = "1px solid rgba(17, 24, 39, 0.12)";

type Props = {
  prescription: PrescriptionData;
  variant?: "inline" | "block";
};

export function PrescriptionDisplay({ prescription, variant = "block" }: Props) {
  if (!prescription?.details?.length) return null;

  const cellSx = {
    py: 0.85,
    px: 1.25,
    fontSize: 12,
    lineHeight: 1.4,
    border: CELL_BORDER,
    verticalAlign: "middle" as const,
  };

  const headCellSx = {
    ...cellSx,
    fontWeight: 700,
    color: "#374151",
    bgcolor: "rgba(17, 24, 39, 0.06)",
  };

  const table = (
    <Table
      size="small"
      sx={{
        width: "100%",
        borderCollapse: "collapse",
      }}
    >
      <TableHead>
        <TableRow>
          <TableCell sx={headCellSx} component="th" scope="col"></TableCell>
          <TableCell sx={headCellSx} component="th" scope="col" align="right">
            SPH
          </TableCell>
          <TableCell sx={headCellSx} component="th" scope="col" align="right">
            CYL
          </TableCell>
          <TableCell sx={headCellSx} component="th" scope="col" align="right">
            Axis
          </TableCell>
          <TableCell sx={headCellSx} component="th" scope="col" align="right">
            PD
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {prescription.details.map((row) => (
          <TableRow key={row.eye}>
            <TableCell sx={{ ...cellSx, fontWeight: 600, color: "#111827" }}>
              {EYE_LABELS[row.eye]}
            </TableCell>
            <TableCell sx={{ ...cellSx, textAlign: "right" }}>{formatVal(row.sph)}</TableCell>
            <TableCell sx={{ ...cellSx, textAlign: "right" }}>{formatVal(row.cyl)}</TableCell>
            <TableCell sx={{ ...cellSx, textAlign: "right" }}>{formatVal(row.axis)}</TableCell>
            <TableCell sx={{ ...cellSx, textAlign: "right" }}>{formatVal(row.pd)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (variant === "inline") {
    return (
      <Box sx={{ mt: 0.75, maxWidth: 360 }}>
        <Typography
          component="h4"
          fontSize={12}
          fontWeight={700}
          color="text.secondary"
          sx={{ mb: 0.5, letterSpacing: "0.02em" }}
        >
          Prescription detail
        </Typography>
        <TableContainer
          sx={{
            border: CELL_BORDER,
            borderRadius: 1,
            overflow: "hidden",
            bgcolor: "#fff",
            boxShadow: "0 1px 2px rgba(17, 24, 39, 0.04)",
          }}
        >
          {table}
        </TableContainer>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        mt: 1,
        p: 1.5,
        bgcolor: "rgba(17,24,39,0.04)",
        borderRadius: 1.5,
        border: "1px solid rgba(17,24,39,0.08)",
      }}
    >
      <Typography fontSize={12} fontWeight={700} color="text.secondary" sx={{ mb: 0.5 }}>
        Prescription detail
      </Typography>
      <TableContainer
        sx={{
          border: CELL_BORDER,
          borderRadius: 1,
          overflow: "hidden",
          bgcolor: "#fff",
        }}
      >
        {table}
      </TableContainer>
    </Box>
  );
}
