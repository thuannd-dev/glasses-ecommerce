import { useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import { useAccount } from "../../lib/hooks/useAccount";

export default function PostLoginRedirect() {
  const navigate = useNavigate();
  const { currentUser, loadingUserInfo } = useAccount();

  useEffect(() => {
    if (loadingUserInfo) return;
    if (!currentUser) {
      navigate("/collections", { replace: true });
      return;
    }
    const roles = currentUser.roles ?? [];
    const has = (r: string) => roles.includes(r);
    if (has("Admin")) {
      navigate("/admin", { replace: true });
      return;
    }
    if (has("Manager")) {
      navigate("/manager", { replace: true });
      return;
    }
    if (has("Operations")) {
      navigate("/operations", { replace: true });
      return;
    }
    if (has("Sales")) {
      navigate("/sales", { replace: true });
      return;
    }
    navigate("/collections", { replace: true });
  }, [currentUser, loadingUserInfo, navigate]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        bgcolor: "#fafafa",
      }}
    >
      <CircularProgress size={40} />
      <Typography variant="body2" color="text.secondary">
        Đang chuyển hướng…
      </Typography>
    </Box>
  );
}
