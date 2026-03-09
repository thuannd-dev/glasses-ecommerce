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
import type { PrescriptionInputDto } from "../../../lib/types/order";
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
    if (
      !address.recipientName?.trim() ||
      !address.recipientPhone?.trim() ||
      !address.venue?.trim() ||
      !address.ward?.trim() ||
      !address.district?.trim() ||
      !address.city?.trim()
    ) {
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

      // Determine order type based on whether items have custom prescriptions
      const itemsWithPrescription = items.filter((item) => itemPrescriptions[item.id]);
      const anyHasPrescription = itemsWithPrescription.length > 0;
      const orderTypeValue = anyHasPrescription ? "Prescription" : "ReadyStock";

      // Build prescription data if order type is Prescription
      let prescriptionData: PrescriptionInputDto | undefined;
      if (orderTypeValue === "Prescription" && anyHasPrescription) {
        // VALIDATION: All items with prescriptions must have identical prescription details
        // Because 1 Order → 1 Prescription, and each eye can only have 1 detail
        const referencePrescription = itemsWithPrescription[0] ? itemPrescriptions[itemsWithPrescription[0].id] : null;
        
        if (referencePrescription) {
          // Check if all items with prescriptions have identical details
          const hasConflict = itemsWithPrescription.some((item) => {
            const itemPrescription = itemPrescriptions[item.id];
            if (!itemPrescription) return false;
            
            // Compare details: must have same number of details and same values
            if (itemPrescription.details.length !== referencePrescription.details.length) {
              return true; // Conflict: different number of details
            }
            
            // Check each detail matches
            return itemPrescription.details.some((detail) => {
              const refDetail = referencePrescription.details.find((d) => d.eye === detail.eye);
              if (!refDetail) return true; // Conflict: missing eye detail
              
              return (
                detail.sph !== refDetail.sph ||
                detail.cyl !== refDetail.cyl ||
                detail.axis !== refDetail.axis ||
                detail.pd !== refDetail.pd ||
                detail.add !== refDetail.add
              );
            });
          });
          
          if (hasConflict) {
            setSnackbar({
              open: true,
              message: itemsWithPrescription.length > 1 
                ? "All items with prescriptions must have identical prescription details. Please update the prescription for all items to match."
                : "Invalid prescription data. Please check the prescription details.",
              severity: "error",
            });
            setSubmitting(false);
            return;
          }
          
          // All items have identical prescriptions, use the reference prescription
          prescriptionData = {
            details: referencePrescription.details.map((detail) => ({
              eye: detail.eye === 1 ? 2 : 1, // Map frontend (1=Right, 2=Left) to backend (2=Right, 1=Left)
              sph: detail.sph,
              cyl: detail.cyl,
              axis: detail.axis,
              pd: detail.pd,
              add: detail.add,
            })),
          };
        }
      }

      const createdOrder = await createOrder.mutateAsync({
        addressId: createdAddress.id,
        paymentMethod: toApiPaymentMethod(paymentMethod),
        customerNote: address.orderNote || null,
        orderType: orderTypeValue,
        selectedCartItemIds: items.map((item) => item.id),
        prescription: prescriptionData || null,
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
      let errorMessage = "Failed to save address or place order. Please try again.";
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (Array.isArray(err)) {
        // Validation errors from API interceptor
        const messages = err.filter((e) => typeof e === "string" || (typeof e === "object" && e !== null));
        if (messages.length > 0) {
          errorMessage = messages.map((m) => {
            if (typeof m === "string") return m;
            if (Array.isArray(m)) return m.join(", ");
            return String(m);
          }).join("; ");
        }
      } else if (typeof err === "object" && err !== null) {
        const error = err as Record<string, unknown>;
        if (error.response && typeof error.response === "object") {
          const response = error.response as Record<string, unknown>;
          if (response.data && typeof response.data === "object") {
            const data = response.data as Record<string, unknown>;
            if (data.message && typeof data.message === "string") {
              errorMessage = data.message;
            } else if (data.errors && typeof data.errors === "object") {
              const errors = data.errors as Record<string, unknown>;
              const errorMessages = Object.values(errors)
                .filter((v) => Array.isArray(v) || typeof v === "string")
                .flatMap((v) => typeof v === "string" ? [v] : v)
                .filter((msg) => typeof msg === "string");
              if (errorMessages.length > 0) {
                errorMessage = errorMessages.join("; ");
              }
            }
          }
        }
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
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
