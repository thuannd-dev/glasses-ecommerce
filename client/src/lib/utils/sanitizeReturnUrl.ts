/**
 * Chỉ cho phép đường dẫn nội bộ (cùng origin) — tránh open redirect.
 * Trả về pathname + search + hash, hoặc null.
 */
export function sanitizeReturnUrl(raw: string | null | undefined): string | null {
  if (raw == null || typeof raw !== "string") return null;
  let s = raw.trim();
  if (!s) return null;
  try {
    s = decodeURIComponent(s);
  } catch {
    return null;
  }
  if (!s.startsWith("/")) return null;
  if (s.startsWith("//")) return null;
  if (s.includes("://")) return null;

  let pathname = "";
  let search = "";
  let hash = "";
  try {
    const base = "http://_";
    const u = new URL(s, base);
    pathname = u.pathname;
    search = u.search;
    hash = u.hash;
  } catch {
    return null;
  }

  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/auth/redirect"
  ) {
    return null;
  }

  return `${pathname}${search}${hash}`;
}

export function buildAuthRedirectPath(returnUrl: string | null | undefined): string {
  const safe = sanitizeReturnUrl(returnUrl ?? null);
  if (safe) return `/auth/redirect?returnUrl=${encodeURIComponent(safe)}`;
  return "/auth/redirect";
}
