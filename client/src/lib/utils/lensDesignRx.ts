/**
 * Normalize API `lensDesign` strings (e.g. "SingleVision", "Bifocal") for comparison.
 */
export function normalizeLensDesignLabel(raw: string | null | undefined): string {
    return (raw ?? "").trim().toLowerCase().replace(/\s+/g, "");
}

/**
 * Filter compatible variants by prescription ADD vs variant `lensDesign` from the API.
 * - No positive ADD → only `"SingleVision"`.
 * - Positive ADD → `"Bifocal"` or `"Progressive"` (aligned with `LensAttributesTab` multifocal).
 */
export function variantMatchesPrescriptionLensDesign(
    lensDesign: string | null | undefined,
    hasPositiveAdd: boolean,
): boolean {
    const d = normalizeLensDesignLabel(lensDesign);
    if (!hasPositiveAdd) {
        return d === "singlevision";
    }
    return d === "bifocal" || d === "progressive";
}
