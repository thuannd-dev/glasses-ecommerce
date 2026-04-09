import { Box, Stack, Typography } from "@mui/material";
import type { CartItemDto } from "../../lib/types/cart";
import type { CartLensLineDisplayMeta } from "../../lib/types/lensSelection";

function hasLensData(item: CartItemDto, meta?: CartLensLineDisplayMeta | null): boolean {
  return Boolean(
    item.lensVariantId ||
      (item.lensPrice ?? 0) > 0 ||
      (item.coatingExtraPrice ?? 0) > 0 ||
    meta,
  );
}

function DefRow({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 1.5,
      }}
    >
      <Typography
        component="span"
        sx={{ fontSize: 11, color: "#78716C", fontWeight: 500, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Typography
        component="span"
        sx={{
          fontSize: 11,
          fontWeight: 600,
          color: "#292524",
          textAlign: "right",
          lineHeight: 1.4,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

type Props = {
  item: CartItemDto;
  lensDisplay?: CartLensLineDisplayMeta | null;
  formatMoney: (n: number) => string;
  /** Narrower checkout sidebar */
  dense?: boolean;
  /** Checkout order summary: warm panel + label/value rows */
  summaryVariant?: "default" | "checkout";
};

/** Under prescription table (cart) or “Prescription” label (checkout) — text only. */
export function CartSelectedLensLines({
  item,
  lensDisplay,
  formatMoney,
  dense,
  summaryVariant = "default",
}: Props) {
  if (!item.hasPrescription || !hasLensData(item, lensDisplay)) return null;

  const fs = dense ? 11 : 12;
  const lineSx = { fontSize: fs, color: "#57534E", mt: dense ? 0.2 : 0.35, lineHeight: 1.45 };

  const optionText =
    lensDisplay?.coatingLineLabel === "None" && (item.coatingExtraPrice ?? 0) > 0
      ? `${formatMoney(item.coatingExtraPrice ?? 0)}`
      : lensDisplay?.coatingLineLabel;

  const checkoutBody = lensDisplay ? (
    <>
      <DefRow label="Type" value={lensDisplay.usageTypeLabel} />
      <DefRow label="PD" value={`${lensDisplay.pdModeLabel} · ${lensDisplay.pdValueLabel}`} />
      {lensDisplay.lensProductName ? (
        <DefRow label="Lens product" value={lensDisplay.lensProductName} />
      ) : null}
      <DefRow label="Lens" value={lensDisplay.lensLineLabel || item.lensVariantName || "—"} />
      <DefRow label="Lens option" value={optionText ?? "—"} />
    </>
  ) : (
    <>
      {item.lensVariantName ? <DefRow label="Lens" value={item.lensVariantName} /> : null}
      <DefRow
        label="Add-ons"
        value={`Lens ${formatMoney(item.lensPrice ?? 0)} · Options ${formatMoney(item.coatingExtraPrice ?? 0)}`}
      />
    </>
  );

  if (summaryVariant === "checkout") {
    return (
      <Box
        sx={{
          mt: dense ? 0.5 : 1,
          p: 1.15,
          borderRadius: 2,
          bgcolor: "rgba(182, 140, 90, 0.07)",
          border: "1px solid rgba(182, 140, 90, 0.22)",
        }}
      >
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 800,
            color: "#92400E",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            mb: 0.85,
          }}
        >
          Selected lens
        </Typography>
        <Stack spacing={0.55}>{checkoutBody}</Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: dense ? 0.5 : 1 }}>
      <Typography sx={{ fontSize: fs, fontWeight: 700, color: "#44403C" }}>Selected lens</Typography>
      {lensDisplay ? (
        <>
          <Typography sx={lineSx}>Type: {lensDisplay.usageTypeLabel}</Typography>
          <Typography sx={lineSx}>
            PD: {lensDisplay.pdModeLabel} · {lensDisplay.pdValueLabel}
          </Typography>
          {lensDisplay.lensProductName ? (
            <Typography sx={lineSx}>Lens product: {lensDisplay.lensProductName}</Typography>
          ) : null}
          <Typography sx={lineSx}>
            Lens: {lensDisplay.lensLineLabel || item.lensVariantName || "—"}
          </Typography>
          <Typography sx={lineSx}>Lens option: {optionText ?? "—"}</Typography>
        </>
      ) : (
        <>
          {item.lensVariantName ? <Typography sx={lineSx}>Lens: {item.lensVariantName}</Typography> : null}
          <Typography sx={lineSx}>
            Lens add-on: {formatMoney(item.lensPrice ?? 0)} · Options: {formatMoney(item.coatingExtraPrice ?? 0)}
          </Typography>
        </>
      )}
    </Box>
  );
}
