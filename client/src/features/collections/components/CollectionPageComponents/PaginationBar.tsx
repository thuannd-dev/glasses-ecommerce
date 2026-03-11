import { Box, Typography } from "@mui/material";
import { AppPagination } from "../../../../app/shared/components/AppPagination";

export function PaginationBar({
    page,
    totalPages,
    totalItems,
    pageSize,
    displayedCount,
    onChange,
}: {
    page: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    /** Số sản phẩm thực tế hiển thị trên trang hiện tại (sau client-side filter) */
    displayedCount?: number;
    onChange: (nextPage: number) => void;
}) {
    const from =
        totalItems === 0 || (displayedCount != null && displayedCount === 0)
            ? 0
            : (page - 1) * pageSize + 1;
    const to =
        totalItems === 0
            ? 0
            : displayedCount != null
              ? displayedCount > 0
                  ? from + displayedCount - 1
                  : 0
              : Math.min(page * pageSize, totalItems);

    return (
        <Box>
            <AppPagination
                page={page}
                totalPages={totalPages}
                onChange={onChange}
                totalItems={totalItems}
                pageSize={pageSize}
                displayedCount={displayedCount}
                unitLabel="products"
            />
        </Box>
    );
}
