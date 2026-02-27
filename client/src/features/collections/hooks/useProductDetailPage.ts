import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { useProductDetail } from "../../../lib/hooks/useProducts";
import { cartStore } from "../../../lib/stores/cartStore";
import { useCart } from "../../../lib/hooks/useCart";

export function useProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { product, isLoading } = useProductDetail(id);
  const { addItem } = useCart();

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

  const handleAddToCart = () => {
    if (!product) return;

    const variantId = currentVariant?.id ?? product.variants?.[0]?.id;
    if (!variantId) return;

    cartStore.addItem({
      productId: product.id,
      name: product.name,
      image: images[0],
      price: currentVariant?.price ?? product.price,
    });

    addItem({
      productVariantId: variantId,
      quantity: 1,
    });
  };

  const handleVariantSelect = (variantId: string) => {
    setActiveVariantId(variantId);
    setActiveImg(0);
  };

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
  };
}
