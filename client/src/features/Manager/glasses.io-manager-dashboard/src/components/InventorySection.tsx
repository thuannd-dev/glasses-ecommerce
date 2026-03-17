/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { InventorySummary } from '../types/dashboard';
import { Package, AlertTriangle, XCircle, Layers } from 'lucide-react';

interface InventorySectionProps {
  data: InventorySummary;
}

export const InventorySection: React.FC<InventorySectionProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InventoryMiniCard 
          title="Total SKUs" 
          value={data.totalSkus} 
          icon={Layers} 
          color="blue" 
        />
        <InventoryMiniCard 
          title="Total Stock" 
          value={data.totalStock} 
          icon={Package} 
          color="indigo" 
        />
        <InventoryMiniCard 
          title="Low Stock" 
          value={data.lowStockItems} 
          icon={AlertTriangle} 
          color="amber" 
        />
        <InventoryMiniCard 
          title="Out of Stock" 
          value={data.outOfStockItems} 
          icon={XCircle} 
          color="rose" 
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-bottom border-slate-100 bg-slate-50/50">
          <h3 className="font-semibold text-slate-800">Low Stock Products</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
                <th className="px-6 py-3">Product Name</th>
                <th className="px-6 py-3">Brand</th>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3 text-right">On Hand</th>
                <th className="px-6 py-3 text-right">Available</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.lowStockProducts.map((product) => (
                <tr key={product.productId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">{product.productName}</td>
                  <td className="px-6 py-4 text-slate-500">{product.brand}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{product.sku}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-700 font-medium">
                      {product.quantityOnHand}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                      {product.quantityAvailable}
                    </span>
                  </td>
                </tr>
              ))}
              {data.lowStockProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    All products are well-stocked
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const InventoryMiniCard = ({ title, value, icon: Icon, color }: any) => {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
      <div className={`p-3 rounded-lg ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
};
