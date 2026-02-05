import {
    Box,
    Drawer,
    Button,
    CircularProgress,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import { useProducts, useCategories } from "../../lib/hooks/useProducts";
import type { FiltersState, SortKey, Product } from "./types";

import { CollectionTopBar } from "./components/CollectionPageComponents/CollectionTopBar";
import { FiltersSidebar } from "./components/CollectionPageComponents/FiltersSidebar";
import { ProductGrid } from "./components/CollectionPageComponents/ProductGrid";
import { EmptyState } from "./components/CollectionPageComponents/EmptyState";
import { PaginationBar } from "./components/CollectionPageComponents/PaginationBar";

/* ================== layout const ================== */
const NAV_H = 56;
const GAP_TOP = 24;
const GAP_BOTTOM = 56;
const FOOT_H = 0;

/** mỗi trang 8 sản phẩm (theo API pagination) */
const PAGE_SIZE = 8;

/* ================== helpers ================== */
function defaultFilters(initialKeyword: string): FiltersState {
    return {
        keyword: initialKeyword,
        glassesTypes: [],
        shapes: [],
        colors: [],
        frameSizes: [],
        materials: [],
        genders: [],
        minPrice: null,
        maxPrice: null,
        brand: null,
    };
}

/* ================== component ================== */
export default function CollectionPage() {
    const { category } = useParams();
    const [searchParams] = useSearchParams();
    const initialKeyword = searchParams.get("search") ?? "";

    const [sort, setSort] = useState<SortKey>("featured");
    const [filters, setFilters] = useState<FiltersState>(() =>
        defaultFilters(initialKeyword),
    );

    /** pagination */
    const [page, setPage] = useState(1);

    /** drawer filter */
    const [openFilter, setOpenFilter] = useState(false);

    /** scroll top */
    const topRef = useRef<HTMLDivElement | null>(null);

    /* ================== map sort -> API sortBy/sortOrder ================== */
    const sortBy = sort === "featured" ? 0 : 1;
    const sortOrder = sort === "priceDesc" ? 1 : 0;

    /* ================== Categories từ API ================== */
    const { categories } = useCategories();

    /* ================== API: products ================== */
    const categorySlug = (category || "").toLowerCase();

    /* ================== sync glassesTypes với slug trên URL ================== */
    useEffect(() => {
        if (categorySlug === "sunglasses" || categorySlug === "eyeglasses") {
            setFilters((prev) =>
                prev.glassesTypes.length === 1 &&
                    prev.glassesTypes[0] === categorySlug
                    ? prev
                    : { ...prev, glassesTypes: [categorySlug] },
            );
        } else {
            setFilters((prev) =>
                prev.glassesTypes.length === 0 ? prev : { ...prev, glassesTypes: [] },
            );
        }
    }, [categorySlug]);

    // Ưu tiên filter Type (Eyeglasses / Sunglasses) nếu người dùng chọn
    const categoriesList = Array.isArray(categories) ? categories : [];
    let categoryIds: string[] | undefined;
    if (filters.glassesTypes.length && categoriesList.length) {
        const wantedSlugs = filters.glassesTypes.map((t) => {
            if (t === "eyeglasses") return "eyeglasses";
            if (t === "sunglasses") return "sunglasses";
            return String(t).toLowerCase();
        });

        categoryIds = categoriesList
            .filter((c) =>
                wantedSlugs.includes(c.slug.toLowerCase()) ||
                wantedSlugs.includes(c.name.toLowerCase()),
            )
            .map((c) => c.id);
    } else if (categoriesList.length && categorySlug) {
        // Nếu không chọn Type, map theo route /collections/:category
        let matched = categoriesList.find(
            (c) =>
                c.slug.toLowerCase() === categorySlug ||
                c.name.toLowerCase() === categorySlug,
        );

        // Fallback cho các route cũ: /collections/glasses, /collections/fashion, /collections/lens
        if (!matched) {
            const fallbackSlug =
                categorySlug === "glasses"
                    ? "eyeglasses"
                    : categorySlug === "fashion"
                        ? "sunglasses"
                        : categorySlug;

            matched = categoriesList.find(
                (c) => c.slug.toLowerCase() === fallbackSlug,
            );
        }

        categoryIds = matched ? [matched.id] : undefined;
    }

    const {
        products: apiProducts,
        totalCount: totalItems,
        isLoading,
    } = useProducts(
        {
            pageNumber: page,
            pageSize: PAGE_SIZE,
            categoryIds,
            search: filters.keyword.trim() || undefined,
            minPrice: filters.minPrice ?? undefined,
            maxPrice: filters.maxPrice ?? undefined,
            brand: filters.brand ?? undefined,
            sortBy,
            sortOrder,
        },
        {
            // Chỉ fetch khi đã có categories (để có categoryIds đúng) → totalCount đúng theo category
            enabled: !categorySlug || categoriesList.length > 0,
        },
    );

    // Lọc client-side bổ sung theo type (Eyeglasses / Sunglasses) nếu cần
    const pageProducts: Product[] = useMemo(() => {
        const list = Array.isArray(apiProducts) ? apiProducts : [];
        if (!filters.glassesTypes.length) return list;
        return list.filter(
            (p) => p.glassesType && filters.glassesTypes.includes(p.glassesType),
        );
    }, [apiProducts, filters.glassesTypes]);

    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

    /* ================== sync filters.keyword with URL search param ================== */
    useEffect(() => {
        const urlKeyword = searchParams.get("search") ?? "";
        setFilters((prev) =>
            prev.keyword === urlKeyword
                ? prev
                : { ...prev, keyword: urlKeyword },
        );
    }, [searchParams, setFilters]);

    /* ================== reset page khi đổi category/sort/filters ================== */
    useEffect(() => {
        setPage(1);
    }, [category, sort, filters]);

    const handleChangePage = (nextPage: number) => {
        setPage(nextPage);
        requestAnimationFrame(() => {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        });
    };

    /* ================== scroll lên đầu khi đổi category ================== */
    useEffect(() => {
        requestAnimationFrame(() => {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        });
    }, [categorySlug]);

    /* ================== active filter count ================== */
    const activeFilterCount =
        filters.glassesTypes.length +
        filters.shapes.length +
        filters.colors.length +
        filters.frameSizes.length +
        filters.materials.length +
        filters.genders.length +
        (filters.minPrice ? 1 : 0) +
        (filters.maxPrice ? 1 : 0) +
        (filters.brand ? 1 : 0);

    /* ================== render ================== */
    return (
        <Box
            component="main"
            sx={{
                position: "relative",
                left: "50%",
                right: "50%",
                ml: "-50vw",
                mr: "-50vw",
                width: "100vw",
                bgcolor: "#fff",
                pt: `calc(${NAV_H}px + ${GAP_TOP}px)`,
                pb: `calc(${FOOT_H}px + ${GAP_BOTTOM}px)`,
                minHeight: `calc(100vh - ${NAV_H}px - ${FOOT_H}px)`,
                px: { xs: 2, md: 4, lg: 6 },
            }}
        >
            {/* ================== TOP BAR + FILTER BTN ================== */}
            <Box ref={topRef} />

            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap={2}
            >
                <CollectionTopBar
                    totalItems={totalItems}
                    categoryLabel={
                        filters.glassesTypes.length === 1
                            ? filters.glassesTypes[0] === "eyeglasses"
                                ? "eyeglasses"
                                : filters.glassesTypes[0] === "sunglasses"
                                  ? "sunglasses"
                                  : null
                            : null
                    }
                    sort={sort}
                    setSort={setSort}
                />

                <Button
                    variant="outlined"
                    sx={{
                        color: "black",
                        borderColor: "black",
                        "&:hover": {
                            borderColor: "black",
                            color: "black",
                        },
                        borderRadius: 4,
                    }}
                    onClick={() => setOpenFilter(true)}
                >
                    Filter{activeFilterCount > 0 && ` (${activeFilterCount})`}
                </Button>
            </Box>

            {/* ================== PRODUCTS ================== */}
            <Box sx={{ mt: 3 }}>
                {isLoading ? (
                    <Box display="flex" justifyContent="center" py={6}>
                        <CircularProgress />
                    </Box>
                ) : pageProducts.length ? (
                    <ProductGrid products={pageProducts} />
                ) : (
                    <EmptyState />
                )}
            </Box>

            {/* ================== PAGINATION ================== */}
            {totalItems > 0 && (
                <PaginationBar
                    page={Math.min(page, totalPages)}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    pageSize={PAGE_SIZE}
                    displayedCount={pageProducts.length}
                    onChange={handleChangePage}
                />
            )}

            {/* ================== FILTER DRAWER ================== */}
            <Drawer
                variant="temporary"
                anchor="left"
                open={openFilter}
                onClose={() => setOpenFilter(false)}
                ModalProps={{
                    disableScrollLock: true,
                }}
                sx={{
                    "& .MuiDrawer-paper": {
                        top: `${NAV_H}px`,
                        height: `calc(100vh - ${NAV_H}px)`,
                        width: { xs: "90vw", sm: 360 },
                        pt: 2,
                        boxSizing: "border-box",
                    },
                    "& .MuiBackdrop-root": {
                        top: `${NAV_H}px`,
                        height: `calc(100vh - ${NAV_H}px)`,
                    },
                }}
            >
                <FiltersSidebar
                    filters={filters}
                    setFilters={setFilters}
                    onReset={() => setFilters(defaultFilters(initialKeyword))}
                    stickyTop={0}
                />
            </Drawer>

        </Box>
    );
}
