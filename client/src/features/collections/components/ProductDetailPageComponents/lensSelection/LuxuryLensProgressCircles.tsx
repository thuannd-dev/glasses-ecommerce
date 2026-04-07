import CheckIcon from "@mui/icons-material/Check";
import { Box, Typography } from "@mui/material";
import { Fragment } from "react";

import { clampLensProgressStepIndex } from "./lensFlowSteps";
import { LENS_FLOW_ACCENT, LENS_FLOW_ON_ACCENT } from "./lensFlowTheme";

const TRACK = "rgba(17,24,39,0.1)";
const NODE = 28;

type Props = {
    steps: readonly string[];
    currentStepIndex: number;
    id?: string;
};

function getGridTemplateColumns(stepCount: number): string {
    const cols: string[] = [];
    for (let i = 0; i < stepCount; i += 1) {
        cols.push(`${NODE}px`);
        if (i < stepCount - 1) cols.push("minmax(8px, 1fr)");
    }
    return cols.join(" ");
}

/** Node/track columns are fixed so connector always meets circle edges. */
export function LuxuryLensProgressCircles({ steps, currentStepIndex, id }: Props) {
    const gridTemplateColumns = getGridTemplateColumns(steps.length);
    const safeStepIndex = clampLensProgressStepIndex(currentStepIndex, steps.length);

    return (
        <Box
            id={id}
            role="navigation"
            aria-label="Configuration progress"
            sx={{ width: "100%" }}
        >
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns,
                    rowGap: 0.65,
                    alignItems: "start",
                    width: "100%",
                }}
            >
                {steps.map((label, i) => {
                    const done = i < safeStepIndex;
                    const active = i === safeStepIndex;
                    const nodeCol = i * 2 + 1;
                    const trackCol = i * 2 + 2;
                    return (
                        <Fragment key={label}>
                            <Box
                                sx={{
                                    display: "flex",
                                    gridColumn: nodeCol,
                                    gridRow: 1,
                                    alignItems: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: NODE,
                                        height: NODE,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                        bgcolor: done ? LENS_FLOW_ACCENT : "transparent",
                                        border: done
                                            ? `2px solid ${LENS_FLOW_ACCENT}`
                                            : active
                                              ? `2px solid ${LENS_FLOW_ACCENT}`
                                              : "2px solid rgba(17,24,39,0.22)",
                                        color: LENS_FLOW_ON_ACCENT,
                                    }}
                                    aria-current={active ? "step" : undefined}
                                >
                                    {done ? (
                                        <CheckIcon sx={{ fontSize: 18 }} />
                                    ) : active ? (
                                        <Box
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: "50%",
                                                bgcolor: LENS_FLOW_ACCENT,
                                            }}
                                        />
                                    ) : null}
                                </Box>
                            </Box>
                            {i < steps.length - 1 ? (
                                <Box
                                    sx={{
                                        gridColumn: trackCol,
                                        gridRow: 1,
                                        height: 2,
                                        alignSelf: "center",
                                        bgcolor: TRACK,
                                        borderRadius: 1,
                                    }}
                                    aria-hidden
                                />
                            ) : null}
                            <Box
                                sx={{
                                    gridColumn: nodeCol,
                                    gridRow: 2,
                                    width: { xs: 56, sm: 92 },
                                    justifySelf: "center",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: { xs: 7.5, sm: 8.5 },
                                        fontWeight: active ? 700 : 500,
                                        letterSpacing: { xs: "0.05em", sm: "0.09em" },
                                        textTransform: "uppercase",
                                        textAlign: "center",
                                        lineHeight: 1.2,
                                        color:
                                            done || active
                                                ? LENS_FLOW_ACCENT
                                                : "rgba(22, 23, 27, 0.35)",
                                    }}
                                >
                                    {label}
                                </Typography>
                            </Box>
                        </Fragment>
                    );
                })}
            </Box>
        </Box>
    );
}
