import React, { useState } from "react";
import type { SelectChangeEvent } from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Grid,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import agent from "../../../lib/api/agent";
import type { CreateProductDto } from "../../../lib/hooks/useCreateProduct";
import { useCreateProduct } from "../../../lib/hooks/useCreateProduct";

interface ProductCategoryDto {
  id: string;
  name: string;
}

interface ProductCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PRODUCT_TYPES = [
  { value: 0, label: "Unknown" },
  { value: 1, label: "Frame" },
  { value: 2, label: "Lens" },
  { value: 3, label: "Combo" },
  { value: 4, label: "Accessory" },
  { value: 5, label: "Service" },
];

const PRODUCT_STATUS = [
  { value: 0, label: "Active" },
  { value: 1, label: "Inactive" },
  { value: 2, label: "Draft" },
];

/** Dialog để tạo mới một Product */
export function ProductCreateDialog({
  open,
  onClose,
  onSuccess,
}: ProductCreateDialogProps): React.JSX.Element {
  const [formData, setFormData] = useState<CreateProductDto>({
    categoryId: "",
    productName: "",
    type: 1, // Default to Frame
    description: null,
    brand: null,
    status: 2, // Default to Draft
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Fetch categories
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery<ProductCategoryDto[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      console.log("Fetching categories...");
      const res = await agent.get<ProductCategoryDto[]>("/categories");
      console.log("Categories fetched:", res.data);
      return res.data;
    },
  });

  // Create product mutation
  const createMutation = useCreateProduct();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || null,
    }));
    // Clear error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSelectChange = (
    e: SelectChangeEvent<number | string>
  ): void => {
    const { name, value } = e.target;

    // Convert numeric string values to numbers for type and status
    let finalValue: string | number = value;
    if ((name === "type" || name === "status") && typeof value === "string") {
      finalValue = parseInt(value, 10);
    }

    console.log(`${name} changed to:`, finalValue);

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
    // Clear error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    console.log("Form data before validation:", formData);

    if (!formData.categoryId) {
      errors.categoryId = "Category is required";
    }
    if (!formData.productName.trim()) {
      errors.productName = "Product name is required";
    }
    if (formData.productName.trim().length > 200) {
      errors.productName = "Product name must not exceed 200 characters";
    }
    if (
      formData.description &&
      formData.description.trim().length > 1000
    ) {
      errors.description = "Description must not exceed 1000 characters";
    }
    if (formData.brand && formData.brand.trim().length > 100) {
      errors.brand = "Brand must not exceed 100 characters";
    }

    console.log("Validation errors:", errors);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (): Promise<void> => {
    if (!validateForm()) return;

    const payload: CreateProductDto = {
      ...formData,
      description: formData.description ? formData.description.trim() : null,
      brand: formData.brand ? formData.brand.trim() : null,
    };

    // Debug log
    console.log("Creating product with payload:", payload);

    createMutation.mutate(payload, {
      onSuccess: () => {
        console.log("Product created successfully");
        // Reset form
        setFormData({
          categoryId: "",
          productName: "",
          type: 1,
          description: null,
          brand: null,
          status: 2,
        });
        setValidationErrors({});
        onSuccess?.();
        onClose();
      },
      onError: (error: any) => {
        console.error("Create product error:", error);
      },
    });
  };

  const handleClose = (): void => {
    if (!createMutation.isPending) {
      setFormData({
        categoryId: "",
        productName: "",
        type: 1,
        description: null,
        brand: null,
        status: 2,
      });
      setValidationErrors({});
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: "18px",
          color: "#1a1a1a",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          paddingBottom: "16px",
        }}
      >
        Create New Product
      </DialogTitle>

      <DialogContent sx={{ paddingTop: "24px" }}>
        {categoriesError && (
          <Alert severity="error" sx={{ marginBottom: "16px" }}>
            Failed to load categories
          </Alert>
        )}

        {createMutation.error && (
          <Alert severity="error" sx={{ marginBottom: "16px" }}>
            {(createMutation.error as any)?.response?.data?.message ||
              (createMutation.error as any)?.message ||
              "Failed to create product"}
          </Alert>
        )}

        <Grid container spacing={2}>
          {/* Category Dropdown */}
          <Grid item xs={12}>
            <FormControl fullWidth error={!!validationErrors.categoryId}>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleSelectChange}
                label="Category"
                disabled={categoriesLoading || createMutation.isPending}
              >
                {categories?.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.categoryId && (
                <p
                  style={{
                    color: "#d32f2f",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  {validationErrors.categoryId}
                </p>
              )}
            </FormControl>
          </Grid>

          {/* Product Name */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Product Name"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
              disabled={createMutation.isPending}
              error={!!validationErrors.productName}
              helperText={validationErrors.productName}
              inputProps={{ maxLength: 200 }}
            />
          </Grid>

          {/* Type Dropdown */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                labelId="type-label"
                name="type"
                value={formData.type}
                onChange={handleSelectChange}
                label="Type"
                disabled={createMutation.isPending}
              >
                {PRODUCT_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Status Dropdown */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                name="status"
                value={formData.status}
                onChange={handleSelectChange}
                label="Status"
                disabled={createMutation.isPending}
              >
                {PRODUCT_STATUS.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Brand */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Brand (Optional)"
              name="brand"
              value={formData.brand || ""}
              onChange={handleInputChange}
              disabled={createMutation.isPending}
              error={!!validationErrors.brand}
              helperText={validationErrors.brand}
              inputProps={{ maxLength: 100 }}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description (Optional)"
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              disabled={createMutation.isPending}
              error={!!validationErrors.description}
              helperText={validationErrors.description}
              multiline
              rows={4}
              inputProps={{ maxLength: 1000 }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          padding: "16px",
          borderTop: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <Button
          onClick={handleClose}
          disabled={createMutation.isPending}
          sx={{ color: "#666" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={createMutation.isPending}
          sx={{
            bgcolor: "#1976d2",
            color: "white",
            fontWeight: 600,
            minWidth: "100px",
          }}
        >
          {createMutation.isPending ? (
            <CircularProgress size={20} sx={{ color: "white" }} />
          ) : (
            "Create"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
