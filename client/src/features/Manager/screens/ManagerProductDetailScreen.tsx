import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Divider,
  ImageList,
  ImageListItem,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { ArrowBack } from "@mui/icons-material";

import agent from "../../../lib/api/agent";

interface ProductDetail {
  id: string;
  productName: string;
  type: number;
  description: string | null;
  brand: string | null;
  status: number;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  };
  variants: Array<{
    id: string;
    sku: string;
    variantName: string | null;
    color: string | null;
    size: string | null;
    material: string | null;
    frameWidth: number | null;
    lensWidth: number | null;
    bridgeWidth: number | null;
    templeLength: number | null;
    price: number;
    compareAtPrice: number | null;
    isActive: boolean;
    isPreOrder: boolean;
    quantityAvailable: number;
    images: Array<{
      id: string;
      imageUrl: string;
      altText: string | null;
      displayOrder: number;
      modelUrl: string | null;
    }>;
  }>;
  images: Array<{
    id: string;
    imageUrl: string;
    altText: string | null;
    displayOrder: number;
  }>;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  });
}

function getStatusLabel(status: number): string {
  const statusMap: Record<number, string> = {
    0: "Inactive",
    1: "Active",
    2: "Discontinued",
  };
  return statusMap[status] ?? "Unknown";
}

function getStatusColor(status: number): "default" | "success" | "error" | "warning" {
  switch (status) {
    case 1:
      return "success";
    case 0:
      return "default";
    case 2:
      return "error";
    default:
      return "default";
  }
}

export default function ManagerProductDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <Box sx={{ px: 4, py: 4 }}>
        <Typography color="error">Product ID not provided</Typography>
      </Box>
    );
  }

  const { data: product, isLoading, error } = useQuery<ProductDetail>({
    queryKey: ["manager-product-detail", id],
    queryFn: async () => {
      const res = await agent.get<ProductDetail>(`/products/${id}`);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ px: 4, py: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box sx={{ px: 4, py: 4 }}>
        <Stack spacing={2}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} variant="outlined" color="inherit">
            Back
          </Button>
          <Typography color="error">Failed to load product details</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, md: 6, lg: 10 }, py: 4 }}>
      <Stack spacing={2} direction="row" alignItems="center" sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} variant="outlined" color="inherit">
          Back
        </Button>
        <Typography sx={{ fontSize: 24, fontWeight: 900 }} color="text.primary">
          Product Details
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        {/* Product Info Card */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)" }}>
            <Typography sx={{ fontSize: 18, fontWeight: 800, mb: 2 }} color="text.primary">
              Basic Information
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography fontSize={12} color="text.secondary" fontWeight={700}>
                    PRODUCT NAME
                  </Typography>
                  <Typography fontSize={14} fontWeight={700} sx={{ mt: 0.5 }}>
                    {product.productName}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography fontSize={12} color="text.secondary" fontWeight={700}>
                    PRODUCT ID
                  </Typography>
                  <Typography fontSize={13} sx={{ mt: 0.5, fontFamily: "monospace" }}>
                    {product.id}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography fontSize={12} color="text.secondary" fontWeight={700}>
                    BRAND
                  </Typography>
                  <Typography fontSize={14} fontWeight={700} sx={{ mt: 0.5 }}>
                    {product.brand ?? "N/A"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography fontSize={12} color="text.secondary" fontWeight={700}>
                    STATUS
                  </Typography>
                  <Chip
                    label={getStatusLabel(product.status)}
                    color={getStatusColor(product.status)}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography fontSize={12} color="text.secondary" fontWeight={700}>
                    CATEGORY
                  </Typography>
                  <Typography fontSize={14} fontWeight={700} sx={{ mt: 0.5 }}>
                    {product.category.name}
                  </Typography>
                  <Typography fontSize={12} color="text.secondary">
                    {product.category.slug}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography fontSize={12} color="text.secondary" fontWeight={700}>
                    CREATED AT
                  </Typography>
                  <Typography fontSize={14} fontWeight={700} sx={{ mt: 0.5 }}>
                    {new Date(product.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>

              {product.description && (
                <Grid item xs={12}>
                  <Box>
                    <Typography fontSize={12} color="text.secondary" fontWeight={700}>
                      DESCRIPTION
                    </Typography>
                    <Typography fontSize={13} sx={{ mt: 0.5 }}>
                      {product.description}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Product Images */}
        {product.images.length > 0 && (
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)" }}>
              <Typography sx={{ fontSize: 18, fontWeight: 800, mb: 2 }} color="text.primary">
                Product Images
              </Typography>
              <ImageList sx={{ width: "100%", height: "auto" }} cols={4} rowHeight={200} gap={16}>
                {product.images.map((img) => (
                  <ImageListItem key={img.id}>
                    <img
                      src={img.imageUrl}
                      alt={img.altText ?? "Product"}
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Paper>
          </Grid>
        )}

        {/* Variants Section */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)" }}>
            <Typography sx={{ fontSize: 18, fontWeight: 800, mb: 2 }} color="text.primary">
              Variants ({product.variants.length})
            </Typography>

            <TableContainer sx={{ borderRadius: 2, border: "1px solid rgba(0,0,0,0.08)" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
                    <TableCell sx={{ fontWeight: 900 }}>SKU</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Variant Name</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Color</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Size</TableCell>
                    <TableCell sx={{ fontWeight: 900 }} align="right">
                      Price
                    </TableCell>
                    <TableCell sx={{ fontWeight: 900 }} align="right">
                      Compare At
                    </TableCell>
                    <TableCell sx={{ fontWeight: 900 }} align="right">
                      Qty
                    </TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {product.variants.map((variant) => (
                    <TableRow key={variant.id} hover>
                      <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>{variant.sku}</TableCell>
                      <TableCell>{variant.variantName ?? "—"}</TableCell>
                      <TableCell>{variant.color ?? "—"}</TableCell>
                      <TableCell>{variant.size ?? "—"}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>
                        {formatCurrency(variant.price)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>
                        {variant.compareAtPrice ? formatCurrency(variant.compareAtPrice) : "—"}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>
                        {variant.quantityAvailable}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          {variant.isActive && (
                            <Chip label="Active" size="small" color="success" variant="outlined" />
                          )}
                          {variant.isPreOrder && (
                            <Chip label="Pre-order" size="small" color="warning" variant="outlined" />
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Variant Details */}
        {product.variants.map((variant) => (
          <Grid item xs={12} key={variant.id}>
            <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Typography sx={{ fontSize: 16, fontWeight: 800, mb: 2 }} color="text.primary">
                  Variant: {variant.variantName || variant.sku}
                </Typography>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography fontSize={12} color="text.secondary" fontWeight={700}>
                        SKU
                      </Typography>
                      <Typography fontSize={13} fontWeight={700} sx={{ mt: 0.5, fontFamily: "monospace" }}>
                        {variant.sku}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography fontSize={12} color="text.secondary" fontWeight={700}>
                        PRICE
                      </Typography>
                      <Typography fontSize={13} fontWeight={700} sx={{ mt: 0.5 }}>
                        {formatCurrency(variant.price)}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography fontSize={12} color="text.secondary" fontWeight={700}>
                        QUANTITY
                      </Typography>
                      <Typography fontSize={13} fontWeight={700} sx={{ mt: 0.5 }}>
                        {variant.quantityAvailable}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography fontSize={12} color="text.secondary" fontWeight={700}>
                        STATUS
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                        {variant.isActive && (
                          <Chip label="Active" size="small" color="success" variant="outlined" />
                        )}
                        {variant.isPreOrder && (
                          <Chip label="Pre-order" size="small" color="warning" variant="outlined" />
                        )}
                      </Stack>
                    </Box>
                  </Grid>

                  {(variant.color || variant.size || variant.material) && (
                    <>
                      {variant.color && (
                        <Grid item xs={12} sm={6} md={3}>
                          <Box>
                            <Typography fontSize={12} color="text.secondary" fontWeight={700}>
                              COLOR
                            </Typography>
                            <Typography fontSize={13} fontWeight={700} sx={{ mt: 0.5 }}>
                              {variant.color}
                            </Typography>
                          </Box>
                        </Grid>
                      )}

                      {variant.size && (
                        <Grid item xs={12} sm={6} md={3}>
                          <Box>
                            <Typography fontSize={12} color="text.secondary" fontWeight={700}>
                              SIZE
                            </Typography>
                            <Typography fontSize={13} fontWeight={700} sx={{ mt: 0.5 }}>
                              {variant.size}
                            </Typography>
                          </Box>
                        </Grid>
                      )}

                      {variant.material && (
                        <Grid item xs={12} sm={6} md={3}>
                          <Box>
                            <Typography fontSize={12} color="text.secondary" fontWeight={700}>
                              MATERIAL
                            </Typography>
                            <Typography fontSize={13} fontWeight={700} sx={{ mt: 0.5 }}>
                              {variant.material}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </>
                  )}

                  {(variant.frameWidth || variant.lensWidth || variant.bridgeWidth || variant.templeLength) && (
                    <>
                      <Divider sx={{ width: "100%", my: 1 }} />

                      {variant.frameWidth && (
                        <Grid item xs={12} sm={6} md={3}>
                          <Box>
                            <Typography fontSize={12} color="text.secondary" fontWeight={700}>
                              FRAME WIDTH
                            </Typography>
                            <Typography fontSize={13} fontWeight={700} sx={{ mt: 0.5 }}>
                              {variant.frameWidth}mm
                            </Typography>
                          </Box>
                        </Grid>
                      )}

                      {variant.lensWidth && (
                        <Grid item xs={12} sm={6} md={3}>
                          <Box>
                            <Typography fontSize={12} color="text.secondary" fontWeight={700}>
                              LENS WIDTH
                            </Typography>
                            <Typography fontSize={13} fontWeight={700} sx={{ mt: 0.5 }}>
                              {variant.lensWidth}mm
                            </Typography>
                          </Box>
                        </Grid>
                      )}

                      {variant.bridgeWidth && (
                        <Grid item xs={12} sm={6} md={3}>
                          <Box>
                            <Typography fontSize={12} color="text.secondary" fontWeight={700}>
                              BRIDGE WIDTH
                            </Typography>
                            <Typography fontSize={13} fontWeight={700} sx={{ mt: 0.5 }}>
                              {variant.bridgeWidth}mm
                            </Typography>
                          </Box>
                        </Grid>
                      )}

                      {variant.templeLength && (
                        <Grid item xs={12} sm={6} md={3}>
                          <Box>
                            <Typography fontSize={12} color="text.secondary" fontWeight={700}>
                              TEMPLE LENGTH
                            </Typography>
                            <Typography fontSize={13} fontWeight={700} sx={{ mt: 0.5 }}>
                              {variant.templeLength}mm
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </>
                  )}
                </Grid>

                {/* Variant Images */}
                {variant.images.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography fontSize={12} color="text.secondary" fontWeight={700} sx={{ mb: 1 }}>
                      IMAGES
                    </Typography>
                    <ImageList sx={{ width: "100%", height: "auto" }} cols={6} rowHeight={150} gap={8}>
                      {variant.images.map((img) => (
                        <ImageListItem key={img.id}>
                          <img
                            src={img.imageUrl}
                            alt={img.altText ?? "Variant"}
                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }}
                          />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
