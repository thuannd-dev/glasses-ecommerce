import { Box, Button } from "@mui/material";
import { ORDER_STATUS_FILTERS, type OrderStatusFilterKey } from "../../lib/constants/orderStatusFilters";

interface OrderStatusFilterProps {
  readonly activeFilter: OrderStatusFilterKey;
  readonly onFilterChange: (filter: OrderStatusFilterKey) => void;
}

const PALETTE = {
  textMain: "#171717",
  textSecondary: "#6B6B6B",
  textMuted: "#8A8A8A",
  accent: "#B68C5A",
  accentHover: "#9E7748",
  border: "#ECECEC",
};

export function OrderStatusFilter({ activeFilter, onFilterChange }: OrderStatusFilterProps) {
  const filterOptions: OrderStatusFilterKey[] = ["All", "Pending", "Processing", "InTransit", "Complete", "Cancelled"];

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        gap: 1.5,
        mb: 3,
        pb: 2,
        borderBottom: `1px solid ${PALETTE.border}`,
        overflowX: "auto",
        overflowY: "hidden",
        "&::-webkit-scrollbar": {
          height: 4,
        },
        "&::-webkit-scrollbar-track": {
          bgcolor: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: PALETTE.border,
          borderRadius: 2,
        },
      }}
    >
      {filterOptions.map((filter) => (
        <Button
          key={filter}
          onClick={() => onFilterChange(filter)}
          sx={{
            minWidth: "fit-content",
            px: 2,
            py: 1,
            fontSize: 13,
            fontWeight: 600,
            textTransform: "none",
            color: activeFilter === filter ? "#FFFFFF" : PALETTE.textSecondary,
            bgcolor: activeFilter === filter ? PALETTE.accent : "transparent",
            border: activeFilter === filter ? "none" : `1px solid ${PALETTE.border}`,
            borderRadius: 999,
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: activeFilter === filter ? PALETTE.accentHover : "rgba(0,0,0,0.04)",
              borderColor: activeFilter === filter ? "transparent" : PALETTE.textMuted,
            },
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {ORDER_STATUS_FILTERS[filter].label}
        </Button>
      ))}
    </Box>
  );
}
