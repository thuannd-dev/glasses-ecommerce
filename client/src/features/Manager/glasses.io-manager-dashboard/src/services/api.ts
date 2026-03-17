/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';
import { 
  RevenueSummary, 
  InventorySummary, 
  AfterSalesSummary, 
  PromotionPerformance,
  TopProduct,
  DailyRevenue
} from '../types/dashboard';
import { format, subDays, eachDayOfInterval } from 'date-fns';

// Mock Data
const MOCK_REVENUE: RevenueSummary = {
  totalOrders: 1245,
  completedOrders: 1150,
  cancelledOrders: 95,
  totalRevenue: 154200,
  totalDiscount: 12500,
  netRevenue: 141700
};

const MOCK_INVENTORY: InventorySummary = {
  totalSkus: 450,
  totalStock: 2840,
  lowStockItems: 12,
  outOfStockItems: 5,
  lowStockProducts: [
    { productId: "1", productName: "Ray-Ban Aviator Classic", brand: "Ray-Ban", sku: "RB-3025-L0205", quantityOnHand: 3, quantityAvailable: 2 },
    { productId: "2", productName: "Oakley Holbrook", brand: "Oakley", sku: "OK-9102-01", quantityOnHand: 5, quantityAvailable: 4 },
    { productId: "3", productName: "Gucci Square Frame", brand: "Gucci", sku: "GC-GG0006O", quantityOnHand: 2, quantityAvailable: 1 },
    { productId: "4", productName: "Prada Linea Rossa", brand: "Prada", sku: "PR-PS01US", quantityOnHand: 4, quantityAvailable: 3 }
  ]
};

const MOCK_AFTER_SALES: AfterSalesSummary = {
  refund: 15,
  return: 24,
  warranty: 8
};

const MOCK_PROMOTIONS: PromotionPerformance[] = [
  { promoCode: "SUMMER2026", usageCount: 145 },
  { promoCode: "WELCOME10", usageCount: 89 },
  { promoCode: "FLASH25", usageCount: 56 },
  { promoCode: "BOGO_SUN", usageCount: 34 },
  { promoCode: "NEWYEAR", usageCount: 21 }
];

const MOCK_TOP_PRODUCTS: TopProduct[] = [
  { productId: "1", productName: "Ray-Ban Aviator", quantitySold: 45, revenue: 6750 },
  { productId: "2", productName: "Oakley Holbrook", quantitySold: 38, revenue: 5320 },
  { productId: "3", productName: "Gucci Square", quantitySold: 22, revenue: 8800 }
];

export const dashboardService = {
  async getRevenue(_fromDate: string, _toDate: string): Promise<RevenueSummary> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_REVENUE;
  },

  async getInventory(): Promise<InventorySummary> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_INVENTORY;
  },

  async getAfterSales(): Promise<AfterSalesSummary> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_AFTER_SALES;
  },

  async getPromotions(): Promise<PromotionPerformance[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_PROMOTIONS;
  },

  async getTopProducts(): Promise<TopProduct[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_TOP_PRODUCTS;
  },

  // Helper to generate mock daily data for the chart since the API example only shows summary
  generateDailyRevenue(summary: RevenueSummary, fromDate: string, toDate: string): DailyRevenue[] {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const days = eachDayOfInterval({ start, end });
    
    return days.map(day => {
      // Create some random variation around the average
      const avgRevenue = summary.netRevenue / days.length;
      const variation = (Math.random() - 0.5) * 0.4; // +/- 20%
      
      return {
        date: format(day, 'MMM dd'),
        revenue: Math.round(avgRevenue * (1 + variation)),
        orders: Math.round((summary.totalOrders / days.length) * (1 + variation)),
        discount: Math.round((summary.totalDiscount / days.length) * (1 + variation)),
      };
    });
  }
};
