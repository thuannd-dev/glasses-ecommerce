import {
  Box,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import type { ProductListItem } from "../../../lib/hooks/useManagerProducts";

interface ProductsTableProps {
  products: ProductListItem[];
  isLoading: boolean;
  onDelete: (productId: string) => Promise<void>;
  onEdit: (product: ProductListItem) => void;
  isDeleting?: boolean;
  hideDelete?: boolean;
}

export default function ProductsTable({
  products,
  isLoading,
  onDelete,
  onEdit,
  isDeleting,
  hideDelete,
}: ProductsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProductName, setSelectedProductName] = useState("");

  const handleDeleteClick = (productId: string, productName: string) => {
    setSelectedProductId(productId);
    setSelectedProductName(productName);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProductId) return;
    try {
      await onDelete(selectedProductId);
      setDeleteDialogOpen(false);
      setSelectedProductId(null);
    } catch {
      // keep dialog open so user can retry/cancel
    }
  };

  if (isLoading) {
    return (
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: "#ffffff" }}>
        <Box sx={{ textAlign: "center", py: 4 }}>Loading products...</Box>
      </Paper>
    );
  }

  if (products.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: "#ffffff" }}>
        <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
          No products found
        </Box>
      </Paper>
    );
  }

  return (
    <>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.08)",
          bgcolor: "#ffffff",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#fafafa", borderBottom: "1px solid rgba(0,0,0,0.12)" }}>
              <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Product Name</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Brand</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Price Range</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Stock</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Category</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, fontSize: 13 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow
                key={product.id}
                sx={{
                  borderBottom: "1px solid rgba(0,0,0,0.08)",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.02)" },
                }}
              >
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {product.firstImage && (
                      <Box
                        component="img"
                        src={product.firstImage.imageUrl}
                        alt={product.firstImage.altText ?? product.productName}
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          objectFit: "cover",
                        }}
                      />
                    )}
                    <Box>
                      <Box sx={{ fontWeight: 700, fontSize: 13 }}>
                        {product.productName}
                      </Box>
                      <Box sx={{ fontSize: 12, color: "text.secondary", fontWeight: 500 }}>
                        {(product.description ?? "").length > 50
                          ? `${(product.description ?? "").substring(0, 50)}...`
                          : product.description ?? ""}
                      </Box>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>{product.brand}</TableCell>
                <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>{product.type}</TableCell>
                <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>
                  ${product.minPrice} - ${product.maxPrice}
                </TableCell>
                <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>
                  <Chip
                    label={product.totalQuantityAvailable}
                    size="small"
                    variant="outlined"
                    sx={{
                      bgcolor:
                        product.totalQuantityAvailable > 50
                          ? "rgba(46,125,50,0.12)"
                          : product.totalQuantityAvailable > 0
                            ? "rgba(245,124,0,0.15)"
                            : "rgba(211,47,47,0.12)",
                      color:
                        product.totalQuantityAvailable > 50
                          ? "#2e7d32"
                          : product.totalQuantityAvailable > 0
                            ? "#e65100"
                            : "#c62828",
                      fontWeight: 700,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>{product.category.name}</TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => onEdit(product)}
                    sx={{ color: "#1976d2" }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  {!hideDelete && (
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(product.id, product.productName)}
                      sx={{ color: "#c62828" }}
                      disabled={isDeleting}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          Are you sure you want to delete <strong>{selectedProductName}</strong>? This action cannot
          be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
