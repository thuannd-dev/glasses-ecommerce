# Products Management API Integration

## Overview
This implementation provides complete CRUD functionality for product management in the manager portal. It integrates with the backend `/api/products` endpoint using Axios.

## Features
- ✅ **List Products** - Display products with pagination, filtering, and search
- ✅ **View Details** - Modal dialog showing complete product information
- ✅ **Create Product** - Dialog form to add new products
- ✅ **Update Product** - Edit existing product information
- ✅ **Delete Product** - Remove products with confirmation dialog

## File Structure

```
src/
├── services/
│   ├── product.service.ts       # API service methods
│   └── product.types.ts         # TypeScript types and interfaces
│
├── features/products/
│   ├── ProductsPage.tsx         # Main products management page
│   ├── components/
│   │   ├── ProductDialog.tsx           # Create/Edit product form
│   │   ├── ProductDetailDialog.tsx    # View product details
│   │   └── DeleteConfirmDialog.tsx    # Delete confirmation
│   └── index.ts
│
└── app/router/
    └── Routes.tsx               # Router configuration (updated)
```

## API Endpoints

### Get All Products
```
GET /api/products?pageNumber=1&pageSize=10&search=...&brand=...&type=1&minPrice=0&maxPrice=1000
```

**Query Parameters:**
- `pageNumber` (int, default: 1)
- `pageSize` (int, default: 10)
- `search` (string) - Search by product name
- `categoryIds` (array of string) - Filter by categories
- `brand` (string) - Filter by brand
- `type` (int) - Product type (1=Glasses, 2=Contact Lens, 3=Accessories)
- `minPrice` (number) - Minimum price filter
- `maxPrice` (number) - Maximum price filter
- `status` (string) - Product status
- `sortBy` (int) - Sort column (0=default)
- `sortOrder` (int) - 0=asc, 1=desc

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "productName": "string",
      "type": 1,
      "brand": "string",
      "description": "string",
      "minPrice": 99.99,
      "maxPrice": 199.99,
      "totalQuantityAvailable": 50,
      "firstImage": {
        "id": "uuid",
        "imageUrl": "https://...",
        "altText": "string",
        "displayOrder": 1,
        "modelUrl": "https://..."
      },
      "category": {
        "id": "uuid",
        "name": "Sunglasses",
        "slug": "sunglasses",
        "description": "..."
      },
      "status": "Active",
      "createdDate": "2026-02-05T...",
      "updatedDate": "2026-02-05T..."
    }
  ],
  "totalCount": 100,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 10,
  "hasPreviousPage": false,
  "hasNextPage": true
}
```

### Get Product by ID
```
GET /api/products/{id}
```

### Create Product
```
POST /api/products
Content-Type: application/json

{
  "productName": "string",
  "type": 1,
  "brand": "string",
  "description": "string",
  "minPrice": 99.99,
  "maxPrice": 199.99,
  "categoryId": "uuid",
  "totalQuantityAvailable": 50
}
```

### Update Product
```
PUT /api/products/{id}
Content-Type: application/json

{
  "id": "uuid",
  "productName": "string",
  "type": 1,
  "brand": "string",
  "description": "string",
  "minPrice": 99.99,
  "maxPrice": 199.99,
  "categoryId": "uuid",
  "totalQuantityAvailable": 50,
  "status": "Active"
}
```

### Delete Product
```
DELETE /api/products/{id}
```

## Usage

### Access the Products Page
Navigate to `/products` in the manager portal (requires manager layout).

### Service Methods

```typescript
import { productService } from '@/services/product.service';

// Get products with filters
const response = await productService.getProducts({
  pageNumber: 1,
  pageSize: 10,
  search: 'aviator',
  type: 1,
  minPrice: 50,
  maxPrice: 500,
});

// Get single product
const product = await productService.getProductById(productId);

// Create product
const newProduct = await productService.createProduct({
  productName: 'Classic Aviator',
  type: 1,
  brand: 'RayBan',
  description: '...',
  minPrice: 99.99,
  maxPrice: 199.99,
  categoryId: 'category-uuid',
  totalQuantityAvailable: 50,
});

// Update product
const updated = await productService.updateProduct({
  id: productId,
  productName: 'Updated Name',
  // ... other fields
});

// Delete product
await productService.deleteProduct(productId);
```

## UI Components

### ProductsPage
Main page component with:
- Product table with image, name, type, brand, price range, quantity
- Search by product name
- Filter by product type
- Pagination (5, 10, 25 items per page)
- Action buttons: View Details, Edit, Delete

### ProductDialog
Create/Edit form with:
- Product Name (required)
- Type dropdown (Glasses, Contact Lens, Accessories)
- Brand (optional)
- Description (optional)
- Minimum Price (required)
- Maximum Price (optional)
- Category ID (required)
- Quantity Available (required)
- Form validation

### ProductDetailDialog
Detailed product information view:
- Product image with lightbox
- Name, type, brand, prices, category
- Description
- Quantity and status chips
- Created/Updated dates

### DeleteConfirmDialog
Confirmation dialog with warning icon and delete button

## Styling
- Green accent color: `#2ecc71`
- Smooth transitions: `cubic-bezier(0.4, 0, 0.2, 1)`
- Responsive design for mobile/tablet/desktop
- Material UI components with custom theming

## Error Handling
- Try-catch blocks for all API calls
- Toast notifications for success/error messages
- Form validation with react-hook-form
- Loading states and spinners

## Integration with Manager Layout
The Products page is integrated into the manager portal with:
- Sidebar navigation menu item with Inventory icon
- Route: `/products` under manager layout
- Consistent styling and layout with other manager pages
- Full-width responsive design

## Environment Variables
The API base URL is configured in `VITE_API_URL` environment variable.

Default: `https://glasses-ecommerce.azurewebsites.net`

## Notes
- All types are TypeScript strict with type-only imports
- Service layer handles all API communication via Axios with interceptors
- State management uses React hooks (useState, useEffect)
- No external state management library required for this feature
