const STORAGE_PREFIX = "cerebiia-welcome-tour-seen";

export function getWelcomeTourStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}:${userId}`;
}

export function hasSeenWelcomeTour(userId?: string | null): boolean {
  if (!userId || typeof window === "undefined") return true;
  try {
    return localStorage.getItem(getWelcomeTourStorageKey(userId)) === "1";
  } catch {
    return true;
  }
}

export function markWelcomeTourSeen(userId?: string | null): void {
  if (!userId || typeof window === "undefined") return;
  try {
    localStorage.setItem(getWelcomeTourStorageKey(userId), "1");
  } catch {
    // ignore quota / private mode
  }
}
