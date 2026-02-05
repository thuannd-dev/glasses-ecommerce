import { Box, Typography } from "@mui/material";
import { useAccount } from "../../lib/hooks/useAccount";

export default function CustomerDashboard() {
  const { currentUser } = useAccount();

  return (
    <Box
      sx={{
        maxWidth: 960,
        mx: "auto",
        mt: 8,
        px: { xs: 2, md: 3 },
        pb: 6,
      }}
    >
      <Typography fontWeight={900} fontSize={26} mb={1}>
        Customer area
      </Typography>
      <Typography color="rgba(15,23,42,0.7)" mb={3}>
        Welcome{currentUser?.displayName ? `, ${currentUser.displayName}` : ""}.
      </Typography>
      <Typography fontSize={14} color="rgba(15,23,42,0.7)">
        This is a placeholder page for the <strong>Customer</strong> role. You
        can plug in order history, saved items, or account settings here later.
      </Typography>
    </Box>
  );
}

