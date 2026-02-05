import { createBrowserRouter, Navigate } from "react-router";
import App from "../layout/App";
import AuthLayout from "../layout/AuthLayout";

import HomePage from "../../features/home/HomePage";
import Counter from "../../features/counter/Counter";

import CollectionLandingPage from "../../features/collections/CollectionLandingPage";
import CollectionPage from "../../features/collections/CollectionPage";
import ProductDetailPage from "../../features/collections/ProductDetailPage";

import LoginForm from "../../features/account/LoginForm";
import RegisterForm from "../../features/account/RegisterForm";

import TestErrors from "../../features/errors/TestErrors";
import NotFound from "../../features/errors/NotFound";
import ServerError from "../../features/errors/ServerError";

import CartPage from "../../features/cart/CartPage";

import CheckoutPage from "../../features/checkout/CheckoutPage";
import OrderSuccessPage from "../../features/checkout/OrderSuccessPage";

import ManagerDashboard from "../../features/manager";
import InboundApprovalPage from "../../features/inbound-approval";
import { AfterSalesApprovalPage } from "../../features/after-sales-approval";
import { ProductsPage } from "../../features/products";
import { ManagerLayout } from "../../features/manager/layout";


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
    ],
  },

  // ======================
  // APP (WITH NAVBAR)
  // ======================
  {
    path: "/",
    element: <App />,
    children: [
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


      // Manager Section (with sidebar layout)
      {
        element: <ManagerLayout />,
        children: [
          { path: "manager", element: <ManagerDashboard /> },
          { path: "inbound-approval", element: <InboundApprovalPage /> },
          { path: "after-sales-approval", element: <AfterSalesApprovalPage /> },
          { path: "products", element: <ProductsPage /> },
        ],
      },


      // Errors
      { path: "errors", element: <TestErrors /> },
      { path: "server-error", element: <ServerError /> },
      { path: "not-found", element: <NotFound /> },

      // Fallback
      { path: "*", element: <Navigate replace to="/not-found" /> },

      //guest
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "order-success", element: <OrderSuccessPage /> },
    ],
  },
]);
