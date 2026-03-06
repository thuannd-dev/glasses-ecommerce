import { createBrowserRouter, Navigate, Outlet } from "react-router";
import App from "../layout/App";
import AuthLayout from "../layout/AuthLayout";

import HomePage from "../../features/home/HomePage";
import Counter from "../../features/counter/Counter";

import CollectionLandingPage from "../../features/collections/CollectionLandingPage";
import CollectionPage from "../../features/collections/CollectionPage";
import ProductDetailPage from "../../features/collections/ProductDetailPage";
import SelectLensesPage from "../../features/collections/SelectLensesPage";

import LoginForm from "../../features/account/LoginForm";
import RegisterForm from "../../features/account/RegisterForm";
import PostLoginRedirect from "../../features/account/PostLoginRedirect";

import TestErrors from "../../features/errors/TestErrors";
import NotFound from "../../features/errors/NotFound";
import ServerError from "../../features/errors/ServerError";

import CartPage from "../../features/cart/CartPage";

import CheckoutPage from "../../features/checkout/CheckoutPage";
import OrderSuccessPage from "../../features/collections/OrderSuccessPage";
import OrdersPage from "../../features/orders/OrdersPage";
import OrderDetailPage from "../../features/orders/OrderDetailPage";
import ProfilePage from "../../features/Customer/profile/ProfilePage";
import RequireRole from "./RequireRole";
import SalesLayout from "../../features/Sales/SalesLayout";
import { OverviewScreen as SalesOverviewScreen } from "../../features/Sales/screens/OverviewScreen";
import { OrdersScreen as SalesOrdersScreen } from "../../features/Sales/screens/OrdersScreen";
import { OrderDetailScreen as SalesOrderDetailScreen } from "../../features/Sales/screens/OrderDetailScreen";
import { ReturnRefundScreen } from "../../features/Sales/screens/ReturnRefundScreen";
import { WarrantyScreen } from "../../features/Sales/screens/WarrantyScreen";
import { TicketDetailScreen } from "../../features/Sales/screens/TicketDetailScreen";
import OperationsLayout from "../../features/Operations/OperationsLayout";
import {
  PackScreen,
  CreateShipmentScreen,
  TrackingScreen,
  ReturnRefundInspectionScreen,
  OperationsWarrantyScreen,
  OperationsOrderDetailScreen,
} from "../../features/Operations/screens";
import ManagerDashboard from "../../features/Manager/ManagerDashboard";
import AdminDashboard from "../../features/Admin/AdminDashboard";
import RoleManagement from "../../features/Admin/RoleManagement";
export const router = createBrowserRouter([
  // ======================
  // HOME (NO NAVBAR)
  // ======================
  {
    path: "/",
    element: <HomePage />,
  },

  // ======================
  // AUTH (NO NAVBAR)
  // ======================
  {
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginForm /> },
      { path: "register", element: <RegisterForm /> },
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
              { path: "orders/:id", element: <SalesOrderDetailScreen /> },
              { path: "return-refund", element: <ReturnRefundScreen /> },
              { path: "return-refund/:ticketId", element: <TicketDetailScreen /> },
              { path: "warranty", element: <WarrantyScreen /> },
              { path: "warranty/:ticketId", element: <TicketDetailScreen /> },
            ],
          },
        ],
      },
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
      },
      {
        element: <RequireRole allowedRoles={["Manager"]} />,
        children: [{ path: "manager", element: <ManagerDashboard /> }],
      },
      {
        element: <RequireRole allowedRoles={["Admin"]} />,
        children: [
          {
            path: "admin",
            element: <Outlet />,
            children: [
              { index: true, element: <AdminDashboard /> },
              { path: "roles", element: <RoleManagement /> },
            ],
          },
        ],
      },

      // Collections group
      {
        path: "collections",
        children: [
          { index: true, element: <CollectionLandingPage /> }, // /collections
          { path: ":category", element: <CollectionPage /> }, // /collections/glasses
        ],
      },

      // ✅ Product detail
      { path: "product/:id", element: <ProductDetailPage /> }, // /product/g1

      // Other pages
      { path: "counter", element: <Counter /> },
      {
        element: <RequireRole allowedRoles={["Customer"]} />,
        children: [{ path: "profile", element: <ProfilePage /> }],
      },

      // Errors
      { path: "errors", element: <TestErrors /> },
      { path: "server-error", element: <ServerError /> },
      { path: "not-found", element: <NotFound /> },

      // Guest / customer
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "order-success", element: <OrderSuccessPage /> },
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
