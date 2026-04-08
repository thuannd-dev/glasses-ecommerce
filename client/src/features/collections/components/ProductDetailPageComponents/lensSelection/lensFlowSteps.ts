/** Same labels across Usage, prescription method, and manual RX screens (matches retail flows). */
export const LENS_WIZARD_STEPS = ["Usage", "Prescription", "Lens", "Review"] as const;

/** Keeps progress UI and aria-current in sync when callers pass an out-of-range index. */
export function clampLensProgressStepIndex(index: number, stepCount: number): number {
    if (stepCount <= 0) return 0;
    const i = Number.isFinite(index) ? Math.floor(index) : 0;
    return Math.min(Math.max(0, i), stepCount - 1);
}
