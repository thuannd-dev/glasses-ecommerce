import { useState } from "react";
import {
  IconButton,
  InputAdornment,
  TextField,
  type TextFieldProps,
} from "@mui/material";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";

// Intersection type: Props of react-hook-form + MUI TextField
type Props<T extends FieldValues> =
  UseControllerProps<T> &
  TextFieldProps & {
    hideError?: boolean;
    /** When type=\"password\", show an eye icon to toggle visibility */
    enablePasswordToggle?: boolean;
  };

export default function TextInput<T extends FieldValues>(props: Props<T>) {
  const { hideError = false, enablePasswordToggle = false, ...rest } = props;
  const { field, fieldState } = useController({ ...rest });

  const [showPassword, setShowPassword] = useState(false);

  const isPasswordType = rest.type === "password" && enablePasswordToggle;
  const effectiveType =
    isPasswordType && showPassword ? "text" : rest.type ?? "text";

  return (
    <TextField
      {...rest}
      {...field}
      type={effectiveType}
      value={field.value ?? ""}
      fullWidth
      variant="outlined"
      error={!!fieldState.error}
      helperText={hideError ? undefined : fieldState.error?.message}
      InputProps={{
        ...rest.InputProps,
        endAdornment: isPasswordType ? (
          <>
            {rest.InputProps?.endAdornment}
            <InputAdornment position="end">
              <IconButton
                edge="end"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <VisibilityOffOutlined fontSize="small" />
                ) : (
                  <VisibilityOutlined fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          </>
        ) : (
          rest.InputProps?.endAdornment
        ),
      }}
    />
  );
}
