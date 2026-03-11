import { Box } from "@mui/material";
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
