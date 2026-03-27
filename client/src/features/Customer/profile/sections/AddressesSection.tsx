import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Alert,
  TextField,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { toast } from "react-toastify";
import { useAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress, useSetDefaultAddress } from "../../../../lib/hooks/useAddresses";
import type { AddressDto, CreateAddressPayload } from "../../../../lib/types/address";
import AddressAutocomplete from "../../../../app/shared/components/AddressAutocomplete";
import {
  fetchGhnDistricts,
  fetchGhnProvinces,
  fetchGhnWards,
  findDistrictByName,
  findProvinceByName,
  findWardByName,
  type GhnDistrict,
  type GhnProvince,
  type GhnWard,
} from "../../../../lib/utils/ghnAddress";

interface AddressFormState {
  recipientName: string;
  recipientPhone: string;
  venue: string;
  ward: string;
  district: string;
  province: string;
  provinceId?: number | null;
  districtId?: number | null;
  wardCode?: string | null;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

const HIDDEN_PROVINCE_EXACT = new Set(["Hà Nội 02"]);
const HIDDEN_PROVINCE_KEYWORDS = ["testalerttinh001"];

function normalizeProvinceName(name: string): string {
  return String(name ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
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
  const [provinces, setProvinces] = useState<GhnProvince[]>([]);
  const [districts, setDistricts] = useState<GhnDistrict[]>([]);
  const [wards, setWards] = useState<GhnWard[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [provinceLoadError, setProvinceLoadError] = useState<string | null>(null);
  const [districtLoadError, setDistrictLoadError] = useState<string | null>(null);
  const [wardLoadError, setWardLoadError] = useState<string | null>(null);

  const addressList = useMemo(() => (Array.isArray(addresses) ? addresses : []), [addresses]);
  const visibleProvinces = useMemo(
    () =>
      provinces.filter((p) => {
        if (HIDDEN_PROVINCE_EXACT.has(p.ProvinceName)) return false;
        const normalized = normalizeProvinceName(p.ProvinceName);
        return !HIDDEN_PROVINCE_KEYWORDS.some((k) => normalized.includes(k));
      }),
    [provinces],
  );
  const hasUnresolvedGhnSelection = useMemo(() => {
    const hasProvinceText = formData.province.trim().length > 0;
    const hasDistrictText = formData.district.trim().length > 0;
    const hasWardText = formData.ward.trim().length > 0;
    if (!hasProvinceText && !hasDistrictText && !hasWardText) return false;
    return (
      (!formData.provinceId && hasProvinceText) ||
      (!formData.districtId && hasDistrictText) ||
      (!formData.wardCode && hasWardText)
    );
  }, [formData.province, formData.provinceId, formData.district, formData.districtId, formData.ward, formData.wardCode]);
  const isLoading_all = isLoading || isCreating || isUpdating || isDeleting || isSetting;
  const actionBtnSx = {
    textTransform: "none",
    fontWeight: 600,
    borderRadius: 1,
    minWidth: 88,
  } as const;

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
      provinceId: address.provinceId ?? null,
      districtId: address.districtId ?? null,
      wardCode: address.wardCode ?? null,
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
    if (!formData.provinceId || !formData.districtId || !formData.wardCode) {
      toast.error("Please select province, district, and ward from the dropdowns to confirm shipping area.");
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
        provinceId: formData.provinceId ?? null,
        districtId: formData.districtId ?? null,
        wardCode: formData.wardCode ?? null,
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

  useEffect(() => {
    let active = true;
    const loadProvinces = async () => {
      try {
        setLoadingProvinces(true);
        setProvinceLoadError(null);
        const data = await fetchGhnProvinces();
        if (!active) return;
        setProvinces(data);
      } catch (err) {
        if (!active) return;
        setProvinces([]);
        setProvinceLoadError(
          err instanceof Error ? err.message : "Failed to load provinces. Please try again.",
        );
      } finally {
        if (active) setLoadingProvinces(false);
      }
    };
    void loadProvinces();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const province = findProvinceByName(provinces, formData.province);
    const nextProvinceId = province?.ProvinceID ?? null;
    setFormData((prev) =>
      nextProvinceId === (prev.provinceId ?? null) ? prev : { ...prev, provinceId: nextProvinceId },
    );
  }, [provinces, formData.province]);

  useEffect(() => {
    let active = true;
    const provinceId = formData.provinceId ?? null;
    if (!provinceId) {
      setDistricts([]);
      setWards([]);
      setDistrictLoadError(null);
      setWardLoadError(null);
      setFormData((prev) => ({
        ...prev,
        district: "",
        ward: "",
        districtId: null,
        wardCode: null,
      }));
      return;
    }
    const loadDistricts = async () => {
      try {
        setLoadingDistricts(true);
        setDistrictLoadError(null);
        const data = await fetchGhnDistricts(provinceId);
        if (!active) return;
        setDistricts(data);
      } catch (err) {
        if (!active) return;
        setDistricts([]);
        setDistrictLoadError(
          err instanceof Error ? err.message : "Failed to load districts. Please try again.",
        );
      } finally {
        if (active) setLoadingDistricts(false);
      }
    };
    void loadDistricts();
    return () => {
      active = false;
    };
  }, [formData.provinceId]);

  useEffect(() => {
    const district = findDistrictByName(districts, formData.district);
    const nextDistrictId = district?.DistrictID ?? null;
    setFormData((prev) =>
      nextDistrictId === (prev.districtId ?? null) ? prev : { ...prev, districtId: nextDistrictId },
    );
  }, [districts, formData.district]);

  useEffect(() => {
    let active = true;
    const districtId = formData.districtId ?? null;
    if (!districtId) {
      setWards([]);
      setWardLoadError(null);
      setFormData((prev) => ({ ...prev, ward: "", wardCode: null }));
      return;
    }
    const loadWards = async () => {
      try {
        setLoadingWards(true);
        setWardLoadError(null);
        const data = await fetchGhnWards(districtId);
        if (!active) return;
        setWards(data);
      } catch (err) {
        if (!active) return;
        setWards([]);
        setWardLoadError(
          err instanceof Error ? err.message : "Failed to load wards. Please try again.",
        );
      } finally {
        if (active) setLoadingWards(false);
      }
    };
    void loadWards();
    return () => {
      active = false;
    };
  }, [formData.districtId]);

  useEffect(() => {
    const ward = findWardByName(wards, formData.ward);
    const nextWardCode = ward?.WardCode ?? null;
    setFormData((prev) =>
      nextWardCode === (prev.wardCode ?? null) ? prev : { ...prev, wardCode: nextWardCode },
    );
  }, [wards, formData.ward]);

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
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2.25, md: 3 },
        borderRadius: 1.5,
        borderColor: "rgba(0,0,0,0.08)",
        bgcolor: "#FFFFFF",
        boxShadow: "0 10px 35px rgba(0,0,0,0.03)",
      }}
    >
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
          <Typography sx={{ fontWeight: 700, fontSize: 26, color: "#111111", letterSpacing: "-0.01em" }}>
            Your Address
          </Typography>
          <Typography sx={{ color: "rgba(17,17,17,0.62)", fontSize: 14 }}>
            Manage your delivery addresses
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleOpenCreateForm}
          disabled={isLoading_all}
          sx={{
            whiteSpace: "nowrap",
            flexShrink: 0,
            textTransform: "none",
            borderRadius: 1,
            fontWeight: 600,
            bgcolor: "#111111",
            "&:hover": { bgcolor: "#000000" },
          }}
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
                border: address.isDefault ? "1px solid rgba(17,17,17,0.4)" : "1px solid rgba(0,0,0,0.08)",
                position: "relative",
                borderRadius: 1.25,
                boxShadow: "none",
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
                  bgcolor: "rgba(17,17,17,0.08)",
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 16, color: "#111111" }} />
                <Typography fontSize={12} fontWeight={700} color="#111111">
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
                  sx={actionBtnSx}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleDeleteClick(address.id)}
                  disabled={isLoading_all}
                  startIcon={<DeleteIcon />}
                  sx={{
                    ...actionBtnSx,
                    color: "error.main",
                    borderColor: "rgba(211,47,47,0.6)",
                    "&:hover": {
                      borderColor: "error.main",
                      bgcolor: "rgba(211,47,47,0.04)",
                    },
                  }}
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

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2 }}>
              <TextField
                select
                label="Province"
                value={formData.provinceId ?? ""}
                onChange={(e) => {
                  const provinceId = Number(e.target.value);
                  const province = provinces.find((p) => p.ProvinceID === provinceId);
                  setFormData((prev) => ({
                    ...prev,
                    province: province?.ProvinceName ?? "",
                    provinceId: provinceId || null,
                    district: "",
                    ward: "",
                    districtId: null,
                    wardCode: null,
                  }));
                }}
                fullWidth
                disabled={isLoading_all || loadingProvinces}
                placeholder="Select province"
                error={Boolean(provinceLoadError)}
                helperText={provinceLoadError ?? undefined}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        maxHeight: 360,
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": { display: "none" },
                      },
                    },
                  },
                }}
              >
                {visibleProvinces.map((p) => (
                  <MenuItem key={`province-${p.ProvinceID}`} value={p.ProvinceID}>
                    {p.ProvinceName}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="District"
                value={formData.districtId ?? ""}
                onChange={(e) => {
                  const districtId = Number(e.target.value);
                  const district = districts.find((d) => d.DistrictID === districtId);
                  setFormData((prev) => ({
                    ...prev,
                    district: district?.DistrictName ?? "",
                    districtId: districtId || null,
                    ward: "",
                    wardCode: null,
                  }));
                }}
                fullWidth
                disabled={isLoading_all || !formData.provinceId || loadingDistricts}
                placeholder="Select district"
                error={Boolean(districtLoadError)}
                helperText={districtLoadError ?? undefined}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        maxHeight: 360,
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": { display: "none" },
                      },
                    },
                  },
                }}
              >
                {districts.map((d) => (
                  <MenuItem key={`district-${d.DistrictID}`} value={d.DistrictID}>
                    {d.DistrictName}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Ward"
                value={formData.wardCode ?? ""}
                onChange={(e) => {
                  const wardCode = String(e.target.value);
                  const ward = wards.find((w) => w.WardCode === wardCode);
                  setFormData((prev) => ({
                    ...prev,
                    ward: ward?.WardName ?? "",
                    wardCode: wardCode || null,
                  }));
                }}
                fullWidth
                disabled={isLoading_all || !formData.districtId || loadingWards}
                placeholder="Select ward"
                error={Boolean(wardLoadError)}
                helperText={wardLoadError ?? undefined}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        maxHeight: 360,
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": { display: "none" },
                      },
                    },
                  },
                }}
              >
                {wards.map((w) => (
                  <MenuItem key={`ward-${w.WardCode}`} value={w.WardCode}>
                    {w.WardName}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

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
              label="Street / Venue"
              placeholder="Search address or enter street / venue"
              fullWidth
            />
            {hasUnresolvedGhnSelection && (
              <Alert severity="warning">
                We could not fully match this address with GHN data. Please confirm Province, District, and Ward from the dropdowns.
              </Alert>
            )}

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
              fontWeight: 600,
              borderRadius: 1,
              bgcolor: "#111111",
              "&:hover": { bgcolor: "#000000" },
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
              borderRadius: 1,
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
