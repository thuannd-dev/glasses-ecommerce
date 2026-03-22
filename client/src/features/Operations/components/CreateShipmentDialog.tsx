import { useEffect, useRef } from "react";
import { Box, Button, Chip, Dialog, IconButton, TextField, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import { formatDate, ORDER_STATUS_LABEL, ORDER_TYPE_LABEL } from "../constants";
import type { OrderDto } from "../../../lib/types";

type CreateShipmentDialogProps = {
  open: boolean;
  onClose: () => void;
  order: OrderDto | null;
  carrier: string;
  setCarrier: (v: string) => void;
  trackingNumber: string;
  setTrackingNumber: (v: string) => void;
  trackingUrl: string;
  setTrackingUrl: (v: string) => void;
  estimatedDeliveryDate: string;
  setEstimatedDeliveryDate: (v: string) => void;
  shippingNotes: string;
  setShippingNotes: (v: string) => void;
  carriers: string[];
  onSubmit: () => void;
  isPending: boolean;
  error?: string | null;
};

export function CreateShipmentDialog({
  open,
  onClose,
  order,
  carrier,
  setCarrier,
  trackingNumber,
  setTrackingNumber,
  trackingUrl,
  setTrackingUrl,
  estimatedDeliveryDate,
  setEstimatedDeliveryDate,
  shippingNotes,
  setShippingNotes,
  carriers,
  onSubmit,
  isPending,
  error,
}: CreateShipmentDialogProps) {
  const items = order?.items || [];
  const visibleItems = items.slice(0, 2);
  const remainingItemsCount = Math.max(0, items.length - visibleItems.length);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const inputBaseSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      "& fieldset": {
        borderColor: "rgba(0,0,0,0.14)",
      },
      "&:hover fieldset": {
        borderColor: "rgba(0,0,0,0.26)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#B68C5A",
      },
      "&.Mui-focused": {
        boxShadow: "0 0 0 1px rgba(182,140,90,0.25)",
      },
    },
  } as const;

  // Auto-fill tracking URL when carrier is selected
  useEffect(() => {
    const carrierUrls: Record<string, string> = {
      GHN: "https://ghn.vn",
      GHTK: "https://ghtk.vn",
    };

    if (carrier && carrierUrls[carrier]) {
      setTrackingUrl(carrierUrls[carrier]);
    }
  }, [carrier, setTrackingUrl]);

  // Auto-scroll to top when error appears
  useEffect(() => {
    if (error && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [error]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: "#171717" }}>
              Create shipment
            </Typography>
            <Typography sx={{ mt: 0.25, fontSize: 12, color: "#6B6B6B" }}>
              Fill carrier and tracking info
            </Typography>
          </Box>
          <IconButton
            edge="end"
            onClick={onClose}
            sx={{ color: "#6B6B6B" }}
            aria-label="Close"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
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
            "&::-webkit-scrollbar": {
              width: 0,
              height: 0,
            },
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
                    ❌ {error}
                  </Typography>
                </Box>
              )}

              {/* PreOrder warning banner */}
              {order.orderType === "PreOrder" && (
                <Box
                  sx={{
                    borderRadius: 1.5,
                    border: "1px solid rgba(202, 138, 4, 0.3)",
                    bgcolor: "rgba(253, 224, 71, 0.08)",
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
                      color: "#9A6E04",
                      lineHeight: 1.5,
                    }}
                  >
                    ⚠️ This is a <strong>Pre-Order</strong> item. Make sure inbound stock has been
                    approved before proceeding with shipment. Items must be fulfilled from inbound
                    approval before they can be shipped.
                  </Typography>
                </Box>
              )}

              {/* Order summary (compact card) */}
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

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.75,
                    flexWrap: "wrap",
                  }}
                >
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
                      +{remainingItemsCount} more item
                      {remainingItemsCount > 1 ? "s" : ""}
                    </Typography>
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "baseline",
                      mt: 0.75,
                    }}
                  >
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#4B5563", mr: 1 }}>
                      Total
                    </Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>
                      {order.totalAmount.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Shipment form card */}
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
                  Shipment details
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Shipping carrier"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    select
                    SelectProps={{ native: true }}
                    sx={inputBaseSx}
                    disabled={carriers.length === 0}
                  >
                    {carriers.length === 0 ? (
                      <option value="">Loading carriers...</option>
                    ) : (
                      carriers.map((carrierName) => (
                        <option key={carrierName} value={carrierName}>
                          {carrierName}
                        </option>
                      ))
                    )}
                  </TextField>

                  <Box>
                    <TextField
                      fullWidth
                      size="small"
                      label="Tracking code"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. VN123456789"
                      required
                      sx={inputBaseSx}
                    />
                    {!trackingNumber.trim() && (
                      <Typography color="error" sx={{ fontSize: 11, mt: 0.5 }}>
                        Tracking code is required
                      </Typography>
                    )}
                  </Box>

                  <TextField
                    fullWidth
                    size="small"
                    label="Tracking URL"
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    placeholder="e.g. https://ghn.vn"
                    sx={inputBaseSx}
                    helperText="Auto-filled from carrier. You can edit."
                    FormHelperTextProps={{
                      sx: { fontSize: 11, color: "rgba(0,0,0,0.55)", mt: 0.4 },
                    }}
                  />

                  <TextField
                    fullWidth
                    size="small"
                    label="Estimated delivery date"
                    type="date"
                    value={estimatedDeliveryDate}
                    onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={inputBaseSx}
                  />

                  <TextField
                    fullWidth
                    size="small"
                    label="Shipping notes"
                    value={shippingNotes}
                    onChange={(e) => setShippingNotes(e.target.value)}
                    multiline
                    minRows={3}
                    placeholder="Add any additional shipping notes..."
                    sx={inputBaseSx}
                  />
                </Box>
              </Box>
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
          <Button onClick={onClose} sx={{ textTransform: "none", color: "#6B6B6B" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={!trackingNumber.trim() || isPending}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 999,
              px: 3,
              bgcolor: "#B68C5A",
              "&:hover": {
                bgcolor: "#9E7748",
              },
            }}
          >
            {isPending ? "Saving…" : "Save shipment"}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
