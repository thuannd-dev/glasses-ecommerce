import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { toast } from "react-toastify";
import { useProductDetail } from "../../../lib/hooks/useProducts";
import { cartStore } from "../../../lib/stores/cartStore";
import { useCart } from "../../../lib/hooks/useCart";
import { setCartItemPrescription } from "../../cart/prescriptionCache";
import type { PrescriptionData } from "../../../lib/types/prescription";
import type { CartDto } from "../../../lib/types/cart";

export function useProductDetailPage(initialVariantId?: string | null) {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { product, isLoading } = useProductDetail(id);
  const { addItem, addItemAsync } = useCart();

  const [activeVariantId, setActiveVariantId] = useState<string | null>(
    initialVariantId ?? null
  );
  const [activeImg, setActiveImg] = useState(0);

  const currentVariant = useMemo(() => {
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    if (!variants.length) return null;
    const found = variants.find((v) => v.id === activeVariantId);
    return found ?? variants[0];
  }, [product, activeVariantId]);

  const images = useMemo(() => {
    if (currentVariant?.images?.length) {
      return currentVariant.images.slice(0, 3);
    }
    const src = product?.images ?? [];
    return src.slice(0, 3);
  }, [currentVariant, product]);

  const addToCartPayload = useMemo(() => {
    if (!product) return null;
    const variantId = currentVariant?.id ?? product.variants?.[0]?.id;
    if (!variantId) return null;
    return {
      variantId,
      productId: product.id,
      name: product.name,
      image: images[0],
      price: currentVariant?.price ?? product.price,
    };
  }, [product, currentVariant, images]);

  const handleAddToCart = () => {
    if (!addToCartPayload) return;
    cartStore.addItem({
      productId: addToCartPayload.productId,
      name: addToCartPayload.name,
      image: addToCartPayload.image,
      price: addToCartPayload.price,
    });
    addItem({
      productVariantId: addToCartPayload.variantId,
      quantity: 1,
    });
  };

  const handleAddWithPrescription = async (prescription: PrescriptionData) => {
    if (!addToCartPayload) return;
    cartStore.addItem({
      productId: addToCartPayload.productId,
      name: addToCartPayload.name,
      image: addToCartPayload.image,
      price: addToCartPayload.price,
    });
    const variantId = addToCartPayload.variantId;
    const cart = await addItemAsync({
      productVariantId: variantId,
      quantity: 1,
    });
    
    // Get the LAST item with this variant (newly added), not first
    // Important: when same variant added multiple times with different prescriptions,
    // we need to link the prescription to the specific new cart item, not an old one
    let item = cart?.items?.filter((i) => i.productVariantId === variantId).at(-1);
    
    // If immediate response doesn't have the item, wait briefly and refetch
    // This handles race conditions where backend is still processing
    if (!item && cart) {
      // Small delay to allow backend to process
      await new Promise((resolve) => setTimeout(resolve, 300));
      const fresh = await queryClient.fetchQuery<CartDto>({
        queryKey: ["cart"],
        staleTime: 0,  // Force fresh fetch
      });
      item = fresh?.items?.filter((i) => i.productVariantId === variantId).at(-1);
    }
    
    // Fail-fast: If still can't find item after retries, report error and stop
    if (!item) {
      toast.error("Failed to save prescription to cart. Please refresh and try again.");
      return;
    }
    
    // Item found - save prescription to cache
    setCartItemPrescription(item.id, prescription);
  };

  const handleVariantSelect = (variantId: string) => {
    setActiveVariantId(variantId);
    setActiveImg(0);
  };

  const isEyeglasses = product?.categorySlug === "eyeglasses";

  return {
    product,
    isLoading,
    currentVariant,
    images,
    activeImg,
    setActiveImg,
    activeVariantId,
    setActiveVariantId,
    handleAddToCart,
    handleVariantSelect,
    isEyeglasses,
    handleAddWithPrescription,
    addToCartPayload,
  };
}
