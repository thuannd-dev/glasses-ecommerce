import { useEffect, useMemo, useState } from "react";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import { useController } from "react-hook-form";
import {
  Box,
  debounce,
  List,
  ListItemButton,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";

type Props<T extends FieldValues> = { label: string } & UseControllerProps<T>;

export default function LocationInput<T extends FieldValues>(props: Props<T>) {
  const { field, fieldState } = useController({ ...props });
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationIQSuggestion[]>([]);
  const [inputValue, setInputValue] = useState(field.value || "");

  // hook to keep inputValue in sync with field.value (which is controlled by react-hook-form)
  // when form is reset, user typing, user select suggestion, updated activity is loaded
  useEffect(() => {
    if (field.value && typeof field.value === "object") {
      setInputValue(field.value.venue || "");
    } else {
      setInputValue(field.value || "");
    }
  }, [field.value]);

  //In current, i'm using free plan of locationIQ(don't need to supply credit card),
  //and in this plan locationIQ supply to you a client side key(user can see in the request of network tab)
  //so this is don't meaningfull to hide it, but no matter
  // if the key were stolen then only thing happen is you are run into rate limits

  //The solution is upgrade plan.
  const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;
  const locationUrl = `https://api.locationiq.com/v1/autocomplete?key=${LOCATIONIQ_API_KEY}&limit=5&dedupe=1&`;

  //The reason to use useMemo instead of useCallback here is to avoid creating a new debounced function on every render
  //Doc: const cachedFn = useCallback(fn, dependencies)
  //useCallback get a FUNCTION "HAVE BEEN CREATED outside of it" and return a memoized version of that function that only change if one of the dependencies change
  //and useCallback has no control over how you create arguments to pass to it.
  //debounce has been called by js to evaluate arguments -> creates a new debounced function on every render
  //But react see deps is [] so react skip the new debounced function and use the old one

  //=> With using of useMemo, the debounced function is created only once
  //Because doc: const cachedValue = useMemo(calculateValue, dependencies)
  //In this case, it have been get a CALLBACK (factory function) which React will call when needed
  //And with deps is [], you can ensure that debounce is called only once
  const fetchSuggestions = useMemo(
    () =>
      debounce(async (query: string) => {
        if (!query || query.length < 3) {
          setSuggestions([]);
          return;
        }

        setLoading(true);

        try {
          //i not using agent because that one's specific for calling our backend API, not for the locationIQ API
          //And i set up agent with default value (base url) in that to go our API
          //in this case is a different location
          const res = await axios.get<LocationIQSuggestion[]>(
            `${locationUrl}q=${query}`,
          );
          setSuggestions(res.data);
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      }, 500),
    [locationUrl],
  );

  const handleChange = async (value: string) => {
    setInputValue(value);
    field.onChange(value);
    await fetchSuggestions(value);
  };

  const handleSelect = (location: LocationIQSuggestion) => {
    const city =
      location.address?.city ||
      location.address?.town ||
      location.address?.village;
    const venue = location.display_name;
    const latitude = location.lat;
    const longitude = location.lon;

    setInputValue(venue);
    field.onChange({ city, venue, latitude, longitude });
    setSuggestions([]);
  };

  return (
    <Box>
      <TextField
        {...props}
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        fullWidth
        variant="outlined"
        error={!!fieldState.error}
        helperText={fieldState.error?.message}
      />
      {loading && <Typography>Loading...</Typography>}
      {suggestions.length > 0 && (
        <List sx={{ border: 1 }}>
          {suggestions.map((suggestion) => (
            <ListItemButton
              divider
              key={suggestion.place_id}
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion.display_name}
            </ListItemButton>
          ))}
        </List>
      )}
    </Box>
  );
}
