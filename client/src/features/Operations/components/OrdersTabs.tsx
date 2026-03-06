import { Box, Button } from "@mui/material";
import { NavLink } from "react-router-dom";

type OrdersTabKey = "confirmed" | "packing" | "shipped";

const ORDERS_TABS: Array<{ key: OrdersTabKey; label: string; to: string }> = [
  { key: "confirmed", label: "Confirmed", to: "/operations/pack" },
  { key: "packing", label: "Packing", to: "/operations/create-shipment" },
  { key: "shipped", label: "Shipped", to: "/operations/tracking" },
];

export function OrdersTabs({ active }: { active: OrdersTabKey }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        gap: 0.5,
        p: 0.5,
        borderRadius: 999,
        bgcolor: "#F7F7F7",
        border: "1px solid rgba(0,0,0,0.08)",
        alignSelf: "flex-start",
        mb: 1.75,
      }}
    >
      {ORDERS_TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <Button
            key={tab.key}
            component={NavLink}
            to={tab.to}
            sx={{
              minHeight: 38,
              borderRadius: 999,
              px: 2.5,
              py: 0.8,
              textTransform: "none",
              fontWeight: 600,
              fontSize: 14,
              color: isActive ? "#171717" : "#6B6B6B",
              position: "relative",
              bgcolor: isActive ? "#FFFFFF" : "transparent",
              border: isActive ? "1px solid rgba(182,140,90,0.4)" : "1px solid transparent",
              boxShadow: isActive ? "0 6px 14px rgba(0,0,0,0.06)" : "none",
              transition: "all 0.18s ease",
              "&:hover": {
                bgcolor: isActive ? "#FFFFFF" : "#FAFAFA",
                color: "#171717",
              },
              "&::after": isActive
                ? {
                    content: '""',
                    display: "block",
                    width: "60%",
                    height: 2,
                    borderRadius: 2,
                    bgcolor: "#B68C5A",
                    position: "absolute",
                    bottom: 6,
                    left: "20%",
                  }
                : undefined,
            }}
          >
            {tab.label}
          </Button>
        );
      })}
    </Box>
  );
}
