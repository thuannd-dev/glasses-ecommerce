import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../../lib/hooks/useCart";

interface PreOrderButtonProps {
  variant: any;
}

export function usePreOrderButton() {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const handlePreOrder = async ({
    variant,
  }: PreOrderButtonProps) => {
    if (!variant?.id) {
      toast.error("Please select a variant");
      return;
    }

    try {
      // Attempt to add item to cart
      // For pre-order items (out of stock), this may fail
      // but the backend Checkout.cs handles pre-order detection based on Variant.IsPreOrder flag
      await addItem({
        productVariantId: variant.id,
        quantity: 1,
      });

      // Navigate to checkout - backend will auto-detect as PreOrder
      navigate("/checkout", {
        state: { isPreOrder: true },
      });

      toast.success("Added to checkout! Proceeding to pre-order...");
    } catch (error: any) {
      // If cart rejected the item (stock validation), show message
      const errorMsg = error?.response?.data?.error || error?.message || "Unable to add item";
      toast.error(`Failed to prepare pre-order: ${errorMsg}`);
      console.error("Pre-order error", error);
    }
  };

  return { handlePreOrder };
}
