import CheckIcon from "@mui/icons-material/Check";
import { Box, Typography } from "@mui/material";
import { Fragment } from "react";

import { LENS_FLOW_ACCENT, LENS_FLOW_ON_ACCENT } from "./lensFlowTheme";

const TRACK = "rgba(17,24,39,0.1)";
const NODE = 28;
const CONNECTOR_MT_PX = NODE / 2 - 1;

type Props = {
    steps: readonly string[];
    currentStepIndex: number;
    id?: string;
};

/** Short bars only in the gaps between nodes — no single line through circle centers. */
export function LuxuryLensProgressCircles({ steps, currentStepIndex, id }: Props) {
    return (
        <Box
            id={id}
            role="navigation"
            aria-label="Configuration progress"
            sx={{ width: "100%" }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    width: "100%",
                }}
            >
                {steps.map((label, i) => {
                    const done = i < currentStepIndex;
                    const active = i === currentStepIndex;
                    return (
                        <Fragment key={label}>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 0.65,
                                    flexShrink: 0,
                                    minWidth: NODE,
                                    maxWidth: { xs: 76, sm: 92 },
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
                                        maxWidth: "100%",
                                    }}
                                >
                                    {label}
                                </Typography>
                            </Box>
                            {i < steps.length - 1 ? (
                                <Box
                                    sx={{
                                        flex: 1,
                                        height: 2,
                                        minWidth: 4,
                                        mt: `${CONNECTOR_MT_PX}px`,
                                        alignSelf: "flex-start",
                                        bgcolor: TRACK,
                                        borderRadius: 1,
                                    }}
                                    aria-hidden
                                />
                            ) : null}
                        </Fragment>
                    );
                })}
            </Box>
        </Box>
    );
}
