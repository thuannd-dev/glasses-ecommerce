import { Box, Container, CssBaseline } from "@mui/material";
import NavBar from "./NavBar";
import DashboardLayout from "./DashboardLayout";
import { Outlet, useLocation, useNavigationType } from "react-router";
import CollectionLandingPage from "../../features/collections/CollectionLandingPage";
import Footer from "./Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";
import ChatbotWidget from "../../features/chatbot/ChatbotWidget";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import agent from "../../lib/api/agent";
import { ChatbotProvider } from "../../features/chatbot/ChatbotContext";

const CHATBOT_TOGGLE_COOLDOWN_MS = 10 * 60 * 1000;

function App() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [isChatbotEnabled, setIsChatbotEnabled] = useState(true);
  const lastChatbotToggleCheckRef = useRef(0);
  const checkingChatbotToggleRef = useRef(false);

  // Check chatbot toggle on mount + when tab becomes visible (with cooldown).
  useEffect(() => {
    const checkChatbotToggle = async (force = false) => {
      if (checkingChatbotToggleRef.current) return;
      const now = Date.now();
      if (!force && now - lastChatbotToggleCheckRef.current < CHATBOT_TOGGLE_COOLDOWN_MS) {
        return;
      }

      checkingChatbotToggleRef.current = true;
      try {
        const response = await agent.get<boolean>(
          "/feature-toggles/check/Chatbot"
        );
        setIsChatbotEnabled(response.data);
      } catch {
        setIsChatbotEnabled(true); // Fail-open: show feature by default
      } finally {
        lastChatbotToggleCheckRef.current = now;
        checkingChatbotToggleRef.current = false;
      }
    };

    void checkChatbotToggle(true);

    // Also check when window regains focus (user returns from other app/tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void checkChatbotToggle();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const isHome = location.pathname === "/";
  const isCollectionsPage = location.pathname.startsWith("/collections");
  const isDashboard = ["/sales", "/operations", "/manager", "/admin"].some((p) =>
    location.pathname.startsWith(p),
  );

  const [navCollapsed, setNavCollapsed] = useState(false);
  const lastScrollYRef = useRef(0);

  useLayoutEffect(() => {
    // Preserve browser/native history restoration for Back/Forward.
    if (navigationType === "POP") return;
    const forceScrollTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    forceScrollTop();
    const raf = window.requestAnimationFrame(forceScrollTop);
    const timer = window.setTimeout(forceScrollTop, 60);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [location.pathname, navigationType]);

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
    <ChatbotProvider>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(180deg,#FFFFFF 0%,#FAFAF5 100%)",
        }}
      >
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
            {isChatbotEnabled && <ChatbotWidget />}
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
    </ChatbotProvider>
  );
}

export default App;
