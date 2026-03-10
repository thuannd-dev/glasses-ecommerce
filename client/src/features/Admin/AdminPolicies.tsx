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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Divider,
  Grid,
  alpha,
} from "@mui/material";
import { useState } from "react";
import { useAdminPolicies } from "../../lib/hooks/useAdminPolicies";
import type {
  PolicyConfigurationDto,
  CreatePolicyPayload,
  UpdatePolicyPayload,
} from "../../lib/types";
import { PolicyTypeEnum, getPolicyTypeLabel } from "../../lib/types";
import { toast } from "react-toastify";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

// User-facing policy types with color schemes
const POLICY_TYPES = [
  { value: 1, label: "Return", color: "info", icon: "↩️" },
  { value: 2, label: "Warranty", color: "warning", icon: "🛡️" },
  { value: 3, label: "Refund", color: "error", icon: "💰" },
];

const POLICY_TYPE_COLORS: Record<number, string> = {
  1: "#1976d2",
  2: "#f57c00",
  3: "#d32f2f",
  0: "#757575",
};

const INITIAL_FORM_STATE: CreatePolicyPayload = {
  policyType: PolicyTypeEnum.Return,
  policyName: "",
  returnWindowDays: null,
  warrantyMonths: null,
  refundAllowed: true,
  customizedLensRefundable: false,
  evidenceRequired: true,
  minOrderAmount: null,
  isActive: true,
  effectiveFrom: new Date().toISOString().split("T")[0],
  effectiveTo: null,
};

interface FilterState {
  pageNumber: number;
  pageSize: number;
  policyType: PolicyTypeEnum | null;
  isActive: boolean | null;
  search: string | null;
}

export default function AdminPolicies() {
  const [filters, setFilters] = useState<FilterState>({
    pageNumber: 1,
    pageSize: 10,
    policyType: null,
    isActive: null,
    search: null,
  });

  const {
    policies,
    policiesData,
    isPoliciesLoading,
    createPolicy,
    isCreating,
    updatePolicy,
    isUpdating,
    deletePolicy,
    isDeleting,
  } = useAdminPolicies({
    pageNumber: filters.pageNumber,
    pageSize: filters.pageSize,
    policyType: filters.policyType,
    isActive: filters.isActive,
    search: filters.search || undefined,
  });

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<PolicyConfigurationDto | null>(null);
  const [formData, setFormData] = useState<CreatePolicyPayload>(INITIAL_FORM_STATE);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Handle dialog open for create
  const handleOpenCreateDialog = () => {
    setEditingPolicy(null);
    setFormData(INITIAL_FORM_STATE);
    setOpenDialog(true);
  };

  // Handle dialog open for edit
  const handleOpenEditDialog = (policy: PolicyConfigurationDto) => {
    setEditingPolicy(policy);
    // Normalize policyType to numeric value
    let normalizedType: PolicyTypeEnum = PolicyTypeEnum.Return;
    
    if (typeof policy.policyType === 'number') {
      normalizedType = Object.values(PolicyTypeEnum).includes(policy.policyType as any)
        ? (policy.policyType as PolicyTypeEnum)
        : PolicyTypeEnum.Return;
    } else if (typeof policy.policyType === 'string') {
      const typeMap: Record<string, PolicyTypeEnum> = {
        "Unknown": PolicyTypeEnum.Unknown,
        "Return": PolicyTypeEnum.Return,
        "Warranty": PolicyTypeEnum.Warranty,
        "Refund": PolicyTypeEnum.Refund,
      };
      normalizedType = typeMap[policy.policyType] || PolicyTypeEnum.Return;
    }
    
    // Initialize form data and clear fields that don't apply to this policy type
    let formDataToSet = {
      policyType: normalizedType,
      policyName: policy.policyName,
      returnWindowDays: normalizedType === PolicyTypeEnum.Return ? policy.returnWindowDays : null,
      warrantyMonths: normalizedType === PolicyTypeEnum.Warranty ? policy.warrantyMonths : null,
      refundAllowed: policy.refundAllowed,
      customizedLensRefundable: policy.customizedLensRefundable,
      evidenceRequired: policy.evidenceRequired,
      minOrderAmount: policy.minOrderAmount,
      isActive: policy.isActive,
      effectiveFrom: policy.effectiveFrom.split("T")[0],
      effectiveTo: policy.effectiveTo ? policy.effectiveTo.split("T")[0] : null,
    };
    setFormData(formDataToSet);
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPolicy(null);
    setFormData(INITIAL_FORM_STATE);
  };

  // Handle form input change
  const handleFormChange = (field: keyof CreatePolicyPayload, value: unknown) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      // Clear relevant fields based on policy type
      if (field === "policyType") {
        const newType = value as PolicyTypeEnum;
        if (newType !== PolicyTypeEnum.Return) {
          updated.returnWindowDays = null;
        }
        if (newType !== PolicyTypeEnum.Warranty) {
          updated.warrantyMonths = null;
        }
      }

      return updated;
    });
  };

  // Handle form submission (Create or Update)
  const handleSavePolicy = () => {
    if (!formData.policyName.trim()) {
      toast.error("Policy name is required");
      return;
    }

    if (!formData.effectiveFrom) {
      toast.error("Effective from date is required");
      return;
    }

    // Validate policy-type-specific fields
    if (formData.policyType === PolicyTypeEnum.Return && !formData.returnWindowDays) {
      toast.error("Return window days is required for return policies");
      return;
    }

    if (formData.policyType === PolicyTypeEnum.Warranty && !formData.warrantyMonths) {
      toast.error("Warranty months is required for warranty policies");
      return;
    }

    // Clear fields that don't apply to this policy type
    let submitData = { ...formData };
    if (formData.policyType !== PolicyTypeEnum.Return) {
      submitData.returnWindowDays = null;
    }
    if (formData.policyType !== PolicyTypeEnum.Warranty) {
      submitData.warrantyMonths = null;
    }

    if (editingPolicy) {
      // Update existing policy
      updatePolicy(
        { id: editingPolicy.id, payload: submitData as UpdatePolicyPayload },
        {
          onSuccess: () => {
            toast.success("Policy updated successfully");
            handleCloseDialog();
          },
          onError: () => {
            toast.error("Failed to update policy");
          },
        }
      );
    } else {
      // Create new policy
      createPolicy(submitData as CreatePolicyPayload, {
        onSuccess: () => {
          toast.success("Policy created successfully");
          handleCloseDialog();
        },
        onError: () => {
          toast.error("Failed to create policy");
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

    deletePolicy(deleteTargetId, {
      onSuccess: () => {
        toast.success("Policy deleted successfully");
        setOpenDeleteDialog(false);
        setDeleteTargetId(null);
      },
      onError: () => {
        toast.error("Failed to delete policy");
      },
    });
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
    <Box sx={{ px: { xs: 2, md: 4, lg: 6 }, py: 6 }}>
      {/* Header Section */}
      <Box sx={{ mb: 6 }}>
        <Typography
          sx={{
            fontSize: 12,
            letterSpacing: 6,
            textTransform: "uppercase",
            fontWeight: 700,
            color: "primary.main",
            mb: 2,
          }}
        >
          Policy Management
        </Typography>
        <Typography sx={{ fontSize: 42, fontWeight: 900, mb: 3, color: "text.primary" }}>
          Manage Business Policies
        </Typography>
        <Typography sx={{ color: "text.secondary", fontSize: 16, maxWidth: 700, lineHeight: 1.7 }}>
          Create, edit, and manage return, warranty, and refund policies with detailed configuration options.
        </Typography>
      </Box>

      {/* Filters Card */}
      <Card sx={{ mb: 2.5, boxShadow: 1, border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ p: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
            <FilterListIcon sx={{ mr: 1, color: "primary.main", fontSize: 20 }} />
            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Filters</Typography>
          </Box>
          <Grid container spacing={1.5}>
            {/* Search */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search policies..."
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary", fontSize: 20 }} />,
                }}
                value={filters.search || ""}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value || null, pageNumber: 1 }))
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "background.paper",
                  },
                }}
              />
            </Grid>

            {/* Policy Type Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Policy Type</InputLabel>
                <Select
                  label="Policy Type"
                  value={filters.policyType ?? ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      policyType: e.target.value ? (e.target.value as PolicyTypeEnum) : null,
                      pageNumber: 1,
                    }))
                  }
                >
                  <MenuItem value="">All Types</MenuItem>
                  {POLICY_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <span style={{ marginRight: 8 }}>{type.icon}</span>
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={filters.isActive ?? ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      isActive: e.target.value === "" ? null : e.target.value === "true",
                      pageNumber: 1,
                    }))
                  }
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Create Button */}
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateDialog}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  py: 0.8,
                  fontSize: 13,
                }}
              >
                + Create Policy
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Policies Table */}
      <Card sx={{ boxShadow: 1, border: "1px solid", borderColor: "divider" }}>
        {isPoliciesLoading ? (
          <Box sx={{ p: 5, textAlign: "center" }}>
            <Typography sx={{ color: "text.secondary", fontSize: 16 }}>Loading policies...</Typography>
          </Box>
        ) : policies.length === 0 ? (
          <Box sx={{ p: 5, textAlign: "center" }}>
            <Typography sx={{ color: "text.secondary", mb: 1.5, fontSize: 16 }}>No policies found</Typography>
            <Typography sx={{ fontSize: 15, color: "text.secondary" }}>
              Create your first policy to get started
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "rgba(0, 0, 0, 0.02)" }}>
                    <TableCell sx={{ fontWeight: 800, fontSize: 15, py: 2 }}>Policy Name</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: 15, py: 2 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: 15, py: 2 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: 15, py: 2 }} align="right">
                      Return Days
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: 15, py: 2 }} align="right">
                      Warranty Months
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
                  {policies.map((policy) => {
                    const typeLabel: string = getPolicyTypeLabel(policy.policyType);
                    const typeColor = POLICY_TYPE_COLORS[typeof policy.policyType === 'number' ? policy.policyType : 0];
                    return (
                      <TableRow
                        key={policy.id}
                        hover
                        sx={{
                          "&:hover": {
                            bgcolor: "rgba(0, 0, 0, 0.02)",
                          },
                          "& td": { py: 1.75 },
                        }}
                      >
                        <TableCell>
                          <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
                            {policy.policyName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={typeLabel}
                            size="medium"
                            sx={{
                              bgcolor: alpha(typeColor || "#1976d2", 0.1),
                              color: typeColor || "#1976d2",
                              fontWeight: 700,
                              fontSize: 13,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={policy.isActive ? "Active" : "Inactive"}
                            size="medium"
                            color={policy.isActive ? "success" : "default"}
                            variant={policy.isActive ? "filled" : "outlined"}
                            sx={{
                              fontWeight: 700,
                              fontSize: 13,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontSize: 15, fontWeight: 500 }}>
                            {policy.returnWindowDays ?? "-"}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontSize: 15, fontWeight: 500 }}>
                            {policy.warrantyMonths ?? "-"}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Edit Policy">
                            <IconButton
                              size="medium"
                              onClick={() => handleOpenEditDialog(policy)}
                              sx={{ color: "primary.main", "&:hover": { bgcolor: alpha("#1976d2", 0.08) } }}
                            >
                              <EditIcon sx={{ fontSize: 22 }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Delete Policy">
                            <IconButton
                              size="medium"
                              color="error"
                              onClick={() => handleOpenDeleteDialog(policy.id)}
                              sx={{ "&:hover": { bgcolor: alpha("#d32f2f", 0.08) } }}
                            >
                              <DeleteIcon sx={{ fontSize: 22 }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider sx={{ my: 0 }} />
            <TablePagination
              rowsPerPageOptions={[10, 20, 50]}
              component="div"
              count={policiesData?.totalCount || 0}
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
      </Card>

      {/* Policy Form Dialog */}
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
                    handleFormChange("policyType", e.target.value as PolicyTypeEnum)
                  }
                >
                  {POLICY_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <span style={{ marginRight: 10, fontSize: 18 }}>{type.icon}</span>
                        <Typography sx={{ fontSize: 15 }}>{type.label}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                size="medium"
                label="Policy Name *"
                value={formData.policyName}
                onChange={(e) => handleFormChange("policyName", e.target.value)}
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
                        handleFormChange(
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
                        handleFormChange(
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
                      handleFormChange(
                        "minOrderAmount",
                        e.target.value ? parseFloat(e.target.value) : null
                      )
                    }
                  />
                </Grid>
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
                    onChange={(e) => handleFormChange("effectiveFrom", e.target.value)}
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
                      handleFormChange("effectiveTo", e.target.value || null)
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
                        handleFormChange("refundAllowed", e.target.checked)
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
                        handleFormChange("customizedLensRefundable", e.target.checked)
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
                        handleFormChange("evidenceRequired", e.target.checked)
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
                      onChange={(e) => handleFormChange("isActive", e.target.checked)}
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
        <Divider sx={{ my: 0 }} />
        <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ textTransform: "none", fontWeight: 700, fontSize: 15 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSavePolicy}
            variant="contained"
            disabled={isCreating || isUpdating}
            sx={{ textTransform: "none", fontWeight: 700, fontSize: 15 }}
          >
            {isCreating || isUpdating ? "Saving..." : "Save Policy"}
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
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: 20,
            borderBottom: "1px solid",
            borderColor: "divider",
            pb: 2.5,
          }}
        >
          Delete Policy
        </DialogTitle>
        <DialogContent sx={{ pt: 4, pb: 3 }}>
          <Typography sx={{ color: "text.secondary", lineHeight: 1.7, fontSize: 15.5 }}>
            Are you sure you want to delete this policy? This action cannot be undone and may affect active orders.
          </Typography>
        </DialogContent>
        <Divider sx={{ my: 0 }} />
        <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            variant="outlined"
            sx={{ textTransform: "none", fontWeight: 700, fontSize: 15 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={isDeleting}
            sx={{ textTransform: "none", fontWeight: 700, fontSize: 15 }}
          >
            {isDeleting ? "Deleting..." : "Delete Policy"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
