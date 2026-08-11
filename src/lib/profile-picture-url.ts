/** Path returned by the API for stored profile pictures (streamed via API proxy). */
export const PROFILE_PICTURE_CONTENT_PATH = '/users/me/profile-picture/content';

export function isProfilePictureContentUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes(PROFILE_PICTURE_CONTENT_PATH);
}

/** Append or replace cache-bust query param (used after upload). */
export function withProfilePictureCacheBust(url: string, version?: number): string {
  const v = version ?? Date.now();
  const base = url.split('?')[0];
  return `${base}?v=${v}`;
}

/** Resolve a profile picture URL for authenticated blob fetch (relative or absolute). */
export function resolveProfilePictureFetchPath(url: string): string {
  const marker = PROFILE_PICTURE_CONTENT_PATH;
  const idx = url.indexOf(marker);
  if (idx >= 0) {
    return url.slice(idx);
  }
  return url;
}
