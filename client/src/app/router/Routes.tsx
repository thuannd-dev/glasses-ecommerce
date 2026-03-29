import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { lazy, Suspense } from "react";
import type { ReactElement } from "react";
import App from "../layout/App";
import AuthLayout from "../layout/AuthLayout";
import RouteLoadingFallback from "./RouteLoadingFallback";

import Counter from "../../features/counter/Counter";
import RequireRole from "./RequireRole";

const CollectionLandingPage = lazy(
  () => import("../../features/collections/CollectionLandingPage"),
);
const CollectionPage = lazy(
  () => import("../../features/collections/CollectionPage"),
);
const ProductDetailPage = lazy(
  () => import("../../features/collections/ProductDetailPage"),
);
const SelectLensesPage = lazy(
  () => import("../../features/collections/SelectLensesPage"),
);

const LoginForm = lazy(() => import("../../features/account/LoginForm"));
const RegisterForm = lazy(() => import("../../features/account/RegisterForm"));
const PostLoginRedirect = lazy(
  () => import("../../features/account/PostLoginRedirect"),
);
const ForgotPasswordForm = lazy(
  () => import("../../features/account/ForgotPasswordForm"),
);
const ResetPasswordForm = lazy(
  () => import("../../features/account/ResetPasswordForm"),
);

const TestErrors = lazy(() => import("../../features/errors/TestErrors"));
const NotFound = lazy(() => import("../../features/errors/NotFound"));
const ServerError = lazy(() => import("../../features/errors/ServerError"));

const CartPage = lazy(() => import("../../features/cart/CartPage"));
const CheckoutPage = lazy(() => import("../../features/checkout/CheckoutPage"));
const OrderSuccessPage = lazy(
  () => import("../../features/collections/OrderSuccessPage"),
);
const PaymentResultPage = lazy(
  () => import("../../features/payment/PaymentResultPage"),
);
const OrdersPage = lazy(() => import("../../features/orders/OrdersPage"));
const OrderDetailPage = lazy(
  () => import("../../features/orders/OrderDetailPage"),
);
const ProfilePage = lazy(
  () => import("../../features/Customer/profile/ProfilePage"),
);

const SalesLayout = lazy(() => import("../../features/Sales/SalesLayout"));
const SalesOverviewScreen = lazy(() =>
  import("../../features/Sales/screens/OverviewScreen").then((m) => ({
    default: m.OverviewScreen,
  })),
);
const SalesOrdersScreen = lazy(() =>
  import("../../features/Sales/screens/OrdersScreen").then((m) => ({
    default: m.OrdersScreen,
  })),
);
const SalesTicketsScreen = lazy(() =>
  import("../../features/Sales/screens/TicketsScreen").then((m) => ({
    default: m.TicketsScreen,
  })),
);

const AdminDashboard = lazy(
  () => import("../../features/Admin/AdminDashboard"),
);
const AdminLayout = lazy(() => import("../../features/Admin/AdminLayout"));
const RoleManagement = lazy(
  () => import("../../features/Admin/RoleManagement"),
);
const AdminPolicies = lazy(() => import("../../features/Admin/AdminPolicies"));
const PoliciesGuaranteePage = lazy(() =>
  import("../../features/policies/PoliciesListPage").then((m) => ({
    default: m.PoliciesGuaranteePage,
  })),
);
const PoliciesLensReplacementPage = lazy(() =>
  import("../../features/policies/PoliciesListPage").then((m) => ({
    default: m.PoliciesLensReplacementPage,
  })),
);
const AdminFeatureToggles = lazy(
  () => import("../../features/Admin/AdminFeatureToggles"),
);

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
  return <Suspense fallback={<RouteLoadingFallback />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  // ======================
  // AUTH (NO NAVBAR)
  // ======================
  {
    element: <AuthLayout />,
    children: [
      { path: "login", element: lazyElement(<LoginForm />) },
      { path: "register", element: lazyElement(<RegisterForm />) },
      {
        path: "forgot-password",
        element: lazyElement(<ForgotPasswordForm />),
      },
      { path: "reset-password", element: lazyElement(<ResetPasswordForm />) },
      { path: "auth/redirect", element: lazyElement(<PostLoginRedirect />) },
    ],
  },

  // ======================
  // SELECT LENSES (NO NAVBAR)
  // ======================
  {
    path: "/product/:id/lenses",
    element: lazyElement(<SelectLensesPage />),
  },

  // ======================
  // APP (WITH NAVBAR)
  // ======================
  {
    path: "/",
    element: <App />,
    children: [
      // Landing page (was /collections)
      { index: true, element: lazyElement(<CollectionLandingPage />) },

      // ======================
      // ROLE-BASED AREAS
      // ======================
      {
        element: <RequireRole allowedRoles={["Sales"]} />,
        children: [
          {
            path: "sales",
            element: lazyElement(<SalesLayout />),
            children: [
              { index: true, element: lazyElement(<SalesOverviewScreen />) },
              { path: "orders", element: lazyElement(<SalesOrdersScreen />) },
              { path: "tickets", element: lazyElement(<SalesTicketsScreen />) },
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
              {
                path: "products/:id",
                element: lazyElement(<ProductDetailPage />),
              },
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
            element: lazyElement(<AdminLayout />),
            children: [
              { index: true, element: lazyElement(<AdminDashboard />) },
              { path: "roles", element: lazyElement(<RoleManagement />) },
              { path: "policies", element: lazyElement(<AdminPolicies />) },
              {
                path: "feature-toggles",
                element: lazyElement(<AdminFeatureToggles />),
              },
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
          { path: ":category", element: lazyElement(<CollectionPage />) }, // /collections/glasses
        ],
      },

      // Policies (customer-facing pages)
      { path: "policies", element: lazyElement(<PoliciesGuaranteePage />) },
      {
        path: "policies/guarantee",
        element: <Navigate replace to="/policies" />,
      },
      {
        path: "policies/lens-replacement",
        element: lazyElement(<PoliciesLensReplacementPage />),
      },

      // ✅ Product detail
      { path: "product/:id", element: lazyElement(<ProductDetailPage />) }, // /product/g1

      // Other pages
      { path: "counter", element: <Counter /> },
      { path: "profile", element: lazyElement(<ProfilePage />) },

      // Errors
      { path: "errors", element: lazyElement(<TestErrors />) },
      { path: "server-error", element: lazyElement(<ServerError />) },
      { path: "not-found", element: lazyElement(<NotFound />) },

      // Guest / customer
      { path: "cart", element: lazyElement(<CartPage />) },
      { path: "checkout", element: lazyElement(<CheckoutPage />) },
      { path: "order-success", element: lazyElement(<OrderSuccessPage />) },
      { path: "payment/result", element: lazyElement(<PaymentResultPage />) },
      {
        path: "orders",
        element: <Outlet />,
        children: [
          { index: true, element: lazyElement(<OrdersPage />) },
          { path: ":id", element: lazyElement(<OrderDetailPage />) },
        ],
      },

      // Fallback — phải để cuối
      { path: "*", element: <Navigate replace to="/not-found" /> },
    ],
  },
]);
