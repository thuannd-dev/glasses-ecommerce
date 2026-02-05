import { Box, Typography } from "@mui/material";

const ROOT_SX = {
  position: "relative",
  left: "50%",
  right: "50%",
  ml: "-50vw",
  mr: "-50vw",
  width: "100vw",
} as const;

export default function AboutStory() {
  return (
    <Box sx={ROOT_SX}>
      <Box
        sx={{
          mt: 8,
          mb: 6,
          px: { xs: 2, md: 4, lg: 8 },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.2fr 1.1fr" },
          gap: { xs: 4, md: 6 },
          alignItems: "center",
        }}
      >
        <Box>
        <Typography
          sx={{
            fontSize: 12,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "rgba(15,23,42,0.6)",
          }}
        >
          ABOUT EYEWEAR STUDIO
        </Typography>

        <Typography
          sx={{
            mt: 1,
            fontSize: { xs: 30, md: 34 },
            fontWeight: 900,
            letterSpacing: -1,
            color: "rgba(15,23,42,0.95)",
          }}
        >
          Glasses that frame your life, not hide it.
        </Typography>

        <Typography
          sx={{
            mt: 2,
            fontSize: 14,
            lineHeight: 1.7,
            color: "rgba(15,23,42,0.7)",
            maxWidth: 520,
          }}
        >
          We began as a small optical studio solving one simple problem: why do
          frames look amazing on displays but feel wrong on real faces? Today,
          every pair we release is wear‑tested by people who stare at screens,
          ride scooters, read late at night and live in different light all day.
        </Typography>

        <Typography
          sx={{
            mt: 1.5,
            fontSize: 14,
            lineHeight: 1.7,
            color: "rgba(15,23,42,0.7)",
            maxWidth: 520,
          }}
        >
          From ultra‑light stainless steel to plant‑based acetate, blue‑light
          filters and prescription lenses, we design eyewear that is kind to
          your eyes and sharp on your style. Slide them on, forget the weight,
          and see your day in high‑definition.
        </Typography>
      </Box>

      <Box
        sx={{
          position: "relative",
          borderRadius: 4,
          overflow: "hidden",
          minHeight: { xs: 220, md: 260 },
          mr: { md: 4, lg: 8 },
        }}
      >
        <Box
          component="img"
          src="/images/categoryImages/culture.jpg"
          alt="Minimal eyewear styled on a desk"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.75), rgba(15,23,42,0.3))",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            p: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            color: "#f9fafb",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 11,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "rgba(248,250,252,0.7)",
              }}
            >
              REAL PEOPLE • REAL FRAMES
            </Typography>
            <Typography
              sx={{
                mt: 1,
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: -0.5,
              }}
            >
              Designed in the studio, tuned on the street.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 3, mt: 3 }}>
            <Box>
              <Typography sx={{ fontSize: 22, fontWeight: 900 }}>15k+</Typography>
              <Typography
                sx={{ fontSize: 11, color: "rgba(241,245,249,0.8)" }}
              >
                prescriptions & fashion frames
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 22, fontWeight: 900 }}>4.8</Typography>
              <Typography
                sx={{ fontSize: 11, color: "rgba(241,245,249,0.8)" }}
              >
                average rating from eyewear lovers
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
    </Box>
  );
}
