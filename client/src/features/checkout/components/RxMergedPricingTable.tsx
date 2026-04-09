import { Box, Divider, Typography } from "@mui/material";
import type { CartLensLineDisplayMeta } from "../../../lib/types/lensSelection";

/** Lens line often ends with " - $100.00"; price is shown in its own column. */
function stripLensLineTrailingPrice(label: string): string {
  const t = label.trim();
  if (!t) return t;
  const stripped = t.replace(/\s*[-–]\s*\$[\d,]+(?:\.\d{2})?\s*$/u, "").trim();
  return stripped || t;
}

function stripCoatingTrailingPrice(label: string): string {
  const t = label.trim();
  if (!t) return t;
  const stripped = t.replace(/\s*\(\+\$[\d,]+(?:\.\d{2})?\)\s*$/u, "").trim();
  return stripped || t;
}

function PriceRow({
  label,
  value,
  emphasized,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 1,
      }}
    >
      <Typography
        sx={{
          fontSize: 12,
          color: emphasized ? "#171717" : "#71717A",
          fontWeight: emphasized ? 700 : 500,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: emphasized ? 800 : 600,
          color: "#171717",
          fontVariantNumeric: "tabular-nums",
          textAlign: "right",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function DetailRow({ label, text }: { label: string; text: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 1,
        pl: 1.25,
        py: 0.15,
      }}
    >
      <Typography sx={{ fontSize: 11, color: "#78716C", fontWeight: 500 }}>{label}</Typography>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 500,
          color: "#3F3F46",
          textAlign: "right",
          lineHeight: 1.35,
          maxWidth: "68%",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}

export type RxMergedPricingTableProps = {
  framePrice: number;
  lensPrice: number;
  coatingExtraPrice: number;
  perUnitPrice: number;
  lensDisplay?: CartLensLineDisplayMeta | null;
  lensVariantName?: string | null;
  coatingOptionLabel?: string | null;
  formatMoney: (n: number) => string;
  /** Default true — order detail hides this so line total in header is the single “each” price. */
  showPerUnit?: boolean;
};

export function RxMergedPricingTable({
  framePrice,
  lensPrice,
  coatingExtraPrice,
  perUnitPrice,
  lensDisplay,
  lensVariantName,
  coatingOptionLabel,
  formatMoney,
  showPerUnit = true,
}: RxMergedPricingTableProps) {
  const coatingRaw = lensDisplay?.coatingLineLabel;
  const coatingDetail =
    coatingRaw === "None" && coatingExtraPrice > 0
      ? null
      : coatingRaw
        ? stripCoatingTrailingPrice(coatingRaw)
        : coatingOptionLabel?.trim() || null;
  const showCoatingDetail = Boolean(coatingDetail && coatingDetail !== "None");

  const lensSpecText = lensDisplay
    ? stripLensLineTrailingPrice(lensDisplay.lensLineLabel || lensVariantName || "—")
    : lensVariantName || null;

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "1px solid #E4E4E7",
        bgcolor: "#FAFAFA",
        overflow: "hidden",
      }}
    >
      <Box sx={{ px: 1.25, py: 0.75, bgcolor: "#F4F4F5", borderBottom: "1px solid #E4E4E7" }}>
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 800,
            color: "#92400E",
            letterSpacing: "0.06em",
          }}
        >
          PRESCRIPTION & PRICING
        </Typography>
      </Box>
      <Box sx={{ px: 1.25, py: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
        <PriceRow label="Frame" value={formatMoney(framePrice)} />
        <PriceRow label="Lens" value={formatMoney(lensPrice)} />
        {lensDisplay ? (
          <>
            <DetailRow label="Type" text={lensDisplay.usageTypeLabel} />
            {lensDisplay.lensProductName ? (
              <DetailRow label="Lens product" text={lensDisplay.lensProductName} />
            ) : null}
            {lensSpecText ? <DetailRow label="Lens line" text={lensSpecText} /> : null}
          </>
        ) : lensSpecText ? (
          <DetailRow label="Lens line" text={lensSpecText} />
        ) : null}

        <Box sx={{ pt: 0.35 }}>
          <PriceRow label="Options" value={formatMoney(coatingExtraPrice)} />
        </Box>
        {showCoatingDetail ? <DetailRow label="Add-on" text={coatingDetail!} /> : null}

        {showPerUnit ? (
          <>
            <Divider sx={{ borderColor: "#E4E4E7", my: 0.35 }} />
            <PriceRow label="Per unit" value={formatMoney(perUnitPrice)} emphasized />
          </>
        ) : null}
      </Box>
    </Box>
  );
}
