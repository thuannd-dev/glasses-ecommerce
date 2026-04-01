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
          Role Management
        </Typography>

        <Typography sx={{ mt: 0.5, color: "#6B6B6B", maxWidth: 520, fontSize: 14 }}>
          Assign roles to users and manage access levels across the platform.
        </Typography>
      </Box>

      {/* Users Table */}
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
        <TableContainer>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, fontSize: 14 }}>Display Name</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: 14 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: 14 }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: 14 }}>Roles</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: 14 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow 
                  key={user.userId} 
                  hover
                  sx={{
                    "& td": { py: 1.8, fontSize: 14 },
                  }}
                >
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, fontSize: 15, color: "text.primary" }}>
                      {user.displayName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                      {user.userName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <Chip
                            key={role}
                            label={role}
                            size="small"
                            sx={{
                              bgcolor: "rgba(33, 150, 243, 0.1)",
                              color: "primary.main",
                              fontWeight: 700,
                              fontSize: 12,
                              transition: "all 0.2s ease",
                              boxShadow: "0 2px 4px rgba(33, 150, 243, 0.15)",
                            }}
                          />
                        ))
                      ) : (
                        <Typography sx={{ fontSize: 13, color: "text.secondary", fontStyle: "italic" }}>
                          No roles assigned
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => handleOpenDialog(user.userId, user.roles)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Role Assignment Dialog */}
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
            fontSize: 18,
            borderBottom: "2px solid",
            borderColor: "rgba(33, 150, 243, 0.15)",
            pb: 2.5,
            background: "linear-gradient(135deg, rgba(33, 150, 243, 0.04) 0%, rgba(33, 150, 243, 0.02) 100%)",
          }}
        >
          👥 Assign Roles for {selectedUser?.displayName}
        </DialogTitle>
        <DialogContent sx={{ pt: 4, pb: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: 12, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, mb: 1 }}>
              User Info
            </Typography>
            <Box sx={{ p: 2, bgcolor: "rgba(33, 150, 243, 0.04)", borderRadius: 1.5, border: "1px solid", borderColor: "rgba(33, 150, 243, 0.15)" }}>
              <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 0.75 }}>
                <strong>Email:</strong> {selectedUser?.email}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                <strong>Username:</strong> {selectedUser?.userName}
              </Typography>
            </Box>
          </Box>
          <Typography sx={{ fontSize: 12, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, mb: 2 }}>
            Select Roles
          </Typography>
          <FormGroup sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {roles.map((role) => (
              <FormControlLabel
                key={role.id}
                control={
                  <Checkbox
                    checked={selectedRoles.includes(role.name)}
                    onChange={() => handleRoleChange(role.name)}
                    size="medium"
                  />
                }
                label={
                  <Typography sx={{ fontWeight: 500, fontSize: 14 }}>
                    {role.name}
                  </Typography>
                }
                sx={{
                  p: 1.5,
                  bgcolor: selectedRoles.includes(role.name) ? "rgba(33, 150, 243, 0.06)" : "transparent",
                  borderRadius: 1.5,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(33, 150, 243, 0.04)",
                  },
                  m: 0,
                }}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: "1px solid", borderColor: "rgba(0, 0, 0, 0.08)", gap: 1.5 }}>
          <Button 
            onClick={handleCloseDialog} 
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveRoles}
            variant="contained"
            disabled={isAssigning}
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
            {isAssigning ? "💾 Saving..." : "✓ Save Roles"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
