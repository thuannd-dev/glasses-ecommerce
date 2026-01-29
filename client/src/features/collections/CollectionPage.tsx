import { Box, Grid } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { MOCK_PRODUCTS } from "./data/mockProducts";
import type { FiltersState, Product, SortKey } from "./types";

import { CollectionTopBar } from "./components/CollectionPageComponents/CollectionTopBar";
import { FiltersSidebar } from "./components/CollectionPageComponents/FiltersSidebar";
import { ProductGrid } from "./components/CollectionPageComponents/ProductGrid";
import { EmptyState } from "./components/CollectionPageComponents/EmptyState";
import { PaginationBar } from "./components/CollectionPageComponents/PaginationBar";

/** Navbar fixed của bạn */
const NAV_H = 56;
const GAP_TOP = 24;
const GAP_BOTTOM = 56;
const FOOT_H = 0;

/** ✅ mỗi trang 12 sản phẩm */
const PAGE_SIZE = 12;

function defaultFilters(): FiltersState {
    return {
        keyword: "",
        glassesTypes: [],
        shapes: [],
        colors: [],
        frameSizes: [],
        materials: [],
        genders: [],
    };
}

export default function CollectionPage() {
    const { category } = useParams();
    const [sort, setSort] = useState<SortKey>("featured");
    const [filters, setFilters] = useState<FiltersState>(() => defaultFilters());

    /** ✅ pagination state */
    const [page, setPage] = useState(1);

    /** để scroll lên đầu grid khi đổi trang */
    const topRef = useRef<HTMLDivElement | null>(null);

    const allInCategory = useMemo(() => {
        const c = (category || "").toLowerCase();
        if (c === "fashion" || c === "glasses" || c === "lens") {
            return MOCK_PRODUCTS.filter((p) => p.category === c);
        }
        return MOCK_PRODUCTS;
    }, [category]);

    const filteredProducts = useMemo(() => {
        let list: Product[] = allInCategory;

        // keyword: match brand, name, code
        const k = filters.keyword.trim().toLowerCase();
        if (k) {
            list = list.filter((p) => {
                const hay = `${p.brand} ${p.name} ${p.code}`.toLowerCase();
                return hay.includes(k);
            });
        }

        // glasses type
        if (filters.glassesTypes.length) {
            list = list.filter((p) =>
                p.category !== "glasses"
                    ? true
                    : p.glassesType
                        ? filters.glassesTypes.includes(p.glassesType)
                        : false
            );
        }

        // shape
        if (filters.shapes.length) {
            list = list.filter((p) =>
                p.category !== "glasses"
                    ? true
                    : p.shape
                        ? filters.shapes.includes(p.shape)
                        : false
            );
        }

        // colors
        if (filters.colors.length) {
            list = list.filter((p) => {
                if (!p.colors?.length) return false;
                return filters.colors.some((c) => p.colors!.includes(c));
            });
        }

        // frame size
        if (filters.frameSizes.length) {
            list = list.filter((p) =>
                p.category !== "glasses"
                    ? true
                    : p.frameSize
                        ? filters.frameSizes.includes(p.frameSize)
                        : false
            );
        }

        // materials
        if (filters.materials.length) {
            list = list.filter((p) =>
                p.category !== "glasses"
                    ? true
                    : p.material
                        ? filters.materials.includes(p.material)
                        : false
            );
        }

        // genders
        if (filters.genders.length) {
            list = list.filter((p) =>
                p.category !== "glasses"
                    ? true
                    : p.gender
                        ? filters.genders.includes(p.gender)
                        : false
            );
        }

        // sort
        if (sort === "priceAsc") list = [...list].sort((a, b) => a.price - b.price);
        if (sort === "priceDesc") list = [...list].sort((a, b) => b.price - a.price);

        return list;
    }, [allInCategory, filters, sort]);

    /** ✅ reset về trang 1 khi đổi category/filter/sort */
    useEffect(() => {
        setPage(1);
    }, [category, sort, filters]);

    /** ✅ tính pages + cắt list theo trang */
    const totalItems = filteredProducts.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

    const pageProducts = useMemo(() => {
        const safePage = Math.min(page, totalPages);
        const start = (safePage - 1) * PAGE_SIZE;
        return filteredProducts.slice(start, start + PAGE_SIZE);
    }, [filteredProducts, page, totalPages]);

    const handleChangePage = (nextPage: number) => {
        setPage(nextPage);
        // scroll lên đầu khu vực main/grid
        requestAnimationFrame(() => {
            topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    };

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
            <Grid container spacing={4} sx={{ alignItems: "flex-start" }}>
                {/* LEFT */}
                <Grid item xs={12} md={3} lg={2.7}>
                    <FiltersSidebar
                        filters={filters}
                        setFilters={setFilters}
                        onReset={() => setFilters(defaultFilters())}
                        stickyTop={NAV_H + GAP_TOP}
                    />
                </Grid>

                {/* RIGHT */}
                <Grid item xs={12} md={9} lg={9.3}>
                    <Box ref={topRef} />
                    <CollectionTopBar totalItems={totalItems} sort={sort} setSort={setSort} />

                    <Box sx={{ mt: 3 }}>
                        {pageProducts.length ? <ProductGrid products={pageProducts} /> : <EmptyState />}
                    </Box>

                    {/* ✅ Pagination */}
                    {totalItems > 0 ? (
                        <PaginationBar
                            page={Math.min(page, totalPages)}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            pageSize={PAGE_SIZE}
                            onChange={handleChangePage}
                        />
                    ) : null}
                </Grid>
            </Grid>
        </Box>
    );
}
