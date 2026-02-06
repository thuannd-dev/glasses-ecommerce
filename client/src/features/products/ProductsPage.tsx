import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  TablePagination,
  IconButton,
  Tooltip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Menu as MenuIcon, Edit, Delete, Add, Visibility } from "@mui/icons-material";
import Sidebar from "../manager copy/layout/Sidebar";
import { productMockService } from "../../services/product.mock";
import type { Product, ProductFilters, ProductType } from "../../services/product.types";
import { toast } from "react-toastify";
import ProductDialog from "./components/ProductDialog";
import ProductDetailDialog from "./components/ProductDetailDialog";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";

const PRODUCT_TYPES = {
  1: "Glasses",
  2: "Contact Lens",
  3: "Accessories",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<ProductType | "">();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Dialogs
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Load products
  const loadProducts = async (filters: Partial<ProductFilters> = {}) => {
    try {
      setLoading(true);
      const response = await productMockService.getProducts({
        pageNumber,
        pageSize,
        search: searchTerm,
        type: selectedType as ProductType,
        ...filters,
      });
      setProducts(response.items);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error("Failed to load products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [pageNumber, pageSize]);

  // Search handler
  const handleSearch = () => {
    setPageNumber(1);
    loadProducts();
  };

  // Create product
  const handleCreate = async (data: any) => {
    try {
      await productMockService.createProduct(data);
      toast.success("Product created successfully");
      setOpenCreateDialog(false);
      loadProducts();
    } catch (error) {
      console.error("Failed to create product:", error);
      toast.error("Failed to create product");
    }
  };

  // Edit product
  const handleEdit = async (data: any) => {
    try {
      await productMockService.updateProduct({
        ...data,
        id: editingProduct!.id,
      });
      toast.success("Product updated successfully");
      setOpenEditDialog(false);
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      console.error("Failed to update product:", error);
      toast.error("Failed to update product");
    }
  };

  // Delete product
  const handleDelete = async () => {
    if (!deletingProductId) return;
    try {
      await productMockService.deleteProduct(deletingProductId);
      toast.success("Product deleted successfully");
      setOpenDeleteDialog(false);
      setDeletingProductId(null);
      loadProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product");
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box sx={{ flex: 1, pt: 4, px: 3 }}>
        {isMobile && (
          <Box sx={{ mb: 2 }}>
            <Button
              onClick={() => setSidebarOpen(true)}
              startIcon={<MenuIcon />}
              sx={{ color: "#2ecc71" }}
            >
              Menu
            </Button>
          </Box>
        )}
        {/* Header */}
        <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Products</h1>
            <p style={{ margin: "4px 0 0 0", color: "rgba(15,23,42,0.6)", fontSize: 14 }}>
              Manage product inventory and details
            </p>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenCreateDialog(true)}
            sx={{
              backgroundColor: "#2ecc71",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { backgroundColor: "#27ae60" },
            }}
          >
            Add Product
          </Button>
        </Box>

        {/* Filters */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "2fr 1fr 1fr 1fr" },
            gap: 2,
            mb: 2,
          }}
        >
          <TextField
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            size="small"
            sx={{
              backgroundColor: "white",
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { borderColor: "#2ecc71" },
                "&.Mui-focused fieldset": { borderColor: "#2ecc71" },
              },
            }}
          />

          <FormControl size="small" sx={{ backgroundColor: "white" }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={selectedType || ""}
              onChange={(e) => {
                setSelectedType((e.target.value as ProductType) || "");
                setPageNumber(1);
              }}
              label="Type"
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value={1}>Glasses</MenuItem>
              <MenuItem value={2}>Contact Lens</MenuItem>
              <MenuItem value={3}>Accessories</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={handleSearch}
            sx={{
              borderColor: "#2ecc71",
              color: "#2ecc71",
              "&:hover": { backgroundColor: "rgba(46, 204, 113, 0.08)" },
            }}
          >
            Search
          </Button>
        </Box>
      </Box>

      {/* Products Table */}
      <TableContainer component={Paper} sx={{ backgroundColor: "white" }}>
        {loading ? (
          <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : products.length === 0 ? (
          <Box sx={{ p: 4 }}>
            <Alert severity="info">No products found. Start by adding a new product.</Alert>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "rgba(46, 204, 113, 0.05)" }}>
                  <TableCell sx={{ fontWeight: 700 }}>Product Name</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Type
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Brand</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Price Range
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Quantity
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow
                    key={product.id}
                    sx={{
                      "&:hover": { backgroundColor: "rgba(46, 204, 113, 0.02)" },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                          component="img"
                          src={product.firstImage?.imageUrl || "https://via.placeholder.com/50"}
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            objectFit: "cover",
                          }}
                        />
                        <Box>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{product.productName}</div>
                          <div style={{ fontSize: 12, color: "rgba(15,23,42,0.6)" }}>
                            {product.category?.name}
                          </div>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={PRODUCT_TYPES[product.type as keyof typeof PRODUCT_TYPES] || "Unknown"}
                        size="small"
                        sx={{
                          backgroundColor: "rgba(46, 204, 113, 0.1)",
                          color: "#2ecc71",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>{product.brand || "-"}</TableCell>
                    <TableCell align="right">
                      ${product.minPrice.toFixed(2)} - ${product.maxPrice ? product.maxPrice.toFixed(2) : "N/A"}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={product.totalQuantityAvailable}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedProduct(product);
                            setOpenDetailDialog(true);
                          }}
                          sx={{ color: "#2ecc71" }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingProduct(product);
                            setOpenEditDialog(true);
                          }}
                          sx={{ color: "#3498db" }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setDeletingProductId(product.id);
                            setOpenDeleteDialog(true);
                          }}
                          sx={{ color: "#e74c3c" }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalCount}
              rowsPerPage={pageSize}
              page={pageNumber - 1}
                onPageChange={(_, newPage) => setPageNumber(newPage + 1)}
              onRowsPerPageChange={(event) => {
                setPageSize(parseInt(event.target.value, 10));
                setPageNumber(1);
              }}
            />
          </>
        )}
      </TableContainer>

      {/* Create Dialog */}
      <ProductDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onSubmit={handleCreate}
        title="Create Product"
      />

      {/* Edit Dialog */}
      <ProductDialog
        open={openEditDialog}
        onClose={() => {
          setOpenEditDialog(false);
          setEditingProduct(null);
        }}
        onSubmit={handleEdit}
        title="Edit Product"
        initialData={editingProduct || undefined}
      />

      {/* Detail Dialog */}
      {selectedProduct && (
        <ProductDetailDialog
          open={openDetailDialog}
          onClose={() => {
            setOpenDetailDialog(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          setDeletingProductId(null);
        }}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
      />
      </Box>
    </Box>
  );
}
