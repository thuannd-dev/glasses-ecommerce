# TÀI LIỆU KỸ THUẬT - QUẢN LÝ PRODUCTS, PROMOTIONS, INBOUND

> **Dành cho:** Học sinh cấp 3 và người mới bắt đầu  
> **Mục đích:** Hiểu rõ cách hoạt động của 3 module quản lý chính trong hệ thống

---

## 📋 MỤC LỤC

1. [Products Management - Quản Lý Sản Phẩm](#1-products-management---quản-lý-sản-phẩm)
2. [Promotions Management - Quản Lý Khuyến Mãi](#2-promotions-management---quản-lý-khuyến-mãi)
3. [Inbound Management - Quản Lý Nhập Kho](#3-inbound-management---quản-lý-nhập-kho)

---

## 1. PRODUCTS MANAGEMENT - QUẢN LÝ SẢN PHẨM

### 🎯 Mục đích
Cho phép Manager quản lý toàn bộ sản phẩm trong hệ thống: tạo mới, chỉnh sửa, xóa, và tìm kiếm sản phẩm.

### 🔧 Công nghệ sử dụng
- **React + TypeScript**: Framework frontend
- **React Query**: Quản lý API calls và cache
- **Material-UI (MUI)**: Component library
- **Framer Motion**: Animation cho wizard
- **React Router**: Navigation

### 📊 SƠ ĐỒ TỔNG QUAN

```
┌─────────────────────────────────────────────────────────────────┐
│              PRODUCTS MANAGEMENT ARCHITECTURE                   │
└─────────────────────────────────────────────────────────────────┘

    [Manager truy cập /manager/products]
                    │
                    ▼
    ┌───────────────────────────────────────────┐
    │   ProductsList Component                  │
    │   - List view (Table)                     │
    │   - Gallery view (Cards)                  │
    │   - Search & Filters                      │
    │   - Pagination                            │
    └───────────┬───────────────────────────────┘
                │
                │ Fetch products
                ▼
    ┌───────────────────────────────────────────────────────┐
    │   useManagerProducts Hook                             │
    │   GET /manager/products?                              │
    │       pageNumber=1&                                   │
    │       pageSize=10&                                    │
    │       search=ray-ban&                                 │
    │       brand=Ray-Ban&                                  │
    │       status=Active&                                  │
    │       type=Frame&                                     │
    │       minPrice=50&                                    │
    │       maxPrice=500&                                   │
    │       sortBy=Price&                                   │
    │       sortOrder=Desc                                  │
    └───────────────────────┬───────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────────────────┐
    │   Response: ProductsResponse                          │
    │   {                                                   │
    │     items: [                                          │
    │       {                                               │
    │         id, productName, type, brand,                 │
    │         minPrice, maxPrice,                           │
    │         totalQuantityAvailable,                       │
    │         firstImage, category                          │
    │       }                                               │
    │     ],                                                │
    │     totalCount, pageNumber, pageSize,                 │
    │     totalPages, hasPreviousPage, hasNextPage          │
    │   }                                                   │
    └───────────────────────────────────────────────────────┘
```

### 🔄 LUỒNG TẠO SẢN PHẨM MỚI

```
┌─────────────────────────────────────────────────────────────────┐
│                CREATE PRODUCT WIZARD WORKFLOW                   │
└─────────────────────────────────────────────────────────────────┘

    [Manager click "Create Product"]
         │
         │ Navigate to wizard
         ▼
    ┌─────────────────────────────────────────────┐
    │ ManagerProductCreateWizardScreen            │
    │ 4-Step Wizard với localStorage persistence  │
    └──────────┬──────────────────────────────────┘
               │
               │ STEP 0: Basic Info
               ▼
    ┌─────────────────────────────────────────────────────┐
    │ Step 0: Product Basic Information                  │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ Form Fields:                                │     │
    │ │ • Product Name (required)                   │     │
    │ │ • Category (dropdown, required)             │     │
    │ │ • Type (Frame/Lens/Combo/Accessory/Service) │     │
    │ │ • Brand (text)                              │     │
    │ │ • Description (textarea)                    │     │
    │ │ • Status (Draft/Active/Discontinued)        │     │
    │ └─────────────────────────────────────────────┘     │
    │                                                     │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ Validation:                                 │     │
    │ │ • Product Name: min 3 chars                 │     │
    │ │ • Category: must select                     │     │
    │ └─────────────────────────────────────────────┘     │
    │                                                     │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ API Call:                                   │     │
    │ │ POST /manager/products                      │     │
    │ │ {                                           │     │
    │ │   categoryId, productName, type,            │     │
    │ │   description, brand, status                │     │
    │ │ }                                           │     │
    │ │                                             │     │
    │ │ Response: { id: "product-123" }             │     │
    │ └─────────────────────────────────────────────┘     │
    │                                                     │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ Save to localStorage:                       │     │
    │ │ {                                           │     │
    │ │   productId: "product-123",                 │     │
    │ │   step: 0,                                  │     │
    │ │   savedSteps: { 0: true }                   │     │
    │ │ }                                           │     │
    │ └─────────────────────────────────────────────┘     │
    └─────────────────────────────────────────────────────┘
               │
               │ Click "Next"
               ▼
    ┌─────────────────────────────────────────────────────┐
    │ Step 1: Product Images                              │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ Upload Images:                              │     │
    │ │ • Drag & drop hoặc click to upload          │     │
    │ │ • Multiple images                           │     │
    │ │ • Preview thumbnails                        │     │
    │ │ • Reorder by drag & drop                    │     │
    │ │ • Delete individual images                  │     │
    │ └─────────────────────────────────────────────┘     │
    │                                                     │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ Upload Process:                             │     │
    │ │ 1. Select file (jpg, png, webp)             │     │
    │ │ 2. Upload to Cloudinary/CDN                 │     │
    │ │ 3. Get image URL                            │     │
    │ │ 4. POST /manager/products/{id}/images       │     │
    │ │    {                                        │     │
    │ │      imageUrl, altText,                     │     │
    │ │      displayOrder, modelUrl                 │     │
    │ │    }                                        │     │
    │ └─────────────────────────────────────────────┘     │
    └─────────────────────────────────────────────────────┘
               │
               │ Click "Next"
               ▼
    ┌─────────────────────────────────────────────────────┐
    │ Step 2: Product Variants                            │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ Add Variants:                               │     │
    │ │ • Click "+ Add Variant"                     │     │
    │ │ • Fill variant form:                        │     │
    │ │   - SKU (required, unique)                  │     │
    │ │   - Variant Name (e.g., "Black Frame")      │     │
    │ │   - Color                                   │     │
    │ │   - Size                                    │     │
    │ │   - Material                                │     │
    │ │   - Dimensions (frame/lens/bridge/temple)   │     │
    │ │   - Price (required)                        │     │
    │ │   - Compare At Price (sale price)           │     │
    │ │   - Is Pre-Order                            │     │
    │ │   - Variant Images                          │     │
    │ └─────────────────────────────────────────────┘     │
    │                                                     │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ API Call:                                   │     │
    │ │ POST /manager/products/{id}/variants        │     │
    │ │ {                                           │     │
    │ │   sku, variantName, color, size,            │     │
    │ │   material, frameWidth, lensWidth,          │     │
    │ │   bridgeWidth, templeLength,                │     │
    │ │   price, compareAtPrice, isPreOrder         │     │
    │ │ }                                           │     │
    │ └─────────────────────────────────────────────┘     │
    └─────────────────────────────────────────────────────┘
               │
               │ Click "Next"
               ▼
    ┌─────────────────────────────────────────────────────┐
    │ Step 3: Review & Publish                            │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ Summary:                                    │     │
    │ │ • Product Name                              │     │
    │ │ • Category                                  │     │
    │ │ • Images count                              │     │
    │ │ • Variants count                            │     │
    │ │ • Total inventory                           │     │
    │ └─────────────────────────────────────────────┘     │
    │                                                     │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ Actions:                                    │     │
    │ │ • "Save as Draft" → status = Draft          │     │
    │ │ • "Publish" → status = Active               │     │
    │ │ • "Back" → Edit previous steps              │     │
    │ └─────────────────────────────────────────────┘     │
    │                                                     │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ On Success:                                 │     │
    │ │ • Clear localStorage                        │     │
    │ │ • Show success toast                        │     │
    │ │ • Navigate to /manager/products             │     │
    │ └─────────────────────────────────────────────┘     │
    └─────────────────────────────────────────────────────┘
```

### 🔍 SEARCH & FILTER

```
┌─────────────────────────────────────────────────────────────────┐
│                   SEARCH & FILTER SYSTEM                        │
└─────────────────────────────────────────────────────────────────┘

    Filter Bar
    ┌────────────────────────────────────────────────────────┐
    │ [Search: _______] [Brand ▼] [Status ▼] [Type ▼]       │
    │ [Min Price: ___] [Max Price: ___]                      │
    │ [Sort By ▼] [Order ▼] [Clear Filters]                 │
    └────────────────────────────────────────────────────────┘
                            │
                            │ User input
                            ▼
    ┌─────────────────────────────────────────────────────────┐
    │ State Management (useState)                             │
    │ • searchTerm                                            │
    │ • selectedBrand                                         │
    │ • selectedStatus (Draft/Active/Discontinued)            │
    │ • selectedType (Frame/Lens/Combo/Accessory/Service)     │
    │ • minPrice, maxPrice                                    │
    │ • sortBy (CreatedAt/Price/Name)                         │
    │ • sortOrder (Asc/Desc)                                  │
    │ • pageNumber, pageSize                                  │
    └──────────────────┬──────────────────────────────────────┘
                       │
                       │ Trigger API call
                       ▼
    ┌─────────────────────────────────────────────────────────┐
    │ useManagerProducts Hook                                 │
    │ • Debounce search (300ms)                               │
    │ • Reset pageNumber to 1 on filter change                │
    │ • Build query params                                    │
    │ • React Query auto-cache                                │
    └──────────────────┬──────────────────────────────────────┘
                       │
                       │ API Response
                       ▼
    ┌─────────────────────────────────────────────────────────┐
    │ Display Results                                         │
    │ • Table View: Rows with columns                         │
    │ • Gallery View: Cards with images                       │
    │ • Pagination: Page 1/10                                 │
    │ • Total Count: "Showing 1-10 of 95 products"            │
    └─────────────────────────────────────────────────────────┘

Filter Logic:
┌─────────────────────────────────────────────────────────┐
│ Backend filters (SQL WHERE clauses):                   │
│ • search → LIKE %search% on productName               │
│ • brand → = brand                                      │
│ • status → = status (0=Draft, 1=Active, 2=Discontinued)│
│ • type → = type (1=Frame, 2=Lens, etc.)               │
│ • minPrice/maxPrice → BETWEEN minPrice AND maxPrice    │
│ • sortBy + sortOrder → ORDER BY {field} {ASC|DESC}    │
└─────────────────────────────────────────────────────────┘
```

### ✏️ EDIT & DELETE

```
┌─────────────────────────────────────────────────────────────────┐
│                    EDIT & DELETE WORKFLOW                       │
└─────────────────────────────────────────────────────────────────┘

    EDIT:
    [User clicks "Edit" button]
         │
         ▼
    Navigate to /manager/products/{id}/edit
         │
         ▼
    ┌─────────────────────────────────────────────┐
    │ Edit Screen (similar to Create Wizard)     │
    │ • Pre-filled with existing data             │
    │ • Can edit all fields                       │
    │ • Can add/remove images                     │
    │ • Can add/edit/delete variants              │
    └──────────┬──────────────────────────────────┘
               │
               │ Save changes
               ▼
    PUT /manager/products/{id}
    PUT /manager/products/{id}/variants/{variantId}
         │
         │ Success
         ▼
    ┌─────────────────────────────────────────────┐
    │ • Invalidate React Query cache              │
    │ • Show success toast                        │
    │ • Navigate back to list                     │
    └─────────────────────────────────────────────┘

    DELETE:
    [User clicks "Delete" button]
         │
         ▼
    ┌─────────────────────────────────────────────┐
    │ Confirmation Dialog                         │
    │ "Are you sure you want to delete            │
    │  {productName}?"                            │
    │ [Cancel] [Delete]                           │
    └──────────┬──────────────────────────────────┘
               │
               │ Confirm
               ▼
    DELETE /manager/products/{id}
         │
         │ Success
         ▼
    ┌─────────────────────────────────────────────┐
    │ • Remove from list (optimistic update)      │
    │ • Invalidate cache                          │
    │ • Show success toast                        │
    └─────────────────────────────────────────────┘
```

---

## 2. PROMOTIONS MANAGEMENT - QUẢN LÝ KHUYẾN MÃI

### 🎯 Mục đích
Quản lý các chương trình khuyến mãi, mã giảm giá (promo codes) cho khách hàng.

### 🔧 Công nghệ sử dụng
- **React + TypeScript**
- **React Query**
- **Material-UI (MUI)**

### 📊 SƠ ĐỒ TỔNG QUAN

```
┌─────────────────────────────────────────────────────────────────┐
│            PROMOTIONS MANAGEMENT ARCHITECTURE                   │
└─────────────────────────────────────────────────────────────────┘

    [Manager truy cập /manager/promotions]
                    │
                    ▼
    ┌───────────────────────────────────────────┐
    │   PromotionsScreen Component              │
    │   - Table view                            │
    │   - Search & Filters                      │
    │   - Create/Edit dialogs                   │
    │   - Pagination                            │
    └───────────┬───────────────────────────────┘
                │
                │ Fetch promotions
                ▼
    ┌───────────────────────────────────────────────────────┐
    │   useManagerPromotions Hook                           │
    │   GET /manager/promotions?                            │
    │       pageNumber=1&                                   │
    │       pageSize=10&                                    │
    │       promotionType=0&  (0=%, 1=$, 2=FreeShip)        │
    │       isActive=true                                   │
    └───────────────────────┬───────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────────────────┐
    │   Response: PagedPromotionsResponse                   │
    │   {                                                   │
    │     items: [                                          │
    │       {                                               │
    │         id, promoCode, promoName,                     │
    │         promotionType, discountValue,                 │
    │         maxDiscountValue, validFrom, validTo,         │
    │         isActive, isPublic, usedCount                 │
    │       }                                               │
    │     ],                                                │
    │     totalCount, pageNumber, pageSize,                 │
    │     totalPages                                        │
    │   }                                                   │
    └───────────────────────────────────────────────────────┘
```

### ➕ TẠO PROMOTION MỚI

```
┌─────────────────────────────────────────────────────────────────┐
│                  CREATE PROMOTION WORKFLOW                      │
└─────────────────────────────────────────────────────────────────┘

    [Manager click "+ New Promotion"]
         │
         ▼
    ┌─────────────────────────────────────────────────────┐
    │ Create Promotion Dialog                             │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ Form Fields:                                │     │
    │ │                                             │     │
    │ │ 1. Promo Code (required)                    │     │
    │ │    • Uppercase only                         │     │
    │ │    • Min 3 chars                            │     │
    │ │    • Only letters, digits, hyphens          │     │
    │ │    • Example: SUMMER2024                    │     │
    │ │                                             │     │
    │ │ 2. Promo Name (required)                    │     │
    │ │    • Display name                           │     │
    │ │    • Example: "Summer Sale 2024"            │     │
    │ │                                             │     │
    │ │ 3. Description (optional)                   │     │
    │ │    • Multiline text                         │     │
    │ │                                             │     │
    │ │ 4. Promotion Type (required)                │     │
    │ │    • Percentage (%)                         │     │
    │ │    • Fixed Amount ($)                       │     │
    │ │    • Free Shipping                          │     │
    │ │                                             │     │
    │ │ 5. Discount Value                           │     │
    │ │    • If Percentage: 1-100                   │     │
    │ │    • If Fixed Amount: > 0                   │     │
    │ │    • If Free Shipping: N/A                  │     │
    │ │                                             │     │
    │ │ 6. Max Discount Value (optional)            │     │
    │ │    • Only for Percentage type               │     │
    │ │    • Cap the discount amount                │     │
    │ │    • Example: 20% off, max $50              │     │
    │ │                                             │     │
    │ │ 7. Usage Limit (optional)                   │     │
    │ │    • Total times can be used                │     │
    │ │    • Example: 100 uses                      │     │
    │ │                                             │     │
    │ │ 8. Per Customer Limit (optional)            │     │
    │ │    • Max uses per customer                  │     │
    │ │    • Must ≤ Usage Limit                     │     │
    │ │    • Example: 1 use per customer            │     │
    │ │                                             │     │
    │ │ 9. Valid From (required)                    │     │
    │ │    • datetime-local input                   │     │
    │ │    • Start date & time                      │     │
    │ │                                             │     │
    │ │ 10. Valid To (required)                     │     │
    │ │     • datetime-local input                  │     │
    │ │     • End date & time                       │     │
    │ │     • Must be after Valid From              │     │
    │ │                                             │     │
    │ │ 11. Is Public (checkbox)                    │     │
    │ │     • Public: Visible to all customers      │     │
    │ │     • Private: Only via direct link/code    │     │
    │ └─────────────────────────────────────────────┘     │
    │                                                     │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ Validation Rules:                           │     │
    │ │ • Promo Code: unique, 3+ chars, alphanumeric│     │
    │ │ • Promo Name: required                      │     │
    │ │ • Discount Value: based on type             │     │
    │ │ • Valid To > Valid From                     │     │
    │ │ • Per Customer ≤ Usage Limit                │     │
    │ └─────────────────────────────────────────────┘     │
    └─────────────────────────────────────────────────────┘
                            │
                            │ Submit
                            ▼
    ┌─────────────────────────────────────────────────────┐
    │ API Call:                                           │
    │ POST /manager/promotions                            │
    │ {                                                   │
    │   promoCode: "SUMMER2024",                          │
    │   promoName: "Summer Sale 2024",                    │
    │   description: "20% off all frames",                │
    │   promotionType: "Percentage",                      │
    │   discountValue: 20,                                │
    │   maxDiscountValue: 50,                             │
    │   usageLimit: 100,                                  │
    │   usageLimitPerCustomer: 1,                         │
    │   validFrom: "2024-06-01T00:00:00Z",                │
    │   validTo: "2024-08-31T23:59:59Z",                  │
    │   isPublic: true                                    │
    │ }                                                   │
    └──────────────────┬──────────────────────────────────┘
                       │
                       │ Success
                       ▼
    ┌─────────────────────────────────────────────────────┐
    │ • Close dialog                                      │
    │ • Invalidate cache                                  │
    │ • Show success toast                                │
    │ • New promotion appears in table                    │
    └─────────────────────────────────────────────────────┘
```

### ✏️ EDIT PROMOTION

```
┌─────────────────────────────────────────────────────────────────┐
│                    EDIT PROMOTION WORKFLOW                      │
└─────────────────────────────────────────────────────────────────┘

    [User clicks row or "Edit" button]
         │
         ▼
    ┌─────────────────────────────────────────────────────┐
    │ Edit Promotion Dialog                               │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ Read-only fields:                           │     │
    │ │ • Promo Code (cannot change)                │     │
    │ │ • Promotion Type (cannot change)            │     │
    │ │ • Discount Value (cannot change)            │     │
    │ └─────────────────────────────────────────────┘     │
    │                                                     │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ Editable fields:                            │     │
    │ │ • Promo Name                                │     │
    │ │ • Description                               │     │
    │ │ • Max Discount Value                        │     │
    │ │ • Usage Limit                               │     │
    │ │ • Per Customer Limit                        │     │
    │ │ • Valid From                                │     │
    │ │ • Valid To                                  │     │
    │ │ • Is Active (toggle)                        │     │
    │ │ • Is Public (toggle)                        │     │
    │ └─────────────────────────────────────────────┘     │
    └─────────────────────────────────────────────────────┘
                            │
                            │ Save
                            ▼
    ┌─────────────────────────────────────────────────────┐
    │ PUT /manager/promotions/{id}                        │
    │ {                                                   │
    │   promoName, description, maxDiscountValue,         │
    │   usageLimit, usageLimitPerCustomer,                │
    │   validFrom, validTo, isActive, isPublic            │
    │ }                                                   │
    └──────────────────┬──────────────────────────────────┘
                       │
                       │ Success
                       ▼
    ┌─────────────────────────────────────────────────────┐
    │ • Close dialog                                      │
    │ • Invalidate cache                                  │
    │ • Show success toast                                │
    │ • Updated data in table                             │
    └─────────────────────────────────────────────────────┘
```

### 🚫 DEACTIVATE PROMOTION

```
┌─────────────────────────────────────────────────────────────────┐
│                  DEACTIVATE PROMOTION WORKFLOW                  │
└─────────────────────────────────────────────────────────────────┘

    [User clicks "Deactivate" button]
         │
         ▼
    ┌─────────────────────────────────────────────────────┐
    │ Confirmation (optional)                             │
    │ "Deactivate {promoCode}?"                           │
    └──────────────────┬──────────────────────────────────┘
                       │
                       │ Confirm
                       ▼
    ┌─────────────────────────────────────────────────────┐
    │ POST /manager/promotions/{id}/deactivate            │
    └──────────────────┬──────────────────────────────────┘
                       │
                       │ Success
                       ▼
    ┌─────────────────────────────────────────────────────┐
    │ • isActive = false                                  │
    │ • Customers cannot use this code anymore            │
    │ • Still visible in manager list                     │
    │ • Can be reactivated via Edit                       │
    └─────────────────────────────────────────────────────┘

Note: Không có DELETE promotion
      Chỉ có DEACTIVATE để giữ lịch sử
```

### 🔍 PROMOTION TYPES

```
┌─────────────────────────────────────────────────────────────────┐
│                      PROMOTION TYPES                            │
└─────────────────────────────────────────────────────────────────┘

1. PERCENTAGE (%)
   ┌────────────────────────────────────────────┐
   │ Example: "SUMMER20"                        │
   │ • Discount Value: 20                       │
   │ • Means: 20% off                           │
   │ • Max Discount: $50 (optional cap)         │
   │                                            │
   │ Calculation:                               │
   │ Order Total: $300                          │
   │ Discount: $300 × 20% = $60                 │
   │ But capped at $50                          │
   │ Final Discount: $50                        │
   │ Customer Pays: $250                        │
   └────────────────────────────────────────────┘

2. FIXED AMOUNT ($)
   ┌────────────────────────────────────────────┐
   │ Example: "SAVE50"                          │
   │ • Discount Value: 50                       │
   │ • Means: $50 off                           │
   │ • No max discount needed                   │
   │                                            │
   │ Calculation:                               │
   │ Order Total: $300                          │
   │ Discount: $50                              │
   │ Customer Pays: $250                        │
   └────────────────────────────────────────────┘

3. FREE SHIPPING
   ┌────────────────────────────────────────────┐
   │ Example: "FREESHIP"                        │
   │ • Discount Value: 0 (N/A)                  │
   │ • Means: Shipping fee = $0                 │
   │                                            │
   │ Calculation:                               │
   │ Order Total: $300                          │
   │ Shipping: $10 → $0                         │
   │ Customer Pays: $300 (no shipping)          │
   └────────────────────────────────────────────┘
```

---

## 3. INBOUND MANAGEMENT - QUẢN LÝ NHẬP KHO

### 🎯 Mục đích
Quản lý các đơn nhập hàng vào kho: duyệt, từ chối, theo dõi trạng thái.

### 🔧 Công nghệ sử dụng
- **React + TypeScript**
- **React Query**
- **Material-UI (MUI)**

### 📊 SƠ ĐỒ TỔNG QUAN

```
┌─────────────────────────────────────────────────────────────────┐
│              INBOUND MANAGEMENT ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────────┘

    [Manager truy cập /manager/inbound]
                    │
                    ▼
    ┌───────────────────────────────────────────┐
    │   InboundList Component                   │
    │   - Table view                            │
    │   - Status filter                         │
    │   - Approve/Reject actions                │
    │   - Pagination                            │
    └───────────┬───────────────────────────────┘
                │
                │ Fetch inbound records
                ▼
    ┌───────────────────────────────────────────────────────┐
    │   useManagerInboundRecords Hook                       │
    │   GET /manager/inventory/inbound?                     │
    │       pageNumber=1&                                   │
    │       pageSize=10&                                    │
    │       status=PendingApproval                          │
    └───────────────────────┬───────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────────────────┐
    │   Response: PagedInboundRecordsResponse               │
    │   {                                                   │
    │     items: [                                          │
    │       {                                               │
    │         id, sourceType, sourceReference,              │
    │         status, totalItems, notes,                    │
    │         createdAt, createdBy, createdByName           │
    │       }                                               │
    │     ],                                                │
    │     totalCount, pageNumber, pageSize,                 │
    │     totalPages                                        │
    │   }                                                   │
    └───────────────────────────────────────────────────────┘
```

### 📥 INBOUND WORKFLOW

```
┌─────────────────────────────────────────────────────────────────┐
│                    INBOUND RECORD LIFECYCLE                     │
└─────────────────────────────────────────────────────────────────┘

    Step 1: CREATE INBOUND RECORD
    ┌─────────────────────────────────────────────┐
    │ Staff/Warehouse creates inbound record     │
    │ POST /manager/inventory/inbound             │
    │ {                                           │
    │   sourceType: "Purchase" | "Return" |       │
    │               "Transfer" | "Adjustment",    │
    │   sourceReference: "PO-12345",              │
    │   notes: "Shipment from supplier",          │
    │   items: [                                  │
    │     {                                       │
    │       variantId: "variant-123",             │
    │       quantity: 50,                         │
    │       notes: "New stock"                    │
    │     }                                       │
    │   ]                                         │
    │ }                                           │
    │                                             │
    │ Status: PendingApproval                     │
    └──────────────────┬──────────────────────────┘
                       │
                       │ Waiting for approval
                       ▼
    Step 2: MANAGER REVIEWS
    ┌─────────────────────────────────────────────┐
    │ Manager opens inbound record                │
    │ GET /manager/inventory/inbound/{id}         │
    │                                             │
    │ Review Details:                             │
    │ • Source Type & Reference                   │
    │ • Items list (variant, quantity)            │
    │ • Created by (staff name)                   │
    │ • Created date                              │
    │ • Notes                                     │
    └──────────────────┬──────────────────────────┘
                       │
                       │ Decision
                       ▼
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
    APPROVE                      REJECT
         │                           │
         │                           │
         ▼                           ▼
    ┌─────────────────┐      ┌─────────────────────┐
    │ POST /manager/  │      │ POST /manager/      │
    │ inventory/      │      │ inventory/          │
    │ inbound/{id}/   │      │ inbound/{id}/reject │
    │ approve         │      │ {                   │
    │                 │      │   rejectionReason:  │
    │ Status:         │      │   "Incorrect qty"   │
    │ Approved        │      │ }                   │
    │                 │      │                     │
    │ Effect:         │      │ Status: Rejected    │
    │ • Inventory +   │      │                     │
    │ • Stock updated │      │ Effect:             │
    └─────────────────┘      │ • No inventory      │
                             │   change            │
                             │ • Record marked     │
                             └─────────────────────┘
```

### ✅ APPROVE INBOUND

```
┌─────────────────────────────────────────────────────────────────┐
│                    APPROVE INBOUND WORKFLOW                     │
└─────────────────────────────────────────────────────────────────┘

    [Manager clicks "Approve" button]
         │
         ▼
    ┌─────────────────────────────────────────────────────┐
    │ Confirmation (optional)                             │
    │ "Approve inbound record {id}?"                      │
    │ "This will add {totalItems} items to inventory"     │
    └──────────────────┬──────────────────────────────────┘
                       │
                       │ Confirm
                       ▼
    ┌─────────────────────────────────────────────────────┐
    │ POST /manager/inventory/inbound/{id}/approve        │
    └──────────────────┬──────────────────────────────────┘
                       │
                       │ Backend Processing
                       ▼
    ┌─────────────────────────────────────────────────────┐
    │ Backend Actions:                                    │
    │ 1. Update inbound status → Approved                 │
    │ 2. For each item in inbound:                        │
    │    a. Find variant by variantId                     │
    │    b. Update inventory:                             │
    │       quantityOnHand += quantity                    │
    │       quantityAvailable += quantity                 │
    │    c. Create inventory transaction:                 │
    │       type = "Inbound"                              │
    │       quantity = +quantity                          │
    │       reference = inbound.id                        │
    │ 3. Set approvedAt = now                             │
    │ 4. Set approvedBy = currentUser.id                  │
    └──────────────────┬──────────────────────────────────┘
                       │
                       │ Success
                       ▼
    ┌─────────────────────────────────────────────────────┐
    │ Frontend Updates:                                   │
    │ • Status badge → Green "Approved"                   │
    │ • Disable Approve/Reject buttons                    │
    │ • Show success toast                                │
    │ • Invalidate cache                                  │
    │ • Inventory numbers updated                         │
    └─────────────────────────────────────────────────────┘

Example:
┌────────────────────────────────────────────────────┐
│ Inbound Record: IB-001                             │
│ Items:                                             │
│ • Ray-Ban Aviator (Black) - Qty: 50                │
│ • Oakley Frogskins (Blue) - Qty: 30                │
│                                                    │
│ Before Approve:                                    │
│ • Ray-Ban Aviator: 10 in stock                     │
│ • Oakley Frogskins: 5 in stock                     │
│                                                    │
│ After Approve:                                     │
│ • Ray-Ban Aviator: 60 in stock (+50)               │
│ • Oakley Frogskins: 35 in stock (+30)              │
└────────────────────────────────────────────────────┘
```

### ❌ REJECT INBOUND

```
┌─────────────────────────────────────────────────────────────────┐
│                    REJECT INBOUND WORKFLOW                      │
└─────────────────────────────────────────────────────────────────┘

    [Manager clicks "Reject" button]
         │
         ▼
    ┌─────────────────────────────────────────────────────┐
    │ Reject Dialog                                       │
    │ ┌─────────────────────────────────────────────┐     │
    │ │ "Reject Inbound Record"                     │     │
    │ │                                             │     │
    │ │ Rejection Reason (required):                │     │
    │ │ ┌─────────────────────────────────────┐     │     │
    │ │ │ [Multiline textarea]                │     │     │
    │ │ │ Max 500 characters                  │     │     │
    │ │ │                                     │     │     │
    │ │ │ Example reasons:                    │     │     │
    │ │ │ • "Incorrect quantity received"     │     │     │
    │ │ │ • "Damaged items"                   │     │     │
    │ │ │ • "Wrong product variant"           │     │     │
    │ │ │ • "Duplicate entry"                 │     │     │
    │ │ └─────────────────────────────────────┘     │     │
    │ │                                             │     │
    │ │ Character count: 45/500                     │     │
    │ │                                             │     │
    │ │ [Cancel] [Reject]                           │     │
    │ └─────────────────────────────────────────────┘     │
    └──────────────────┬──────────────────────────────────┘
                       │
                       │ Submit
                       ▼
    ┌─────────────────────────────────────────────────────┐
    │ POST /manager/inventory/inbound/{id}/reject         │
    │ {                                                   │
    │   rejectionReason: "Incorrect quantity received"    │
    │ }                                                   │
    └──────────────────┬──────────────────────────────────┘
                       │
                       │ Backend Processing
                       ▼
    ┌─────────────────────────────────────────────────────┐
    │ Backend Actions:                                    │
    │ 1. Update inbound status → Rejected                 │
    │ 2. Save rejectionReason                             │
    │ 3. Set rejectedAt = now                             │
    │ 4. Set rejectedBy = currentUser.id                  │
    │ 5. NO inventory changes                             │
    └──────────────────┬──────────────────────────────────┘
                       │
                       │ Success
                       ▼
    ┌─────────────────────────────────────────────────────┐
    │ Frontend Updates:                                   │
    │ • Status badge → Red "Rejected"                     │
    │ • Disable Approve/Reject buttons                    │
    │ • Show rejection reason in detail view              │
    │ • Show success toast                                │
    │ • Invalidate cache                                  │
    └─────────────────────────────────────────────────────┘
```

### 🔍 INBOUND STATUS FILTER

```
┌─────────────────────────────────────────────────────────────────┐
│                    INBOUND STATUS FILTER                        │
└─────────────────────────────────────────────────────────────────┘

    Filter Dropdown
    ┌────────────────────────────┐
    │ Status: [All ▼]            │
    │         • All              │
    │         • Pending Approval │
    │         • Approved         │
    │         • Rejected         │
    └────────────────────────────┘
                │
                │ Select "Pending Approval"
                ▼
    ┌─────────────────────────────────────────────┐
    │ API Call:                                   │
    │ GET /manager/inventory/inbound?             │
    │     status=PendingApproval                  │
    └──────────────────┬──────────────────────────┘
                       │
                       │ Response
                       ▼
    ┌─────────────────────────────────────────────┐
    │ Table shows only:                           │
    │ • Records with status = PendingApproval     │
    │ • Approve/Reject buttons enabled            │
    └─────────────────────────────────────────────┘

Status Colors:
┌────────────────────────────────────────┐
│ • PendingApproval → Yellow (warning)   │
│ • Approved → Green (success)           │
│ • Rejected → Red (error)               │
└────────────────────────────────────────┘
```

---

## 4. TÓM TẮT CHO HỌC SINH CẤP 3

### 🎓 HIỂU ĐƠN GIẢN

#### **Products Management**
**Là gì?** Quản lý kho sản phẩm kính mắt
**Làm gì?**
- ➕ Thêm sản phẩm mới (tên, ảnh, giá, variants)
- ✏️ Sửa thông tin sản phẩm
- 🗑️ Xóa sản phẩm
- 🔍 Tìm kiếm và lọc sản phẩm

**Wizard 4 bước:**
1. Thông tin cơ bản (tên, loại, brand)
2. Upload ảnh
3. Thêm variants (màu, size, giá)
4. Review và publish

#### **Promotions Management**
**Là gì?** Quản lý mã giảm giá
**Làm gì?**
- ➕ Tạo mã mới (SUMMER20, FREESHIP)
- ✏️ Sửa thời gian, giới hạn sử dụng
- 🚫 Vô hiệu hóa mã hết hạn

**3 loại khuyến mãi:**
1. **Percentage**: Giảm % (ví dụ: 20% off)
2. **Fixed Amount**: Giảm số tiền cố định (ví dụ: $50 off)
3. **Free Shipping**: Miễn phí vận chuyển

#### **Inbound Management**
**Là gì?** Quản lý hàng nhập kho
**Làm gì?**
- 👀 Xem danh sách đơn nhập hàng
- ✅ Duyệt đơn → Cộng vào kho
- ❌ Từ chối đơn → Không cộng vào kho

**Quy trình:**
1. Nhân viên tạo đơn nhập → Status: Pending
2. Manager xem và kiểm tra
3. Manager duyệt → Hàng vào kho
4. Hoặc từ chối → Ghi lý do

---

## 5. GLOSSARY - TỪ ĐIỂN THUẬT NGỮ

| Thuật ngữ | Giải thích |
|-----------|------------|
| **Product** | Sản phẩm |
| **Variant** | Biến thể (ví dụ: màu đen, size M) |
| **SKU** | Stock Keeping Unit - Mã định danh sản phẩm |
| **Promotion** | Khuyến mãi, chương trình giảm giá |
| **Promo Code** | Mã giảm giá (ví dụ: SUMMER20) |
| **Inbound** | Nhập kho |
| **Outbound** | Xuất kho |
| **Inventory** | Tồn kho |
| **Wizard** | Trình hướng dẫn từng bước |
| **Pagination** | Phân trang |
| **Filter** | Lọc dữ liệu |
| **Approve** | Duyệt, chấp nhận |
| **Reject** | Từ chối |
| **Deactivate** | Vô hiệu hóa |

---

**Tài liệu được tạo:** 2024  
**Phiên bản:** 1.0  
**Tác giả:** Development Team
