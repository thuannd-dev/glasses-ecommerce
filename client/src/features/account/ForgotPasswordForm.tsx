import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useNavigate, Link } from "react-router";
import { Box, Button, Typography, Divider, Alert } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

import TextInput from "../../app/shared/components/TextInput";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const submittingRef = useRef(false);

  const {
    control,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm<ForgotPasswordSchema>({
    mode: "onTouched",
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordSchema) => {
    if (submittingRef.current || isLoading) return;
    submittingRef.current = true;
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/account/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send recovery email");
      }

      setSuccessMessage(
        "If an account with that email exists, a password recovery link has been sent. Please check your email."
      );
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      setIsLoading(false);
      submittingRef.current = false;
    }
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
          backgroundImage:
            "url(https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770195541/glasses/schaeigwshjyqi1vuajl.jpg)",
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
              Recover your access.
            </Typography>
            <Typography sx={{ mt: 1, fontSize: 14, maxWidth: 280 }}>
              Regain access to your account and continue exploring our eyewear
              collection.
            </Typography>
          </Box>

          <Typography sx={{ fontSize: 12 }}>
            Your privacy and security matter to us.
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
            onClick={() => navigate("/login")}
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
            Back to login
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
              Forgot password?
            </Typography>
            <Typography sx={{ color: "rgba(15,23,42,0.60)" }}>
              Enter your email to receive a password recovery link.
            </Typography>
          </Box>

          <Divider sx={{ borderColor: "rgba(15,23,42,0.10)" }} />

          {/* ================= MESSAGES ================= */}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {/* ================= INPUTS ================= */}
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

            <Button
              type="submit"
              disabled={!isValid || isLoading}
              variant="contained"
              size="large"
              sx={{
                mt: 1,
                py: 1.25,
                borderRadius: 999,
                fontWeight: 900,
                textTransform: "none",
                boxShadow: "0 16px 36px rgba(255,152,0,0.18)",
                backgroundColor: "#FF9800",
                "&:hover": { backgroundColor: "#F57C00" },
              }}
            >
              {isLoading ? "Sending..." : "Send Recovery Link"}
            </Button>

            <Typography sx={{ textAlign: "center", color: "rgba(15,23,42,0.65)" }}>
              Remember your password?
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
    </Box>
  );
}
