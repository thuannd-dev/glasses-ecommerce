# CYL Field - Quick Reference Summary

## CYL Value Range & Options

### Build Configuration (SelectLensesDialog.tsx)
```typescript
function buildCylOptions(): string[] {
    const out: string[] = [];
    for (let i = -24; i <= 24; i++) {
        out.push((i * 0.25).toFixed(2));
    }
    return out;
}
```

| Property | Value |
|----------|-------|
| **Min Value** | -24 × 0.25 = **-6.00** |
| **Max Value** | 24 × 0.25 = **+6.00** |
| **Step** | 0.25 |
| **Total Options** | 49 (from -6.00 to +6.00) |
| **Format** | String in dropdown, parsed to `number` |

---

## CYL Input Component

### HTML/React Code
```tsx
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
```

### Field Behavior
| Aspect | Details |
|--------|---------|
| **Type** | Dropdown `<select>` |
| **Options Source** | `CYL_OPTIONS` array (49 values) |
| **Initial Value** | `null` (displays as "0.00") |
| **Display Value** | `row.cyl != null ? row.cyl.toFixed(2) : "0.00"` |
| **onChange Handler** | `updateDetail(row.eye, 'cyl', parseFloat(value))` |
| **Storage Type** | `number` (in state) |
| **Enabled/Disabled** | Always enabled (no conditions) |

---

## CYL Validation

### At Form Level (isPrescriptionFormValid)
```typescript
const isPrescriptionFormValid = useMemo(() => {
    const bothEyesFilled = details.every(
        (row) => row.sph != null && row.cyl != null && row.axis != null
    );
    const pdFilled = twoPdNumbers
        ? pdRight !== "" && pdLeft !== ""
        : pdSingle !== "";
    return bothEyesFilled && pdFilled;  // ← CYL != null required
}, [details, twoPdNumbers, pdSingle, pdRight, pdLeft]);
```

**Requirement:** `row.cyl != null`

### At Checkout Level (useCheckoutPage.ts)
```typescript
return itemPrescription.details.some((detail) => {
    const refDetail = referencePrescription.details.find((d) => d.eye === detail.eye);
    if (!refDetail) return true;
    
    return (
        detail.sph !== refDetail.sph ||
        detail.cyl !== refDetail.cyl ||  // ← CYL equality check
        detail.axis !== refDetail.axis ||
        detail.pd !== refDetail.pd ||
        detail.add !== refDetail.add
    );
});
```

**Requirement:** All items must have identical CYL values per eye

### No Range Validation on Client
⚠️ **Note:** The client does NOT validate that CYL is within -6.00 to +6.00 range. It only validates that a value from CYL_OPTIONS was selected. Backend should validate the actual range.

---

## CYL Data Transformation

### From Form to Internal State
```
Dropdown Selection "−1.50"
         ↓
parseFloat("−1.50")
         ↓
Store as number: -1.5
         ↓
Display: row.cyl.toFixed(2) = "-1.50"
```

### From Internal State to API
```typescript
// In useCheckoutPage.ts (lines 168-175)
details: referencePrescription.details.map((detail) => ({
    eye: detail.eye === 1 ? 2 : 1,  // Eye mapping
    sph: detail.sph,
    cyl: detail.cyl,                 // ← Sent as-is (numeric)
    axis: detail.axis,
    pd: detail.pd,
    add: detail.add,
}))
```

**Example Values Sent to API:**
- User selects "-6.00" → API receives: `{ cyl: -6.00 }`
- User selects "0.00" → API receives: `{ cyl: 0.00 }`
- User selects "+3.50" → API receives: `{ cyl: 3.50 }`

---

## CYL Dependency & Related Fields

### AXIS Field Dependency
```typescript
disabled={row.sph == null || row.cyl == null}
```

**AXIS becomes ENABLED only after:**
- SPH is selected (not null)
- AND CYL is selected (not null)

**Implication:** Users MUST select CYL before they can select AXIS.

### Eye Type Impact
```typescript
// Frontend: 1=Right, 2=Left
// Backend: 2=Right, 1=Left (opposite!)

// Transformation at checkout:
eye: detail.eye === 1 ? 2 : 1,
cyl: detail.cyl,  // CYL stays the same, only eye is remapped
```

**CYL is NOT affected by eye type transformation.**

---

## Complete CYL Flow in Code

### 1. **Initialization** (SelectLensesDialog.tsx:22-23)
```typescript
{ eye: 1, sph: null, cyl: null, axis: null, pd: null, add: null }
{ eye: 2, sph: null, cyl: null, axis: null, pd: null, add: null }
```

### 2. **Display** (SelectLensesDialog.tsx:350-360)
```tsx
value={row.cyl != null ? row.cyl.toFixed(2) : "0.00"}
onChange={(e) => updateDetail(row.eye, "cyl", parseFloat(e.target.value))}
```

### 3. **Validation** (SelectLensesDialog.tsx:127)
```typescript
row.cyl != null  // Must not be null to enable Continue button
```

### 4. **Storage** (prescriptionCache.ts)
```typescript
cache[cartItemId] = {
    details: [
        { eye: 1, sph: ..., cyl: -1.5, axis: ..., pd: ..., add: null },
        { eye: 2, sph: ..., cyl: -2.0, axis: ..., pd: ..., add: null }
    ]
}
```

### 5. **Checkout Validation** (useCheckoutPage.ts:170)
```typescript
detail.cyl !== refDetail.cyl  // All items must match
```

### 6. **API Transformation** (useCheckoutPage.ts:173)
```typescript
cyl: detail.cyl  // Sent as numeric value
```

### 7. **API Request Body**
```json
{
    "orderType": "Prescription",
    "prescription": {
        "details": [
            { "eye": 2, "sph": -1.5, "cyl": -1.5, "axis": 90, "pd": 65 },
            { "eye": 1, "sph": -2.0, "cyl": -2.0, "axis": 180, "pd": 65 }
        ]
    }
}
```

---

## File References

| File | Component/Function | Line(s) | Purpose |
|------|------------------|---------|---------|
| `SelectLensesDialog.tsx` | `buildCylOptions()` | 40-46 | Generate CYL dropdown options |
| `SelectLensesDialog.tsx` | CYL TextField | 346-361 | Render CYL dropdown input |
| `SelectLensesDialog.tsx` | `isPrescriptionFormValid` | 127 | Validate CYL is not null |
| `SelectLensesDialog.tsx` | `INITIAL_DETAILS` | 22-23 | Initialize CYL as null |
| `useCheckoutPage.ts` | Prescription conflict check | 170 | Validate CYL equality at checkout |
| `useCheckoutPage.ts` | Transformation | 173 | Add CYL to API payload |
| `prescriptionCache.ts` | `setCartItemPrescription()` | 25-28 | Store CYL in session storage |
| `prescription.ts` | `PrescriptionDetailRow` | 3 | Type definition for CYL |
| `order.ts` | `PrescriptionDetailInputDto` | 10 | API DTO with CYL field |

---

## Known Behavior

✅ **Working As Expected:**
- CYL range -6.00 to +6.00 enforced via dropdown
- CYL required for form submission
- CYL stored in session storage
- CYL sent correctly to API
- Format preserved (numeric with up to 2 decimals)

⚠️ **Potential Issues:**
- Display shows "0.00" as placeholder for null values (could confuse users)
- No explicit error message if CYL differs between items in multi-item checkout (just generic "must match" message)
- Client doesn't validate CYL is a valid value from CYL_OPTIONS (relies on dropdown enforcement)
- Backend must validate actual numeric range since client only validates it's not null
