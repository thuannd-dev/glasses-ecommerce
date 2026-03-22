import type { ProfilePhotoDto } from "../types/user";

function photoSrc(photo: ProfilePhotoDto): string {
  return photo.url ?? photo.imageUrl ?? "";
}

function stripUrlQuery(u: string): string {
  return u.trim().split("?")[0].replace(/\/+$/, "").toLowerCase();
}

function urlsMatchAvatar(photoUrl: string, profileImageUrl: string): boolean {
  if (!photoUrl || !profileImageUrl) return false;
  if (photoUrl === profileImageUrl) return true;
  if (stripUrlQuery(photoUrl) === stripUrlQuery(profileImageUrl)) return true;
  const last = (s: string) => stripUrlQuery(s).split("/").pop() ?? "";
  const a = last(photoUrl);
  const b = last(profileImageUrl);
  return a.length > 3 && b.length > 3 && a === b;
}

/**
 * Domain.Photo has no isMain — match profile/user imageUrl, single photo, or optional isMain from API.
 */
export function resolveMainPhotoFromList(
  list: ProfilePhotoDto[],
  profileImageUrl: string | null | undefined,
): ProfilePhotoDto | null {
  if (!list.length) return null;
  const flagged = list.find((p) => p.isMain);
  if (flagged) return flagged;
  if (list.length === 1) return list[0];
  const img = profileImageUrl?.trim();
  if (img) {
    const exact = list.find((p) => photoSrc(p) === img);
    if (exact) return exact;
    const loose = list.find((p) => urlsMatchAvatar(photoSrc(p), img));
    if (loose) return loose;
    for (const p of list) {
      const pid = p.publicId?.trim();
      if (pid && img.includes(pid)) return p;
    }
  }
  return null;
}

/**
 * Navbar / profile: show image only when GET photos has rows; empty list → undefined (initials).
 */
export function avatarImageSrcFromPhotos(
  photos: ProfilePhotoDto[] | undefined | null,
  profileOrUserImageUrl?: string | null,
): string | undefined {
  const list = Array.isArray(photos) ? photos : [];
  if (list.length === 0) return undefined;
  const picked =
    resolveMainPhotoFromList(list, profileOrUserImageUrl) ?? list[0];
  const u = photoSrc(picked).trim();
  return u || undefined;
}
