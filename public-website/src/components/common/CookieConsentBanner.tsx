import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';
import { DEFAULT_CONSENT, getStoredConsent, saveConsent, type CookieConsent } from '../../utils/cookieConsent';

/**
 * Shown on first visit (no stored choice yet) and re-openable any time via
 * the "Manage cookie preferences" link in the footer. No cookies beyond
 * strictly-necessary ones are set until the visitor actively chooses.
 */
const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);
  const [managing, setManaging] = useState(false);
  const [draft, setDraft] = useState<CookieConsent>(DEFAULT_CONSENT);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) setVisible(true);
    else setDraft(stored);

    const openManage = () => {
      setDraft(getStoredConsent() ?? DEFAULT_CONSENT);
      setManaging(true);
      setVisible(true);
    };
    window.addEventListener('open-cookie-preferences', openManage);
    return () => window.removeEventListener('open-cookie-preferences', openManage);
  }, []);

  if (!visible) return null;

  const acceptAll = () => {
    saveConsent({ functional: true, analytics: true });
    setVisible(false);
    setManaging(false);
  };

  const rejectNonEssential = () => {
    saveConsent({ functional: false, analytics: false });
    setVisible(false);
    setManaging(false);
  };

  const saveChoices = () => {
    saveConsent({ functional: draft.functional, analytics: draft.analytics });
    setVisible(false);
    setManaging(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie preferences"
      className="fixed inset-x-0 bottom-0 z-[70] border-t border-slate-200 bg-white/95 p-5 shadow-2xl backdrop-blur sm:p-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
          <div className="text-sm text-secondary">
            <p className="font-semibold text-primary">We use cookies</p>
            <p className="mt-1 leading-relaxed">
              We use strictly-necessary cookies to run this site, and — only if you allow it — functional cookies
              for embedded content like the map on our Contact section. See our{' '}
              <Link to="/cookie-policy" className="font-medium text-accent underline underline-offset-2">
                Cookie Policy
              </Link>{' '}
              and{' '}
              <Link to="/privacy-policy" className="font-medium text-accent underline underline-offset-2">
                Privacy Policy
              </Link>{' '}
              for details.
            </p>
          </div>
        </div>

        {managing && (
          <div className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2">
            <div className="flex items-start justify-between gap-3 rounded-lg bg-white p-3">
              <div>
                <p className="text-sm font-semibold text-primary">Strictly necessary</p>
                <p className="text-xs text-secondary">Required for the site to function. Always on.</p>
              </div>
              <input type="checkbox" checked disabled aria-label="Strictly necessary cookies (always on)" className="mt-1 h-4 w-4" />
            </div>
            <div className="flex items-start justify-between gap-3 rounded-lg bg-white p-3">
              <div>
                <p className="text-sm font-semibold text-primary">Functional (maps & embeds)</p>
                <p className="text-xs text-secondary">Lets us show the embedded Google Map on the Contact page.</p>
              </div>
              <input
                type="checkbox"
                checked={draft.functional}
                onChange={(e) => setDraft((d) => ({ ...d, functional: e.target.checked }))}
                aria-label="Functional cookies"
                className="mt-1 h-4 w-4"
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3">
          {!managing && (
            <button
              type="button"
              onClick={() => setManaging(true)}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-secondary hover:text-primary"
            >
              Manage preferences
            </button>
          )}
          <button
            type="button"
            onClick={rejectNonEssential}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-primary hover:bg-slate-50"
          >
            Reject non-essential
          </button>
          {managing ? (
            <button
              type="button"
              onClick={saveChoices}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Save preferences
            </button>
          ) : (
            <button
              type="button"
              onClick={acceptAll}
              className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
            >
              Accept all
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
