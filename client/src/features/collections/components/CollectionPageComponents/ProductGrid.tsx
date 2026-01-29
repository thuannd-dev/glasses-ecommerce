import { Grid } from "@mui/material";
import type { Product } from "../../types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: Product[] }) {
    return (
        <Grid container spacing={2.5}>
            {products.map((p) => (
                <Grid key={p.id} item xs={12} sm={6} md={4} lg={3}>
                    <ProductCard p={p} />
                </Grid>
            ))}
        </Grid>
    );
}
