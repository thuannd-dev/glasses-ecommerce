import { Portal, Box, Typography } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";

type ScrollTarget = Window | HTMLElement;

function getScrollTop(target: ScrollTarget) {
    if (target instanceof Window) return window.scrollY;
    return target.scrollTop;
}

function scrollToTop(target: ScrollTarget) {
    if (target instanceof Window) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
    }
    target.scrollTo({ top: 0, behavior: "smooth" });
}

export default function ScrollToTopButton() {
    const location = useLocation();
    const isHome = location.pathname === "/";
    const [show, setShow] = useState(false);

    // Nếu web bạn có div scroll riêng, đặt id nó ở đây
    // Nếu không có, nó tự fallback về window
    const target: ScrollTarget = useMemo(() => {
        const el = document.getElementById("app-scroll");
        return el ?? window;
    }, []);

    useEffect(() => {
        // Home thì luôn ẩn
        if (isHome) {
            setShow(false);
            return;
        }

        const onScroll = () => {
            setShow(getScrollTop(target) > 80); // ngưỡng nhỏ để dễ thấy
        };

        target.addEventListener("scroll", onScroll, { passive: true } as AddEventListenerOptions);
        onScroll();

        return () => target.removeEventListener("scroll", onScroll as EventListener);
    }, [isHome, target]);

    // Không render UI ở homepage (nhưng hooks vẫn đã chạy đúng thứ tự)
    if (isHome) return null;

    return (
        <Portal>
            <Box
                onClick={() => scrollToTop(target)}
                sx={{
                    position: "fixed",
                    inset: "auto 24px 24px auto",
                    zIndex: 20000,

                    cursor: "pointer",
                    userSelect: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",

                    color: "#6B7280",
                    opacity: show ? 1 : 0,
                    pointerEvents: show ? "auto" : "none",
                    transform: show ? "translateY(0)" : "translateY(40px)",
                    transition: "all .35s ease",

                    "&:hover": { color: "#111827", transform: "translateY(-4px)" },
                }}
            >
                <KeyboardArrowUpIcon />
                <Typography sx={{ fontSize: "0.75rem", letterSpacing: "0.12em" }}>
                    TOP
                </Typography>
            </Box>
        </Portal>
    );
}
