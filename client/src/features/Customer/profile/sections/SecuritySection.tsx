import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from "react-toastify";
import agent from "../../../../lib/api/agent";
import { useAccount } from "../../../../lib/hooks/useAccount";

export default function SecuritySection() {
  const { logoutUser } = useAccount();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): boolean => {
    if (!currentPassword.trim()) {
      setError("Current password is required.");
      return false;
    }
    if (!newPassword.trim()) {
      setError("New password is required.");
      return false;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return false;
    }
    if (currentPassword === newPassword) {
      setError("New password must be different from your current password.");
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await agent.post("/account/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (response.status === 200) {
        toast.success("Password changed successfully! Signing you out for security...");
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Sign out user - new password requires re-authentication
        // This prevents SecurityStamp mismatch issues with stale sessions
        setTimeout(() => {
          logoutUser.mutate();
        }, 1500);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to change password. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ mt: -6 }}>
      <Typography fontWeight={900} fontSize={22} mb={2}>
        Security
      </Typography>
      <Typography color="rgba(15,23,42,0.65)" mb={3}>
        Change your password to keep your account secure.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Your password has been changed successfully! You will be signed out and redirected to the login page. Please sign in with your new password.
        </Alert>
      )}

      <Box sx={{ display: "grid", gap: 2, maxWidth: 500 }}>
        <TextField
          label="Current Password"
          type={showCurrentPassword ? "text" : "password"}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          fullWidth
          disabled={isLoading}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    edge="end"
                    disabled={isLoading}
                  >
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <TextField
          label="New Password"
          type={showNewPassword ? "text" : "password"}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          fullWidth
          disabled={isLoading}
          helperText="At least 8 characters"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                    disabled={isLoading}
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <TextField
          label="Confirm New Password"
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
          disabled={isLoading}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Button
          variant="contained"
          onClick={handleChangePassword}
          disabled={isLoading}
          sx={{
            mt: 1,
            textTransform: "none",
            fontWeight: 700,
            alignSelf: "flex-start",
          }}
        >
          {isLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
          {isLoading ? "Changing Password..." : "Change Password"}
        </Button>
      </Box>
    </Box>
  );
}
