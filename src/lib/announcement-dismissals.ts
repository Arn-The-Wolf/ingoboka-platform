const DISMISSED_KEY = 'ingoboka-dismissed-announcements';

export function getDismissedAnnouncementIds(): Set<string> {
  if (typeof localStorage === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function dismissAnnouncement(id: string) {
  if (typeof localStorage === 'undefined') return;
  const ids = getDismissedAnnouncementIds();
  ids.add(id);
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(ids)));
}
