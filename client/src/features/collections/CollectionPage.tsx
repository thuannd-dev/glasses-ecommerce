import {
  Box,
  Drawer,
  Button,
  CircularProgress,
} from "@mui/material";

import { useCollectionPage } from "./hooks/useCollectionPage";

import { CollectionTopBar } from "./components/CollectionPageComponents/CollectionTopBar";
import { FiltersSidebar } from "./components/CollectionPageComponents/FiltersSidebar";
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
    openFilter,
    setOpenFilter,
    productsToShow,
    categoriesList,
    brandsList,
    isLoading,
    totalPages,
    effectiveTotal,
    showPagination,
    PAGE_SIZE,
    activeFilterCount,
    handleChangePage,
    defaultFilters,
    initialKeyword,
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
        bgcolor: "#fff",
        pt: `calc(${NAV_H}px + ${GAP_TOP}px)`,
        pb: `calc(${FOOT_H}px + ${GAP_BOTTOM}px)`,
        minHeight: `calc(100vh - ${NAV_H}px - ${FOOT_H}px)`,
        px: { xs: 2, md: 4, lg: 6 },
      }}
    >
      <Box ref={topRef} />

      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
      >
        <CollectionTopBar sort={sort} setSort={setSort} />

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

      <Box sx={{ mt: 3 }}>
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

      <Drawer
        variant="temporary"
        anchor="left"
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        ModalProps={{ disableScrollLock: true }}
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
          onReset={() => {
            setFilters(defaultFilters(initialKeyword));
            setOpenFilter(false);
          }}
          onApply={() => setOpenFilter(false)}
          categories={categoriesList}
          brands={brandsList}
          stickyTop={0}
        />
      </Drawer>
    </Box>
  );
}
