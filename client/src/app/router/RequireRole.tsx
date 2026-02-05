import { Navigate, Outlet, useLocation } from "react-router";
import { Typography } from "@mui/material";
import { useAccount } from "../../lib/hooks/useAccount";

interface RequireRoleProps {
  allowedRoles: string[];
}

export default function RequireRole({ allowedRoles }: RequireRoleProps) {
  const { currentUser, loadingUserInfo } = useAccount();
  const location = useLocation();

  if (loadingUserInfo) return <Typography>Loading...</Typography>;

  if (!currentUser) return <Navigate to="/login" state={{ from: location }} />;

  const userRoles = currentUser.roles ?? [];
  const isAllowed = userRoles.some((r) => allowedRoles.includes(r));

  if (!isAllowed) return <Navigate to="/not-found" replace />;

  return <Outlet />;
}

