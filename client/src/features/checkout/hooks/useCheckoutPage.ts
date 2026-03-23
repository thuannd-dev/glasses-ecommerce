import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useCart } from "../../../lib/hooks/useCart";
import { useAddresses, useCreateAddress, useDefaultAddress } from "../../../lib/hooks/useAddresses";
import { useCreateOrder, useCreatePaymentUrl } from "../../../lib/hooks/useOrders";
import { useValidatePromotion, useActivePromotions } from "../../../lib/hooks/usePromotions";
import { setOrderItemImages } from "../../orders/orderImageCache";
import { setOrderShippingAddress } from "../../orders/orderShippingAddressCache";
import { setOrderPrescriptions } from "../../orders/orderPrescriptionCache";
import { getCartItemPrescriptions } from "../../cart/prescriptionCache";
import type { PrescriptionData } from "../../../lib/types/prescription";
import type { ActivePromotionDto } from "../../../lib/types/promotion";
import type { CheckoutShippingForm, CheckoutSnackbarState, PaymentMethodUI } from "../types";
import { toApiPaymentMethod, isValidVietnamPhone, toPrescriptionInputDto } from "../utils";

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
  const { data: savedAddresses = [] } = useAddresses();
  const { data: defaultAddress } = useDefaultAddress();
  const createAddress = useCreateAddress();
  const createOrder = useCreateOrder();
  const createPaymentUrl = useCreatePaymentUrl();
  const validatePromotion = useValidatePromotion();
  const { data: activePromotions = [] } = useActivePromotions();

  const [address, setAddress] = useState<CheckoutShippingForm>(initialAddress);
  const [addressSearch, setAddressSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodUI>("COD");
  const [appliedPromo, setAppliedPromo] = useState<{ promoCode: string; discountAmount: number } | null>(null);
  const [privatePromoInput, setPrivatePromoInput] = useState("");
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<CheckoutSnackbarState>(initialSnackbar);

  const selectedCartItemIds = (location.state as { selectedCartItemIds?: string[]; isPreOrder?: boolean } | null)?.selectedCartItemIds;
  const isPreOrder = (location.state as { selectedCartItemIds?: string[]; isPreOrder?: boolean } | null)?.isPreOrder ?? false;
  
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
  const discountAmount = appliedPromo?.discountAmount ?? 0;
  const finalAmount = Math.max(0, totalAmount - discountAmount);
  const isEmptyCart = items.length === 0;

  const itemPrescriptions = useMemo(
    () =>
      getCartItemPrescriptions(
        items.map((i) => ({ id: i.id, productVariantId: i.productVariantId })),
      ),
    [items],
  );

  // Prefill form with default address when it loads (only first time)
  useEffect(() => {
    if (!defaultAddress) return;
    setAddress((prev) => {
      // avoid overriding if user already typed something meaningful
      if (prev.recipientName || prev.recipientPhone || prev.venue) return prev;
      return {
        recipientName: defaultAddress.recipientName,
        recipientPhone: defaultAddress.recipientPhone,
        venue: defaultAddress.venue,
        ward: defaultAddress.ward,
        district: defaultAddress.district,
        city: defaultAddress.city,
        postalCode: defaultAddress.postalCode ?? "",
        orderNote: prev.orderNote ?? "",
      };
    });
  }, [defaultAddress]);

  // Public promotion (from /promotions/active) — client-side calculation only
  const handleApplyActivePromo = (promo: ActivePromotionDto) => {
    if (totalAmount <= 0) {
      setSnackbar({ open: true, message: "Your cart is empty.", severity: "info" });
      return;
    }

    // If this promo is already applied, clicking again will remove it
    if (appliedPromo?.promoCode === promo.promoCode) {
      setAppliedPromo(null);
      return;
    }

    let discount = 0;
    if (promo.promotionType === "FixedAmount") {
      discount = Math.min(totalAmount, promo.discountValue);
    } else if (promo.promotionType === "Percentage") {
      const raw = (totalAmount * promo.discountValue) / 100;
      const cap = promo.maxDiscountValue != null ? promo.maxDiscountValue : raw;
      discount = Math.min(raw, cap);
    }

    setAppliedPromo({ promoCode: promo.promoCode, discountAmount: discount });
  };

  // Private promotion (user-entered code) — validate via API
  const handleApplyPrivatePromo = async (code: string, shippingFee: number = 0) => {
    if (!code.trim() || totalAmount <= 0) {
      setSnackbar({ open: true, message: "Your cart is empty.", severity: "info" });
      return;
    }
    try {
      const data = await validatePromotion.mutateAsync({
        promoCode: code.trim(),
        orderTotal: totalAmount,
        shippingFee,
      });
      const discount = typeof data?.discountApplied === "number" ? data.discountApplied : 0;
      setAppliedPromo({ promoCode: code.trim(), discountAmount: discount });
      setSnackbar({
        open: true,
        message:
          discount > 0
            ? `Promo applied. Discount ${discount.toLocaleString("en-US", { style: "currency", currency: "USD" })}`
            : "Applied.",
        severity: "success",
      });
    } catch {
      setAppliedPromo(null);
      setSnackbar({ open: true, message: "Invalid or expired promo code.", severity: "error" });
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPrivatePromoInput("");
  };

  useEffect(() => {
    if (isEmptyCart) {
      setSnackbar({
        open: true,
        message: "Your cart is empty. Add items before checkout.",
        severity: "info",
      });
    }
  }, [isEmptyCart]);

  const handlePlaceOrder = async (params?: {
    shippingFee?: number;
    districtId?: number | null;
    wardCode?: string | null;
  }) => {
    const shippingFee = params?.shippingFee ?? 0;
    const districtId = params?.districtId ?? null;
    const wardCode = params?.wardCode?.trim() ?? "";
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
    if (!districtId || districtId <= 0 || !wardCode) {
      setSnackbar({
        open: true,
        message: "Please select a valid district and ward before placing order.",
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
        isDefault: setAsDefault,
      });

      const hasPrescriptionItems = Object.keys(itemPrescriptions).length > 0;
      
      // Build prescriptions array: each cart item with prescription becomes an OrderItemPrescriptionDto
      const prescriptionsArray = hasPrescriptionItems
        ? Object.entries(itemPrescriptions)
            .filter(([, prescription]) => prescription.details?.length > 0)
            .map(([cartItemId, prescription]) => ({
              cartItemId,
              prescription: toPrescriptionInputDto(prescription),
            }))
        : [];

      if (hasPrescriptionItems && prescriptionsArray.length === 0) {
        setSnackbar({
          open: true,
          message: "Prescription details are required for prescription items. Please go back and re-enter prescription for your lens selection.",
          severity: "error",
        });
        setSubmitting(false);
        return;
      }

      const createdOrder = await createOrder.mutateAsync({
        addressId: createdAddress.id,
        paymentMethod: toApiPaymentMethod(paymentMethod),
        orderNote: address.orderNote || null,
        orderType: isPreOrder ? "PreOrder" : hasPrescriptionItems ? "Prescription" : "ReadyStock",
        selectedCartItemIds: items.map((item) => item.id),
        districtId,
        wardCode,
        promoCode: appliedPromo?.promoCode ?? undefined,
        prescription: undefined, // Don't use old single-prescription payload
        prescriptions: prescriptionsArray.length > 0 ? prescriptionsArray : undefined,
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
      
      // Map prescriptions from cart items to order items
      // Important: items array is in same order as orderForState.items after creation
      const prescriptionsByOrderItem: Record<string, PrescriptionData> = {};
      items.forEach((cartItem, index) => {
        const orderItem = orderForState.items[index];
        const prescription = itemPrescriptions[cartItem.id];
        if (orderItem && prescription) {
          prescriptionsByOrderItem[orderItem.id] = prescription;
        }
      });
      setOrderPrescriptions(orderForState.id, prescriptionsByOrderItem);
      const orderItemsWithImage = orderForState.items.map((oItem) => ({
        ...oItem,
        imageUrl: variantToImage[oItem.productVariantId] ?? undefined,
      }));

      const orderForUi = {
        ...orderForState,
        shippingFee,
        finalAmount: Math.max(0, orderForState.finalAmount + shippingFee),
        items: orderItemsWithImage,
      };

      if (paymentMethod === "BANK") {
        const urlReq = await createPaymentUrl.mutateAsync({
          orderId: orderForState.id,
          orderType: orderForState.orderType,
          amount: orderForState.finalAmount,
          name: address.recipientName,
        });

        const urlString = typeof urlReq === "string" ? urlReq : (urlReq as { value?: string })?.value;
        if (urlString) {
          window.location.href = urlString;
          return; // Stop execution, browser will redirect
        } else {
          setSnackbar({
            open: true,
            message: "Failed to generate payment URL. Please try again.",
            severity: "error",
          });
          return;
        }
      }

      navigate("/order-success", {
        state: { order: orderForUi, address: shippingAddr },
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

  return {
    items,
    totalAmount,
    finalAmount,
    discountAmount,
    appliedPromo,
    isEmptyCart,
    itemPrescriptions,
    cartLoading,
    savedAddresses,
    defaultAddress,
    address,
    setAddress,
    addressSearch,
    setAddressSearch,
    paymentMethod,
    setPaymentMethod,
    activePromotions,
    privatePromoInput,
    setPrivatePromoInput,
    setAsDefault,
    setSetAsDefault,
    handleApplyActivePromo,
    handleApplyPrivatePromo,
    handleRemovePromo,
    isApplyingPromo: validatePromotion.isPending,
    submitting,
    snackbar,
    setSnackbar,
    handlePlaceOrder,
  };
}
