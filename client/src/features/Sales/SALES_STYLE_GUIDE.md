# Sales Pages - Button & Badge Style Guide

## Overview
This document provides a comprehensive reference for all button styles, chip/badge styling, colors, typography, and sizing used across the Sales module pages (ReturnRefundScreen, WarrantyScreen, TicketListScreen, TicketDetailScreen).

---

## Color Palette

### Status Colors
Used for status indicator chips and visual feedback:

| Status | Hex Color | RGB | Usage |
|--------|-----------|-----|-------|
| Pending | `#fbbf24` | 251, 191, 36 | Amber - awaiting action |
| In Progress | `#3b82f6` | 59, 130, 246 | Blue - currently being processed |
| Resolved | `#10b981` | 16, 185, 129 | Green - successfully completed |
| Rejected | `#ef4444` | 239, 68, 68 | Red - request denied |
| Closed | `#6b7280` | 107, 114, 128 | Gray - no longer active |

### Ticket Type Colors
Used for ticket type badge and categorization:

| Type | Hex Color | RGB | Usage |
|------|-----------|-----|-------|
| Return | `#f59e0b` | 245, 158, 11 | Amber - product return requests |
| Warranty | `#3b82f6` | 59, 130, 246 | Blue - warranty claims |
| Refund | `#10b981` | 16, 185, 129 | Green - refund requests |
| Unknown | `#9ca3af` | 156, 163, 175 | Light Gray - undefined type |

### Neutral Colors
Used for primary actions and backgrounds:

| Element | Hex Color | Usage |
|---------|-----------|-------|
| Primary Dark | `#1f2937` | "View detail" button background |
| Primary Dark (Hover) | `#111827` | "View detail" button hover state |

### Action Button Colors

| Action | Default Hex | Hover Hex | Usage |
|--------|-------------|-----------|-------|
| Confirm | `#10b981` | `#059669` | Green - approve/resolve actions |
| Reject | `#ef4444` | `#dc2626` | Red - deny/reject actions |

---

## Button Components

### 1. Navigation Button - "View Detail"
**Location:** Ticket list item cards (TicketListScreen)  
**Purpose:** Navigate to detailed ticket view

#### Styling Properties
```typescript
{
  variant: "contained",
  size: "small",
  sx: {
    textTransform: "none",
    fontWeight: 700,
    borderRadius: 2,
    bgcolor: "#1f2937",
    "&:hover": { bgcolor: "#111827" }
  }
}
```

#### Specifications
| Property | Value |
|----------|-------|
| variant | contained |
| size | small |
| fontWeight | 700 (bold) |
| borderRadius | 8px (theme spacing: 2) |
| backgroundColor | #1f2937 (dark gray) |
| backgroundColor (hover) | #111827 (darker gray) |
| textTransform | none (preserves case) |
| Text Color | white (default for contained) |
| Padding | ~6-8px vertical, ~16px horizontal (MUI small default) |

#### Usage
```jsx
<Button
  variant="contained"
  size="small"
  sx={{
    textTransform: "none",
    fontWeight: 700,
    borderRadius: 2,
    bgcolor: "#1f2937",
    "&:hover": { bgcolor: "#111827" },
    ml: 2,
  }}
  onClick={() => navigate(`/sales/${navPrefix}/${ticket.id}`)}
>
  View detail
</Button>
```

---

### 2. Back Navigation Button
**Location:** Ticket detail screen header  
**Purpose:** Return to previous page

#### Styling Properties
```typescript
{
  sx: {
    textTransform: "none",
    color: "text.secondary"
  }
}
```

#### Specifications
| Property | Value |
|----------|-------|
| variant | text (default) |
| textTransform | none |
| Color | text.secondary (MUI theme color) |
| Text Color | Gray (secondary text color) |

#### Usage
```jsx
<Button
  onClick={() => navigate(-1)}
  sx={{
    mb: 2,
    textTransform: "none",
    color: "text.secondary",
  }}
>
  ← Back
</Button>
```

---

### 3. Action Button - "Confirm" (Resolve)
**Location:** Ticket detail screen action panel  
**Purpose:** Approve/Resolve ticket request  
**Triggers:** Opens confirmation dialog

#### Styling Properties
```typescript
{
  variant: "contained",
  size: "small",
  sx: {
    textTransform: "none",
    fontWeight: 700,
    borderRadius: 2,
    bgcolor: "#10b981",
    "&:hover": { bgcolor: "#059669" }
  }
}
```

#### Specifications
| Property | Value |
|----------|-------|
| variant | contained |
| size | small |
| fontWeight | 700 (bold) |
| borderRadius | 8px (theme spacing: 2) |
| backgroundColor | #10b981 (green) |
| backgroundColor (hover) | #059669 (darker green) |
| textTransform | none |
| Text Color | white |
| Padding | ~6-8px vertical, ~16px horizontal |

#### Usage
```jsx
<Button
  variant="contained"
  size="small"
  sx={{
    textTransform: "none",
    fontWeight: 700,
    borderRadius: 2,
    bgcolor: "#10b981",
    "&:hover": { bgcolor: "#059669" },
  }}
  onClick={() => handleOpenDialog("confirm")}
>
  Confirm
</Button>
```

---

### 4. Action Button - "Reject"
**Location:** Ticket detail screen action panel  
**Purpose:** Deny/Reject ticket request  
**Triggers:** Opens confirmation dialog

#### Styling Properties
```typescript
{
  variant: "outlined",
  size: "small",
  sx: {
    textTransform: "none",
    fontWeight: 700,
    borderRadius: 2,
    borderColor: "#ef4444",
    color: "#ef4444",
    "&:hover": { bgcolor: "rgba(239, 68, 68, 0.04)" }
  }
}
```

#### Specifications
| Property | Value |
|----------|-------|
| variant | outlined |
| size | small |
| fontWeight | 700 (bold) |
| borderRadius | 8px (theme spacing: 2) |
| borderColor | #ef4444 (red) |
| backgroundColor | transparent |
| backgroundColor (hover) | rgba(239, 68, 68, 0.04) (4% red) |
| Text Color | #ef4444 (red) |
| Border Width | 1px |
| textTransform | none |

#### Usage
```jsx
<Button
  variant="outlined"
  size="small"
  sx={{
    textTransform: "none",
    fontWeight: 700,
    borderRadius: 2,
    borderColor: "#ef4444",
    color: "#ef4444",
    "&:hover": { bgcolor: "rgba(239, 68, 68, 0.04)" },
  }}
  onClick={() => handleOpenDialog("reject")}
>
  Reject
</Button>
```

---

### 5. Dialog Action Buttons
**Location:** Confirmation dialogs (Resolve/Reject)  
**Purpose:** Submit or cancel dialog actions

#### Submit Button
```typescript
{
  variant: "contained",
  disabled: isUpdating,
  sx: {
    bgcolor: actionType === "confirm" ? "#10b981" : "#ef4444",
    "&:hover": {
      bgcolor: actionType === "confirm" ? "#059669" : "#dc2626",
    },
  }
}
```

| Property | Value |
|----------|-------|
| variant | contained |
| Background Color | #10b981 (green) if confirm, #ef4444 (red) if reject |
| Hover Background | #059669 (darker green) if confirm, #dc2626 (darker red) if reject |
| disabled state | true when isUpdating |

#### Cancel Button
Uses MUI default text button styling (no custom sx)

```jsx
<Button onClick={handleCloseDialog}>Cancel</Button>
```

---

## Badge / Chip Components

### 1. Status Chip/Badge
**Location:** Ticket cards (list and detail views)  
**Purpose:** Display current ticket status  
**Variants:** Pending, In Progress, Resolved, Rejected, Closed

#### Styling Properties
```typescript
{
  size: "small",
  sx: {
    fontWeight: 700,
    textTransform: "capitalize",
    border: `1px solid ${STATUS_COLORS[ticket.ticketStatus]}`,
    bgcolor: `${STATUS_COLORS[ticket.ticketStatus]}22`,
    color: STATUS_COLORS[ticket.ticketStatus],
    flexShrink: 0,
  }
}
```

#### Specifications
| Property | Value |
|----------|-------|
| Component | MUI Chip |
| size | small |
| fontWeight | 700 (bold) |
| textTransform | capitalize |
| borderWidth | 1px |
| borderColor | Dynamic (see Status Colors table) |
| backgroundColor | Dynamic with 22% opacity (hex suffix: 22) |
| Text Color | Dynamic (status color) |
| borderRadius | Default MUI (theme dependent) |

#### Status Examples

**Pending Chip:**
```jsx
<Chip
  label="Pending"
  size="small"
  sx={{
    fontWeight: 700,
    textTransform: "capitalize",
    border: "1px solid #fbbf24",
    bgcolor: "#fbbf2422", // 22% opacity amber
    color: "#fbbf24",
    flexShrink: 0,
  }}
/>
```

**In Progress Chip:**
```jsx
<Chip
  label="In Progress"
  size="small"
  sx={{
    fontWeight: 700,
    textTransform: "capitalize",
    border: "1px solid #3b82f6",
    bgcolor: "#3b82f622",
    color: "#3b82f6",
    flexShrink: 0,
  }}
/>
```

**Resolved Chip:**
```jsx
<Chip
  label="Resolved"
  size="small"
  sx={{
    fontWeight: 700,
    textTransform: "capitalize",
    border: "1px solid #10b981",
    bgcolor: "#10b98122",
    color: "#10b981",
    flexShrink: 0,
  }}
/>
```

**Rejected Chip:**
```jsx
<Chip
  label="Rejected"
  size="small"
  sx={{
    fontWeight: 700,
    textTransform: "capitalize",
    border: "1px solid #ef4444",
    bgcolor: "#ef444422",
    color: "#ef4444",
    flexShrink: 0,
  }}
/>
```

**Closed Chip:**
```jsx
<Chip
  label="Closed"
  size="small"
  sx={{
    fontWeight: 700,
    textTransform: "capitalize",
    border: "1px solid #6b7280",
    bgcolor: "#6b728022",
    color: "#6b7280",
    flexShrink: 0,
  }}
/>
```

---

### 2. Ticket Type Chip/Badge
**Location:** Ticket list and detail views  
**Purpose:** Display ticket type (Return, Warranty, Refund)  
**Variants:** Return, Warranty, Refund

#### Styling Properties
```typescript
{
  size: "small",
  sx: {
    fontWeight: 600,
    borderRadius: 1,
    height: 24,
    bgcolor: `${TYPE_COLORS[ticket.ticketType]}22`,
    color: TYPE_COLORS[ticket.ticketType],
    border: `1px solid ${TYPE_COLORS[ticket.ticketType]}`,
    "& .MuiChip-label": {
      px: 1,
    },
  }
}
```

#### Specifications
| Property | Value |
|----------|-------|
| Component | MUI Chip |
| size | small |
| fontWeight | 600 (semi-bold) |
| borderRadius | 4px (theme spacing: 1) |
| height | 24px (fixed) |
| borderWidth | 1px |
| borderColor | Dynamic (see Type Colors table) |
| backgroundColor | Dynamic with 22% opacity |
| Text Color | Dynamic (type color) |
| Label Padding | 4px horizontal (px: 1) |

#### Type Examples

**Return Chip:**
```jsx
<Chip
  label="Return"
  size="small"
  sx={{
    fontWeight: 600,
    borderRadius: 1,
    height: 24,
    bgcolor: "#f59e0b22",
    color: "#f59e0b",
    border: "1px solid #f59e0b",
    "& .MuiChip-label": {
      px: 1,
    },
  }}
/>
```

**Warranty Chip:**
```jsx
<Chip
  label="Warranty"
  size="small"
  sx={{
    fontWeight: 600,
    borderRadius: 1,
    height: 24,
    bgcolor: "#3b82f622",
    color: "#3b82f6",
    border: "1px solid #3b82f6",
    "& .MuiChip-label": {
      px: 1,
    },
  }}
/>
```

**Refund Chip:**
```jsx
<Chip
  label="Refund"
  size="small"
  sx={{
    fontWeight: 600,
    borderRadius: 1,
    height: 24,
    bgcolor: "#10b98122",
    color: "#10b981",
    border: "1px solid #10b981",
    "& .MuiChip-label": {
      px: 1,
    },
  }}
/>
```

---

## Typography Scale

### Button Text
| Level | Font Weight | Font Size | Usage |
|-------|------------|-----------|-------|
| Button Labels | 700 (bold) | 14px (MUI default for size="small") | All action buttons |
| Navigation Text | 600 - 700 | 14px | Back button, View detail |

### Status Labels
| Element | Font Weight | Font Size |
|---------|-------------|-----------|
| Status Chip Text | 700 | 13px (MUI small default) |
| Type Chip Text | 600 | 13px |

---

## Spacing & Layout

### Button Grouping
When buttons are displayed together (Confirm + Reject):
```typescript
sx={{ display: "flex", gap: 1 }}
```
- Gap: 4px (theme spacing: 1)
- Flex direction: row (default)

### Button Margins
- View detail button: `ml: 2` (16px left margin)
- Back button: `mb: 2` (16px bottom margin)
- Dialog buttons: Default DialogActions spacing

### Chip Sizing
| Chip Type | Width | Height | Padding |
|-----------|-------|--------|---------|
| Status Chip | auto | ~24px (MUI small) | 8px horizontal |
| Type Chip | auto | 24px (fixed) | 4px horizontal (px: 1) |

---

## Special States & Effects

### Button States

#### Hover States
- **View Detail Button:** Background changes from `#1f2937` → `#111827`
- **Confirm Button:** Background changes from `#10b981` → `#059669`
- **Reject Button:** Background remains transparent, applies `rgba(239, 68, 68, 0.04)` background
- **Dialog Submit:** Conditional based on action type

#### Disabled State
- Dialog submit button becomes disabled when `isUpdating = true`
- Text may show "Updating..." instead of "Submit"

#### Focus States
- Default MUI focus ring styling

### Chip Appearance
- Border: 1px solid (color-specific)
- Background: 22% opacity of the color (hex format: 22% = 0x38)
- Appearance: Outlined style with light background fill

---

## Common Patterns

### Pattern 1: Status + Type Display
Used on ticket list items:
```jsx
<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
  <Typography>Type:</Typography>
  <Chip label={getTypeLabel(ticket.ticketType)} /* type styling */ />
</Box>

<Chip label={STATUS_LABELS[ticket.ticketStatus]} /* status styling */ />
```

### Pattern 2: Action Buttons
Used on ticket detail screen:
```jsx
{canTakeAction && (
  <Box sx={{ display: "flex", gap: 1 }}>
    <Button variant="contained" bgcolor="#10b981" /* confirm styling */>
      Confirm
    </Button>
    <Button variant="outlined" borderColor="#ef4444" /* reject styling */>
      Reject
    </Button>
  </Box>
)}
```

### Pattern 3: Navigation with Back Button
```jsx
<Button sx={{ textTransform: "none", color: "text.secondary" }}>
  ← Back
</Button>
```

---

## MUI Theme Integration

### Spacing Units Used
| Theme Value | Pixels | Usage |
|-------------|--------|-------|
| spacing(1) | 4px | Type chip label padding, button gaps |
| spacing(2) | 8px | borderRadius, margins |

### Button Size Mapping
- `size="small"`: Height ~32px, Padding ~6-8px vertical, ~16px horizontal

### Chip Size Mapping
- `size="small"`: Height ~24px

---

## Accessibility Notes

1. **Color Contrast:** All text colors have adequate contrast ratios against their backgrounds
2. **Button Labels:** All buttons have clear, descriptive text labels
3. **Disabled Buttons:** Visually distinct disabled state (opacity reduction)
4. **Focus Indicators:** MUI's default focus ring visible on keyboard navigation
5. **Semantic HTML:** Using `<Button>` component ensures proper keyboard interaction

---

## Examples & Usage

### Complete Ticket List Item
```jsx
<Paper sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", px: 3, py: 2.5 }}>
  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
    <Typography>Ticket ID: {ticket.id}</Typography>
    <Chip
      label={STATUS_LABELS[ticket.ticketStatus]}
      size="small"
      sx={{
        fontWeight: 700,
        border: `1px solid ${STATUS_COLORS[ticket.ticketStatus]}`,
        bgcolor: `${STATUS_COLORS[ticket.ticketStatus]}22`,
        color: STATUS_COLORS[ticket.ticketStatus],
      }}
    />
  </Box>
  
  <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
    <Chip
      label={getTypeLabel(ticket.ticketType)}
      size="small"
      sx={{
        fontWeight: 600,
        borderRadius: 1,
        height: 24,
        bgcolor: `${TYPE_COLORS[ticket.ticketType]}22`,
        color: TYPE_COLORS[ticket.ticketType],
        border: `1px solid ${TYPE_COLORS[ticket.ticketType]}`,
      }}
    />
  </Box>
  
  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
    <Button
      variant="contained"
      size="small"
      sx={{
        textTransform: "none",
        fontWeight: 700,
        borderRadius: 2,
        bgcolor: "#1f2937",
        "&:hover": { bgcolor: "#111827" },
      }}
      onClick={() => navigate(`/sales/${navPrefix}/${ticket.id}`)}
    >
      View detail
    </Button>
  </Box>
</Paper>
```

### Complete Ticket Detail Actions
```jsx
{canTakeAction && (
  <Box sx={{ display: "flex", gap: 1 }}>
    <Button
      variant="contained"
      size="small"
      sx={{
        textTransform: "none",
        fontWeight: 700,
        borderRadius: 2,
        bgcolor: "#10b981",
        "&:hover": { bgcolor: "#059669" },
      }}
      onClick={() => handleOpenDialog("confirm")}
    >
      Confirm
    </Button>
    <Button
      variant="outlined"
      size="small"
      sx={{
        textTransform: "none",
        fontWeight: 700,
        borderRadius: 2,
        borderColor: "#ef4444",
        color: "#ef4444",
        "&:hover": { bgcolor: "rgba(239, 68, 68, 0.04)" },
      }}
      onClick={() => handleOpenDialog("reject")}
    >
      Reject
    </Button>
  </Box>
)}
```

---

## Quick Reference Cheat Sheet

### Most Used Color Codes
| Semantic | Hex | Use Cases |
|----------|-----|-----------|
| Success/Green | `#10b981` | Confirm buttons, Resolved status, Refund type |
| Error/Red | `#ef4444` | Reject buttons, Rejected status |
| Info/Blue | `#3b82f6` | In Progress status, Warranty type |
| Warning/Amber | `#fbbf24` | Pending status |
| Gray/Dark | `#1f2937` | View detail buttons, Dark theme |
| Gray/Darker | `#111827` | Dark button hover states |
| Gray/Neutral | `#6b7280` | Closed status |

### Most Used Styling Values
| Property | Value |
|----------|-------|
| fontWeight (buttons) | 700 |
| fontWeight (chips) | 600 |
| borderRadius (buttons) | 2 (8px) |
| borderRadius (chips) | 1 (4px) |
| size (buttons) | "small" |
| size (chips) | "small" |
| opacity multiplier | 22% (hex: 22) |
| gap between buttons | spacing(1) = 4px |

---

## Future Updates & Maintenance

When adding new button types or status values:
1. Define hex color in STATUS_COLORS or TYPE_COLORS mapping
2. Ensure 22% opacity version is generated (e.g., `#xxxxx22`)
3. Test contrast ratios for accessibility compliance
4. Add both default and hover states
5. Update this guide with new entries

