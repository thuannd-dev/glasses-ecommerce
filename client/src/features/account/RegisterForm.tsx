import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router";

import { Box, Button, Typography, Divider } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

import { useAccount } from "../../lib/hooks/useAccount";
import TextInput from "../../app/shared/components/TextInput";
import {
  registerSchema,
  type RegisterSchema,
} from "../../lib/schemas/registerSchema";

export default function RegisterForm() {
  const { registerUser } = useAccount();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    setError,
    formState: { isValid, isSubmitting, errors },
  } = useForm<RegisterSchema>({
    mode: "onTouched",
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterSchema) => {
    try {
      await registerUser.mutateAsync(data, {
        onError: (error) => {
          if (Array.isArray(error)) {
            error.forEach((err) => {
              if (err.includes("Email")) setError("email", { message: err });
              else if (err.includes("Password"))
                setError("password", { message: err });
            });
          }
        },
      });
    } catch {
      // Lỗi đã xử lý bởi agent (toast) và/hoặc onError (form errors)
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
        background:
          "radial-gradient(900px 500px at 10% 10%, rgba(255,219,191,0.55), transparent 60%), linear-gradient(180deg, #FAFAF8, #F1F3F5)",
      }}
    >
      {/* ================= LEFT: FORM ================= */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: { xs: 3, sm: 6, md: 10 },
          overflow: "hidden",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            width: "100%",
            maxWidth: 460,
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
          }}
        >
          {/* 🔙 Back */}
          <Button
            onClick={() => navigate("/collections")}
            startIcon={<ArrowBack />}
            variant="text"
            sx={{
              alignSelf: "flex-start",
              textTransform: "none",
              fontWeight: 700,
              px: 0,
              mb: 0.5,
              color: "rgba(15,23,42,0.75)",
              "&:hover": { color: "rgba(15,23,42,0.95)" },
            }}
          >
            Back to collections
          </Button>

          {/* ===== Header ===== */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                pl: "20px",
              }}
            >
              <Box sx={{ width: 34, height: 1, bgcolor: "rgba(15,23,42,0.35)" }} />
              <Typography
                sx={{
                  fontSize: 12,
                  letterSpacing: 4,
                  color: "rgba(15,23,42,0.65)",
                }}
              >
                EYEWEAR ATELIER
              </Typography>
            </Box>

            <Typography
              sx={{
                fontSize: { xs: 34, md: 40 },
                fontWeight: 900,
                letterSpacing: -1.2,
                color: "rgba(15,23,42,0.92)",
              }}
            >
              Create account
            </Typography>
            <Typography sx={{ color: "rgba(15,23,42,0.60)" }}>
              Join us — curated frames and modern silhouettes.
            </Typography>
          </Box>

          <Divider sx={{ borderColor: "rgba(15,23,42,0.10)" }} />

          {/* ================= INPUTS ================= */}
          {/* ✅ gap 2 → 3 */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
            {/* EMAIL */}
            <Box>
              <TextInput
                label="Email"
                control={control}
                name="email"
                hideError
              />
              {errors.email && (
                <Typography
                  fontSize={13}
                  fontWeight={600}
                  color="error"
                  sx={{ mt: 0.5 }}
                >
                  {errors.email.message}
                </Typography>
              )}
            </Box>

            {/* DISPLAY NAME */}
            <Box>
              <TextInput
                label="Display Name"
                control={control}
                name="displayName"
                hideError
              />
              {errors.displayName && (
                <Typography
                  fontSize={13}
                  fontWeight={600}
                  color="error"
                  sx={{ mt: 0.5 }}
                >
                  {errors.displayName.message}
                </Typography>
              )}
            </Box>

            {/* PASSWORD */}
            <Box>
              <TextInput
                label="Password"
                type="password"
                control={control}
                name="password"
                hideError
              />
              {errors.password && (
                <Typography
                  fontSize={13}
                  fontWeight={600}
                  color="error"
                  sx={{ mt: 0.5 }}
                >
                  {errors.password.message}
                </Typography>
              )}
            </Box>

            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              variant="contained"
              size="large"
              sx={{
                mt: 1,
                py: 1.25,
                borderRadius: 999,
                fontWeight: 900,
                textTransform: "none",
                boxShadow: "0 16px 36px rgba(25,118,210,0.18)",
              }}
            >
              {isSubmitting ? "Creating..." : "Sign up"}
            </Button>

            <Typography sx={{ textAlign: "center", color: "rgba(15,23,42,0.65)" }}>
              Already have an account?
              <Typography
                component={Link}
                to="/login"
                sx={{ ml: 1, fontWeight: 900, textDecoration: "none" }}
                color="primary"
              >
                Sign in
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ================= RIGHT: IMAGE ================= */}
      <Box
        sx={{
          position: "relative",
          display: { xs: "none", md: "block" },
          overflow: "hidden",
          backgroundImage: 'url(https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770195516/glasses/je56zzn719qvattjehhe.jpg)',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(120deg, rgba(255,255,255,0.18), rgba(0,0,0,0.18))",
          }}
        />
      </Box>
    </Box>
  );
}
