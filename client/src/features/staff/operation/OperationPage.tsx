import { useState } from "react";
import {
  Box,
  Container,
  Tabs,
  Tab,
  Card,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import QueueIcon from "@mui/icons-material/Queue";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OrderQueue from "./components/OrderQueue";
import InProductionOrders from "./components/InProductionOrders";
import CompletedOrders from "./components/CompletedOrders";

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function OperationPage() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Container maxWidth="xl" sx={{ pt: 8, pb: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Operation Center
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Manage order fulfillment and track order lifecycle
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Monitor orders through the complete fulfillment workflow: confirmed orders → processing → completed orders
      </Alert>

      <Card sx={{ mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(_, value) => setTabValue(value)}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "#fafafa",
          }}
        >
          <Tab
            icon={<QueueIcon />}
            label="Order Queue"
            id="tab-0"
            aria-controls="tabpanel-0"
            iconPosition="start"
            sx={{ minWidth: 200 }}
          />
          <Tab
            icon={<BuildCircleIcon />}
            label="In Production"
            id="tab-1"
            aria-controls="tabpanel-1"
            iconPosition="start"
            sx={{ minWidth: 200 }}
          />
          <Tab
            icon={<CheckCircleIcon />}
            label="Completed Orders"
            id="tab-2"
            aria-controls="tabpanel-2"
            iconPosition="start"
            sx={{ minWidth: 200 }}
          />
          <Tab
            icon={<LocalShippingIcon />}
            label="Shipment Management"
            id="tab-3"
            aria-controls="tabpanel-3"
            iconPosition="start"
            sx={{ minWidth: 200 }}
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <OrderQueue />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <InProductionOrders />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <CompletedOrders />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 3, textAlign: "center" }}>
            <LocalShippingIcon sx={{ fontSize: 60, color: "action.disabled", mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Shipment Management
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Manage shipments, tracking information, and processing of refund requests
              <br />
              approved from the Process Tickets section in Sale/Support tab.
            </Typography>
          </Box>
        </TabPanel>
      </Card>

      {/* Info Section */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 2, mt: 1 }}>
        <Box>
          <Paper sx={{ p: 2, bgcolor: "#fff3e0", border: "1px solid #ffb74d" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              📦 Order Queue
            </Typography>
            <Typography variant="body2">
              View all confirmed orders ready to be processed. Select lens for prescription orders and manage order preparation.
            </Typography>
          </Paper>
        </Box>
        <Box>
          <Paper sx={{ p: 2, bgcolor: "#e3f2fd", border: "1px solid #64b5f6" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              🔧 In Production
            </Typography>
            <Typography variant="body2">
              Track orders actively being processed. Update order status as items are prepared, packed, and ready for shipment.
            </Typography>
          </Paper>
        </Box>
        <Box>
          <Paper sx={{ p: 2, bgcolor: "#e8f5e9", border: "1px solid #81c784" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              ✓ Completed Orders
            </Typography>
            <Typography variant="body2">
              View completed and delivered orders. Access order history and details for reference.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
