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

### Error Testing (Dev Only)

Used by `TestErrors` page to manually trigger server errors:

- **GET `/buggy/not-found`** – should return 404.  
- **GET `/buggy/server-error`** – should return 500.  
- **GET `/buggy/bad-request`** – should return 400.  
- **GET `/buggy/unauthorised`** – should return 401.

> If you add new features (orders, profile update, etc.), extend this list so backend and frontend stay in sync.
