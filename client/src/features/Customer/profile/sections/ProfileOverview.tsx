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
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";

import { useProfile } from "../../../../lib/hooks/useProfile";
import { useUpdateDisplayName } from "../../../../lib/hooks/useUpdateDisplayName";
import {
  avatarImageSrcFromPhotos,
  resolveMainPhotoFromList,
} from "../../../../lib/utils/profileAvatarFromPhotos";

interface ProfileOverviewProps {
  readonly userId?: string;
}

export default function ProfileOverview({ userId }: ProfileOverviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchor);
  const [removeAvatarDialogOpen, setRemoveAvatarDialogOpen] = useState(false);
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

  /** Có bản ghi photo trên server mới gọi DELETE được */
  const canAttemptRemoveAvatar = photoList.length > 0;

  /** Có ảnh trong list → hiển thị URL từ list; list rỗng → mặc định (chữ). */
  const displayAvatarSrc = useMemo(
    () =>
      profile ? avatarImageSrcFromPhotos(photoList, profile.imageUrl) : undefined,
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
      if (newPhoto?.id) {
        await setMainPhotoAsync(newPhoto.id);
      }
      toast.success("Profile photo updated.");
    } catch {
      /* axios / mutation usually already surfaced a toast */
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
    setRemoveAvatarDialogOpen(false);
    try {
      const { data: fresh } = await refetchPhotos();
      const list = Array.isArray(fresh) ? fresh : photoList;
      const target = profile ? resolveMainPhotoFromList(list, profile.imageUrl) : null;

      if (target) {
        await deletePhotoAsync(target.id);
        toast.success("Profile photo removed.");
        return;
      }

      if (list.length === 0) {
        toast.info("There is no photo in your gallery to remove.");
        return;
      }

      toast.error(
        "Could not find this photo on the server (list out of sync). Refresh the page and try again.",
      );
    } catch {
      /* axios / mutation usually already surfaced a toast */
    }
  };

  const handleOpenEditDisplayNameDialog = () => {
    if (profile) {
      setEditDisplayNameValue(profile.displayName);
      setEditDisplayNameDialogOpen(true);
    }
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
      toast.success("Display name updated successfully!");
      handleCloseEditDisplayNameDialog();
    } catch {
      /* axios / mutation usually already surfaced a toast */
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 6,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !profile) {
    return (
      <Box>
        <Typography fontWeight={900} fontSize={22}>
          Profile
        </Typography>
        <Typography mt={1} color="error">
          Failed to load profile.
        </Typography>
        {error instanceof Error && (
          <Typography mt={0.5} fontSize={13} color="rgba(15,23,42,0.6)">
            {error.message}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ mt: -26 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Box
          sx={{
            position: "relative",
            width: 72,
            height: 72,
            flexShrink: 0,
          }}
        >
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
          <Avatar
            src={displayAvatarSrc}
            sx={{ width: 72, height: 72, bgcolor: "#111827", fontSize: 28 }}
          >
            {profile.displayName[0]?.toUpperCase()}
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
              right: -2,
              bottom: -2,
              zIndex: 1,
              width: 30,
              height: 30,
              p: 0,
              bgcolor: "#FFFFFF",
              border: "1px solid rgba(15,23,42,0.14)",
              boxShadow: "0 2px 8px rgba(15,23,42,0.12)",
              color: "#111827",
              "&:hover": { bgcolor: "#F8FAFC" },
              "&.Mui-disabled": { bgcolor: "#F1F5F9" },
            }}
          >
            {isUploadingPhoto || isSettingMainPhoto ? (
              <CircularProgress size={16} thickness={5} sx={{ color: "#111827" }} />
            ) : (
              <EditIcon sx={{ fontSize: 17 }} />
            )}
          </IconButton>
          <Menu
            id="profile-photo-menu"
            anchorEl={menuAnchor}
            open={menuOpen}
            onClose={closeMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
              list: { "aria-labelledby": "profile-photo-menu-button" },
            }}
          >
            <MenuItem
              onClick={() => handleChooseAvatar()}
              disabled={galleryBusy}
              sx={{ fontWeight: 600, fontSize: 14 }}
            >
              Choose avatar
            </MenuItem>
            <MenuItem
              onClick={openRemoveAvatarDialog}
              disabled={galleryBusy || !canAttemptRemoveAvatar}
              sx={{ fontWeight: 600, fontSize: 14, color: "error.main" }}
            >
              Remove avatar
            </MenuItem>
          </Menu>

          <Dialog
            open={removeAvatarDialogOpen}
            onClose={() => setRemoveAvatarDialogOpen(false)}
            aria-labelledby="remove-avatar-dialog-title"
            aria-describedby="remove-avatar-dialog-desc"
            slotProps={{
              paper: {
                elevation: 8,
                sx: {
                  borderRadius: 2,
                  border: "1px solid rgba(15,23,42,0.08)",
                  boxShadow: "0 18px 48px rgba(15,23,42,0.14)",
                  maxWidth: 400,
                  width: "100%",
                },
              },
            }}
          >
            <DialogTitle
              id="remove-avatar-dialog-title"
              sx={{
                fontWeight: 800,
                fontSize: 18,
                color: "#0f172a",
                pb: 0.5,
              }}
            >
              Remove profile photo?
            </DialogTitle>
            <DialogContent id="remove-avatar-dialog-desc" sx={{ pt: 0.5 }}>
              <Typography fontSize={14} color="rgba(15,23,42,0.72)" lineHeight={1.55}>
                This will delete your current profile photo from your gallery. You can upload a new
                one anytime.
              </Typography>
            </DialogContent>
            <DialogActions
              sx={{
                px: 3,
                pb: 2,
                pt: 0,
                gap: 1,
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="outlined"
                onClick={() => setRemoveAvatarDialogOpen(false)}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderColor: "rgba(15,23,42,0.2)",
                  color: "#0f172a",
                  "&:hover": { borderColor: "rgba(15,23,42,0.35)", bgcolor: "rgba(15,23,42,0.04)" },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => void handleConfirmRemoveAvatar()}
                disabled={galleryBusy}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow: "none",
                  "&:hover": { boxShadow: "none" },
                }}
              >
                Remove
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
        <Box>
          <Typography fontWeight={900} fontSize={24}>
            {profile.displayName}
          </Typography>
          <Typography fontSize={13} color="rgba(15,23,42,0.65)">
            Member profile
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: "grid", rowGap: 1.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography color="rgba(15,23,42,0.6)">User ID</Typography>
          <Typography fontWeight={600}>{profile.id}</Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography color="rgba(15,23,42,0.6)">Display name</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography fontWeight={600}>{profile.displayName}</Typography>
            <IconButton
              size="small"
              onClick={handleOpenEditDisplayNameDialog}
              sx={{
                color: "rgba(15,23,42,0.6)",
                "&:hover": { color: "rgba(15,23,42,0.9)" },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {profile.bio && (
          <Box sx={{ mt: 2 }}>
            <Typography fontWeight={900} mb={0.5}>
              Bio
            </Typography>
            <Typography fontSize={14} color="rgba(15,23,42,0.8)">
              {profile.bio}
            </Typography>
          </Box>
        )}
      </Box>

      <Dialog
        open={editDisplayNameDialogOpen}
        onClose={handleCloseEditDisplayNameDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 900 }}>Edit Display Name</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Display Name"
            value={editDisplayNameValue}
            onChange={(e) => setEditDisplayNameValue(e.target.value)}
            placeholder="Enter your display name"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleCloseEditDisplayNameDialog}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveDisplayName}
            variant="contained"
            disabled={isUpdatingDisplayName}
          >
            {isUpdatingDisplayName ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
