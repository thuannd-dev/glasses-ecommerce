import { toast } from "react-toastify";
import type { CartAuthGateApi } from "../../../../lib/hooks/useRequireAuthForCart";
import { useCart } from "../../../../lib/hooks/useCart";
import { cartStore } from "../../../../lib/stores/cartStore";

export type PreOrderLinePayload = {
  productVariantId: string;
  productId: string;
  name: string;
  image: string;
  price: number;
};

export function usePreOrderButton(cartAuth: CartAuthGateApi) {
  const { addItemAsync } = useCart();

  const handlePreOrder = async (line: PreOrderLinePayload) => {
    if (!line.productVariantId) {
      toast.error("Please select a variant");
      return;
    }

    await cartAuth.runWithAuthAsync(async () => {
      try {
        cartStore.addItem({
          productId: line.productId,
          name: line.name,
          image: line.image,
          price: line.price,
        });

        await addItemAsync({
          productVariantId: line.productVariantId,
          quantity: 1,
        });

        toast.success("Pre-order added to your cart.");
      } catch {
        // addItemAsync / useCart mutation already shows an error toast
      }
    });
  };

  return { handlePreOrder };
}
