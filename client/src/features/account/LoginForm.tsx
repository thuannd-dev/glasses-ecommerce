import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router";

import { Box, Button, Typography, Divider, IconButton } from "@mui/material";
import { Visibility, VisibilityOff, ArrowBack } from "@mui/icons-material";

import { loginSchema, type LoginSchema } from "../../lib/schemas/loginSchema";
import { useAccount } from "../../lib/hooks/useAccount";
import TextInput from "../../app/shared/components/TextInput";
import Image1 from "../../app/assets/vooglam-eyewear-yKB_hLMCeRI-unsplash.jpg"
export default function LoginForm() {
  const { loginUser } = useAccount();
  const navigate = useNavigate();
  const location = useLocation();

  const imageUrl = Image1;

  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<LoginSchema>({
    mode: "onTouched",
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginSchema) => {
    await loginUser.mutateAsync(data, {
      onSuccess: () => {
        navigate(location.state?.from || "/activities");
      },
    });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",          // ✅ bỏ 100vw để không tràn ngang
        overflow: "hidden",     // ✅ khóa scroll dọc + ngang
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
        background:
          "radial-gradient(900px 500px at 10% 10%, rgba(255,219,191,0.55), transparent 60%), linear-gradient(180deg, #FAFAF8, #F1F3F5)",
      }}
    >
      {/* ================= LEFT IMAGE ================= */}
      <Box
        sx={{
          position: "relative",
          display: { xs: "none", md: "block" },
          overflow: "hidden", // ✅ an toàn chống tràn
          backgroundImage: `url(${imageUrl})`,
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

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            p: 5,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            color: "#fff",
            textShadow: "0 10px 30px rgba(0,0,0,0.35)",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 12, letterSpacing: 3 }}>
              EYEWEAR • 2026 COLLECTION
            </Typography>
            <Typography sx={{ mt: 1, fontSize: 32, fontWeight: 800 }}>
              Define your look.
            </Typography>
            <Typography sx={{ mt: 1, fontSize: 14, maxWidth: 280 }}>
              Minimal frames, premium feel — discover eyewear that fits your
              identity.
            </Typography>
          </Box>

          <Typography sx={{ fontSize: 12 }}>
            Crafted for modern silhouettes.
          </Typography>
        </Box>
      </Box>

      {/* ================= RIGHT FORM ================= */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: { xs: 3, sm: 6, md: 10 },
          overflow: "hidden", // ✅ an toàn chống tràn
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

          {/* ===== Fashion Header (Luxury) ===== */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {/* Brand line */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                pl: "20px",
                lineHeight: 1,
              }}
            >
              <Box sx={{ width: 34, height: 1, bgcolor: "rgba(15,23,42,0.35)" }} />
              <Typography
                sx={{
                  fontSize: 12,
                  letterSpacing: 4,
                  color: "rgba(15,23,42,0.65)",
                  lineHeight: 1,
                }}
              >
                EYEWEAR ATELIER
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {/* Monogram badge */}
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  display: "grid",
                  placeItems: "center",
                  border: "1px solid rgba(15,23,42,0.12)",
                  background: "rgba(255,255,255,0.85)",
                  boxShadow: "0 14px 30px rgba(15,23,42,0.06)",
                  flex: "0 0 auto",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 900,
                    letterSpacing: 1,
                    color: "rgba(15,23,42,0.9)",
                    fontSize: 18,
                  }}
                >
                  F
                </Typography>
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: { xs: 34, md: 40 },
                    fontWeight: 900,
                    letterSpacing: -1.2,
                    lineHeight: 1.02,
                    color: "rgba(15,23,42,0.92)",
                  }}
                >
                  Welcome back
                </Typography>
                <Typography sx={{ mt: 0.6, color: "rgba(15,23,42,0.60)" }}>
                  Sign in to continue — frames, fit, and finesse.
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ borderColor: "rgba(15,23,42,0.10)" }} />

          {/* Inputs */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextInput label="Email" control={control} name="email" />

            {/* Password + eye icon FIX CHUẨN */}
            <Box sx={{ position: "relative", "& input": { pr: 5 } }}>
              <TextInput
                label="Password"
                type={showPassword ? "text" : "password"}
                control={control}
                name="password"
              />
              <IconButton
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                sx={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(15,23,42,0.55)",
                }}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                component={Link}
                to="/forgot-password"
                sx={{
                  textDecoration: "none",
                  fontSize: 14,
                  color: "rgba(15,23,42,0.65)",
                  "&:hover": { color: "rgba(15,23,42,0.92)" },
                }}
              >
                Forgot password?
              </Typography>

              <Typography sx={{ fontSize: 12, color: "rgba(15,23,42,0.55)" }}>
                Secure login
              </Typography>
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
              {isSubmitting ? "Signing in..." : "Login"}
            </Button>

            <Typography sx={{ textAlign: "center", color: "rgba(15,23,42,0.65)" }}>
              Don&apos;t have an account?
              <Typography
                component={Link}
                to="/register"
                sx={{ ml: 1, fontWeight: 900, textDecoration: "none" }}
                color="primary"
              >
                Sign up
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
