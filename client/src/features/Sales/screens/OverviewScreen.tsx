import {
  Box,
  Typography,
  Grid,
  Paper,
  LinearProgress,
  Avatar,
} from "@mui/material";
import { useAccount } from "../../../lib/hooks/useAccount";
import { useSales } from "../context/SalesContext";
import agent from "../../../lib/api/agent";
import { useEffect, useState } from "react";

export function OverviewScreen() {
  const { currentUser } = useAccount();
  const { orders, ordersLoading, meta } = useSales();
  const [topSellingProducts, setTopSellingProducts] = useState<Array<{
    name: string;
    quantity: number;
    imageUrl: string | null;
  }>>([]);
  const [topSellingLoading, setTopSellingLoading] = useState(false);

  const safeOrders = Array.isArray(orders) ? orders : [];
  const totalRevenue = safeOrders.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);

  useEffect(() => {
    const calculateTopSelling = async () => {
      if (safeOrders.length === 0) return;
      
      setTopSellingLoading(true);
      try {
        // Aggregate product sales by fetching order details
        type ProductSale = { name: string; totalAmount: number; quantity: number; imageUrl: string | null };
        const productSales = new Map<string, ProductSale>();

        for (const order of safeOrders) {
          try {
            const response = await agent.get(`/staff/orders/${order.id}`);
            const detail = response.data;
            
            if (detail.items && Array.isArray(detail.items)) {
              for (const item of detail.items) {
                const key = item.productName;
                const existing = productSales.get(key);
                productSales.set(key, {
                  name: item.productName,
                  totalAmount: (existing?.totalAmount || 0) + (item.totalPrice || 0),
                  quantity: (existing?.quantity || 0) + (item.quantity || 0),
                  imageUrl: item.productImageUrl || null,
                });
              }
            }
          } catch (err) {
            console.error(`Failed to fetch order ${order.id}:`, err);
          }
        }

        // Find top 3 selling by quantity
        if (productSales.size > 0) {
          const topProducts = Array.from(productSales.values())
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 3);
          setTopSellingProducts(topProducts);
        }
      } catch (err) {
        console.error("Failed to calculate top selling product:", err);
      } finally {
        setTopSellingLoading(false);
      }
    };

    if (!ordersLoading) {
      calculateTopSelling();
    }
  }, [safeOrders, ordersLoading]);

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4, lg: 6 },
        py: 4,
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography sx={{ fontSize: 12, letterSpacing: 6, textTransform: "uppercase", color: "text.secondary" }}>
          Sales Console
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 30, fontWeight: 900, color: "text.primary" }}>
          Welcome{currentUser?.displayName ? `, ${currentUser.displayName}` : ""}.
        </Typography>
        <Typography sx={{ mt: 1, color: "text.secondary", maxWidth: 520, fontSize: 14 }}>
          Track revenue, orders, and top performing products at a glance.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Typography fontSize={13} color="text.secondary">
              Total revenue
            </Typography>
            <Typography fontSize={26} fontWeight={900} mt={1} color="text.primary">
              {totalRevenue.toLocaleString("en-US", { style: "currency", currency: "USD" })}
            </Typography>
            {ordersLoading && (
              <LinearProgress sx={{ mt: 1.5, borderRadius: 1 }} />
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Typography fontSize={13} color="text.secondary">
              Total Order
            </Typography>
            <Typography fontSize={26} fontWeight={900} mt={1} color="text.primary">
              {ordersLoading ? "—" : meta?.totalCount ?? 0}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Typography fontSize={13} color="text.secondary">
              Top Selling Products
            </Typography>
            {topSellingLoading || ordersLoading ? (
              <>
                <Typography fontSize={26} fontWeight={900} mt={1} color="text.primary">
                  —
                </Typography>
                <LinearProgress sx={{ mt: 1.5, borderRadius: 1 }} />
              </>
            ) : topSellingProducts.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                {topSellingProducts.map((product, index) => (
                  <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography fontSize={24} fontWeight={900} color="primary.main" sx={{ minWidth: 40 }}>
                      {product.quantity}
                    </Typography>
                    <Avatar
                      src={product.imageUrl || ""}
                      alt={product.name}
                      sx={{ width: 48, height: 48, borderRadius: 1, flexShrink: 0 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontSize={13} fontWeight={600} color="text.primary" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {product.name}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography fontSize={12} color="text.secondary" mt={2}>
                No data available
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

