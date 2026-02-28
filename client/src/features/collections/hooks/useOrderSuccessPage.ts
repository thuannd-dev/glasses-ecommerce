import { useLocation } from "react-router-dom";
import type { OrderSuccessState } from "../../../lib/types/order";

export function useOrderSuccessPage() {
  const location = useLocation();
  const state = location.state as OrderSuccessState | null;
  const hasState = state != null;
  const order = state?.order ?? null;
  const address = state?.address ?? null;

  return { order, address, hasState };
}
