import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { useState } from "react";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

interface DialogState {
  open: boolean;
  mode: "create" | "edit";
  role: Role | null;
}

const DEFAULT_PERMISSIONS = [
  "view_users",
  "create_user",
  "edit_user",
  "delete_user",
  "view_roles",
  "create_role",
  "edit_role",
  "delete_role",
  "view_products",
  "manage_products",
  "view_orders",
  "manage_orders",
];

const MOCK_ROLES: Role[] = [
  {
    id: "1",
    name: "Admin",
    description: "Full system access",
    permissions: DEFAULT_PERMISSIONS,
  },
  {
    id: "2",
    name: "Manager",
    description: "Manage products and orders",
    permissions: [
      "view_users",
      "view_products",
      "manage_products",
      "view_orders",
      "manage_orders",
    ],
  },
  {
    id: "3",
    name: "User",
    description: "View-only access",
    permissions: ["view_products", "view_orders"],
  },
];

export default function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    mode: "create",
    role: null,
  });
  const [formData, setFormData] = useState<Role>({
    id: "",
    name: "",
    description: "",
    permissions: [],
  });

  const handleOpenDialog = (mode: "create" | "edit", role?: Role) => {
    if (mode === "edit" && role) {
      setFormData({ ...role });
    } else {
      setFormData({
        id: Date.now().toString(),
        name: "",
        description: "",
        permissions: [],
      });
    }
    setDialog({ open: true, mode, role: role || null });
  };

  const handleCloseDialog = () => {
    setDialog({ open: false, mode: "create", role: null });
    setFormData({
      id: "",
      name: "",
      description: "",
      permissions: [],
    });
  };

  const handleSaveRole = () => {
    if (!formData.name.trim()) {
      alert("Role name is required");
      return;
    }

    if (dialog.mode === "create") {
      setRoles([...roles, formData]);
    } else {
      setRoles(roles.map((r) => (r.id === formData.id ? formData : r)));
    }
    handleCloseDialog();
  };

  const handleDeleteRole = (id: string) => {
    if (confirm("Are you sure you want to delete this role?")) {
      setRoles(roles.filter((r) => r.id !== id));
    }
  };

  const handlePermissionChange = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  return (
    <Box>
      {/* ========== Header ========== */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Role Management
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Manage user roles and their permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog("create")}
          sx={{ textTransform: "none" }}
        >
          New Role
        </Button>
      </Box>

      {/* ========== Roles Table ========== */}
      <Card sx={{ p: 2, mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Permissions</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{role.name}</TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{role.description}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {role.permissions.slice(0, 6).map((p) => (
                        <Chip
                          key={p}
                          label={p.replace(/_/g, " ")}
                          size="small"
                          sx={{ textTransform: "capitalize" }}
                        />
                      ))}
                      {role.permissions.length > 6 && (
                        <Chip label={`+${role.permissions.length - 6}`} size="small" />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ textAlign: "right" }}>
                    <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => handleOpenDialog("edit", role)}
                        sx={{ textTransform: "none" }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteRole(role.id)}
                        sx={{ textTransform: "none" }}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {roles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: "center", py: 4 }}>
                    <Typography sx={{ color: "text.secondary" }}>
                      No roles found. Create one to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ========== Create/Edit Role Dialog ========== */}
      <Dialog open={dialog.open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {dialog.mode === "create" ? "Create New Role" : "Edit Role"}
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2.5}>
            {/* Role Name */}
            <TextField
              fullWidth
              label="Role Name"
              placeholder="e.g., Moderator"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              variant="outlined"
            />

            {/* Description */}
            <TextField
              fullWidth
              label="Description"
              placeholder="Describe the purpose of this role"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              variant="outlined"
              multiline
              rows={2}
            />

            {/* Permissions */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                Permissions
              </Typography>
              <Grid container spacing={1}>
                {DEFAULT_PERMISSIONS.map((permission) => (
                  <Grid item xs={12} sm={6} key={permission}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.permissions.includes(permission)}
                          onChange={() => handlePermissionChange(permission)}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2">
                          {permission.replace(/_/g, " ").charAt(0).toUpperCase() +
                            permission.replace(/_/g, " ").slice(1)}
                        </Typography>
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Stack>
        </DialogContent>

        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveRole}
            variant="contained"
            sx={{ textTransform: "none" }}
          >
            {dialog.mode === "create" ? "Create Role" : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
