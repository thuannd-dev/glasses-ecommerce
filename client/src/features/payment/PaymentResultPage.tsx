import { Box, Button, Chip, Divider, Paper, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { NavLink, useSearchParams } from "react-router-dom";

// ─── Palette (mirrors project design system) ────────────────────────────────
const PALETTE = {
  cardBg: "#FFFFFF",
  border: "#ECECEC",
  divider: "#F1F1F1",
  textMain: "#171717",
  textSecondary: "#6B6B6B",
  textMuted: "#8A8A8A",
  accent: "#B68C5A",
};

// ─── VnPay response-code labels ─────────────────────────────────────────────
const VNP_RESPONSE_CODES: Record<string, string> = {
  "00": "Transaction successful",
  "07": "Suspicious transaction – card deducted",
  "09": "Card/Account not registered for Internet Banking",
  "10": "Incorrect card/account info (>3 attempts)",
  "11": "Payment session expired",
  "12": "Card/Account locked",
  "13": "Wrong OTP",
  "24": "Customer cancelled transaction",
  "51": "Insufficient balance",
  "65": "Daily transaction limit exceeded",
  "75": "Bank under maintenance",
  "79": "Wrong payment password (>5 attempts)",
  "99": "Other error",
};

function formatVnd(amountParts: string | null): string {
  if (!amountParts) return "—";
  // VnPay sends amount × 100
  const num = parseInt(amountParts, 10);
  if (isNaN(num)) return amountParts;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num / 100);
}

// ─── Row helper ─────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 2,
        fontSize: 14,
        py: 0.5,
      }}
    >
      <Typography sx={{ color: PALETTE.textMuted, fontSize: 14, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography
        sx={{
          color: PALETTE.textMain,
          fontWeight: 500,
          fontSize: 14,
          textAlign: "right",
          wordBreak: "break-all",
        }}
      >
        {value ?? "—"}
      </Typography>
    </Box>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function PaymentResultPage() {
  const [params] = useSearchParams();

  const responseCode = params.get("vnp_ResponseCode");
  const txnRef = params.get("vnp_TxnRef");
  const transactionNo = params.get("vnp_TransactionNo");
  const amount = params.get("vnp_Amount");
  const orderInfo = params.get("vnp_OrderInfo");
  const bankCode = params.get("vnp_BankCode");
  const payDate = params.get("vnp_PayDate"); // yyyyMMddHHmmss

  const isSuccess = responseCode === "00";
  const hasParams = responseCode !== null;

  // Format pay date from yyyyMMddHHmmss → readable
  function formatPayDate(raw: string | null): string {
    if (!raw || raw.length < 14) return "—";
    const y = raw.slice(0, 4);
    const mo = raw.slice(4, 6);
    const d = raw.slice(6, 8);
    const h = raw.slice(8, 10);
    const mi = raw.slice(10, 12);
    const s = raw.slice(12, 14);
    return `${d}/${mo}/${y} ${h}:${mi}:${s}`;
  }

  const responseLabel =
    responseCode !== null
      ? VNP_RESPONSE_CODES[responseCode] ?? `Unknown code (${responseCode})`
      : "No payment information received";

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
        mt: 10,
        px: { xs: 2, md: 3 },
        pb: 10,
      }}
    >
      {/* ── Status hero card ── */}
      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${isSuccess ? "#D1FAE5" : "#FEE2E2"}`,
          borderRadius: 2.5,
          p: { xs: 3, md: 4 },
          mb: 3,
          boxShadow: isSuccess
            ? "0 12px 30px rgba(22,163,74,0.08)"
            : "0 12px 30px rgba(220,38,38,0.08)",
          bgcolor: isSuccess ? "#F0FDF4" : "#FFF5F5",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: `1px solid ${isSuccess ? "#A7F3D0" : "#FECACA"}`,
            bgcolor: isSuccess ? "#ECFDF5" : "#FFF1F1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {isSuccess ? (
            <CheckCircleOutlineIcon sx={{ fontSize: 32, color: "#16a34a" }} />
          ) : (
            <ErrorOutlineIcon sx={{ fontSize: 32, color: "#dc2626" }} />
          )}
        </Box>

        {/* Text */}
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: 20,
              color: isSuccess ? "#14532d" : "#7f1d1d",
            }}
          >
            {isSuccess ? "Payment successful" : "Payment failed"}
          </Typography>
          <Typography
            sx={{
              mt: 0.5,
              fontSize: 14,
              color: isSuccess ? "#15803d" : "#b91c1c",
            }}
          >
            {responseLabel}
          </Typography>
        </Box>

        {/* Response code badge */}
        {hasParams && (
          <Chip
            label={`Code: ${responseCode}`}
            size="small"
            sx={{
              fontWeight: 700,
              fontFamily: "monospace",
              fontSize: 12,
              bgcolor: isSuccess ? "#D1FAE5" : "#FEE2E2",
              color: isSuccess ? "#065F46" : "#991B1B",
              border: "none",
              flexShrink: 0,
            }}
          />
        )}
      </Paper>

      {/* ── Transaction details card ── */}
      {hasParams && (
        <Paper
          elevation={0}
          sx={{
            border: `1px solid ${PALETTE.border}`,
            borderRadius: 2.5,
            p: 3,
            mb: 3,
            bgcolor: PALETTE.cardBg,
            boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
          }}
        >
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: 15,
              color: PALETTE.textMain,
              mb: 1.5,
            }}
          >
            Transaction details
          </Typography>
          <Divider sx={{ mb: 1.5, borderColor: PALETTE.divider }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
            {orderInfo && (
              <InfoRow label="Order info" value={decodeURIComponent(orderInfo)} />
            )}
            <InfoRow label="Amount" value={formatVnd(amount)} />
            {txnRef && <InfoRow label="Internal ref (TxnRef)" value={txnRef} />}
            {transactionNo && transactionNo !== "0" && (
              <InfoRow label="VnPay transaction no." value={transactionNo} />
            )}
            {bankCode && <InfoRow label="Bank" value={bankCode} />}
            {payDate && (
              <InfoRow label="Payment time" value={formatPayDate(payDate)} />
            )}
          </Box>

          {/* Status note */}
          <Divider sx={{ my: 2, borderColor: PALETTE.divider }} />
          <Box
            sx={{
              bgcolor: isSuccess ? "#F0FDF4" : "#FFF5F5",
              border: `1px solid ${isSuccess ? "#BBF7D0" : "#FECACA"}`,
              borderRadius: 1.5,
              px: 2,
              py: 1.25,
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                color: isSuccess ? "#15803d" : "#b91c1c",
                fontWeight: 500,
              }}
            >
              {isSuccess
                ? "✓ Your payment has been confirmed. The order will be processed shortly."
                : "✗ Your payment was not completed. No amount has been charged. Please try again."}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* ── No params fallback ── */}
      {!hasParams && (
        <Paper
          elevation={0}
          sx={{
            border: `1px solid ${PALETTE.border}`,
            borderRadius: 2.5,
            p: 3,
            mb: 3,
            bgcolor: PALETTE.cardBg,
            boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
          }}
        >
          <Typography sx={{ fontSize: 14, color: PALETTE.textSecondary }}>
            No payment information found. This page should only be accessed after
            completing a VnPay payment.
          </Typography>
        </Paper>
      )}

      {/* ── CTAs ── */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          mt: 4,
          flexWrap: "wrap",
        }}
      >
        <Button
          component={NavLink}
          to="/collections"
          variant="outlined"
          sx={{
            minWidth: 170,
            height: 44,
            borderRadius: 1.75,
            borderColor: PALETTE.border,
            color: PALETTE.textMain,
            fontWeight: 600,
            textTransform: "none",
            px: 3,
            "&:hover": { bgcolor: "#FAFAFA", borderColor: PALETTE.border },
          }}
        >
          Continue shopping
        </Button>
        <Button
          component={NavLink}
          to="/orders"
          variant="contained"
          sx={{
            minWidth: 190,
            height: 44,
            borderRadius: 1.75,
            bgcolor: "#111827",
            color: "#FFFFFF",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            px: 3,
            boxShadow: "0 8px 22px rgba(0,0,0,0.16)",
            "&:hover": {
              bgcolor: "#151826",
              boxShadow: "0 10px 26px rgba(0,0,0,0.18)",
            },
            "&:focus-visible": {
              outline: "2px solid rgba(182,140,90,0.5)",
              outlineOffset: 3,
            },
          }}
        >
          View my orders
        </Button>
      </Box>
    </Box>
  );
}
