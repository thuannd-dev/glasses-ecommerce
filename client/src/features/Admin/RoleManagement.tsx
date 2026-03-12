import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useState } from "react";
import { useAdminRoles } from "../../lib/hooks/useAdminRoles";
import { toast } from "react-toastify";

export default function RoleManagement() {
  const { users, roles, rolesLoading, usersLoading, assignRoles, isAssigning } =
    useAdminRoles();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const selectedUser = users.find((u) => u.userId === selectedUserId);

  const handleOpenDialog = (userId: string, currentUserRoles: string[]) => {
    setSelectedUserId(userId);
    setSelectedRoles([...currentUserRoles]);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUserId(null);
    setSelectedRoles([]);
  };

  const handleRoleChange = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const handleSaveRoles = () => {
    if (!selectedUserId) {
      toast.error("No user selected");
      return;
    }

    if (selectedRoles.length === 0) {
      toast.error("At least one role must be selected");
      return;
    }

    assignRoles(
      {
        userId: selectedUserId,
        roles: selectedRoles,
      },
      {
        onSuccess: () => {
          toast.success("Roles updated successfully");
          handleCloseDialog();
        },
        onError: () => {
          toast.error("Failed to update roles");
        },
      },
    );
  };

  if (rolesLoading || usersLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <>
      {/* Header */}
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
        <Typography
          sx={{ mt: 1, fontSize: 30, fontWeight: 900 }}
          color="text.primary"
        >
          Role Management
        </Typography>
        <Typography sx={{ mt: 1, color: "text.secondary", maxWidth: 520, fontSize: 14 }}>
          Assign roles to users and manage access levels across the platform.
        </Typography>
      </Box>

      {/* Users Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "rgba(0, 0, 0, 0.04)" }}>
              <TableCell sx={{ fontWeight: 700 }}>Display Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Username</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Roles</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.userId} hover>
                <TableCell>{user.displayName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.userName}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {user.roles.length > 0 ? (
                      user.roles.map((role) => (
                        <Chip
                          key={role}
                          label={role}
                          size="small"
                          sx={{
                            bgcolor: "rgba(25, 118, 210, 0.12)",
                            color: "#1976d2",
                            fontWeight: 600,
                          }}
                        />
                      ))
                    ) : (
                      <Typography
                        sx={{ fontSize: 12, color: "text.secondary" }}
                      >
                        No roles
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleOpenDialog(user.userId, user.roles)}
                    sx={{
                      textTransform: "none",
                      fontSize: 12,
                    }}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Role Assignment Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Assign Roles to {selectedUser?.displayName}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>
            Email: {selectedUser?.email}
          </Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 2 }}>
            Select roles:
          </Typography>
          <FormGroup>
            {roles.map((role) => (
              <FormControlLabel
                key={role.id}
                control={
                  <Checkbox
                    checked={selectedRoles.includes(role.name)}
                    onChange={() => handleRoleChange(role.name)}
                  />
                }
                label={role.name}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveRoles}
            variant="contained"
            disabled={isAssigning}
            sx={{ textTransform: "none" }}
          >
            {isAssigning ? "Saving..." : "Save Roles"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
