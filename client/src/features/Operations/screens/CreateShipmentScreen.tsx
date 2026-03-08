import { useState } from "react";
import {
  Box,
  LinearProgress,
  Paper,
  Typography,
  Chip,
  Pagination,
  Collapse,
  Divider,
  IconButton,
  Button,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useOperationsOrders, useOperationsOrderDetail, useUpdateOrderStatus } from "../../../lib/hooks/useOperationsOrders";
import type { StaffOrderDto, StaffOrderDetailDto } from "../../../lib/types/staffOrders";
import type { OrderStatus } from "../../../lib/types/operations";
import { OperationsPageHeader } from "../components/OperationsPageHeader";
import { OrdersTabs } from "../components/OrdersTabs";
import { OrderDetailExpanded } from "../../../app/shared/components/OrderDetailExpanded";

export function CreateShipmentScreen() {
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [shipmentDialogOpen, setShipmentDialogOpen] = useState(false);
  const [carrierName, setCarrierName] = useState("GHN");
  const [trackingCode, setTrackingCode] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [shippingNotes, setShippingNotes] = useState("");

  const { data, isLoading } = useOperationsOrders({
    pageNumber,
    pageSize,
    status: "Processing",
  });

  const safeOrders: StaffOrderDto[] = Array.isArray(data?.items)
    ? (data!.items as unknown as StaffOrderDto[])
    : [];
  const totalPages = data?.totalPages ?? 1;

  const updateStatus = useUpdateOrderStatus();

  const toggleSelected = (orderId: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const handleOpenShipmentDialog = () => {
    if (selectedOrderIds.length === 0) return;
    setShipmentDialogOpen(true);
  };

  const handleCloseShipmentDialog = () => {
    if (updateStatus.isPending) return;
    setShipmentDialogOpen(false);
  };

  const handleConfirmShipped = () => {
    const trimmedCarrier = carrierName.trim();
    if (!trimmedCarrier || selectedOrderIds.length === 0) return;

    const isoEstimated =
      estimatedDelivery.trim().length > 0
        ? new Date(estimatedDelivery).toISOString()
        : null;

    selectedOrderIds.forEach((orderId) => {
      updateStatus.mutate({
        orderId,
        status: "shipped" as OrderStatus,
        shipmentCarrierName: trimmedCarrier,
        shipmentTrackingCode: trackingCode || null,
        shipmentTrackingUrl: trackingUrl || null,
        shipmentEstimatedDeliveryAt: isoEstimated,
        shipmentNotes: shippingNotes || null,
      });
    });

    setShipmentDialogOpen(false);
    setSelectedOrderIds([]);
  };

  const getStatusColors = (status: string) => {
    switch (status) {
      case "Pending":
        return {
          border: "#0ea5e9",
          bg: "rgba(14,165,233,0.12)",
          color: "#0369a1",
        };
      case "Confirmed":
        return {
          border: "#8b5cf6",
          bg: "rgba(139,92,246,0.12)",
          color: "#5b21b6",
        };
      case "Processing":
        return {
          border: "#f97316",
          bg: "rgba(249,115,22,0.12)",
          color: "#c2410c",
        };
      case "Shipped":
      case "Delivered":
      case "Completed":
        return {
          border: "#22c55e",
          bg: "rgba(34,197,94,0.12)",
          color: "#15803d",
        };
      case "Cancelled":
      case "Refunded":
        return {
          border: "#ef4444",
          bg: "rgba(239,68,68,0.12)",
          color: "#b91c1c",
        };
      default:
        return {
          border: "rgba(148,163,184,0.8)",
          bg: "rgba(148,163,184,0.18)",
          color: "#475569",
        };
    }
  };

  return (
    <>
      <OperationsPageHeader
        title="Packing orders"
        subtitle="Orders in processing status that are ready to be shipped."
        rightSlot={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              Selected: {selectedOrderIds.length}
            </Typography>
            <Button
              size="small"
              variant="contained"
              disabled={selectedOrderIds.length === 0 || updateStatus.isPending}
              onClick={handleOpenShipmentDialog}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 999,
                px: 2.5,
                bgcolor: "#111827",
                "&:hover": { bgcolor: "#0f172a" },
              }}
            >
              Mark shipped
            </Button>
          </Box>
        }
      />
      <OrdersTabs active="packing" />

      <Box
        sx={{
          px: { xs: 0, md: 0 },
          height: "calc(100vh - 56px)",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid rgba(0,0,0,0.08)",
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {isLoading ? (
            <LinearProgress sx={{ borderRadius: 1 }} />
          ) : safeOrders.length === 0 ? (
            <Typography color="text.secondary">No operations orders yet.</Typography>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  mt: 1,
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  pr: { md: 1 },
                  scrollbarWidth: "none",
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                }}
              >
                {safeOrders.map((o) => (
                  <OperationsOrderRow
                    key={o.id}
                    summary={o}
                    getStatusColors={getStatusColors}
                    selected={selectedOrderIds.includes(o.id)}
                    onToggleSelected={toggleSelected}
                  />
                ))}
              </Box>

              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, pt: 1 }}>
                  <Pagination
                    count={totalPages}
                    page={pageNumber}
                    onChange={(_, page) => setPageNumber(page)}
                    color="primary"
                    size="small"
                  />
                </Box>
              )}
            </>
          )}
        </Paper>
      </Box>

      <Dialog
        open={shipmentDialogOpen}
        onClose={handleCloseShipmentDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Mark shipped</DialogTitle>
        <DialogContent sx={{ pt: 1.5, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Shipping carrier"
            fullWidth
            required
            value={carrierName}
            onChange={(e) => setCarrierName(e.target.value)}
          />
          <TextField
            label="Tracking code"
            fullWidth
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
          />
          <TextField
            label="Tracking URL"
            fullWidth
            value={trackingUrl}
            onChange={(e) => setTrackingUrl(e.target.value)}
          />
          <TextField
            label="Estimated delivery date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={estimatedDelivery}
            onChange={(e) => setEstimatedDelivery(e.target.value)}
          />
          <TextField
            label="Shipping notes"
            fullWidth
            multiline
            minRows={2}
            value={shippingNotes}
            onChange={(e) => setShippingNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseShipmentDialog}
            disabled={updateStatus.isPending}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmShipped}
            disabled={selectedOrderIds.length === 0 || updateStatus.isPending || !carrierName.trim()}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              px: 2.5,
            }}
          >
            Confirm shipped
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function OperationsOrderRow({
  summary,
  getStatusColors,
  selected,
  onToggleSelected,
}: {
  summary: StaffOrderDto;
  getStatusColors: (status: string) => { border: string; bg: string; color: string };
  selected: boolean;
  onToggleSelected: (orderId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading } = useOperationsOrderDetail(summary.id);
  const detail = data as StaffOrderDetailDto | undefined;

  const { border, bg, color } = getStatusColors(summary.orderStatus);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.08)",
        px: 3,
        py: 2.5,
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Checkbox
            size="small"
            checked={selected}
            onChange={() => onToggleSelected(summary.id)}
          />
          <Typography sx={{ fontWeight: 700 }}>
            Order ID: {summary.id}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Chip
            label={summary.orderStatus}
            size="small"
            sx={{
              fontWeight: 700,
              textTransform: "capitalize",
              border: `1px solid ${border}`,
              bgcolor: bg,
              color,
            }}
          />
          <IconButton
            size="small"
            onClick={() => setExpanded((e) => !e)}
            sx={{ ml: 0.5 }}
          >
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          fontSize: 13,
          color: "text.secondary",
        }}
      >
        <Typography sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <b>Source:</b>
          <Box
            component="span"
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: 1,
              border: "1px solid #22c55e",
              bgcolor: "rgba(34,197,94,0.12)",
              color: "#15803d",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {summary.orderSource}
          </Box>
        </Typography>
        <Typography sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <b>Type:</b>
          <Box
            component="span"
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: 1,
              border: "1px solid #0ea5e9",
              bgcolor: "rgba(14,165,233,0.12)",
              color: "#0369a1",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {summary.orderType}
          </Box>
        </Typography>
        <Typography>
          <b>Items:</b> {summary.itemCount}
        </Typography>
        <Typography>
          <b>Created:</b>{" "}
          {new Date(summary.createdAt).toLocaleString()}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
          Total amount
        </Typography>
        <Typography sx={{ fontSize: 18, fontWeight: 900 }}>
          {summary.finalAmount.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        </Typography>
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider sx={{ my: 1.5 }} />
        {isLoading || !detail ? (
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            Loading detail...
          </Typography>
        ) : (
          <OrderDetailExpanded detail={detail} />
        )}
      </Collapse>
    </Paper>
  );
}
