import { Box, Button, Chip, Grid, Paper, Typography } from "@mui/material";
import FrameDimensionSlider from "./FrameDimensionSlider";

export type FrameDimensions = {
  lensWidth: number | null;
  bridgeWidth: number | null;
  templeLength: number | null;
};

type FrameDimensionsFormProps = {
  dimensions: FrameDimensions;
  onChange: (dimensions: FrameDimensions) => void;
  onSizeChange?: (size: string) => void;
};

const PRESETS = {
  Small: { lensWidth: 48, bridgeWidth: 18, templeLength: 138 },
  Medium: { lensWidth: 52, bridgeWidth: 20, templeLength: 142 },
  Large: { lensWidth: 56, bridgeWidth: 22, templeLength: 145 },
};

const CONSTRAINTS = {
  lensWidth: { min: 48, max: 60 },
  bridgeWidth: { min: 14, max: 24 },
  templeLength: { min: 135, max: 150 },
};

function getSizeLabel(lensWidth: number | null): string {
  if (lensWidth === null) return "Not set";
  if (lensWidth < 51) return "Small";
  if (lensWidth <= 54) return "Medium";
  return "Large";
}

function hasUnusualCombination(dimensions: FrameDimensions): {
  hasWarning: boolean;
  message: string;
} {
  const { lensWidth, bridgeWidth, templeLength } = dimensions;

  if (lensWidth !== null && templeLength !== null) {
    if (lensWidth < 50 && templeLength > 145) {
      return {
        hasWarning: true,
        message: "Small lens with long temple is unusual",
      };
    }
    if (lensWidth > 55 && templeLength < 140) {
      return {
        hasWarning: true,
        message: "Large lens with short temple is unusual",
      };
    }
  }

  if (lensWidth !== null && bridgeWidth !== null) {
    if (lensWidth < 50 && bridgeWidth > 22) {
      return {
        hasWarning: true,
        message: "Small lens with wide bridge is unusual",
      };
    }
    if (lensWidth > 55 && bridgeWidth < 16) {
      return {
        hasWarning: true,
        message: "Large lens with narrow bridge is unusual",
      };
    }
  }

  return { hasWarning: false, message: "" };
}

export default function FrameDimensionsForm({
  dimensions,
  onChange,
  onSizeChange,
}: FrameDimensionsFormProps) {
  const sizeLabel = getSizeLabel(dimensions.lensWidth);
  const { hasWarning, message: warningMessage } = hasUnusualCombination(dimensions);

  const handlePresetClick = (preset: keyof typeof PRESETS) => {
    onChange(PRESETS[preset]);
    if (onSizeChange) {
      onSizeChange(preset);
    }
  };

  const handleDimensionChange = (newDimensions: FrameDimensions) => {
    onChange(newDimensions);
    if (onSizeChange && newDimensions.lensWidth !== dimensions.lensWidth) {
      const newSize = getSizeLabel(newDimensions.lensWidth);
      if (newSize !== "Not set") {
        onSizeChange(newSize);
      }
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: "1px solid rgba(0,0,0,0.08)",
        bgcolor: "#fafafa",
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 800, mb: 1 }}>
          Frame Dimensions
        </Typography>
        <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 2 }}>
          Use sliders to set precise measurements. All values are in millimeters (mm).
        </Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: "text.secondary" }}>
            Quick presets:
          </Typography>
          {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((preset) => (
            <Button
              key={preset}
              size="small"
              variant="outlined"
              onClick={() => handlePresetClick(preset)}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                fontSize: 11,
                px: 2,
                py: 0.5,
                borderRadius: 1.5,
              }}
            >
              {preset}
            </Button>
          ))}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FrameDimensionSlider
            label="Lens Width"
            value={dimensions.lensWidth}
            onChange={(value) => handleDimensionChange({ ...dimensions, lensWidth: value })}
            min={CONSTRAINTS.lensWidth.min}
            max={CONSTRAINTS.lensWidth.max}
            helperText="Width of a single lens. Determines overall frame size."
          />
        </Grid>

        <Grid item xs={12}>
          <FrameDimensionSlider
            label="Bridge Width"
            value={dimensions.bridgeWidth}
            onChange={(value) => handleDimensionChange({ ...dimensions, bridgeWidth: value })}
            min={CONSTRAINTS.bridgeWidth.min}
            max={CONSTRAINTS.bridgeWidth.max}
            helperText="Distance between lenses. Affects nose fit."
          />
        </Grid>

        <Grid item xs={12}>
          <FrameDimensionSlider
            label="Temple Length"
            value={dimensions.templeLength}
            onChange={(value) => handleDimensionChange({ ...dimensions, templeLength: value })}
            min={CONSTRAINTS.templeLength.min}
            max={CONSTRAINTS.templeLength.max}
            helperText="Length of the arm from hinge to ear tip."
          />
        </Grid>
      </Grid>

      <Box
        sx={{
          mt: 3,
          pt: 2.5,
          borderTop: "1px solid rgba(0,0,0,0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: "text.secondary", mb: 0.5 }}>
            Derived Size Label
          </Typography>
          <Chip
            label={sizeLabel}
            sx={{
              fontWeight: 800,
              fontSize: 13,
              bgcolor:
                sizeLabel === "Small"
                  ? "rgba(156, 39, 176, 0.12)"
                  : sizeLabel === "Medium"
                    ? "rgba(25, 118, 210, 0.12)"
                    : sizeLabel === "Large"
                      ? "rgba(46, 125, 50, 0.12)"
                      : "rgba(117, 117, 117, 0.12)",
              color:
                sizeLabel === "Small"
                  ? "#9c27b0"
                  : sizeLabel === "Medium"
                    ? "#1976d2"
                    : sizeLabel === "Large"
                      ? "#2e7d32"
                      : "#757575",
            }}
          />
        </Box>

        {hasWarning && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 1.5,
              bgcolor: "rgba(237, 108, 2, 0.08)",
              border: "1px solid rgba(237, 108, 2, 0.2)",
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#ed6c02" }}>
              ⚠️ {warningMessage}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
