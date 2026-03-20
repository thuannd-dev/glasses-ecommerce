import { useCollectionPage } from "./hooks/useCollectionPage";

import { Box, CircularProgress, Typography } from "@mui/material";

import { CollectionTopBar } from "./components/CollectionPageComponents/CollectionTopBar";
import { ProductGrid } from "./components/CollectionPageComponents/ProductGrid";
import { EmptyState } from "./components/CollectionPageComponents/EmptyState";
import { PaginationBar } from "./components/CollectionPageComponents/PaginationBar";

const NAV_H = 56;
const GAP_TOP = 24;
const GAP_BOTTOM = 56;
const FOOT_H = 0;

export default function CollectionPage() {
  const {
    topRef,
    sort,
    setSort,
    filters,
    setFilters,
    page,
    productsToShow,
    categoriesList,
    brandsList,
    isLoading,
    totalPages,
    effectiveTotal,
    showPagination,
    PAGE_SIZE,
    handleChangePage,
  } = useCollectionPage();

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
        background: "linear-gradient(180deg,#FFFFFF 0%,#FAFAF5 100%)",
        pt: `calc(${NAV_H}px + ${GAP_TOP}px)`,
        pb: `calc(${FOOT_H}px + ${GAP_BOTTOM}px)`,
        minHeight: `calc(100vh - ${NAV_H}px - ${FOOT_H}px)`,
        px: { xs: 2, md: 3 },
      }}
    >
      <Box ref={topRef} />

      {/* Top utility bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          pb: 1.5,
          borderBottom: "1px solid #F1F1F1",
        }}
      >
        <Typography
          sx={{
            fontSize: 14,
            color: "#5B5B5B",
          }}
        >
          {effectiveTotal} results
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <CollectionTopBar
            sort={sort}
            setSort={setSort}
            filters={filters}
            setFilters={setFilters}
            categories={categoriesList}
            brands={brandsList}
          />
        </Box>
      </Box>

      {/* Main two-column layout */}
      <Box
        sx={{
          mt: 3,
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: { xs: 3, md: 4 },
          alignItems: "flex-start",
        }}
      >
        {/* Right: grid + pagination */}
        <Box>
          <Box>
            {isLoading ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress />
              </Box>
            ) : productsToShow.length ? (
              <ProductGrid products={productsToShow} />
            ) : (
              <EmptyState />
            )}
          </Box>

          {showPagination && (
            <PaginationBar
              page={Math.min(page, totalPages)}
              totalPages={totalPages}
              totalItems={effectiveTotal}
              pageSize={PAGE_SIZE}
              displayedCount={productsToShow.length}
              onChange={handleChangePage}
            />
          )}
        </Box>
      </Box>

    </Box>
  );
}
