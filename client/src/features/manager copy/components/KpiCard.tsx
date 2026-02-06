import { Box, Card, Typography } from "@mui/material";
import { TrendingUp, TrendingDown } from "@mui/icons-material";
import type { KpiData } from "../types";

interface KpiCardProps {
  data: KpiData;
}

export default function KpiCard({ data }: KpiCardProps) {
  const isPositive = (data.change ?? 0) >= 0;

  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 500,
            color: "rgba(15,23,42,0.65)",
          }}
        >
          {data.label}
        </Typography>
        <Typography sx={{ fontSize: 28 }}>{data.icon}</Typography>
      </Box>

      <Typography
        sx={{
          fontSize: 32,
          fontWeight: 900,
          color: "rgba(15,23,42,0.92)",
          mb: 1.5,
        }}
      >
        {typeof data.value === "number" && data.value > 1000
          ? `$${(data.value / 1000).toFixed(1)}K`
          : data.value.toLocaleString()}
      </Typography>

      {data.change !== undefined && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: 13,
            fontWeight: 600,
            color: isPositive ? "rgb(76, 175, 80)" : "rgb(244, 67, 54)",
          }}
        >
          {isPositive ? (
            <TrendingUp sx={{ fontSize: 16 }} />
          ) : (
            <TrendingDown sx={{ fontSize: 16 }} />
          )}
          <span>{Math.abs(data.change)}% from last month</span>
        </Box>
      )}
    </Card>
  );
}
