import { Box, Button, Chip, FormControl, InputLabel, MenuItem, Paper, Select, Typography } from "@mui/material";

import { formatDate, SHIPMENT_STATUS_LABEL } from "../constants";
import type { ShipmentDto } from "../../../lib/types";

export function ShipmentCard({
  shipment,
  onUpdateTracking,
  isUpdating,
  trackingStatus,
  setTrackingStatus,
  onConfirmTracking,
  onCloseTracking,
}: {
  shipment: ShipmentDto;
  onUpdateTracking: () => void;
  isUpdating: boolean;
  trackingStatus: ShipmentDto["status"];
  setTrackingStatus: (s: ShipmentDto["status"]) => void;
  onConfirmTracking: () => void;
  onCloseTracking: () => void;
}) {
  const statusLabel = SHIPMENT_STATUS_LABEL[shipment.status];
  const events = shipment.trackingEvents ?? [];

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
        <Box>
          <Typography fontWeight={800} fontSize={14}>
            {shipment.orderNumber}
          </Typography>
          <Typography fontSize={12} color="text.secondary">
            {shipment.carrier} · {shipment.trackingNumber}
          </Typography>
          <Chip
            label={statusLabel}
            size="small"
            sx={{
              mt: 0.5,
              bgcolor: shipment.status === "delivered" ? "rgba(46,125,50,0.12)" : "rgba(25,118,210,0.12)",
              color: shipment.status === "delivered" ? "#2e7d32" : "#1976d2",
              fontWeight: 600,
            }}
          />
        </Box>
        {shipment.status !== "delivered" && (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {!isUpdating ? (
              <Button size="small" variant="outlined" onClick={onUpdateTracking}>
                Update tracking
              </Button>
            ) : (
              <>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={trackingStatus}
                    label="Status"
                    onChange={(e) => setTrackingStatus(e.target.value as ShipmentDto["status"])}
                  >
                    <MenuItem value="picked">Picked up</MenuItem>
                    <MenuItem value="in_transit">In transit</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                  </Select>
                </FormControl>
                <Button size="small" variant="contained" onClick={onConfirmTracking}>
                  Save
                </Button>
                <Button size="small" onClick={onCloseTracking}>
                  Cancel
                </Button>
              </>
            )}
          </Box>
        )}
      </Box>
      {events.length > 0 && (
        <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <Typography fontSize={11} color="text.secondary" sx={{ mb: 0.5 }}>
            History
          </Typography>
          {events.map((ev, i) => (
            <Typography key={i} fontSize={12} color="text.secondary">
              {formatDate(ev.date)} — {ev.description}
              {ev.location ? ` (${ev.location})` : ""}
            </Typography>
          ))}
        </Box>
      )}
    </Paper>
  );
}
