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
      <Box 
        sx={{ 
          mb: 6,
          background: "linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.02) 100%)",
          py: 3.5,
          px: 3.5,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "rgba(25, 118, 210, 0.1)",
        }}
      >
        <Typography
          sx={{
            fontSize: 11,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "primary.main",
            fontWeight: 700,
            opacity: 0.8,
          }}
        >
          Admin Console
        </Typography>
        <Typography sx={{ mt: 1.5, fontSize: 32, fontWeight: 900, color: "text.primary", letterSpacing: -0.5 }}>
          Feature Toggles
        </Typography>
        <Typography sx={{ mt: 1.5, color: "text.secondary", maxWidth: 700, fontSize: 15, lineHeight: 1.6 }}>
          Manage feature visibility and rollouts across your application. Control feature activation by scope, region, or time period without requiring redeployment.
        </Typography>
      </Box>

      {/* Available Features Banner */}
      <Paper
        elevation={0}
        sx={{
          mb: 5,
          p: 3,
          background: "linear-gradient(135deg, rgba(33, 150, 243, 0.08) 0%, rgba(33, 150, 243, 0.04) 100%)",
          border: "1px solid",
          borderColor: "rgba(33, 150, 243, 0.15)",
          borderLeft: "5px solid",
          borderLeftColor: "primary.main",
          cursor: "default",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(33, 150, 243, 0.12)",
          },
          borderRadius: 2,
          display: "flex",
          gap: 3,
          alignItems: "flex-start",
        }}
      >
        <InfoIcon
          sx={{
            color: "primary.main",
            fontSize: 28,
            mt: 0.5,
            flexShrink: 0,
            opacity: 0.9,
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 15,
              color: "primary.main",
              mb: 2.5,
              letterSpacing: 0.3,
            }}
          >
            📌 Available Features for Toggle
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            {AVAILABLE_FEATURES.map((feature) => (
              <Box
                key={feature.name}
                sx={{
                  bgcolor: "white",
                  px: 2.5,
                  py: 1.5,
                  borderRadius: 1.5,
                  border: "1.5px solid",
                  borderColor: "rgba(33, 150, 243, 0.25)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: "0 4px 12px rgba(33, 150, 243, 0.15)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: 14, color: "text.primary" }}>
                  {feature.name}
                </Typography>
                <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.75, lineHeight: 1.4 }}>
                  {feature.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Filters Section */}
      <Box 
        sx={{ 
          mb: 5, 
          display: "flex", 
          gap: 2, 
          alignItems: "center", 
          flexWrap: "wrap",
        }}
      >
        {/* Search */}
        <Box sx={{ flex: 1, minWidth: 240 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by feature name..."
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1.5, color: "primary.main", fontSize: 20, opacity: 0.6 }} />,
            }}
            value={filters.search || ""}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value || null, pageNumber: 1 }))
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#ffffff",
                borderRadius: 1.5,
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                border: "1.5px solid",
                borderColor: "rgba(0, 0, 0, 0.08)",
                "&:hover": {
                  borderColor: "rgba(0, 0, 0, 0.12)",
                  backgroundColor: "#ffffff",
                },
                "&.Mui-focused": {
                  backgroundColor: "#ffffff",
                  borderColor: "primary.main",
                  boxShadow: "0 0 0 3px rgba(33, 150, 243, 0.08)",
                },
              },
              "& .MuiOutlinedInput-input::placeholder": {
                color: "rgba(0, 0, 0, 0.4)",
                opacity: 1,
              },
            }}
          />
        </Box>

        {/* Status Filter */}
        <TextField
          select
          size="small"
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
          sx={{
            minWidth: 140,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#ffffff",
              borderRadius: 1.5,
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              border: "1.5px solid",
              borderColor: "rgba(0, 0, 0, 0.08)",
              "&:hover": {
                borderColor: "rgba(0, 0, 0, 0.12)",
              },
              "&.Mui-focused": {
                borderColor: "primary.main",
                boxShadow: "0 0 0 3px rgba(33, 150, 243, 0.08)",
              },
            },
          }}
        >
          <option value="">All Status</option>
          <option value="true">✓ Enabled</option>
          <option value="false">✕ Disabled</option>
        </TextField>

        {/* Create Button */}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            py: 1,
            px: 2.5,
            fontSize: 14,
            borderRadius: 1.5,
            boxShadow: "0 2px 8px rgba(33, 150, 243, 0.25)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              boxShadow: "0 4px 16px rgba(33, 150, 243, 0.35)",
              transform: "translateY(-2px)",
            },
            "&:active": {
              transform: "translateY(0px)",
            },
          }}
        >
          Create Toggle
        </Button>
      </Box>

      {/* Feature Toggles Table */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "rgba(0, 0, 0, 0.08)",
          borderRadius: 2,
          overflow: "hidden",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
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
                  <TableRow 
                    sx={{ 
                      bgcolor: "rgba(33, 150, 243, 0.04)",
                      borderBottom: "2px solid",
                      borderColor: "rgba(33, 150, 243, 0.15)",
                    }}
                  >
                    <TableCell sx={{ fontWeight: 800, fontSize: 14, py: 2.5, color: "primary.main" }}>
                      Feature Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: 14, py: 2.5, color: "primary.main" }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: 14, py: 2.5, color: "primary.main" }}>
                      Scope
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: 14, py: 2.5, color: "primary.main" }}>
                      Effective From
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: 14, py: 2.5, color: "primary.main" }}>
                      Effective To
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: 14, py: 2.5, color: "primary.main" }} align="center">
                      Quick Toggle
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: 14, py: 2.5, color: "primary.main" }} align="center">
                      Edit
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: 14, py: 2.5, color: "primary.main" }} align="center">
                      Delete
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {toggles.map((toggle, index) => (
                    <TableRow
                      key={toggle.id}
                      hover
                      sx={{
                        bgcolor: index % 2 === 0 ? "rgba(0, 0, 0, 0.01)" : "white",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: "rgba(33, 150, 243, 0.06)",
                        },
                        "& td": { py: 2, borderColor: "rgba(0, 0, 0, 0.05)" },
                        borderBottom: "1px solid",
                        borderColor: "rgba(0, 0, 0, 0.05)",
                      }}
                    >
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
                      <TableCell>
                        <Typography sx={{ fontSize: 15, fontWeight: 600, color: toggle.scope ? "primary.main" : "text.secondary" }}>
                          {toggle.scope ? `${toggle.scope}` : "-"}
                        </Typography>
                        {toggle.scope && toggle.scopeValue && (
                          <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}>
                            {toggle.scopeValue}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 15, fontWeight: 500 }}>
                          {toggle.effectiveFrom
                            ? new Date(toggle.effectiveFrom).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                            : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 15, fontWeight: 500 }}>
                          {toggle.effectiveTo
                            ? new Date(toggle.effectiveTo).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                            : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={toggle.isEnabled ? "Click to disable" : "Click to enable"}>
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
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit Toggle">
                          <IconButton
                            size="medium"
                            onClick={() => handleOpenEditDialog(toggle)}
                            sx={{ 
                              color: "primary.main", 
                              transition: "all 0.2s ease",
                              "&:hover": { 
                                bgcolor: "rgba(33, 150, 243, 0.1)",
                              } 
                            }}
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
                            sx={{ 
                              transition: "all 0.2s ease",
                              "&:hover": { 
                                bgcolor: "rgba(211, 47, 47, 0.1)",
                              } 
                            }}
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
                bgcolor: "rgba(0, 0, 0, 0.02)",
                "& .MuiTablePagination-root": {
                  borderTop: "1px solid",
                  borderColor: "rgba(33, 150, 243, 0.15)",
                },
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                  fontSize: 14,
                  m: 0,
                  fontWeight: 500,
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

            <Divider />

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

            <Divider />

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
    </>
  );
}
