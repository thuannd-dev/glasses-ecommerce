/**
 * Layout tokens for the embedded lens configurator (full page under navbar).
 * Wider canvas, grid balance, spacing rhythm — luxury / editorial feel.
 */
export const LENS_CONFIGURATOR_MAX_WIDTH_PX = 1520;

/** Grid: left summary ~44–46%, right task ~54–56% on md+; single column on mobile. */
export const lensEmbeddedGridSx = {
    display: "grid",
    boxSizing: "border-box" as const,
    alignItems: "start",
    gridTemplateColumns: {
        xs: "minmax(0, 1fr)",
        md: "minmax(0, 0.44fr) minmax(0, 0.56fr)",
        lg: "minmax(0, 0.45fr) minmax(0, 0.55fr)",
    },
    columnGap: { xs: 0, md: 4, lg: 6 },
    rowGap: { xs: 3, md: 0 },
};
