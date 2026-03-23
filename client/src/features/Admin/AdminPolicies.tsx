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
  Paper,
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
          Policies
        </Typography>
        <Typography sx={{ mt: 1.5, color: "text.secondary", maxWidth: 700, fontSize: 15, lineHeight: 1.6 }}>
          Create, edit, and manage return, warranty, and refund policies with detailed configuration.
        </Typography>
      </Box>

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
            placeholder="Search by policy name..."
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

        {/* Policy Type Filter */}
        <TextField
          select
          size="small"
          value={filters.policyType ?? ""}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              policyType: e.target.value ? (parseInt(e.target.value) as PolicyTypeEnum) : null,
              pageNumber: 1,
            }))
          }
          SelectProps={{
            native: true,
          }}
          sx={{
            minWidth: 160,
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
          <option value="">All Types</option>
          {POLICY_TYPES.map((type) => (
            <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
          ))}
        </TextField>

        {/* Status Filter */}
        <TextField
          select
          size="small"
          value={filters.isActive ?? ""}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              isActive: e.target.value === "" ? null : e.target.value === "true",
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
          <option value="true">✓ Active</option>
          <option value="false">✕ Inactive</option>
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
          Create Policy
        </Button>
      </Box>

      {/* Policies Table */}
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
                  <TableRow 
                    sx={{ 
                      bgcolor: "rgba(33, 150, 243, 0.04)",
                      borderBottom: "2px solid",
                      borderColor: "rgba(33, 150, 243, 0.15)",
                    }}
                  >
                    <TableCell sx={{ fontWeight: 800, fontSize: 14, py: 2.5, color: "primary.main" }}>Policy Name</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: 14, py: 2.5, color: "primary.main" }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: 14, py: 2.5, color: "primary.main" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: 14, py: 2.5, color: "primary.main" }} align="right">
                      Return Days
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: 14, py: 2.5, color: "primary.main" }} align="right">
                      Warranty Months
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
                  {policies.map((policy, index) => {
                    const typeLabel: string = getPolicyTypeLabel(policy.policyType);
                    const typeColor = POLICY_TYPE_COLORS[typeof policy.policyType === 'number' ? policy.policyType : 0];
                    return (
                      <TableRow
                        key={policy.id}
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
    </>
  );
}
