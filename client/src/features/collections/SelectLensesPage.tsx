import { Box, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { SelectLensesDialog } from "./components/ProductDetailPageComponents/SelectLensesDialog";
import { useProductDetailPage } from "./hooks/useProductDetailPage";

export default function SelectLensesPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as { variantId?: string | null } | null;
    const initialVariantId = state?.variantId ?? null;
    const { product, isLoading, currentVariant, images, handleAddWithPrescription } =
        useProductDetailPage(initialVariantId);

    if (isLoading) {
        return (
            <Box sx={{ maxWidth: 960, mx: "auto", mt: 10, px: { xs: 2, md: 3 } }}>
                <Typography>Loading product...</Typography>
            </Box>
        );
    }

    if (!product) {
        return (
            <Box sx={{ maxWidth: 960, mx: "auto", mt: 10, px: { xs: 2, md: 3 } }}>
                <Typography fontWeight={900} fontSize={18}>
                    Product not found
                </Typography>
            </Box>
        );
    }

    return (
        <SelectLensesDialog
            open
            fullPage
            onClose={() => navigate(-1)}
            onLogoClick={() => navigate("/collections")}
            productName={product.name}
            variantLabel={currentVariant?.variantName ?? currentVariant?.color ?? product.sku ?? ""}
            productImageUrl={images[0] ?? ""}
            price={currentVariant?.price ?? product.price}
            onPrescriptionConfirm={handleAddWithPrescription}
        />
    );
}

