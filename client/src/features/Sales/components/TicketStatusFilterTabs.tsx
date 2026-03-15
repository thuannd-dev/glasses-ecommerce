import { Box, Button } from "@mui/material";

export type TicketStatusFilterValue = "All" | "Pending" | "InProgress" | "Resolved" | "Rejected" | "Closed";

const STATUS_TABS: Array<{ key: TicketStatusFilterValue; label: string }> = [
  { key: "All", label: "All" },
  { key: "Pending", label: "Pending" },
  { key: "InProgress", label: "In Progress" },
  { key: "Resolved", label: "Resolved" },
  { key: "Rejected", label: "Rejected" },
  { key: "Closed", label: "Closed" },
];

export function TicketStatusFilterTabs({
  value,
  onChange,
  hideAll,
}: {
  readonly value: TicketStatusFilterValue;
  readonly onChange: (next: TicketStatusFilterValue) => void;
  readonly hideAll?: boolean;
}) {
  const tabs = hideAll ? STATUS_TABS.filter((t) => t.key !== "All") : STATUS_TABS;
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
        flexWrap: "wrap",
      }}
    >
      {tabs.map((tab) => {
        const isActive = value === tab.key;
        return (
          <Button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            sx={{
              minHeight: 34,
              borderRadius: 999,
              px: 2.2,
              py: 0.6,
              textTransform: "none",
              fontWeight: 600,
              fontSize: 13,
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
