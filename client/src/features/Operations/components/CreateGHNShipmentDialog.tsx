import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PrintIcon from "@mui/icons-material/Print";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import { formatDate, ORDER_STATUS_LABEL, ORDER_TYPE_LABEL } from "../constants";
import type { OrderDto } from "../../../lib/types";
import { GHN_REQUIRED_NOTES } from "../../../lib/types/operations";
import type { CreateGHNOrderPayload } from "../../../lib/types/operations";
import {
  useCreateGHNOrder,
  useGetGHNPrintUrl,
} from "../../../lib/hooks/useOperationsOrders";
import { useCreateInventoryOutbound } from "../../../lib/hooks/useOperationsInventory";
import { toast } from "react-toastify";

type CreateGHNShipmentDialogProps = {
  open: boolean;
  onClose: () => void;
  order: OrderDto | null;
};

type DialogStep = "form" | "creating" | "success";

export function CreateGHNShipmentDialog({
  open,
  onClose,
  order,
}: CreateGHNShipmentDialogProps) {
  const items = order?.items || [];
  const visibleItems = items.slice(0, 2);
  const remainingItemsCount = Math.max(0, items.length - visibleItems.length);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Form state
  const [weight, setWeight] = useState(200);
  const [length, setLength] = useState(20);
  const [width, setWidth] = useState(15);
  const [height, setHeight] = useState(10);
  const [requiredNote, setRequiredNote] = useState("CHOXEMHANGKHONGTHU");
  const [error, setError] = useState<string | null>(null);

  // Result state
  const [step, setStep] = useState<DialogStep>("form");
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [printUrl, setPrintUrl] = useState<string | null>(null);
  const [outboundCreated, setOutboundCreated] = useState(false);

  // Hooks
  const createGHNOrder = useCreateGHNOrder();
  const getGHNPrintUrl = useGetGHNPrintUrl();
  const createOutbound = useCreateInventoryOutbound();

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setStep("form");
      setWeight(200);
      setLength(20);
      setWidth(15);
      setHeight(10);
      setRequiredNote("CHOXEMHANGKHONGTHU");
      setError(null);
      setTrackingCode(null);
      setPrintUrl(null);
      setOutboundCreated(false);
    }
  }, [open]);

  // Auto-scroll to top when error appears
  useEffect(() => {
    if (error && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [error]);

  const proceedToCreateGHNOrder = useCallback(
    (orderId: string, payload: CreateGHNOrderPayload) => {
      createGHNOrder.mutate(
        { orderId, payload },
        {
          onSuccess: (code: string) => {
            setTrackingCode(code);
            setStep("success");
            toast.success(`GHN order created! Tracking: ${code}`);

            // Fetch print URL (non-blocking)
            getGHNPrintUrl.mutate(orderId, {
              onSuccess: (url: string) => setPrintUrl(url),
              onError: () => {
                // Print URL fetch failure is non-critical
              },
            });
          },
          onError: (err: unknown) => {
            let msg = "Failed to create GHN shipping order";
            if (err instanceof Error) msg = err.message;
            else if (err && typeof err === "object") {
              const apiErr = err as { response?: { data?: string } };
              if (typeof apiErr.response?.data === "string")
                msg = apiErr.response.data;
            }
            setError(msg);
            setStep("form");
          },
        }
      );
    },
    [createGHNOrder, getGHNPrintUrl]
  );

  const handleSubmit = useCallback(() => {
    if (!order) return;
    setError(null);
    setStep("creating");

    const payload: CreateGHNOrderPayload = {
      weight,
      length,
      width,
      height,
      requiredNote,
    };

    // If outbound was already created (retry scenario), skip straight to GHN order
    if (outboundCreated) {
      proceedToCreateGHNOrder(order.id, payload);
      return;
    }

    // Step 1: Record outbound inventory first
    createOutbound.mutate(
      { orderId: order.id },
      {
        onSuccess: () => {
          setOutboundCreated(true);
          // Step 2: Create GHN order
          proceedToCreateGHNOrder(order.id, payload);
        },
        onError: (err: unknown) => {
          let msg = "Failed to create outbound record";
          if (err instanceof Error) msg = err.message;
          else if (err && typeof err === "object") {
            const apiErr = err as { response?: { data?: string } };
            if (typeof apiErr.response?.data === "string")
              msg = apiErr.response.data;
          }
          setError(msg);
          setStep("form");
        },
      }
    );
  }, [order, weight, length, width, height, requiredNote, outboundCreated, createOutbound, proceedToCreateGHNOrder]);

  const inputBaseSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      "& fieldset": { borderColor: "rgba(0,0,0,0.14)" },
      "&:hover fieldset": { borderColor: "rgba(0,0,0,0.26)" },
      "&.Mui-focused fieldset": { borderColor: "#B68C5A" },
      "&.Mui-focused": { boxShadow: "0 0 0 1px rgba(182,140,90,0.25)" },
    },
  } as const;

  const isFormValid = weight > 0 && length > 0 && width > 0 && height > 0;

  return (
    <Dialog
      open={open}
      onClose={step === "creating" ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2.5,
          boxShadow: "0 18px 45px rgba(15,23,42,0.16)",
          overflow: "hidden",
          width: { xs: "100%", sm: 600, md: 760, lg: 860 },
          maxWidth: "100%",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          maxHeight: "88vh",
          bgcolor: "#FFFFFF",
        }}
      >
        {/* Sticky header */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            px: 3,
            py: 1.75,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            bgcolor: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <LocalShippingIcon sx={{ color: "#B68C5A", fontSize: 22 }} />
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 600, color: "#171717" }}>
                {step === "success" ? "GHN Order Created" : "Create GHN Shipment"}
              </Typography>
              <Typography sx={{ mt: 0.25, fontSize: 12, color: "#6B6B6B" }}>
                {step === "success"
                  ? "Shipment has been registered with GHN"
                  : "Send this order to GHN for delivery"}
              </Typography>
            </Box>
          </Box>
          {step !== "creating" && (
            <IconButton
              edge="end"
              onClick={onClose}
              sx={{ color: "#6B6B6B" }}
              aria-label="Close"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Scrollable body */}
        <Box
          ref={scrollContainerRef}
          sx={{
            flex: 1,
            overflowY: "auto",
            px: 3,
            py: 2,
            msOverflowStyle: "none",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { width: 0, height: 0 },
          }}
        >
          {order ? (
            <>
              {/* Error banner */}
              {error && (
                <Box
                  sx={{
                    borderRadius: 1.5,
                    border: "1px solid rgba(220, 38, 38, 0.3)",
                    bgcolor: "rgba(254, 242, 242, 1)",
                    p: 1.5,
                    mb: 2,
                    display: "flex",
                    gap: 1,
                    alignItems: "flex-start",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#B91C1C",
                      lineHeight: 1.5,
                      wordBreak: "break-word",
                    }}
                  >
                    {error}
                  </Typography>
                </Box>
              )}

              {/* PreOrder warning banner */}
              {order.orderType === "PreOrder" && step === "form" && (
                <Box
                  sx={{
                    borderRadius: 1.5,
                    border: "1px solid rgba(202, 138, 4, 0.3)",
                    bgcolor: "rgba(253, 224, 71, 0.08)",
                    p: 1.5,
                    mb: 2,
                  }}
                >
                  <Typography
                    sx={{ fontSize: 12, fontWeight: 500, color: "#9A6E04", lineHeight: 1.5 }}
                  >
                    This is a <strong>Pre-Order</strong> item. Make sure inbound stock has been
                    approved before proceeding with shipment.
                  </Typography>
                </Box>
              )}

              {/* Order summary card */}
              <Box
                sx={{
                  borderRadius: 2,
                  border: "1px solid rgba(0,0,0,0.06)",
                  bgcolor: "#FAFAF8",
                  p: 1.75,
                  mb: 2,
                }}
              >
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
                  Order summary
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75, flexWrap: "wrap" }}>
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.5,
                      px: 1.25,
                      py: 0.25,
                      borderRadius: 999,
                      border: "1px solid rgba(0,0,0,0.08)",
                      bgcolor: "#FFFFFF",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "monospace",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#171717",
                        maxWidth: 220,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {order.id}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => navigator.clipboard.writeText(order.id)}
                      sx={{ p: 0.25, color: "#9CA3AF" }}
                    >
                      <ContentCopyIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                  <Chip
                    label={ORDER_TYPE_LABEL[order.orderType]}
                    size="small"
                    sx={{
                      height: 22,
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 600,
                      bgcolor: "#F5F3FF",
                      color: "#4C1D95",
                    }}
                  />
                  <Chip
                    label={ORDER_STATUS_LABEL[order.status]}
                    size="small"
                    sx={{
                      height: 22,
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 600,
                      bgcolor: "rgba(34,197,94,0.10)",
                      color: "#15803D",
                    }}
                  />
                </Box>
                <Typography fontSize={13} color="#4B5563">
                  {order.customerName} · {order.customerEmail}
                </Typography>
                <Typography
                  fontSize={13}
                  color="#6B7280"
                  sx={{
                    mt: 0.25,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {order.shippingAddress}
                </Typography>
                <Typography fontSize={12} color="#9CA3AF" sx={{ mt: 0.5 }}>
                  Created {formatDate(order.createdAt)}
                </Typography>

                <Box sx={{ mt: 1, borderTop: "1px solid rgba(0,0,0,0.06)", pt: 0.75 }}>
                  {visibleItems.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        fontSize: 12,
                        py: 0.25,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "#4B5563",
                          mr: 1,
                          flex: 1,
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.productName} × {item.quantity}
                      </Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>
                        {(item.price * item.quantity).toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </Typography>
                    </Box>
                  ))}
                  {remainingItemsCount > 0 && (
                    <Typography sx={{ fontSize: 11, color: "#9CA3AF", mt: 0.25 }}>
                      +{remainingItemsCount} more item{remainingItemsCount > 1 ? "s" : ""}
                    </Typography>
                  )}
                  <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline", mt: 0.75 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#4B5563", mr: 1 }}>
                      Total
                    </Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>
                      {order.totalAmount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* ===== FORM STEP ===== */}
              {step === "form" && (
                <Box
                  sx={{
                    borderRadius: 2,
                    border: "1px solid rgba(0,0,0,0.06)",
                    bgcolor: "#FFFFFF",
                    p: 1.75,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#8A8A8A",
                      textTransform: "uppercase",
                      letterSpacing: 1.4,
                      mb: 1.5,
                    }}
                  >
                    Package details (GHN)
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
                    {/* GHN carrier badge */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 1.25,
                        borderRadius: 1.5,
                        bgcolor: "#FFF7ED",
                        border: "1px solid rgba(234,179,8,0.2)",
                      }}
                    >
                      <LocalShippingIcon sx={{ color: "#D97706", fontSize: 18 }} />
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#92400E" }}>
                        Giao Hang Nhanh (GHN)
                      </Typography>
                      <Chip
                        label="Auto"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: 10,
                          fontWeight: 700,
                          bgcolor: "#D97706",
                          color: "#FFFFFF",
                          ml: "auto",
                        }}
                      />
                    </Box>

                    {/* Dimensions: 2×2 grid */}
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Weight (gram)"
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        inputProps={{ min: 1 }}
                        sx={inputBaseSx}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Length (cm)"
                        type="number"
                        value={length}
                        onChange={(e) => setLength(Number(e.target.value))}
                        inputProps={{ min: 1 }}
                        sx={inputBaseSx}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Width (cm)"
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(Number(e.target.value))}
                        inputProps={{ min: 1 }}
                        sx={inputBaseSx}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Height (cm)"
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value))}
                        inputProps={{ min: 1 }}
                        sx={inputBaseSx}
                      />
                    </Box>

                    {/* Required note */}
                    <TextField
                      fullWidth
                      size="small"
                      label="Required note"
                      select
                      value={requiredNote}
                      onChange={(e) => setRequiredNote(e.target.value)}
                      sx={inputBaseSx}
                      helperText="GHN delivery instruction for the shipper"
                      FormHelperTextProps={{
                        sx: { fontSize: 11, color: "rgba(0,0,0,0.55)", mt: 0.4 },
                      }}
                    >
                      {GHN_REQUIRED_NOTES.map((note) => (
                        <MenuItem key={note.value} value={note.value}>
                          {note.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Box>
              )}

              {/* ===== CREATING STEP ===== */}
              {step === "creating" && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 6,
                    gap: 2,
                  }}
                >
                  <CircularProgress sx={{ color: "#B68C5A" }} size={40} />
                  <Typography sx={{ fontSize: 14, color: "#6B6B6B", fontWeight: 500 }}>
                    Creating GHN shipping order...
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>
                    Recording outbound & sending to GHN
                  </Typography>
                </Box>
              )}

              {/* ===== SUCCESS STEP ===== */}
              {step === "success" && trackingCode && (
                <Box
                  sx={{
                    borderRadius: 2,
                    border: "1px solid rgba(34,197,94,0.3)",
                    bgcolor: "rgba(240,253,244,1)",
                    p: 2.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <CheckCircleOutlineIcon sx={{ color: "#16A34A", fontSize: 24 }} />
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#15803D" }}>
                      Shipment Created Successfully
                    </Typography>
                  </Box>

                  {/* Tracking code */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: "#FFFFFF",
                      border: "1px solid rgba(0,0,0,0.08)",
                      mb: 1.5,
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#8A8A8A", textTransform: "uppercase", letterSpacing: 1 }}>
                        Tracking Code
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: "#171717",
                          fontFamily: "monospace",
                          mt: 0.25,
                        }}
                      >
                        {trackingCode}
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={() => {
                        navigator.clipboard.writeText(trackingCode);
                        toast.success("Tracking code copied!");
                      }}
                      sx={{
                        color: "#6B6B6B",
                        "&:hover": { color: "#171717" },
                      }}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Box>

                  {/* Print URL */}
                  {printUrl ? (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<PrintIcon />}
                      onClick={() => window.open(printUrl, "_blank")}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderColor: "#B68C5A",
                        color: "#B68C5A",
                        borderRadius: 1.5,
                        py: 1,
                        "&:hover": {
                          bgcolor: "#B68C5A",
                          color: "#FFFFFF",
                          borderColor: "#B68C5A",
                        },
                      }}
                    >
                      Print GHN Shipping Label (A5)
                    </Button>
                  ) : getGHNPrintUrl.isPending ? (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, py: 1 }}>
                      <CircularProgress size={16} sx={{ color: "#B68C5A" }} />
                      <Typography sx={{ fontSize: 12, color: "#6B6B6B" }}>
                        Loading print URL...
                      </Typography>
                    </Box>
                  ) : null}

                  <Typography sx={{ fontSize: 11, color: "#6B7280", mt: 1.5, lineHeight: 1.6 }}>
                    The order status will be automatically updated via GHN webhooks:
                    <br />
                    <strong>Picked</strong> → Shipped &nbsp;|&nbsp;
                    <strong>Delivered</strong> → Delivered &nbsp;|&nbsp;
                    <strong>Returned</strong> → Cancelled
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            <Box
              sx={{
                minHeight: 160,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6B7280",
                fontSize: 14,
              }}
            >
              No order selected.
            </Box>
          )}
        </Box>

        {/* Sticky footer */}
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            zIndex: 2,
            px: 3,
            py: 1.75,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(0,0,0,0.06)",
            bgcolor: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(8px)",
          }}
        >
          {step === "success" ? (
            <>
              <Box />
              <Button
                variant="contained"
                onClick={onClose}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 999,
                  px: 3,
                  bgcolor: "#15803D",
                  "&:hover": { bgcolor: "#166534" },
                }}
              >
                Done
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={onClose}
                disabled={step === "creating"}
                sx={{ textTransform: "none", color: "#6B6B6B" }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!isFormValid || step === "creating"}
                startIcon={
                  step === "creating" ? (
                    <CircularProgress size={16} sx={{ color: "#FFFFFF" }} />
                  ) : (
                    <LocalShippingIcon sx={{ fontSize: 18 }} />
                  )
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 999,
                  px: 3,
                  bgcolor: "#B68C5A",
                  "&:hover": { bgcolor: "#9E7748" },
                }}
              >
                {step === "creating" ? "Creating..." : "Create GHN Order"}
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Dialog>
  );
}
