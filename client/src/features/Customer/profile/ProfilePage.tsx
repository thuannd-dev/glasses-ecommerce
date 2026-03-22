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
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";

import { useAccount } from "../../../lib/hooks/useAccount";
import { useProfile } from "../../../lib/hooks/useProfile";
import {
  avatarImageSrcFromPhotos,
  resolveMainPhotoFromList,
} from "../../../lib/utils/profileAvatarFromPhotos";

export default function ProfilePage() {
  const { currentUser } = useAccount();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchor);
  const [removeAvatarDialogOpen, setRemoveAvatarDialogOpen] = useState(false);

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
  } = useProfile(currentUser?.id);

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
    window.requestAnimationFrame(() => {
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

  if (!currentUser?.id) {
    return (
      <Box
        sx={{
          maxWidth: 800,
          mx: "auto",
          mt: 10,
          px: { xs: 2, md: 3 },
        }}
      >
        <Typography fontWeight={900} fontSize={22}>
          Profile
        </Typography>
        <Typography mt={1} color="rgba(15,23,42,0.65)">
          You need to be logged in to view your profile.
        </Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          maxWidth: 800,
          mx: "auto",
          mt: 10,
          px: { xs: 2, md: 3 },
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !profile) {
    return (
      <Box
        sx={{
          maxWidth: 800,
          mx: "auto",
          mt: 10,
          px: { xs: 2, md: 3 },
        }}
      >
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
    <Box
      sx={{
        maxWidth: 800,
        mx: "auto",
        mt: 10,
        px: { xs: 2, md: 3 },
        pb: 8,
      }}
    >
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
              onClick={() => void handleChooseAvatar()}
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

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography color="rgba(15,23,42,0.6)">Display name</Typography>
          <Typography fontWeight={600}>{profile.displayName}</Typography>
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
    </Box>
  );
}
