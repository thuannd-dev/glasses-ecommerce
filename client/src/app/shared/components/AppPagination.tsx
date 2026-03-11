import { Box, Pagination, Typography } from "@mui/material";

export interface AppPaginationProps {
  page: number;
  totalPages: number;
  onChange: (nextPage: number) => void;
  /** Optional: total items for “showing x–y of z” */
  totalItems?: number;
  /** Required if totalItems is set */
  pageSize?: number;
  /** When using client-side filters, can override the count actually shown */
  displayedCount?: number;
  /** Label for items (e.g. "products", "orders") */
  unitLabel?: string;
  /** Align pagination block in its container */
  align?: "flex-start" | "center" | "flex-end" | "space-between";
}

export function AppPagination({
  page,
  totalPages,
  onChange,
  totalItems,
  pageSize,
  displayedCount,
  unitLabel = "items",
  align = "space-between",
}: AppPaginationProps) {
  const hasSummary = totalItems != null && pageSize != null;

  let from = 0;
  let to = 0;

  if (hasSummary) {
    const safeTotal = totalItems ?? 0;
    if (safeTotal === 0 || (displayedCount != null && displayedCount === 0)) {
      from = 0;
      to = 0;
    } else {
      from = (page - 1) * pageSize! + 1;
      if (displayedCount != null) {
        to = displayedCount > 0 ? from + displayedCount - 1 : 0;
      } else {
        to = Math.min(page * pageSize!, safeTotal);
      }
    }
  }

  return (
    <Box
      sx={{
        mt: 3,
        pt: 2,
        borderTop: "1px solid rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "center",
        justifyContent: align,
        gap: 1.5,
      }}
    >
      {hasSummary && (
        <Typography
          sx={{
            color: "#6B6B6B",
            fontWeight: 500,
            fontSize: 13,
          }}
        >
          Showing{" "}
          <Box component="span" sx={{ fontWeight: 600, color: "#171717" }}>
            {from}
          </Box>
          –
          <Box component="span" sx={{ fontWeight: 600, color: "#171717" }}>
            {to}
          </Box>{" "}
          of{" "}
          <Box component="span" sx={{ fontWeight: 600, color: "#171717" }}>
            {totalItems}
          </Box>{" "}
          {unitLabel}
        </Typography>
      )}

      <Pagination
        page={page}
        count={totalPages}
        onChange={(_, v) => onChange(v)}
        shape="rounded"
        siblingCount={1}
        boundaryCount={1}
        showFirstButton
        showLastButton
        size="small"
        sx={{
          "& .MuiPagination-ul": {
            gap: 0.5,
          },
          "& .MuiPaginationItem-root": {
            fontWeight: 500,
            fontSize: 13,
            borderRadius: 999,
            minWidth: 32,
            height: 32,
            border: "1px solid transparent",
            color: "#6B6B6B",
          },
          "& .MuiPaginationItem-root.Mui-selected": {
            bgcolor: "#FAFAFA",
            borderColor: "#ECECEC",
            color: "#171717",
          },
          "& .MuiPaginationItem-previousNext, & .MuiPaginationItem-firstLast": {
            fontSize: 12,
            color: "#8A8A8A",
          },
        }}
      />
    </Box>
  );
}

