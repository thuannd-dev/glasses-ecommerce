import { useState, useMemo, useCallback } from "react";
import { useAccount } from "../../lib/hooks/useAccount";
import { useManagerDashboard } from "../../lib/hooks/useManagerDashboard";
import type { PromotionItem, LowStockItem } from "../../lib/hooks/useManagerDashboard";
import { format, subDays } from "date-fns";
import * as XLSX from "xlsx";
import {
  ShoppingBag,
  CheckCircle2,
  XCircle,
  DollarSign,
  Ticket,
  LifeBuoy,
  Layers,
  Package,
  AlertTriangle,
  TrendingUp,
  Search,
  Download,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

type DateRange = "7d" | "30d" | "90d";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const formatNumber = (v: number) => new Intl.NumberFormat("en-US").format(v);

export default function ManagerDashboard() {
  const { currentUser } = useAccount();
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  const { fromDate, toDate } = useMemo(() => {
    const to = format(new Date(), "yyyy-MM-dd");
    const days = dateRange === "7d" ? 7 : dateRange === "90d" ? 90 : 30;
    const from = format(subDays(new Date(), days), "yyyy-MM-dd");
    return { fromDate: from, toDate: to };
  }, [dateRange]);

  const { revenue, inventory, afterSales, promotions, topProducts, isLoading } =
    useManagerDashboard(fromDate, toDate);

  // Revenue chart — build daily data from bySource or show summary bar
  const revenueChartData = useMemo(() => {
    if (!revenue) return [];
    // Since the API returns summary, show a source breakdown bar
    if (revenue.bySource.length > 0) {
      return revenue.bySource.map((s) => ({
        name: s.source,
        revenue: s.revenue,
        orders: s.orderCount,
        discount: s.discount,
      }));
    }
    return [
      { name: "Total", revenue: revenue.totalRevenue, orders: revenue.totalOrders, discount: revenue.totalDiscount },
    ];
  }, [revenue]);

  // After-sales chart data
  const afterSalesChartData = useMemo(() => {
    if (!afterSales) return [];
    return afterSales.byType.map((t) => ({
      name: t.ticketType,
      value: t.count,
    }));
  }, [afterSales]);

  // Promotions chart data (top 5 by usage)
  const promotionsChartData = useMemo(() => {
    if (!promotions) return [];
    return [...promotions.items]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 6)
      .map((p) => ({ promoCode: p.promoCode, usageCount: p.usageCount }));
  }, [promotions]);

  // ── Promotions table state ──
  const [promoSearch, setPromoSearch] = useState("");
  const [promoTypeFilter, setPromoTypeFilter] = useState("");
  const [promoStatusFilter, setPromoStatusFilter] = useState("");
  const [promoSortKey, setPromoSortKey] = useState<string>("usageCount");
  const [promoSortDir, setPromoSortDir] = useState<"asc" | "desc">("desc");
  const [promoPage, setPromoPage] = useState(1);
  const [promoPageSize, setPromoPageSize] = useState(10);

  const filteredPromotions = useMemo(() => {
    if (!promotions) return [];
    let items = [...promotions.items];
    if (promoSearch) {
      const q = promoSearch.toLowerCase();
      items = items.filter(
        (p) => p.promoCode.toLowerCase().includes(q) || p.promoName.toLowerCase().includes(q),
      );
    }
    if (promoTypeFilter) items = items.filter((p) => p.promotionType === promoTypeFilter);
    if (promoStatusFilter === "Active") items = items.filter((p) => p.isActive);
    else if (promoStatusFilter === "Inactive") items = items.filter((p) => !p.isActive);
    items.sort((a, b) => {
      const av = (a as any)[promoSortKey];
      const bv = (b as any)[promoSortKey];
      if (typeof av === "string" && typeof bv === "string")
        return promoSortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      if (typeof av === "number" && typeof bv === "number")
        return promoSortDir === "asc" ? av - bv : bv - av;
      if (typeof av === "boolean" && typeof bv === "boolean")
        return promoSortDir === "asc" ? (av === bv ? 0 : av ? 1 : -1) : av === bv ? 0 : av ? -1 : 1;
      return 0;
    });
    return items;
  }, [promotions, promoSearch, promoTypeFilter, promoStatusFilter, promoSortKey, promoSortDir]);

  const promoTotalPages = Math.max(1, Math.ceil(filteredPromotions.length / promoPageSize));
  const pagedPromotions = useMemo(
    () => filteredPromotions.slice((promoPage - 1) * promoPageSize, promoPage * promoPageSize),
    [filteredPromotions, promoPage, promoPageSize],
  );

  const togglePromoSort = useCallback((key: string) => {
    setPromoSortKey((prev) => {
      if (prev === key) { setPromoSortDir((d) => (d === "asc" ? "desc" : "asc")); return prev; }
      setPromoSortDir("asc");
      return key;
    });
    setPromoPage(1);
  }, []);

  // ── Inventory table state ──
  const [invSearch, setInvSearch] = useState("");
  const [invStockFilter, setInvStockFilter] = useState("");
  const [invSortKey, setInvSortKey] = useState<string>("quantityAvailable");
  const [invSortDir, setInvSortDir] = useState<"asc" | "desc">("asc");
  const [invPage, setInvPage] = useState(1);
  const [invPageSize, setInvPageSize] = useState(10);

  const filteredInventory = useMemo(() => {
    if (!inventory) return [];
    let items = [...inventory.lowStockItems];
    if (invSearch) {
      const q = invSearch.toLowerCase();
      items = items.filter(
        (i) =>
          i.productName.toLowerCase().includes(q) ||
          (i.variantName?.toLowerCase().includes(q) ?? false) ||
          i.sku.toLowerCase().includes(q) ||
          (i.brand?.toLowerCase().includes(q) ?? false),
      );
    }
    if (invStockFilter === "OutOfStock") items = items.filter((i) => i.quantityAvailable === 0);
    else if (invStockFilter === "Low") items = items.filter((i) => i.quantityAvailable > 0);
    items.sort((a, b) => {
      const av = (a as any)[invSortKey] ?? "";
      const bv = (b as any)[invSortKey] ?? "";
      if (typeof av === "string" && typeof bv === "string")
        return invSortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      if (typeof av === "number" && typeof bv === "number")
        return invSortDir === "asc" ? av - bv : bv - av;
      return 0;
    });
    return items;
  }, [inventory, invSearch, invStockFilter, invSortKey, invSortDir]);

  const invTotalPages = Math.max(1, Math.ceil(filteredInventory.length / invPageSize));
  const pagedInventory = useMemo(
    () => filteredInventory.slice((invPage - 1) * invPageSize, invPage * invPageSize),
    [filteredInventory, invPage, invPageSize],
  );

  const toggleInvSort = useCallback((key: string) => {
    setInvSortKey((prev) => {
      if (prev === key) { setInvSortDir((d) => (d === "asc" ? "desc" : "asc")); return prev; }
      setInvSortDir("asc");
      return key;
    });
    setInvPage(1);
  }, []);

  // ── Export Excel ──
  const exportPromotionsExcel = useCallback(() => {
    const data = filteredPromotions.map((p) => ({
      "Promo Code": p.promoCode, Name: p.promoName, Type: p.promotionType,
      "Discount Value": p.discountValue, Uses: p.usageCount,
      "Total Discount Applied": p.totalDiscountApplied,
      Status: p.isActive ? "Active" : "Inactive",
      "Valid From": format(new Date(p.validFrom), "yyyy-MM-dd"),
      "Valid To": format(new Date(p.validTo), "yyyy-MM-dd"),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Promotions");
    XLSX.writeFile(wb, `Promotions_${format(new Date(), "yyyyMMdd_HHmm")}.xlsx`);
  }, [filteredPromotions]);

  const exportInventoryExcel = useCallback(() => {
    const data = filteredInventory.map((i) => ({
      Product: i.productName, Variant: i.variantName || "", Brand: i.brand || "",
      SKU: i.sku, "On Hand": i.quantityOnHand, Reserved: i.quantityReserved,
      Available: i.quantityAvailable, "Pre-Order": i.quantityPreOrdered,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Low Stock Inventory");
    XLSX.writeFile(wb, `Inventory_LowStock_${format(new Date(), "yyyyMMdd_HHmm")}.xlsx`);
  }, [filteredInventory]);

  const exportAllExcel = useCallback(() => {
    const wb = XLSX.utils.book_new();
    if (revenue) {
      const revData = [
        { Metric: "Total Orders", Value: revenue.totalOrders },
        { Metric: "Completed Orders", Value: revenue.completedOrders },
        { Metric: "Cancelled Orders", Value: revenue.cancelledOrders },
        { Metric: "Total Revenue", Value: revenue.totalRevenue },
        { Metric: "Total Discount", Value: revenue.totalDiscount },
        { Metric: "Net Revenue", Value: revenue.netRevenue },
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(revData), "Revenue");
    }
    if (promotions) {
      const pd = promotions.items.map((p) => ({
        "Promo Code": p.promoCode, Name: p.promoName, Type: p.promotionType,
        "Discount Value": p.discountValue, Uses: p.usageCount,
        "Total Applied": p.totalDiscountApplied,
        Status: p.isActive ? "Active" : "Inactive",
        "Valid From": format(new Date(p.validFrom), "yyyy-MM-dd"),
        "Valid To": format(new Date(p.validTo), "yyyy-MM-dd"),
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pd), "Promotions");
    }
    if (inventory) {
      const id = inventory.lowStockItems.map((i) => ({
        Product: i.productName, Variant: i.variantName || "", Brand: i.brand || "",
        SKU: i.sku, "On Hand": i.quantityOnHand, Reserved: i.quantityReserved,
        Available: i.quantityAvailable, "Pre-Order": i.quantityPreOrdered,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(id), "Inventory");
    }
    if (afterSales) {
      const ad = [
        { Metric: "Total Tickets", Value: afterSales.totalTickets },
        { Metric: "Open Tickets", Value: afterSales.openTickets },
        { Metric: "Resolution Rate", Value: `${afterSales.resolutionRate}%` },
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ad), "After Sales");
    }
    XLSX.writeFile(wb, `Dashboard_Report_${format(new Date(), "yyyyMMdd_HHmm")}.xlsx`);
  }, [revenue, promotions, inventory, afterSales]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900" style={{ fontFamily: "inherit" }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[4px] mb-1">
              Management Overview
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Good to see you{currentUser?.displayName ? `, ${currentUser.displayName}` : ""}.
            </h1>
            <p className="mt-1 text-sm text-slate-500 max-w-lg">
              High-level KPIs for sales, operations and customer experience in one place.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={exportAllExcel} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200">
              <Download className="w-4 h-4" /> Export All
            </button>
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              {(["7d", "30d", "90d"] as DateRange[]).map((dr) => (
                <button
                  key={dr}
                  onClick={() => setDateRange(dr)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    dateRange === dr
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {dr === "7d" ? "7 Days" : dr === "30d" ? "30 Days" : "90 Days"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <KpiCard
            title="Total Orders"
            value={revenue ? formatNumber(revenue.totalOrders) : "…"}
            icon={ShoppingBag}
            gradient="from-blue-600 to-indigo-700"
            loading={isLoading}
          />
          <KpiCard
            title="Completed"
            value={revenue ? formatNumber(revenue.completedOrders) : "…"}
            icon={CheckCircle2}
            gradient="from-emerald-500 to-teal-600"
            loading={isLoading}
          />
          <KpiCard
            title="Cancelled"
            value={revenue ? formatNumber(revenue.cancelledOrders) : "…"}
            icon={XCircle}
            gradient="from-rose-500 to-pink-600"
            loading={isLoading}
          />
          <KpiCard
            title="Net Revenue"
            value={revenue ? formatCurrency(revenue.netRevenue) : "…"}
            icon={DollarSign}
            gradient="from-amber-500 to-orange-600"
            loading={isLoading}
          />
          <KpiCard
            title="Discounts"
            value={revenue ? formatCurrency(revenue.totalDiscount) : "…"}
            icon={Ticket}
            gradient="from-violet-500 to-purple-600"
            loading={isLoading}
          />
          <KpiCard
            title="Support"
            value={afterSales ? formatNumber(afterSales.totalTickets) : "…"}
            icon={LifeBuoy}
            gradient="from-slate-700 to-slate-900"
            loading={isLoading}
          />
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue chart — 2 cols */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Revenue Analytics</h3>
                <p className="text-sm text-slate-500">
                  {fromDate && toDate ? `${fromDate} — ${toDate}` : "Selected period"}
                </p>
              </div>
              {revenue && revenue.totalRevenue > 0 && (
                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  <span>{formatCurrency(revenue.totalRevenue)}</span>
                </div>
              )}
            </div>
            {isLoading ? (
              <div className="w-full h-[340px] bg-slate-50 animate-pulse rounded-2xl flex items-center justify-center">
                <span className="text-slate-400 font-medium">Loading analytics…</span>
              </div>
            ) : revenueChartData.length === 0 ? (
              <div className="w-full h-[340px] bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                No revenue data for this period
              </div>
            ) : (
              <div className="w-full h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip content={<RevenueTooltip />} />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Right column: After Sales + Promotions */}
          <div className="space-y-6">
            {/* After Sales */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-2">After Sales</h3>
              {afterSales && (
                <div className="flex items-center gap-3 mb-4 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
                    {afterSales.totalTickets} tickets
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold">
                    {afterSales.openTickets} open
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                    {afterSales.resolutionRate}% resolved
                  </span>
                </div>
              )}
              {isLoading ? (
                <div className="h-[200px] animate-pulse bg-slate-50 rounded-xl" />
              ) : afterSalesChartData.length === 0 ? (
                <div className="h-[200px] bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 text-sm">
                  No after-sales data
                </div>
              ) : (
                <div className="w-full h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={afterSalesChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={6} dataKey="value">
                        {afterSalesChartData.map((_e, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                      <Legend
                        verticalAlign="bottom"
                        height={30}
                        iconType="circle"
                        formatter={(v) => <span className="text-[11px] font-medium text-slate-600 uppercase tracking-wider">{v}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Promotions */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Top Promotions</h3>
              {isLoading ? (
                <div className="h-[200px] animate-pulse bg-slate-50 rounded-xl" />
              ) : promotionsChartData.length === 0 ? (
                <div className="h-[200px] bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 text-sm">
                  No promotion data
                </div>
              ) : (
                <div className="w-full h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={promotionsChartData} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="promoCode" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }} width={85} />
                      <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                      <Bar dataKey="usageCount" radius={[0, 4, 4, 0]} barSize={18}>
                        {promotionsChartData.map((_e, i) => (
                          <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Promotions Table ── */}
        {promotions && promotions.items.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Promotions Overview</h3>
              <button onClick={exportPromotionsExcel} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200">
                <Download className="w-4 h-4" /> Export Excel
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              {/* Toolbar */}
              <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search code or name…" value={promoSearch} onChange={(e) => { setPromoSearch(e.target.value); setPromoPage(1); }} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                </div>
                <select value={promoTypeFilter} onChange={(e) => { setPromoTypeFilter(e.target.value); setPromoPage(1); }} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">All Types</option>
                  <option value="Percentage">Percentage</option>
                  <option value="FixedAmount">Fixed Amount</option>
                  <option value="FreeShipping">Free Shipping</option>
                </select>
                <select value={promoStatusFilter} onChange={(e) => { setPromoStatusFilter(e.target.value); setPromoPage(1); }} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                      <SortHeader label="Promo Code" sortKey="promoCode" currentKey={promoSortKey} dir={promoSortDir} onSort={togglePromoSort} />
                      <SortHeader label="Name" sortKey="promoName" currentKey={promoSortKey} dir={promoSortDir} onSort={togglePromoSort} />
                      <SortHeader label="Type" sortKey="promotionType" currentKey={promoSortKey} dir={promoSortDir} onSort={togglePromoSort} align="center" />
                      <SortHeader label="Discount" sortKey="discountValue" currentKey={promoSortKey} dir={promoSortDir} onSort={togglePromoSort} align="center" />
                      <SortHeader label="Uses" sortKey="usageCount" currentKey={promoSortKey} dir={promoSortDir} onSort={togglePromoSort} align="center" />
                      <SortHeader label="Total Applied" sortKey="totalDiscountApplied" currentKey={promoSortKey} dir={promoSortDir} onSort={togglePromoSort} align="center" />
                      <SortHeader label="Status" sortKey="isActive" currentKey={promoSortKey} dir={promoSortDir} onSort={togglePromoSort} align="center" />
                      <th className="px-6 py-3 text-center">Valid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedPromotions.length === 0 ? (
                      <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-400">No promotions match your filters</td></tr>
                    ) : pagedPromotions.map((p: PromotionItem) => (
                      <tr key={p.promotionId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-3 font-mono text-xs font-bold text-indigo-600">{p.promoCode}</td>
                        <td className="px-6 py-3 font-medium text-slate-700">{p.promoName}</td>
                        <td className="px-6 py-3 text-center">
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">{p.promotionType}</span>
                        </td>
                        <td className="px-6 py-3 text-center font-medium">
                          {p.promotionType === "Percentage" ? `${p.discountValue}%` : p.promotionType === "FreeShipping" ? "Free Ship" : formatCurrency(p.discountValue)}
                        </td>
                        <td className="px-6 py-3 text-center font-bold text-slate-800">{p.usageCount}</td>
                        <td className="px-6 py-3 text-center font-medium text-slate-600">{formatCurrency(p.totalDiscountApplied)}</td>
                        <td className="px-6 py-3 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${p.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                            {p.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center text-xs text-slate-500">
                          {format(new Date(p.validFrom), "MMM dd")} — {format(new Date(p.validTo), "MMM dd")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <DashboardPagination page={promoPage} totalPages={promoTotalPages} pageSize={promoPageSize} totalItems={filteredPromotions.length} onPageChange={setPromoPage} onPageSizeChange={(s: number) => { setPromoPageSize(s); setPromoPage(1); }} />
            </div>
          </div>
        )}

        {/* ── Inventory Overview ── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900">Inventory Overview</h3>
            {inventory && inventory.lowStockItems.length > 0 && (
              <button onClick={exportInventoryExcel} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200">
                <Download className="w-4 h-4" /> Export Excel
              </button>
            )}
          </div>
          {isLoading ? (
            <div className="h-[400px] animate-pulse bg-slate-50 rounded-2xl" />
          ) : inventory ? (
            <div className="space-y-6">
              {/* Mini cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <InventoryMiniCard title="Total SKUs" value={inventory.totalSKUs} icon={Layers} color="blue" />
                <InventoryMiniCard title="On Hand" value={formatNumber(inventory.totalOnHand)} icon={Package} color="indigo" />
                <InventoryMiniCard title="Available" value={formatNumber(inventory.totalAvailable)} icon={CheckCircle2} color="emerald" />
                <InventoryMiniCard title="Low Stock" value={inventory.lowStockCount} icon={AlertTriangle} color="amber" />
                <InventoryMiniCard title="Out of Stock" value={inventory.outOfStockCount} icon={XCircle} color="rose" />
              </div>

              {/* Low-stock table */}
              {inventory.lowStockItems.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  {/* Toolbar */}
                  <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="Search product, variant, SKU, brand…" value={invSearch} onChange={(e) => { setInvSearch(e.target.value); setInvPage(1); }} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                    </div>
                    <select value={invStockFilter} onChange={(e) => { setInvStockFilter(e.target.value); setInvPage(1); }} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">All Items</option>
                      <option value="OutOfStock">Out of Stock</option>
                      <option value="Low">{"Low Stock (>0)"}</option>
                    </select>
                    <span className="text-xs text-slate-400 font-medium">{filteredInventory.length} items</span>
                  </div>
                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                          <SortHeader label="Product" sortKey="productName" currentKey={invSortKey} dir={invSortDir} onSort={toggleInvSort} />
                          <SortHeader label="Variant" sortKey="variantName" currentKey={invSortKey} dir={invSortDir} onSort={toggleInvSort} />
                          <SortHeader label="Brand" sortKey="brand" currentKey={invSortKey} dir={invSortDir} onSort={toggleInvSort} />
                          <SortHeader label="SKU" sortKey="sku" currentKey={invSortKey} dir={invSortDir} onSort={toggleInvSort} />
                          <SortHeader label="On Hand" sortKey="quantityOnHand" currentKey={invSortKey} dir={invSortDir} onSort={toggleInvSort} align="right" />
                          <SortHeader label="Reserved" sortKey="quantityReserved" currentKey={invSortKey} dir={invSortDir} onSort={toggleInvSort} align="right" />
                          <SortHeader label="Available" sortKey="quantityAvailable" currentKey={invSortKey} dir={invSortDir} onSort={toggleInvSort} align="right" />
                          <SortHeader label="Pre-Order" sortKey="quantityPreOrdered" currentKey={invSortKey} dir={invSortDir} onSort={toggleInvSort} align="right" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pagedInventory.length === 0 ? (
                          <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-400">No items match your filters</td></tr>
                        ) : pagedInventory.map((item: LowStockItem) => (
                          <tr key={item.variantId} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-3 font-medium text-slate-700 max-w-[180px] truncate">{item.productName}</td>
                            <td className="px-6 py-3 text-slate-500 text-xs">{item.variantName || "—"}</td>
                            <td className="px-6 py-3 text-slate-500">{item.brand || "—"}</td>
                            <td className="px-6 py-3 font-mono text-xs text-slate-400">{item.sku}</td>
                            <td className="px-6 py-3 text-right">
                              <span className={`px-2 py-0.5 rounded-md font-medium text-xs ${item.quantityOnHand === 0 ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>
                                {item.quantityOnHand}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-right text-slate-600">{item.quantityReserved}</td>
                            <td className="px-6 py-3 text-right">
                              <span className={`px-2 py-0.5 rounded-md font-medium text-xs ${item.quantityAvailable === 0 ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-700"}`}>
                                {item.quantityAvailable}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-right text-slate-600">{item.quantityPreOrdered}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  <DashboardPagination page={invPage} totalPages={invTotalPages} pageSize={invPageSize} totalItems={filteredInventory.length} onPageChange={setInvPage} onPageSizeChange={(s: number) => { setInvPageSize(s); setInvPage(1); }} />
                </div>
              )}
            </div>
          ) : (
            <div className="h-[200px] bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
              No inventory data
            </div>
          )}
        </div>

        {/* ── Top Products ── */}
        {topProducts && topProducts.items.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Top Products</h3>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-3">#</th>
                      <th className="px-6 py-3">Product Name</th>
                      <th className="px-6 py-3 text-right">Qty Sold</th>
                      <th className="px-6 py-3 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topProducts.items.map((p, i) => (
                      <tr key={p.productId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 font-bold text-slate-400">{i + 1}</td>
                        <td className="px-6 py-3 font-medium text-slate-700">{p.productName}</td>
                        <td className="px-6 py-3 text-right font-bold text-slate-800">{formatNumber(p.quantitySold)}</td>
                        <td className="px-6 py-3 text-right font-medium text-emerald-600">{formatCurrency(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ── */

const PIE_COLORS = ["#f43f5e", "#f59e0b", "#10b981", "#6366f1", "#8b5cf6"];
const BAR_COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e"];

function KpiCard({
  title,
  value,
  icon: Icon,
  gradient,
  loading,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  loading?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 shadow-sm border border-white/10 bg-gradient-to-br ${gradient} transition-transform hover:-translate-y-1`}
    >
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-medium text-white/70 uppercase tracking-wider">{title}</span>
          <div className="p-2 rounded-lg bg-white/10 backdrop-blur-md">
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>
        <h3 className={`text-2xl font-bold text-white ${loading ? "animate-pulse" : ""}`}>{value}</h3>
      </div>
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
    </div>
  );
}

function InventoryMiniCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "indigo" | "emerald" | "amber" | "rose";
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
      <div className={`p-3 rounded-lg ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-100 min-w-[160px]">
      <p className="text-sm font-bold text-slate-800 mb-2">{label}</p>
      <div className="space-y-1.5">
        <div className="flex justify-between items-center gap-4">
          <span className="text-xs text-slate-500">Revenue</span>
          <span className="text-sm font-semibold text-indigo-600">{formatCurrency(payload[0].value)}</span>
        </div>
        {payload[0].payload.orders != null && (
          <div className="flex justify-between items-center gap-4">
            <span className="text-xs text-slate-500">Orders</span>
            <span className="text-sm font-semibold text-slate-700">{payload[0].payload.orders}</span>
          </div>
        )}
        {payload[0].payload.discount != null && (
          <div className="flex justify-between items-center gap-4">
            <span className="text-xs text-slate-500">Discount</span>
            <span className="text-sm font-semibold text-rose-500">{formatCurrency(payload[0].payload.discount)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SortHeader({
  label,
  sortKey,
  currentKey,
  dir,
  onSort,
  align,
}: {
  label: string;
  sortKey: string;
  currentKey: string;
  dir: "asc" | "desc";
  onSort: (key: string) => void;
  align?: "center" | "right";
}) {
  const active = currentKey === sortKey;
  return (
    <th
      className={`px-6 py-3 cursor-pointer select-none hover:text-slate-700 transition-colors ${align === "center" ? "text-center" : align === "right" ? "text-right" : ""}`}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active ? (
          dir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-40" />
        )}
      </span>
    </th>
  );
}

function DashboardPagination({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
}) {
  return (
    <div className="px-6 py-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2 text-slate-500">
        <span>Rows:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs outline-none"
        >
          {[5, 10, 20, 50].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="text-slate-400">
          {totalItems === 0 ? "0" : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, totalItems)}`} of {totalItems}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1 rounded-lg text-sm font-medium border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
        >
          Prev
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let p: number;
          if (totalPages <= 5) p = i + 1;
          else if (page <= 3) p = i + 1;
          else if (page >= totalPages - 2) p = totalPages - 4 + i;
          else p = page - 2 + i;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-indigo-600 text-white" : "hover:bg-slate-50 text-slate-600"}`}
            >
              {p}
            </button>
          );
        })}
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1 rounded-lg text-sm font-medium border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}