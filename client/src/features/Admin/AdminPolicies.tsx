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
  Paper,
  Stack,
  alpha,
  IconButton,
  Grid,
} from "@mui/material";
import React, { useState } from "react";
import { useAdminPolicies } from "../../lib/hooks/useAdminPolicies";
import type {
  PolicyConfigurationDto,
  CreatePolicyPayload,
  UpdatePolicyPayload,
} from "../../lib/types";
import { PolicyTypeEnum, getPolicyTypeLabel } from "../../lib/types";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";

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
  refundOnlyMaxAmount: null,
  refundWindowDays: null,
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
  const [expandedPolicyId, setExpandedPolicyId] = useState<string | null>(null);

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
      refundOnlyMaxAmount: policy.refundOnlyMaxAmount,
      refundWindowDays: policy.refundWindowDays,
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
        if (newType !== PolicyTypeEnum.Refund) {
          updated.refundOnlyMaxAmount = null;
          updated.refundWindowDays = null;
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

    // Validate Refund-specific fields
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

    // Clear fields that don't apply to this policy type
    let submitData = { ...formData };
    if (formData.policyType !== PolicyTypeEnum.Return) {
      submitData.returnWindowDays = null;
    }
    if (formData.policyType !== PolicyTypeEnum.Warranty) {
      submitData.warrantyMonths = null;
    }
    if (formData.policyType !== PolicyTypeEnum.Refund) {
      submitData.refundOnlyMaxAmount = null;
      submitData.refundWindowDays = null;
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
          Policies
        </Typography>

        <Typography sx={{ mt: 0.5, color: "#6B6B6B", maxWidth: 520, fontSize: 14 }}>
          Create, edit, and manage return, warranty, and refund policies with detailed configuration.
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
              placeholder="Search by policy name..."
              size="small"
              value={filters.search || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value || null, pageNumber: 1 }))
              }
            />
          </Grid>

          {/* Policy Type Filter */}
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="Type"
              size="small"
              select
              value={filters.policyType ?? ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  policyType: e.target.value ? (parseInt(e.target.value) as PolicyTypeEnum) : null,
                  pageNumber: 1,
                }))
              }
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value={1}>↩️ Return</MenuItem>
              <MenuItem value={2}>🛡️ Warranty</MenuItem>
              <MenuItem value={3}>💰 Refund</MenuItem>
            </TextField>
          </Grid>

          {/* Status Filter */}
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="Status"
              size="small"
              select
              value={filters.isActive ?? ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  isActive: e.target.value === "" ? null : e.target.value === "true",
                  pageNumber: 1,
                }))
              }
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="true">✓ Active</MenuItem>
              <MenuItem value="false">✕ Inactive</MenuItem>
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
                Create Policy
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Policies Table */}
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
        {isPoliciesLoading ? (
          <Box sx={{ p: 8, textAlign: "center" }}>
            <Typography sx={{ color: "text.secondary", fontSize: 16, fontWeight: 500 }}>
              ⏳ Loading policies...
            </Typography>
          </Box>
        ) : policies.length === 0 ? (
          <Box sx={{ p: 8, textAlign: "center" }}>
            <Typography sx={{ color: "text.secondary", mb: 1.5, fontSize: 18, fontWeight: 600 }}>
              📭 No policies found
            </Typography>
            <Typography sx={{ fontSize: 15, color: "text.secondary", mb: 3 }}>
              Create your first policy to get started
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
              Create First Policy
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 900 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 900, fontSize: 14, width: "5%" }}></TableCell>
                    <TableCell sx={{ fontWeight: 900, fontSize: 14 }}>Policy Name</TableCell>
                    <TableCell sx={{ fontWeight: 900, fontSize: 14 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 900, fontSize: 14 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 900, fontSize: 14 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {policies.map((policy) => {
                    const typeLabel: string = getPolicyTypeLabel(policy.policyType);
                    const typeColor = POLICY_TYPE_COLORS[typeof policy.policyType === 'number' ? policy.policyType : 0];
                    return (
                      <React.Fragment key={policy.id}>
                        <TableRow
                          hover
                          sx={{
                            "& td": { py: 1.8, fontSize: 14 },
                          }}
                        >
                        <TableCell sx={{ width: "5%" }}>
                          <IconButton
                            size="small"
                            onClick={() => setExpandedPolicyId(expandedPolicyId === policy.id ? null : policy.id)}
                            sx={{
                              color: "#6B6B6B",
                              transition: "all 0.18s ease",
                              "&:hover": { color: "#171717", bgcolor: "rgba(0,0,0,0.04)" },
                            }}
                            aria-label={expandedPolicyId === policy.id ? "Hide details" : "Show details"}
                          >
                            {expandedPolicyId === policy.id ? <KeyboardArrowUpRoundedIcon /> : <KeyboardArrowDownRoundedIcon />}
                          </IconButton>
                        </TableCell>
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
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => handleOpenEditDialog(policy)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                onClick={() => handleOpenDeleteDialog(policy.id)}
                              >
                                Delete
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                        {expandedPolicyId === policy.id && (
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
                                        Return Window Days
                                      </Typography>
                                      <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                                        {policy.returnWindowDays ?? "—"}
                                      </Typography>
                                    </Stack>
                                    <Stack spacing={0.8}>
                                      <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>
                                        Warranty Months
                                      </Typography>
                                      <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                                        {policy.warrantyMonths ?? "—"}
                                      </Typography>
                                    </Stack>
                                    <Stack spacing={0.8}>
                                      <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>
                                        Refund Window Days
                                      </Typography>
                                      <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                                        {policy.refundWindowDays ?? "—"}
                                      </Typography>
                                    </Stack>
                                    <Stack spacing={0.8}>
                                      <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>
                                        Refund Only Max Amount
                                      </Typography>
                                      <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                                        {policy.refundOnlyMaxAmount ? `$${policy.refundOnlyMaxAmount}` : "—"}
                                      </Typography>
                                    </Stack>
                                    <Stack spacing={0.8}>
                                      <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>
                                        Min Order Amount
                                      </Typography>
                                      <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                                        {policy.minOrderAmount ? `$${policy.minOrderAmount}` : "—"}
                                      </Typography>
                                    </Stack>
                                    <Stack spacing={0.8}>
                                      <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>
                                        Refund Allowed
                                      </Typography>
                                      <Chip
                                        label={policy.refundAllowed ? "Yes" : "No"}
                                        size="small"
                                        color={policy.refundAllowed ? "success" : "default"}
                                        variant={policy.refundAllowed ? "filled" : "outlined"}
                                        sx={{ fontWeight: 700, fontSize: 12, width: "fit-content" }}
                                      />
                                    </Stack>
                                    <Stack spacing={0.8}>
                                      <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>
                                        Evidence Required
                                      </Typography>
                                      <Chip
                                        label={policy.evidenceRequired ? "Yes" : "No"}
                                        size="small"
                                        color={policy.evidenceRequired ? "success" : "default"}
                                        variant={policy.evidenceRequired ? "filled" : "outlined"}
                                        sx={{ fontWeight: 700, fontSize: 12, width: "fit-content" }}
                                      />
                                    </Stack>
                                    <Stack spacing={0.8}>
                                      <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>
                                        Customized Lens Refundable
                                      </Typography>
                                      <Chip
                                        label={policy.customizedLensRefundable ? "Yes" : "No"}
                                        size="small"
                                        color={policy.customizedLensRefundable ? "success" : "default"}
                                        variant={policy.customizedLensRefundable ? "filled" : "outlined"}
                                        sx={{ fontWeight: 700, fontSize: 12, width: "fit-content" }}
                                      />
                                    </Stack>
                                    <Stack spacing={0.8}>
                                      <Typography sx={{ fontSize: 12, color: "#8A8A8A", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>
                                        Effective Period
                                      </Typography>
                                      <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                                        {new Date(policy.effectiveFrom).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                        {policy.effectiveTo && ` → ${new Date(policy.effectiveTo).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`}
                                      </Typography>
                                    </Stack>
                                  </Box>
                                </Box>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
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
                label={`Page ${filters.pageNumber} / ${Math.ceil((policiesData?.totalCount || 0) / filters.pageSize)} · ${policiesData?.totalCount || 0} items`}
                sx={{ bgcolor: "rgba(0,0,0,0.06)", fontWeight: 700 }}
              />
              <Button
                variant="outlined"
                disabled={filters.pageNumber >= Math.ceil((policiesData?.totalCount || 0) / filters.pageSize)}
                onClick={() => setFilters(prev => ({ ...prev, pageNumber: prev.pageNumber + 1 }))}
              >
                Next
              </Button>
            </Stack>
          </>
        )}
      </Paper>

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
                          handleFormChange(
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
                          handleFormChange(
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
