import { Box, Typography } from "@mui/material";

import { clampLensProgressStepIndex } from "./lensFlowSteps";
import { LENS_FLOW_ACCENT, LENS_FLOW_DONE_LABEL } from "./lensFlowTheme";

const TRACK = "rgba(22, 23, 27, 0.08)";

type Props = {
    steps: readonly string[];
    /** 0-based index of the step the user is on. Steps before this are shown as completed. */
    currentStepIndex: number;
    /** Optional id for aria-labelledby */
    id?: string;
};

/**
 * Minimal progress rail — no numbered circles. Suited for premium eyewear flows.
 */
export function LuxuryLensProgress({ steps, currentStepIndex, id }: Props) {
    const safeStepIndex = clampLensProgressStepIndex(currentStepIndex, steps.length);

    return (
        <Box
            id={id}
            role="navigation"
            aria-label="Configuration progress"
            sx={{ width: "100%", maxWidth: "none", mx: 0 }}
        >
            <Box
                sx={{
                    display: "flex",
                    gap: "6px",
                    alignItems: "flex-end",
                    mb: 1.75,
                }}
            >
                {steps.map((_, i) => {
                    const done = i < safeStepIndex;
                    const active = i === safeStepIndex;
                    return (
                        <Box
                            key={i}
                            sx={{
                                flex: 1,
                                height: active ? 3 : 2,
                                borderRadius: 999,
                                bgcolor: done || active ? LENS_FLOW_ACCENT : TRACK,
                                opacity: done ? 0.85 : active ? 1 : 1,
                                transition:
                                    "height 200ms ease, background-color 200ms ease, opacity 200ms ease",
                                boxShadow:
                                    active && !done
                                        ? `0 0 0 1px rgba(17, 24, 39, 0.2)`
                                        : "none",
                            }}
                            aria-current={active ? "step" : undefined}
                        />
                    );
                })}
            </Box>

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 0.5,
                }}
            >
                {steps.map((label, i) => {
                    const done = i < safeStepIndex;
                    const active = i === safeStepIndex;
                    return (
                        <Typography
                            key={label}
                            component="span"
                            sx={{
                                flex: 1,
                                minWidth: 0,
                                fontSize: { xs: 8.5, sm: 9.5 },
                                fontWeight: active ? 600 : 500,
                                letterSpacing: { xs: "0.08em", sm: "0.12em" },
                                textTransform: "uppercase",
                                textAlign: "center",
                                lineHeight: 1.25,
                                color: active
                                    ? LENS_FLOW_ACCENT
                                    : done
                                      ? LENS_FLOW_DONE_LABEL
                                      : "rgba(22, 23, 27, 0.32)",
                                borderBottom: active
                                    ? `1.5px solid ${LENS_FLOW_ACCENT}`
                                    : "1.5px solid transparent",
                                pb: 0.4,
                                transition: "color 180ms ease, border-color 180ms ease",
                            }}
                        >
                            {label}
                        </Typography>
                    );
                })}
            </Box>
        </Box>
    );
}
