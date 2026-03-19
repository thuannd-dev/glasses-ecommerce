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
  TablePagination,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  alpha,
  Switch,
} from "@mui/material";
import { useState } from "react";
import { useAdminFeatureToggles } from "../../lib/hooks/useAdminFeatureToggles";
import type {
  FeatureToggleDto,
  CreateFeatureTogglePayload,
  UpdateFeatureTogglePayload,
} from "../../lib/types";
import { toast } from "react-toastify";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import InfoIcon from "@mui/icons-material/Info";

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

  // Handle pagination
  const handlePageChange = (_event: unknown, newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      pageNumber: newPage + 1,
    }));
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilters((prev) => ({
      ...prev,
      pageSize: parseInt(event.target.value, 10),
      pageNumber: 1,
    }));
  };

  return (
    <>
      {/* Header Section */}
      <Box sx={{ mb: 5 }}>
        <Typography
          sx={{
            fontSize: 12,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "text.secondary",
          }}
        >
          Admin Console
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 30, fontWeight: 900, color: "text.primary" }}>
          Feature Toggles
        </Typography>
        <Typography sx={{ mt: 1, color: "text.secondary", maxWidth: 700, fontSize: 14 }}>
          Create, edit, and manage feature toggles to control feature visibility, rollouts, and time-based activation without redeployment.
        </Typography>
      </Box>

      {/* Approach 1: In-app Banner showing Available Features */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: 2.5,
          bgcolor: "info.lighter",
          border: "1px solid",
          borderColor: alpha("#1976d2", 0.2),
          borderLeft: "4px solid",
          borderLeftColor: "info.main",
          display: "flex",
          gap: 2,
          alignItems: "flex-start",
          borderRadius: 1,
        }}
      >
        <InfoIcon
          sx={{
            color: "info.main",
            fontSize: 24,
            mt: 0.5,
            flexShrink: 0,
          }}
        />
        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 14,
              color: "info.main",
              mb: 1,
            }}
          >
            Available Features
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            {AVAILABLE_FEATURES.map((feature) => (
              <Box
                key={feature.name}
                sx={{
                  bgcolor: "white",
                  px: 1.75,
                  py: 1,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: alpha("#1976d2", 0.3),
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "#1976d2",
                    boxShadow: `0 2px 8px ${alpha("#1976d2", 0.15)}`,
                  },
                }}
              >
                <Typography sx={{ fontWeight: 600, fontSize: 13, color: "text.primary" }}>
                  {feature.name}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.25 }}>
                  {feature.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Filters Section */}
      <Box sx={{ mb: 4, display: "flex", gap: 2, alignItems: "flex-end", flexWrap: "wrap" }}>
        {/* Search */}
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by feature name..."
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary", fontSize: 20 }} />,
            }}
            value={filters.search || ""}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value || null, pageNumber: 1 }))
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#ffffff",
              },
            }}
          />
        </Box>

        {/* Status Filter */}
        <Box sx={{ minWidth: 140 }}>
          <TextField
            select
            size="small"
            label="Status"
            value={filters.isEnabled ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                isEnabled: e.target.value === "" ? null : e.target.value === "true",
                pageNumber: 1,
              }))
            }
            SelectProps={{
              native: true,
            }}
          >
            <option value="">All</option>
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </TextField>
        </Box>

        {/* Create Button */}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            py: 1,
            fontSize: 13,
          }}
        >
          + Create Toggle
        </Button>
      </Box>

      {/* Feature Toggles Table */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {isTogglesLoading ? (
          <Box sx={{ p: 5, textAlign: "center" }}>
            <Typography sx={{ color: "text.secondary", fontSize: 16 }}>
              Loading feature toggles...
            </Typography>
          </Box>
        ) : toggles.length === 0 ? (
          <Box sx={{ p: 5, textAlign: "center" }}>
            <Typography sx={{ color: "text.secondary", mb: 1.5, fontSize: 16 }}>
              No feature toggles found
            </Typography>
            <Typography sx={{ fontSize: 15, color: "text.secondary" }}>
              Create your first feature toggle to get started
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 900 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "rgba(0, 0, 0, 0.02)" }}>
                    <TableCell sx={{ fontWeight: 800, fontSize: 15, py: 2 }}>
                      Feature Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: 15, py: 2 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: 15, py: 2 }}>Scope</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: 15, py: 2 }}>
                      Effective From
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: 15, py: 2 }}>
                      Effective To
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: 15, py: 2 }} align="center">
                      Quick Toggle
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: 15, py: 2 }} align="center">
                      Edit
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: 15, py: 2 }} align="center">
                      Delete
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {toggles.map((toggle) => (
                    <TableRow
                      key={toggle.id}
                      hover
                      sx={{
                        "&:hover": {
                          bgcolor: "rgba(0, 0, 0, 0.02)",
                        },
                        "& td": { py: 1.75 },
                      }}
                    >
                      <TableCell>
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
                            {toggle.featureName}
                          </Typography>
                          {toggle.description && (
                            <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}>
                              {toggle.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={toggle.isEnabled ? "Enabled" : "Disabled"}
                          size="medium"
                          color={toggle.isEnabled ? "success" : "default"}
                          variant={toggle.isEnabled ? "filled" : "outlined"}
                          sx={{
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 15, fontWeight: 500 }}>
                          {toggle.scope ? `${toggle.scope}` : "-"}
                        </Typography>
                        {toggle.scope && toggle.scopeValue && (
                          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                            {toggle.scopeValue}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 15, fontWeight: 500 }}>
                          {toggle.effectiveFrom
                            ? new Date(toggle.effectiveFrom).toLocaleDateString()
                            : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 15, fontWeight: 500 }}>
                          {toggle.effectiveTo
                            ? new Date(toggle.effectiveTo).toLocaleDateString()
                            : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={toggle.isEnabled ? "Disable" : "Enable"}>
                          <Switch
                            checked={toggle.isEnabled}
                            onChange={() => handleQuickToggle(toggle)}
                            disabled={isSettingEnabled}
                            size="small"
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit Toggle">
                          <IconButton
                            size="medium"
                            onClick={() => handleOpenEditDialog(toggle)}
                            sx={{ color: "primary.main", "&:hover": { bgcolor: alpha("#1976d2", 0.08) } }}
                          >
                            <EditIcon sx={{ fontSize: 22 }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Delete Toggle">
                          <IconButton
                            size="medium"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(toggle.id)}
                            sx={{ "&:hover": { bgcolor: alpha("#d32f2f", 0.08) } }}
                          >
                            <DeleteIcon sx={{ fontSize: 22 }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider sx={{ my: 0 }} />
            <TablePagination
              rowsPerPageOptions={[10, 20, 50]}
              component="div"
              count={togglesData?.totalCount || 0}
              rowsPerPage={filters.pageSize}
              page={filters.pageNumber - 1}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              sx={{
                "& .MuiTablePagination-root": {
                  borderTop: "1px solid",
                  borderColor: "divider",
                },
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                  fontSize: 15,
                  m: 0,
                },
              }}
            />
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
          {editingToggle ? "Edit Feature Toggle" : "Create New Feature Toggle"}
        </DialogTitle>
        <DialogContent sx={{ pt: 4, pb: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
            {/* Basic Information Section */}
            <TextField
              autoFocus
              fullWidth
              label="Feature Name"
              placeholder="e.g., 3DModels, VirtualTryOn, Chatbot"
              value={formData.featureName}
              onChange={(e) => handleFormChange("featureName", e.target.value)}
              variant="outlined"
              required
              inputProps={{ maxLength: 100 }}
              helperText={`${formData.featureName.length}/100 • Use PascalCase. Common features: 3DModels, VirtualTryOn, Chatbot`}
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
            />

            {/* Enable/Disable */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isEnabled || false}
                  onChange={(e) => handleFormChange("isEnabled", e.target.checked)}
                />
              }
              label="Enabled"
            />

            <Divider />

            {/* Scoping Section */}
            <Typography sx={{ fontWeight: 600, fontSize: 14, color: "text.secondary" }}>
              Scope (Optional)
            </Typography>

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
              helperText="Only if Scope is provided"
            />

            <Divider />

            {/* Time-Based Activation */}
            <Typography sx={{ fontWeight: 600, fontSize: 14, color: "text.secondary" }}>
              Time-Based Activation (Optional)
            </Typography>

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
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveToggle}
            variant="contained"
            disabled={isCreating || isUpdating}
            sx={{ textTransform: "none" }}
          >
            {editingToggle ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 18 }}>Delete Feature Toggle</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography>Are you sure you want to delete this feature toggle?</Typography>
          <Typography sx={{ mt: 1.5, color: "text.secondary", fontSize: 14 }}>
            This action cannot be undone. The toggle will be removed from the system.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={isDeleting}
            sx={{ textTransform: "none" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
