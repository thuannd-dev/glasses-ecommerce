import { useState } from "react";
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Button,
    Stack,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

type TabKey = "bestseller" | "new" | "staff";
type Gender = "all" | "men" | "women";

const TAB_LIST: { key: TabKey; label: string }[] = [
    { key: "bestseller", label: "Weekly Bestsellers" },
    { key: "new", label: "New Arrivals" },
    { key: "staff", label: "Staff Picks" },
];

const ITEMS = [
    {
        id: 1,
        rank: 1,
        name: "OWNDAYS | AIR",
        code: "MM1014B-3S C4",
        price: "₫2.780.000",
        image: "/images/glass-1.png",
    },
    {
        id: 2,
        rank: 2,
        name: "OWNDAYS | ESSENTIAL",
        code: "OR1058M-4A C2",
        price: "₫1.780.000",
        image: "/images/glass-2.png",
    },
    {
        id: 3,
        rank: 3,
        name: "OWNDAYS | SUN",
        code: "SNP2013N-2S C1",
        price: "₫2.780.000",
        image: "/images/glass-3.png",
    },
];

export default function ItemBestSeller() {
    const [tab, setTab] = useState(0);
    const [gender, setGender] = useState<Gender>("all");

    return (
        <Box sx={{
            py: 10, width: "100vw",
            position: "relative",
            left: "50%",
            right: "50%",
            ml: "-50vw",
            mr: "-50vw", }}>
            <Box width = "100%" mx="auto" px={2}>
                {/* ---------- Tabs header ---------- */}
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    centered
                    TabIndicatorProps={{
                        sx: {
                            height: 2,
                            backgroundColor: "#000",
                        },
                    }}
                    sx={{
                        borderBottom: "1px solid #e0e0e0",
                        "& .MuiTab-root": {
                            textTransform: "none",
                            fontSize: 14,
                            letterSpacing: 1,
                            color: "#9e9e9e",
                        },
                        "& .Mui-selected": {
                            color: "#000",
                        },
                    }}
                >
                    {TAB_LIST.map((t) => (
                        <Tab key={t.key} label={t.label} />
                    ))}
                </Tabs>

                {/* ---------- Gender filter ---------- */}
                <Stack
                    direction="row"
                    spacing={6}
                    justifyContent="center"
                    mt={6}
                >
                    {(["all", "men", "women"] as Gender[]).map((g) => (
                        <Typography
                            key={g}
                            onClick={() => setGender(g)}
                            sx={{
                                cursor: "pointer",
                                textTransform: "uppercase",
                                fontSize: 13,
                                letterSpacing: 2,
                                color:
                                    gender === g
                                        ? "#0288d1"
                                        : "#9e9e9e",
                                "&:hover": { color: "#000" },
                            }}
                        >
                            {g}
                        </Typography>
                    ))}
                </Stack>

                {/* ---------- Items ---------- */}
                <Box
                    mt={14}
                    display="grid"
                    gridTemplateColumns={{
                        xs: "1fr",
                        md: "repeat(3, 1fr)",
                    }}
                    columnGap={12}
                >
                    {ITEMS.map((item) => (
                        <Box
                            key={item.id}
                            textAlign="center"
                            position="relative"
                        >
                            {/* Crown */}
                            <Box
                                position="absolute"
                                top={-48}
                                left="50%"
                                sx={{ transform: "translateX(-50%)" }}
                            >
                                <EmojiEventsIcon
                                    sx={{
                                        fontSize: 30,
                                        color:
                                            item.rank === 1
                                                ? "#fbc02d"
                                                : item.rank === 2
                                                    ? "#9e9e9e"
                                                    : "#c49000",
                                    }}
                                />
                                <Typography
                                    fontSize={12}
                                    color="text.secondary"
                                >
                                    {item.rank}
                                </Typography>
                            </Box>

                            {/* Image */}
                            <Box
                                component="img"
                                src={item.image}
                                alt={item.name}
                                sx={{
                                    height: 120,
                                    objectFit: "contain",
                                    mx: "auto",
                                }}
                            />

                            {/* Info */}
                            <Box mt={6}>
                                <Typography
                                    fontSize={12}
                                    color="text.secondary"
                                    letterSpacing={1}
                                >
                                    {item.code}
                                </Typography>

                                <Typography
                                    mt={1}
                                    fontSize={14}
                                    letterSpacing={1}
                                >
                                    {item.name}
                                </Typography>

                                <Typography
                                    mt={0.5}
                                    fontSize={14}
                                    color="text.secondary"
                                >
                                    {item.price}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>

                {/* ---------- Button ---------- */}
                <Box mt={14} textAlign="center">
                    <Button
                        variant="outlined"
                        sx={{
                            px: 6,
                            py: 1.5,
                            borderColor: "#000",
                            color: "#000",
                            letterSpacing: 2,
                            "&:hover": {
                                backgroundColor: "#000",
                                color: "#fff",
                            },
                        }}
                    >
                        See Bestseller Ranking
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
