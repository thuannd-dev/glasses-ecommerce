# Client Application Structure Exploration

## Overview
The client application is a React + TypeScript application using Material-UI (MUI) with role-based dashboard features. The application is organized into multiple feature modules with a centralized sidebar navigation system.

---

## 1. Directory Structure

### Main Folders:
```
client/src/
├── app/
│   ├── layout/          # Layout components and sidebar
│   ├── router/          # Route configuration
│   └── shared/          # Shared components
├── features/            # Feature modules
├── lib/                 # Utilities, hooks, types
└── main.tsx            # Entry point
```

### Key Features Folders:
- `features/Sales/` - Sales module
- `features/Operations/` - Operations module
- `features/Admin/` - Admin module
- `features/Manager/` - Manager dashboard
- `features/Customer/` - Customer pages
- `features/collections/` - Product collections
- `features/cart/` - Shopping cart
- `features/checkout/` - Checkout flow

---

## 2. Operations & Sales Page Components

### **OPERATIONS PAGE STRUCTURE**

#### Main Component:
- **File:** [features/Operations/OperationsLayout.tsx](features/Operations/OperationsLayout.tsx)
- **Role:** Operations-only dashboard
- **Routes Served:**
  - `/operations/pack` - Confirmed orders (PackScreen)
  - `/operations/create-shipment` - Packing orders (CreateShipmentScreen)
  - `/operations/tracking` - Shipped orders (TrackingScreen)
  - `/operations/return-refund` - Return/Refund Inspection (ReturnRefundInspectionScreen)
  - `/operations/warranty` - Warranty (OperationsWarrantyScreen)
  - `/operations/orders/:id` - Order detail

#### Screen Components:
Located in [features/Operations/screens/](features/Operations/screens/):
- `PackScreen.tsx`
- `CreateShipmentScreen.tsx`
- `TrackingScreen.tsx`
- **`ReturnRefundInspectionScreen.tsx`** ⭐
- **`OperationsWarrantyScreen.tsx`** ⭐
- `OperationsOrderDetailScreen.tsx`

---

### **SALES PAGE STRUCTURE**

#### Main Component:
- **File:** [features/Sales/SalesLayout.tsx](features/Sales/SalesLayout.tsx)
- **Role:** Sales-only dashboard
- **Routes Served:**
  - `/sales` - Overview (OverviewScreen)
  - `/sales/orders` - Orders list (OrdersScreen)
  - `/sales/orders/:id` - Order detail (OrderDetailScreen)
  - `/sales/return-refund` - Return/Refund requests (ReturnRefundScreen)
  - `/sales/warranty` - Warranty requests (WarrantyScreen)
  - `/sales/return-refund/:ticketId` - Ticket detail (TicketDetailScreen)
  - `/sales/warranty/:ticketId` - Ticket detail (TicketDetailScreen)

#### Screen Components:
Located in [features/Sales/screens/](features/Sales/screens/):
- `OverviewScreen.tsx`
- `OrdersScreen.tsx`
- `OrderDetailScreen.tsx`
- **`ReturnRefundScreen.tsx`** ⭐
- **`WarrantyScreen.tsx`** ⭐
- `TicketListScreen.tsx` - Shared component for both return/refund and warranty
- `TicketDetailScreen.tsx`

---

## 3. Icon Usage in Pages

### **Sales Module Icons**

| Feature | Icon | Color | File Import |
|---------|------|-------|------------|
| **Return / Refund** | `AssignmentReturnIcon` | (default) | `@mui/icons-material/AssignmentReturn` |
| **Warranty** | `VerifiedUserIcon` | (default) | `@mui/icons-material/VerifiedUser` |

**Location in Code:** [app/layout/DashboardLayout.tsx](app/layout/DashboardLayout.tsx) - Line 42-43

```tsx
const SALES_SUB_LINKS: { path: string; label: string; icon: React.ReactNode }[] = [
  { path: "/sales", label: "Overview", icon: <PointOfSaleIcon /> },
  { path: "/sales/orders", label: "Orders", icon: <Inventory2Outlined /> },
  { path: "/sales/return-refund", label: "Return / Refund", icon: <AssignmentReturnIcon /> },
  { path: "/sales/warranty", label: "Warranty", icon: <VerifiedUserIcon /> },
];
```

### **Operations Module Icons**

| Feature | Icon | Color | File Import |
|---------|------|-------|------------|
| **Confirmed orders** | `Inventory2Outlined` | (default) | `@mui/icons-material/Inventory2Outlined` |
| **Packing orders** | `AddBoxOutlined` | (default) | `@mui/icons-material/AddBoxOutlined` |
| **Shipped** | `TrackChangesOutlined` | (default) | `@mui/icons-material/TrackChangesOutlined` |

**Note:** Operations Return/Refund Inspection and Warranty are NOT in OPERATIONS_SUB_LINKS (lines 46-50). They are rendered separately in the sidebar with conditional logic.

---

## 4. "Return/Refund Inspection" & "Warranty" Titles in Pages

### **SALES - Return / Refund Page**

- **File:** [features/Sales/screens/ReturnRefundScreen.tsx](features/Sales/screens/ReturnRefundScreen.tsx)
- **Screen Title:** "Return / Refund Requests"
- **Icon Used:** `AssignmentReturnIcon`
- **Color:** (default, orange `#f59e0b` for ticket type)
- **Component:** Uses generic `TicketListScreen` component

```tsx
export function ReturnRefundScreen() {
  return (
    <TicketListScreen
      title="Return / Refund Requests"
      ticketTypes={[AfterSalesTicketTypeValues.Return, AfterSalesTicketTypeValues.Refund]}
      navPrefix="return-refund"
    />
  );
}
```

---

### **SALES - Warranty Page**

- **File:** [features/Sales/screens/WarrantyScreen.tsx](features/Sales/screens/WarrantyScreen.tsx)
- **Screen Title:** "Warranty Requests"
- **Icon Used:** `VerifiedUserIcon`
- **Color:** (default, blue `#3b82f6` for ticket type)
- **Component:** Uses generic `TicketListScreen` component

```tsx
export function WarrantyScreen() {
  return (
    <TicketListScreen
      title="Warranty Requests"
      ticketTypes={[AfterSalesTicketTypeValues.Warranty]}
      navPrefix="warranty"
    />
  );
}
```

---

### **OPERATIONS - Return/Refund Inspection Page** ⭐⭐⭐

- **File:** [features/Operations/screens/ReturnRefundInspectionScreen.tsx](features/Operations/screens/ReturnRefundInspectionScreen.tsx)
- **Screen Title:** **"Return/Refund Inspection"** (Line 102)
- **Icon Used:** `AssignmentReturnIcon`
- **Icon Color:** `#f59e0b` (orange)
- **Font Size:** 32
- **Custom Component:** NOT using the shared TicketListScreen
- **Status Filters:** Pending, Approved, Rejected

```tsx
<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
  <AssignmentReturnIcon sx={{ fontSize: 32, color: "#f59e0b" }} />
  <Typography sx={{ fontSize: 24, fontWeight: 900 }}>
    Return/Refund Inspection
  </Typography>
</Box>
```

---

### **OPERATIONS - Warranty Page** ⭐⭐⭐

- **File:** [features/Operations/screens/OperationsWarrantyScreen.tsx](features/Operations/screens/OperationsWarrantyScreen.tsx)
- **Screen Title:** **"Warranty"** (Line ~100)
- **Icon Used:** `VerifiedUserIcon`
- **Icon Color:** `#3b82f6` (blue)
- **Font Size:** 32
- **Custom Component:** NOT using the shared TicketListScreen
- **Status Filters:** Pending, Repair, Replace, Rejected

```tsx
<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
  <VerifiedUserIcon sx={{ fontSize: 32, color: "#3b82f6" }} />
  <Typography sx={{ fontSize: 24, fontWeight: 900 }}>
    Warranty
  </Typography>
</Box>
```

---

## 5. Sidebar Menu Implementation

### **Location:** [app/layout/DashboardLayout.tsx](app/layout/DashboardLayout.tsx)

### **Architecture:**

The sidebar is a comprehensive navigation system that dynamically renders different sections based on role and route.

#### **Key Features:**

1. **Sidebar Width:** 260px (SIDEBAR_WIDTH constant)
2. **Fixed Header:** Top bar with toggle button (height: 56px)
3. **Collapsible Sections:** Each main category (Sales, Operations, etc.) can be expanded/collapsed
4. **Role-Based Visibility:** Users only see sections matching their role
5. **Dynamic Highlighting:** Active routes are highlighted with specific styling

### **Components Used:**

```tsx
// Material-UI imports
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
} from "@mui/material";
```

### **Sidebar Structure:**

#### **Main Dashboard Links** (Lines 34-36):
```tsx
const DASHBOARD_LINKS: { path: string; label: string; role: string; icon: React.ReactNode }[] = [
  { path: "/sales", label: "Sales", role: "Sales", icon: <PointOfSaleIcon /> },
  { path: "/operations", label: "Operations", role: "Operations", icon: <LocalShippingIcon /> },
  { path: "/manager", label: "Manager", role: "Manager", icon: <ManageAccountsIcon /> },
  { path: "/admin", label: "Admin", role: "Admin", icon: <AdminPanelSettingsIcon /> },
];
```

#### **Sales Sub-Links** (Lines 38-43):
```tsx
const SALES_SUB_LINKS: { path: string; label: string; icon: React.ReactNode }[] = [
  { path: "/sales", label: "Overview", icon: <PointOfSaleIcon /> },
  { path: "/sales/orders", label: "Orders", icon: <Inventory2Outlined /> },
  { path: "/sales/return-refund", label: "Return / Refund", icon: <AssignmentReturnIcon /> },
  { path: "/sales/warranty", label: "Warranty", icon: <VerifiedUserIcon /> },
];
```

#### **Operations Sub-Links** (Lines 46-50):
```tsx
const OPERATIONS_SUB_LINKS: { path: string; label: string; icon: React.ReactNode }[] = [
  { path: "/operations/pack", label: "Confirmed orders", icon: <Inventory2Outlined /> },
  { path: "/operations/create-shipment", label: "Packing orders", icon: <AddBoxOutlined /> },
  { path: "/operations/tracking", label: "Shipped", icon: <TrackChangesOutlined /> },
];
```

### **Special Handling for Return/Refund & Warranty:**

These sections have **collapsible sub-menus** with status filters:

#### **Sales - Return / Refund Section** (Lines 307-421):
- Parent item: "Return / Refund" (with AssignmentReturnIcon)
- Expandable sub-items:
  - Pending
  - InProgress
  - Resolved
  - Rejected

#### **Sales - Warranty Section** (Lines 434-555):
- Parent item: "Warranty" (with VerifiedUserIcon)
- Expandable sub-items:
  - Pending
  - InProgress
  - Resolved
  - Rejected

#### **Operations - Return/Refund Inspection Section** (Lines 632-730):
- Parent item: **"Return/Refund Inspection"** (with AssignmentReturnIcon)
- Expandable sub-items:
  - Pending
  - Approved
  - Rejected

#### **Operations - Warranty Section** (Lines 732-844):
- Parent item: "Warranty" (NO icon in this section)
- Expandable sub-items:
  - Pending
  - Repair
  - Replace
  - Rejected

### **Styling:**

#### **Base Styles** (applied to all menu items):
```tsx
const baseStyles = {
  borderRadius: 2,
  mb: 0.25,
  color: "rgba(0,0,0,0.7)",
  "&:hover": {
    bgcolor: "rgba(0,0,0,0.04)",
    color: "rgba(0,0,0,0.9)",
  },
} as const;
```

#### **Active/Highlighted Styles**:
```tsx
const activeStyles = {
  bgcolor: "rgba(25,118,210,0.12)",  // Light blue background
  color: "primary.main",              // Primary color text
} as const;
```

#### **Collapse Animation:**
- Uses MUI `<Collapse>` component with auto timeout
- `unmountOnExit` prop hides DOM when collapsed

### **State Management:**

Each expandable section uses React `useState`:
```tsx
const [sidebarOpen, setSidebarOpen] = useState(true);
const [salesOrdersOpen, setSalesOrdersOpen] = useState(true);
const [returnRefundOpen, setReturnRefundOpen] = useState(true);
const [warrantyOpen, setWarrantyOpen] = useState(true);
const [operationsOpen, setOperationsOpen] = useState(true);
```

### **Route Detection:**

The sidebar uses `useLocation()` to determine:
1. **Current page:** `location.pathname`
2. **Current status filter:** `location.search` (query parameters)
3. **Which menu item is active:** Compares current path against navigation links

---

## 6. Shared Components

### **TicketListScreen** (Sales Module)
- **File:** [features/Sales/screens/TicketListScreen.tsx](features/Sales/screens/TicketListScreen.tsx)
- **Purpose:** Reusable component for displaying tickets (Return, Refund, Warranty)
- **Props:**
  - `title: string` - Page title
  - `ticketTypes: AfterSalesTicketType[]` - Array of ticket types to filter
  - `navPrefix: string` - Route prefix for navigation

### **SummaryCard** (Operations & Sales)
- **Location:** [features/Operations/components/](features/Operations/components/) or [features/Sales/components/](features/Sales/components/)
- **Purpose:** Display summary statistics

---

## 7. Route Configuration

**File:** [app/router/Routes.tsx](app/router/Routes.tsx)

### **Sales Routes** (Lines 86-94):
```tsx
{
  element: <RequireRole allowedRoles={["Sales"]} />,
  children: [
    {
      path: "sales",
      element: <SalesLayout />,
      children: [
        { index: true, element: <SalesOverviewScreen /> },
        { path: "orders", element: <SalesOrdersScreen /> },
        { path: "orders/:id", element: <SalesOrderDetailScreen /> },
        { path: "return-refund", element: <ReturnRefundScreen /> },
        { path: "return-refund/:ticketId", element: <TicketDetailScreen /> },
        { path: "warranty", element: <WarrantyScreen /> },
        { path: "warranty/:ticketId", element: <TicketDetailScreen /> },
      ],
    },
  ],
}
```

### **Operations Routes** (Lines 96-109):
```tsx
{
  element: <RequireRole allowedRoles={["Operations"]} />,
  children: [
    {
      path: "operations",
      element: <OperationsLayout />,
      children: [
        { index: true, element: <Navigate to="/operations/pack" replace /> },
        { path: "pack", element: <PackScreen /> },
        { path: "create-shipment", element: <CreateShipmentScreen /> },
        { path: "tracking", element: <TrackingScreen /> },
        { path: "return-refund", element: <ReturnRefundInspectionScreen /> },
        { path: "return-refund/:ticketId", element: <TicketDetailScreen /> },
        { path: "warranty", element: <OperationsWarrantyScreen /> },
        { path: "warranty/:ticketId", element: <TicketDetailScreen /> },
        { path: "orders/:id", element: <OperationsOrderDetailScreen /> },
      ],
    },
  ],
}
```

---

## 8. Key Observations

### **Differences between Sales and Operations for Same Features:**

| Feature | Sales | Operations |
|---------|-------|-----------|
| **Return/Refund Title** | "Return / Refund Requests" | **"Return/Refund Inspection"** |
| **Page Component** | Uses TicketListScreen | Custom ReturnRefundInspectionScreen |
| **Icon** | AssignmentReturnIcon | AssignmentReturnIcon |
| **Statuses** | Pending, InProgress, Resolved, Rejected | Pending, Approved, Rejected |
| **Warranty Title** | "Warranty Requests" | **"Warranty"** |
| **Page Component** | Uses TicketListScreen | Custom OperationsWarrantyScreen |
| **Icon** | VerifiedUserIcon | VerifiedUserIcon |
| **Warranty Statuses** | Pending, InProgress, Resolved, Rejected | Pending, Repair, Replace, Rejected |

### **Sidebar Label Consistency:**

- **Sales Sidebar:** "Return / Refund" (with space and slash)
- **Operations Sidebar:** "Return/Refund Inspection" (without spaces, more descriptive)
- **Sales Sidebar:** "Warranty"
- **Operations Sidebar:** "Warranty"

---

## 9. Summary of Files Found

### **Layout & Navigation:**
- [app/layout/DashboardLayout.tsx](app/layout/DashboardLayout.tsx) - Main sidebar and navigation
- [app/layout/App.tsx](app/layout/App.tsx) - App wrapper
- [app/router/Routes.tsx](app/router/Routes.tsx) - Route configuration

### **Operations Pages:**
- [features/Operations/OperationsLayout.tsx](features/Operations/OperationsLayout.tsx) - Operations layout wrapper
- [features/Operations/screens/ReturnRefundInspectionScreen.tsx](features/Operations/screens/ReturnRefundInspectionScreen.tsx) - **Return/Refund Inspection**
- [features/Operations/screens/OperationsWarrantyScreen.tsx](features/Operations/screens/OperationsWarrantyScreen.tsx) - **Warranty**

### **Sales Pages:**
- [features/Sales/SalesLayout.tsx](features/Sales/SalesLayout.tsx) - Sales layout wrapper
- [features/Sales/screens/ReturnRefundScreen.tsx](features/Sales/screens/ReturnRefundScreen.tsx) - Return/Refund
- [features/Sales/screens/WarrantyScreen.tsx](features/Sales/screens/WarrantyScreen.tsx) - Warranty
- [features/Sales/screens/TicketListScreen.tsx](features/Sales/screens/TicketListScreen.tsx) - Shared ticket list component
