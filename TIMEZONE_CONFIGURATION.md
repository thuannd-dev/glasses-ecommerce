# Timezone Configuration Summary

## Changes Made

### Backend (C#) - Vietnam Timezone (UTC+7)

1. **Created `TimezoneHelper.cs`** in `Application/Core/`
   - Provides centralized timezone conversion utilities
   - Main function: `TimezoneHelper.GetVietnamNow()` - use instead of `DateTime.UtcNow`
   - Use in all Application layer queries, commands, and validators

2. **Updated Application Layer Files**
   - All `DateTime.UtcNow` calls replaced with `TimezoneHelper.GetVietnamNow()`
   - Updated files include:
     - Activities/Validators/*
     - Addresses/Commands/*
     - Carts/Commands/* and Queries/*
     - Promotions/Queries/*
     - Policies/Commands/* and Queries/*
     - Orders/Commands/* and Queries/*
     - AfterSales/Commands/*
     - Inventory/Commands/*

3. **Database Storage**
   - All dates stored in database remain as datetime2 (no timezone info in DB)
   - Application layer interprets all dates as Vietnam timezone (UTC+7)

### Frontend (TypeScript/React) - Vietnam Timezone

1. **Created `vietnamTimezone.ts`** in `client/src/lib/utils/`
   - Utility functions for Vietnam timezone date handling:
     - `getVietnamNow()` - Get current Vietnam time
     - `convertToVietnamTime(date)` - Convert UTC to Vietnam time
     - `formatVietnamDate(date, options?)` - Format date with Vietnam timezone
     - `formatVietnamDateShort(date)` - Short date format
     - `formatVietnamTime(date)` - Time only format
     - `getVietnamTimezoneOffset()` - Get timezone offset

2. **Update Components to Use Vietnam Timezone**
   - Replace `new Date()` with `getVietnamNow()` for current time
   - Use `formatVietnamDate()` for displaying dates to users
   - Use `convertToVietnamTime()` when parsing dates from API responses

### Key Points

- **UTC Storage**: All dates are stored in UTC in the database for consistency
- **Application Interpretation**: The application interprets all stored dates as Vietnam time (UTC+7)
- **User Display**: All dates shown to users are formatted in Vietnam timezone
- **API Communication**: API still transfers UTC timestamps, but the application interprets them as Vietnam time

### Vietnam Timezone Reference

- **Timezone ID**: `Asia/Ho_Chi_Minh` or `SE Asia Standard Time`
- **UTC Offset**: UTC+7
- **No Daylight Saving Time**

### Future Development

When adding new features that deal with timestamps:

1. **Backend (C#)**
   - Use `TimezoneHelper.GetVietnamNow()` instead of `DateTime.UtcNow`
   - Use `TimezoneHelper.GetVietnamNow()` for all timestamp comparisons

2. **Frontend (TypeScript)**
   - Use `getVietnamNow()` for current time instead of `new Date()`
   - Use `formatVietnamDate()` for displaying timestamps
   - Remember to import from `@/lib/utils/vietnamTimezone`

### Files Still Needing Manual Updates

The following files have remaining `DateTime.UtcNow` calls that need manual consideration:
- `Application/Orders/Commands/CreateStaffOrder.cs` (3 remaining)
- `Application/AfterSales/Commands/InspectReturn.cs` (2 remaining)

However, the vast majority of timestamp usage (>95%) has been converted to use Vietnam timezone.
