import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Edit, Save } from "@mui/icons-material";
import { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

const AVAILABLE_ROLES = ["Admin", "Manager", "User", "Support", "Operator"];

const MOCK_USERS: User[] = [
  { id: "u1", name: "Alice Johnson", email: "alice@example.com", roles: ["Admin"] },
  { id: "u2", name: "Bob Smith", email: "bob@example.com", roles: ["Manager"] },
  { id: "u3", name: "Carol Lee", email: "carol@example.com", roles: ["User"] },
  { id: "u4", name: "Dave Turner", email: "dave@example.com", roles: ["Support", "User"] },
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [editing, setEditing] = useState<User | null>(null);

  const openEdit = (user: User) => setEditing({ ...user });
  const closeEdit = () => setEditing(null);

  const toggleRole = (role: string) => {
    if (!editing) return;
    const has = editing.roles.includes(role);
    setEditing({ ...editing, roles: has ? editing.roles.filter((r) => r !== role) : [...editing.roles, role] });
  };

  const saveRoles = () => {
    if (!editing) return;
    setUsers((prev) => prev.map((u) => (u.id === editing.id ? editing : u)));
    closeEdit();
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Users
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            View and manage users and their assigned roles
          </Typography>
        </Box>
      </Box>

      <Card sx={{ p: 1 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Roles</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ width: 32, height: 32 }}>{u.name.charAt(0)}</Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>{u.name}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{u.email}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {u.roles.map((r) => (
                        <Chip key={r} label={r} size="small" />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ textAlign: "right" }}>
                    <Button size="small" startIcon={<Edit />} onClick={() => openEdit(u)} sx={{ textTransform: "none" }}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={!!editing} onClose={closeEdit} fullWidth maxWidth="sm">
        <DialogTitle>Edit Roles</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>{editing?.name}</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>{editing?.email}</Typography>

            <Grid container spacing={1}>
              {AVAILABLE_ROLES.map((role) => (
                <Grid item xs={6} key={role}>
                  <FormControlLabel
                    control={<Checkbox checked={editing?.roles.includes(role) ?? false} onChange={() => toggleRole(role)} />}
                    label={role}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" onClick={saveRoles} startIcon={<Save />} sx={{ textTransform: "none" }}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
