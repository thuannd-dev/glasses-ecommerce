import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  Grid,
} from "@mui/material";
import type { Product } from "../../../services/product.types";

const PRODUCT_TYPES = {
  1: "Glasses",
  2: "Contact Lens",
  3: "Accessories",
};

interface ProductDetailDialogProps {
  open: boolean;
  onClose: () => void;
  product: Product;
}

export default function ProductDetailDialog({
  open,
  onClose,
  product,
}: ProductDetailDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: 18 }}>Product Details</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box>
          {/* Product Image */}
          {product.firstImage && (
            <Box
              sx={{
                mb: 3,
                textAlign: "center",
                backgroundColor: "#f5f5f5",
                borderRadius: 2,
                p: 2,
              }}
            >
              <Box
                component="img"
                src={product.firstImage.imageUrl}
                alt={product.firstImage.altText || product.productName}
                sx={{
                  maxWidth: "100%",
                  maxHeight: 300,
                  borderRadius: 1,
                  objectFit: "contain",
                }}
              />
            </Box>
          )}

          {/* Product Name */}
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {product.productName}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* Product Info Grid */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {/* Type */}
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: "rgba(15,23,42,0.6)" }}>
                Type
              </Typography>
              <Chip
                label={
                  PRODUCT_TYPES[product.type as keyof typeof PRODUCT_TYPES] || "Unknown"
                }
                size="small"
                sx={{
                  backgroundColor: "rgba(46, 204, 113, 0.1)",
                  color: "#2ecc71",
                  fontWeight: 600,
                  display: "block",
                  mt: 0.5,
                }}
              />
            </Grid>

            {/* Brand */}
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: "rgba(15,23,42,0.6)" }}>
                Brand
              </Typography>
              <Typography sx={{ mt: 0.5, fontWeight: 500 }}>
                {product.brand || "N/A"}
              </Typography>
            </Grid>

            {/* Min Price */}
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: "rgba(15,23,42,0.6)" }}>
                Minimum Price
              </Typography>
              <Typography sx={{ mt: 0.5, fontWeight: 600, color: "#2ecc71" }}>
                ${product.minPrice.toFixed(2)}
              </Typography>
            </Grid>

            {/* Max Price */}
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: "rgba(15,23,42,0.6)" }}>
                Maximum Price
              </Typography>
              <Typography sx={{ mt: 0.5, fontWeight: 600, color: "#3498db" }}>
                {product.maxPrice ? `$${product.maxPrice.toFixed(2)}` : "N/A"}
              </Typography>
            </Grid>

            {/* Category */}
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: "rgba(15,23,42,0.6)" }}>
                Category
              </Typography>
              <Typography sx={{ mt: 0.5, fontWeight: 500 }}>
                {product.category?.name || "N/A"}
              </Typography>
              {product.category?.description && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 0.5,
                    color: "rgba(15,23,42,0.5)",
                    fontStyle: "italic",
                  }}
                >
                  {product.category.description}
                </Typography>
              )}
            </Grid>

            {/* Quantity */}
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: "rgba(15,23,42,0.6)" }}>
                Quantity Available
              </Typography>
              <Chip
                label={product.totalQuantityAvailable}
                size="small"
                variant="outlined"
                sx={{ display: "block", mt: 0.5 }}
              />
            </Grid>

            {/* Status */}
            {product.status && (
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: "rgba(15,23,42,0.6)" }}>
                  Status
                </Typography>
                <Chip
                  label={product.status}
                  size="small"
                  sx={{
                    display: "block",
                    mt: 0.5,
                    backgroundColor: product.status === "Active" ? "rgba(46, 204, 113, 0.1)" : "rgba(231, 76, 60, 0.1)",
                    color: product.status === "Active" ? "#2ecc71" : "#e74c3c",
                  }}
                />
              </Grid>
            )}
          </Grid>

          {/* Description */}
          {product.description && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="caption" sx={{ color: "rgba(15,23,42,0.6)" }}>
                  Description
                </Typography>
                <Typography
                  sx={{
                    mt: 1,
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "rgba(15,23,42,0.8)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {product.description}
                </Typography>
              </Box>
            </>
          )}

          {/* Metadata */}
          {(product.createdDate || product.updatedDate) && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                {product.createdDate && (
                  <Box>
                    <Typography variant="caption" sx={{ color: "rgba(15,23,42,0.6)" }}>
                      Created Date
                    </Typography>
                    <Typography sx={{ mt: 0.5, fontSize: 13 }}>
                      {new Date(product.createdDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
                {product.updatedDate && (
                  <Box>
                    <Typography variant="caption" sx={{ color: "rgba(15,23,42,0.6)" }}>
                      Updated Date
                    </Typography>
                    <Typography sx={{ mt: 0.5, fontSize: 13 }}>
                      {new Date(product.updatedDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" sx={{ backgroundColor: "#2ecc71" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
