import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
} from "@mui/material";

interface RoleAssignmentDialogProps {
  open: boolean;
  isAssigning: boolean;
  userName: string;
  selectedRoles: string[];
  availableRoles: string[];
  onRoleChange: (role: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function RoleAssignmentDialog({
  open,
  isAssigning,
  userName,
  selectedRoles,
  availableRoles,
  onRoleChange,
  onSave,
  onCancel,
}: RoleAssignmentDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: 18, borderBottom: "1px solid", borderColor: "divider", pb: 2 }}>
        Assign Roles to {userName}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography sx={{ fontSize: 14, color: "text.secondary", mb: 1 }}>
            Select roles to assign to this user:
          </Typography>
          <FormGroup>
            {availableRoles.map((role) => (
              <FormControlLabel
                key={role}
                control={
                  <Checkbox
                    checked={selectedRoles.includes(role)}
                    onChange={() => onRoleChange(role)}
                  />
                }
                label={<Typography sx={{ fontSize: 15 }}>{role}</Typography>}
              />
            ))}
          </FormGroup>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{ textTransform: "none", fontWeight: 700, fontSize: 15 }}
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          disabled={isAssigning}
          sx={{ textTransform: "none", fontWeight: 700, fontSize: 15 }}
        >
          {isAssigning ? "Saving..." : "Save Roles"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
