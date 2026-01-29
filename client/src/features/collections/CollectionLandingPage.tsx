import { Box } from "@mui/material";
import HeroSection from "./components/CollectionLandingComponents/HeroSection";
import CategoryCards from "./components/CollectionLandingComponents/CategoryCards";
import ServicesSection from "./components/CollectionLandingComponents/ServicesSection";
import ItemTopSeller from "./components/CollectionLandingComponents/ItemTopSeller";
export default function CollectionLandingPage() {
    return (
        <Box>
            <HeroSection />
            <CategoryCards />
            <ItemTopSeller />
            <ServicesSection />
        </Box>
    );
}
