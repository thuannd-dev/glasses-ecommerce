import { useQuery } from "@tanstack/react-query";
import agent from "../api/agent";

// ── Revenue ──
export interface RevenueBySource {
  source: string;
  orderCount: number;
  revenue: number;
  discount: number;
  netRevenue: number;
}

export interface RevenueSummary {
  orderSource: string;
  fromDate: string;
  toDate: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  totalDiscount: number;
  netRevenue: number;
  bySource: RevenueBySource[];
}

// ── Top Products ──
export interface TopProductItem {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface TopProductsResponse {
  fromDate: string | null;
  toDate: string | null;
  topN: number;
  items: TopProductItem[];
}

// ── Inventory ──
export interface LowStockItem {
  productId: string;
  productName: string;
  brand: string | null;
  variantId: string;
  variantName: string | null;
  sku: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  quantityPreOrdered: number;
}

export interface InventorySummary {
  totalSKUs: number;
  totalOnHand: number;
  totalAvailable: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStockItems: LowStockItem[];
}

// ── After-Sales ──
export interface AfterSalesByType {
  ticketType: string;
  count: number;
  totalRefundAmount: number;
}

export interface AfterSalesByStatus {
  status: string;
  count: number;
}

export interface AfterSalesSummary {
  totalTickets: number;
  openTickets: number;
  resolutionRate: number;
  byType: AfterSalesByType[];
  byStatus: AfterSalesByStatus[];
}

// ── Promotions ──
export interface PromotionItem {
  promotionId: string;
  promoCode: string;
  promoName: string;
  promotionType: string;
  discountValue: number;
  usageCount: number;
  totalDiscountApplied: number;
  isActive: boolean;
  validFrom: string;
  validTo: string;
}

export interface PromotionsResponse {
  fromDate: string | null;
  toDate: string | null;
  items: PromotionItem[];
}

// ── Hook ──
export function useManagerDashboard(fromDate?: string, toDate?: string) {
  const revenueQuery = useQuery({
    queryKey: ["manager-dashboard-revenue", fromDate, toDate],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      const res = await agent.get<RevenueSummary>("/manager/reports/revenue", { params });
      return res.data;
    },
  });

  const topProductsQuery = useQuery({
    queryKey: ["manager-dashboard-top-products", fromDate, toDate],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      const res = await agent.get<TopProductsResponse>("/manager/reports/top-products", { params });
      return res.data;
    },
  });

  const inventoryQuery = useQuery({
    queryKey: ["manager-dashboard-inventory"],
    queryFn: async () => {
      const res = await agent.get<InventorySummary>("/manager/reports/inventory");
      return res.data;
    },
  });

  const afterSalesQuery = useQuery({
    queryKey: ["manager-dashboard-after-sales"],
    queryFn: async () => {
      const res = await agent.get<AfterSalesSummary>("/manager/reports/after-sales");
      return res.data;
    },
  });

  const promotionsQuery = useQuery({
    queryKey: ["manager-dashboard-promotions"],
    queryFn: async () => {
      const res = await agent.get<PromotionsResponse>("/manager/reports/promotions");
      return res.data;
    },
  });

  const isLoading =
    revenueQuery.isLoading ||
    topProductsQuery.isLoading ||
    inventoryQuery.isLoading ||
    afterSalesQuery.isLoading ||
    promotionsQuery.isLoading;

  return {
    revenue: revenueQuery.data ?? null,
    topProducts: topProductsQuery.data ?? null,
    inventory: inventoryQuery.data ?? null,
    afterSales: afterSalesQuery.data ?? null,
    promotions: promotionsQuery.data ?? null,
    isLoading,
    revenueQuery,
    topProductsQuery,
    inventoryQuery,
    afterSalesQuery,
    promotionsQuery,
  };
}
