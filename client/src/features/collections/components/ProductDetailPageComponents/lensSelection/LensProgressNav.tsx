import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, IconButton } from "@mui/material";

import { LuxuryLensProgress } from "./LuxuryLensProgress";
import { LuxuryLensProgressCircles } from "./LuxuryLensProgressCircles";
import { LENS_FLOW_ACCENT, LENS_FLOW_SOFT_STRONG } from "./lensFlowTheme";

type Props = {
    steps: readonly string[];
    currentStepIndex: number;
    /** Previous step in the lens flow only — omit on the first step so the left chevron stays disabled. */
    onPrevious?: () => void;
    onNext?: () => void;
    nextEnabled?: boolean;
    /** `circles` matches retail steppers with nodes + connector line. */
    railVariant?: "segments" | "circles";
};

/**
 * Progress rail with chevrons: left = go back one step in the flow (disabled when there is no previous step).
 */
export function LensProgressNav({
    steps,
    currentStepIndex,
    onPrevious,
    onNext,
    nextEnabled = false,
    railVariant = "segments",
}: Props) {
    const canPrev = Boolean(onPrevious);
    const canNext = Boolean(onNext) && nextEnabled;

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "stretch",
                gap: { xs: 0.25, sm: 0.75 },
                px: { xs: 0, sm: 0.5 },
            }}
        >
            <IconButton
                type="button"
                onClick={() => onPrevious?.()}
                disabled={!canPrev}
                aria-label="Previous step"
                sx={{
                    alignSelf: "center",
                    color: canPrev ? "#111827" : "rgba(17,24,39,0.2)",
                    "&:hover": {
                        bgcolor: LENS_FLOW_SOFT_STRONG,
                        color: LENS_FLOW_ACCENT,
                    },
                    "&.Mui-disabled": { color: "rgba(17,24,39,0.2)" },
                }}
            >
                <ChevronLeftIcon sx={{ fontSize: 28 }} />
            </IconButton>
            <Box sx={{ flex: 1, minWidth: 0, alignSelf: "center" }}>
                {railVariant === "circles" ? (
                    <LuxuryLensProgressCircles
                        steps={steps}
                        currentStepIndex={currentStepIndex}
                    />
                ) : (
                    <LuxuryLensProgress steps={steps} currentStepIndex={currentStepIndex} />
                )}
            </Box>
            <IconButton
                type="button"
                onClick={() => onNext?.()}
                disabled={!canNext}
                aria-label="Next step"
                sx={{
                    alignSelf: "center",
                    color: canNext ? "#111827" : "rgba(17,24,39,0.2)",
                    "&:hover": {
                        bgcolor: LENS_FLOW_SOFT_STRONG,
                        color: LENS_FLOW_ACCENT,
                    },
                    "&.Mui-disabled": { color: "rgba(17,24,39,0.2)" },
                }}
            >
                <ChevronRightIcon sx={{ fontSize: 28 }} />
            </IconButton>
        </Box>
    );
}
