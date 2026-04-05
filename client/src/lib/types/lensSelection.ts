/** User’s lens path on the select-lenses page (before / inside prescription flow). */
export type LensSelectionOption = "non-prescription" | "prescription";

/** First-step usage row (maps to prescription vs non-RX). */
export type LensUsagePick = "single-vision" | "non-prescription";

/** Client-side cart line metadata (sessionStorage). */
export type CartLensMode = LensSelectionOption;
