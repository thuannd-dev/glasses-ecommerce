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
import PostLoginRedirect from "../../features/account/PostLoginRedirect";

import TestErrors from "../../features/errors/TestErrors";
import NotFound from "../../features/errors/NotFound";
import ServerError from "../../features/errors/ServerError";

import CartPage from "../../features/cart/CartPage";

import CheckoutPage from "../../features/checkout/CheckoutPage";
import OrderSuccessPage from "../../features/checkout/OrderSuccessPage";
import SaleSupportPage from "../../features/staff/sale-support/SaleSupportPage";
import OperationPage from "../../features/staff/operation/OperationPage";
import ProfilePage from "../../features/Customer/profile/ProfilePage";
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

      // Staff pages
      { path: "staff/sale-support", element: <SaleSupportPage /> },
      { path: "staff/operation", element: <OperationPage /> },

      // Customer pages
      { path: "profile", element: <ProfilePage /> },

      // Other pages
      { path: "counter", element: <Counter /> },

      // Errors
      { path: "errors", element: <TestErrors /> },
      { path: "server-error", element: <ServerError /> },
      { path: "not-found", element: <NotFound /> },

      // Cart & Checkout (guest)
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "order-success", element: <OrderSuccessPage /> },

      // Fallback
      { path: "*", element: <Navigate replace to="/not-found" /> },
    ],
  },
]);
