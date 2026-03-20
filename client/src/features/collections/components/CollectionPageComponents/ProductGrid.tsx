import { Box, Grid } from "@mui/material";
import type { Product } from "../../../../lib/types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: Product[] }) {
    return (
        <Box>
            <Grid container spacing={3.5}>
                {products.map((p) => (
                    <Grid key={p.id} item xs={12} sm={6} md={3} lg={3}>
                        <ProductCard p={p} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
