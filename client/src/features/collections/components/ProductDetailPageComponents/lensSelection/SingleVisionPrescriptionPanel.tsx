import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import ManageSearchOutlinedIcon from "@mui/icons-material/ManageSearchOutlined";
import { Box, Button, Divider, Typography } from "@mui/material";
import { toast } from "react-toastify";

import { LensProgressNav } from "./LensProgressNav";
import { LENS_WIZARD_STEPS } from "./lensFlowSteps";
import {
    LENS_FLOW_ACCENT,
    LENS_FLOW_ON_ACCENT,
    LENS_FLOW_SOFT_STRONG,
} from "./lensFlowTheme";

type Props = {
    onBack: () => void;
    onFillManually: () => void;
    embedConfiguratorLayout?: boolean;
};

export function SingleVisionPrescriptionPanel({
    onBack,
    onFillManually,
    embedConfiguratorLayout,
}: Props) {
    const page = Boolean(embedConfiguratorLayout);
    const handleUpload = () => {
        toast.info("Photo upload is coming soon.");
    };

    const handleSaved = () => {
        toast.info("Saved prescriptions are coming soon.");
    };

    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: page ? "100%" : { xs: "100%", sm: 520 },
                mx: page ? 0 : "auto",
            }}
        >
            <Typography
                component="h2"
                sx={{
                    fontWeight: 800,
                    fontSize: page ? { xs: 24, sm: 26, md: 28 } : { xs: 24, sm: 26 },
                    textAlign: page ? "left" : "center",
                    color: "#111827",
                    letterSpacing: "-0.02em",
                    mb: 0.5,
                }}
            >
                Your Prescription
            </Typography>
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
                Choose how you’d like to provide your prescription.
            </Typography>

            <Box sx={{ mb: page ? 3.5 : 3, width: "100%" }}>
                <LensProgressNav
                    steps={LENS_WIZARD_STEPS}
                    currentStepIndex={1}
                    railVariant="circles"
                    onPrevious={onBack}
                />
            </Box>

            <Box
                component="nav"
                aria-label="How to provide prescription"
                sx={{
                    border: "1px solid rgba(17,24,39,0.1)",
                    borderRadius: 2,
                    overflow: "hidden",
                    bgcolor: "#fff",
                }}
            >
                <MethodRow
                    Icon={DescriptionOutlinedIcon}
                    title="Fill it out myself"
                    description="Enter my prescription details manually."
                    onClick={onFillManually}
                    showDivider
                />
                <MethodRow
                    Icon={ImageOutlinedIcon}
                    title="Upload a photo"
                    description="Upload a picture of your written prescription."
                    onClick={handleUpload}
                    showDivider
                />
                <MethodRow
                    Icon={ManageSearchOutlinedIcon}
                    title="Use a saved prescription"
                    description="Select from prescriptions you have saved before."
                    onClick={handleSaved}
                    showDivider={false}
                />
            </Box>
        </Box>
    );
}

function MethodRow({
    Icon,
    title,
    description,
    onClick,
    showDivider,
}: {
    Icon: typeof DescriptionOutlinedIcon;
    title: string;
    description: string;
    onClick: () => void;
    showDivider: boolean;
}) {
    return (
        <>
            <Button
                fullWidth
                type="button"
                onClick={onClick}
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
                        color: LENS_FLOW_ON_ACCENT,
                        flexShrink: 0,
                    }}
                >
                    <Icon sx={{ fontSize: 26 }} aria-hidden />
                </Box>
                <Box sx={{ minWidth: 0, textAlign: "left" }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 16, color: "#111827", mb: 0.5 }}>
                        {title}
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: "text.secondary", lineHeight: 1.5 }}>
                        {description}
                    </Typography>
                </Box>
            </Button>
            {showDivider ? <Divider sx={{ borderColor: "rgba(17,24,39,0.08)" }} /> : null}
        </>
    );
}
