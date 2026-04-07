import { Box, Slider, Typography } from "@mui/material";

type FrameDimensionSliderProps = {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min: number;
  max: number;
  step?: number;
  helperText?: string;
  showWarning?: boolean;
  warningText?: string;
};

export default function FrameDimensionSlider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  helperText,
  showWarning = false,
  warningText,
}: FrameDimensionSliderProps) {
  const displayValue = value ?? min;

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary" }}>
          {label}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            bgcolor: "rgba(25, 118, 210, 0.08)",
            px: 1.5,
            py: 0.5,
            borderRadius: 1.5,
          }}
        >
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#1976d2" }}>
            {displayValue}
          </Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: "text.secondary" }}>
            mm
          </Typography>
        </Box>
      </Box>

      <Slider
        value={displayValue}
        onChange={(_, newValue) => onChange(typeof newValue === "number" ? newValue : null)}
        min={min}
        max={max}
        step={step}
        marks={[
          { value: min, label: `${min}` },
          { value: max, label: `${max}` },
        ]}
        valueLabelDisplay="auto"
        valueLabelFormat={(val) => `${val} mm`}
        sx={{
          color: showWarning ? "#ed6c02" : "#1976d2",
          "& .MuiSlider-thumb": {
            width: 20,
            height: 20,
            transition: "0.3s cubic-bezier(.47,1.64,.41,.8)",
            "&:hover, &.Mui-focusVisible": {
              boxShadow: showWarning
                ? "0 0 0 8px rgba(237, 108, 2, 0.16)"
                : "0 0 0 8px rgba(25, 118, 210, 0.16)",
            },
            "&.Mui-active": {
              width: 24,
              height: 24,
            },
          },
          "& .MuiSlider-rail": {
            opacity: 0.28,
          },
          "& .MuiSlider-mark": {
            backgroundColor: "currentColor",
            height: 8,
            width: 2,
            "&.MuiSlider-markActive": {
              opacity: 1,
              backgroundColor: "currentColor",
            },
          },
          "& .MuiSlider-markLabel": {
            fontSize: 11,
            fontWeight: 600,
            color: "text.secondary",
          },
        }}
      />

      {(helperText || (showWarning && warningText)) && (
        <Box sx={{ mt: 0.5 }}>
          {helperText && !showWarning && (
            <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
              {helperText}
            </Typography>
          )}
          {showWarning && warningText && (
            <Typography sx={{ fontSize: 11, color: "#ed6c02", fontWeight: 600 }}>
              ⚠️ {warningText}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
