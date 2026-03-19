import { Box } from "@mui/material";
import HeroSection from "./components/CollectionLandingComponents/HeroSection";
import CategoryCards from "./components/CollectionLandingComponents/CategoryCards";
import AboutStory from "./components/CollectionLandingComponents/AboutStory";
import PolicySection from "./components/CollectionLandingComponents/PolicySection";
import ItemTopSeller from "./components/CollectionLandingComponents/ItemTopSeller";
export default function CollectionLandingPage() {
    return (
        <Box>
            <Box id="home-hero-flow">
                <Box id="home-hero">
                    <HeroSection />
                </Box>
                <Box id="home-categories" sx={{ scrollMarginTop: 72, pt: 0 }}>
                    <CategoryCards />
                </Box>
            </Box>
            <Box id="home-top-seller">
                <ItemTopSeller />
            </Box>
            <Box id="home-about">
                <AboutStory />
            </Box>
            <Box id="home-services">
                <PolicySection />
            </Box>
        </Box>
    );
}
