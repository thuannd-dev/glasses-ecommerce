import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useNavigate, Link } from "react-router";

import { Box, Button, Typography, Divider, IconButton } from "@mui/material";
import { Visibility, VisibilityOff, ArrowBack } from "@mui/icons-material";

import { useAccount } from "../../lib/hooks/useAccount";
import TextInput from "../../app/shared/components/TextInput";
import {
  registerSchema,
  type RegisterSchema,
} from "../../lib/schemas/registerSchema";

import Image2 from "../../app/assets/jordan-andrews-dca_s9Wy8c0-unsplash.jpg"
export default function RegisterForm() {
  const { registerUser } = useAccount();
  const navigate = useNavigate();

  const imageUrl = Image2;

  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { isValid, isSubmitting },
  } = useForm<RegisterSchema>({
    mode: "onTouched",
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterSchema) => {
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
      onSuccess: () => {
        navigate("/activities");
      },
    });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, // ✅ form trái (2fr) - ảnh phải (1fr)
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
                  Create account
                </Typography>
                <Typography sx={{ mt: 0.6, color: "rgba(15,23,42,0.60)" }}>
                  Join us — curated frames and modern silhouettes.
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ borderColor: "rgba(15,23,42,0.10)" }} />

          {/* Inputs */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextInput label="Email" control={control} name="email" />
            <TextInput label="Display Name" control={control} name="displayName" />

            {/* Password + eye icon */}
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
            <Typography
              sx={{
                fontSize: 11,
                letterSpacing: 4,
                color: "rgba(255,255,255,0.75)", // ❄️ trắng ngà, không gắt
                textTransform: "uppercase",
              }}
            >
              NEW MEMBER • ACCESS
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: 32,
                fontWeight: 900,
                lineHeight: 1.15,
                color: "rgba(255,255,255,0.95)", // tiêu đề nổi rõ
              }}
            >
              Join the atelier.
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: 14,
                maxWidth: 280,
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.70)", // body dịu
              }}
            >
              Create an account to save favorites and explore new arrivals.
            </Typography>
          </Box>


          <Typography sx={{ fontSize: 12 }}>
            Crafted for modern silhouettes.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
