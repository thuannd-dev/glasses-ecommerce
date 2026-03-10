# Prescription Data - Code References

## File 1: SelectLensesDialog.tsx
**Path:** `client/src/features/collections/components/ProductDetailPageComponents/SelectLensesDialog.tsx`

### CYL Options Definition (Lines 40-46)
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

### Initial Details (Lines 22-23)
```typescript
const INITIAL_DETAILS: PrescriptionDetailRow[] = [
    { eye: 1, sph: null, cyl: null, axis: null, pd: null, add: null },
    { eye: 2, sph: null, cyl: null, axis: null, pd: null, add: null },
];
```

### Component State (Lines 86-96)
```typescript
const [step, setStep] = useState<Step>("form");
const [details, setDetails] = useState<PrescriptionDetailRow[]>(() =>
    INITIAL_DETAILS.map((d) => ({ ...d }))
);
const [pdSingle, setPdSingle] = useState<string>("");
const [twoPdNumbers, setTwoPdNumbers] = useState(false);
const [pdLeft, setPdLeft] = useState<string>("");
const [pdRight, setPdRight] = useState<string>("");
```

### Dialog Reset on Open (Lines 107-115)
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

### Update Detail Function (Lines 117-123)
```typescript
const updateDetail = (eye: 1 | 2, field: keyof PrescriptionDetailRow, value: number | null) => {
    setDetails((prev) =>
        prev.map((row) =>
            row.eye === eye ? { ...row, [field]: value } : row
        )
    );
};
```

### Validation Logic (Lines 125-133)
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

### CYL Dropdown (Lines 346-361)
```tsx
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

### Axis Field (Disabled Until SPH & CYL Set) (Lines 362-371)
```tsx
<TableCell>
    <TextField
        select
        size="small"
        value={row.axis != null ? String(row.axis) : "0"}
        onChange={(e) =>
            updateDetail(row.eye, "axis", parseInt(e.target.value, 10))
        }
        disabled={row.sph == null || row.cyl == null}  // ← Requires CYL
        sx={{ minWidth: 72 }}
        SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 280 } } } }}
    >
        {AXIS_OPTIONS.map((opt) => (
            <MenuItem key={opt} value={opt}>
                {opt}
            </MenuItem>
        ))}
    </TextField>
</TableCell>
```

### Prescription Derivation (Lines 98-110)
```typescript
const prescription: PrescriptionData = useMemo(() => {
    const rows = details.map((row) => {
        const pdVal = twoPdNumbers
            ? row.eye === 1
                ? pdRight
                : pdLeft
            : pdSingle;
        const pdNum = pdVal === "" ? null : Number(pdVal);
        return {
            ...row,
            pd: pdNum === undefined || Number.isNaN(pdNum) ? null : pdNum,
        };
    });
    return { details: rows };
}, [details, pdSingle, pdLeft, pdRight, twoPdNumbers]);
```

---

## File 2: useCheckoutPage.ts
**Path:** `client/src/features/checkout/hooks/useCheckoutPage.ts`

### Prescription Validation at Checkout (Lines 154-188)
```typescript
// VALIDATION: All items with prescriptions must have identical prescription details
// Because 1 Order → 1 Prescription, and each eye can only have 1 detail
const referencePrescription = itemsWithPrescription[0] ? itemPrescriptions[itemsWithPrescription[0].id] : null;

if (referencePrescription) {
  // Check if all items with prescriptions have identical details
  const hasConflict = itemsWithPrescription.some((item) => {
    const itemPrescription = itemPrescriptions[item.id];
    if (!itemPrescription) return false;
    
    // Compare details: must have same number of details and same values
    if (itemPrescription.details.length !== referencePrescription.details.length) {
      return true; // Conflict: different number of details
    }
    
    // Check each detail matches
    return itemPrescription.details.some((detail) => {
      const refDetail = referencePrescription.details.find((d) => d.eye === detail.eye);
      if (!refDetail) return true; // Conflict: missing eye detail
      
      return (
        detail.sph !== refDetail.sph ||
        detail.cyl !== refDetail.cyl ||  // ← CYL compared here
        detail.axis !== refDetail.axis ||
        detail.pd !== refDetail.pd ||
        detail.add !== refDetail.add
      );
    });
  });
```

### Eye Mapping & CYL Transformation (Lines 168-175)
```typescript
prescriptionData = {
    details: referencePrescription.details.map((detail) => ({
        eye: detail.eye === 1 ? 2 : 1,  // Map frontend (1=Right, 2=Left) to backend (2=Right, 1=Left)
        sph: detail.sph,
        cyl: detail.cyl,                 // ← CYL sent as-is
        axis: detail.axis,
        pd: detail.pd,
        add: detail.add,
    })),
};
```

### Order Type Determination (Lines 142-152)
```typescript
// Determine order type based on whether items have custom prescriptions
const itemsWithPrescription = items.filter((item) => itemPrescriptions[item.id]);
const anyHasPrescription = itemsWithPrescription.length > 0;
const orderTypeValue = anyHasPrescription ? "Prescription" : "ReadyStock";

// Build prescription data if order type is Prescription
let prescriptionData: PrescriptionInputDto | undefined;
if (orderTypeValue === "Prescription" && anyHasPrescription) {
    // ... build prescription data
}
```

### Create Order Call (Lines 209-221)
```typescript
const createdOrder = await createOrder.mutateAsync({
    addressId: createdAddress.id,
    paymentMethod: toApiPaymentMethod(paymentMethod),
    customerNote: address.orderNote || null,
    orderType: orderTypeValue,
    selectedCartItemIds: items.map((item) => item.id),
    prescription: prescriptionData || null,  // ← Prescription with CYL sent here
});
```

---

## File 3: prescriptionCache.ts
**Path:** `client/src/features/cart/prescriptionCache.ts`

### Storage Keys (Lines 4-5)
```typescript
const STORAGE_KEY = "cartItemPrescriptions";
const STORAGE_KEY_BY_VARIANT = "cartPrescriptionByVariantId";
```

### Store Prescription by Cart Item (Lines 25-28)
```typescript
export function setCartItemPrescription(cartItemId: string, prescription: PrescriptionData) {
  const cache = read(STORAGE_KEY);
  cache[cartItemId] = prescription;
  write(STORAGE_KEY, cache);
}
```

### Retrieve Prescriptions (Lines 45-56)
```typescript
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

---

## File 4: prescription.ts
**Path:** `client/src/lib/types/prescription.ts`

### Type Definitions (Lines 1-17)
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

## File 5: order.ts
**Path:** `client/src/lib/types/order.ts`

### API DTOs (Lines 6-22)
```typescript
/** Eye type: 1 = Right (OD), 2 = Left (OS) */
export interface PrescriptionDetailInputDto {
  eye: 1 | 2;
  sph?: number | null;
  cyl?: number | null;
  axis?: number | null;
  pd?: number | null;
  add?: number | null;
}

export interface PrescriptionInputDto {
  details: PrescriptionDetailInputDto[];
}

export interface CreateOrderPayload {
  addressId: string;
  paymentMethod: string;
  customerNote?: string | null;
  orderType: OrderTypeLookup;
  selectedCartItemIds: string[];
  prescription?: PrescriptionInputDto | null;
}
```

---

## File 6: CheckoutPage.tsx
**Path:** `client/src/features/checkout/CheckoutPage.tsx`

### Hook Usage (Lines 20-39)
```typescript
export default function CheckoutPage() {
    const navigate = useNavigate();
    const {
        items,
        totalAmount,
        isEmptyCart,
        itemPrescriptions,
        cartLoading,
        address,
        setAddress,
        addressSearch,
        setAddressSearch,
        paymentMethod,
        setPaymentMethod,
        submitting,
        snackbar,
        setSnackbar,
        handlePlaceOrder,
    } = useCheckoutPage();

    return (
        // ... JSX uses these values
    );
}
```

### Prescription Retrieval in useCheckoutPage.ts (Lines 303-308)
```typescript
const itemPrescriptions = useMemo(
    () =>
      getCartItemPrescriptions(
        items.map((i) => ({ id: i.id, productVariantId: i.productVariantId }))
      ),
    [items],
);
```

---

## Data Flow Summary

```
SelectLensesDialog
    ↓
User selects CYL from dropdown (-6.00 to +6.00)
    ↓
updateDetail(eye, "cyl", parseFloat(value))
    ↓
setDetails updates state
    ↓
PrescriptionData memoized with CYL value
    ↓
onPrescriptionConfirm(prescription)
    ↓
setCartItemPrescription(cartItemId, prescription)
    ↓
Stored in sessionStorage["cartItemPrescriptions"]
    ↓
Checkout retrieves via getCartItemPrescriptions()
    ↓
useCheckoutPage validates CYL equality
    ↓
Transform eye values (1↔2), keep CYL as-is
    ↓
Create order with PrescriptionInputDto
    ↓
API receives: { eye: 2, cyl: -1.50, ... }
```
