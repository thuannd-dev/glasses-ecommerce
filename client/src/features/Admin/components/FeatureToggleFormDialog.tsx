import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  Grid,
} from "@mui/material";
import type { CreateFeatureTogglePayload } from "../../../lib/types";

interface FeatureToggleFormDialogProps {
  open: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isEditing: boolean;
  formData: CreateFeatureTogglePayload;
  onClose: () => void;
  onFormChange: (field: keyof CreateFeatureTogglePayload, value: unknown) => void;
  onSave: () => void;
}

export function FeatureToggleFormDialog({
  open,
  isCreating,
  isUpdating,
  isEditing,
  formData,
  onClose,
  onFormChange,
  onSave,
}: FeatureToggleFormDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: 18,
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 2,
        }}
      >
        {isEditing ? "Edit Feature Toggle" : "Create Feature Toggle"}
      </DialogTitle>
      <DialogContent sx={{ pt: 4, pb: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
          <Box>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
                color: "text.secondary",
                mb: 1.5,
              }}
            >
              Basic Information
            </Typography>
            <TextField
              fullWidth
              size="medium"
              label="Feature Name *"
              value={formData.featureName}
              onChange={(e) => onFormChange("featureName", e.target.value)}
              placeholder="e.g., VirtualTryOn"
              inputProps={{ style: { fontSize: 15 } }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              size="medium"
              label="Description"
              value={formData.description}
              onChange={(e) => onFormChange("description", e.target.value)}
              placeholder="Feature description..."
              multiline
              rows={3}
              inputProps={{ style: { fontSize: 15 } }}
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
                color: "text.secondary",
                mb: 1.5,
              }}
            >
              Scope (Optional)
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                size="medium"
                label="Scope"
                value={(formData.scope as string | null) ?? ""}
                onChange={(e) => onFormChange("scope", e.target.value || null)}
                placeholder="e.g., region, tenant, cohort"
                inputProps={{ style: { fontSize: 15 } }}
                helperText="Leave empty for global toggle"
              />
              <TextField
                fullWidth
                size="medium"
                label="Scope Value"
                value={(formData.scopeValue as string | null) ?? ""}
                onChange={(e) => onFormChange("scopeValue", e.target.value || null)}
                placeholder="e.g., US-West, customer-123"
                disabled={!formData.scope}
                inputProps={{ style: { fontSize: 15 } }}
                helperText={
                  formData.scope ? "Specific value for the scope" : "Only available when Scope is provided"
                }
              />
            </Box>
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
                color: "text.secondary",
                mb: 1.5,
              }}
            >
              Time-Based Activation (Optional)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="medium"
                  type="date"
                  label="Effective From"
                  value={(formData.effectiveFrom as string | null) ?? ""}
                  onChange={(e) => onFormChange("effectiveFrom", e.target.value || null)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ style: { fontSize: 15 } }}
                  helperText="Leave empty to activate immediately"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="medium"
                  type="date"
                  label="Effective To"
                  value={(formData.effectiveTo as string | null) ?? ""}
                  onChange={(e) => onFormChange("effectiveTo", e.target.value || null)}
                  disabled={!formData.effectiveFrom}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ style: { fontSize: 15 } }}
                  helperText={
                    formData.effectiveFrom
                      ? "Must be after Effective From date"
                      : "Only available if Effective From is set"
                  }
                />
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
                color: "text.secondary",
                mb: 1.5,
              }}
            >
              Settings
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isEnabled}
                  onChange={(e) => onFormChange("isEnabled", e.target.checked)}
                />
              }
              label={<Typography sx={{ fontSize: 15, fontWeight: 600 }}>Enabled</Typography>}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ textTransform: "none", fontWeight: 700, fontSize: 15 }}
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          disabled={isCreating || isUpdating}
          sx={{ textTransform: "none", fontWeight: 700, fontSize: 15 }}
        >
          {isCreating || isUpdating ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
