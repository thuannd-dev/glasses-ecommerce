import { Box, Typography } from "@mui/material";

interface AdminPageHeaderProps {
  title: string;
  description: string;
  prefix?: string;
}

export function AdminPageHeader({
  title,
  description,
  prefix = "Admin Console",
}: AdminPageHeaderProps) {
  return (
    <Box sx={{ mb: 5 }}>
      <Typography
        sx={{
          fontSize: 11,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: "#8A8A8A",
          fontWeight: 700,
        }}
      >
        {prefix}
      </Typography>

      <Typography
        sx={{
          mt: 1,
          fontSize: { xs: 24, md: 30 },
          fontWeight: 800,
          color: "#171717",
        }}
      >
        {title}
      </Typography>

      <Typography sx={{ mt: 0.5, color: "#6B6B6B", maxWidth: 520, fontSize: 14 }}>
        {description}
      </Typography>
    </Box>
  );
}
