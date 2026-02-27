## Glasses E‑commerce – API Overview

This frontend talks to a REST API (base URL configured in `VITE_API_URL`).  
Below is a summary of the endpoints that are currently used by the app.

### Auth & Account

- **GET `/account/user-info`**  
  Returns the current authenticated user and their roles.

- **POST `/login?useCookies=true`**  
  Logs the user in. Expects body:
  ```json
  { "email": "string", "password": "string" }
  ```
  Sets an auth cookie used for subsequent requests.

- **POST `/account/register`**  
  Registers a new user. Body matches `RegisterSchema`:
  ```json
  { "email": "string", "displayName": "string", "password": "string" }
  ```

- **POST `/account/logout`**  
  Logs the user out and clears the auth cookie.

### Profile

- **GET `/profiles/{userId}`**  
  Returns the public profile for a user, used on the **Profile** page.  
  Response shape matches the `Profile` type in `src/lib/types/index.d.ts`.

### Products & Categories

- **GET `/products`**  
  Returns a paginated product list. Supports query params (all optional):
  - `pageNumber` (number, default 1)
  - `pageSize` (number, default 10; UI usually uses 8)
  - `categoryIds` (array of string IDs)
  - `brand` (string)
  - `status` (string or number)
  - `type` (string or number)
  - `minPrice`, `maxPrice` (number)
  - `search` (string, free text)
  - `sortBy` (number, 0 = featured, 1 = price)
  - `sortOrder` (number, 0 = asc, 1 = desc)

- **GET `/products/{id}`**  
  Returns detailed product information including variants and images.

- **GET `/categories`**  
  Returns list of product categories:
  ```json
  [{ "id": "string", "name": "string", "slug": "string", "description": "string|null" }]
  ```

### Cart

All cart endpoints require the user to be authenticated (cookie-based session).

- **GET `/carts`**  
  Returns the current user cart with items, totals, and availability.

- **POST `/carts/items`**  
  Adds an item to the cart. Body:
  ```json
  { "productVariantId": "string", "quantity": 1 }
  ```

- **PUT `/carts/items/{id}`**  
  Updates quantity of an existing cart item. Body:
  ```json
  { "quantity": 1 }
  ```

- **DELETE `/carts/items/{id}`**  
  Removes a single item from the cart.

- **DELETE `/carts`**  
  Clears the entire cart.

### Orders (planned from UI)

The checkout flow is currently implemented on the frontend and expects an order API.

- **POST `/orders`**  
  Create a new order from the current cart. Expected body (from `CheckoutPage`):
  ```json
  {
    "orderCode": "string",
    "orderStatus": "PENDING | ...",
    "totalAmount": 0,
    "paymentMethod": "COD | ...",
    "address": {
      "recipientName": "string",
      "recipientPhone": "string",
      "venue": "string",
      "ward": "string",
      "district": "string",
      "city": "string",
      "postalCode": "string|null",
      "orderNote": "string|null"
    },
    "items": [
      { "productId": "string", "name": "string", "price": 0, "quantity": 1 }
    ],
    "createdAt": "ISO-8601 string"
  }
  ```

- **GET `/orders/{orderCode}`** (recommended)  
  Fetch a single order by code, so `OrderSuccessPage` and future order-history pages can reload data even after refresh.

### Additional recommended endpoints

These endpoints are not yet called directly in the frontend, but they match the current UI and role-based dashboards and will be useful for a complete backend:

#### Customer order history

- **GET `/orders`**  
  Returns a paginated list of orders for the current authenticated customer.  
  Suggested query params: `pageNumber`, `pageSize`, `status`, `fromDate`, `toDate`.

- **GET `/orders/{orderId}`**  
  Returns full order details (items, shipping address, status timeline) for a single order.

#### Address book (for checkout UX)

- **GET `/account/addresses`**  
  List saved shipping addresses for the current user.

- **POST `/account/addresses`**  
  Create a new address (same shape as `ShippingAddress` in `CheckoutPage`).

- **PUT `/account/addresses/{id}`**  
  Update an existing address.

- **DELETE `/account/addresses/{id}`**  
  Remove an address.

#### Product management (for Admin / Manager roles)

- **POST `/products`**  
  Create a new product (base info + variants).

- **PUT `/products/{id}`**  
  Update product info (name, brand, category, status, etc.).

- **POST `/products/{id}/variants`**  
  Add a new variant to an existing product.

- **PUT `/products/variants/{variantId}`**  
  Update a specific variant (price, stock, attributes).

- **DELETE `/products/variants/{variantId}`**  
  Soft delete / deactivate a variant.

#### Inventory & operations

- **GET `/inventory/summary`**  
  Summary of stock levels per product/variant for the Operations dashboard.

- **PUT `/inventory/adjustments`**  
  Bulk adjust stock for one or more variants:
  ```json
  {
    "items": [
      { "variantId": "string", "delta": -2 },
      { "variantId": "string", "delta": 5 }
    ]
  }
  ```

#### Sales & analytics (for Sales / Manager / Admin dashboards)

- **GET `/analytics/sales/overview`**  
  Returns high-level metrics (today revenue, orders in progress, conversion rates, etc.).

- **GET `/analytics/sales/by-product`**  
  Returns top-performing products for a given period.

- **GET `/analytics/sales/funnel`**  
  Returns steps for visitor → add-to-cart → purchase funnel used in the Sales dashboard.

#### Authentication & security extras

- **POST `/account/forgot-password`**  
  Request a password reset email for a given email address.

- **POST `/account/reset-password`**  
  Reset password using a token from the reset email.

- **POST `/account/change-password`**  
  Change password for a logged-in user (oldPassword, newPassword).

- **POST `/auth/refresh-token`**  
  Issue a new access token / refresh session if you move away from cookie-only auth.

#### Customer experience

- **GET `/products/{id}/recommendations`**  
  Recommended / related products for a given product (used for carousels like “You may also like”).

- **GET `/search/suggestions`**  
  Returns keyword suggestions while the user types in the search box.
  Suggested query params: `q` (query string), `limit`.

- **GET `/reviews`** with filters or **GET `/products/{id}/reviews`**  
  Returns product reviews for ratings UI.

- **POST `/products/{id}/reviews`**  
  Create a review for a product (rating, comment, etc.), authenticated customer only.

- **POST `/wishlist/items`** / **DELETE `/wishlist/items/{id}`** / **GET `/wishlist`**  
  Basic wishlist feature for logged-in customers.

#### Marketing & promotions

- **GET `/promotions/active`**  
  List current promotions (banners, discount campaigns) for the homepage and collections.

- **POST `/promotions`**, **PUT `/promotions/{id}`**, **DELETE `/promotions/{id}`**  
  Admin endpoints to manage promotions.

- **GET `/coupons/validate?code=XYZ`**  
  Validate a coupon code during checkout and return discount info.

#### Admin & roles

- **GET `/admin/users`**  
  List users with pagination and filters (role, status, email).

- **PUT `/admin/users/{id}/roles`**  
  Update roles for a given user (e.g., add/remove Admin, Sales, Operations).

- **PUT `/admin/users/{id}/lock`** / **PUT `/admin/users/{id}/unlock`**  
  Lock or unlock a user account.

### Error Testing (Dev Only)

Used by `TestErrors` page to manually trigger server errors:

- **GET `/buggy/not-found`** – should return 404.  
- **GET `/buggy/server-error`** – should return 500.  
- **GET `/buggy/bad-request`** – should return 400.  
- **GET `/buggy/unauthorised`** – should return 401.

> If you add new features (orders, profile update, etc.), extend this list so backend and frontend stay in sync.
