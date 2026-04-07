import {
  alpha,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from "@mui/material";
import type { PrescriptionData } from "../../../lib/types/prescription";
import { EYE_LABELS } from "../../../lib/types/prescription";

const formatVal = (n: number | null) =>
  n == null ? "—" : Number.isInteger(n) ? String(n) : n.toFixed(2);

type Props = {
  prescription: PrescriptionData;
  variant?: "inline" | "block";
};

const labelTypographySx = {
  mb: 0.5,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.02em",
} as const;

export function PrescriptionDisplay({ prescription, variant = "block" }: Props) {
  const theme = useTheme();

  if (!prescription?.details?.length) return null;

  const cellBorder = `1px solid ${theme.palette.divider}`;
  const cellSx = {
    py: 0.85,
    px: 1.25,
    fontSize: 12,
    lineHeight: 1.4,
    border: cellBorder,
    verticalAlign: "middle" as const,
  };

  const headCellSx = {
    ...cellSx,
    fontWeight: 700,
    color: theme.palette.text.secondary,
    bgcolor:
      theme.palette.mode === "light"
        ? theme.palette.grey[100]
        : alpha(theme.palette.common.white, 0.08),
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
            ADD
          </TableCell>
          <TableCell sx={headCellSx} component="th" scope="col" align="right">
            PD
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {prescription.details.map((row) => (
          <TableRow key={row.eye}>
            <TableCell sx={{ ...cellSx, fontWeight: 600, color: "text.primary" }}>
              {EYE_LABELS[row.eye]}
            </TableCell>
            <TableCell sx={{ ...cellSx, textAlign: "right" }}>{formatVal(row.sph)}</TableCell>
            <TableCell sx={{ ...cellSx, textAlign: "right" }}>{formatVal(row.cyl)}</TableCell>
            <TableCell sx={{ ...cellSx, textAlign: "right" }}>{formatVal(row.axis)}</TableCell>
            <TableCell sx={{ ...cellSx, textAlign: "right" }}>{formatVal(row.add)}</TableCell>
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
          component="span"
          display="block"
          color="text.secondary"
          sx={labelTypographySx}
        >
          Prescription detail
        </Typography>
        <TableContainer
          sx={{
            border: cellBorder,
            borderRadius: 1,
            overflow: "hidden",
            bgcolor: "background.paper",
            boxShadow:
              theme.palette.mode === "light"
                ? `0 1px 2px ${alpha(theme.palette.common.black, 0.04)}`
                : `0 1px 2px ${alpha(theme.palette.common.black, 0.2)}`,
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
        borderRadius: 1.5,
        border: 1,
        borderColor: "divider",
        bgcolor: theme.palette.mode === "light" ? alpha(theme.palette.common.black, 0.04) : alpha(theme.palette.common.white, 0.05),
      }}
    >
      <Typography component="span" display="block" color="text.secondary" sx={labelTypographySx}>
        Prescription detail
      </Typography>
      <TableContainer
        sx={{
          border: cellBorder,
          borderRadius: 1,
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        {table}
      </TableContainer>
    </Box>
  );
}
