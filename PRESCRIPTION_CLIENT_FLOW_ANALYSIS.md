# Prescription Data Client-Side Flow Analysis

## Overview
The glasses ecommerce client collects prescription data through a dedicated `SelectLensesDialog` modal and stores it in session storage before sending to the API during checkout.

---

## 1. Prescription Types Definition
**File:** `client/src/lib/types/prescription.ts`

```typescript
/** One eye row in prescription (OD = 1 = Right, OS = 2 = Left) */
export type PrescriptionDetailRow = {
  eye: 1 | 2;
  sph: number | null;
  cyl: number | null;
  axis: number | null;
  pd: number | null;
  add: number | null;
};

export type PrescriptionData = {
  details: PrescriptionDetailRow[];
};

export const EYE_LABELS: Record<1 | 2, string> = {
  1: "OD (Right Eye)",
  2: "OS (Left Eye)",
};
```

---

## 2. CYL Field Definition & Value Options
**File:** `client/src/features/collections/components/ProductDetailPageComponents/SelectLensesDialog.tsx`

### CYL Options Building
```typescript
// CYL: -6.00 to +6.00 step 0.25
function buildCylOptions(): string[] {
    const out: string[] = [];
    for (let i = -24; i <= 24; i++) {
        out.push((i * 0.25).toFixed(2));
    }
    return out;
}
const CYL_OPTIONS = buildCylOptions();
```

**CYL Range:** -6.00 to +6.00 in 0.25 increments
- **Min:** -6.00
- **Max:** +6.00
- **Step:** 0.25
- **Total values:** 49 options (-24 to +24 iterations)

### Field Options Summary
| Field | Min | Max | Step | Notes |
|-------|-----|-----|------|-------|
| **SPH** | -20.00 | +12.00 | 0.25 | Built from i=-80 to i=48 |
| **CYL** | -6.00 | +6.00 | 0.25 | Built from i=-24 to i=24 |
| **AXIS** | 0 | 180 | 1 | Enabled only after SPH & CYL filled |
| **PD** | 53 | 180 | 1 | Can be single or dual values |
| **ADD** | (not shown in form) | — | — | Currently N/A in UI |

---

## 3. Form Initialization & Default Values
**File:** `SelectLensesDialog.tsx` – Lines 22-23

```typescript
const INITIAL_DETAILS: PrescriptionDetailRow[] = [
    { eye: 1, sph: null, cyl: null, axis: null, pd: null, add: null },
    { eye: 2, sph: null, cyl: null, axis: null, pd: null, add: null },
];
```

**Constructor/Initialization Flow:**
1. Component state initialized with TWO eyes (OD/Right and OS/Left)
2. All fields default to `null` (not `0.00`)
3. Reset on dialog reopen (useEffect with `open` dependency):
```typescript
useEffect(() => {
    if (open) {
        setStep("form");
        setDetails(INITIAL_DETAILS.map((d) => ({ ...d })));
        setPdSingle("");
        setPdLeft("");
        setPdRight("");
        setTwoPdNumbers(false);
    }
}, [open]);
```

---

## 4. CYL Input Field Collection
**File:** `SelectLensesDialog.tsx` – Lines 350-360

```typescript
<TableCell>
    <TextField
        select
        size="small"
        value={row.cyl != null ? row.cyl.toFixed(2) : "0.00"}
        onChange={(e) =>
            updateDetail(row.eye, "cyl", parseFloat(e.target.value))
        }
        sx={{ minWidth: 100 }}
        SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 280 } } } }}
    >
        {CYL_OPTIONS.map((opt) => (
            <MenuItem key={opt} value={opt}>
                {opt}
            </MenuItem>
        ))}
    </TextField>
</TableCell>
```

### CYL Collection Logic:
1. **Display Value:** `row.cyl != null ? row.cyl.toFixed(2) : "0.00"`
   - Shows `"0.00"` as placeholder when `null`
   - Shows actual value formatted to 2 decimals when set
2. **Input Type:** Dropdown (`select`) from `CYL_OPTIONS`
3. **Storage:** `updateDetail()` parses and stores as `number`
4. **Validation:** None at this field level (see section 6)

---

## 5. EyeType Handling
**Frontend Mapping (1=Right/OD, 2=Left/OS):**

In SelectLensesDialog:
```typescript
const INITIAL_DETAILS: PrescriptionDetailRow[] = [
    { eye: 1, sph: null, cyl: null, axis: null, pd: null, add: null },  // 1 = OD (Right)
    { eye: 2, sph: null, cyl: null, axis: null, pd: null, add: null },  // 2 = OS (Left)
];

export const EYE_LABELS: Record<1 | 2, string> = {
  1: "OD (Right Eye)",
  2: "OS (Left Eye)",
};
```

**Backend Mapping** (during checkout):
In `useCheckoutPage.ts` – Lines 168:
```typescript
prescriptionData = {
    details: referencePrescription.details.map((detail) => ({
        eye: detail.eye === 1 ? 2 : 1, // Map frontend (1=Right, 2=Left) to backend (2=Right, 1=Left)
        sph: detail.sph,
        cyl: detail.cyl,
        axis: detail.axis,
        pd: detail.pd,
        add: detail.add,
    })),
};
```

**⚠️ CRITICAL:** Frontend and backend use OPPOSITE conventions:
- **Frontend:** 1=Right, 2=Left
- **Backend:** 2=Right, 1=Left
- **Transformation:** Done at checkout time in `useCheckoutPage.ts`

---

## 6. Client-Side Validation for CYL Field

### Form Validation Rule
**File:** `SelectLensesDialog.tsx` – Lines 123-133

```typescript
const isPrescriptionFormValid = useMemo(() => {
    const bothEyesFilled = details.every(
        (row) => row.sph != null && row.cyl != null && row.axis != null
    );
    const pdFilled = twoPdNumbers
        ? pdRight !== "" && pdLeft !== ""
        : pdSingle !== "";
    return bothEyesFilled && pdFilled;
}, [details, twoPdNumbers, pdSingle, pdRight, pdLeft]);
```

**CYL Validation Requirements:**
1. **Must be filled:** `row.cyl != null` (cannot be null)
2. **Must NOT be empty string:** Dropdown always returns number or undefined
3. **No range validation in frontend:** Any value from CYL_OPTIONS is accepted
4. **Axis dependency:** Axis field is disabled until BOTH SPH AND CYL are not null:
   ```typescript
   disabled={row.sph == null || row.cyl == null}
   ```
   This prevents users from selecting Axis before CYL is filled.

### Validation at Checkout
**File:** `useCheckoutPage.ts` – Lines 154-188

```typescript
// VALIDATION: All items with prescriptions must have identical prescription details
const itemsWithPrescription = items.filter((item) => itemPrescriptions[item.id]);
const hasConflict = itemsWithPrescription.some((item) => {
    const itemPrescription = itemPrescriptions[item.id];
    if (!itemPrescription) return false;
    
    if (itemPrescription.details.length !== referencePrescription.details.length) {
        return true; // Conflict: different number of details
    }
    
    // Check each detail matches (including CYL)
    return itemPrescription.details.some((detail) => {
        const refDetail = referencePrescription.details.find((d) => d.eye === detail.eye);
        if (!refDetail) return true;
        
        return (
            detail.sph !== refDetail.sph ||
            detail.cyl !== refDetail.cyl ||      // ← CYL is checked here
            detail.axis !== refDetail.axis ||
            detail.pd !== refDetail.pd ||
            detail.add !== refDetail.add
        );
    });
});
```

**CYL Validation at Checkout:**
- All items in checkout must have **identical CYL values** for the same eye
- Error message: "All items with prescriptions must have identical prescription details..."
- No additional range validation (backend handles range validation)

---

## 7. Prescription Data Storage & Retrieval
**File:** `client/src/features/cart/prescriptionCache.ts`

```typescript
// Storage Keys
const STORAGE_KEY = "cartItemPrescriptions";           // By cart item ID
const STORAGE_KEY_BY_VARIANT = "cartPrescriptionByVariantId"; // By product variant

// Flow
export function setCartItemPrescription(cartItemId: string, prescription: PrescriptionData) {
  const cache = read(STORAGE_KEY);
  cache[cartItemId] = prescription;
  write(STORAGE_KEY, cache);
}

export function getCartItemPrescriptions(
  items: Array<{ id: string; productVariantId: string }>
): Record<string, PrescriptionData> {
  const byId = read(STORAGE_KEY);
  const byVariant = read(STORAGE_KEY_BY_VARIANT);
  const out: Record<string, PrescriptionData> = {};
  items.forEach((item) => {
    const prescription = byId[item.id] ?? byVariant[item.productVariantId];
    if (prescription) out[item.id] = prescription;
  });
  return out;
}
```

**Storage Type:** Session Storage (cleared when tab closes)
**Lookup Priority:** Cart item ID → Product variant ID (fallback)

---

## 8. Data Sent to API
**File:** `client/src/lib/types/order.ts`

```typescript
export interface PrescriptionDetailInputDto {
  eye: 1 | 2;           // Backend convention: 1=Left, 2=Right
  sph?: number | null;
  cyl?: number | null;  // ← CYL value sent here
  axis?: number | null;
  pd?: number | null;
  add?: number | null;
}

export interface CreateOrderPayload {
  addressId: string;
  paymentMethod: string;
  customerNote?: string | null;
  orderType: "ReadyStock" | "PreOrder" | "Prescription";
  selectedCartItemIds: string[];
  promoCode?: string | null;
  prescription?: PrescriptionInputDto | null;  // ← Full prescription object
}
```

### Checkout Transformation (useCheckoutPage.ts – Lines 168-175):
```typescript
prescriptionData = {
    details: referencePrescription.details.map((detail) => ({
        eye: detail.eye === 1 ? 2 : 1,  // ← Eye remapping: 1↔2
        sph: detail.sph,
        cyl: detail.cyl,                 // ← CYL passed as-is (numeric)
        axis: detail.axis,
        pd: detail.pd,
        add: detail.add,
    })),
};
```

**Example CYL Values Sent:**
- Input in form: Select "-6.00" → Sent: `-6.00` (as number)
- Input in form: Select "0.00" → Sent: `0.00` (as number)
- Input in form: Select "+3.50" → Sent: `3.50` (as number)

---

## 9. Order Type Determination
**File:** `useCheckoutPage.ts` – Lines 142-152

```typescript
// Determine order type based on whether items have custom prescriptions
const itemsWithPrescription = items.filter((item) => itemPrescriptions[item.id]);
const anyHasPrescription = itemsWithPrescription.length > 0;
const orderTypeValue = anyHasPrescription ? "Prescription" : "ReadyStock";
```

**Logic:**
1. If ANY cart item has a prescription in session storage → `orderType = "Prescription"`
2. If NO items have prescriptions → `orderType = "ReadyStock"`
3. Prescription data is ONLY sent to API when `orderType !== "Prescription"`

---

## 10. Complete Data Flow Diagram

```
┌─────────────────────────────────────────────┐
│ User selects product on Product Detail Page │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│ SelectLensesDialog Opens                     │
│ - Initializes two eyes (1=Right, 2=Left)    │
│ - All fields = null                          │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│ User Fills Prescription Form                 │
│ - Selects SPH, CYL from dropdowns            │
│ - CYL range: -6.00 to +6.00                  │
│ - AXIS becomes enabled after SPH+CYL filled  │
│ - Selects single or dual PD numbers          │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│ Client-Side Validation                       │
│ - Check: SPH != null AND CYL != null         │
│ - Check: AXIS != null (auto-enabled)         │
│ - Check: PD != "" (single or dual)           │
│ - Continue button enabled only if valid      │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│ User Confirms Prescription                   │
│ - Shows summary with formatted values        │
│ - User clicks YES                            │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│ Store in Session Storage                     │
│ - setCartItemPrescription(cartItemId, data)  │
│ - Data contains: eye, sph, cyl, axis, pd     │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│ Checkout Page                                │
│ - Retrieves prescriptions from storage       │
│ - itemPrescriptions[cartItemId] = prescription│
└──────────────┬──────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│ User Places Order                            │
│ - Validate all items have identical RX       │
│ - Map eye values: 1↔2 (frontend to backend)  │
│ - Transform to PrescriptionInputDto          │
│ - Send with CreateOrderPayload               │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│ API Receives                                 │
│ {                                            │
│   orderType: "Prescription",                 │
│   prescription: {                            │
│     details: [                               │
│       { eye: 2, sph: ..., cyl: -1.50, ... }, │
│       { eye: 1, sph: ..., cyl: -2.00, ... }  │
│     ]                                        │
│   }                                          │
│ }                                            │
└──────────────────────────────────────────────┘
```

---

## 11. Key Findings

### ✅ CYL Collection
- **Location:** `SelectLensesDialog.tsx` dropdown
- **Valid Range:** -6.00 to +6.00
- **Increment:** 0.25
- **Format:** String in dropdown, parsed to `number` on change
- **Display:** Shows "0.00" as placeholder when null

### ✅ CYL Validation
- **Client-side:** Check that CYL != null (not empty)
- **Client-side:** Check that all items in checkout have identical CYL per eye
- **Server-side:** API validates actual numeric range and precision

### ✅ EyeType Mapping
- **Frontend:** 1=Right (OD), 2=Left (OS)
- **Backend:** 1=Left (OS), 2=Right (OD)
- **Transformation:** Done in `useCheckoutPage.ts` during checkout

### ✅ Data Flow
1. Form collects→ Session Storage → Checkout retrieves → API transformation → API send

### ⚠️ Known Issues
- **"0.00" as default:** Displays "0.00" when null, but null values are accepted and required for validation
- **Eye mapping complexity:** Frontend and backend conventions differ; transformation happens at checkout
- **No CYL range validation on client:** Range checking deferred to backend
