/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RevenueSummary {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  totalDiscount: number;
  netRevenue: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
  discount: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface InventorySummary {
  totalSkus: number;
  totalStock: number;
  lowStockItems: number;
  outOfStockItems: number;
  lowStockProducts: LowStockProduct[];
}

export interface LowStockProduct {
  productId: string;
  productName: string;
  brand: string;
  sku: string;
  quantityOnHand: number;
  quantityAvailable: number;
}

export interface AfterSalesSummary {
  refund: number;
  return: number;
  warranty: number;
}

export interface PromotionPerformance {
  promoCode: string;
  usageCount: number;
}

export interface DashboardData {
  revenue: RevenueSummary;
  dailyRevenue: DailyRevenue[];
  topProducts: TopProduct[];
  inventory: InventorySummary;
  afterSales: AfterSalesSummary;
  promotions: PromotionPerformance[];
}
