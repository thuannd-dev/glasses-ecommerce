import { useMemo, useState } from "react";
import {
  Box,
  debounce,
  List,
  ListItemButton,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import type { LocationIQAddress, LocationIQSuggestion } from "../../../lib/types/location";

/** Map LocationIQ suggestion → venue, ward, district, city, postalCode */
export function mapLocationToAddress(
  loc: LocationIQSuggestion,
): Pick<ShippingAddressFromAutocomplete, "venue" | "ward" | "district" | "city" | "postalCode"> {
  const addr = loc.address ?? ({} as LocationIQAddress);
  const road = [addr.house_number, addr.road].filter(Boolean).join(" ").trim() || addr.name || "";
  const venue = road || loc.display_name || "";
  const ward = addr.suburb ?? addr.neighbourhood ?? addr.village ?? "";
  const district = addr.county ?? "";
  const city = addr.city ?? addr.town ?? addr.state ?? "";
  const postalCode = addr.postcode ?? "";
  return { venue, ward, district, city, postalCode };
}

export interface ShippingAddressFromAutocomplete {
  venue: string;
  ward: string;
  district: string;
  city: string;
  postalCode?: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectAddress: (address: ShippingAddressFromAutocomplete) => void;
  label?: string;
  placeholder?: string;
  fullWidth?: boolean;
}

export default function AddressAutocomplete({
  value,
  onChange,
  onSelectAddress,
  label = "Search address",
  placeholder = "Enter house number, street, district, city...",
  fullWidth = true,
}: AddressAutocompleteProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationIQSuggestion[]>([]);
  const [open, setOpen] = useState(false);

  const apiKey = import.meta.env.VITE_LOCATIONIQ_API_KEY;
  const autocompleteUrl = `https://api.locationiq.com/v1/autocomplete?key=${apiKey}&limit=5&dedupe=1&addressdetails=1&normalizeaddress=1&countrycodes=vn&q=`;

  const fetchSuggestions = useMemo(
    () =>
      debounce(async (query: string) => {
        if (!query || query.length < 3) {
          setSuggestions([]);
          setOpen(false);
          return;
        }
        setLoading(true);
        try {
          const res = await axios.get<LocationIQSuggestion[]>(
            `${autocompleteUrl}${encodeURIComponent(query)}`,
          );
          const data = Array.isArray(res.data) ? res.data : [];
          setSuggestions(data);
          setOpen(data.length > 0);
        } catch {
          setSuggestions([]);
          setOpen(false);
        } finally {
          setLoading(false);
        }
      }, 400),
    [autocompleteUrl],
  );

  const handleChange = (inputValue: string) => {
    onChange(inputValue);
    fetchSuggestions(inputValue);
  };

  const handleSelect = (loc: LocationIQSuggestion) => {
    const mapped = mapLocationToAddress(loc);
    onChange(loc.display_name);
    onSelectAddress(mapped);
    setSuggestions([]);
    setOpen(false);
  };

  const handleBlur = () => {
    setTimeout(() => setOpen(false), 200);
  };

  return (
    <Box sx={{ position: "relative" }}>
      <TextField
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => value.length >= 3 && suggestions.length > 0 && setOpen(true)}
        onBlur={handleBlur}
        fullWidth={fullWidth}
        size="small"
        InputProps={{
          sx: { borderRadius: 2 },
        }}
      />
      {loading && (
        <Typography
          variant="caption"
          sx={{
            position: "absolute",
            left: 14,
            top: "100%",
            mt: 0.5,
            color: "text.secondary",
          }}
        >
          Searching...
        </Typography>
      )}
      {open && suggestions.length > 0 && (
        <List
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1100,
            mt: 0.5,
            py: 0,
            maxHeight: 240,
            overflow: "auto",
            bgcolor: "#fff",
            border: "1px solid rgba(17,24,39,0.12)",
            borderRadius: 2,
            boxShadow: "0 10px 30px rgba(17,24,39,0.12)",
          }}
        >
          {suggestions.map((s) => (
            <ListItemButton
              key={s.place_id}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(s);
              }}
              divider
              sx={{ py: 1.25, fontSize: 13.5 }}
            >
              {s.display_name}
            </ListItemButton>
          ))}
        </List>
      )}
    </Box>
  );
}
