import { Box, Pagination, Typography } from "@mui/material";

export function PaginationBar({
    page,
    totalPages,
    totalItems,
    pageSize,
    onChange,
}: {
    page: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onChange: (nextPage: number) => void;
}) {
    const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, totalItems);

    return (
        <Box
            sx={{
                mt: 4,
                pt: 2.5,
                borderTop: "1px solid rgba(17,24,39,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                flexDirection: { xs: "column", md: "row" },
            }}
        >
            <Typography sx={{ color: "rgba(17,24,39,0.7)", fontWeight: 700, fontSize: 13.5 }}>
                Showing <b>{from}</b>–<b>{to}</b> of <b>{totalItems}</b>
            </Typography>

            <Pagination
                page={page}
                count={totalPages}
                onChange={(_, v) => onChange(v)}
                shape="rounded"
                siblingCount={1}
                boundaryCount={1}
                showFirstButton
                showLastButton
                sx={{
                    "& .MuiPaginationItem-root": {
                        fontWeight: 900,
                        borderRadius: 2,
                    },
                }}
            />
        </Box>
    );
}
