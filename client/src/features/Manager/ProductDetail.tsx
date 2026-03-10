import {
  Box,
  Paper,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import ImageIcon from "@mui/icons-material/Image";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate, useParams } from "react-router";
import { Fragment, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useProductDetail } from "../../lib/hooks/useProductDetail";
import { useCategories } from "../../lib/hooks/useProducts";
import { useManagerProducts } from "../../lib/hooks/useManagerProducts";
import { toast } from "react-toastify";
import axios from "axios";
import agent from "../../lib/api/agent";

export default function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { product, isLoading, error } = useProductDetail(id);
  const { categories } = useCategories();
  const {
    updateProduct,
    isUpdating,
    addProductImage,
    isAddingImage,
    deleteProductImage,
    isDeletingImage,
    createProductVariant,
    isCreatingVariant,
    addVariantImage,
    isAddingVariantImage,
    updateVariantPreorder,
    isUpdatingVariantPreorder,
    updateVariant,
    isUpdatingVariant,
    reorderProductImages,
    isReorderingProductImages,
    reorderVariantImages,
    isReorderingVariantImages,
  } = useManagerProducts();

  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<string>("");
  const [editProductName, setEditProductName] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [editBrand, setEditBrand] = useState<string>("");
  const [editStatus, setEditStatus] = useState<number>(0);

  const [addImageOpen, setAddImageOpen] = useState(false);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreviewUrl, setNewImagePreviewUrl] = useState<string | null>(null);
  const [newAltText, setNewAltText] = useState<string>("");
  const [newDisplayOrder, setNewDisplayOrder] = useState<number>(1);
  const [newModelUrl, setNewModelUrl] = useState<string>("");

  const [deleteImageOpen, setDeleteImageOpen] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [selectedImageAlt, setSelectedImageAlt] = useState<string>("");

  const [addVariantOpen, setAddVariantOpen] = useState(false);
  const [variantSku, setVariantSku] = useState<string>("");
  const [variantName, setVariantName] = useState<string>("");
  const [variantColor, setVariantColor] = useState<string>("");
  const [variantSize, setVariantSize] = useState<string>("");
  const [variantMaterial, setVariantMaterial] = useState<string>("");
  const [variantFrameWidth, setVariantFrameWidth] = useState<string>("");
  const [variantLensWidth, setVariantLensWidth] = useState<string>("");
  const [variantBridgeWidth, setVariantBridgeWidth] = useState<string>("");
  const [variantTempleLength, setVariantTempleLength] = useState<string>("");
  const [variantPrice, setVariantPrice] = useState<string>("");
  const [variantCompareAtPrice, setVariantCompareAtPrice] = useState<string>("");
  const [variantIsPreOrder, setVariantIsPreOrder] = useState<boolean>(true);

  const [addVariantImageOpen, setAddVariantImageOpen] = useState(false);
  const [selectedVariantIdForImage, setSelectedVariantIdForImage] = useState<string | null>(null);
  const [newVariantImageFile, setNewVariantImageFile] = useState<File | null>(null);
  const [newVariantImagePreviewUrl, setNewVariantImagePreviewUrl] = useState<string | null>(null);
  const [newVariantAltText, setNewVariantAltText] = useState<string>("");
  const [newVariantDisplayOrder, setNewVariantDisplayOrder] = useState<number>(1);
  const [newVariantModelUrl, setNewVariantModelUrl] = useState<string>("");

  const [preorderUpdatingVariantId, setPreorderUpdatingVariantId] = useState<string | null>(null);
  const [expandedVariantImagesId, setExpandedVariantImagesId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleProductImagesDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !id || !product) return;
    const oldIndex = product.images.findIndex((img) => img.id === active.id);
    const newIndex = product.images.findIndex((img) => img.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(product.images, oldIndex, newIndex);
    try {
      await reorderProductImages({
        productId: id,
        imageIds: reordered.map((img) => img.id),
      });
      toast.success("Image order updated");
    } catch {
      toast.error("Failed to reorder images");
    }
  };

  const handleVariantImagesDragEnd = async (event: DragEndEvent, variantId: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !id || !product) return;
    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) return;
    const oldIndex = variant.images.findIndex((img: any) => img.id === active.id);
    const newIndex = variant.images.findIndex((img: any) => img.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(variant.images, oldIndex, newIndex);
    try {
      await reorderVariantImages({
        productId: id,
        variantId,
        imageIds: reordered.map((img: any) => img.id),
      });
      toast.success("Variant image order updated");
    } catch {
      toast.error("Failed to reorder variant images");
    }
  };

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      const res = await agent.post<{ url: string; publicId: string }>("/uploads/image", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ p: 4, textAlign: "center", bgcolor: "#fafafa", minHeight: "100vh" }}>
        <Typography>Loading product details...</Typography>
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box sx={{ p: 4, textAlign: "center", bgcolor: "#fafafa", minHeight: "100vh" }}>
        <Typography color="error">Failed to load product</Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/manager/products")}
          sx={{ mt: 2 }}
        >
          Back to Products
        </Button>
      </Box>
    );
  }

  const handleMediaClick = (imageUrl: string) => {
    window.open(imageUrl, "_blank");
  };

  const getStatusText = (status: number | string) => {
    const statusMap: Record<number | string, string> = {
      0: "Active",
      1: "Inactive",
      2: "Draft",
      "Draft": "Draft",
      "Active": "Active",
      "Inactive": "Inactive",
    };
    return statusMap[status] || "Unknown";
  };

  const getStatusColor = (status: number | string) => {
    const statusText = getStatusText(status);
    const colors: Record<string, string> = {
      Active: "#2e7d32",
      Draft: "#1976d2",
      Inactive: "#757575",
    };
    return colors[statusText] || "#757575";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 2, md: 6, lg: 10 },
        py: 6,
        bgcolor: "#fafafa",
        color: "rgba(0,0,0,0.87)",
      }}
    >
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/manager/products")}
        sx={{
          mb: 3,
          textTransform: "none",
          color: "#1976d2",
          fontWeight: 600,
        }}
      >
        Back to Products
      </Button>

      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography
          sx={{
            fontSize: 12,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "text.secondary",
            fontWeight: 700,
          }}
        >
          Product Details
        </Typography>

        <Typography sx={{ mt: 1, fontSize: 30, fontWeight: 900 }}>
          {product.productName}
        </Typography>

        <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => {
              setEditCategoryId(product.category?.id ?? "");
              setEditProductName(product.productName ?? "");
              setEditDescription(product.description ?? "");
              setEditBrand(product.brand ?? "");

              const s = product.status;
              const numericStatus =
                typeof s === "number" ? s : s === "Active" ? 0 : s === "Inactive" ? 1 : 2;
              setEditStatus(numericStatus);

              setEditOpen(true);
            }}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Edit product
          </Button>

          <Button
            variant="outlined"
            startIcon={<ImageIcon />}
            onClick={() => {
              if (newImagePreviewUrl) URL.revokeObjectURL(newImagePreviewUrl);
              setNewImageFile(null);
              setNewImagePreviewUrl(null);
              setNewAltText("");
              setNewModelUrl("");
              setNewDisplayOrder((product.images?.length ?? 0) + 1);
              setAddImageOpen(true);
            }}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Add image
          </Button>
        </Box>

        <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <Chip
            label={product.brand}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={product.type}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={product.category.name}
            sx={{
              bgcolor: "rgba(25, 118, 210, 0.12)",
              color: "#1976d2",
              fontWeight: 700,
            }}
          />
          <Chip
            label={getStatusText(product.status)}
            sx={{
              bgcolor: getStatusColor(product.status) + "20",
              color: getStatusColor(product.status),
              fontWeight: 700,
            }}
          />
        </Box>
      </Box>

      {/* Basic Info */}
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
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 700, mb: 1 }}>
              DESCRIPTION
            </Typography>
            <Typography sx={{ fontSize: 14, lineHeight: 1.6, fontWeight: 500 }}>
              {product.description}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 700, mb: 1 }}>
              CATEGORY
            </Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
              {product.category.name}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 700, mb: 1 }}>
              TYPE
            </Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
              {product.type}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 700, mb: 1 }}>
              CREATED
            </Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
              {new Date(product.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Product Images — drag to reorder */}
      {product.images.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 900,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <ImageIcon /> Product Images ({product.images.length})
            </Typography>
            {isReorderingProductImages && (
              <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 600 }}>
                Saving order…
              </Typography>
            )}
          </Box>

          <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 2 }}>
            Drag images to reorder. The first image is the primary display image.
          </Typography>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleProductImagesDragEnd}>
            <SortableContext items={product.images.map((img) => img.id)} strategy={rectSortingStrategy}>
              <Grid container spacing={2}>
                {product.images.map((image, index) => (
                  <Grid item xs={12} sm={6} md={3} key={image.id}>
                    <SortableImageCard
                      id={image.id}
                      imageUrl={image.imageUrl}
                      altText={image.altText || "Untitled"}
                      index={index}
                      onDelete={() => {
                        setSelectedImageId(image.id);
                        setSelectedImageAlt(image.altText || "Untitled");
                        setDeleteImageOpen(true);
                      }}
                      onClick={() => handleMediaClick(image.imageUrl)}
                      isDeletingImage={isDeletingImage}
                    />
                  </Grid>
                ))}
              </Grid>
            </SortableContext>
          </DndContext>
        </Box>
      )}

      {/* Variants Table */}
      <Box>
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 900,
            mb: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>Variants ({product.variants.length})</span>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setVariantSku("");
              setVariantName("");
              setVariantColor("#000000");
              setVariantSize("");
              setVariantMaterial("");
              setVariantFrameWidth("");
              setVariantLensWidth("");
              setVariantBridgeWidth("");
              setVariantTempleLength("");
              setVariantPrice("");
              setVariantCompareAtPrice("");
              setVariantIsPreOrder(true);
              setAddVariantOpen(true);
            }}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Add variant
          </Button>
        </Typography>

        {product.variants.length > 0 && (
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
                  <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>SKU</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Variant Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Color</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Stock</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Images</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 13 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {product.variants.map((variant) => (
                  <Fragment key={variant.id}>
                  <TableRow
                    sx={{
                      borderBottom: "1px solid rgba(0,0,0,0.08)",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.02)" },
                    }}
                  >
                    <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>{variant.sku}</TableCell>
                    <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>{variant.variantName || "-"}</TableCell>
                    <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>{variant.color || "-"}</TableCell>
                    <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>${variant.price}</TableCell>
                    <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>
                      <Chip
                        label={variant.quantityAvailable}
                        size="small"
                        sx={{
                          bgcolor:
                            variant.quantityAvailable > 50
                              ? "rgba(46,125,50,0.12)"
                              : variant.quantityAvailable > 0
                                ? "rgba(245,124,0,0.15)"
                                : "rgba(211,47,47,0.12)",
                          color:
                            variant.quantityAvailable > 50
                              ? "#2e7d32"
                              : variant.quantityAvailable > 0
                                ? "#e65100"
                                : "#c62828",
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() =>
                          setExpandedVariantImagesId(
                            expandedVariantImagesId === variant.id ? null : variant.id
                          )
                        }
                        sx={{ minWidth: 0, textTransform: "none", fontWeight: 700, color: "#6a1b9a" }}
                      >
                        {variant.images.length} {expandedVariantImagesId === variant.id ? "▲" : "▼"}
                      </Button>
                    </TableCell>
                    <TableCell sx={{ fontSize: 13 }}>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Chip
                          label={variant.isActive ? "Active" : "Inactive"}
                          size="small"
                          sx={{
                            bgcolor: variant.isActive
                              ? "rgba(46,125,50,0.12)"
                              : "rgba(117,117,117,0.12)",
                            color: variant.isActive ? "#2e7d32" : "#757575",
                            fontWeight: 700,
                          }}
                        />
                        {variant.isPreOrder && (
                          <Chip
                            label="Pre-order"
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 700 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => setEditingVariantId(variant.id)}
                        sx={{ color: "#1976d2" }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <Button
                        size="small"
                        variant="text"
                        disabled={
                          isUpdatingVariantPreorder && preorderUpdatingVariantId === variant.id
                        }
                        onClick={async () => {
                          if (!id) return;
                          try {
                            setPreorderUpdatingVariantId(variant.id);
                            await updateVariantPreorder({
                              productId: id,
                              variantId: variant.id,
                              isPreOrder: !variant.isPreOrder,
                            });
                            toast.success("Pre-order updated successfully");
                          } catch (err) {
                            if (axios.isAxiosError(err)) {
                              const data = err.response?.data as any;
                              const message =
                                (typeof data === "string" && data) ||
                                data?.detail ||
                                data?.title ||
                                data?.message ||
                                "Failed to update pre-order";
                              toast.error(message);
                            } else {
                              toast.error("Failed to update pre-order");
                            }
                          } finally {
                            setPreorderUpdatingVariantId(null);
                          }
                        }}
                        sx={{ minWidth: 0, ml: 1, textTransform: "none", fontWeight: 700 }}
                      >
                        {variant.isPreOrder ? "Unset" : "Pre"}
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedVariantIdForImage(variant.id);
                          if (newVariantImagePreviewUrl) URL.revokeObjectURL(newVariantImagePreviewUrl);
                          setNewVariantImageFile(null);
                          setNewVariantImagePreviewUrl(null);
                          setNewVariantAltText("");
                          setNewVariantModelUrl("");
                          setNewVariantDisplayOrder((variant.images?.length ?? 0) + 1);
                          setAddVariantImageOpen(true);
                        }}
                        disabled={isAddingVariantImage}
                        sx={{ color: "#6a1b9a" }}
                      >
                        <ImageIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>

                  {/* Expandable variant images row with drag-and-drop reorder */}
                  {expandedVariantImagesId === variant.id && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        sx={{
                          bgcolor: "linear-gradient(135deg, #fafafa 0%, #f5f0ff 100%)",
                          background: "linear-gradient(135deg, #fafafa 0%, #f5f0ff 100%)",
                          py: 2.5,
                          px: 3,
                          borderBottom: "2px solid #e8e0f0",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                bgcolor: "#6a1b9a",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <ImageIcon sx={{ fontSize: 15, color: "#fff" }} />
                            </Box>
                            <Box>
                              <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#4a148c" }}>
                                {variant.variantName || variant.sku} — Images ({variant.images.length})
                              </Typography>
                              <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                                Drag to reorder · First image is the primary
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            {isReorderingVariantImages && (
                              <Typography sx={{ fontSize: 11, color: "#6a1b9a", fontWeight: 600 }}>
                                Saving…
                              </Typography>
                            )}
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<ImageIcon sx={{ fontSize: 14 }} />}
                              onClick={() => {
                                setSelectedVariantIdForImage(variant.id);
                                if (newVariantImagePreviewUrl) URL.revokeObjectURL(newVariantImagePreviewUrl);
                                setNewVariantImageFile(null);
                                setNewVariantImagePreviewUrl(null);
                                setNewVariantAltText("");
                                setNewVariantModelUrl("");
                                setNewVariantDisplayOrder((variant.images?.length ?? 0) + 1);
                                setAddVariantImageOpen(true);
                              }}
                              disabled={isAddingVariantImage}
                              sx={{
                                textTransform: "none",
                                fontWeight: 700,
                                fontSize: 12,
                                borderColor: "#6a1b9a",
                                color: "#6a1b9a",
                                "&:hover": { borderColor: "#4a148c", bgcolor: "rgba(106,27,154,0.04)" },
                              }}
                            >
                              Add image
                            </Button>
                          </Box>
                        </Box>

                        {variant.images.length === 0 ? (
                          <Box
                            sx={{
                              py: 4,
                              textAlign: "center",
                              border: "2px dashed rgba(106,27,154,0.25)",
                              borderRadius: 2,
                              bgcolor: "rgba(255,255,255,0.6)",
                            }}
                          >
                            <ImageIcon sx={{ fontSize: 32, color: "rgba(106,27,154,0.3)", mb: 1 }} />
                            <Typography sx={{ fontSize: 13, color: "text.secondary", fontStyle: "italic" }}>
                              No images yet. Click "Add image" to upload.
                            </Typography>
                          </Box>
                        ) : (
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(e) => handleVariantImagesDragEnd(e, variant.id)}
                          >
                            <SortableContext
                              items={variant.images.map((img: any) => img.id)}
                              strategy={rectSortingStrategy}
                            >
                              <Grid container spacing={1.5}>
                                {variant.images.map((img: any, idx: number) => (
                                  <Grid item xs={6} sm={4} md={2} key={img.id}>
                                    <SortableVariantImageCard
                                      id={img.id}
                                      imageUrl={img.imageUrl}
                                      altText={img.altText || "Untitled"}
                                      index={idx}
                                    />
                                  </Grid>
                                ))}
                              </Grid>
                            </SortableContext>
                          </DndContext>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Edit Variant Dialog */}
      {editingVariantId && (
        <VariantEditDialog
          productId={id}
          variant={product.variants.find((v) => v.id === editingVariantId)}
          onClose={() => setEditingVariantId(null)}
          updateVariant={updateVariant}
          isUpdatingVariant={isUpdatingVariant}
          updateVariantPreorder={updateVariantPreorder}
          isUpdatingVariantPreorder={isUpdatingVariantPreorder}
          reorderVariantImages={reorderVariantImages}
          isReorderingVariantImages={isReorderingVariantImages}
        />
      )}

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Update product</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                size="small"
                select
                fullWidth
                label="Category"
                value={editCategoryId}
                onChange={(e) => setEditCategoryId(e.target.value)}
              >
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                size="small"
                fullWidth
                label="Product name"
                value={editProductName}
                onChange={(e) => setEditProductName(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                size="small"
                fullWidth
                label="Brand"
                value={editBrand}
                onChange={(e) => setEditBrand(e.target.value)}
                helperText="Leave empty to clear"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                size="small"
                fullWidth
                multiline
                minRows={3}
                label="Description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                helperText="Leave empty to clear"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                size="small"
                select
                fullWidth
                label="Status"
                value={editStatus}
                onChange={(e) => setEditStatus(Number(e.target.value))}
              >
                <MenuItem value={0}>Active</MenuItem>
                <MenuItem value={1}>Inactive</MenuItem>
                <MenuItem value={2}>Draft</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditOpen(false)} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={isUpdating}
            onClick={async () => {
              if (!id) return;

              const dto: Record<string, unknown> = {};

              if (editCategoryId && editCategoryId !== product.category?.id) dto.categoryId = editCategoryId;
              if (editProductName.trim() && editProductName.trim() !== (product.productName ?? "")) {
                dto.productName = editProductName.trim();
              }

              if ((product.brand ?? "") !== editBrand) dto.brand = editBrand;
              if ((product.description ?? "") !== editDescription) dto.description = editDescription;

              const currentStatus =
                typeof product.status === "number"
                  ? product.status
                  : product.status === "Active"
                    ? 0
                    : product.status === "Inactive"
                      ? 1
                      : 2;
              if (editStatus !== currentStatus) dto.status = editStatus;

              if (Object.keys(dto).length === 0) {
                toast.info("No changes to update");
                return;
              }

              try {
                await updateProduct({ id, productData: dto });
                toast.success("Product updated successfully");
                setEditOpen(false);
              } catch (err) {
                if (axios.isAxiosError(err)) {
                  const data = err.response?.data as any;
                  const message =
                    (typeof data === "string" && data) ||
                    data?.detail ||
                    data?.title ||
                    data?.message ||
                    "Failed to update product";
                  toast.error(message);
                } else {
                  toast.error("Failed to update product");
                }
              }
            }}
          >
            {isUpdating ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addImageOpen} onClose={() => setAddImageOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Add product image</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <Box>
                <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 700, mb: 1 }}>
                  IMAGE FILE
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    if (newImagePreviewUrl) URL.revokeObjectURL(newImagePreviewUrl);
                    setNewImageFile(file);
                    setNewImagePreviewUrl(file ? URL.createObjectURL(file) : null);
                    (e.target as HTMLInputElement).value = "";
                  }}
                />
                {newImagePreviewUrl ? (
                  <Box
                    sx={{
                      mt: 1.5,
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "1px solid rgba(0,0,0,0.08)",
                      bgcolor: "rgba(0,0,0,0.02)",
                    }}
                  >
                    <Box
                      component="img"
                      src={newImagePreviewUrl}
                      alt="Preview"
                      sx={{ width: "100%", maxHeight: 240, objectFit: "cover" }}
                    />
                  </Box>
                ) : null}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                size="small"
                fullWidth
                label="Alt text"
                value={newAltText}
                onChange={(e) => setNewAltText(e.target.value)}
                helperText="Optional"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                size="small"
                fullWidth
                label="Display order"
                type="number"
                value={newDisplayOrder}
                onChange={(e) => setNewDisplayOrder(Number(e.target.value))}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                size="small"
                fullWidth
                label="Model URL"
                value={newModelUrl}
                onChange={(e) => setNewModelUrl(e.target.value)}
                helperText="Optional"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAddImageOpen(false)} disabled={isAddingImage}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={isAddingImage || uploadImageMutation.isPending}
            onClick={async () => {
              if (!id) return;
              if (!newImageFile) {
                toast.error("Image file is required");
                return;
              }

              try {
                const uploaded = await uploadImageMutation.mutateAsync(newImageFile);
                await addProductImage({
                  productId: id,
                  image: {
                    imageUrl: uploaded.url,
                    altText: newAltText.trim() ? newAltText.trim() : null,
                    displayOrder: Number.isFinite(newDisplayOrder) ? newDisplayOrder : 1,
                    modelUrl: newModelUrl.trim() ? newModelUrl.trim() : null,
                  },
                });
                toast.success("Image added successfully");
                if (newImagePreviewUrl) URL.revokeObjectURL(newImagePreviewUrl);
                setNewImageFile(null);
                setNewImagePreviewUrl(null);
                setAddImageOpen(false);
              } catch (err) {
                if (axios.isAxiosError(err)) {
                  const data = err.response?.data as any;
                  const message =
                    (typeof data === "string" && data) ||
                    data?.detail ||
                    data?.title ||
                    data?.message ||
                    "Failed to add image";
                  toast.error(message);
                } else {
                  toast.error("Failed to add image");
                }
              }
            }}
          >
            {isAddingImage || uploadImageMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteImageOpen} onClose={() => setDeleteImageOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete image</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ fontSize: 14 }}>
            Are you sure you want to delete this image?
          </Typography>
          <Typography sx={{ mt: 1, fontSize: 12, color: "text.secondary" }}>
            {selectedImageAlt}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteImageOpen(false)} disabled={isDeletingImage}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={isDeletingImage}
            onClick={async () => {
              if (!id || !selectedImageId) return;
              try {
                await deleteProductImage({ productId: id, imageId: selectedImageId });
                toast.success("Image deleted successfully");
                setDeleteImageOpen(false);
                setSelectedImageId(null);
                setSelectedImageAlt("");
              } catch (err) {
                if (axios.isAxiosError(err)) {
                  const data = err.response?.data as any;
                  const message =
                    (typeof data === "string" && data) ||
                    data?.detail ||
                    data?.title ||
                    data?.message ||
                    "Failed to delete image";
                  toast.error(message);
                } else {
                  toast.error("Failed to delete image");
                }
              }
            }}
          >
            {isDeletingImage ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addVariantOpen} onClose={() => setAddVariantOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Add product variant</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                size="small"
                fullWidth
                required
                label="SKU"
                value={variantSku}
                onChange={(e) => setVariantSku(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                size="small"
                fullWidth
                label="Variant name"
                value={variantName}
                onChange={(e) => setVariantName(e.target.value)}
                helperText="Optional"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box>
                <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 700, mb: 1 }}>
                  COLOR
                </Typography>
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <input
                    type="color"
                    value={variantColor || "#000000"}
                    onChange={(e) => setVariantColor(e.target.value)}
                    style={{ width: 44, height: 40, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 8, padding: 4 }}
                    aria-label="Pick color"
                  />
                  <TextField
                    size="small"
                    fullWidth
                    required
                    label="Color (hex)"
                    value={variantColor}
                    inputProps={{ readOnly: true }}
                    error={!variantColor.trim()}
                    helperText={!variantColor.trim() ? "Color is required" : ""}
                  />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                size="small"
                fullWidth
                required
                select
                label="Size"
                value={variantSize}
                onChange={(e) => setVariantSize(e.target.value)}
                error={!variantSize.trim()}
                helperText={!variantSize.trim() ? "Size is required" : ""}
              >
                <MenuItem value="">Select size</MenuItem>
                <MenuItem value="Large">Large</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Small">Small</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                size="small"
                fullWidth
                required
                label="Material"
                value={variantMaterial}
                onChange={(e) => setVariantMaterial(e.target.value)}
                error={!variantMaterial.trim()}
                helperText={!variantMaterial.trim() ? "Material is required" : ""}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                size="small"
                fullWidth
                label="Frame width (mm)"
                type="number"
                value={variantFrameWidth}
                onChange={(e) => setVariantFrameWidth(e.target.value)}
                helperText="Optional"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                size="small"
                fullWidth
                label="Lens width (mm)"
                type="number"
                value={variantLensWidth}
                onChange={(e) => setVariantLensWidth(e.target.value)}
                helperText="Optional"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                size="small"
                fullWidth
                label="Bridge width (mm)"
                type="number"
                value={variantBridgeWidth}
                onChange={(e) => setVariantBridgeWidth(e.target.value)}
                helperText="Optional"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                size="small"
                fullWidth
                label="Temple length (mm)"
                type="number"
                value={variantTempleLength}
                onChange={(e) => setVariantTempleLength(e.target.value)}
                helperText="Optional"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                size="small"
                fullWidth
                required
                label="Price"
                type="number"
                value={variantPrice}
                onChange={(e) => setVariantPrice(e.target.value)}
                error={!!variantPrice && (!Number.isFinite(Number(variantPrice)) || Number(variantPrice) <= 0)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                size="small"
                fullWidth
                label="Compare at price"
                type="number"
                value={variantCompareAtPrice}
                onChange={(e) => setVariantCompareAtPrice(e.target.value)}
                error={
                  !!variantCompareAtPrice &&
                  Number.isFinite(Number(variantCompareAtPrice)) &&
                  Number.isFinite(Number(variantPrice)) &&
                  Number(variantCompareAtPrice) < Number(variantPrice)
                }
                helperText={
                  !!variantCompareAtPrice &&
                  Number.isFinite(Number(variantCompareAtPrice)) &&
                  Number.isFinite(Number(variantPrice)) &&
                  Number(variantCompareAtPrice) < Number(variantPrice)
                    ? "Compare-at must be greater than or equal to price"
                    : "Optional"
                }
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={variantIsPreOrder}
                    onChange={(e) => setVariantIsPreOrder(e.target.checked)}
                  />
                }
                label="Pre-order"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAddVariantOpen(false)} disabled={isCreatingVariant}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={isCreatingVariant}
            onClick={async () => {
              if (!id) return;

              const sku = variantSku.trim();
              if (!sku) {
                toast.error("SKU is required");
                return;
              }

              if (!variantColor.trim()) {
                toast.error("Color is required");
                return;
              }

              if (!variantSize.trim()) {
                toast.error("Size is required");
                return;
              }

              if (!variantMaterial.trim()) {
                toast.error("Material is required");
                return;
              }

              const price = Number(variantPrice);
              if (!Number.isFinite(price) || price <= 0) {
                toast.error("Price must be greater than 0");
                return;
              }

              const parseNullableNonNegative = (raw: string, label: string): number | null => {
                if (!raw.trim()) return null;
                const n = Number(raw);
                if (!Number.isFinite(n) || n < 0) {
                  throw new Error(`${label} must be a non-negative number`);
                }
                return n;
              };

              try {
                const frameWidth = parseNullableNonNegative(variantFrameWidth, "Frame width");
                const lensWidth = parseNullableNonNegative(variantLensWidth, "Lens width");
                const bridgeWidth = parseNullableNonNegative(variantBridgeWidth, "Bridge width");
                const templeLength = parseNullableNonNegative(variantTempleLength, "Temple length");
                const compareAtPrice = parseNullableNonNegative(variantCompareAtPrice, "Compare at price");

                if (compareAtPrice != null && compareAtPrice < price) {
                  toast.error("Compare-at must be greater than or equal to price");
                  return;
                }

                await createProductVariant({
                  productId: id,
                  variant: {
                    sku,
                    variantName: variantName.trim() ? variantName.trim() : null,
                    color: variantColor.trim(),
                    size: variantSize.trim(),
                    material: variantMaterial.trim(),
                    frameWidth,
                    lensWidth,
                    bridgeWidth,
                    templeLength,
                    price,
                    compareAtPrice,
                    isPreOrder: variantIsPreOrder,
                  },
                });
                toast.success("Variant created successfully");
                setAddVariantOpen(false);
              } catch (err) {
                if (axios.isAxiosError(err)) {
                  const data = err.response?.data as any;
                  const message =
                    (typeof data === "string" && data) ||
                    data?.detail ||
                    data?.title ||
                    data?.message ||
                    "Failed to create variant";
                  toast.error(message);
                  return;
                }

                if (err instanceof Error && err.message) {
                  toast.error(err.message);
                  return;
                }

                toast.error("Failed to create variant");
              }
            }}
          >
            {isCreatingVariant ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={addVariantImageOpen}
        onClose={() => setAddVariantImageOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Add variant image</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <Box>
                <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 700, mb: 1 }}>
                  IMAGE FILE
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    if (newVariantImagePreviewUrl) URL.revokeObjectURL(newVariantImagePreviewUrl);
                    setNewVariantImageFile(file);
                    setNewVariantImagePreviewUrl(file ? URL.createObjectURL(file) : null);
                    (e.target as HTMLInputElement).value = "";
                  }}
                />
                {newVariantImagePreviewUrl ? (
                  <Box
                    sx={{
                      mt: 1.5,
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "1px solid rgba(0,0,0,0.08)",
                      bgcolor: "rgba(0,0,0,0.02)",
                    }}
                  >
                    <Box
                      component="img"
                      src={newVariantImagePreviewUrl}
                      alt="Preview"
                      sx={{ width: "100%", maxHeight: 240, objectFit: "cover" }}
                    />
                  </Box>
                ) : null}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Alt text"
                value={newVariantAltText}
                onChange={(e) => setNewVariantAltText(e.target.value)}
                helperText="Optional"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Display order"
                type="number"
                value={newVariantDisplayOrder}
                onChange={(e) => setNewVariantDisplayOrder(Number(e.target.value))}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Model URL"
                value={newVariantModelUrl}
                onChange={(e) => setNewVariantModelUrl(e.target.value)}
                helperText="Optional"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              if (newVariantImagePreviewUrl) URL.revokeObjectURL(newVariantImagePreviewUrl);
              setNewVariantImageFile(null);
              setNewVariantImagePreviewUrl(null);
              setAddVariantImageOpen(false);
            }}
            disabled={isAddingVariantImage || uploadImageMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={isAddingVariantImage || uploadImageMutation.isPending}
            onClick={async () => {
              if (!id) return;
              if (!selectedVariantIdForImage) return;

              if (!newVariantImageFile) {
                toast.error("Image file is required");
                return;
              }

              const displayOrder = Number.isFinite(newVariantDisplayOrder) ? newVariantDisplayOrder : 1;
              if (displayOrder < 0) {
                toast.error("Display order must be a non-negative number");
                return;
              }

              try {
                const uploaded = await uploadImageMutation.mutateAsync(newVariantImageFile);
                await addVariantImage({
                  productId: id,
                  variantId: selectedVariantIdForImage,
                  image: {
                    imageUrl: uploaded.url,
                    altText: newVariantAltText.trim() ? newVariantAltText.trim() : null,
                    displayOrder,
                    modelUrl: newVariantModelUrl.trim() ? newVariantModelUrl.trim() : null,
                  },
                });
                toast.success("Variant image added successfully");
                if (newVariantImagePreviewUrl) URL.revokeObjectURL(newVariantImagePreviewUrl);
                setNewVariantImageFile(null);
                setNewVariantImagePreviewUrl(null);
                setAddVariantImageOpen(false);
                setSelectedVariantIdForImage(null);
              } catch (err) {
                if (axios.isAxiosError(err)) {
                  const data = err.response?.data as any;
                  const message =
                    (typeof data === "string" && data) ||
                    data?.detail ||
                    data?.title ||
                    data?.message ||
                    "Failed to add variant image";
                  toast.error(message);
                } else {
                  toast.error("Failed to add variant image");
                }
              }
            }}
          >
            {isAddingVariantImage || uploadImageMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/* ──────────── Sortable Image Card (drag-and-drop) ──────────── */
function SortableImageCard({
  id,
  imageUrl,
  altText,
  index,
  onDelete,
  onClick,
  isDeletingImage,
}: {
  id: string;
  imageUrl: string;
  altText: string;
  index: number;
  onDelete: () => void;
  onClick: () => void;
  isDeletingImage: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{
        borderRadius: 2,
        position: "relative",
        border: index === 0 ? "2px solid #1976d2" : "1px solid rgba(0,0,0,0.08)",
        cursor: "grab",
        "&:active": { cursor: "grabbing" },
      }}
    >
      {/* Drag handle */}
      <Box
        {...attributes}
        {...listeners}
        sx={{
          position: "absolute",
          top: 8,
          left: 8,
          zIndex: 2,
          bgcolor: "rgba(255,255,255,0.9)",
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          cursor: "grab",
          "&:active": { cursor: "grabbing" },
          border: "1px solid rgba(0,0,0,0.12)",
        }}
      >
        <DragIndicatorIcon fontSize="small" sx={{ color: "rgba(0,0,0,0.5)" }} />
      </Box>

      {/* Primary badge */}
      {index === 0 && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: 48,
            zIndex: 2,
            bgcolor: "#1976d2",
            color: "#fff",
            px: 1,
            py: 0.3,
            borderRadius: 1,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.04em",
          }}
        >
          PRIMARY
        </Box>
      )}

      {/* Delete button */}
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        disabled={isDeletingImage}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 2,
          bgcolor: "rgba(255,255,255,0.9)",
          "&:hover": { bgcolor: "#ffffff" },
          color: "#c62828",
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>

      <CardMedia
        component="img"
        height="200"
        image={imageUrl}
        alt={altText}
        sx={{ objectFit: "cover", cursor: "pointer" }}
        onClick={onClick}
      />
      <CardContent sx={{ py: 1, px: 1.5 }}>
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: "text.secondary",
          }}
        >
          #{index + 1} · {altText}
        </Typography>
      </CardContent>
    </Card>
  );
}

/* ──────────── Sortable Variant Image Card ──────────── */
function SortableVariantImageCard({
  id,
  imageUrl,
  altText,
  index,
}: {
  id: string;
  imageUrl: string;
  altText: string;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{
        borderRadius: 2,
        position: "relative",
        border: index === 0 ? "2px solid #6a1b9a" : "1px solid rgba(0,0,0,0.08)",
        cursor: "grab",
        "&:active": { cursor: "grabbing" },
      }}
    >
      <Box
        {...attributes}
        {...listeners}
        sx={{
          position: "absolute",
          top: 6,
          left: 6,
          zIndex: 2,
          bgcolor: "rgba(255,255,255,0.9)",
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          cursor: "grab",
          "&:active": { cursor: "grabbing" },
          border: "1px solid rgba(0,0,0,0.12)",
        }}
      >
        <DragIndicatorIcon sx={{ fontSize: 16, color: "rgba(0,0,0,0.5)" }} />
      </Box>

      {index === 0 && (
        <Box
          sx={{
            position: "absolute",
            top: 6,
            left: 40,
            zIndex: 2,
            bgcolor: "#6a1b9a",
            color: "#fff",
            px: 0.8,
            py: 0.2,
            borderRadius: 1,
            fontSize: 9,
            fontWeight: 800,
          }}
        >
          PRIMARY
        </Box>
      )}

      <CardMedia
        component="img"
        height="120"
        image={imageUrl}
        alt={altText}
        sx={{ objectFit: "cover" }}
      />
      <CardContent sx={{ py: 0.5, px: 1 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: "text.secondary" }}>
          #{index + 1} · {altText}
        </Typography>
      </CardContent>
    </Card>
  );
}

function VariantEditDialog({
  productId,
  variant,
  onClose,
  updateVariant,
  isUpdatingVariant,
  updateVariantPreorder,
  isUpdatingVariantPreorder,
  reorderVariantImages,
  isReorderingVariantImages,
}: {
  productId: string | undefined;
  variant: any;
  onClose: () => void;
  updateVariant: (data: {
    productId: string;
    variantId: string;
    variant: Record<string, unknown>;
  }) => Promise<void>;
  isUpdatingVariant: boolean;
  updateVariantPreorder: (data: { productId: string; variantId: string; isPreOrder: boolean }) => Promise<void>;
  isUpdatingVariantPreorder: boolean;
  reorderVariantImages: (data: { productId: string; variantId: string; imageIds: string[] }) => Promise<void>;
  isReorderingVariantImages: boolean;
}) {
  const [sku, setSku] = useState<string>(variant?.sku ?? "");
  const [variantName, setVariantName] = useState<string>(variant?.variantName ?? "");
  const [color, setColor] = useState<string>(variant?.color ?? "");
  const [size, setSize] = useState<string>(variant?.size ?? "");
  const [material, setMaterial] = useState<string>(variant?.material ?? "");
  const [frameWidth, setFrameWidth] = useState<string>(variant?.frameWidth != null ? String(variant.frameWidth) : "");
  const [lensWidth, setLensWidth] = useState<string>(variant?.lensWidth != null ? String(variant.lensWidth) : "");
  const [bridgeWidth, setBridgeWidth] = useState<string>(variant?.bridgeWidth != null ? String(variant.bridgeWidth) : "");
  const [templeLength, setTempleLength] = useState<string>(variant?.templeLength != null ? String(variant.templeLength) : "");
  const [price, setPrice] = useState<string>(variant?.price != null ? String(variant.price) : "");
  const [compareAtPrice, setCompareAtPrice] = useState<string>(variant?.compareAtPrice != null ? String(variant.compareAtPrice) : "");
  const [isActive, setIsActive] = useState<boolean>(!!variant?.isActive);
  const [isPreOrder, setIsPreOrder] = useState<boolean>(!!variant?.isPreOrder);

  const saving = isUpdatingVariant || isUpdatingVariantPreorder;

  const parsedPrice = Number(price);
  const parsedCompareAt = compareAtPrice.trim() ? Number(compareAtPrice) : null;
  const compareAtInvalid =
    parsedCompareAt != null && Number.isFinite(parsedCompareAt) && Number.isFinite(parsedPrice)
      ? parsedCompareAt < parsedPrice
      : false;

  const parseNullablePositive = (raw: string, label: string): number | null => {
    if (!raw.trim()) return null;
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) throw new Error(`${label} must be > 0`);
    return n;
  };

  const dialogSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDialogVariantImagesDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !productId || !variant) return;
    const images = variant.images ?? [];
    const oldIndex = images.findIndex((img: any) => img.id === active.id);
    const newIndex = images.findIndex((img: any) => img.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(images, oldIndex, newIndex);
    try {
      await reorderVariantImages({
        productId,
        variantId: variant.id,
        imageIds: reordered.map((img: any) => img.id),
      });
      toast.success("Variant image order updated");
    } catch {
      toast.error("Failed to reorder variant images");
    }
  };

  return (
    <Dialog open={!!variant} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>Edit variant</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {/* Variant images drag-and-drop reorder */}
        {variant?.images?.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    bgcolor: "#6a1b9a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ImageIcon sx={{ fontSize: 14, color: "#fff" }} />
                </Box>
                <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#4a148c" }}>
                  Images ({variant.images.length}) — drag to reorder
                </Typography>
              </Box>
              {isReorderingVariantImages && (
                <Typography sx={{ fontSize: 11, color: "#6a1b9a", fontWeight: 600 }}>
                  Saving…
                </Typography>
              )}
            </Box>
            <Typography sx={{ fontSize: 11, color: "text.secondary", mb: 1.5 }}>
              The first image is the primary display image for this variant.
            </Typography>
            <DndContext
              sensors={dialogSensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDialogVariantImagesDragEnd}
            >
              <SortableContext
                items={variant.images.map((img: any) => img.id)}
                strategy={rectSortingStrategy}
              >
                <Grid container spacing={1.5}>
                  {variant.images.map((img: any, idx: number) => (
                    <Grid item xs={4} sm={3} md={2} key={img.id}>
                      <SortableVariantImageCard
                        id={img.id}
                        imageUrl={img.imageUrl}
                        altText={img.altText || "Untitled"}
                        index={idx}
                      />
                    </Grid>
                  ))}
                </Grid>
              </SortableContext>
            </DndContext>
          </Box>
        )}

        {variant?.images?.length === 0 && (
          <Box
            sx={{
              mb: 3,
              py: 3,
              textAlign: "center",
              border: "2px dashed rgba(106,27,154,0.2)",
              borderRadius: 2,
              bgcolor: "#fafafa",
            }}
          >
            <ImageIcon sx={{ fontSize: 28, color: "rgba(106,27,154,0.25)", mb: 0.5 }} />
            <Typography sx={{ fontSize: 12, color: "text.secondary", fontStyle: "italic" }}>
              No images for this variant.
            </Typography>
          </Box>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              size="small"
              fullWidth
              required
              label="SKU"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              size="small"
              fullWidth
              label="Variant name"
              value={variantName}
              onChange={(e) => setVariantName(e.target.value)}
              helperText="Optional"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box>
              <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 700, mb: 1 }}>
                COLOR
              </Typography>
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                <input
                  type="color"
                  value={color || "#000000"}
                  onChange={(e) => setColor(e.target.value)}
                  style={{ width: 44, height: 40, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 8, padding: 4 }}
                  aria-label="Pick color"
                />
                <TextField
                  size="small"
                  fullWidth
                  required
                  label="Color (hex)"
                  value={color}
                  inputProps={{ readOnly: true }}
                  error={!color.trim()}
                  helperText={!color.trim() ? "Color is required" : ""}
                />
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              fullWidth
              required
              select
              label="Size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              error={!size.trim()}
              helperText={!size.trim() ? "Size is required" : ""}
            >
              <MenuItem value="">Select size</MenuItem>
              <MenuItem value="Large">Large</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Small">Small</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              size="small"
              fullWidth
              required
              label="Material"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              error={!material.trim()}
              helperText={!material.trim() ? "Material is required" : ""}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              fullWidth
              label="Frame width (mm)"
              type="number"
              value={frameWidth}
              onChange={(e) => setFrameWidth(e.target.value)}
              helperText="Optional"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              fullWidth
              label="Lens width (mm)"
              type="number"
              value={lensWidth}
              onChange={(e) => setLensWidth(e.target.value)}
              helperText="Optional"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              fullWidth
              label="Bridge width (mm)"
              type="number"
              value={bridgeWidth}
              onChange={(e) => setBridgeWidth(e.target.value)}
              helperText="Optional"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              fullWidth
              label="Temple length (mm)"
              type="number"
              value={templeLength}
              onChange={(e) => setTempleLength(e.target.value)}
              helperText="Optional"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              fullWidth
              required
              label="Price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              error={!!price && (!Number.isFinite(parsedPrice) || parsedPrice <= 0)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              fullWidth
              label="Compare at price"
              type="number"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              error={compareAtInvalid}
              helperText={compareAtInvalid ? "Compare-at must be greater than or equal to price" : "Optional"}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
              <FormControlLabel
                control={<Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
                label="Active"
              />
              <FormControlLabel
                control={<Checkbox checked={isPreOrder} onChange={(e) => setIsPreOrder(e.target.checked)} />}
                label="Pre-order"
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button
          variant="contained"
          disabled={saving}
          onClick={async () => {
            if (!productId) return;
            if (!variant?.id) return;

            const cleanSku = sku.trim();
            if (!cleanSku) {
              toast.error("SKU is required");
              return;
            }
            if (cleanSku.length > 100) {
              toast.error("SKU must not exceed 100 characters");
              return;
            }

            if (!color.trim()) {
              toast.error("Color is required");
              return;
            }
            if (!size.trim()) {
              toast.error("Size is required");
              return;
            }
            if (!material.trim()) {
              toast.error("Material is required");
              return;
            }

            if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
              toast.error("Price must be greater than 0");
              return;
            }
            if (compareAtInvalid) {
              toast.error("Compare-at must be greater than or equal to price");
              return;
            }

            try {
              const nextFrameWidth = parseNullablePositive(frameWidth, "Frame width");
              const nextLensWidth = parseNullablePositive(lensWidth, "Lens width");
              const nextBridgeWidth = parseNullablePositive(bridgeWidth, "Bridge width");
              const nextTempleLength = parseNullablePositive(templeLength, "Temple length");

              const nextCompareAtPrice = compareAtPrice.trim() ? Number(compareAtPrice) : null;
              if (nextCompareAtPrice != null && (!Number.isFinite(nextCompareAtPrice) || nextCompareAtPrice < 0)) {
                toast.error("Compare at price must be a non-negative number");
                return;
              }
              if (nextCompareAtPrice != null && nextCompareAtPrice < parsedPrice) {
                toast.error("Compare-at must be greater than or equal to price");
                return;
              }

              await updateVariant({
                productId,
                variantId: variant.id,
                variant: {
                  sku: cleanSku,
                  variantName: variantName.trim() ? variantName.trim() : null,
                  color: color.trim(),
                  size: size.trim(),
                  material: material.trim(),
                  frameWidth: nextFrameWidth,
                  lensWidth: nextLensWidth,
                  bridgeWidth: nextBridgeWidth,
                  templeLength: nextTempleLength,
                  price: parsedPrice,
                  compareAtPrice: nextCompareAtPrice,
                  isActive,
                },
              });

              if (!!variant?.isPreOrder !== isPreOrder) {
                await updateVariantPreorder({
                  productId,
                  variantId: variant.id,
                  isPreOrder,
                });
              }

              toast.success("Variant updated successfully");
              onClose();
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Failed to update variant");
            }
          }}
        >
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
