# TÀI LIỆU KỸ THUẬT - MANAGER DASHBOARD

> **Dành cho:** Học sinh cấp 3 và người mới bắt đầu  
> **Mục đích:** Hiểu rõ cách hoạt động của trang quản lý tổng quan dành cho Manager

---

## 📋 MỤC LỤC

1. [Tổng quan Manager Dashboard](#1-tổng-quan-manager-dashboard)
2. [Kiến trúc hệ thống](#2-kiến-trúc-hệ-thống)
3. [Luồng hoạt động chi tiết](#3-luồng-hoạt-động-chi-tiết)
4. [Các tính năng chính](#4-các-tính-năng-chính)
5. [Biểu đồ và Visualization](#5-biểu-đồ-và-visualization)
6. [Export Excel](#6-export-excel)

---

## 1. TỔNG QUAN MANAGER DASHBOARD

### 🎯 Mục đích
Cung cấp cho Manager (Quản lý) một trang tổng quan toàn diện về tình hình kinh doanh, bao gồm:
- 💰 Doanh thu và đơn hàng
- 📦 Tồn kho và sản phẩm bán chạy
- 🎫 Khuyến mãi và mã giảm giá
- 🛠️ Dịch vụ hậu mãi (After-Sales)

### 🔧 Công nghệ sử dụng
- **React + TypeScript**: Framework frontend
- **React Query (@tanstack/react-query)**: Quản lý API calls và cache
- **Recharts**: Thư viện vẽ biểu đồ
- **XLSX (SheetJS)**: Export dữ liệu ra file Excel
- **date-fns**: Xử lý ngày tháng
- **Lucide React**: Icon library

---

## 2. KIẾN TRÚC HỆ THỐNG

### 📊 SƠ ĐỒ TỔNG QUAN

```
┌─────────────────────────────────────────────────────────────────┐
│              MANAGER DASHBOARD ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────────┘

    [Manager truy cập /manager/dashboard]
                    │
                    │ 1. Component mount
                    ▼
    ┌───────────────────────────────────┐
    │   ManagerDashboard.tsx            │
    │   - State management              │
    │   - UI rendering                  │
    │   - User interactions             │
    └───────────┬───────────────────────┘
                │
                │ 2. Fetch data
                ▼
    ┌───────────────────────────────────────────────────────┐
    │   useManagerDashboard Hook                            │
    │   ┌─────────────────────────────────────────────┐     │
    │   │ Parallel API Calls (React Query)            │     │
    │   │                                             │     │
    │   │  ┌─────────────────────────────────────┐   │     │
    │   │  │ 1. Revenue Query                    │   │     │
    │   │  │    GET /manager/reports/revenue     │   │     │
    │   │  │    - Total orders                   │   │     │
    │   │  │    - Total revenue                  │   │     │
    │   │  │    - Discount & net revenue         │   │     │
    │   │  └─────────────────────────────────────┘   │     │
    │   │                                             │     │
    │   │  ┌─────────────────────────────────────┐   │     │
    │   │  │ 2. Top Products Query               │   │     │
    │   │  │    GET /manager/reports/            │   │     │
    │   │  │        top-products                 │   │     │
    │   │  │    - Best selling products          │   │     │
    │   │  │    - Quantity sold                  │   │     │
    │   │  └─────────────────────────────────────┘   │     │
    │   │                                             │     │
    │   │  ┌─────────────────────────────────────┐   │     │
    │   │  │ 3. Inventory Query                  │   │     │
    │   │  │    GET /manager/reports/inventory   │   │     │
    │   │  │    - Low stock items                │   │     │
    │   │  │    - Out of stock items             │   │     │
    │   │  │    - Stock levels                   │   │     │
    │   │  └─────────────────────────────────────┘   │     │
    │   │                                             │     │
    │   │  ┌─────────────────────────────────────┐   │     │
    │   │  │ 4. After-Sales Query                │   │     │
    │   │  │    GET /manager/reports/            │   │     │
    │   │  │        after-sales                  │   │     │
    │   │  │    - Support tickets                │   │     │
    │   │  │    - Resolution rate                │   │     │
    │   │  └─────────────────────────────────────┘   │     │
    │   │                                             │     │
    │   │  ┌─────────────────────────────────────┐   │     │
    │   │  │ 5. Promotions Query                 │   │     │
    │   │  │    GET /manager/reports/promotions  │   │     │
    │   │  │    - Active promotions              │   │     │
    │   │  │    - Usage count                    │   │     │
    │   │  │    - Total discount applied         │   │     │
    │   │  └─────────────────────────────────────┘   │     │
    │   └─────────────────────────────────────────────┘     │
    └───────────────────────┬───────────────────────────────┘
                            │
                            │ 3. Data returned
                            ▼
    ┌───────────────────────────────────────────────────────┐
    │   Dashboard Data Structure                            │
    │   {                                                   │
    │     revenue: RevenueSummary,                          │
    │     topProducts: TopProductsResponse,                 │
    │     inventory: InventorySummary,                      │
    │     afterSales: AfterSalesSummary,                    │
    │     promotions: PromotionsResponse,                   │
    │     isLoading: boolean                                │
    │   }                                                   │
    └───────────────────────┬───────────────────────────────┘
                            │
                            │ 4. Render UI
                            ▼
    ┌───────────────────────────────────────────────────────┐
    │   Dashboard UI Components                             │
    │   ┌─────────────────────────────────────────────┐     │
    │   │ • KPI Cards (4 cards)                       │     │
    │   │   - Total Orders                            │     │
    │   │   - Completed Orders                        │     │
    │   │   - Total Revenue                           │     │
    │   │   - Net Revenue                             │     │
    │   └─────────────────────────────────────────────┘     │
    │   ┌─────────────────────────────────────────────┐     │
    │   │ • Revenue Chart (Line Chart)                │     │
    │   │   - Monthly revenue for selected year       │     │
    │   │   - 12 months data                          │     │
    │   └─────────────────────────────────────────────┘     │
    │   ┌─────────────────────────────────────────────┐     │
    │   │ • After-Sales Chart (Pie Chart)             │     │
    │   │   - Tickets by type                         │     │
    │   └─────────────────────────────────────────────┘     │
    │   ┌─────────────────────────────────────────────┐     │
    │   │ • Promotions Chart (Bar Chart)              │     │
    │   │   - Top 6 promotions by usage               │     │
    │   └─────────────────────────────────────────────┘     │
    │   ┌─────────────────────────────────────────────┐     │
    │   │ • Promotions Table                          │     │
    │   │   - Search, filter, sort                    │     │
    │   │   - Pagination                              │     │
    │   └─────────────────────────────────────────────┘     │
    │   ┌─────────────────────────────────────────────┐     │
    │   │ • Inventory Table                           │     │
    │   │   - Low stock items                         │     │
    │   │   - Search, filter, sort                    │     │
    │   │   - Pagination                              │     │
    │   └─────────────────────────────────────────────┘     │
    └───────────────────────────────────────────────────────┘
```

---

## 3. LUỒNG HOẠT ĐỘNG CHI TIẾT

### 📈 LUỒNG FETCH DỮ LIỆU

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA FETCHING WORKFLOW                       │
└─────────────────────────────────────────────────────────────────┘

    [Component Mount]
         │
         │ 1. Initialize state
         ▼
    ┌─────────────────────────────────────┐
    │ useState & useMemo                  │
    │ - selectedYear: 2024                │
    │ - fromDate: "2024-01-01"            │
    │ - toDate: "2024-12-31"              │
    └──────────┬──────────────────────────┘
               │
               │ 2. Call hook
               ▼
    ┌─────────────────────────────────────────────────────┐
    │ useManagerDashboard(fromDate, toDate)               │
    │                                                     │
    │ React Query sẽ:                                     │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ A. Check cache                              │     │
    │ │    - Nếu có data trong cache → return ngay  │     │
    │ │    - Nếu không → fetch từ API               │     │
    │ └─────────────────────────────────────────────┘     │
    │                                                     │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ B. Parallel fetching (5 requests cùng lúc)  │     │
    │ │                                             │     │
    │ │    Request 1: Revenue                       │     │
    │ │    ├─ Query Key: ["manager-dashboard-      │     │
    │ │    │             revenue", from, to]        │     │
    │ │    └─ Endpoint: /manager/reports/revenue    │     │
    │ │                                             │     │
    │ │    Request 2: Top Products                  │     │
    │ │    ├─ Query Key: ["manager-dashboard-      │     │
    │ │    │             top-products", from, to]   │     │
    │ │    └─ Endpoint: /manager/reports/           │     │
    │ │                 top-products                │     │
    │ │                                             │     │
    │ │    Request 3: Inventory                     │     │
    │ │    ├─ Query Key: ["manager-dashboard-      │     │
    │ │    │             inventory"]                │     │
    │ │    └─ Endpoint: /manager/reports/inventory  │     │
    │ │                                             │     │
    │ │    Request 4: After-Sales                   │     │
    │ │    ├─ Query Key: ["manager-dashboard-      │     │
    │ │    │             after-sales"]              │     │
    │ │    └─ Endpoint: /manager/reports/           │     │
    │ │                 after-sales                 │     │
    │ │                                             │     │
    │ │    Request 5: Promotions                    │     │
    │ │    ├─ Query Key: ["manager-dashboard-      │     │
    │ │    │             promotions"]               │     │
    │ │    └─ Endpoint: /manager/reports/promotions │     │
    │ └─────────────────────────────────────────────┘     │
    │                                                     │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ C. Combine results                          │     │
    │ │    return {                                 │     │
    │ │      revenue,                               │     │
    │ │      topProducts,                           │     │
    │ │      inventory,                             │     │
    │ │      afterSales,                            │     │
    │ │      promotions,                            │     │
    │ │      isLoading                              │     │
    │ │    }                                        │     │
    │ └─────────────────────────────────────────────┘     │
    └─────────────────────────────────────────────────────┘
               │
               │ 3. Additional fetch for monthly data
               ▼
    ┌─────────────────────────────────────────────────────┐
    │ useEffect - Fetch Monthly Revenue                   │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ Loop through 12 months                      │     │
    │ │ for (month = 0; month < 12; month++) {      │     │
    │ │                                             │     │
    │ │   Month 0 (Jan): 2024-01-01 to 2024-01-31  │     │
    │ │   Month 1 (Feb): 2024-02-01 to 2024-02-29  │     │
    │ │   Month 2 (Mar): 2024-03-01 to 2024-03-31  │     │
    │ │   ...                                       │     │
    │ │   Month 11 (Dec): 2024-12-01 to 2024-12-31 │     │
    │ │                                             │     │
    │ │   Fetch:                                    │     │
    │ │   GET /manager/reports/revenue?             │     │
    │ │       fromDate=YYYY-MM-DD&                  │     │
    │ │       toDate=YYYY-MM-DD                     │     │
    │ │ }                                           │     │
    │ └─────────────────────────────────────────────┘     │
    │                                                     │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ Promise.all() - Chờ tất cả 12 requests     │     │
    │ │ hoàn thành                                  │     │
    │ └─────────────────────────────────────────────┘     │
    │                                                     │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ Transform data                              │     │
    │ │ [                                           │     │
    │ │   { month: "Jan", revenue: 15000, ... },    │     │
    │ │   { month: "Feb", revenue: 18000, ... },    │     │
    │ │   { month: "Mar", revenue: 22000, ... },    │     │
    │ │   ...                                       │     │
    │ │ ]                                           │     │
    │ └─────────────────────────────────────────────┘     │
    │                                                     │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ setMonthlyRevenueData(results)              │     │
    │ │ setIsLoadingMonthly(false)                  │     │
    │ └─────────────────────────────────────────────┘     │
    └─────────────────────────────────────────────────────┘
               │
               │ 4. Render charts & tables
               ▼
    ┌─────────────────────────────────────┐
    │ UI Updates                          │
    │ - KPI cards show numbers            │
    │ - Line chart shows 12 months        │
    │ - Pie chart shows ticket types      │
    │ - Bar chart shows top promotions    │
    │ - Tables show detailed data         │
    └─────────────────────────────────────┘
```

---

## 4. CÁC TÍNH NĂNG CHÍNH

### 💳 KPI CARDS - Thẻ Chỉ Số Quan Trọng

```
┌─────────────────────────────────────────────────────────────────┐
│                         KPI CARDS                               │
└─────────────────────────────────────────────────────────────────┘

    ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
    │ 🛍️ Total Orders│  │ ✅ Completed   │  │ 💰 Total       │  │ 💵 Net         │
    │                │  │    Orders      │  │    Revenue     │  │    Revenue     │
    │   1,234        │  │   1,100        │  │   $125,000     │  │   $118,500     │
    │                │  │                │  │                │  │                │
    │   ↑ 12.5%      │  │   ↑ 15.2%      │  │   ↑ 18.7%      │  │   ↑ 19.1%      │
    └────────────────┘  └────────────────┘  └────────────────┘  └────────────────┘

Cách tính:
- Total Orders: Tổng số đơn hàng trong khoảng thời gian
- Completed Orders: Số đơn hoàn thành (status = Completed)
- Total Revenue: Tổng doanh thu (chưa trừ giảm giá)
- Net Revenue: Doanh thu thuần (đã trừ giảm giá)
  Formula: Net Revenue = Total Revenue - Total Discount
```

### 📊 REVENUE CHART - Biểu Đồ Doanh Thu

```
┌─────────────────────────────────────────────────────────────────┐
│                    MONTHLY REVENUE CHART                        │
└─────────────────────────────────────────────────────────────────┘

    Revenue ($)
    30k ┤                                              ●
        │                                          ●
    25k ┤                                      ●
        │                                  ●
    20k ┤                              ●
        │                          ●
    15k ┤                      ●
        │                  ●
    10k ┤              ●
        │          ●
     5k ┤      ●
        │  ●
     0k └──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──
          Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec

Đặc điểm:
- Line Chart (biểu đồ đường)
- 12 điểm dữ liệu (1 điểm/tháng)
- Gradient color (indigo → purple)
- Smooth curve (type="monotone")
- Interactive tooltip khi hover
- Animation khi load

Dữ liệu:
{
  month: "Jan",      // Tháng
  revenue: 15000,    // Doanh thu
  orders: 120,       // Số đơn hàng
  discount: 1500     // Giảm giá
}
```

### 🥧 AFTER-SALES CHART - Biểu Đồ Hậu Mãi

```
┌─────────────────────────────────────────────────────────────────┐
│                    AFTER-SALES PIE CHART                        │
└─────────────────────────────────────────────────────────────────┘

                    ╭─────────╮
                ╭───┤         ├───╮
            ╭───┤   │ Refund  │   ├───╮
        ╭───┤   │   │  45%    │   │   ├───╮
        │   │   ╰───┴─────────┴───╯   │   │
        │   │      Warranty 30%       │   │
        │   ╰─────────────────────────╯   │
        │        Exchange 25%             │
        ╰─────────────────────────────────╯

Loại tickets:
- Refund (Hoàn tiền): Khách hàng yêu cầu trả hàng và hoàn tiền
- Warranty (Bảo hành): Sửa chữa hoặc thay thế theo bảo hành
- Exchange (Đổi hàng): Đổi sang sản phẩm khác

Metrics:
- Total Tickets: Tổng số ticket
- Open Tickets: Số ticket đang xử lý
- Resolution Rate: Tỷ lệ giải quyết (%)
  Formula: (Resolved / Total) × 100
```

### 📊 PROMOTIONS CHART - Biểu Đồ Khuyến Mãi

```
┌─────────────────────────────────────────────────────────────────┐
│                   TOP PROMOTIONS BAR CHART                      │
└─────────────────────────────────────────────────────────────────┘

    SUMMER2024  ████████████████████████████████ 450
    NEWUSER20   ████████████████████████ 320
    FLASH50     ██████████████████ 280
    WELCOME10   ████████████ 180
    FREESHIP    ██████████ 150
    VIP30       ████████ 120
                └────┴────┴────┴────┴────┴────┴
                0   100  200  300  400  500
                        Usage Count

Đặc điểm:
- Horizontal Bar Chart (thanh ngang)
- Top 6 promotions theo usage count
- Mỗi thanh có màu khác nhau
- Hiển thị promo code và số lần sử dụng
```

---

## 5. BIỂU ĐỒ VÀ VISUALIZATION

### 🎨 RECHARTS IMPLEMENTATION

#### Line Chart (Revenue)
```typescript
<LineChart data={monthlyRevenueData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="month" />
  <YAxis tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
  <Tooltip content={<RevenueTooltip />} />
  <Line 
    type="monotone"
    dataKey="revenue"
    stroke="#6366f1"
    strokeWidth={3}
    dot={{ fill: "#6366f1", r: 6 }}
  />
</LineChart>
```

**Giải thích:**
- `CartesianGrid`: Lưới nền (đường kẻ ô)
- `XAxis`: Trục X (tháng)
- `YAxis`: Trục Y (doanh thu)
- `tickFormatter`: Format số hiển thị (15000 → $15k)
- `type="monotone"`: Đường cong mượt
- `dot`: Điểm dữ liệu trên đường

#### Pie Chart (After-Sales)
```typescript
<PieChart>
  <Pie 
    data={afterSalesChartData}
    cx="50%"
    cy="50%"
    innerRadius={50}
    outerRadius={70}
    paddingAngle={6}
    dataKey="value"
  >
    {afterSalesChartData.map((_, i) => (
      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
    ))}
  </Pie>
  <Tooltip />
  <Legend />
</PieChart>
```

**Giải thích:**
- `innerRadius`: Bán kính trong (tạo hình donut)
- `outerRadius`: Bán kính ngoài
- `paddingAngle`: Khoảng cách giữa các phần (độ)
- `Cell`: Mỗi phần có màu riêng

#### Bar Chart (Promotions)
```typescript
<BarChart data={promotionsChartData} layout="vertical">
  <CartesianGrid strokeDasharray="3 3" horizontal />
  <XAxis type="number" hide />
  <YAxis dataKey="promoCode" type="category" width={85} />
  <Tooltip />
  <Bar dataKey="usageCount" radius={[0, 4, 4, 0]} barSize={18}>
    {promotionsChartData.map((_, i) => (
      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
    ))}
  </Bar>
</BarChart>
```

**Giải thích:**
- `layout="vertical"`: Thanh ngang (nằm ngang)
- `radius={[0, 4, 4, 0]}`: Bo góc bên phải
- `barSize={18}`: Độ dày thanh (px)

---

## 6. EXPORT EXCEL

### 📥 LUỒNG EXPORT DỮ LIỆU

```
┌─────────────────────────────────────────────────────────────────┐
│                      EXCEL EXPORT WORKFLOW                      │
└─────────────────────────────────────────────────────────────────┘

    [User clicks "Export Excel"]
         │
         │ 1. Choose export type
         ▼
    ┌─────────────────────────────────────┐
    │ Export Options                      │
    │ • Export Promotions Only            │
    │ • Export Inventory Only             │
    │ • Export All Data                   │
    └──────────┬──────────────────────────┘
               │
               │ 2. Prepare data
               ▼
    ┌─────────────────────────────────────────────────────┐
    │ Data Transformation                                 │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ A. Filter current data                      │     │
    │ │    - Apply search filters                   │     │
    │ │    - Apply status filters                   │     │
    │ │    - Apply sorting                          │     │
    │ └─────────────────────────────────────────────┘     │
    │                                                     │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ B. Transform to Excel format                │     │
    │ │    const data = items.map(item => ({        │     │
    │ │      "Column 1": item.field1,               │     │
    │ │      "Column 2": item.field2,               │     │
    │ │      ...                                    │     │
    │ │    }))                                      │     │
    │ └─────────────────────────────────────────────┘     │
    └─────────────────────────────────────────────────────┘
               │
               │ 3. Create Excel file
               ▼
    ┌─────────────────────────────────────────────────────┐
    │ XLSX Library Processing                             │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ Step 1: Create worksheet                    │     │
    │ │ const ws = XLSX.utils.json_to_sheet(data)   │     │
    │ │                                             │     │
    │ │ Converts:                                   │     │
    │ │ [                                           │     │
    │ │   { "Name": "A", "Value": 100 },            │     │
    │ │   { "Name": "B", "Value": 200 }             │     │
    │ │ ]                                           │     │
    │ │                                             │     │
    │ │ To Excel format:                            │     │
    │ │ ┌──────┬───────┐                            │     │
    │ │ │ Name │ Value │                            │     │
    │ │ ├──────┼───────┤                            │     │
    │ │ │  A   │  100  │                            │     │
    │ │ │  B   │  200  │                            │     │
    │ │ └──────┴───────┘                            │     │
    │ └─────────────────────────────────────────────┘     │
    │                                                     │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ Step 2: Create workbook                     │     │
    │ │ const wb = XLSX.utils.book_new()            │     │
    │ │                                             │     │
    │ │ Workbook = File Excel                       │     │
    │ │ Có thể chứa nhiều sheets                    │     │
    │ └─────────────────────────────────────────────┘     │
    │                                                     │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ Step 3: Add sheets to workbook              │     │
    │ │ XLSX.utils.book_append_sheet(               │     │
    │ │   wb,                                       │     │
    │ │   ws,                                       │     │
    │ │   "Sheet Name"                              │     │
    │ │ )                                           │     │
    │ │                                             │     │
    │ │ For "Export All":                           │     │
    │ │ - Sheet 1: Revenue                          │     │
    │ │ - Sheet 2: Promotions                       │     │
    │ │ - Sheet 3: Inventory                        │     │
    │ │ - Sheet 4: After Sales                      │     │
    │ └─────────────────────────────────────────────┘     │
    │                                                     │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ Step 4: Generate filename                   │     │
    │ │ const filename =                            │     │
    │ │   `Dashboard_Report_${timestamp}.xlsx`      │     │
    │ │                                             │     │
    │ │ Example:                                    │     │
    │ │ Dashboard_Report_20240315_1430.xlsx         │     │
    │ └─────────────────────────────────────────────┘     │
    │                                                     │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ Step 5: Write file                          │     │
    │ │ XLSX.writeFile(wb, filename)                │     │
    │ │                                             │     │
    │ │ Browser sẽ tự động download file            │     │
    │ └─────────────────────────────────────────────┘     │
    └─────────────────────────────────────────────────────┘
               │
               │ 4. Download starts
               ▼
    ┌─────────────────────────────────────┐
    │ File Downloaded                     │
    │ 📥 Dashboard_Report_20240315.xlsx   │
    │ Size: ~50 KB                        │
    └─────────────────────────────────────┘
```

### 💡 Export Code Example

```typescript
// Export Promotions
const exportPromotionsExcel = () => {
  // 1. Transform data
  const data = filteredPromotions.map((p) => ({
    "Promo Code": p.promoCode,
    "Name": p.promoName,
    "Type": p.promotionType,
    "Discount Value": p.discountValue,
    "Uses": p.usageCount,
    "Total Discount Applied": p.totalDiscountApplied,
    "Status": p.isActive ? "Active" : "Inactive",
    "Valid From": format(new Date(p.validFrom), "yyyy-MM-dd"),
    "Valid To": format(new Date(p.validTo), "yyyy-MM-dd"),
  }));

  // 2. Create worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // 3. Create workbook
  const wb = XLSX.utils.book_new();

  // 4. Add sheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Promotions");

  // 5. Generate filename with timestamp
  const filename = `Promotions_${format(new Date(), "yyyyMMdd_HHmm")}.xlsx`;

  // 6. Write file (triggers download)
  XLSX.writeFile(wb, filename);
};
```

---

## 7. TABLES - BẢNG DỮ LIỆU

### 📋 PROMOTIONS TABLE

```
┌─────────────────────────────────────────────────────────────────┐
│                      PROMOTIONS TABLE                           │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────────────────────────────────┐
    │ Search: [____________]  Type: [All Types ▼]  Status: [▼] │
    └──────────────────────────────────────────────────────────┘

    ┌────────────┬──────────┬──────┬──────────┬──────┬─────────┬────────┬──────────┐
    │ Promo Code │   Name   │ Type │ Discount │ Uses │  Total  │ Status │  Valid   │
    │     ↕      │    ↕     │  ↕   │    ↕     │  ↕   │    ↕    │   ↕    │          │
    ├────────────┼──────────┼──────┼──────────┼──────┼─────────┼────────┼──────────┤
    │ SUMMER2024 │ Summer   │  %   │   20%    │ 450  │ $9,000  │ Active │ Jun-Aug  │
    │ NEWUSER20  │ New User │  %   │   20%    │ 320  │ $6,400  │ Active │ Jan-Dec  │
    │ FLASH50    │ Flash    │  $   │   $50    │ 280  │ $14,000 │ Active │ Mar-Apr  │
    └────────────┴──────────┴──────┴──────────┴──────┴─────────┴────────┴──────────┘

    ┌──────────────────────────────────────────────────────────┐
    │ Showing 1-10 of 45  [< 1 2 3 4 5 >]  Items/page: [10 ▼] │
    └──────────────────────────────────────────────────────────┘

Features:
✅ Search: Tìm theo code hoặc name
✅ Filter: Lọc theo type và status
✅ Sort: Sắp xếp theo bất kỳ cột nào (click header)
✅ Pagination: Phân trang 10/20/50 items
✅ Export: Xuất Excel với filters hiện tại
```

### 📦 INVENTORY TABLE

```
┌─────────────────────────────────────────────────────────────────┐
│                      INVENTORY TABLE                            │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────────────────────────────────┐
    │ Search: [____________]  Stock: [All ▼]                    │
    └──────────────────────────────────────────────────────────┘

    ┌──────────────┬─────────┬───────┬─────┬────────┬──────────┬───────────┬──────────┐
    │   Product    │ Variant │ Brand │ SKU │ On Hand│ Reserved │ Available │ Pre-Order│
    │      ↕       │    ↕    │   ↕   │  ↕  │   ↕    │    ↕     │     ↕     │    ↕     │
    ├──────────────┼─────────┼───────┼─────┼────────┼──────────┼───────────┼──────────┤
    │ Ray-Ban      │ Black   │ Ray-  │ RB  │   5    │    2     │     3     │    0     │
    │ Aviator      │         │ Ban   │ 001 │        │          │           │          │
    │ Oakley       │ Blue    │ Oakley│ OK  │   2    │    1     │     1     │    5     │
    │ Frogskins    │         │       │ 002 │        │          │           │          │
    │ Gucci        │ Gold    │ Gucci │ GG  │   0    │    0     │     0     │   10     │
    │ Sunglasses   │         │       │ 003 │        │          │           │          │
    └──────────────┴─────────┴───────┴─────┴────────┴──────────┴───────────┴──────────┘

    ┌──────────────────────────────────────────────────────────┐
    │ Showing 1-10 of 28  [< 1 2 3 >]  Items/page: [10 ▼]      │
    └──────────────────────────────────────────────────────────┘

Stock Status:
🔴 Available = 0: Out of Stock (Hết hàng)
🟡 Available < 5: Low Stock (Sắp hết)
🟢 Available ≥ 5: In Stock (Còn hàng)

Quantity Explained:
- On Hand: Số lượng thực tế trong kho
- Reserved: Đã được đặt nhưng chưa xuất kho
- Available: Có thể bán = On Hand - Reserved
- Pre-Order: Đơn đặt trước (hàng chưa về)
```

---

## 8. REACT QUERY CACHING

### 🔄 CACHE STRATEGY

```
┌─────────────────────────────────────────────────────────────────┐
│                    REACT QUERY CACHING                          │
└─────────────────────────────────────────────────────────────────┘

    [First Load]
         │
         │ 1. No cache
         ▼
    ┌─────────────────────────────────┐
    │ Fetch from API                  │
    │ - Show loading state            │
    │ - Wait for response             │
    └──────────┬──────────────────────┘
               │
               │ 2. Save to cache
               ▼
    ┌─────────────────────────────────────────────┐
    │ React Query Cache                           │
    │ ┌─────────────────────────────────────┐     │
    │ │ Key: ["manager-dashboard-revenue",  │     │
    │ │       "2024-01-01", "2024-12-31"]   │     │
    │ │ Data: { totalRevenue: 125000, ... } │     │
    │ │ Timestamp: 2024-03-15 14:30:00      │     │
    │ │ Status: fresh                       │     │
    │ └─────────────────────────────────────┘     │
    └─────────────────────────────────────────────┘
               │
               │ 3. User navigates away and back
               ▼
    ┌─────────────────────────────────┐
    │ Check cache                     │
    │ - Cache exists? ✓               │
    │ - Still fresh? ✓                │
    │ → Return cached data instantly  │
    │ → No API call needed!           │
    └─────────────────────────────────┘

Benefits:
✅ Faster: Instant data display
✅ Less API calls: Save bandwidth
✅ Better UX: No loading flicker
✅ Automatic refetch: When data is stale

Cache Invalidation:
- Manual: queryClient.invalidateQueries()
- Automatic: After mutations (create/update/delete)
- Time-based: staleTime, cacheTime
```

---

## 9. RESPONSIVE DESIGN

### 📱 MOBILE OPTIMIZATION

```
┌─────────────────────────────────────────────────────────────────┐
│                    RESPONSIVE BREAKPOINTS                       │
└─────────────────────────────────────────────────────────────────┘

    Desktop (≥1024px)
    ┌────────────────────────────────────────────────┐
    │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │
    │ │ KPI  │ │ KPI  │ │ KPI  │ │ KPI  │  4 cards │
    │ └──────┘ └──────┘ └──────┘ └──────┘           │
    │ ┌────────────────────┐ ┌──────────┐           │
    │ │                    │ │ After-   │           │
    │ │  Revenue Chart     │ │ Sales    │  2 cols  │
    │ │                    │ │          │           │
    │ │                    │ ├──────────┤           │
    │ │                    │ │ Promo    │           │
    │ └────────────────────┘ └──────────┘           │
    └────────────────────────────────────────────────┘

    Tablet (768px - 1023px)
    ┌────────────────────────────────┐
    │ ┌──────┐ ┌──────┐              │
    │ │ KPI  │ │ KPI  │  2 cards     │
    │ └──────┘ └──────┘              │
    │ ┌──────┐ ┌──────┐              │
    │ │ KPI  │ │ KPI  │              │
    │ └──────┘ └──────┘              │
    │ ┌──────────────────────┐       │
    │ │  Revenue Chart       │ 1 col │
    │ └──────────────────────┘       │
    │ ┌──────────────────────┐       │
    │ │  After-Sales         │       │
    │ └──────────────────────┘       │
    └────────────────────────────────┘

    Mobile (<768px)
    ┌──────────────────┐
    │ ┌──────────────┐ │
    │ │ KPI          │ │ 1 card
    │ └──────────────┘ │
    │ ┌──────────────┐ │
    │ │ KPI          │ │
    │ └──────────────┘ │
    │ ┌──────────────┐ │
    │ │ Revenue      │ │ Stack
    │ │ Chart        │ │ vertically
    │ └──────────────┘ │
    │ ┌──────────────┐ │
    │ │ Table        │ │ Scroll
    │ │ →→→→→→→→→→→→ │ │ horizontal
    │ └──────────────┘ │
    └──────────────────┘

Tailwind Classes:
- sm: ≥640px
- md: ≥768px
- lg: ≥1024px
- xl: ≥1280px
- 2xl: ≥1536px

Example:
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          └─ Mobile: 1 col
                      └─ Tablet: 2 cols
                                  └─ Desktop: 4 cols
```

---

## 10. PERFORMANCE OPTIMIZATION

### ⚡ OPTIMIZATION TECHNIQUES

```
┌─────────────────────────────────────────────────────────────────┐
│                  PERFORMANCE OPTIMIZATIONS                      │
└─────────────────────────────────────────────────────────────────┘

1. React Query Caching
   ✅ Cache API responses
   ✅ Avoid duplicate requests
   ✅ Background refetch

2. useMemo
   ✅ Memoize expensive calculations
   ✅ Prevent unnecessary re-renders
   
   Example:
   const filteredData = useMemo(() => {
     return data.filter(item => item.active)
   }, [data])  // Only recalculate when data changes

3. useCallback
   ✅ Memoize functions
   ✅ Prevent child re-renders
   
   Example:
   const handleSort = useCallback((key) => {
     setSortKey(key)
   }, [])  // Function never changes

4. Pagination
   ✅ Load only 10-50 items at a time
   ✅ Reduce DOM nodes
   ✅ Faster rendering

5. Lazy Loading
   ✅ Load charts only when visible
   ✅ Code splitting
   ✅ Reduce initial bundle size

6. Debouncing
   ✅ Search input debounce (300ms)
   ✅ Reduce API calls while typing

7. Parallel Fetching
   ✅ 5 API calls at once (not sequential)
   ✅ Faster total load time

8. Abort Controller
   ✅ Cancel pending requests on unmount
   ✅ Prevent memory leaks
   
   Example:
   useEffect(() => {
     const controller = new AbortController()
     fetch(url, { signal: controller.signal })
     return () => controller.abort()
   }, [])
```

---

## 11. ERROR HANDLING

### 🚨 ERROR SCENARIOS

```
┌─────────────────────────────────────────────────────────────────┐
│                      ERROR HANDLING                             │
└─────────────────────────────────────────────────────────────────┘

Scenario 1: API Error
    [API returns 500]
         │
         ▼
    ┌─────────────────────────────────┐
    │ React Query catches error       │
    │ - Set isError = true            │
    │ - Store error object            │
    └──────────┬──────────────────────┘
               │
               ▼
    ┌─────────────────────────────────┐
    │ Display error message           │
    │ "Failed to load data"           │
    │ [Retry Button]                  │
    └─────────────────────────────────┘

Scenario 2: Network Timeout
    [Request takes > 30s]
         │
         ▼
    ┌─────────────────────────────────┐
    │ Abort controller cancels        │
    │ Show timeout message            │
    │ "Request timed out"             │
    └─────────────────────────────────┘

Scenario 3: No Data
    [API returns empty array]
         │
         ▼
    ┌─────────────────────────────────┐
    │ Check data.length === 0         │
    │ Show empty state                │
    │ "No data available"             │
    │ [Icon illustration]             │
    └─────────────────────────────────┘

Scenario 4: Unauthorized
    [API returns 401]
         │
         ▼
    ┌─────────────────────────────────┐
    │ Redirect to login               │
    │ Clear auth tokens               │
    └─────────────────────────────────┘
```

---

## 12. TÓM TẮT CHO HỌC SINH CẤP 3

### 🎓 HIỂU ĐƠN GIẢN

**Manager Dashboard là gì?**
- Giống như "bảng điều khiển" của cửa hàng
- Hiển thị tất cả thông tin quan trọng ở một chỗ
- Giúp Manager theo dõi kinh doanh dễ dàng

**Hoạt động như thế nào?**
1. **Fetch Data**: Lấy dữ liệu từ 5 API cùng lúc
2. **Process**: Xử lý và tính toán (tổng, trung bình, %)
3. **Visualize**: Hiển thị bằng biểu đồ đẹp mắt
4. **Interact**: Người dùng có thể search, filter, sort
5. **Export**: Xuất ra Excel để báo cáo

**Công nghệ chính:**
- **React Query**: Quản lý API calls (như người trung gian)
- **Recharts**: Vẽ biểu đồ (Line, Pie, Bar)
- **XLSX**: Tạo file Excel
- **Tailwind CSS**: Styling đẹp và responsive

**Tại sao quan trọng?**
- ⏱️ **Tiết kiệm thời gian**: Không cần mở nhiều trang
- 📊 **Trực quan**: Biểu đồ dễ hiểu hơn số
- 📈 **Ra quyết định**: Dựa trên data thực tế
- 📥 **Báo cáo**: Export Excel cho sếp

---

## 13. GLOSSARY - TỪ ĐIỂN THUẬT NGỮ

| Thuật ngữ | Giải thích |
|-----------|------------|
| **KPI** | Key Performance Indicator - Chỉ số hiệu suất quan trọng |
| **Revenue** | Doanh thu - Tổng tiền bán được |
| **Net Revenue** | Doanh thu thuần - Đã trừ giảm giá |
| **Discount** | Giảm giá - Số tiền giảm cho khách |
| **Query** | Truy vấn - Yêu cầu lấy dữ liệu |
| **Cache** | Bộ nhớ đệm - Lưu data tạm để load nhanh |
| **Pagination** | Phân trang - Chia data thành nhiều trang |
| **Filter** | Lọc - Chỉ hiển thị data thỏa điều kiện |
| **Sort** | Sắp xếp - Xếp theo thứ tự (A-Z, 1-9) |
| **Export** | Xuất - Lưu data ra file |
| **Tooltip** | Chú thích - Hiện khi hover chuột |
| **Responsive** | Tự động điều chỉnh theo màn hình |
| **API** | Application Programming Interface - Cổng kết nối backend |

---

## 14. FAQ - CÂU HỎI THƯỜNG GẶP

**Q1: Tại sao phải fetch 12 lần cho monthly data?**
- Backend chỉ trả về tổng cho 1 khoảng thời gian
- Để có 12 tháng, phải gọi 12 lần (1 lần/tháng)
- Dùng `Promise.all()` để gọi song song, nhanh hơn tuần tự

**Q2: React Query cache bao lâu?**
- Mặc định: 5 phút (staleTime)
- Sau 5 phút, data được coi là "cũ" và refetch
- Có thể config tùy ý

**Q3: Tại sao dùng useMemo?**
- Tránh tính toán lại khi component re-render
- Ví dụ: Filter 1000 items mỗi lần render = chậm
- useMemo: Chỉ tính lại khi data thay đổi

**Q4: Export Excel có giới hạn số dòng không?**
- XLSX library hỗ trợ hàng triệu dòng
- Nhưng browser có thể lag nếu quá nhiều
- Nên giới hạn ~10,000 dòng cho an toàn

**Q5: Responsive hoạt động thế nào?**
- Tailwind CSS breakpoints
- `sm:`, `md:`, `lg:` prefix
- Browser tự động apply CSS phù hợp với màn hình

---

## 15. BEST PRACTICES

### ✅ DO (NÊN LÀM)

1. **Sử dụng React Query cho API calls**
   - Automatic caching
   - Error handling built-in
   - Loading states

2. **Memoize expensive calculations**
   - useMemo cho filter/sort
   - useCallback cho event handlers

3. **Pagination cho large datasets**
   - Không load hết 1000 items
   - Load từng trang 10-50 items

4. **Error boundaries**
   - Catch errors gracefully
   - Show user-friendly messages

5. **Responsive design**
   - Test trên mobile/tablet
   - Horizontal scroll cho tables

### ❌ DON'T (KHÔNG NÊN)

1. **Fetch data trong render**
   - Dùng useEffect hoặc React Query
   - Tránh infinite loops

2. **Inline functions trong JSX**
   - Tạo function mới mỗi render
   - Dùng useCallback

3. **Mutate state trực tiếp**
   - `state.push()` ❌
   - `setState([...state, newItem])` ✅

4. **Quên cleanup**
   - useEffect return cleanup function
   - Abort pending requests

5. **Hardcode values**
   - Dùng constants
   - Environment variables

---

**Tài liệu được tạo:** 2024  
**Phiên bản:** 1.0  
**Tác giả:** Development Team  
**Liên hệ:** support@luminaeyewear.com
