import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useCart } from "../../../lib/hooks/useCart";
import { useCreateAddress } from "../../../lib/hooks/useAddresses";
import { useCreateOrder } from "../../../lib/hooks/useOrders";
import { setOrderItemImages } from "../../orders/orderImageCache";
import { setOrderShippingAddress } from "../../orders/orderShippingAddressCache";
import { setOrderPrescriptions } from "../../orders/orderPrescriptionCache";
import { getCartItemPrescriptions } from "../../cart/prescriptionCache";
import type { PrescriptionData } from "../../../lib/types/prescription";
import type { CheckoutShippingForm, CheckoutSnackbarState, PaymentMethodUI } from "../types";
import { toApiPaymentMethod, isValidVietnamPhone } from "../utils";

const initialAddress: CheckoutShippingForm = {
  recipientName: "",
  recipientPhone: "",
  venue: "",
  ward: "",
  district: "",
  city: "",
  postalCode: "",
  orderNote: "",
};

const initialSnackbar: CheckoutSnackbarState = {
  open: false,
  message: "",
  severity: "error",
};

export function useCheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { cart, isLoading: cartLoading } = useCart();
  const createAddress = useCreateAddress();
  const createOrder = useCreateOrder();

  const selectedCartItemIds = (location.state as { selectedCartItemIds?: string[] } | null)?.selectedCartItemIds;
  const cartItems = useMemo(() => cart?.items ?? [], [cart?.items]);
  const items = useMemo(() => {
    if (selectedCartItemIds != null && selectedCartItemIds.length > 0) {
      const set = new Set(selectedCartItemIds);
      return cartItems.filter((i) => set.has(i.id));
    }
    return cartItems;
  }, [cartItems, selectedCartItemIds]);
  const totalAmount = useMemo(
    () => items.reduce((s, i) => s + (i.subtotal ?? i.price * i.quantity), 0),
    [items],
  );
  const isEmptyCart = items.length === 0;

  const [address, setAddress] = useState<CheckoutShippingForm>(initialAddress);
  const [addressSearch, setAddressSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodUI>("COD");
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<CheckoutSnackbarState>(initialSnackbar);

  useEffect(() => {
    if (isEmptyCart) {
      setSnackbar({
        open: true,
        message: "Your cart is empty. Add items before checkout.",
        severity: "info",
      });
    }
  }, [isEmptyCart]);

  const handlePlaceOrder = async () => {
    if (isEmptyCart) {
      setSnackbar({ open: true, message: "Your cart is empty.", severity: "error" });
      return;
    }
    if (!address.recipientName || !address.recipientPhone || !address.venue) {
      setSnackbar({
        open: true,
        message: "Please fill all required shipping information.",
        severity: "error",
      });
      return;
    }
    if (!isValidVietnamPhone(address.recipientPhone)) {
      setSnackbar({
        open: true,
        message: "Please enter a valid Vietnam phone number (10 digits).",
        severity: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      const createdAddress = await createAddress.mutateAsync({
        recipientName: address.recipientName,
        recipientPhone: address.recipientPhone,
        venue: address.venue,
        ward: address.ward,
        district: address.district,
        city: address.city,
        postalCode: address.postalCode || null,
        isDefault: false,
      });

      const createdOrder = await createOrder.mutateAsync({
        addressId: createdAddress.id,
        paymentMethod: toApiPaymentMethod(paymentMethod),
        orderNote: address.orderNote || null,
        orderType: "ReadyStock",
        selectedCartItemIds: items.map((item) => item.id),
      });

      queryClient.invalidateQueries({ queryKey: ["cart"] });

      const shippingAddr =
        typeof createdOrder.shippingAddress === "object" && createdOrder.shippingAddress != null
          ? {
              recipientName: (createdOrder.shippingAddress as { recipientName?: string }).recipientName ?? address.recipientName,
              recipientPhone: (createdOrder.shippingAddress as { recipientPhone?: string }).recipientPhone ?? address.recipientPhone,
              venue: (createdOrder.shippingAddress as { venue?: string }).venue ?? address.venue,
              ward: (createdOrder.shippingAddress as { ward?: string }).ward ?? address.ward,
              district: (createdOrder.shippingAddress as { district?: string }).district ?? address.district,
              city: (createdOrder.shippingAddress as { city?: string }).city ?? address.city,
              postalCode: (createdOrder.shippingAddress as { postalCode?: string }).postalCode ?? address.postalCode,
            }
          : address;

      const orderForState = createdOrder as unknown as {
        id: string;
        orderSource: string;
        orderType: string;
        orderStatus: string;
        totalAmount: number;
        shippingFee: number;
        finalAmount: number;
        discountApplied: number | null;
        customerNote: string | null;
        createdAt: string;
        items: Array<{
          id: string;
          productVariantId: string;
          sku: string;
          variantName: string | null;
          productName: string;
          quantity: number;
          unitPrice: number;
          totalPrice: number;
        }>;
        payment: { id: string; paymentMethod: string; paymentStatus: string; amount: number; paymentAt: string | null } | null;
        statusHistories: Array<{ fromStatus: string | null; toStatus: string; notes: string | null; createdAt: string }>;
      };

      const variantToImage: Record<string, string> = {};
      items.forEach((cartItem) => {
        if (cartItem.productImageUrl) variantToImage[cartItem.productVariantId] = cartItem.productImageUrl;
      });
      setOrderItemImages(orderForState.id, variantToImage);
      setOrderShippingAddress(orderForState.id, shippingAddr);
      const prescriptionsByCartItem = getCartItemPrescriptions(
        items.map((i) => ({ id: i.id, productVariantId: i.productVariantId }))
      );
      const prescriptionsByVariant: Record<string, PrescriptionData> = {};
      items.forEach((cartItem) => {
        const prescription = prescriptionsByCartItem[cartItem.id];
        if (prescription) prescriptionsByVariant[cartItem.productVariantId] = prescription;
      });
      setOrderPrescriptions(orderForState.id, prescriptionsByVariant);
      const orderItemsWithImage = orderForState.items.map((oItem) => ({
        ...oItem,
        imageUrl: variantToImage[oItem.productVariantId] ?? undefined,
      }));

      navigate("/order-success", {
        state: { order: { ...orderForState, items: orderItemsWithImage }, address: shippingAddr },
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : "Failed to save address or place order. Please try again.",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const itemPrescriptions = useMemo(
    () =>
      getCartItemPrescriptions(
        items.map((i) => ({ id: i.id, productVariantId: i.productVariantId }))
      ),
    [items],
  );

  return {
    items,
    totalAmount,
    isEmptyCart,
    itemPrescriptions,
    cartLoading,
    address,
    setAddress,
    addressSearch,
    setAddressSearch,
    paymentMethod,
    setPaymentMethod,
    submitting,
    snackbar,
    setSnackbar,
    handlePlaceOrder,
  };
}
