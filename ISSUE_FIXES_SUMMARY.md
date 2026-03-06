# Issues Fixed

## Issue 1: Ticket Confirmation Returns 404 Error ✅ FIXED

### Problem
When confirming or rejecting a Return/Refund ticket, the system returned "Request failed with status code 404".

### Root Cause
The frontend was calling a non-existent endpoint:
- ❌ `PUT /staff/after-sales/{id}/status` (doesn't exist)

The backend actually provides these specific endpoints:
- ✅ `PUT /staff/after-sales/{id}/approve` - For confirming tickets
- ✅ `PUT /staff/after-sales/{id}/reject` - For rejecting tickets

### Solution Applied
Updated `client/src/lib/hooks/useStaffAfterSalesTickets.ts`:
- Modified `UpdateTicketStatusPayload` to use `actionType: "approve" | "reject"` instead of `status`
- Updated `updateTicketStatus()` function to call the correct endpoints based on action type
- For approve: Sends `ApproveTicketDto` with `resolutionType`, `refundAmount`, and `staffNotes`
- For reject: Sends `RejectTicketDto` with `reason`

Updated `client/src/features/Sales/screens/TicketDetailScreen.tsx`:
- Modified `handleSubmit()` to pass the correct `actionType` ("approve"  or "reject")

---

## Issue 2: Order Confirmation Returns Server Error ⚠️ REQUIRES DATABASE MIGRATION

### Problem
When confirming an order, the system returns server error with a stacktrace mentioning:
- "Invalid column name 'useById'"
- "Invalid column name 'IsPublic'"

### Root Cause
This appears to be a database schema synchronization issue. The codebase expects certain columns that may not exist in the current database.

### Solution
**You need to apply all pending Entity Framework Core migrations:**

```bash
cd c:\Users\Admin\Desktop\MAIN\glasses-ecommerce
dotnet ef database update --project Persistence --startup-project API
```

This will apply any pending migrations that sync the database schema with the latest code changes.

### Key Points
- The Stock entity in the code expects an `UpdatedBy` column to track who last modified stock
- The Promotion entity expects an `IsPublic` column
- These columns may not exist in your current database if migrations aren't up to date
- Migrations available:
  - `20260306113854_AddIsPublicToPromotion.cs` - Adds IsPublic to Promotion
  - `20260302075854_AddPreOrderSupport.cs` - Adds QuantityPreOrdered to Stock
  - And others that have been applied

---

## Files Modified

1. **client/src/lib/hooks/useStaffAfterSalesTickets.ts**
   - Updated endpoint paths and request payloads

2. **client/src/features/Sales/screens/TicketDetailScreen.tsx**
   - Updated handleSubmit to use correct action types

---

## Testing

### Test Ticket Confirmation
1. Navigate to Sales → Return/Refund
2. Click on a pending ticket
3. Click "Confirm" or "Reject" button
4. Should now work without 404 error

### Test Order Confirmation
1. After running migrations, navigate to Sales → Orders
2. Click on a pending order
3. Click "Confirm" button
4. Should now work without server error

---

## Additional Notes

The ticket API uses a more complex flow:
- **Confirm** = Approve ticket with resolution type
- **Reject** = Reject ticket with rejection reason

Make sure to have the latest database migrations applied to avoid schema mismatch errors with inventory operations.
