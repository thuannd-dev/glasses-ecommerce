import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

import agent from "../../../lib/api/agent";
import { useDebouncedValue } from "../../../lib/hooks/useDebouncedValue";
import { useBrands, useCategories } from "../../../lib/hooks/useProducts";
import { useLookups } from "../../../lib/hooks/useLookups";
import { productsQueryParamsSchema } from "../../../lib/schemas/productsQuerySchema";
import type {
  ApiProductItem,
  CreateProductDto,
  ProductsApiResponse,
} from "../../../lib/types/product";

const SORT_BY_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: "Created At" },
  { value: 1, label: "Price" },
  { value: 2, label: "Name" },
];

const SORT_ORDER_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: "Desc" },
  { value: 0, label: "Asc" },
];

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  });
}

export default function ManagerProductsScreen() {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { brands } = useBrands();
  const { data: lookups } = useLookups();

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const [brand, setBrand] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const [sortBy, setSortBy] = useState<number>(0);
  const [sortOrder, setSortOrder] = useState<number>(1);

  // Create product dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProduct, setNewProduct] = useState<CreateProductDto>({
    categoryId: "",
    productName: "",
    type: 1,
    description: null,
    brand: null,
    status: 0, // Draft status
  });

  const queryParams = useMemo(() => {
    const parsed = productsQueryParamsSchema.safeParse({
      pageNumber,
      pageSize,
      categoryIds: categoryIds.length ? categoryIds : null,
      brand: brand || null,
      status: status || null,
      type: type || null,
      minPrice: minPrice === "" ? null : Number(minPrice),
      maxPrice: maxPrice === "" ? null : Number(maxPrice),
      search: debouncedSearch || null,
      sortBy,
      sortOrder,
    });

    if (!parsed.success) return { pageNumber, pageSize, sortBy, sortOrder };

    const p = parsed.data;
    const result: Record<string, unknown> = {};
    if (p.pageNumber != null) result.pageNumber = p.pageNumber;
    if (p.pageSize != null) result.pageSize = p.pageSize;
    if (p.categoryIds?.length) result.categoryIds = p.categoryIds;
    if (p.brand != null && p.brand !== "") result.brand = p.brand;
    if (p.status != null && p.status !== "") result.status = p.status;
    if (p.type != null && p.type !== "") result.type = p.type;
    if (p.minPrice != null) result.minPrice = p.minPrice;
    if (p.maxPrice != null) result.maxPrice = p.maxPrice;
    if (p.search != null && p.search !== "") result.search = p.search;
    if (p.sortBy != null) result.sortBy = p.sortBy;
    if (p.sortOrder != null) result.sortOrder = p.sortOrder;
    return result;
  }, [
    pageNumber,
    pageSize,
    categoryIds,
    brand,
    status,
    type,
    minPrice,
    maxPrice,
    debouncedSearch,
    sortBy,
    sortOrder,
  ]);

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<{ items: ApiProductItem[]; totalCount: number; pageNumber: number; pageSize: number }>(
    {
      queryKey: ["manager-products", queryParams],
      queryFn: async () => {
        const res = await agent.get<ProductsApiResponse>("/products", {
          params: queryParams,
        });
        const d = res.data;
        const rawItems = Array.isArray(d?.items) ? d.items : [];
        return {
          items: rawItems,
          totalCount: d.totalCount ?? 0,
          pageNumber: d.pageNumber ?? pageNumber,
          pageSize: d.pageSize ?? pageSize,
        };
      },
    },
  );

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const productStatusOptions = lookups?.productStatus ?? [];
  const productTypeOptions = lookups?.productType ?? [];

  const resetFilters = () => {
    setPageNumber(1);
    setSearch("");
    setBrand("");
    setStatus("");
    setType("");
    setCategoryIds([]);
    setMinPrice("");
    setMaxPrice("");
    setSortBy(0);
    setSortOrder(1);
    toast.info("Filters reset");
  };

  const handleCreateProduct = async (): Promise<void> => {
    if (!newProduct.categoryId.trim()) {
      toast.error("Category is required");
      return;
    }
    if (!newProduct.productName.trim()) {
      toast.error("Product name is required");
      return;
    }

    setIsCreating(true);
    try {
      const payload: CreateProductDto = {
        categoryId: newProduct.categoryId.trim(),
        productName: newProduct.productName.trim(),
        type: newProduct.type,
        description: newProduct.description?.trim() || null,
        brand: newProduct.brand?.trim() || null,
        status: 0, // Always create with Draft status
      };

      await agent.post("/manager/products", payload);
      toast.success("Product created successfully");
      setCreateDialogOpen(false);
      setNewProduct({
        categoryId: "",
        productName: "",
        type: 1,
        description: null,
        brand: null,
        status: 0,
      });
      setPageNumber(1);
      await refetch();
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "Failed to create product"
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Box sx={{ px: { xs: 2, md: 6, lg: 10 }, py: 4 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5}>
        <Box>
          <Typography sx={{ fontSize: 22, fontWeight: 900 }} color="text.primary">
            Products
          </Typography>
          <Typography sx={{ mt: 0.5, color: "text.secondary" }} fontSize={13}>
            Filter, search, sort, and paginate products from the live API.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="contained" onClick={() => setCreateDialogOpen(true)} disabled={isLoading || isFetching}>
            Create Product
          </Button>
          <Button variant="outlined" onClick={() => refetch()} disabled={isLoading || isFetching}>
            Refresh
          </Button>
          <Button variant="outlined" color="inherit" onClick={resetFilters} disabled={isLoading || isFetching}>
            Reset
          </Button>
        </Stack>
      </Stack>

      <Paper elevation={0} sx={{ mt: 3, p: 2.5, borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              label="Search"
              placeholder="Name / Description / Brand"
              value={search}
              onChange={(e) => {
                setPageNumber(1);
                setSearch(e.target.value);
              }}
              fullWidth
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Brand</InputLabel>
              <Select
                label="Brand"
                value={brand}
                onChange={(e) => {
                  setPageNumber(1);
                  setBrand(String(e.target.value));
                }}
              >
                <MenuItem value="">All</MenuItem>
                {brands.map((b) => (
                  <MenuItem key={b} value={b}>
                    {b}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={status}
                onChange={(e) => {
                  setPageNumber(1);
                  setStatus(String(e.target.value));
                }}
              >
                <MenuItem value="">Default (Active)</MenuItem>
                {productStatusOptions.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                label="Type"
                value={type}
                onChange={(e) => {
                  setPageNumber(1);
                  setType(String(e.target.value));
                }}
              >
                <MenuItem value="">All</MenuItem>
                {productTypeOptions.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                multiple
                value={categoryIds}
                onChange={(e) => {
                  setPageNumber(1);
                  const v = e.target.value;
                  setCategoryIds(typeof v === "string" ? v.split(",") : (v as string[]));
                }}
                renderValue={(selected) => {
                  const map = new Map(categories.map((c) => [c.id, c.name]));
                  const names = (selected as string[]).map((id) => map.get(id) ?? id);
                  return names.join(", ");
                }}
              >
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              label="Min price"
              value={minPrice}
              onChange={(e) => {
                setPageNumber(1);
                setMinPrice(e.target.value);
              }}
              fullWidth
              size="small"
              inputMode="numeric"
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              label="Max price"
              value={maxPrice}
              onChange={(e) => {
                setPageNumber(1);
                setMaxPrice(e.target.value);
              }}
              fullWidth
              size="small"
              inputMode="numeric"
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort by</InputLabel>
              <Select
                label="Sort by"
                value={sortBy}
                onChange={(e) => {
                  setPageNumber(1);
                  setSortBy(Number(e.target.value));
                }}
              >
                {SORT_BY_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Order</InputLabel>
              <Select
                label="Order"
                value={sortOrder}
                onChange={(e) => {
                  setPageNumber(1);
                  setSortOrder(Number(e.target.value));
                }}
              >
                {SORT_ORDER_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mt: 2 }}>
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 900 }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Brand</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 900 }} align="right">
                  Price
                </TableCell>
                <TableCell sx={{ fontWeight: 900 }} align="right">
                  Qty
                </TableCell>
                <TableCell sx={{ fontWeight: 900 }}>ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={26} />
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary" fontSize={13}>
                      No products found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((p) => (
                  <TableRow 
                    key={p.id} 
                    hover 
                    onClick={() => navigate(`/manager/products/${p.id}`)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            overflow: "hidden",
                            border: "1px solid rgba(0,0,0,0.08)",
                            bgcolor: "rgba(0,0,0,0.03)",
                            flexShrink: 0,
                          }}
                        >
                          {p.firstImage?.imageUrl ? (
                            <img
                              src={p.firstImage.imageUrl}
                              alt={p.firstImage.altText ?? p.productName}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : null}
                        </Box>
                        <Box>
                          <Typography fontSize={13.5} fontWeight={800} color="text.primary">
                            {p.productName}
                          </Typography>
                          <Typography fontSize={12} color="text.secondary" noWrap maxWidth={360}>
                            {p.description ?? ""}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{p.brand}</TableCell>
                    <TableCell>
                      <Typography fontSize={13} fontWeight={700}>
                        {p.category?.name}
                      </Typography>
                      <Typography fontSize={12} color="text.secondary">
                        {p.category?.slug}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={String(p.type)}
                        sx={{ bgcolor: "rgba(25,118,210,0.10)", color: "#1565c0", fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>
                      {formatCurrency(p.minPrice)}
                      {p.maxPrice != null && p.maxPrice !== p.minPrice
                        ? ` - ${formatCurrency(p.maxPrice)}`
                        : ""}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>
                      {p.totalQuantityAvailable}
                    </TableCell>
                    <TableCell sx={{ fontFamily: "monospace" }}>{p.id.slice(0, 8)}…</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            disabled={isLoading || isFetching || pageNumber <= 1}
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
          >
            Prev
          </Button>
          <Chip
            label={`Page ${pageNumber} / ${totalPages} · ${totalCount} items`}
            sx={{ bgcolor: "rgba(0,0,0,0.06)", fontWeight: 700 }}
          />
          <Button
            variant="outlined"
            disabled={isLoading || isFetching || pageNumber >= totalPages}
            onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </Stack>
      </Box>

      {/* Create Product Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create New Product</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                value={newProduct.categoryId}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, categoryId: String(e.target.value) })
                }
              >
                <MenuItem value="">
                  <em>Select a category</em>
                </MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Product Name"
              value={newProduct.productName}
              onChange={(e) =>
                setNewProduct({ ...newProduct, productName: e.target.value })
              }
              fullWidth
              required
              placeholder="e.g., Studio Round, Aviator Classic"
            />

            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                label="Type"
                value={newProduct.type}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    type: Number(e.target.value),
                  })
                }
              >
                {productTypeOptions.map((t, idx) => (
                  <MenuItem key={idx} value={idx}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Brand"
              value={newProduct.brand || ""}
              onChange={(e) =>
                setNewProduct({ ...newProduct, brand: e.target.value || null })
              }
              fullWidth
              placeholder="e.g., Ray-Ban, Gucci"
            />

            <TextField
              label="Description"
              value={newProduct.description || ""}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  description: e.target.value || null,
                })
              }
              fullWidth
              multiline
              minRows={3}
              placeholder="Product description..."
            />

            <Box sx={{ p: 1.5, bgcolor: "rgba(33,150,243,0.08)", borderRadius: 1 }}>
              <Typography fontSize={12} fontWeight={700} color="info.main">
                Status: Draft
              </Typography>
              <Typography fontSize={12} color="text.secondary">
                New products are created with Draft status. You can manage them
                later.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateProduct}
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
