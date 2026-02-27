import { Box, MenuItem, Select } from "@mui/material";
import type { SortKey } from "../../types";

export function CollectionTopBar({
    sort,
    setSort,
}: {
    sort: SortKey;
    setSort: (v: SortKey) => void;
}) {
    return (
        <Box
            sx={{
                display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
                gap: 2,
                flexDirection: { xs: "column", md: "row" },
            }}
        >
            <Select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                size="small"
        MenuProps={{
          // Không khóa scroll của trang để tránh layout dịch trái/phải
          disableScrollLock: true,
        }}
                sx={{
          height: 44,
                    borderRadius: 2,    
          width: 210,          // cố định width để tránh layout shift
          flexShrink: 0,
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
