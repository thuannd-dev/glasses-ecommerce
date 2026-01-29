import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Button,
    Divider,
    Stack,
} from "@mui/material";

/* ================= TYPES ================= */

export type OrderStatus =
    | "PENDING"
    | "PROCESSING"
    | "SHIPPING"
    | "COMPLETED"
    | "CANCELLED";

interface OrderProduct {
    id: string;
    name: string;
    variant: string;
    quantity: number;
    price: number;
    image: string;
}

interface OrderCardProps {
    orderId: string;
    status: OrderStatus;
    orderDate: string;
    totalPrice: number;
    product: OrderProduct;
}

/* ================= HELPERS ================= */

function getStatusLabel(status: OrderStatus) {
    switch (status) {
        case "PENDING":
            return { label: "Đã đặt", color: "info" as const };
        case "PROCESSING":
            return { label: "Đang xử lý", color: "warning" as const };
        case "SHIPPING":
            return { label: "Đang giao", color: "warning" as const };
        case "COMPLETED":
            return { label: "Hoàn thành", color: "success" as const };
        case "CANCELLED":
            return { label: "Đã hủy", color: "error" as const };
        default:
            return { label: "Không rõ", color: "default" as const };
    }
}

function formatPrice(price: number) {
    return price.toLocaleString("vi-VN") + "₫";
}

/* ================= COMPONENT ================= */

export default function OrderCard({
    orderId,
    status,
    orderDate,
    totalPrice,
    product,
}: OrderCardProps) {
    const statusUI = getStatusLabel(status);

    return (
        <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 3 }}>
            <CardContent>
                {/* Header */}
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Typography fontWeight={700}>
                        Đơn hàng #{orderId}
                    </Typography>

                    <Chip
                        label={statusUI.label}
                        color={statusUI.color}
                        size="small"
                    />
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Product */}
                <Box display="flex" gap={2}>
                    <Box
                        component="img"
                        src={product.image}
                        alt={product.name}
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: 2,
                            objectFit: "cover",
                        }}
                    />

                    <Box flex={1}>
                        <Typography fontWeight={600}>
                            {product.name}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {product.variant}
                        </Typography>

                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                            Số lượng: {product.quantity}
                        </Typography>
                    </Box>

                    <Typography fontWeight={600}>
                        {formatPrice(product.price)}
                    </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Footer */}
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Box>
                        <Typography variant="body2">
                            Ngày đặt: <b>{orderDate}</b>
                        </Typography>

                        <Typography fontWeight={700} color="primary">
                            Tổng tiền: {formatPrice(totalPrice)}
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={1}>
                        <Button variant="outlined" size="small">
                            Xem chi tiết
                        </Button>

                        {status === "PENDING" && (
                            <Button
                                variant="contained"
                                color="error"
                                size="small"
                            >
                                Hủy đơn
                            </Button>
                        )}
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
}
