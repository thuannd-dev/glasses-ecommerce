import { Paper, Typography } from "@mui/material";

type SummaryCardProps = {
  label: string;
  value: string | number;
};

export function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <Typography fontSize={12} color="text.secondary">
        {label}
      </Typography>
      <Typography fontSize={22} fontWeight={900}>
        {value}
      </Typography>
    </Paper>
  );
}
