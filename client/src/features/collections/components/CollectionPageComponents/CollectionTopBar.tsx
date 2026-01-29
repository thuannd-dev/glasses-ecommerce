import { Box, MenuItem, Select, Typography } from "@mui/material";
import type { SortKey } from "../../types";

export function CollectionTopBar({
    totalItems,
    sort,
    setSort,
}: {
    totalItems: number;
    sort: SortKey;
    setSort: (v: SortKey) => void;
}) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: { xs: "flex-start", md: "center" },
                justifyContent: "space-between",
                gap: 2,
                flexDirection: { xs: "column", md: "row" },
            }}
        >
            <Typography sx={{ fontWeight: 900, color: "#111827" }}>
                {totalItems} Items
            </Typography>

            <Select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                size="small"
                sx={{
                    height: 44,
                    borderRadius: 2,    
                    minWidth: 210,
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(17,24,39,0.18)",
                    },
                }}
            >
                <MenuItem value="featured">Featured</MenuItem>
                <MenuItem value="priceAsc">Price: Low → High</MenuItem>
                <MenuItem value="priceDesc">Price: High → Low</MenuItem>
            </Select>
        </Box>
    );
}
