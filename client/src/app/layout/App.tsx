import { Box, Container, CssBaseline } from "@mui/material";
import NavBar from "./NavBar";
import { Outlet, ScrollRestoration, useLocation } from "react-router";
import HomePage from "../../features/home/HomePage";
import Footer from "./Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";
function App() {
  const location = useLocation();
  return (
    <Box sx={{ bgcolor: "#ffffff" }} minHeight="100vh">
      <ScrollRestoration />
      <CssBaseline /> {/*Reset Css*/}
      {location.pathname === "/" ? (
        <HomePage />
      ) : (
        <>
          <NavBar />
          <Container maxWidth="xl" sx={{ mt: 3 }}>
            <Outlet />
          </Container>
          <Footer />
          <ScrollToTopButton />
        </>
      )}
    </Box>
  );
}

export default App;
