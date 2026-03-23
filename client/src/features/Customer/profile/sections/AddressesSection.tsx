import { useState, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Alert,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { toast } from "react-toastify";
import { useAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress, useSetDefaultAddress } from "../../../../lib/hooks/useAddresses";
import type { AddressDto, CreateAddressPayload } from "../../../../lib/types/address";
import AddressAutocomplete from "../../../../app/shared/components/AddressAutocomplete";

interface AddressFormState {
  recipientName: string;
  recipientPhone: string;
  venue: string;
  ward: string;
  district: string;
  province: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

const INITIAL_FORM_STATE: AddressFormState = {
  recipientName: "",
  recipientPhone: "",
  venue: "",
  ward: "",
  district: "",
  province: "",
  postalCode: "",
};

export default function AddressesSection() {
  const { data: addresses, isLoading, isError, error } = useAddresses();
  const { mutateAsync: createAddress, isPending: isCreating } = useCreateAddress();
  const { mutateAsync: updateAddress, isPending: isUpdating } = useUpdateAddress();
  const { mutateAsync: deleteAddress, isPending: isDeleting } = useDeleteAddress();
  const { mutateAsync: setDefaultAddress, isPending: isSetting } = useSetDefaultAddress();

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddressFormState>(INITIAL_FORM_STATE);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const addressList = useMemo(() => (Array.isArray(addresses) ? addresses : []), [addresses]);
  const isLoading_all = isLoading || isCreating || isUpdating || isDeleting || isSetting;

  const handleOpenCreateForm = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM_STATE);
    setFormOpen(true);
  };

  const handleOpenEditForm = (address: AddressDto) => {
    setEditingId(address.id);
    setFormData({
      recipientName: address.recipientName,
      recipientPhone: address.recipientPhone,
      venue: address.venue,
      ward: address.ward,
      district: address.district,
      province: address.province,
      postalCode: address.postalCode || "",
      latitude: address.latitude ?? undefined,
      longitude: address.longitude ?? undefined,
    });
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setFormData(INITIAL_FORM_STATE);
  };

  const handleSaveAddress = async () => {
    // Validate form
    if (
      !formData.recipientName.trim() ||
      !formData.recipientPhone.trim() ||
      !formData.venue.trim() ||
      !formData.ward.trim() ||
      !formData.district.trim() ||
      !formData.province.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const payload: CreateAddressPayload = {
        recipientName: formData.recipientName,
        recipientPhone: formData.recipientPhone,
        venue: formData.venue,
        ward: formData.ward,
        district: formData.district,
        province: formData.province,
        postalCode: formData.postalCode || null,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      if (editingId) {
        await updateAddress({ id: editingId, ...payload });
        toast.success("Address updated successfully!");
      } else {
        await createAddress(payload);
        toast.success("Address added successfully!");
      }

      handleCloseForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save address.";
      toast.error(message);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;

    setDeleteConfirmOpen(false);
    try {
      await deleteAddress(deleteTargetId);
      toast.success("Address deleted successfully!");
      setDeleteTargetId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete address.";
      toast.error(message);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      toast.success("Default address updated!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to set default address.";
      toast.error(message);
    }
  };

  if (isError) {
    return (
      <Box>
        <Typography fontWeight={900} fontSize={22} mb={2}>
          Your Address
        </Typography>
        <Alert severity="error">
          Failed to load addresses. {error instanceof Error && error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 1 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
          gap: 2,
        }}
      >
        <Box>
          <Typography fontWeight={900} fontSize={22}>
            Your Address
          </Typography>
          <Typography color="rgba(15,23,42,0.65)" fontSize={14}>
            Manage your delivery addresses
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleOpenCreateForm}
          disabled={isLoading_all}
          sx={{ whiteSpace: "nowrap", flexShrink: 0 }}
        >
          Add Address
        </Button>
      </Box>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {addressList.length === 0 && !isLoading && (
        <Alert severity="info">No addresses yet. Add your first address to get started.</Alert>
      )}

      <Box sx={{ maxHeight: 600, overflowY: "auto", overflowX: "hidden" }}>
        <Box sx={{ display: "grid", gap: 2 }}>
          {addressList.map((address) => (
            <Card
              key={address.id}
              sx={{
                border: address.isDefault ? "2px solid #4F46E5" : "1px solid rgba(15,23,42,0.08)",
                position: "relative",
              }}
            >
            {address.isDefault && (
              <Box
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  bgcolor: "rgba(79, 70, 229, 0.08)",
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 16, color: "#4F46E5" }} />
                <Typography fontSize={12} fontWeight={700} color="#4F46E5">
                  Default
                </Typography>
              </Box>
            )}
            <CardContent>
              <Typography fontWeight={700} mb={0.5}>
                {address.recipientName}
              </Typography>
              <Typography fontSize={14} color="rgba(15,23,42,0.7)" mb={1}>
                {address.recipientPhone}
              </Typography>
              <Typography fontSize={14} color="rgba(15,23,42,0.8)" mb={3}>
                {address.venue}, {address.ward}, {address.district}, {address.province}
                {address.postalCode ? `, ${address.postalCode}` : ""}
              </Typography>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => handleOpenEditForm(address)}
                  disabled={isLoading_all}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleDeleteClick(address.id)}
                  disabled={isLoading_all}
                  startIcon={<DeleteIcon />}
                  sx={{ color: "error.main", borderColor: "error.main" }}
                >
                  Delete
                </Button>
                {!address.isDefault && (
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => handleSetDefault(address.id)}
                    disabled={isLoading_all}
                  >
                    Set as Default
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
        </Box>
      </Box>

      {/* Add/Edit Address Dialog */}
      <Dialog open={formOpen} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, fontSize: 18 }}>
          {editingId ? "Edit Address" : "Add New Address"}
        </DialogTitle>
        <DialogContent sx={{ pt: 6 }}>
          <Box sx={{ display: "grid", gap: 2 }}>
            <TextField
              label="Recipient Name"
              value={formData.recipientName}
              onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
              fullWidth
              disabled={isLoading_all}
            />

            <TextField
              label="Phone Number"
              value={formData.recipientPhone}
              onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
              fullWidth
              disabled={isLoading_all}
            />

            {/* Ward, District, City - 3 column layout */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
              <TextField
                label="Ward"
                value={formData.ward}
                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                fullWidth
                disabled={isLoading_all}
              />
              <TextField
                label="District"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                fullWidth
                disabled={isLoading_all}
              />
              <TextField
                label="Province"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                fullWidth
                disabled={isLoading_all}
              />
            </Box>

            <TextField
              label="Street / Venue"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              fullWidth
              disabled={isLoading_all}
            />

            <Box sx={{ mt: -1, mb: 1 }}>
              <AddressAutocomplete
                value={formData.venue}
                onChange={(value: string) => setFormData({ ...formData, venue: value })}
                onSelectAddress={(address) =>
                  setFormData((prev) => ({
                    ...prev,
                    venue: address.venue,
                    ward: address.ward,
                    district: address.district,
                    province: address.city,
                    postalCode: address.postalCode || "",
                  }))
                }
                label="Search for address"
                placeholder="Search address..."
                fullWidth
              />
            </Box>

            <TextField
              label="Postal Code"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              fullWidth
              disabled={isLoading_all}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleCloseForm}
            disabled={isLoading_all}
            sx={{
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveAddress}
            disabled={isLoading_all}
            sx={{
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            {isLoading_all ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            {editingId ? "Update Address" : "Add Address"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: 18 }}>Delete Address?</DialogTitle>
        <DialogContent>
          <Typography fontSize={14} color="rgba(15,23,42,0.72)">
            Are you sure you want to delete this address? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={isLoading_all}
            sx={{
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={isLoading_all}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
