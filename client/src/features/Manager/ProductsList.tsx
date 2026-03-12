import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Pagination,
  Grid,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ViewListIcon from "@mui/icons-material/ViewList";
import GridViewIcon from "@mui/icons-material/GridView";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useManagerProducts } from "../../lib/hooks/useManagerProducts";
import type { ProductListItem } from "../../lib/hooks/useManagerProducts";
import ProductsTable from "./components/ProductsTable";
import ProductCard, { ProductDetailModal } from "./components/ProductCard";
import { toast } from "react-toastify";
import axios from "axios";

export default function ProductsList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get("status") || "");
  const [selectedType, setSelectedType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState(0); // 0=CreatedAt, 1=Price, 2=Name
  const [sortOrder, setSortOrder] = useState(1); // 0=Asc, 1=Desc
  const [viewMode, setViewMode] = useState<"table" | "gallery">("table");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const { products, totalPages, totalCount, isLoading, deleteProduct, isDeleting } = useManagerProducts({
    pageNumber,
    pageSize,
    search: searchTerm || undefined,
    brand: selectedBrand || undefined,
    status: selectedStatus || undefined,
    type: selectedType || undefined,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    sortBy,
    sortOrder,
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPageNumber(1);
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedBrand(e.target.value);
    setPageNumber(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setSelectedStatus(e.target.value as string);
    setPageNumber(1);
  };

  const handleTypeChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setSelectedType(e.target.value as string);
    setPageNumber(1);
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinPrice(e.target.value);
    setPageNumber(1);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPrice(e.target.value);
    setPageNumber(1);
  };

  const handleSortByChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setSortBy(e.target.value as number);
    setPageNumber(1);
  };

  const handleSortOrderChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setSortOrder(e.target.value as number);
    setPageNumber(1);
  };

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct(productId);
      toast.success("Product deleted successfully");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as any;
        const message =
          (typeof data === "string" && data) ||
          data?.detail ||
          data?.title ||
          data?.message ||
          "Failed to delete product";
        toast.error(message);
      } else {
        toast.error("Failed to delete product");
      }

      throw err;
    }
  };

  const handleEdit = (product: ProductListItem) => {
    navigate(`/manager/products/${product.id}/edit`);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPageNumber(value);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setPageSize(Number(e.target.value));
    setPageNumber(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedBrand("");
    setSelectedStatus("");
    setSelectedType("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy(0);
    setSortOrder(1);
    setPageNumber(1);
    setPageSize(10);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 2, md: 4, lg: 6 },
        py: 4,
        bgcolor: "#FAFAF8",
        color: "#171717",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography
          sx={{
            fontSize: 11,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#8A8A8A",
            fontWeight: 700,
          }}
        >
          Products Management
        </Typography>

        <Typography sx={{ mt: 1, fontSize: { xs: 24, md: 30 }, fontWeight: 800, color: "#171717" }}>
          All Products ({totalCount})
        </Typography>

        <Typography sx={{ mt: 0.5, color: "#6B6B6B", maxWidth: 520, fontSize: 14 }}>
          Manage your product catalog, view inventory levels, and update product information.
        </Typography>
      </Box>

      {/* Search & Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.08)",
          bgcolor: "#ffffff",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography fontWeight={900} fontSize={14}>
              Create
            </Typography>
            <Typography fontSize={12} color="text.secondary">
              Use the wizard to save progress and resume later.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/manager/products/create")}
          >
            Create Product
          </Button>
        </Stack>

        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search by product name, brand, or description..."
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ mb: 3 }}
        />

        {/* Filters Grid */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="Brand"
              size="small"
              value={selectedBrand}
              onChange={handleBrandChange}
              placeholder="e.g. Ray-Ban"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="Status"
              size="small"
              select
              value={selectedStatus}
              onChange={handleStatusChange as any}
            >
              <MenuItem value="">All / Default (Active)</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="Type"
              size="small"
              select
              value={selectedType}
              onChange={handleTypeChange as any}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="Frame">Frame</MenuItem>
              <MenuItem value="Lens">Lens</MenuItem>
              <MenuItem value="Combo">Combo</MenuItem>
              <MenuItem value="Accessory">Accessory</MenuItem>
              <MenuItem value="Service">Service</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="Min Price"
              size="small"
              type="number"
              value={minPrice}
              onChange={handleMinPriceChange}
              inputProps={{ step: "10" }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="Max Price"
              size="small"
              type="number"
              value={maxPrice}
              onChange={handleMaxPriceChange}
              inputProps={{ step: "10" }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="Sort By"
              size="small"
              select
              value={sortBy}
              onChange={handleSortByChange as any}
            >
              <MenuItem value={0}>Created Date</MenuItem>
              <MenuItem value={1}>Price</MenuItem>
              <MenuItem value={2}>Name</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="Order"
              size="small"
              select
              value={sortOrder}
              onChange={handleSortOrderChange as any}
            >
              <MenuItem value={0}>Ascending</MenuItem>
              <MenuItem value={1}>Descending</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="Page Size"
              size="small"
              select
              value={pageSize}
              onChange={handlePageSizeChange as any}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {/* View Mode Toggle + Buttons */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleClearFilters}
              sx={{ textTransform: "none" }}
            >
              Clear Filters
            </Button>

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newMode) => {
                if (newMode !== null) {
                  setViewMode(newMode);
                }
              }}
              size="small"
            >
              <ToggleButton value="table" sx={{ fontWeight: 600 }}>
                <ViewListIcon sx={{ mr: 1 }} /> List
              </ToggleButton>
              <ToggleButton value="gallery" sx={{ fontWeight: 600 }}>
                <GridViewIcon sx={{ mr: 1 }} /> Gallery
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/manager/products/create")}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 1,
              bgcolor: "#B68C5A",
              "&:hover": { bgcolor: "#9A7548" },
            }}
          >
            Add Product
          </Button>
        </Box>
      </Paper>

      {/* View Switch */}
      {viewMode === "gallery" ? (
        <>
          {/* Gallery View */}
          {isLoading ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography>Loading products...</Typography>
            </Box>
          ) : products.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
              <Typography>No products found</Typography>
            </Box>
          ) : (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {products.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <ProductCard
                    product={product}
                    onViewDetails={(id) => setSelectedProductId(id)}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {/* Modal */}
          <ProductDetailModal
            productId={selectedProductId}
            onClose={() => setSelectedProductId(null)}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
              <Pagination
                count={totalPages}
                page={pageNumber}
                onChange={handlePageChange}
                color="standard"
                size="large"
              />
            </Box>
          )}
        </>
      ) : (
        <>
          {/* List View */}
          <ProductsTable
            products={products}
            isLoading={isLoading}
            onDelete={handleDelete}
            onEdit={handleEdit}
            isDeleting={isDeleting}
            hideDelete={selectedStatus === "Inactive"}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
              <Pagination
                count={totalPages}
                page={pageNumber}
                onChange={handlePageChange}
                color="standard"
                size="large"
              />
            </Box>
          )}
        </>
      )}

    </Box>
  );
}
