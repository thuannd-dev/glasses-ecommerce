import { useMemo, useState } from "react";
import { Box, Grid, InputAdornment, LinearProgress, Paper, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TrackChangesOutlined from "@mui/icons-material/TrackChangesOutlined";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { isSameDay } from "date-fns";

import { useOperations } from "../context/OperationsContext";
import { ShipmentCard, SummaryCard } from "../components";
import type { ShipmentDto } from "../../../lib/types";

function filterAndSortShipments(
  list: ShipmentDto[],
  searchQuery: string,
  dateFilter: Date | null
): ShipmentDto[] {
  let filtered = list;
  const q = searchQuery.trim().toLowerCase();
  if (q) {
    filtered = filtered.filter(
      (s) =>
        s.orderNumber.toLowerCase().includes(q) ||
        s.trackingNumber.toLowerCase().includes(q)
    );
  }
  if (dateFilter) {
    filtered = filtered.filter((s) => isSameDay(new Date(s.createdAt), dateFilter));
  }
  return [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function TrackingScreen() {
  const { shipments, shipmentsLoading, updateTracking } = useOperations();
  const [trackingShipId, setTrackingShipId] = useState<string | null>(null);
  const [trackingStatus, setTrackingStatus] = useState<ShipmentDto["status"]>("in_transit");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | null>(null);

  const inTransitCount = shipments.filter((s) => s.status === "in_transit" || s.status === "picked").length;
  const filteredShipments = useMemo(
    () => filterAndSortShipments(shipments, searchQuery, dateFilter),
    [shipments, searchQuery, dateFilter]
  );

  const handleUpdateTracking = (shipmentId: string) => {
    updateTracking.mutate(
      { shipmentId, status: trackingStatus },
      { onSuccess: () => setTrackingShipId(null) }
    );
  };

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 12, letterSpacing: 5, textTransform: "uppercase", color: "text.secondary" }}>
          Operations Center
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 26, fontWeight: 900 }} color="text.primary">
          Update tracking
        </Typography>
        <Typography sx={{ mt: 0.5, color: "text.secondary", fontSize: 14 }}>
          Update shipment status: picked up, in transit, delivered.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <SummaryCard label="In transit" value={shipmentsLoading ? "—" : inTransitCount} />
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TrackChangesOutlined sx={{ color: "text.secondary" }} />
            <Typography fontSize={16} fontWeight={800}>
              Shipments
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
            <TextField
              size="small"
              placeholder="Order # or tracking number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 220 }}
            />
            <DatePicker
              label="Date"
              value={dateFilter}
              onChange={(d) => setDateFilter(d ?? null)}
              slotProps={{ textField: { size: "small", sx: { minWidth: 160 } } }}
            />
          </Box>
        </Box>
        {shipmentsLoading ? (
          <LinearProgress sx={{ borderRadius: 1 }} />
        ) : filteredShipments.length === 0 ? (
          <Typography color="text.secondary">No shipments yet.</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {filteredShipments.map((ship) => (
              <ShipmentCard
                key={ship.id}
                shipment={ship}
                onUpdateTracking={() => setTrackingShipId(ship.id)}
                isUpdating={trackingShipId === ship.id}
                trackingStatus={trackingStatus}
                setTrackingStatus={setTrackingStatus}
                onConfirmTracking={() => handleUpdateTracking(ship.id)}
                onCloseTracking={() => setTrackingShipId(null)}
              />
            ))}
          </Box>
        )}
      </Paper>
    </>
  );
}
