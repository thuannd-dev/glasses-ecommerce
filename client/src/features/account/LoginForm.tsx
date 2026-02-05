import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { useNavigate, Link } from "react-router";

import { Box, Button, Typography, Divider } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

import { loginSchema, type LoginSchema } from "../../lib/schemas/loginSchema";
import { useAccount } from "../../lib/hooks/useAccount";
import TextInput from "../../app/shared/components/TextInput";

export default function LoginForm() {
  const { loginUser } = useAccount();
  const navigate = useNavigate();
  const submittingRef = useRef(false);

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting, errors },
  } = useForm<LoginSchema>({
    mode: "onTouched",
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginSchema) => {
    if (submittingRef.current || loginUser.isPending) return;
    submittingRef.current = true;
    loginUser.mutate(data, {
      onSuccess: () => {
        // Chuyển sang trang redirect: khi có user-info sẽ redirect thẳng vào dashboard (staff) hoặc /collections (customer).
        // Tránh nhá qua trang collections rồi mới vào dashboard.
        navigate("/auth/redirect");
      },
      onSettled: () => {
        submittingRef.current = false;
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
          overflow: "hidden",
          backgroundImage: 'url(https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770195541/glasses/schaeigwshjyqi1vuajl.jpg)',
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

          {/* ===== Fashion Header ===== */}
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
              Welcome back
            </Typography>
            <Typography sx={{ color: "rgba(15,23,42,0.60)"}}>
              Sign in to continue — frames, fit, and finesse.
            </Typography>
          </Box>

          <Divider sx={{ borderColor: "rgba(15,23,42,0.10)" }} />

          {/* ================= INPUTS ================= */}
          {/* ✅ SỬA 1: giãn khoảng cách (2 → 3) */}
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

            <Button
              type="submit"
              disabled={!isValid || isSubmitting || loginUser.isPending}
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
              {isSubmitting || loginUser.isPending ? "Signing in..." : "Login"}
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
