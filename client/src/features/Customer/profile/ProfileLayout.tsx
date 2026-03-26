import { Box, List, ListItemButton, ListItemText, Paper, Stack, Typography } from "@mui/material";

export type ProfileSectionType = "overview" | "security" | "addresses";

interface ProfileLayoutProps {
  readonly activeSection: ProfileSectionType;
  readonly onSectionChange: (section: ProfileSectionType) => void;
  readonly children: React.ReactNode;
}

const MENU_ITEMS = [
  {
    id: "overview",
    label: "Profile",
    value: "overview" as ProfileSectionType,
  },
  {
    id: "security",
    label: "Security",
    value: "security" as ProfileSectionType,
  },
  {
    id: "addresses",
    label: "Your Address",
    value: "addresses" as ProfileSectionType,
  },
] as const;

export default function ProfileLayout({
  activeSection,
  onSectionChange,
  children,
}: ProfileLayoutProps) {
  const handleMenuItemClick = (section: ProfileSectionType) => {
    onSectionChange(section);
  };

  return (
    <Box
      sx={{
        maxWidth: 1240,
        mx: "auto",
        mt: { xs: 9, md: 11 },
        px: { xs: 2, md: 4 },
        pb: { xs: 7, md: 10 },
      }}
    >
      <Stack
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "248px minmax(0, 1fr)" },
          gap: { xs: 2, md: 3 },
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 1, md: 1.25 },
            borderRadius: 1.5,
            borderColor: "rgba(0,0,0,0.08)",
            bgcolor: "#FCFCFB",
            overflow: "hidden",
            height: "fit-content",
            position: { md: "sticky" },
            top: { md: 88 },
          }}
        >
          <Typography
            sx={{
              px: 1.5,
              pt: 0.75,
              pb: 1.25,
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(17,17,17,0.52)",
              fontWeight: 700,
            }}
          >
            Account
          </Typography>
          <List disablePadding sx={{ display: "grid", gap: 0.5 }}>
            {MENU_ITEMS.map((item) => (
              <ListItemButton
                key={item.id}
                onClick={() => handleMenuItemClick(item.value)}
                selected={activeSection === item.value}
                sx={{
                  minHeight: 46,
                  borderRadius: 1,
                  px: 1.75,
                  borderLeft: "1px solid transparent",
                  transition: "background-color 180ms ease, border-color 180ms ease",
                  "&.Mui-selected": {
                    bgcolor: "rgba(17,17,17,0.06)",
                    borderLeftColor: "#111111",
                  },
                  "&.Mui-selected:hover": { bgcolor: "rgba(17,17,17,0.08)" },
                  "&:hover": {
                    bgcolor: "rgba(17,17,17,0.04)",
                  },
                }}
              >
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      sx: {
                        fontWeight: activeSection === item.value ? 700 : 600,
                        fontSize: 14.2,
                        letterSpacing: "0.01em",
                        color: activeSection === item.value ? "#111111" : "rgba(17,17,17,0.74)",
                      },
                    },
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>

        <Box sx={{ minWidth: 0 }}>{children}</Box>
      </Stack>
    </Box>
  );
}
