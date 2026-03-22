import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { useAccount } from "./useAccount";
import type { SignInForCartDialogProps } from "../types/signInForCartDialog";

/** Treat missing id as anonymous even if API returned an empty object. */
function hasAuthenticatedUser(
    user: { id?: string } | null | undefined
): user is { id: string } {
    return Boolean(user?.id);
}

export type CartAuthGateApi = {
    signInForCartDialogProps: SignInForCartDialogProps;
    runWithAuth: (fn: () => void) => void;
    /** `true` if `fn` ran; `false` if blocked (session resolving or sign-in dialog shown). */
    runWithAuthAsync: (fn: () => Promise<void>) => Promise<boolean>;
};

/**
 * Blocks cart-related actions when there is no logged-in user (same source as useCart: useAccount / ["user"]).
 * While the first user snapshot is loading (no user in cache yet), show a short toast instead of failing silently.
 */
export function useRequireAuthForCart(): CartAuthGateApi {
    const { currentUser, userSessionPending, userSessionFetching } = useAccount();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const close = useCallback(() => setOpen(false), []);

    const onLogin = useCallback(() => {
        navigate("/login");
        setOpen(false);
    }, [navigate]);

    const onRegister = useCallback(() => {
        navigate("/register");
        setOpen(false);
    }, [navigate]);

    const signInForCartDialogProps = useMemo<SignInForCartDialogProps>(
        () => ({
            open,
            onClose: close,
            onLogin,
            onRegister,
        }),
        [open, close, onLogin, onRegister]
    );

    const sessionStillResolving =
        !hasAuthenticatedUser(currentUser) && (userSessionPending || userSessionFetching);

    const runWithAuth = useCallback(
        (fn: () => void) => {
            if (sessionStillResolving) {
                toast.info("Checking your session…");
                return;
            }
            if (!hasAuthenticatedUser(currentUser)) {
                setOpen(true);
                return;
            }
            fn();
        },
        [currentUser, sessionStillResolving]
    );

    const runWithAuthAsync = useCallback(
        async (fn: () => Promise<void>): Promise<boolean> => {
            if (sessionStillResolving) {
                toast.info("Checking your session…");
                return false;
            }
            if (!hasAuthenticatedUser(currentUser)) {
                setOpen(true);
                return false;
            }
            await fn();
            return true;
        },
        [currentUser, sessionStillResolving]
    );

    return {
        signInForCartDialogProps,
        runWithAuth,
        runWithAuthAsync,
    };
}
