import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LandscapeOutlinedIcon from "@mui/icons-material/LandscapeOutlined";
import ViewAgendaOutlinedIcon from "@mui/icons-material/ViewAgendaOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Box, Button, Tooltip, Typography } from "@mui/material";

import type { LensUsagePick } from "../../../../../lib/types/lensSelection";

import { LensProgressNav } from "./LensProgressNav";
import { LENS_WIZARD_STEPS } from "./lensFlowSteps";
import {
    LENS_FLOW_ACCENT,
    LENS_FLOW_ON_ACCENT,
    LENS_FLOW_SOFT_STRONG,
} from "./lensFlowTheme";

type RowDef = {
    pick: LensUsagePick;
    title: string;
    description: string;
    Icon: typeof LandscapeOutlinedIcon;
};

const ROWS: RowDef[] = [
    {
        pick: "single-vision",
        title: "Single Vision",
        description: "General use to see Near, Intermediate, or Distance.",
        Icon: LandscapeOutlinedIcon,
    },
    {
        pick: "bifocals",
        title: "Bifocals",
        description: "Two-zone lenses for distance and near vision.",
        Icon: ViewAgendaOutlinedIcon,
    },
    {
        pick: "non-prescription",
        title: "Non-prescription",
        description: "Glasses without any prescription.",
        Icon: VisibilityOutlinedIcon,
    },
];

type Props = {
    onPick: (pick: LensUsagePick) => void;
    /** Wide page configurator: full task column width, left-aligned heading stack. */
    embedConfiguratorLayout?: boolean;
};

export function LensUsageSelector({ onPick, embedConfiguratorLayout }: Props) {
    const page = Boolean(embedConfiguratorLayout);
    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: page ? "100%" : { xs: "100%", sm: 520 },
                mx: page ? 0 : "auto",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: page ? "flex-start" : "center",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                }}
            >
                <Typography
                    component="h2"
                    sx={{
                        fontWeight: 800,
                        fontSize: page ? { xs: 24, sm: 26, md: 28 } : { xs: 24, sm: 26 },
                        color: "#111827",
                        letterSpacing: "-0.02em",
                    }}
                >
                    Usage
                </Typography>
                <Tooltip title="You can change this before checkout." arrow placement="top">
                    <InfoOutlinedIcon
                        sx={{ fontSize: 22, color: LENS_FLOW_ACCENT, cursor: "help" }}
                        aria-label="Usage information"
                    />
                </Tooltip>
            </Box>
            <Typography
                textAlign={page ? "left" : "center"}
                color="text.secondary"
                sx={{
                    fontSize: page ? { xs: 14, md: 15 } : 14,
                    mb: 2,
                    maxWidth: page ? "none" : 440,
                    mx: page ? 0 : "auto",
                    lineHeight: 1.5,
                }}
            >
                Choose how you’ll use these lenses.
            </Typography>

            <Box sx={{ mb: page ? 3.5 : 3, width: "100%" }}>
                <LensProgressNav
                    steps={LENS_WIZARD_STEPS}
                    currentStepIndex={0}
                    railVariant="circles"
                />
            </Box>

            <Box
                component="div"
                role="list"
                aria-label="Lens usage options"
                sx={{
                    border: "1px solid rgba(17,24,39,0.1)",
                    borderRadius: 2,
                    overflow: "hidden",
                    bgcolor: "#fff",
                }}
            >
                {ROWS.map(({ pick, title, description, Icon }, idx) => (
                    <Box key={pick} role="listitem">
                        <Button
                            fullWidth
                            type="button"
                            onClick={() => onPick(pick)}
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                gap: 2,
                                py: 2.25,
                                px: 2.5,
                                textAlign: "left",
                                textTransform: "none",
                                borderRadius: 0,
                                borderLeft: "3px solid transparent",
                                borderBottom:
                                    idx < ROWS.length - 1 ? "1px solid rgba(17,24,39,0.08)" : "none",
                                bgcolor: "transparent",
                                color: "inherit",
                                transition:
                                    "background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease",
                                "&:hover": {
                                    bgcolor: LENS_FLOW_SOFT_STRONG,
                                    borderLeftColor: LENS_FLOW_ACCENT,
                                },
                                "&:focus-visible": {
                                    outline: `2px solid ${LENS_FLOW_ACCENT}`,
                                    outlineOffset: -2,
                                    zIndex: 1,
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    bgcolor: LENS_FLOW_ACCENT,
                                    flexShrink: 0,
                                    color: LENS_FLOW_ON_ACCENT,
                                }}
                            >
                                <Icon sx={{ fontSize: 26 }} aria-hidden />
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: 16,
                                        color: "#111827",
                                        mb: 0.5,
                                        letterSpacing: "-0.01em",
                                    }}
                                >
                                    {title}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: 14,
                                        lineHeight: 1.5,
                                        color: "text.secondary",
                                        fontWeight: 400,
                                    }}
                                >
                                    {description}
                                </Typography>
                            </Box>
                        </Button>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
