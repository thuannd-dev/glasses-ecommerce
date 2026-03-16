import { useState } from "react";
import { Box, Checkbox, Chip, Collapse, IconButton, Paper, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import {
  ORDER_CARD_TOKENS,
  getStatusChipColors,
  type OrderListCardMode,
} from "./orderListCardTheme";
import { useOperationsOrderDetail } from "../../../lib/hooks/useOperationsOrders";
import type { StaffOrderDto, StaffOrderDetailDto } from "../../../lib/types/staffOrders";
import { OrderDetailExpanded } from "../../../app/shared/components/OrderDetailExpanded";

export interface OrderListCardProps {
  mode: OrderListCardMode;
  summary: StaffOrderDto;
  showCheckbox?: boolean;
  selected?: boolean;
  onToggleSelected?: (orderId: string) => void;
  /** Optional actions in the expanded detail area */
  onProcessingClick?: (orderId: string) => void;
  onMarkShippedClick?: (orderId: string) => void;
  onMarkDeliveredClick?: (orderId: string) => void;
}

export function OrderListCard({
  mode,
  summary,
  showCheckbox,
  selected,
  onToggleSelected,
  onProcessingClick,
  onMarkShippedClick,
  onMarkDeliveredClick,
}: OrderListCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading } = useOperationsOrderDetail(expanded ? summary.id : undefined);
  const detail = data as StaffOrderDetailDto | undefined;

  const { bg, color, border } = getStatusChipColors(summary.orderStatus, mode);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary.id);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: ORDER_CARD_TOKENS.radius,
        border: ORDER_CARD_TOKENS.border,
        bgcolor: "#FFFFFF",
        boxShadow: ORDER_CARD_TOKENS.shadow,
        px: ORDER_CARD_TOKENS.gutterX,
        py: 2.25,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: ORDER_CARD_TOKENS.shadowHover,
          borderColor: "rgba(0,0,0,0.12)",
        },
      }}
    >
      {/* Row 1: Order ID pill + status + actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
          {showCheckbox && (
            <Checkbox
              size="small"
              checked={!!selected}
              onChange={() => onToggleSelected?.(summary.id)}
              sx={{ mr: 0.25 }}
            />
          )}

          <Typography component="span" sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600 }}>
            Order
          </Typography>
          <Box
            component="button"
            type="button"
            onClick={handleCopy}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              px: 1.5,
              py: 0.5,
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.08)",
              bgcolor: "#F7F7F7",
              fontFamily: "monospace",
              fontSize: 13,
              fontWeight: 600,
              color: "#171717",
              cursor: "pointer",
              "&:hover": { bgcolor: "#EFEFEF" },
            }}
          >
            {summary.id}
            <ContentCopyIcon sx={{ fontSize: 14, color: "#8A8A8A" }} />
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
          {/* Current status chip */}
          <Chip
            label={summary.orderStatus}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: 12,
              textTransform: "capitalize",
              border: `1px solid ${border}`,
              bgcolor: bg,
              color,
              borderRadius: 999,
              height: 26,
              px: 1.25,
            }}
          />

          <IconButton
            size="small"
            onClick={() => setExpanded((e) => !e)}
            sx={{ color: "#6B6B6B" }}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Box>

      {/* Row 2: meta */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1,
          fontSize: 13,
          color: "#6B6B6B",
        }}
      >
        <Typography component="span" sx={{ fontSize: 13, color: "#6B6B6B" }}>
          {summary.itemCount} item{summary.itemCount !== 1 ? "s" : ""}
        </Typography>
        <Typography component="span" sx={{ color: "rgba(0,0,0,0.3)", mx: 0.25 }}>
          •
        </Typography>
        <Typography component="span" sx={{ fontSize: 13, color: "#6B6B6B" }}>
          {new Date(summary.createdAt).toLocaleString()}
        </Typography>

        {/* Info pills for non-shipped modes */}
        {(mode === "confirmed" || mode === "packing") && (
          <>
            <Typography component="span" sx={{ color: "rgba(0,0,0,0.3)", mx: 0.25 }}>
              •
            </Typography>
            <Chip
              label={summary.orderSource}
              size="small"
              sx={{
                height: 22,
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
                bgcolor: "#ECFEFF",
                color: "#0369A1",
              }}
            />
            <Chip
              label={summary.orderType}
              size="small"
              sx={{
                height: 22,
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
                bgcolor: "#EEF2FF",
                color: "#3730A3",
              }}
            />
            {summary.orderType === "PreOrder" && summary.prescriptions && summary.prescriptions.length > 0 && (
              <>
                <Typography component="span" sx={{ color: "rgba(0,0,0,0.3)", mx: 0.25 }}>
                  •
                </Typography>
                <Chip
                  label="📋 Prescription"
                  size="small"
                  sx={{
                    height: 22,
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 600,
                    bgcolor: "#FEF3C7",
                    color: "#92400E",
                  }}
                />
              </>
            )}
          </>
        )}
      </Box>

      {/* Row 3: total amount */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontSize: 13, color: "#8A8A8A", fontWeight: 500 }}>
          Total amount
        </Typography>
        <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#171717" }}>
          {summary.finalAmount.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        </Typography>
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {isLoading || !detail ? (
            <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>Loading detail...</Typography>
          ) : (
            <>
              <OrderDetailExpanded 
                detail={detail} 
                showProcessButton={mode === "confirmed" || mode === "packing"}
                onProcessOrderClick={onProcessingClick}
                showAddTrackingButton={mode === "confirmed" || mode === "packing"}
                onAddTrackingClick={onMarkShippedClick}
                onMarkDeliveredClick={onMarkDeliveredClick}
              />
            </>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}

