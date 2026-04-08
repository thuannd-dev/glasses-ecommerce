/**
 * Prescription upload URLs must be Cloudinary — mirrors
 * Application.Orders.Validators.CheckoutValidator (BeValidHttpUrl + BeFromCloudinary),
 * plus path must use this app's cloud name (not arbitrary Cloudinary tenants).
 */
const CLOUDINARY_DOMAIN = "res.cloudinary.com";
const MAX_URL_LENGTH = 2048;
/** Default matches URLs used across the storefront; override via VITE_CLOUDINARY_CLOUD_NAME. */
const DEFAULT_CLOUDINARY_CLOUD_NAME = "ds0b8jtbr";

function expectedCloudinaryCloudName(): string {
  const raw =
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? DEFAULT_CLOUDINARY_CLOUD_NAME;
  return String(raw).trim();
}

export function getTrustedPrescriptionImageUrl(
  url: string | null | undefined
): string | null {
  if (url == null || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed.length > MAX_URL_LENGTH) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;

  const host = parsed.hostname.toLowerCase();
  if (
    host !== CLOUDINARY_DOMAIN &&
    !host.endsWith(`.${CLOUDINARY_DOMAIN}`)
  ) {
    return null;
  }

  const cloudName = expectedCloudinaryCloudName();
  if (!cloudName) return null;

  const firstSegment = parsed.pathname.split("/").filter(Boolean)[0] ?? "";
  if (firstSegment.toLowerCase() !== cloudName.toLowerCase()) {
    return null;
  }

  return parsed.href;
}
