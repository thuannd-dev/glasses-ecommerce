import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";
import agent from "../../../lib/api/agent";
import { useAccount } from "../../../lib/hooks/useAccount";

export default function ProfilePage() {
  const { currentUser } = useAccount();

  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["profile", currentUser?.id],
    enabled: !!currentUser?.id,
    queryFn: async () => {
      const response = await agent.get<Profile>(
        `/profiles/${currentUser!.id}`,
      );
      console.log("PROFILE from backend:", response.data);
      return response.data;
    },
  });

  if (!currentUser?.id) {
    return (
      <Box
        sx={{
          maxWidth: 800,
          mx: "auto",
          mt: 10,
          px: { xs: 2, md: 3 },
        }}
      >
        <Typography fontWeight={900} fontSize={22}>
          Profile
        </Typography>
        <Typography mt={1} color="rgba(15,23,42,0.65)">
          You need to be logged in to view your profile.
        </Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          maxWidth: 800,
          mx: "auto",
          mt: 10,
          px: { xs: 2, md: 3 },
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !profile) {
    return (
      <Box
        sx={{
          maxWidth: 800,
          mx: "auto",
          mt: 10,
          px: { xs: 2, md: 3 },
        }}
      >
        <Typography fontWeight={900} fontSize={22}>
          Profile
        </Typography>
        <Typography mt={1} color="error">
          Failed to load profile.
        </Typography>
        {error instanceof Error && (
          <Typography mt={0.5} fontSize={13} color="rgba(15,23,42,0.6)">
            {error.message}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: "auto",
        mt: 10,
        px: { xs: 2, md: 3 },
        pb: 8,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Avatar
          src={profile.imageUrl ?? undefined}
          sx={{ width: 72, height: 72, bgcolor: "#111827", fontSize: 28 }}
        >
          {profile.displayName[0]?.toUpperCase()}
        </Avatar>
        <Box>
          <Typography fontWeight={900} fontSize={24}>
            {profile.displayName}
          </Typography>
          <Typography fontSize={13} color="rgba(15,23,42,0.65)">
            Member profile
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: "grid", rowGap: 1.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography color="rgba(15,23,42,0.6)">User ID</Typography>
          <Typography fontWeight={600}>{profile.id}</Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography color="rgba(15,23,42,0.6)">Display name</Typography>
          <Typography fontWeight={600}>{profile.displayName}</Typography>
        </Box>

        {profile.bio && (
          <Box sx={{ mt: 2 }}>
            <Typography fontWeight={900} mb={0.5}>
              Bio
            </Typography>
            <Typography fontSize={14} color="rgba(15,23,42,0.8)">
              {profile.bio}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

