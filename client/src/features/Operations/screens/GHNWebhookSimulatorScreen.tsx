import { useState, useCallback } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import InventoryIcon from "@mui/icons-material/Inventory";
import CancelIcon from "@mui/icons-material/Cancel";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import HistoryIcon from "@mui/icons-material/History";
import WebhookIcon from "@mui/icons-material/Webhook";
import { toast } from "react-toastify";
import { OperationsPageHeader } from "../components/OperationsPageHeader";
import {
  useSendGHNWebhook,
  type GHNWebhookPayload,
} from "../../../lib/hooks/useOperationsOrders";

const GHN_STATUSES = [
  {
    value: "picked",
    label: "Picked",
    description: "Shipper picked up package",
    color: "#2563EB",
    bgColor: "rgba(37,99,235,0.08)",
    borderColor: "rgba(37,99,235,0.25)",
    icon: <InventoryIcon sx={{ fontSize: 18 }} />,
    resultStatus: "Shipped",
  },
  {
    value: "delivered",
    label: "Delivered",
    description: "Delivered to customer",
    color: "#16A34A",
    bgColor: "rgba(22,163,74,0.08)",
    borderColor: "rgba(22,163,74,0.25)",
    icon: <LocalShippingIcon sx={{ fontSize: 18 }} />,
    resultStatus: "Delivered",
  },
  {
    value: "returned",
    label: "Returned",
    description: "Failed, returned to shop",
    color: "#DC2626",
    bgColor: "rgba(220,38,38,0.08)",
    borderColor: "rgba(220,38,38,0.25)",
    icon: <CancelIcon sx={{ fontSize: 18 }} />,
    resultStatus: "Cancelled",
  },
] as const;

interface LogEntry {
  id: number;
  timestamp: Date;
  payload: GHNWebhookPayload;
  success: boolean;
  message?: string;
  statusLabel: string;
  statusColor: string;
}

export function GHNWebhookSimulatorScreen() {
  const [orderCode, setOrderCode] = useState("");
  const [clientOrderCode, setClientOrderCode] = useState("");
  const [status, setStatus] = useState("picked");
  const [reasonCode, setReasonCode] = useState("");
  const [reason, setReason] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logIdCounter, setLogIdCounter] = useState(1);

  const sendWebhook = useSendGHNWebhook();
  const selectedStatus = GHN_STATUSES.find((s) => s.value === status) ?? GHN_STATUSES[0];

  const handleSend = useCallback(() => {
    if (!orderCode.trim()) {
      toast.warning("Please enter a Tracking Code (OrderCode)");
      return;
    }
    const payload: GHNWebhookPayload = {
      OrderCode: orderCode.trim(),
      ClientOrderCode: clientOrderCode.trim(),
      Status: status,
      ReasonCode: reasonCode.trim(),
      Reason: reason.trim(),
    };
    sendWebhook.mutate(payload, {
      onSuccess: (data) => {
        const entry: LogEntry = {
          id: logIdCounter,
          timestamp: new Date(),
          payload,
          success: data.success !== false,
          message: data.message,
          statusLabel: selectedStatus.label,
          statusColor: selectedStatus.color,
        };
        setLogs((prev) => [entry, ...prev]);
        setLogIdCounter((c) => c + 1);
        if (data.success !== false) {
          toast.success(`Webhook "${selectedStatus.label}" OK`);
        } else {
          toast.error(`Webhook failed: ${data.message || "Unknown"}`);
        }
      },
      onError: (err: unknown) => {
        let msg = "Failed to send webhook";
        if (err instanceof Error) msg = err.message;
        const entry: LogEntry = {
          id: logIdCounter,
          timestamp: new Date(),
          payload,
          success: false,
          message: msg,
          statusLabel: selectedStatus.label,
          statusColor: selectedStatus.color,
        };
        setLogs((prev) => [entry, ...prev]);
        setLogIdCounter((c) => c + 1);
        toast.error(msg);
      },
    });
  }, [orderCode, clientOrderCode, status, reasonCode, reason, sendWebhook, logIdCounter, selectedStatus]);

  const handleReset = () => {
    setOrderCode("");
    setClientOrderCode("");
    setStatus("picked");
    setReasonCode("");
    setReason("");
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      bgcolor: "#FFFFFF",
      "& fieldset": { borderColor: "rgba(0,0,0,0.12)" },
      "&:hover fieldset": { borderColor: "rgba(0,0,0,0.24)" },
      "&.Mui-focused fieldset": { borderColor: "#B68C5A" },
      "&.Mui-focused": { boxShadow: "0 0 0 2px rgba(182,140,90,0.15)" },
    },
  } as const;

  return (
    <>
      <OperationsPageHeader
        eyebrow="DEVELOPER TOOLS"
        title="GHN Webhook Simulator"
        subtitle="Simulate GHN delivery status updates to test picked, delivered, and returned flows."
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 3,
          mt: 1,
        }}
      >
        {/* ===== LEFT: Webhook Form ===== */}
        <Paper
          elevation={0}
          sx={{
            p: 0,
            borderRadius: 3,
            border: "1px solid rgba(0,0,0,0.08)",
            bgcolor: "#FFFFFF",
            overflow: "hidden",
          }}
        >
          {/* Form header */}
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <WebhookIcon sx={{ color: "#B68C5A", fontSize: 22 }} />
            <Box>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#171717" }}>
                Webhook Payload
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#8A8A8A" }}>
                POST /api/webhooks/ghn
              </Typography>
            </Box>
          </Box>

          <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Status selector cards */}
            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#8A8A8A",
                  textTransform: "uppercase",
                  letterSpacing: 1.4,
                  mb: 1,
                }}
              >
                Delivery Status
              </Typography>
              <Box sx={{ display: "flex", gap: 1.5 }}>
                {GHN_STATUSES.map((s) => {
                  const isSelected = status === s.value;
                  return (
                    <Box
                      key={s.value}
                      onClick={() => setStatus(s.value)}
                      sx={{
                        flex: 1,
                        p: 1.5,
                        borderRadius: 2,
                        border: `2px solid ${isSelected ? s.borderColor : "rgba(0,0,0,0.08)"}`,
                        bgcolor: isSelected ? s.bgColor : "transparent",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        "&:hover": { borderColor: s.borderColor, bgcolor: s.bgColor },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                        <Box sx={{ color: isSelected ? s.color : "#8A8A8A" }}>{s.icon}</Box>
                        <Typography
                          sx={{ fontSize: 13, fontWeight: 700, color: isSelected ? s.color : "#4B5563" }}
                        >
                          {s.label}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: 11, color: "#6B7280", lineHeight: 1.4 }}>
                        {s.description}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Expected result badge */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 1.25,
                borderRadius: 1.5,
                bgcolor: selectedStatus.bgColor,
                border: `1px solid ${selectedStatus.borderColor}`,
              }}
            >
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: selectedStatus.color }}>
                Expected:
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#4B5563" }}>
                Order {"=>"} <strong>{selectedStatus.resultStatus}</strong>
                {status === "delivered" && " + Payment = Completed"}
                {status === "returned" && " + Stock restored"}
              </Typography>
            </Box>

            {/* OrderCode */}
            <TextField
              fullWidth
              size="small"
              label="OrderCode (Tracking Code) *"
              placeholder="e.g. GHNTK89127B"
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              sx={inputSx}
              helperText="GHN tracking code returned when creating shipment"
              FormHelperTextProps={{ sx: { fontSize: 11, color: "#9CA3AF", mt: 0.5 } }}
            />

            {/* ClientOrderCode */}
            <TextField
              fullWidth
              size="small"
              label="ClientOrderCode (Order ID)"
              placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
              value={clientOrderCode}
              onChange={(e) => setClientOrderCode(e.target.value)}
              sx={inputSx}
              helperText="Your system's Order ID (GUID). Used as fallback lookup."
              FormHelperTextProps={{ sx: { fontSize: 11, color: "#9CA3AF", mt: 0.5 } }}
            />

            {/* ReasonCode + Reason */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              <TextField
                fullWidth
                size="small"
                label="ReasonCode"
                placeholder="(optional)"
                value={reasonCode}
                onChange={(e) => setReasonCode(e.target.value)}
                sx={inputSx}
              />
              <TextField
                fullWidth
                size="small"
                label="Reason"
                placeholder="(optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                sx={inputSx}
              />
            </Box>

            {/* JSON preview */}
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#8A8A8A", textTransform: "uppercase", letterSpacing: 1 }}>
                  JSON Preview
                </Typography>
                <Tooltip title="Copy JSON">
                  <IconButton
                    size="small"
                    onClick={() => {
                      const json = JSON.stringify(
                        {
                          OrderCode: orderCode.trim(),
                          ClientOrderCode: clientOrderCode.trim(),
                          Status: status,
                          ReasonCode: reasonCode.trim(),
                          Reason: reason.trim(),
                        },
                        null,
                        2
                      );
                      navigator.clipboard.writeText(json);
                      toast.success("JSON copied!");
                    }}
                    sx={{ color: "#8A8A8A" }}
                  >
                    <ContentCopyIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: "#1E1E2E",
                  fontFamily: "monospace",
                  fontSize: 12,
                  color: "#A6E3A1",
                  whiteSpace: "pre",
                  overflow: "auto",
                  maxHeight: 160,
                  lineHeight: 1.6,
                }}
              >
                {JSON.stringify(
                  {
                    OrderCode: orderCode.trim() || "",
                    ClientOrderCode: clientOrderCode.trim() || "",
                    Status: status,
                    ReasonCode: reasonCode.trim() || "",
                    Reason: reason.trim() || "",
                  },
                  null,
                  2
                )}
              </Box>
            </Box>

            {/* Action buttons */}
            <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end", pt: 0.5 }}>
              <Button
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={handleReset}
                disabled={sendWebhook.isPending}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 999,
                  px: 2.5,
                  borderColor: "rgba(0,0,0,0.15)",
                  color: "#6B6B6B",
                  "&:hover": { borderColor: "rgba(0,0,0,0.3)", bgcolor: "rgba(0,0,0,0.02)" },
                }}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                startIcon={
                  sendWebhook.isPending ? (
                    <CircularProgress size={16} sx={{ color: "#fff" }} />
                  ) : (
                    <SendIcon sx={{ fontSize: 18 }} />
                  )
                }
                onClick={handleSend}
                disabled={sendWebhook.isPending || !orderCode.trim()}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 999,
                  px: 3,
                  bgcolor: selectedStatus.color,
                  "&:hover": { bgcolor: selectedStatus.color, filter: "brightness(0.9)" },
                  "&.Mui-disabled": { bgcolor: "rgba(0,0,0,0.12)" },
                }}
              >
                {sendWebhook.isPending ? "Sending..." : `Send "${selectedStatus.label}"`}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* ===== RIGHT: Activity Log ===== */}
        <Paper
          elevation={0}
          sx={{
            p: 0,
            borderRadius: 3,
            border: "1px solid rgba(0,0,0,0.08)",
            bgcolor: "#FFFFFF",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            maxHeight: "calc(100vh - 200px)",
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <HistoryIcon sx={{ color: "#B68C5A", fontSize: 22 }} />
              <Box>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#171717" }}>
                  Activity Log
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#8A8A8A" }}>
                  {logs.length} webhook{logs.length !== 1 ? "s" : ""} sent
                </Typography>
              </Box>
            </Box>
            {logs.length > 0 && (
              <Button
                size="small"
                onClick={() => setLogs([])}
                sx={{ textTransform: "none", fontSize: 12, color: "#8A8A8A" }}
              >
                Clear
              </Button>
            )}
          </Box>

          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 2,
              py: 1.5,
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {logs.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 8,
                  gap: 1.5,
                }}
              >
                <WebhookIcon sx={{ fontSize: 48, color: "rgba(0,0,0,0.08)" }} />
                <Typography sx={{ fontSize: 14, color: "#8A8A8A", fontWeight: 500 }}>
                  No webhooks sent yet
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#B0B0B0", textAlign: "center", maxWidth: 260 }}>
                  Fill in the form and click Send to simulate a GHN delivery update.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {logs.map((log) => (
                  <Box
                    key={log.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: `1px solid ${log.success ? "rgba(22,163,74,0.2)" : "rgba(220,38,38,0.2)"}`,
                      bgcolor: log.success ? "rgba(240,253,244,0.5)" : "rgba(254,242,242,0.5)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.75 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        {log.success ? (
                          <CheckCircleOutlineIcon sx={{ fontSize: 16, color: "#16A34A" }} />
                        ) : (
                          <ErrorOutlineIcon sx={{ fontSize: 16, color: "#DC2626" }} />
                        )}
                        <Chip
                          label={log.statusLabel}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            bgcolor: log.statusColor,
                            color: "#FFFFFF",
                          }}
                        />
                        <Chip
                          label={log.success ? "OK" : "FAILED"}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: 10,
                            fontWeight: 700,
                            bgcolor: log.success ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.12)",
                            color: log.success ? "#16A34A" : "#DC2626",
                          }}
                        />
                      </Box>
                      <Typography sx={{ fontSize: 10, color: "#9CA3AF", fontFamily: "monospace" }}>
                        {log.timestamp.toLocaleTimeString()}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
                      <Typography sx={{ fontSize: 11, color: "#6B7280" }}>
                        <strong>OrderCode:</strong> {log.payload.OrderCode}
                      </Typography>
                      {log.payload.ClientOrderCode && (
                        <Typography sx={{ fontSize: 11, color: "#6B7280" }}>
                          <strong>OrderID:</strong>{" "}
                          {log.payload.ClientOrderCode.length > 20
                            ? log.payload.ClientOrderCode.slice(0, 20) + "..."
                            : log.payload.ClientOrderCode}
                        </Typography>
                      )}
                    </Box>

                    {log.message && (
                      <Typography
                        sx={{
                          fontSize: 11,
                          color: log.success ? "#4B5563" : "#DC2626",
                          mt: 0.25,
                          wordBreak: "break-word",
                        }}
                      >
                        {log.message}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </>
  );
}
