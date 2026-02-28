import { useParams } from "react-router-dom";
import { useOrder } from "../../../lib/hooks/useOrders";
import type { CustomerOrderDetailDto, CustomerOrderItemDto } from "../../../lib/types/order";
import { getOrderShippingAddress } from "../orderShippingAddressCache";
import { formatOrderAddress } from "../utils";

export function useOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error } = useOrder(id);

  const order = data as CustomerOrderDetailDto | undefined;
  const orderLabel = order?.orderNumber ?? order?.id ?? "";
  const orderStatus = order?.orderStatus ?? order?.status ?? "";
  const items: CustomerOrderItemDto[] = order?.items ?? [];
  const cachedAddress = getOrderShippingAddress(id);
  const addressStr = formatOrderAddress(cachedAddress ?? order?.shippingAddress);

  return {
    orderId: id,
    order,
    isLoading,
    isError,
    error,
    orderLabel,
    orderStatus,
    items,
    addressStr,
  };
}
