/**
 * Checkout feature types (form state, UI payment method)
 */

/** UI payment method; mapped to API lookups.paymentMethod on submit */
export type PaymentMethodUI = "COD" | "BANK" | "MOMO";

/** Shipping form fields on checkout page */
export interface CheckoutShippingForm {
  recipientName: string;
  recipientPhone: string;
  venue: string;
  ward: string;
  district: string;
  city: string;
  postalCode: string;
  orderNote?: string;
}

/** Snackbar state for checkout page */
export interface CheckoutSnackbarState {
  open: boolean;
  message: string;
  severity: "error" | "info" | "success";
}
