import { useMemo, useRef, useState, type ChangeEvent, type MouseEvent } from "react";
import EditIcon from "@mui/icons-material/Edit";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";

import { useAccount } from "../../../../lib/hooks/useAccount";
import { useProfile } from "../../../../lib/hooks/useProfile";
import { useUpdateDisplayName } from "../../../../lib/hooks/useUpdateDisplayName";
import { avatarImageSrcFromPhotos, resolveMainPhotoFromList } from "../../../../lib/utils/profileAvatarFromPhotos";

const PROFILE_COLORS = {
  textPrimary: "#111111",
  textMuted: "rgba(17,17,17,0.6)",
  borderSoft: "rgba(0,0,0,0.08)",
  white: "#FFFFFF",
} as const;
const FALLBACK_DISPLAY_NAME = "Unnamed user";
const FALLBACK_AVATAR_INITIAL = "U";

interface ProfileOverviewProps {
  readonly userId?: string;
}

interface EditableInfoRowProps {
  readonly label: string;
  readonly value: string;
  readonly onEdit?: () => void;
}

function EditableInfoRow({ label, value, onEdit }: EditableInfoRowProps) {
  return (
    <Box
      sx={{
        py: 2,
        px: { xs: 1.5, md: 2 },
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        display: "grid",
        gap: 1,
        gridTemplateColumns: { xs: "1fr", sm: "220px minmax(0, 1fr)" },
      }}
    >
      <Typography
        sx={{
          fontSize: 13.5,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          fontWeight: 800,
          color: "rgba(17,17,17,0.72)",
          lineHeight: 1.6,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 500, color: "#111111", wordBreak: "break-word" }}>
          {value}
        </Typography>
        {onEdit ? (
          <Button
            size="small"
            variant="outlined"
            onClick={onEdit}
            startIcon={<EditIcon sx={{ fontSize: 15 }} />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 1,
              minWidth: 84,
            }}
          >
            Edit
          </Button>
        ) : null}
      </Box>
    </Box>
  );
}

export default function ProfileOverview({ userId }: ProfileOverviewProps) {
  const { currentUser } = useAccount();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchor);
  const [removeAvatarDialogOpen, setRemoveAvatarDialogOpen] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [editDisplayNameDialogOpen, setEditDisplayNameDialogOpen] = useState(false);
  const [editDisplayNameValue, setEditDisplayNameValue] = useState("");

  const {
    data: profile,
    isLoading,
    isError,
    error,
    photos,
    uploadPhotoAsync,
    isUploadingPhoto,
    deletePhotoAsync,
    isDeletingPhoto,
    setMainPhotoAsync,
    isSettingMainPhoto,
    refetchPhotos,
  } = useProfile(userId);

  const { mutateAsync: updateDisplayNameAsync, isPending: isUpdatingDisplayName } = useUpdateDisplayName(userId);
  const photoList = Array.isArray(photos) ? photos : [];
  const galleryBusy = isUploadingPhoto || isDeletingPhoto || isSettingMainPhoto;
  const canAttemptRemoveAvatar = photoList.length > 0;
  const isSelfProfileView = !userId || userId === currentUser?.id;
  const emailValue = isSelfProfileView ? (currentUser?.email ?? "Not available") : "Not available";
  const safeDisplayName = (profile?.displayName ?? "").trim() || FALLBACK_DISPLAY_NAME;
  const avatarInitial = safeDisplayName[0]?.toUpperCase() ?? FALLBACK_AVATAR_INITIAL;
  const displayAvatarSrc = useMemo(
    () => (profile ? avatarImageSrcFromPhotos(photoList, profile.imageUrl) : undefined),
    [profile, photoList],
  );

  const closeMenu = () => setMenuAnchor(null);
  const handleOpenMenu = (e: MouseEvent<HTMLElement>) => {
    if (galleryBusy) return;
    setMenuAnchor(e.currentTarget);
  };

  const handleChooseAvatar = () => {
    closeMenu();
    globalThis.requestAnimationFrame(() => {
      if (galleryBusy) return;
      fileInputRef.current?.click();
    });
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const newPhoto = await uploadPhotoAsync({ file });
      if (newPhoto?.id) await setMainPhotoAsync(newPhoto.id);
      toast.success("Profile photo updated.");
    } catch {
      // Already surfaced by mutation interceptor/toast.
    }
  };

  const openRemoveAvatarDialog = () => {
    closeMenu();
    if (!canAttemptRemoveAvatar) {
      toast.info("No profile photo to remove.");
      return;
    }
    setRemoveAvatarDialogOpen(true);
  };

  const handleConfirmRemoveAvatar = async () => {
    if (isRemovingAvatar) return;
    setIsRemovingAvatar(true);
    try {
      let fresh: unknown;
      try {
        ({ data: fresh } = await refetchPhotos());
      } catch {
        toast.error("Could not refresh your photo list. Please try again.");
        return;
      }
      const list = Array.isArray(fresh) ? fresh : photoList;
      const target = profile ? resolveMainPhotoFromList(list, profile.imageUrl) : null;

      if (target) {
        await deletePhotoAsync(target.id);
        toast.success("Profile photo removed.");
        setRemoveAvatarDialogOpen(false);
        return;
      }
      if (!list.length) {
        toast.info("There is no photo in your gallery to remove.");
        setRemoveAvatarDialogOpen(false);
        return;
      }
      toast.error("Could not match your current photo on server. Please refresh and try again.");
    } catch {
      // Already surfaced by mutation interceptor/toast.
    } finally {
      setIsRemovingAvatar(false);
    }
  };

  const handleOpenEditDisplayNameDialog = () => {
    if (!profile) return;
    setEditDisplayNameValue(profile.displayName);
    setEditDisplayNameDialogOpen(true);
  };

  const handleCloseEditDisplayNameDialog = () => {
    setEditDisplayNameDialogOpen(false);
    setEditDisplayNameValue("");
  };

  const handleSaveDisplayName = async () => {
    if (!editDisplayNameValue.trim()) {
      toast.error("Display name cannot be empty.");
      return;
    }
    try {
      await updateDisplayNameAsync({ displayName: editDisplayNameValue.trim() });
      toast.success("Display name updated.");
      handleCloseEditDisplayNameDialog();
    } catch {
      // Already surfaced by mutation interceptor/toast.
    }
  };

  if (isLoading) {
    return (
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 1.5,
          borderColor: "rgba(0,0,0,0.08)",
          minHeight: 420,
          display: "grid",
          placeItems: "center",
        }}
      >
        <CircularProgress />
      </Paper>
    );
  }

  if (isError || !profile) {
    return (
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 1.5, borderColor: "rgba(0,0,0,0.08)" }}>
        <Typography sx={{ fontWeight: 800, fontSize: 22, color: "#111111" }}>Profile</Typography>
        <Typography mt={1} color="error">
          Failed to load profile.
        </Typography>
        {error instanceof Error ? (
          <Typography mt={0.5} fontSize={13} color="rgba(17,17,17,0.6)">
            {error.message}
          </Typography>
        ) : null}
      </Paper>
    );
  }

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.25, md: 3 },
          borderRadius: 1.5,
          borderColor: PROFILE_COLORS.borderSoft,
          bgcolor: PROFILE_COLORS.white,
          boxShadow: "0 10px 35px rgba(0,0,0,0.04)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: { xs: "flex-start", md: "center" }, gap: 2.25 }}>
          <Box sx={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              tabIndex={-1}
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                padding: 0,
                margin: -1,
                overflow: "hidden",
                clip: "rect(0,0,0,0)",
                clipPath: "inset(50%)",
                whiteSpace: "nowrap",
                border: 0,
                opacity: 0,
              }}
            />
            <Avatar src={displayAvatarSrc} sx={{ width: 96, height: 96, bgcolor: PROFILE_COLORS.textPrimary, fontSize: 34 }}>
              {avatarInitial}
            </Avatar>
            <IconButton
              id="profile-photo-menu-button"
              type="button"
              size="small"
              onClick={handleOpenMenu}
              disabled={galleryBusy}
              aria-label="Profile photo options"
              aria-controls={menuOpen ? "profile-photo-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={menuOpen ? "true" : undefined}
              sx={{
                position: "absolute",
                right: 0,
                bottom: 0,
                width: 30,
                height: 30,
                bgcolor: PROFILE_COLORS.white,
                border: "1px solid rgba(0,0,0,0.16)",
                borderRadius: 1,
                color: PROFILE_COLORS.textPrimary,
                boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                "&:hover": { bgcolor: "#F7F7F5" },
              }}
            >
              {galleryBusy ? <CircularProgress size={14} sx={{ color: PROFILE_COLORS.textPrimary }} /> : <EditIcon sx={{ fontSize: 15 }} />}
            </IconButton>
            <Menu
              id="profile-photo-menu"
              anchorEl={menuAnchor}
              open={menuOpen}
              onClose={closeMenu}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{ list: { "aria-labelledby": "profile-photo-menu-button" } }}
            >
              <MenuItem onClick={handleChooseAvatar} disabled={galleryBusy}>Choose avatar</MenuItem>
              <MenuItem onClick={openRemoveAvatarDialog} disabled={galleryBusy || !canAttemptRemoveAvatar} sx={{ color: "error.main" }}>
                Remove avatar
              </MenuItem>
            </Menu>
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: { xs: 26, md: 30 }, fontWeight: 700, letterSpacing: "-0.01em", color: PROFILE_COLORS.textPrimary }}>
              {safeDisplayName}
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(17,17,17,0.56)" }}>
              Personal account
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 1.5,
          borderColor: PROFILE_COLORS.borderSoft,
          bgcolor: PROFILE_COLORS.white,
          overflow: "hidden",
          boxShadow: "0 10px 35px rgba(0,0,0,0.03)",
        }}
      >
        <Box sx={{ px: { xs: 1.5, md: 2 }, pt: 2 }}>
          <Typography sx={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em", color: PROFILE_COLORS.textPrimary }}>
            Account Information
          </Typography>
          <Typography sx={{ mt: 0.5, mb: 1.5, fontSize: 13.5, color: PROFILE_COLORS.textMuted }}>
            Keep your personal details up to date.
          </Typography>
        </Box>
        <Divider />
        <EditableInfoRow label="User ID" value={profile.id} />
        <EditableInfoRow label="Display Name" value={safeDisplayName} onEdit={handleOpenEditDisplayNameDialog} />
        <EditableInfoRow label="Email" value={emailValue} />
        <Box sx={{ py: 2.2, px: { xs: 1.5, md: 2 } }}>
          <Typography
            sx={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              fontWeight: 700,
              color: "rgba(17,17,17,0.5)",
              mb: 1,
            }}
          >
            Bio
          </Typography>
          <Typography sx={{ fontSize: 14.5, lineHeight: 1.7, color: "rgba(17,17,17,0.82)" }}>
            {profile.bio?.trim() ? profile.bio : "No bio added yet."}
          </Typography>
        </Box>
      </Paper>

      <Dialog
        open={removeAvatarDialogOpen}
        onClose={() => {
          if (!isRemovingAvatar) setRemoveAvatarDialogOpen(false);
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: PROFILE_COLORS.textPrimary }}>Remove profile photo?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "rgba(17,17,17,0.68)" }}>
            This removes your current avatar from your gallery.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setRemoveAvatarDialogOpen(false)}
            disabled={isRemovingAvatar}
            sx={{ textTransform: "none", borderRadius: 1 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => void handleConfirmRemoveAvatar()}
            disabled={isRemovingAvatar}
            sx={{ textTransform: "none", borderRadius: 1 }}
          >
            {isRemovingAvatar ? <CircularProgress size={18} sx={{ color: PROFILE_COLORS.white }} /> : "Remove"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editDisplayNameDialogOpen}
        onClose={() => {
          if (!isUpdatingDisplayName) handleCloseEditDisplayNameDialog();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: PROFILE_COLORS.textPrimary }}>Edit display name</DialogTitle>
        <DialogContent sx={{ pt: 1.5 }}>
          <TextField
            fullWidth
            label="Display name"
            value={editDisplayNameValue}
            onChange={(e) => setEditDisplayNameValue(e.target.value)}
            placeholder="Enter your display name"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.25, gap: 1 }}>
          <Button
            onClick={handleCloseEditDisplayNameDialog}
            variant="outlined"
            disabled={isUpdatingDisplayName}
            sx={{ textTransform: "none", borderRadius: 1 }}
          >
            Cancel
          </Button>
          <Button onClick={() => void handleSaveDisplayName()} variant="contained" disabled={isUpdatingDisplayName} sx={{ textTransform: "none", borderRadius: 1, bgcolor: PROFILE_COLORS.textPrimary }}>
            {isUpdatingDisplayName ? <CircularProgress size={20} sx={{ color: PROFILE_COLORS.white }} /> : "Save changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
