import { Box, Container, CssBaseline } from "@mui/material";
import NavBar from "./NavBar";
import DashboardLayout from "./DashboardLayout";
import { Outlet, ScrollRestoration, useLocation } from "react-router";
import HomePage from "../../features/home/HomePage";
import Footer from "./Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";
import ChatbotWidget from "../../features/chatbot/ChatbotWidget";

function App() {
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isDashboard = ["/sales", "/operations", "/manager", "/admin"].some((p) =>
    location.pathname.startsWith(p),
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#FFFFFF 0%,#FAFAF5 100%)",
      }}
    >
      <ScrollRestoration />
      <CssBaseline /> {/*Reset Css*/}

      {isHome ? (
        <HomePage />
      ) : isDashboard ? (
        <DashboardLayout />
      ) : (
        <>
          <NavBar />
          <Container maxWidth="xl" sx={{ mt: 3 }}>
            <Outlet />
          </Container>
          <Footer />
          <ScrollToTopButton />
          <ChatbotWidget />
        </>
      )}
    </Box>
  );
}

export default App;
