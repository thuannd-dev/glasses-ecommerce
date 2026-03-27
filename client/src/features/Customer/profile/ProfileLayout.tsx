import { Box, List, ListItem, ListItemButton, ListItemText } from "@mui/material";

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
        maxWidth: 1200,
        mx: "auto",
        mt: 10,
        px: { xs: 2, md: 3 },
        pb: 8,
        display: "flex",
        gap: 3,
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      {/* Sidebar Menu */}
      <Box
        sx={{
          width: { xs: "100%", md: 240 },
          flexShrink: 0,
          height: "fit-content",
          mt: activeSection === "overview" ? { xs: 0, md: 0 }
          : activeSection === "security" ? { xs: 0, md: 1 }
          : { xs: 0, md: 1 }, // addresses
        }}
      >
        <List
          sx={{
            bgcolor: "background.paper",
            borderRadius: 1,
            border: "1px solid rgba(15,23,42,0.08)",
            overflow: "hidden",
          }}
        >
          {MENU_ITEMS.map((item) => (
            <ListItem
              key={item.id}
              disablePadding
              sx={{
                borderBottom: "1px solid rgba(15,23,42,0.08)",
                "&:last-child": {
                  borderBottom: "none",
                },
              }}
            >
              <ListItemButton
                onClick={() => handleMenuItemClick(item.value)}
                selected={activeSection === item.value}
                sx={{
                  py: 1.5,
                  px: 2,
                  "&.Mui-selected": {
                    bgcolor: "rgba(79, 70, 229, 0.08)",
                    borderLeft: "3px solid #4F46E5",
                    pl: "calc(2 - 3px)",
                  },
                  "&:hover": {
                    bgcolor: "rgba(15,23,42,0.04)",
                  },
                }}
              >
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      sx: {
                        fontWeight: activeSection === item.value ? 700 : 600,
                        fontSize: 14,
                        color:
                          activeSection === item.value ? "#4F46E5" : "rgba(15,23,42,0.8)",
                      },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Content Area */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
