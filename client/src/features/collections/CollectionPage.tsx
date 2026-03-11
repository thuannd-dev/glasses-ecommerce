import { Box, CircularProgress, Drawer, Button, Typography } from "@mui/material";

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
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          <CollectionTopBar sort={sort} setSort={setSort} />

          {/* Mobile filter toggle */}
          <Button
            variant="outlined"
            sx={{
              display: { xs: "flex", md: "none" },
              height: 38,
              borderRadius: 999,
              px: 2,
              borderColor: "rgba(0,0,0,0.08)",
              color: "#121212",
              textTransform: "none",
              fontSize: 14,
              fontWeight: 500,
              bgcolor: "#FFFFFF",
              alignItems: "center",
              gap: 1,
              "&:hover": {
                borderColor: "#B68C5A",
                bgcolor: "#FAFAFA",
              },
            }}
            onClick={() => setOpenFilter(true)}
          >
            <Box component="span">Filter</Box>
            {activeFilterCount > 0 && (
              <Box
                component="span"
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: 999,
                  bgcolor: "#F7F7F7",
                  fontSize: 12,
                  color: "#5B5B5B",
                }}
              >
                {activeFilterCount}
              </Box>
            )}
          </Button>
        </Box>
      </Box>

      {/* Main two-column layout */}
      <Box
        sx={{
          mt: 3,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "320px minmax(0,1fr)" },
          gap: { xs: 3, md: 4 },
          alignItems: "flex-start",
        }}
      >
        {/* Left: filters sidebar (desktop) */}
        <Box sx={{ display: { xs: "none", md: "block" }, alignSelf: "flex-start" }}>
          <FiltersSidebar
            filters={filters}
            setFilters={setFilters}
            onReset={() => {
              setFilters(defaultFilters(initialKeyword));
            }}
            categories={categoriesList}
            brands={brandsList}
            stickyTop={NAV_H + GAP_TOP + 16}
          />
        </Box>

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

      {/* Filters drawer (mobile) */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        ModalProps={{ disableScrollLock: true }}
        sx={{
          display: { xs: "block", md: "none" },
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
