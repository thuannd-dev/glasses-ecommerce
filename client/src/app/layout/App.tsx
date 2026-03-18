import { Box, Container, CssBaseline } from "@mui/material";
import NavBar from "./NavBar";
import DashboardLayout from "./DashboardLayout";
import { Outlet, ScrollRestoration, useLocation } from "react-router";
import CollectionLandingPage from "../../features/collections/CollectionLandingPage";
import Footer from "./Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";
import ChatbotWidget from "../../features/chatbot/ChatbotWidget";
import { useEffect, useState } from "react";

function App() {
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isCollectionsLanding = location.pathname === "/collections";
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
        <>
          <NavBar appearance="hero" showSearch={false} />
          <CollectionLandingPage />
          <Footer />
          <ScrollToTopButton />
          <ChatbotWidget />
        </>
      ) : isDashboard ? (
        <DashboardLayout />
      ) : (
        <>
          <NavBar
            appearance={isCollectionsLanding ? "hero" : undefined}
            showSearch={isCollectionsLanding ? false : true}
          />
          <Container maxWidth="xl" sx={{ mt: isCollectionsLanding ? 0 : 3 }}>
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
