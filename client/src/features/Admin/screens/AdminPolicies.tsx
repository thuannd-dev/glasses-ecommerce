import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Stack,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Typography,
  Chip,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import { alpha } from "@mui/material/styles";

import { useAdminPolicies } from "../../../lib/hooks/useAdminPolicies";
import type { PolicyConfigurationDto, CreatePolicyPayload, UpdatePolicyPayload } from "../../../lib/types";
import { PolicyTypeEnum, getPolicyTypeLabel } from "../../../lib/types";
import { toast } from "react-toastify";

import { AdminPageHeader, DeleteConfirmDialog, PolicyDetailsExpandedRow, PolicyFormDialog } from "../components";
import { POLICY_TYPE_COLORS, INITIAL_POLICY_FORM_STATE } from "../constants";

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
  const [formData, setFormData] = useState<CreatePolicyPayload>(INITIAL_POLICY_FORM_STATE);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [expandedPolicyId, setExpandedPolicyId] = useState<string | null>(null);

  const handleOpenCreateDialog = () => {
    setEditingPolicy(null);
    setFormData(INITIAL_POLICY_FORM_STATE);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (policy: PolicyConfigurationDto) => {
    setEditingPolicy(policy);

    // Normalize policyType
    let normalizedType: PolicyTypeEnum = PolicyTypeEnum.Return;
    if (typeof policy.policyType === "number") {
      const n = policy.policyType;
      const allowed: PolicyTypeEnum[] = [
        PolicyTypeEnum.Unknown,
        PolicyTypeEnum.Return,
        PolicyTypeEnum.Warranty,
        PolicyTypeEnum.Refund,
      ];
      normalizedType = allowed.includes(n as PolicyTypeEnum) ? (n as PolicyTypeEnum) : PolicyTypeEnum.Return;
    } else if (typeof policy.policyType === "string") {
      const typeMap: Record<string, PolicyTypeEnum> = {
        Unknown: PolicyTypeEnum.Unknown,
        Return: PolicyTypeEnum.Return,
        Warranty: PolicyTypeEnum.Warranty,
        Refund: PolicyTypeEnum.Refund,
      };
      normalizedType = typeMap[policy.policyType] || PolicyTypeEnum.Return;
    }

    const formDataToSet = {
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

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPolicy(null);
    setFormData(INITIAL_POLICY_FORM_STATE);
  };

  const handleFormChange = (field: keyof CreatePolicyPayload, value: unknown) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

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

  const handleSavePolicy = () => {
    // Sanitize form data
    const submitData = { ...formData };
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
      updatePolicy({ id: editingPolicy.id, payload: submitData as UpdatePolicyPayload }, {
        onSuccess: () => {
          toast.success("Policy updated successfully");
          handleCloseDialog();
        },
        onError: () => {
          toast.error("Failed to update policy");
        },
      });
    } else {
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

  const handleOpenDeleteDialog = (id: string) => {
    setDeleteTargetId(id);
    setOpenDeleteDialog(true);
  };

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
      <AdminPageHeader
        title="Policies"
        description="Create, edit, and manage return, warranty, and refund policies with detailed configuration."
      />

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

          <Grid item xs={12} sm={6} md={3}>
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

          <Grid item xs={12} sm={6} md={3}>
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
        ) : !policies || policies.length === 0 ? (
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
                    const typeLabel = getPolicyTypeLabel(policy.policyType);
                    
                    // Map string policyType to number for color lookup
                    let policyTypeNum: number = 0;
                    if (typeof policy.policyType === "number") {
                      policyTypeNum = policy.policyType;
                    } else if (typeof policy.policyType === "string") {
                      const typeMap: Record<string, number> = {
                        "Return": 1,
                        "Warranty": 2,
                        "Refund": 3,
                      };
                      policyTypeNum = typeMap[policy.policyType] || 0;
                    }
                    
                    const typeColor = POLICY_TYPE_COLORS[policyTypeNum];
                    
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
                            >
                              {expandedPolicyId === policy.id ? (
                                <KeyboardArrowUpRoundedIcon />
                              ) : (
                                <KeyboardArrowDownRoundedIcon />
                              )}
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
                        {expandedPolicyId === policy.id && <PolicyDetailsExpandedRow policy={policy} />}
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
                onClick={() => setFilters((prev) => ({ ...prev, pageNumber: prev.pageNumber - 1 }))}
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
                onClick={() => setFilters((prev) => ({ ...prev, pageNumber: prev.pageNumber + 1 }))}
              >
                Next
              </Button>
            </Stack>
          </>
        )}
      </Paper>

      <PolicyFormDialog
        open={openDialog}
        editingPolicy={editingPolicy}
        formData={formData}
        isCreating={isCreating}
        isUpdating={isUpdating}
        onClose={handleCloseDialog}
        onFormChange={handleFormChange}
        onSave={handleSavePolicy}
      />

      <DeleteConfirmDialog
        open={openDeleteDialog}
        title="Delete Policy"
        message="Are you sure you want to delete this policy? This action cannot be undone and may affect active orders."
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setOpenDeleteDialog(false)}
      />
    </Box>
  );
}
