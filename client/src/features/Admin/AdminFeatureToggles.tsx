import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Paper,
  Switch,
  Grid,
  Stack,
  MenuItem,
  IconButton,
} from "@mui/material";
import { useState } from "react";
import { useAdminFeatureToggles } from "../../lib/hooks/useAdminFeatureToggles";
import type {
  FeatureToggleDto,
  CreateFeatureTogglePayload,
  UpdateFeatureTogglePayload,
} from "../../lib/types";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";

// Approach 1: In-app banner showing available features
const AVAILABLE_FEATURES = [
  {
    name: "3DModels",
    description: "3D model viewer for products",
  },
  {
    name: "VirtualTryOn",
    description: "Virtual try-on using AI",
  },
  {
    name: "Chatbot",
    description: "AI chatbot widget",
  },
];

const INITIAL_FORM_STATE: CreateFeatureTogglePayload = {
  featureName: "",
  description: "",
  isEnabled: true,
  scope: null,
  scopeValue: null,
  effectiveFrom: null,
  effectiveTo: null,
};

interface FilterState {
  pageNumber: number;
  pageSize: number;
  isEnabled: boolean | null;
  scope: string | null;
  search: string | null;
}

export default function AdminFeatureToggles() {
  const [filters, setFilters] = useState<FilterState>({
    pageNumber: 1,
    pageSize: 10,
    isEnabled: null,
    scope: null,
    search: null,
  });

  const {
    toggles,
    togglesData,
    isTogglesLoading,
    createToggle,
    isCreating,
    updateToggle,
    isUpdating,
    setToggleEnabled,
    isSettingEnabled,
    deleteToggle,
    isDeleting,
  } = useAdminFeatureToggles({
    pageNumber: filters.pageNumber,
    pageSize: filters.pageSize,
    isEnabled: filters.isEnabled,
    scope: filters.scope || undefined,
    search: filters.search || undefined,
  });

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [editingToggle, setEditingToggle] = useState<FeatureToggleDto | null>(null);
  const [formData, setFormData] = useState<CreateFeatureTogglePayload>(INITIAL_FORM_STATE);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [expandedToggleId, setExpandedToggleId] = useState<string | null>(null);

  // Handle dialog open for create
  const handleOpenCreateDialog = () => {
    setEditingToggle(null);
    setFormData(INITIAL_FORM_STATE);
    setOpenDialog(true);
  };

  // Handle dialog open for edit
  const handleOpenEditDialog = (toggle: FeatureToggleDto) => {
    setEditingToggle(toggle);
    setFormData({
      featureName: toggle.featureName,
      description: toggle.description || "",
      isEnabled: toggle.isEnabled,
      scope: toggle.scope,
      scopeValue: toggle.scopeValue,
      effectiveFrom: toggle.effectiveFrom ? toggle.effectiveFrom.split("T")[0] : null,
      effectiveTo: toggle.effectiveTo ? toggle.effectiveTo.split("T")[0] : null,
    });
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingToggle(null);
    setFormData(INITIAL_FORM_STATE);
  };

  // Handle form input change
  const handleFormChange = (field: keyof CreateFeatureTogglePayload, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Validate scope/scopeValue pairing
  const validateScoping = () => {
    const { scope, scopeValue } = formData;
    if ((scope && !scopeValue) || (!scope && scopeValue)) {
      toast.error("Both Scope and ScopeValue must be provided together, or both must be empty");
      return false;
    }
    return true;
  };

  // Validate effective dates
  const validateDates = () => {
    const { effectiveFrom, effectiveTo } = formData;
    if (effectiveFrom && effectiveTo && effectiveFrom >= effectiveTo) {
      toast.error("Effective To date must be after Effective From date");
      return false;
    }
    return true;
  };

  // Validate feature name against available features (strict match - Approach 2)
  const validateFeatureName = (name: string): { isValid: boolean; message?: string } => {
    if (!name.trim()) {
      return { isValid: false, message: "Feature name is required" };
    }

    // Check if matches any available feature (case-sensitive, exact match)
    const matchedFeature = AVAILABLE_FEATURES.find((f) => f.name === name);

    if (matchedFeature) {
      // Perfect match with built-in feature
      return { isValid: true };
    }

    // Not in available features - reject with list
    const availableNames = AVAILABLE_FEATURES.map((f) => f.name).join(", ");
    return {
      isValid: false,
      message: `"${name}" is not a recognized feature. Available: ${availableNames}`,
    };
  };

  // Handle form submission (Create or Update)
  const handleSaveToggle = () => {
    // Validate feature name (strict match)
    const nameValidation = validateFeatureName(formData.featureName);
    if (!nameValidation.isValid) {
      toast.error(nameValidation.message || "Invalid feature name");
      return;
    }

    if (!validateScoping() || !validateDates()) {
      return;
    }

    if (editingToggle) {
      // Update existing toggle
      updateToggle(
        {
          id: editingToggle.id,
          payload: {
            featureName: formData.featureName,
            description: formData.description || null,
            isEnabled: formData.isEnabled,
            scope: formData.scope,
            scopeValue: formData.scopeValue,
            effectiveFrom: formData.effectiveFrom,
            effectiveTo: formData.effectiveTo,
          } as UpdateFeatureTogglePayload,
        },
        {
          onSuccess: () => {
            toast.success("Feature toggle updated successfully");
            handleCloseDialog();
          },
          onError: () => {
            toast.error("Failed to update feature toggle");
          },
        }
      );
    } else {
      // Create new toggle
      createToggle(formData, {
        onSuccess: () => {
          toast.success("Feature toggle created successfully");
          handleCloseDialog();
        },
        onError: () => {
          toast.error("Failed to create feature toggle");
        },
      });
    }
  };

  // Handle delete dialog open
  const handleOpenDeleteDialog = (id: string) => {
    setDeleteTargetId(id);
    setOpenDeleteDialog(true);
  };

  // Handle delete confirmation
  const handleConfirmDelete = () => {
    if (!deleteTargetId) return;

    deleteToggle(deleteTargetId, {
      onSuccess: () => {
        toast.success("Feature toggle deleted successfully");
        setOpenDeleteDialog(false);
        setDeleteTargetId(null);
      },
      onError: () => {
        toast.error("Failed to delete feature toggle");
      },
    });
  };

  // Handle quick enable/disable toggle
  const handleQuickToggle = (toggle: FeatureToggleDto) => {
    setToggleEnabled(
      {
        id: toggle.id,
        payload: { isEnabled: !toggle.isEnabled },
      },
      {
        onSuccess: () => {
          toast.success(
            `Feature toggle ${!toggle.isEnabled ? "enabled" : "disabled"} successfully`
          );
        },
        onError: () => {
          toast.error("Failed to update feature toggle");
        },
      }
    );
  };



  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 2, md: 4, lg: 6 },
        py: 4,
        bgcolor: "#FAFAF8",
        color: "#171717",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography
          sx={{
            fontSize: 11,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#8A8A8A",
            fontWeight: 700,
          }}
        >
          Admin Console
        </Typography>

        <Typography sx={{ mt: 1, fontSize: { xs: 24, md: 30 }, fontWeight: 800, color: "#171717" }}>
          Feature Toggles
        </Typography>

        <Typography sx={{ mt: 0.5, color: "#6B6B6B", maxWidth: 520, fontSize: 14 }}>
          Manage feature visibility and rollouts across your application. Control feature activation by scope, region, or time period without requiring redeployment.
        </Typography>
      </Box>

      {/* Filters & Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.08)",
          bgcolor: "#ffffff",
        }}
      >
        <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
          {/* Search */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search by feature name..."
              size="small"
              value={filters.search || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value || null, pageNumber: 1 }))
              }
            />
          </Grid>

          {/* Status Filter */}
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="Status"
              size="small"
              select
              value={filters.isEnabled ?? ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  isEnabled: e.target.value === "" ? null : e.target.value === "true",
                  pageNumber: 1,
                }))
              }
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="true">✓ Enabled</MenuItem>
              <MenuItem value="false">✕ Disabled</MenuItem>
            </TextField>
          </Grid>

          {/* Scope Filter */}
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="Scope"
              size="small"
              select
              value={filters.scope ?? ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  scope: e.target.value || null,
                  pageNumber: 1,
                }))
              }
            >
              <MenuItem value="">All Scopes</MenuItem>
              <MenuItem value="Global">Global</MenuItem>
              <MenuItem value="Region">Region</MenuItem>
              <MenuItem value="TimeWindow">Time Window</MenuItem>
            </TextField>
          </Grid>

          {/* Actions - Create Button */}
          <Grid item xs={12} md="auto">
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateDialog}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 1,
                  bgcolor: "#B68C5A",
                  "&:hover": { bgcolor: "#9A7548" },
                }}
              >
                Create Toggle
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Feature Toggles Table */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "rgba(0, 0, 0, 0.08)",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 12px 30px rgba(0, 0, 0, 0.08)",
          },
        }}
      >
        {isTogglesLoading ? (
          <Box sx={{ p: 8, textAlign: "center" }}>
            <Typography sx={{ color: "text.secondary", fontSize: 16, fontWeight: 500 }}>
              ⏳ Loading feature toggles...
            </Typography>
          </Box>
        ) : toggles.length === 0 ? (
          <Box sx={{ p: 8, textAlign: "center" }}>
            <Typography sx={{ color: "text.secondary", mb: 1.5, fontSize: 18, fontWeight: 600 }}>
              📭 No feature toggles found
            </Typography>
            <Typography sx={{ fontSize: 15, color: "text.secondary", mb: 3 }}>
              Create your first feature toggle to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
              sx={{
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Create First Toggle
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 900 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 900, fontSize: 14, width: "5%" }}></TableCell>
                    <TableCell sx={{ fontWeight: 900, fontSize: 14 }}>Feature Name</TableCell>
                    <TableCell sx={{ fontWeight: 900, fontSize: 14 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 900, fontSize: 14 }} align="center">Quick Toggle</TableCell>
                    <TableCell sx={{ fontWeight: 900, fontSize: 14 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {toggles.map((toggle) => (
                    <>
                      <TableRow
                        key={toggle.id}
                        hover
                        sx={{
                          "& td": { py: 1.8, fontSize: 14 },
                        }}
                      >
                        <TableCell sx={{ width: "5%" }}>
                          <IconButton
                            size="small"
                            onClick={() => setExpandedToggleId(expandedToggleId === toggle.id ? null : toggle.id)}
                            sx={{
                              color: "#6B6B6B",
                              transition: "all 0.18s ease",
                              "&:hover": { color: "#171717", bgcolor: "rgba(0,0,0,0.04)" },
                            }}
                            aria-label={expandedToggleId === toggle.id ? "Hide details" : "Show details"}
                          >
                            {expandedToggleId === toggle.id ? <KeyboardArrowUpRoundedIcon /> : <KeyboardArrowDownRoundedIcon />}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: 15, color: "text.primary" }}>
                              {toggle.featureName}
                            </Typography>
                            {toggle.description && (
                              <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.75 }}>
                                {toggle.description}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={toggle.isEnabled ? "✓ Enabled" : "✕ Disabled"}
                            size="medium"
                            color={toggle.isEnabled ? "success" : "default"}
                            variant={toggle.isEnabled ? "filled" : "outlined"}
                            sx={{
                              fontWeight: 700,
                              fontSize: 13,
                              transition: "all 0.2s ease",
                              ...(toggle.isEnabled && {
                                boxShadow: "0 2px 8px rgba(76, 175, 80, 0.3)",
                              }),
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Switch
                            checked={toggle.isEnabled}
                            onChange={() => handleQuickToggle(toggle)}
                            disabled={isSettingEnabled}
                            size="small"
                            sx={{
                              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              "& .MuiSwitch-switchBase": {
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                color: "#ccc",
                                "&:hover": {
                                  bgcolor: "rgba(0, 0, 0, 0.04)",
                                },
                                "&.Mui-checked": {
                                  color: "primary.main",
                                  "& + .MuiSwitch-track": {
                                    bgcolor: "rgba(33, 150, 243, 0.4)",
                                    boxShadow: "inset 0 2px 4px rgba(33, 150, 243, 0.2)",
                                  },
                                  "&:hover": {
                                    bgcolor: "rgba(33, 150, 243, 0.08)",
                                  },
                                },
                                "&.Mui-disabled": {
                                  opacity: 0.5,
                                  color: "#ccc",
                                },
                              },
                              "& .MuiSwitch-track": {
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                bgcolor: "rgba(0, 0, 0, 0.12)",
                                boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.08)",
                              },
                              "&:hover .MuiSwitch-switchBase:not(.Mui-checked)": {
                                color: "#999",
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Button
                              size="small"
                              variant="text"
                              onClick={() => handleOpenEditDialog(toggle)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              onClick={() => handleOpenDeleteDialog(toggle.id)}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                      {expandedToggleId === toggle.id && (
                        <TableRow>
                          <TableCell colSpan={5} sx={{ p: 0, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                            <Box sx={{ px: 2.25, py: 1.5, bgcolor: "#FFFFFF" }}>
                              <Box
                                sx={{
                                  bgcolor: "#FAFAF8",
                                  border: "1px solid rgba(0,0,0,0.06)",
                                  borderRadius: "14px",
                                  p: { xs: 2, md: 2.25 },
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "grid",
                                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                                    gap: 2,
                                  }}
                                >
                                  <Stack spacing={0.8}>
                                    <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>
                                      Scope
                                    </Typography>
                                    <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                                      {toggle.scope ?? "—"}
                                    </Typography>
                                  </Stack>
                                  <Stack spacing={0.8}>
                                    <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>
                                      Scope Value
                                    </Typography>
                                    <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                                      {toggle.scopeValue ?? "—"}
                                    </Typography>
                                  </Stack>
                                  <Stack spacing={0.8}>
                                    <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>
                                      Effective From
                                    </Typography>
                                    <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                                      {toggle.effectiveFrom
                                        ? new Date(toggle.effectiveFrom).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                                        : "—"}
                                    </Typography>
                                  </Stack>
                                  <Stack spacing={0.8}>
                                    <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>
                                      Effective To
                                    </Typography>
                                    <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                                      {toggle.effectiveTo
                                        ? new Date(toggle.effectiveTo).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                                        : "—"}
                                    </Typography>
                                  </Stack>
                                </Box>
                              </Box>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                
                </TableBody>
              </Table>
            </TableContainer>
            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ p: 2 }}>
              <Button
                variant="outlined"
                disabled={filters.pageNumber <= 1}
                onClick={() => setFilters(prev => ({ ...prev, pageNumber: prev.pageNumber - 1 }))}
              >
                Prev
              </Button>
              <Chip
                label={`Page ${filters.pageNumber} / ${Math.ceil((togglesData?.totalCount || 0) / filters.pageSize)} · ${togglesData?.totalCount || 0} items`}
                sx={{ bgcolor: "rgba(0,0,0,0.06)", fontWeight: 700 }}
              />
              <Button
                variant="outlined"
                disabled={filters.pageNumber >= Math.ceil((togglesData?.totalCount || 0) / filters.pageSize)}
                onClick={() => setFilters(prev => ({ ...prev, pageNumber: prev.pageNumber + 1 }))}
              >
                Next
              </Button>
            </Stack>
          </>
        )}
      </Paper>

      {/* Feature Toggle Form Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            fontSize: 19,
            borderBottom: "2px solid",
            borderColor: "rgba(33, 150, 243, 0.15)",
            pb: 2.5,
            background: "linear-gradient(135deg, rgba(33, 150, 243, 0.04) 0%, rgba(33, 150, 243, 0.02) 100%)",
          }}
        >
          {editingToggle ? "✏️  Edit Feature Toggle" : "➕ Create New Feature Toggle"}
        </DialogTitle>
        <DialogContent sx={{ pt: 4, pb: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* Basic Information Section */}
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 13, color: "primary.main", mb: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Basic Information
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <TextField
                  autoFocus
                  fullWidth
                  label="Feature Name *"
                  placeholder="e.g., 3DModels, VirtualTryOn, Chatbot"
                  value={formData.featureName}
                  onChange={(e) => handleFormChange("featureName", e.target.value)}
                  variant="outlined"
                  required
                  inputProps={{ maxLength: 100 }}
                  helperText={`${formData.featureName.length}/100 • Use PascalCase. Common: 3DModels, VirtualTryOn, Chatbot`}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      transition: "all 0.2s ease",
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Description"
                  placeholder="Describe what this feature toggle controls"
                  value={formData.description || ""}
                  onChange={(e) => handleFormChange("description", e.target.value || "")}
                  variant="outlined"
                  multiline
                  rows={3}
                  inputProps={{ maxLength: 500 }}
                  helperText={`${(formData.description || "").length}/500`}
                  sx={{
                    "& .MuiOutlinedInput-root textarea": {
                      transition: "all 0.2s ease",
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Enable/Disable */}
            <Box
              sx={{
                p: 2.5,
                bgcolor: "rgba(76, 175, 80, 0.04)",
                borderRadius: 1.5,
                border: "1.5px solid",
                borderColor: "rgba(76, 175, 80, 0.15)",
                transition: "all 0.2s ease",
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isEnabled || false}
                    onChange={(e) => handleFormChange("isEnabled", e.target.checked)}
                    size="medium"
                  />
                }
                label={
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                    {formData.isEnabled ? "✓ Feature is Enabled" : "✕ Feature is Disabled"}
                  </Typography>
                }
              />
            </Box>

            {/* Scoping Section */}
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 13, color: "primary.main", mb: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Scope (Optional)
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <TextField
                  fullWidth
                  label="Scope"
                  placeholder="e.g., region, tenant, cohort"
                  value={formData.scope || ""}
                  onChange={(e) => handleFormChange("scope", e.target.value || null)}
                  variant="outlined"
                  inputProps={{ maxLength: 50 }}
                  helperText="Leave empty for global toggle"
                />

                <TextField
                  fullWidth
                  label="Scope Value"
                  placeholder="e.g., US-West, customer-123"
                  value={formData.scopeValue || ""}
                  onChange={(e) => handleFormChange("scopeValue", e.target.value || null)}
                  variant="outlined"
                  disabled={!formData.scope}
                  inputProps={{ maxLength: 200 }}
                  helperText={formData.scope ? "Specific value for the scope" : "Only available when Scope is provided"}
                />
              </Box>
            </Box>

            {/* Time-Based Activation */}
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 13, color: "primary.main", mb: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Time-Based Activation (Optional)
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <TextField
                  fullWidth
                  label="Effective From"
                  type="date"
                  value={formData.effectiveFrom || ""}
                  onChange={(e) => handleFormChange("effectiveFrom", e.target.value || null)}
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText="Leave empty to activate immediately"
                />

                <TextField
                  fullWidth
                  label="Effective To"
                  type="date"
                  value={formData.effectiveTo || ""}
                  onChange={(e) => handleFormChange("effectiveTo", e.target.value || null)}
                  variant="outlined"
                  disabled={!formData.effectiveFrom}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText={
                    formData.effectiveFrom
                      ? "Must be after Effective From date"
                      : "Only available if Effective From is set"
                  }
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: "1px solid", borderColor: "rgba(0, 0, 0, 0.08)", gap: 1.5 }}>
          <Button 
            onClick={handleCloseDialog} 
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveToggle}
            variant="contained"
            disabled={isCreating || isUpdating}
            sx={{ 
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "0 2px 8px rgba(33, 150, 243, 0.3)",
              transition: "all 0.2s ease",
              "&:hover:not(:disabled)": {
                boxShadow: "0 4px 12px rgba(33, 150, 243, 0.4)",
              },
            }}
          >
            {editingToggle ? "💾 Update" : "✓ Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        <DialogTitle 
          sx={{ 
            fontWeight: 800, 
            fontSize: 18,
            background: "linear-gradient(135deg, rgba(211, 47, 47, 0.05) 0%, rgba(211, 47, 47, 0.02) 100%)",
            borderBottom: "2px solid",
            borderColor: "rgba(211, 47, 47, 0.15)",
            pb: 2.5,
          }}
        >
          🗑️ Delete Feature Toggle
        </DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 16, mb: 1.5 }}>
            Are you sure?
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 14, lineHeight: 1.6 }}>
            This action will permanently delete this feature toggle from the system. This cannot be undone and may affect features that depend on this toggle.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: "1px solid", borderColor: "rgba(0, 0, 0, 0.08)", gap: 1.5 }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)} 
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={isDeleting}
            sx={{ 
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "0 2px 8px rgba(211, 47, 47, 0.3)",
              transition: "all 0.2s ease",
              "&:hover:not(:disabled)": {
                boxShadow: "0 4px 12px rgba(211, 47, 47, 0.4)",
              },
            }}
          >
            ✓ Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
