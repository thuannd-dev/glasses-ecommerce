/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Tag, 
  LifeBuoy, 
  Calendar, 
  ChevronDown,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  DollarSign,
  Ticket,
  Search,
  Bell,
  User,
  Menu,
  X,
  ChevronLeft,
  Plus,
  Filter,
  List,
  Grid,
  Edit2,
  Trash2,
  LogOut
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

import { KpiCard } from './components/KpiCard';
import { RevenueChart } from './components/RevenueChart';
import { InventorySection } from './components/InventorySection';
import { PromotionChart } from './components/PromotionChart';
import { AfterSalesChart } from './components/AfterSalesChart';
import { dashboardService } from './services/api';
import { 
  RevenueSummary, 
  DailyRevenue, 
  InventorySummary, 
  AfterSalesSummary, 
  PromotionPerformance 
} from './types/dashboard';
import { formatCurrency, formatNumber } from './utils/format';

type View = 'dashboard' | 'products' | 'inbound' | 'promotions' | 'pre-orders';
type DateRange = '7d' | '30d' | '90d' | 'custom';

export default function App() {
  const [activeView, setActiveView] = useState<View>('products');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [isLoading, setIsLoading] = useState(true);
  
  // Dashboard State
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [inventory, setInventory] = useState<InventorySummary | null>(null);
  const [afterSales, setAfterSales] = useState<AfterSalesSummary | null>(null);
  const [promotions, setPromotions] = useState<PromotionPerformance[]>([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const toDate = format(endOfDay(new Date()), 'yyyy-MM-dd');
      let fromDate = '';
      
      switch (dateRange) {
        case '7d': fromDate = format(subDays(new Date(), 7), 'yyyy-MM-dd'); break;
        case '30d': fromDate = format(subDays(new Date(), 30), 'yyyy-MM-dd'); break;
        case '90d': fromDate = format(subDays(new Date(), 90), 'yyyy-MM-dd'); break;
        default: fromDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      }

      const [revData, invData, asData, promoData] = await Promise.all([
        dashboardService.getRevenue(fromDate, toDate),
        dashboardService.getInventory(),
        dashboardService.getAfterSales(),
        dashboardService.getPromotions()
      ]);

      setRevenue(revData);
      setDailyRevenue(dashboardService.generateDailyRevenue(revData, fromDate, toDate));
      setInventory(invData);
      setAfterSales(asData);
      setPromotions(promoData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">Glasses API</span>
          </div>

          <div className="px-6 py-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Manager</p>
            <nav className="space-y-1">
              <NavItem 
                icon={LayoutDashboard} 
                label="Dashboard" 
                active={activeView === 'dashboard'} 
                onClick={() => setActiveView('dashboard')}
              />
              <NavItem 
                icon={ShoppingBag} 
                label="Products" 
                active={activeView === 'products'} 
                onClick={() => setActiveView('products')}
              />
              <NavItem 
                icon={Package} 
                label="Inbound" 
                active={activeView === 'inbound'} 
                onClick={() => setActiveView('inbound')}
              />
              <NavItem 
                icon={Tag} 
                label="Promotions" 
                active={activeView === 'promotions'} 
                onClick={() => setActiveView('promotions')}
              />
              <NavItem 
                icon={Calendar} 
                label="Pre-Orders" 
                active={activeView === 'pre-orders'} 
                onClick={() => setActiveView('pre-orders')}
              />
            </nav>
          </div>

          <div className="mt-auto p-6 border-t border-slate-100">
            <button className="flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-colors w-full">
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeView === 'dashboard' ? (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
                  <p className="text-slate-500">Welcome back, here's what's happening today.</p>
                </div>
                
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                  <DateFilterBtn active={dateRange === '7d'} onClick={() => setDateRange('7d')}>7 Days</DateFilterBtn>
                  <DateFilterBtn active={dateRange === '30d'} onClick={() => setDateRange('30d')}>30 Days</DateFilterBtn>
                  <DateFilterBtn active={dateRange === '90d'} onClick={() => setDateRange('90d')}>90 Days</DateFilterBtn>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <KpiCard 
                  title="Total Orders" 
                  value={revenue ? formatNumber(revenue.totalOrders) : '...'} 
                  icon={ShoppingBag} 
                  gradient="from-blue-600 to-indigo-700"
                  trend={{ value: 12, isPositive: true }}
                  delay={0.1}
                />
                <KpiCard 
                  title="Completed" 
                  value={revenue ? formatNumber(revenue.completedOrders) : '...'} 
                  icon={CheckCircle2} 
                  gradient="from-emerald-500 to-teal-600"
                  trend={{ value: 8, isPositive: true }}
                  delay={0.2}
                />
                <KpiCard 
                  title="Cancelled" 
                  value={revenue ? formatNumber(revenue.cancelledOrders) : '...'} 
                  icon={XCircle} 
                  gradient="from-rose-500 to-pink-600"
                  trend={{ value: 4, isPositive: false }}
                  delay={0.3}
                />
                <KpiCard 
                  title="Net Revenue" 
                  value={revenue ? formatCurrency(revenue.netRevenue) : '...'} 
                  icon={DollarSign} 
                  gradient="from-amber-500 to-orange-600"
                  trend={{ value: 15, isPositive: true }}
                  delay={0.4}
                />
                <KpiCard 
                  title="Discounts" 
                  value={revenue ? formatCurrency(revenue.totalDiscount) : '...'} 
                  icon={Ticket} 
                  gradient="from-violet-500 to-purple-600"
                  trend={{ value: 2, isPositive: true }}
                  delay={0.5}
                />
                <KpiCard 
                  title="Support" 
                  value={afterSales ? formatNumber(afterSales.refund + afterSales.return + afterSales.warranty) : '...'} 
                  icon={LifeBuoy} 
                  gradient="from-slate-700 to-slate-900"
                  trend={{ value: 1, isPositive: false }}
                  delay={0.6}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Revenue Analytics</h3>
                      <p className="text-sm text-slate-500">Daily revenue trend for the selected period</p>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm font-semibold">
                      <TrendingUp className="w-4 h-4" />
                      <span>+12.5%</span>
                    </div>
                  </div>
                  <RevenueChart data={dailyRevenue} isLoading={isLoading} />
                </div>

                <div className="space-y-8">
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">After Sales</h3>
                    {afterSales ? <AfterSalesChart data={afterSales} /> : <div className="h-[300px] animate-pulse bg-slate-50 rounded-xl" />}
                  </div>
                  
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Promotions</h3>
                    {promotions.length > 0 ? <PromotionChart data={promotions} /> : <div className="h-[300px] animate-pulse bg-slate-50 rounded-xl" />}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Inventory Overview</h3>
                  <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View Full Inventory</button>
                </div>
                {inventory ? <InventorySection data={inventory} /> : <div className="h-[400px] animate-pulse bg-slate-50 rounded-2xl" />}
              </div>
            </div>
          ) : activeView === 'products' ? (
            <ProductsView />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              Coming Soon
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ProductsView() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Products Management</p>
        <h2 className="text-3xl font-bold text-slate-900">All Products (13)</h2>
        <p className="text-slate-500 mt-1">Manage your product catalog, view inventory levels, and update product information.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900">Create</h4>
              <p className="text-sm text-slate-500">Use the wizard to save progress and resume later.</p>
            </div>
            <button className="bg-[#1976D2] hover:bg-[#1565C0] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors">
              <Plus className="w-4 h-4" />
              CREATE PRODUCT
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by product name, brand, or description..." 
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <FilterSelect label="Brand" />
            <FilterSelect label="Status" />
            <FilterSelect label="Type" />
            <FilterInput label="Min Price" />
            <FilterInput label="Max Price" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-4">
              <FilterSelect label="Sort By" defaultValue="Created Date" />
              <FilterSelect label="Order" defaultValue="Descending" />
              <FilterSelect label="Page Size" defaultValue="10" />
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200">
                Clear Filters
              </button>
              <div className="flex items-center bg-slate-100 p-1 rounded-lg">
                <button className="p-2 bg-white shadow-sm rounded-md text-slate-900">
                  <List className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-500 hover:text-slate-900">
                  <Grid className="w-4 h-4" />
                </button>
              </div>
              <button className="bg-[#A1887F] hover:bg-[#8D6E63] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors">
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-t border-slate-100">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4 text-center">Brand</th>
                <th className="px-6 py-4 text-center">Type</th>
                <th className="px-6 py-4 text-center">Price Range</th>
                <th className="px-6 py-4 text-center">Stock</th>
                <th className="px-6 py-4 text-center">Category</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <ProductRow 
                name="Demo 3d" 
                brand="Ray-Ban" 
                type="Frame" 
                price="$88 - $88" 
                stock={0} 
                category="Eyeglasses" 
              />
              {[...Array(4)].map((_, i) => (
                <ProductRow 
                  key={i}
                  name={`Product ${i + 1}`} 
                  brand="Oakley" 
                  type="Sun" 
                  price="$120 - $150" 
                  stock={15 + i * 5} 
                  category="Sunglasses" 
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProductRow({ name, brand, type, price, stock, category }: any) {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-slate-400" />
          </div>
          <span className="font-semibold text-slate-900">{name}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-center text-sm text-slate-600">{brand}</td>
      <td className="px-6 py-4 text-center text-sm text-slate-600">{type}</td>
      <td className="px-6 py-4 text-center text-sm font-medium text-slate-900">{price}</td>
      <td className="px-6 py-4 text-center">
        <span className={`
          inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold
          ${stock === 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}
        `}>
          {stock}
        </span>
      </td>
      <td className="px-6 py-4 text-center text-sm text-slate-600">{category}</td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function FilterSelect({ label, defaultValue }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <select className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all">
          <option>{defaultValue || label}</option>
        </select>
        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

function FilterInput({ label }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
      <input 
        type="text" 
        placeholder={label}
        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
    </div>
  );
}

const NavItem = ({ icon: Icon, label, active = false, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`
      flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all w-full
      ${active 
        ? 'bg-[#FDF4F1] text-[#D84315]' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
    `}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-[#D84315]' : 'text-slate-400'}`} />
    {label}
  </button>
);

const DateFilterBtn = ({ children, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`
      px-4 py-1.5 rounded-lg text-sm font-medium transition-all
      ${active 
        ? 'bg-white text-indigo-600 shadow-sm' 
        : 'text-slate-500 hover:text-slate-900'}
    `}
  >
    {children}
  </button>
);
