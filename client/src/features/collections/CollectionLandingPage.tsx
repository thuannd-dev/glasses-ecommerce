import { Box } from "@mui/material";
import HeroSection from "./components/HeroSection";
import CategoryCards from "./components/CategoryCards";
import ServicesSection from "./components/ServicesSection";
import ItemTopSeller from "./components/ItemTopSeller";
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
