import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import type { Product, CreateProductRequest } from "../../../services/product.types";

interface ProductDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductRequest) => Promise<void>;
  title: string;
  initialData?: Product;
}

export default function ProductDialog({
  open,
  onClose,
  onSubmit,
  title,
  initialData,
}: ProductDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProductRequest>({
    defaultValues: {
      productName: initialData?.productName || "",
      type: initialData?.type || 1,
      brand: initialData?.brand || "",
      description: initialData?.description || "",
      minPrice: initialData?.minPrice || 0,
      maxPrice: initialData?.maxPrice || undefined,
      categoryId: initialData?.category?.id || "",
      totalQuantityAvailable: initialData?.totalQuantityAvailable || 0,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        productName: initialData?.productName || "",
        type: initialData?.type || 1,
        brand: initialData?.brand || "",
        description: initialData?.description || "",
        minPrice: initialData?.minPrice || 0,
        maxPrice: initialData?.maxPrice || undefined,
        categoryId: initialData?.category?.id || "",
        totalQuantityAvailable: initialData?.totalQuantityAvailable || 0,
      });
      setError(null);
    }
  }, [open, initialData, reset]);

  const handleFormSubmit = async (data: CreateProductRequest) => {
    try {
      setLoading(true);
      setError(null);
      await onSubmit(data);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: 18 }}>{title}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Product Name */}
          <Controller
            name="productName"
            control={control}
            rules={{ required: "Product name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Product Name"
                variant="outlined"
                fullWidth
                size="small"
                error={!!errors.productName}
                helperText={errors.productName?.message}
              />
            )}
          />

          {/* Type */}
          <Controller
            name="type"
            control={control}
            rules={{ required: "Type is required" }}
            render={({ field }) => (
              <FormControl size="small" fullWidth error={!!errors.type}>
                <InputLabel>Type</InputLabel>
                <Select {...field} label="Type">
                  <MenuItem value={1}>Glasses</MenuItem>
                  <MenuItem value={2}>Contact Lens</MenuItem>
                  <MenuItem value={3}>Accessories</MenuItem>
                </Select>
              </FormControl>
            )}
          />

          {/* Brand */}
          <Controller
            name="brand"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Brand"
                variant="outlined"
                fullWidth
                size="small"
                placeholder="Optional"
              />
            )}
          />

          {/* Description */}
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                variant="outlined"
                fullWidth
                size="small"
                multiline
                rows={3}
                placeholder="Optional"
              />
            )}
          />

          {/* Min Price */}
          <Controller
            name="minPrice"
            control={control}
            rules={{
              required: "Minimum price is required",
              min: { value: 0, message: "Price must be positive" },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Minimum Price"
                type="number"
                variant="outlined"
                fullWidth
                size="small"
                error={!!errors.minPrice}
                helperText={errors.minPrice?.message}
                inputProps={{ step: "0.01", min: "0" }}
              />
            )}
          />

          {/* Max Price */}
          <Controller
            name="maxPrice"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Maximum Price"
                type="number"
                variant="outlined"
                fullWidth
                size="small"
                placeholder="Optional"
                inputProps={{ step: "0.01", min: "0" }}
              />
            )}
          />

          {/* Category ID */}
          <Controller
            name="categoryId"
            control={control}
            rules={{ required: "Category is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Category ID"
                variant="outlined"
                fullWidth
                size="small"
                error={!!errors.categoryId}
                helperText={errors.categoryId?.message || "UUID of the product category"}
              />
            )}
          />

          {/* Quantity */}
          <Controller
            name="totalQuantityAvailable"
            control={control}
            rules={{
              required: "Quantity is required",
              min: { value: 0, message: "Quantity must be non-negative" },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Quantity Available"
                type="number"
                variant="outlined"
                fullWidth
                size="small"
                error={!!errors.totalQuantityAvailable}
                helperText={errors.totalQuantityAvailable?.message}
                inputProps={{ min: "0", step: "1" }}
              />
            )}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: "#2ecc71",
            "&:hover": { backgroundColor: "#27ae60" },
            "&:disabled": { backgroundColor: "rgba(46, 204, 113, 0.5)" },
          }}
        >
          {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
          {initialData ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
