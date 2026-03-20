import { Box, Container, CssBaseline } from "@mui/material";
import NavBar from "./NavBar";
import DashboardLayout from "./DashboardLayout";
import { Outlet, ScrollRestoration, useLocation } from "react-router";
import CollectionLandingPage from "../../features/collections/CollectionLandingPage";
import Footer from "./Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";
import ChatbotWidget from "../../features/chatbot/ChatbotWidget";
import { useEffect, useRef, useState } from "react";
import agent from "../../lib/api/agent";

function App() {
  const location = useLocation();
  const [isChatbotEnabled, setIsChatbotEnabled] = useState(true);

  // Check feature toggle for chatbot on mount
  useEffect(() => {
    const checkChatbotToggle = async () => {
      try {
        const response = await agent.get<boolean>(
          "/feature-toggles/check/Chatbot"
        );
        setIsChatbotEnabled(response.data);
      } catch {
        setIsChatbotEnabled(true); // Fail-open: show feature by default
      }
    };

    checkChatbotToggle();
  }, []);

  const isHome = location.pathname === "/";
  const isCollectionsPage = location.pathname.startsWith("/collections");
  const isDashboard = ["/sales", "/operations", "/manager", "/admin"].some((p) =>
    location.pathname.startsWith(p),
  );

  const [navCollapsed, setNavCollapsed] = useState(false);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    if (isDashboard) {
      setNavCollapsed(false);
      return;
    }

    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId != null) return;
      rafId = window.requestAnimationFrame(() => {
        const currentY = window.scrollY ?? 0;
        const lastY = lastScrollYRef.current ?? 0;

        const goingDown = currentY > lastY + 8;
        const goingUp = currentY < lastY - 8;

        if (currentY < 50) {
          setNavCollapsed(false);
        } else if (goingDown) {
          setNavCollapsed(true);
        } else if (goingUp) {
          setNavCollapsed(false);
        }

        lastScrollYRef.current = currentY;
        rafId = null;
      });
    };

    lastScrollYRef.current = window.scrollY ?? 0;
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId != null) window.cancelAnimationFrame(rafId);
    };
  }, [isDashboard]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg,#FFFFFF 0%,#FAFAF5 100%)",
      }}
    >
      <ScrollRestoration />
      <CssBaseline /> {/*Reset Css*/}

      {isHome ? (
        <>
          <NavBar appearance="hero" collapsed={navCollapsed} />
          <Box component="main" sx={{ flex: 1 }}>
            <CollectionLandingPage />
          </Box>
          <Box sx={{ mt: "auto" }}>
            <Footer />
          </Box>
          <ScrollToTopButton />
          <ChatbotWidget />
        </>
      ) : isDashboard ? (
        <DashboardLayout />
      ) : (
        <>
          <NavBar collapsed={navCollapsed} />
          <Box component="main" sx={{ flex: 1 }}>
            <Container maxWidth="xl" sx={{ mt: isCollectionsPage ? 0 : 3 }}>
              <Outlet />
            </Container>
          </Box>
          <Box sx={{ mt: "auto" }}>
            <Footer />
          </Box>
          <ScrollToTopButton />
          {isChatbotEnabled && <ChatbotWidget />}
        </>
      )}
    </Box>
  );
}

export default App;
