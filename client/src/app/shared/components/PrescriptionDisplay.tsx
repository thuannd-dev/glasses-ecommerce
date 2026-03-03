import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import type { PrescriptionData } from "../../../lib/types/prescription";
import { EYE_LABELS } from "../../../lib/types/prescription";

const formatVal = (n: number | null) =>
  n == null ? "—" : Number.isInteger(n) ? String(n) : n.toFixed(2);

type Props = {
  prescription: PrescriptionData;
  variant?: "inline" | "block";
};

export function PrescriptionDisplay({ prescription, variant = "block" }: Props) {
  if (!prescription?.details?.length) return null;

  const table = (
    <Table size="small" sx={{ "& td, & th": { py: 0.5, px: 1, fontSize: 12 } }}>
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 700 }}></TableCell>
          <TableCell sx={{ fontWeight: 700 }}>SPH</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>CYL</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Axis</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>PD</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {prescription.details.map((row) => (
          <TableRow key={row.eye}>
            <TableCell sx={{ fontWeight: 600 }}>{EYE_LABELS[row.eye]}</TableCell>
            <TableCell>{formatVal(row.sph)}</TableCell>
            <TableCell>{formatVal(row.cyl)}</TableCell>
            <TableCell>{formatVal(row.axis)}</TableCell>
            <TableCell>{formatVal(row.pd)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (variant === "inline") {
    return (
      <Box sx={{ mt: 0.5 }}>
        <Typography fontSize={12} fontWeight={700} color="text.secondary" sx={{ mb: 0.25 }}>
          Prescription
        </Typography>
        {table}
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
        Prescription
      </Typography>
      {table}
    </Box>
  );
}
