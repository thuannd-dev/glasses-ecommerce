import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import type {
  CreatePolicyPayload,
  PolicyConfigurationDto,
} from "../../../lib/types";
import { PolicyTypeEnum } from "../../../lib/types";
import { toast } from "react-toastify";
import { POLICY_TYPES } from "../constants";

interface PolicyFormDialogProps {
  open: boolean;
  editingPolicy: PolicyConfigurationDto | null;
  formData: CreatePolicyPayload;
  isCreating: boolean;
  isUpdating: boolean;
  onClose: () => void;
  onFormChange: (field: keyof CreatePolicyPayload, value: unknown) => void;
  onSave: () => void;
}

export function PolicyFormDialog({
  open,
  editingPolicy,
  formData,
  isCreating,
  isUpdating,
  onClose,
  onFormChange,
  onSave,
}: PolicyFormDialogProps) {
  const handleSave = () => {
    // Validation
    if (!formData.policyName.trim()) {
      toast.error("Policy name is required");
      return;
    }

    if (!formData.effectiveFrom) {
      toast.error("Effective from date is required");
      return;
    }

    if (formData.policyType === PolicyTypeEnum.Return && !formData.returnWindowDays) {
      toast.error("Return window days is required for return policies");
      return;
    }

    if (formData.policyType === PolicyTypeEnum.Warranty && !formData.warrantyMonths) {
      toast.error("Warranty months is required for warranty policies");
      return;
    }

    if (formData.policyType === PolicyTypeEnum.Refund) {
      if (formData.refundOnlyMaxAmount !== null && formData.refundOnlyMaxAmount < 0) {
        toast.error("Refund Only Max Amount must be non-negative");
        return;
      }
      if (formData.refundWindowDays !== null && (formData.refundWindowDays < 0 || formData.refundWindowDays > 365)) {
        toast.error("Refund Window Days must be between 0 and 365");
        return;
      }
    }

    onSave();
  };

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
        {editingPolicy ? "Edit Policy" : "Create New Policy"}
      </DialogTitle>
      <DialogContent sx={{ pt: 4, pb: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
          {/* Basic Information Section */}
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

            <FormControl fullWidth size="medium" sx={{ mb: 2 }}>
              <InputLabel>Policy Type *</InputLabel>
              <Select
                label="Policy Type *"
                value={formData.policyType}
                onChange={(e) =>
                  onFormChange("policyType", e.target.value as PolicyTypeEnum)
                }
              >
                {POLICY_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Typography sx={{ fontSize: 15 }}>{type.label}</Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="medium"
              label="Policy Name *"
              value={formData.policyName}
              onChange={(e) => onFormChange("policyName", e.target.value)}
              placeholder="e.g., Standard Return Policy"
              inputProps={{ style: { fontSize: 15 } }}
            />
          </Box>

          {/* Details Section */}
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
              Policy Details
            </Typography>

            <Grid container spacing={2}>
              {/* Return Window Days - Only for Return policies */}
              {formData.policyType === PolicyTypeEnum.Return && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="medium"
                    type="number"
                    label="Return Window Days *"
                    value={formData.returnWindowDays ?? ""}
                    onChange={(e) =>
                      onFormChange(
                        "returnWindowDays",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    inputProps={{ style: { fontSize: 15 } }}
                  />
                </Grid>
              )}

              {/* Warranty Months - Only for Warranty policies */}
              {formData.policyType === PolicyTypeEnum.Warranty && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="medium"
                    type="number"
                    label="Warranty Months *"
                    value={formData.warrantyMonths ?? ""}
                    onChange={(e) =>
                      onFormChange(
                        "warrantyMonths",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    inputProps={{ style: { fontSize: 15 } }}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="medium"
                  type="number"
                  inputProps={{ step: "0.01", style: { fontSize: 15 } }}
                  label="Min Order Amount"
                  value={formData.minOrderAmount ?? ""}
                  onChange={(e) =>
                    onFormChange(
                      "minOrderAmount",
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                />
              </Grid>

              {/* Refund Only Max Amount & Refund Window Days - Only for Refund policies */}
              {formData.policyType === PolicyTypeEnum.Refund && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="medium"
                      type="number"
                      inputProps={{ step: "0.01", style: { fontSize: 15 } }}
                      label="Refund Only Max Amount"
                      value={formData.refundOnlyMaxAmount ?? ""}
                      onChange={(e) =>
                        onFormChange(
                          "refundOnlyMaxAmount",
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="medium"
                      type="number"
                      label="Refund Window Days"
                      value={formData.refundWindowDays ?? ""}
                      onChange={(e) =>
                        onFormChange(
                          "refundWindowDays",
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      inputProps={{ style: { fontSize: 15 } }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>

          {/* Effective Period Section */}
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
              Effective Period
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="medium"
                  type="date"
                  label="Effective From *"
                  value={formData.effectiveFrom}
                  onChange={(e) => onFormChange("effectiveFrom", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ style: { fontSize: 15 } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="medium"
                  type="date"
                  label="Effective To"
                  value={formData.effectiveTo ?? ""}
                  onChange={(e) =>
                    onFormChange("effectiveTo", e.target.value || null)
                  }
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ style: { fontSize: 15 } }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Configuration Section */}
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
              Configuration
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                bgcolor: "rgba(0, 0, 0, 0.01)",
                p: 1.5,
                borderRadius: 1,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.refundAllowed}
                    onChange={(e) =>
                      onFormChange("refundAllowed", e.target.checked)
                    }
                  />
                }
                label={
                  <Typography sx={{ fontSize: 15 }}>
                    Refund Allowed
                  </Typography>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.customizedLensRefundable}
                    onChange={(e) =>
                      onFormChange("customizedLensRefundable", e.target.checked)
                    }
                  />
                }
                label={
                  <Typography sx={{ fontSize: 15 }}>
                    Customized Lens Refundable
                  </Typography>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.evidenceRequired}
                    onChange={(e) =>
                      onFormChange("evidenceRequired", e.target.checked)
                    }
                  />
                }
                label={
                  <Typography sx={{ fontSize: 15 }}>
                    Evidence Required
                  </Typography>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isActive}
                    onChange={(e) => onFormChange("isActive", e.target.checked)}
                  />
                }
                label={
                  <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                    Active Status
                  </Typography>
                }
              />
            </Box>
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
          onClick={handleSave}
          variant="contained"
          disabled={isCreating || isUpdating}
          sx={{ textTransform: "none", fontWeight: 700, fontSize: 15 }}
        >
          {isCreating || isUpdating ? "Saving..." : "Save Policy"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
