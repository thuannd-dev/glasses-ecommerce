import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { lazy, Suspense } from "react";
import type { ReactElement } from "react";
import App from "../layout/App";
import AuthLayout from "../layout/AuthLayout";

import Counter from "../../features/counter/Counter";

import CollectionLandingPage from "../../features/collections/CollectionLandingPage";
import CollectionPage from "../../features/collections/CollectionPage";
import ProductDetailPage from "../../features/collections/ProductDetailPage";
import SelectLensesPage from "../../features/collections/SelectLensesPage";

import LoginForm from "../../features/account/LoginForm";
import RegisterForm from "../../features/account/RegisterForm";
import PostLoginRedirect from "../../features/account/PostLoginRedirect";
import ForgotPasswordForm from "../../features/account/ForgotPasswordForm";
import ResetPasswordForm from "../../features/account/ResetPasswordForm";

import TestErrors from "../../features/errors/TestErrors";
import NotFound from "../../features/errors/NotFound";
import ServerError from "../../features/errors/ServerError";

import CartPage from "../../features/cart/CartPage";

import CheckoutPage from "../../features/checkout/CheckoutPage";
import OrderSuccessPage from "../../features/collections/OrderSuccessPage";
import PaymentResultPage from "../../features/payment/PaymentResultPage";
import OrdersPage from "../../features/orders/OrdersPage";
import OrderDetailPage from "../../features/orders/OrderDetailPage";
import ProfilePage from "../../features/Customer/profile/ProfilePage";
import RequireRole from "./RequireRole";
import SalesLayout from "../../features/Sales/SalesLayout";
import { OverviewScreen as SalesOverviewScreen } from "../../features/Sales/screens/OverviewScreen";
import { OrdersScreen as SalesOrdersScreen } from "../../features/Sales/screens/OrdersScreen";
import { TicketsScreen as SalesTicketsScreen } from "../../features/Sales/screens/TicketsScreen";
import AdminDashboard from "../../features/Admin/AdminDashboard";
import AdminLayout from "../../features/Admin/AdminLayout";
import RoleManagement from "../../features/Admin/RoleManagement";
import AdminPolicies from "../../features/Admin/AdminPolicies";
import {
  PoliciesGuaranteePage,
  PoliciesLensReplacementPage,
} from "../../features/policies/PoliciesListPage";
import AdminFeatureToggles from "../../features/Admin/AdminFeatureToggles";

const OperationsLayout = lazy(
  () => import("../../features/Operations/OperationsLayout"),
);
const PackScreen = lazy(() =>
  import("../../features/Operations/screens/PackScreen").then((m) => ({
    default: m.PackScreen,
  })),
);
const CreateShipmentScreen = lazy(() =>
  import("../../features/Operations/screens/CreateShipmentScreen").then(
    (m) => ({ default: m.CreateShipmentScreen }),
  ),
);
const TrackingScreen = lazy(() =>
  import("../../features/Operations/screens/TrackingScreen").then((m) => ({
    default: m.TrackingScreen,
  })),
);
const InTransitScreen = lazy(() =>
  import("../../features/Operations/screens/InTransitScreen").then((m) => ({
    default: m.InTransitScreen,
  })),
);
const CompletedOrdersScreen = lazy(() =>
  import("../../features/Operations/screens/CompletedOrdersScreen").then(
    (m) => ({ default: m.CompletedOrdersScreen }),
  ),
);
const OrderTypeAllScreen = lazy(() =>
  import("../../features/Operations/screens/OrderTypeAllScreen").then((m) => ({
    default: m.OrderTypeAllScreen,
  })),
);
const StandardScreen = lazy(() =>
  import("../../features/Operations/screens/StandardScreen").then((m) => ({
    default: m.StandardScreen,
  })),
);
const PreOrderScreen = lazy(() =>
  import("../../features/Operations/screens/PreOrderScreen").then((m) => ({
    default: m.PreOrderScreen,
  })),
);
const PrescriptionScreen = lazy(() =>
  import("../../features/Operations/screens/PrescriptionScreen").then((m) => ({
    default: m.PrescriptionScreen,
  })),
);
const OperationsTicketsScreen = lazy(() =>
  import("../../features/Operations/screens/OperationsTicketsScreen").then(
    (m) => ({ default: m.OperationsTicketsScreen }),
  ),
);
const StockInventoryScreen = lazy(() =>
  import("../../features/Operations/screens/StockInventoryScreen").then(
    (m) => ({ default: m.StockInventoryScreen }),
  ),
);
const InboundInventoryScreen = lazy(() =>
  import("../../features/Operations/screens/InboundInventoryScreen").then(
    (m) => ({ default: m.InboundInventoryScreen }),
  ),
);
const OutboundInventoryScreen = lazy(() =>
  import("../../features/Operations/screens/OutboundInventoryScreen").then(
    (m) => ({ default: m.OutboundInventoryScreen }),
  ),
);
const InventoryTransactionsScreen = lazy(() =>
  import("../../features/Operations/screens/InventoryTransactionsScreen").then(
    (m) => ({ default: m.InventoryTransactionsScreen }),
  ),
);
const GHNWebhookSimulatorScreen = lazy(() =>
  import("../../features/Operations/screens/GHNWebhookSimulatorScreen").then(
    (m) => ({ default: m.GHNWebhookSimulatorScreen }),
  ),
);

const ManagerLayout = lazy(
  () => import("../../features/Manager/ManagerLayout"),
);
const ManagerDashboard = lazy(
  () => import("../../features/Manager/ManagerDashboard"),
);
const ProductsList = lazy(() => import("../../features/Manager/ProductsList"));
const ManagerProductEdit = lazy(
  () => import("../../features/Manager/ProductDetail"),
);
const ManagerProductCreateWizardScreen = lazy(
  () =>
    import("../../features/Manager/screens/ManagerProductCreateWizardScreen"),
);
const InboundRecordsScreen = lazy(
  () => import("../../features/Manager/screens/InboundRecordsScreen"),
);
const InboundRecordDetailScreen = lazy(
  () => import("../../features/Manager/screens/InboundRecordDetailScreen"),
);
const PromotionsScreen = lazy(
  () => import("../../features/Manager/screens/PromotionsScreen"),
);
const PreOrderSummaryScreen = lazy(
  () => import("../../features/Manager/screens/PreOrderSummaryScreen"),
);

function lazyElement(element: ReactElement): ReactElement {
  return <Suspense fallback={null}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  // ======================
  // AUTH (NO NAVBAR)
  // ======================
  {
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginForm /> },
      { path: "register", element: <RegisterForm /> },
      { path: "forgot-password", element: <ForgotPasswordForm /> },
      { path: "reset-password", element: <ResetPasswordForm /> },
      { path: "auth/redirect", element: <PostLoginRedirect /> },
    ],
  },

  // ======================
  // SELECT LENSES (NO NAVBAR)
  // ======================
  {
    path: "/product/:id/lenses",
    element: <SelectLensesPage />,
  },

  // ======================
  // APP (WITH NAVBAR)
  // ======================
  {
    path: "/",
    element: <App />,
    children: [
      // Landing page (was /collections)
      { index: true, element: <CollectionLandingPage /> },

      // ======================
      // ROLE-BASED AREAS
      // ======================
      {
        element: <RequireRole allowedRoles={["Sales"]} />,
        children: [
          {
            path: "sales",
            element: <SalesLayout />,
            children: [
              { index: true, element: <SalesOverviewScreen /> },
              { path: "orders", element: <SalesOrdersScreen /> },
              { path: "tickets", element: <SalesTicketsScreen /> },
            ],
          },
        ],
      },
      {
        element: <RequireRole allowedRoles={["Operations"]} />,
        children: [
          {
            path: "operations",
            element: lazyElement(<OperationsLayout />),
            children: [
              {
                index: true,
                element: <Navigate to="/operations/pack" replace />,
              },
              { path: "pack", element: lazyElement(<PackScreen />) },
              {
                path: "create-shipment",
                element: lazyElement(<CreateShipmentScreen />),
              },
              { path: "tracking", element: lazyElement(<TrackingScreen />) },
              { path: "in-transit", element: lazyElement(<InTransitScreen />) },
              {
                path: "completed",
                element: lazyElement(<CompletedOrdersScreen />),
              },
              {
                path: "order-types",
                element: lazyElement(<OrderTypeAllScreen />),
              },
              { path: "standard", element: lazyElement(<StandardScreen />) },
              { path: "pre-order", element: lazyElement(<PreOrderScreen />) },
              {
                path: "prescription",
                element: lazyElement(<PrescriptionScreen />),
              },
              {
                path: "tickets",
                element: lazyElement(<OperationsTicketsScreen />),
              },
              { path: "stock", element: lazyElement(<StockInventoryScreen />) },
              {
                path: "inbound",
                element: lazyElement(<InboundInventoryScreen />),
              },
              {
                path: "outbound",
                element: lazyElement(<OutboundInventoryScreen />),
              },
              {
                path: "inventory-transactions",
                element: lazyElement(<InventoryTransactionsScreen />),
              },
              {
                path: "ghn-webhook-simulator",
                element: lazyElement(<GHNWebhookSimulatorScreen />),
              },
            ],
          },
        ],
      },
      {
        element: <RequireRole allowedRoles={["Manager"]} />,
        children: [
          {
            path: "manager",
            element: lazyElement(<ManagerLayout />),
            children: [
              { index: true, element: lazyElement(<ManagerDashboard />) },
              { path: "products", element: lazyElement(<ProductsList />) },
              {
                path: "products/create",
                element: lazyElement(<ManagerProductCreateWizardScreen />),
              },
              { path: "products/:id", element: <ProductDetailPage /> },
              {
                path: "products/:id/edit",
                element: lazyElement(<ManagerProductEdit />),
              },
              {
                path: "inbound",
                element: lazyElement(<InboundRecordsScreen />),
              },
              {
                path: "inbound/:id",
                element: lazyElement(<InboundRecordDetailScreen />),
              },
              {
                path: "promotions",
                element: lazyElement(<PromotionsScreen />),
              },
              {
                path: "preorder-summary",
                element: lazyElement(<PreOrderSummaryScreen />),
              },
            ],
          },
        ],
      },
      {
        element: <RequireRole allowedRoles={["Admin"]} />,
        children: [
          {
            path: "admin",
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashboard /> },
              { path: "roles", element: <RoleManagement /> },
              { path: "policies", element: <AdminPolicies /> },
              { path: "feature-toggles", element: <AdminFeatureToggles /> },
            ],
          },
        ],
      },

      // Collections group
      {
        path: "collections",
        children: [
          // Keep /collections working, but redirect index to /
          { index: true, element: <Navigate replace to="/" /> }, // /collections
          { path: ":category", element: <CollectionPage /> }, // /collections/glasses
        ],
      },

      // Policies (customer-facing pages)
      { path: "policies", element: <PoliciesGuaranteePage /> },
      {
        path: "policies/guarantee",
        element: <Navigate replace to="/policies" />,
      },
      {
        path: "policies/lens-replacement",
        element: <PoliciesLensReplacementPage />,
      },

      // ✅ Product detail
      { path: "product/:id", element: <ProductDetailPage /> }, // /product/g1

      // Other pages
      { path: "counter", element: <Counter /> },
      { path: "profile", element: <ProfilePage /> },

      // Errors
      { path: "errors", element: <TestErrors /> },
      { path: "server-error", element: <ServerError /> },
      { path: "not-found", element: <NotFound /> },

      // Guest / customer
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "order-success", element: <OrderSuccessPage /> },
      { path: "payment/result", element: <PaymentResultPage /> },
      {
        path: "orders",
        element: <Outlet />,
        children: [
          { index: true, element: <OrdersPage /> },
          { path: ":id", element: <OrderDetailPage /> },
        ],
      },

      // Fallback — phải để cuối
      { path: "*", element: <Navigate replace to="/not-found" /> },
    ],
  },
]);
