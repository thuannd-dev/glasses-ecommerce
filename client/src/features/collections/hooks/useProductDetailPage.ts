import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { toast } from "react-toastify";
import { useProductDetail } from "../../../lib/hooks/useProducts";
import { cartStore } from "../../../lib/stores/cartStore";
import { useCart } from "../../../lib/hooks/useCart";
import { getPrescriptionByVariantId } from "../../cart/prescriptionCache";
import { setCartItemPrescription } from "../../cart/prescriptionCache";
import { setPrescriptionByVariantId } from "../../cart/prescriptionCache";
import type { PrescriptionData } from "../../../lib/types/prescription";
import type { CartDto } from "../../../lib/types/cart";

export function useProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { product, isLoading } = useProductDetail(id);
  const { cart, addItem, addItemAsync } = useCart();
  const [selectLensesOpen, setSelectLensesOpen] = useState(false);

  const [activeVariantId, setActiveVariantId] = useState<string | null>(null);
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

  const variantAlreadyInCart = useMemo(() => {
    if (!cart?.items?.length || !addToCartPayload) return false;
    return cart.items.some((i) => i.productVariantId === addToCartPayload!.variantId);
  }, [cart?.items, addToCartPayload]);

  /** True if this variant is in cart and that line has prescription (cannot add non-prescription). */
  const cartLineHasPrescription = useMemo(() => {
    if (!addToCartPayload?.variantId) return false;
    return !!getPrescriptionByVariantId(addToCartPayload.variantId);
  }, [addToCartPayload?.variantId, cart?.items]);

  const handleAddToCart = () => {
    if (!addToCartPayload) return;
    if (variantAlreadyInCart && cartLineHasPrescription) {
      toast.error(
        "This product is already in your cart with prescription. You cannot add the same product as non-prescription. Please place a separate order for non-prescription."
      );
      return;
    }
    if (variantAlreadyInCart) {
      toast.error(
        "This product is already in your cart. You cannot add the same product again with a different option (with/without prescription)."
      );
      return;
    }
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
    if (variantAlreadyInCart) {
      toast.error(
        "This product is already in your cart. You cannot add the same product again with a different option (with/without prescription)."
      );
      return;
    }
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
    let item = cart?.items?.find((i) => i.productVariantId === variantId);
    if (!item && cart) {
      const fresh = await queryClient.fetchQuery<CartDto>({ queryKey: ["cart"] });
      item = fresh?.items?.find((i) => i.productVariantId === variantId);
    }
    if (item) {
      setCartItemPrescription(item.id, prescription);
    }
    setPrescriptionByVariantId(variantId, prescription);
    setSelectLensesOpen(false);
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
    selectLensesOpen,
    setSelectLensesOpen,
    handleAddWithPrescription,
    addToCartPayload,
  };
}
