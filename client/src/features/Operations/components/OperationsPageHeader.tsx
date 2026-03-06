import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface OperationsPageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  rightSlot?: ReactNode;
  /** Optional count for badge e.g. "10 orders" */
  count?: number;
  countLabel?: string;
}

export function OperationsPageHeader({
  title,
  subtitle,
  eyebrow = "OPERATIONS CENTER",
  rightSlot,
  count,
  countLabel = "orders",
}: OperationsPageHeaderProps) {
  return (
    <Box
      sx={{
        mb: 3,
        display: "flex",
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "space-between",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: 11,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#8A8A8A",
          }}
        >
          {eyebrow}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, mt: 0.75, flexWrap: "wrap" }}>
          <Typography
            sx={{
              fontSize: { xs: 24, md: 28 },
              fontWeight: 800,
              color: "#171717",
            }}
          >
            {title}
          </Typography>
          {count !== undefined && (
            <Typography
              component="span"
              sx={{
                fontSize: 13,
                fontWeight: 600,
                color: "#6B6B6B",
                bgcolor: "#F7F7F7",
                border: "1px solid rgba(0,0,0,0.08)",
                px: 1.25,
                py: 0.25,
                borderRadius: 999,
              }}
            >
              {count} {countLabel}
            </Typography>
          )}
        </Box>
        {subtitle && (
          <Typography
            sx={{
              mt: 0.5,
              color: "#6B6B6B",
              fontSize: 14,
              maxWidth: 560,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {rightSlot && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 1.5,
            minWidth: { xs: "100%", md: "auto" },
          }}
        >
          {rightSlot}
        </Box>
      )}
    </Box>
  );
}

