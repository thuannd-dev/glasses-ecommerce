import { useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

import { useAccount } from "../../../lib/hooks/useAccount";
import ProfileLayout, { type ProfileSectionType } from "./ProfileLayout";
import ProfileOverview from "./sections/ProfileOverview";
import SecuritySection from "./sections/SecuritySection";
import AddressesSection from "./sections/AddressesSection";

export default function ProfilePage() {
  const { currentUser, loadingUserInfo: isAuthLoading } = useAccount();
  const [activeSection, setActiveSection] = useState<ProfileSectionType>("overview");

  if (isAuthLoading) {
    return (
      <Box
        sx={{
          maxWidth: 1240,
          mx: "auto",
          mt: { xs: 9, md: 11 },
          px: { xs: 2, md: 4 },
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser?.id) {
    return (
      <Box
        sx={{
          maxWidth: 1240,
          mx: "auto",
          mt: { xs: 9, md: 11 },
          px: { xs: 2, md: 4 },
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

  return (
    <ProfileLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      {activeSection === "overview" && <ProfileOverview userId={currentUser.id} />}
      {activeSection === "security" && <SecuritySection />}
      {activeSection === "addresses" && <AddressesSection />}
    </ProfileLayout>
  );
}
