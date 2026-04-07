/**
 * Prescription upload URLs must be Cloudinary — mirrors
 * Application.Orders.Validators.CheckoutValidator (BeValidHttpUrl + BeFromCloudinary).
 */
const CLOUDINARY_DOMAIN = "res.cloudinary.com";
const MAX_URL_LENGTH = 2048;

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

  return parsed.href;
}
