const STORAGE_KEY = 'academy-cookie-consent-v1';

export interface CookieConsent {
  /** Strictly necessary (session, security) — always on, not user-configurable. */
  necessary: true;
  /** Third-party embeds that set their own cookies, e.g. the Google Maps embed. */
  functional: boolean;
  /** Analytics/tracking. Nothing is wired up today, but the toggle exists so
      turning analytics on later doesn't silently start tracking existing visitors. */
  analytics: boolean;
}

export const DEFAULT_CONSENT: CookieConsent = { necessary: true, functional: false, analytics: false };

export function getStoredConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { necessary: true, functional: Boolean(parsed.functional), analytics: Boolean(parsed.analytics) };
  } catch {
    return null;
  }
}

export function saveConsent(consent: Omit<CookieConsent, 'necessary'>): void {
  const value: CookieConsent = { necessary: true, ...consent };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage unavailable (private browsing, etc.) — consent just won't persist across visits.
  }
  window.dispatchEvent(new CustomEvent('cookie-consent-changed', { detail: value }));
}
