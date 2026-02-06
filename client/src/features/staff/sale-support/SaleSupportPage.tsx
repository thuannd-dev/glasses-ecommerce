import { useState } from "react";
import {
  Box,
  Container,
  Tabs,
  Tab,
  Card,
  Typography,
  Paper,
} from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ViewOrders from "./components/ViewOrders";
import ProcessTickets from "./components/ProcessTickets";

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
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

export default function SaleSupportPage() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Container maxWidth="xl" sx={{ pt: 8, pb: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Sale/Support Center
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Manage customer orders and handle warranty/return/refund requests
        </Typography>
      </Box>

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
            icon={<StorefrontIcon />}
            label="View Orders"
            id="tab-0"
            aria-controls="tabpanel-0"
            iconPosition="start"
            sx={{ minWidth: 200 }}
          />
          <Tab
            icon={<AssignmentIcon />}
            label="Process Tickets"
            id="tab-1"
            aria-controls="tabpanel-1"
            iconPosition="start"
            sx={{ minWidth: 200 }}
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <ViewOrders />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ProcessTickets />
        </TabPanel>
      </Card>

      {/* Help Section */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 2, mt: 1 }}>
        <Box>
          <Paper sx={{ p: 2, bgcolor: "#e3f2fd", border: "1px solid #90caf9" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              📋 View Orders
            </Typography>
            <Typography variant="body2">
              Search and manage customer orders. Edit prescription information, glasses model, lens type, and quantities before confirmation. Confirmed orders are queued to the Operation tab.
            </Typography>
          </Paper>
        </Box>
        <Box>
          <Paper sx={{ p: 2, bgcolor: "#f3e5f5", border: "1px solid #ce93d8" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              🎫 Process Tickets
            </Typography>
            <Typography variant="body2">
              Handle warranty, return, and refund requests. System automatically denies tickets violating policy constraints. Approved tickets are sent to Operation tab for further processing.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
