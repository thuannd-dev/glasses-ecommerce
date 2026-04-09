import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import ManageSearchOutlinedIcon from "@mui/icons-material/ManageSearchOutlined";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Tooltip,
    Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useAnalyzePrescriptionFromUrl } from "../../../../../lib/hooks/useAnalyzePrescriptionFromUrl";
import { useUploadImage } from "../../../../../lib/hooks/useUploadImage";
import {
    mapPrescriptionOcrToFormSeed,
    type PrescriptionFormOcrSeed,
} from "../../../../../lib/utils/mapPrescriptionOcrToFormSeed";

import { LensProgressNav } from "./LensProgressNav";
import { SavedPrescriptionsPanel } from "./SavedPrescriptionsPanel";
import { LENS_WIZARD_STEPS } from "./lensFlowSteps";
import {
    LENS_FLOW_ACCENT,
    LENS_FLOW_ACCENT_HOVER,
    LENS_FLOW_DISABLED_FILL,
    LENS_FLOW_ON_ACCENT,
    LENS_FLOW_SOFT_STRONG,
} from "./lensFlowTheme";

type Props = {
    onBack: () => void;
    onFillManually: () => void;
    /** After OCR analysis — parent opens manual form with pre-filled values. */
    onOcrComplete?: (seed: PrescriptionFormOcrSeed) => void;
    embedConfiguratorLayout?: boolean;
};

type Panel = "menu" | "upload" | "saved";

export function SingleVisionPrescriptionPanel({
    onBack,
    onFillManually,
    onOcrComplete,
    embedConfiguratorLayout,
}: Props) {
    const page = Boolean(embedConfiguratorLayout);
    const [panel, setPanel] = useState<Panel>("menu");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const uploadImage = useUploadImage();
    const analyzePrescription = useAnalyzePrescriptionFromUrl();
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [uploadedPublicId, setUploadedPublicId] = useState<string | null>(null);
    const [previewLoadFailed, setPreviewLoadFailed] = useState(false);

    const isUploading = uploadImage.isPending;
    const isAnalyzing = analyzePrescription.isPending;

    const handleOpenSaved = () => {
        if (!onOcrComplete) return;
        setPanel("saved");
    };

    useEffect(() => {
        if (panel === "saved" && !onOcrComplete) setPanel("menu");
    }, [panel, onOcrComplete]);

    const openFilePicker = () => fileInputRef.current?.click();

    const onFileChosen = useCallback(
        async (files: FileList | null) => {
            if (uploadImage.isPending || analyzePrescription.isPending) return;
            const file = files?.[0];
            if (!file) return;
            setUploadedImageUrl(null);
            setUploadedPublicId(null);
            setPreviewLoadFailed(false);
            if (!file.type.startsWith("image/")) {
                toast.error("Please choose an image file (JPG, PNG, HEIC, or WebP).");
                return;
            }
            if (file.size > 20 * 1024 * 1024) {
                toast.error("Image is too large. Max size is 20 MB.");
                return;
            }

            try {
                const data = await uploadImage.mutateAsync(file);
                setUploadedImageUrl(data.url);
                setUploadedPublicId(data.publicId);
                toast.success("Photo uploaded successfully.");
            } catch (err) {
                const message =
                    err instanceof Error && err.message
                        ? err.message
                        : "Failed to upload photo. Please try again.";
                toast.error(message);
            }
        },
        [uploadImage, analyzePrescription],
    );

    const handleContinueWithOcr = useCallback(async () => {
        if (!uploadedImageUrl || !uploadedPublicId || !onOcrComplete) {
            toast.error("Upload a photo first.");
            return;
        }
        try {
            const data = await analyzePrescription.mutateAsync({
                imageUrl: uploadedImageUrl,
                publicId: uploadedPublicId,
            });
            const seed = mapPrescriptionOcrToFormSeed(data);
            if (!data.parsedSuccessfully) {
                toast.info(
                    "We could not read every field from your photo. Please review and fill in any missing values.",
                );
            } else {
                toast.success("Prescription filled from your photo — please review.");
            }
            onOcrComplete(seed);
        } catch (err) {
            const message =
                err instanceof Error && err.message
                    ? err.message
                    : "Could not analyze your prescription photo. Try again or enter details manually.";
            toast.error(message);
        }
    }, [uploadedImageUrl, uploadedPublicId, onOcrComplete, analyzePrescription]);

    /** One CTA: photo uploaded → OCR + review; otherwise → manual form. */
    const handleUnifiedContinue = useCallback(async () => {
        if (isUploading || isAnalyzing) return;
        if (uploadedImageUrl && uploadedPublicId && onOcrComplete) {
            await handleContinueWithOcr();
            return;
        }
        onFillManually();
    }, [
        isUploading,
        isAnalyzing,
        uploadedImageUrl,
        uploadedPublicId,
        onOcrComplete,
        handleContinueWithOcr,
        onFillManually,
    ]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (isUploading || isAnalyzing) return;
        onFileChosen(e.dataTransfer.files);
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
                {panel === "menu"
                    ? "Choose how you’d like to provide your prescription."
                    : panel === "saved"
                      ? "Pick a saved prescription from your account. Values load from your past orders."
                      : "Upload a clear photo of your written prescription. We’ll use it to verify your lenses."}
            </Typography>

            <Box sx={{ mb: page ? 3.5 : 3, width: "100%" }}>
                <LensProgressNav
                    steps={LENS_WIZARD_STEPS}
                    currentStepIndex={1}
                    railVariant="circles"
                    onPrevious={panel === "menu" ? onBack : () => setPanel("menu")}
                />
            </Box>

            {panel === "menu" && (
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
                        onClick={() => setPanel("upload")}
                        showDivider
                    />
                    {onOcrComplete ? (
                        <MethodRow
                            Icon={ManageSearchOutlinedIcon}
                            title="Use a saved prescription"
                            description="Select from prescriptions you have saved before."
                            onClick={handleOpenSaved}
                            showDivider={false}
                        />
                    ) : null}
                </Box>
            )}

            {panel === "saved" && onOcrComplete && (
                <SavedPrescriptionsPanel
                    onBack={() => setPanel("menu")}
                    onPrescriptionLoaded={onOcrComplete}
                    embedConfiguratorLayout={embedConfiguratorLayout}
                />
            )}

            {panel === "upload" && (
                <Box sx={{ width: "100%" }}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/heic,image/webp"
                        disabled={isUploading || isAnalyzing}
                        style={{ display: "none" }}
                        onChange={(e) => onFileChosen(e.target.files)}
                    />

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 0.75,
                            mb: 2,
                        }}
                    >
                        <Typography
                            component="h3"
                            sx={{
                                fontWeight: 800,
                                fontSize: { xs: 18, sm: 20 },
                                color: "#111827",
                                textAlign: "center",
                            }}
                        >
                            Upload a Photo
                        </Typography>
                        <Tooltip
                            title="Use a well-lit photo of your full prescription paper. Avoid glare and cropped edges."
                            placement="top"
                            arrow
                        >
                            <IconButton
                                size="small"
                                aria-label="Help with photo upload"
                                sx={{ color: "text.secondary" }}
                            >
                                <HelpOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Box
                        role="button"
                        tabIndex={0}
                        onClick={openFilePicker}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                openFilePicker();
                            }
                        }}
                        onDragOver={(e) => {
                            e.preventDefault();
                            if (!isUploading && !isAnalyzing) setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        sx={{
                            borderRadius: 2,
                            border: `2px dashed ${isDragging ? LENS_FLOW_ACCENT : "rgba(17,24,39,0.22)"}`,
                            bgcolor: isDragging ? "rgba(17,24,39,0.03)" : "#fafafa",
                            py: { xs: 4, sm: 5 },
                            px: 2,
                            textAlign: "center",
                            cursor: "pointer",
                            pointerEvents: isUploading || isAnalyzing ? "none" : "auto",
                            opacity: isUploading || isAnalyzing ? 0.7 : 1,
                            transition: "border-color 160ms ease, background-color 160ms ease",
                            "&:hover": {
                                borderColor: LENS_FLOW_ACCENT,
                                bgcolor: "rgba(17,24,39,0.02)",
                            },
                        }}
                    >
                        <PhotoCameraOutlinedIcon
                            sx={{ fontSize: 44, color: "text.secondary", mb: 1.5 }}
                            aria-hidden
                        />
                        <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#111827", mb: 0.5 }}>
                            {isAnalyzing
                                ? "Reading prescription…"
                                : isUploading
                                  ? "Uploading photo..."
                                  : "Drag and drop a file here or"}{" "}
                            <Box component="span" sx={{ color: LENS_FLOW_ACCENT, textDecoration: "underline" }}>
                                {isAnalyzing || isUploading ? "please wait" : "browse"}
                            </Box>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                            JPG, PNG, HEIC, or WebP · max 20 MB
                        </Typography>
                    </Box>

                    {uploadedImageUrl ? (
                        <Box sx={{ mt: 2 }}>
                            <Typography
                                variant="body2"
                                sx={{ fontSize: 13, fontWeight: 700, color: "success.main", mb: 1 }}
                            >
                                Preview
                            </Typography>
                            {previewLoadFailed ? (
                                <Box
                                    sx={{
                                        borderRadius: 2,
                                        border: "1px solid rgba(17,24,39,0.12)",
                                        bgcolor: "#fafafa",
                                        minHeight: 140,
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: 0.75,
                                        px: 2,
                                        textAlign: "center",
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        Could not render preview image here.
                                    </Typography>
                                    <Button
                                        size="small"
                                        variant="text"
                                        component="a"
                                        href={uploadedImageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{ textTransform: "none", fontWeight: 700 }}
                                    >
                                        Open image in new tab
                                    </Button>
                                </Box>
                            ) : (
                                <Box
                                    component="img"
                                    src={uploadedImageUrl}
                                    alt="Uploaded prescription preview"
                                    onError={() => setPreviewLoadFailed(true)}
                                    sx={{
                                        display: "block",
                                        width: "100%",
                                        maxHeight: 280,
                                        objectFit: "contain",
                                        borderRadius: 2,
                                        border: "1px solid rgba(17,24,39,0.12)",
                                        bgcolor: "#fafafa",
                                    }}
                                />
                            )}
                        </Box>
                    ) : null}

                    <Button
                        fullWidth
                        variant="contained"
                        disabled={isUploading || isAnalyzing}
                        onClick={() => void handleUnifiedContinue()}
                        sx={{
                            mt: 2,
                            py: 1.35,
                            textTransform: "none",
                            fontWeight: 800,
                            fontSize: 16,
                            borderRadius: 1,
                            bgcolor: LENS_FLOW_ACCENT,
                            color: LENS_FLOW_ON_ACCENT,
                            boxShadow: "none",
                            "&:hover": { bgcolor: LENS_FLOW_ACCENT_HOVER, boxShadow: "none" },
                            "&.Mui-disabled": {
                                bgcolor: LENS_FLOW_DISABLED_FILL,
                                color: LENS_FLOW_ON_ACCENT,
                            },
                        }}
                    >
                        {isAnalyzing ? (
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                                <CircularProgress size={20} sx={{ color: LENS_FLOW_ON_ACCENT }} />
                                Reading prescription…
                            </Box>
                        ) : isUploading ? (
                            "Uploading…"
                        ) : (
                            "Continue"
                        )}
                    </Button>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 1, textAlign: "center", lineHeight: 1.5 }}
                    >
                        With a photo we auto-fill from your RX; without one, you will enter values on the next
                        step.
                    </Typography>

                    <Paper
                        elevation={0}
                        sx={{
                            mt: 3,
                            p: 2, 
                            borderRadius: 2,
                            border: "1px solid rgba(17,24,39,0.08)",
                            bgcolor: "#fff",
                        }}
                    >
                        <Typography sx={{ fontWeight: 800, fontSize: 14, mb: 1.25, color: "#111827" }}>
                            Tips for a clear photo
                        </Typography>
                        <List dense disablePadding>
                            {[
                                "Lay the paper flat; avoid folds covering numbers.",
                                "Use bright, even light — no flash glare on the text.",
                                "Include the full page so OD/OS rows and PD are visible.",
                            ].map((text) => (
                                <ListItem key={text} disableGutters sx={{ alignItems: "flex-start", py: 0.5 }}>
                                    <ListItemIcon sx={{ minWidth: 28, mt: 0.25 }}>
                                        <CheckCircleOutlineIcon sx={{ fontSize: 18, color: LENS_FLOW_ACCENT }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={text}
                                        primaryTypographyProps={{ variant: "body2", color: "text.secondary", lineHeight: 1.55 }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>

                    <Paper
                        elevation={0}
                        sx={{
                            mt: 2,
                            p: 2,
                            borderRadius: 2,
                            border: "1px solid rgba(17,24,39,0.08)",
                            bgcolor: "rgba(17,24,39,0.02)",
                        }}
                    >
                        <Typography sx={{ fontWeight: 800, fontSize: 14, mb: 1, color: "#111827" }}>
                            What we need to see on your prescription
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65, mb: 1 }}>
                            Your provider’s written values for each eye (and PD). If your RX includes reading add power,
                            that should appear too — we’ll match it when you confirm or enter details.
                        </Typography>
                        <Box
                            component="ul"
                            sx={{
                                m: 0,
                                pl: 2.25,
                                color: "text.secondary",
                                fontSize: 13,
                                lineHeight: 1.7,
                            }}
                        >
                            <li>
                                <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                                    SPH
                                </Box>{" "}
                                ·{" "}
                                <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                                    CYL
                                </Box>{" "}
                                ·{" "}
                                <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                                    Axis
                                </Box>
                            </li>
                            <li>
                                <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                                    PD
                                </Box>{" "}
                                (one number or two)
                            </li>
                            <li>
                                <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                                    ADD
                                </Box>{" "}
                                if listed (reading / progressive)
                            </li>
                        </Box>
                    </Paper>

                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2, lineHeight: 1.6 }}>
                        Your image is stored securely and used only to fulfill your order. Staff may verify values
                        before the lab cuts your lenses.
                    </Typography>
                </Box>
            )}
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
