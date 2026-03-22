import { toast } from "react-toastify";
import { store } from "../stores/store";

let sessionExpiredToastVisible = false;

function clearSessionExpiredUi() {
    store.uiStore.clearSessionExpiredBanner();
}

/**
 * Shown when API returns 401 but the client previously had a logged-in user (e.g. cookie expired).
 * Click navigates to login; dynamic import avoids circular deps (agent → Routes → … → agent).
 */
export function showSessionExpiredToast(): void {
    if (sessionExpiredToastVisible) return;
    sessionExpiredToastVisible = true;
    store.uiStore.setSessionExpiredBanner(true);
    store.uiStore.closeUserMenu();
    store.uiStore.closeCart();

    const id = toast.warning(
        "Phiên đăng nhập đã hết hạn. Nhấn vào đây để đăng nhập lại.",
        {
            autoClose: 15000,
            closeOnClick: true,
            pauseOnHover: true,
            onClick: () => {
                void (async () => {
                    sessionExpiredToastVisible = false;
                    clearSessionExpiredUi();
                    toast.dismiss(id);
                    const { router } = await import("../../app/router/Routes");
                    router.navigate("/login");
                })();
            },
            onClose: () => {
                sessionExpiredToastVisible = false;
            },
        }
    );
}
