import { Box, Button, Chip, Collapse, Paper, Typography } from "@mui/material";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";

import { ORDER_STATUS_LABEL, ORDER_TYPE_LABEL } from "../constants";
import type { OrderDto, OrderStatus, OrderType } from "../../../lib/types";
import { useOperationsOrderDetail } from "../../../lib/hooks/useOperationsOrders";
import type { StaffOrderDetailDto } from "../../../lib/types/staffOrders";
import { OrderDetailExpanded } from "../../../app/shared/components/OrderDetailExpanded";

export function OrderCard({
  order,
  expanded,
  onToggleExpand,
  onUpdateStatus,
  onCreateShipment,
  canCreateShipment,
}: {
  order: OrderDto;
  expanded: boolean;
  onToggleExpand: () => void;
  onUpdateStatus: (status: OrderStatus) => void;
  onCreateShipment: () => void;
  canCreateShipment: boolean;
}) {
  // Backend returns orderStatus, not status
  const actualStatus = (order as any).orderStatus || order.status;
  const statusLabel = ORDER_STATUS_LABEL[actualStatus as OrderStatus];
  const actualOrderType = ((order as any).orderType || order.orderType) as OrderType;
  const typeLabel = ORDER_TYPE_LABEL[actualOrderType];

  const { data: detailData, isLoading: detailLoading } = useOperationsOrderDetail(
    expanded ? order.id : undefined
  );
  const detail = detailData as StaffOrderDetailDto | undefined;

  const getStatusColors = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return {
          bgcolor: "rgba(14,165,233,0.12)",
          color: "#0369a1",
        };
      case "confirmed":
        return {
          bgcolor: "rgba(139,92,246,0.12)",
          color: "#5b21b6",
        };
      case "processing":
        return {
          bgcolor: "rgba(249,115,22,0.12)",
          color: "#c2410c",
        };
      case "shipped":
        return {
          bgcolor: "rgba(46,125,50,0.12)",
          color: "#2e7d32",
        };
      case "delivered":
      case "ready_to_ship":
      case "received":
        return {
          bgcolor: "rgba(46,125,50,0.12)",
          color: "#2e7d32",
        };
      default:
        return {
          bgcolor: "rgba(148,163,184,0.12)",
          color: "#475569",
        };
    }
  };

  const statusColors = getStatusColors(actualStatus);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
          cursor: "pointer",
        }}
        onClick={onToggleExpand}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Typography fontWeight={800} fontSize={14}>
            {order.orderNumber}
          </Typography>
          <Chip label={typeLabel} size="small" sx={{ fontWeight: 600 }} />
          <Chip
            label={statusLabel}
            size="small"
            sx={{
              bgcolor: statusColors.bgcolor,
              color: statusColors.color,
              fontWeight: 600,
            }}
          />
          {order.trackingNumber && (
            <Typography fontSize={12} color="text.secondary">
              {order.carrier} · {order.trackingNumber}
            </Typography>
          )}
        </Box>
        {expanded ? <ExpandLess /> : <ExpandMore />}
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          {detailLoading || !detail ? (
            <Typography fontSize={12} color="text.secondary">
              Loading detail...
            </Typography>
          ) : (
            <OrderDetailExpanded detail={detail} />
          )}
          <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
            {((order as any).orderType?.toLowerCase() || order.orderType?.toLowerCase()) !== "pre-order" && (
              <>
                {actualStatus?.toLowerCase() === "pending" && ((order as any).orderType?.toLowerCase() || order.orderType?.toLowerCase()) !== "pre-order" && (
                  <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); onUpdateStatus("Confirmed" as OrderStatus); }}>
                    Confirm
                  </Button>
                )}
                {(actualStatus?.toLowerCase() === "confirmed" || (actualStatus?.toLowerCase() === "pending" && ((order as any).orderType?.toLowerCase() || order.orderType?.toLowerCase()) !== "pre-order")) && (
                  <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); onUpdateStatus("Processing" as OrderStatus); }}>
                    Processing
                  </Button>
                )}
                {actualStatus?.toLowerCase() === "processing" && (
                  <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); onUpdateStatus("Shipped" as OrderStatus); }}>
                    Ready to ship
                  </Button>
                )}
                {((order as any).orderType?.toLowerCase() || order.orderType?.toLowerCase()) === "prescription" && actualStatus?.toLowerCase() === "processing" && (
                  <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); onUpdateStatus("Confirmed" as OrderStatus); }}>
                    Lens fitting
                  </Button>
                )}
                {canCreateShipment && (
                  <Button size="small" variant="contained" onClick={(e) => { e.stopPropagation(); onCreateShipment(); }}>
                    Create shipment
                  </Button>
                )}
              </>
            )}
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}
