import { Box, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { SelectLensesDialog } from "./components/ProductDetailPageComponents/SelectLensesDialog";
import { useProductDetailPage } from "./hooks/useProductDetailPage";

export default function SelectLensesPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as { variantId?: string | null; isPreOrder?: boolean } | null;
    const initialVariantId = state?.variantId ?? null;
    const isPreOrder = state?.isPreOrder ?? false;
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

    const handleDialogClose = () => {
        if (isPreOrder) {
            navigate("/checkout", { state: { isPreOrder: true } });
        } else {
            navigate(-1);
        }
    };

    return (
        <SelectLensesDialog
            open
            fullPage
            isPreOrder={isPreOrder}
            onClose={handleDialogClose}
            onLogoClick={() => navigate("/collections")}
            productName={product.name}
            variantLabel={currentVariant?.variantName ?? currentVariant?.color ?? product.sku ?? ""}
            productImageUrl={images[0] ?? ""}
            price={currentVariant?.price ?? product.price}
            onPrescriptionConfirm={handleAddWithPrescription}
        />
    );
}

