import { Box, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { SignInRequiredForCartDialog } from "../../app/shared/components/SignInRequiredForCartDialog";
import { useRequireAuthForCart } from "../../lib/hooks/useRequireAuthForCart";
import { SelectLensesDialog } from "./components/ProductDetailPageComponents/SelectLensesDialog";
import { useProductDetailPage } from "./hooks/useProductDetailPage";

export default function SelectLensesPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as { variantId?: string | null; isPreOrder?: boolean } | null;
    const initialVariantId = state?.variantId ?? null;
    const isPreOrder = state?.isPreOrder ?? false;
    const cartAuth = useRequireAuthForCart();
    const {
        product,
        isLoading,
        currentVariant,
        images,
        handleAddWithPrescription,
        handleAddNonPrescriptionLenses,
        addToCartPayload,
    } = useProductDetailPage(initialVariantId, cartAuth);

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

    // Luôn về đúng PDP — không dùng navigate(-1) (dễ sai sau login/returnUrl hoặc mở tab trực tiếp /lenses).
    const handleDialogClose = () => {
        navigate(`/product/${product.id}`, { replace: true });
    };

    return (
        <>
            <SelectLensesDialog
                open
                embeddedInPage
                isPreOrder={isPreOrder}
                onClose={handleDialogClose}
                onLogoClick={() => navigate("/collections")}
                productName={product.name}
                variantLabel={currentVariant?.variantName ?? currentVariant?.color ?? product.sku ?? ""}
                productImageUrl={images[0]?.url ?? ""}
                price={currentVariant?.price ?? product.price}
                onNonPrescriptionAddToCart={handleAddNonPrescriptionLenses}
                canAddToCart={Boolean(addToCartPayload)}
                onPrescriptionConfirm={handleAddWithPrescription}
            />
            <SignInRequiredForCartDialog {...cartAuth.signInForCartDialogProps} />
        </>
    );
}

