import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type React from 'react';
import { ArrowRight } from 'lucide-react';
import { useAnnouncements, type Announcement } from '../../hooks/useAnnouncements';

const MAX_REPEAT = 12;
const PIXELS_PER_SECOND = 90;

/**
 * A continuous, edge-to-edge scrolling strip of admin-managed announcements,
 * pinned above the navbar. It measures its own height into `--ticker-h` so
 * the navbar and page content shift down to make room (see index.css and
 * Navbar's `top` style).
 *
 * With only one or two short announcements, one lap of the content can be
 * narrower than the screen — repeating the list a handful of times inside
 * each track keeps text flowing across the *entire* width the whole time,
 * instead of a short strip drifting back and forth near the left edge with
 * dead space on the right.
 */
const AnnouncementTicker = () => {
  const { data: announcements } = useAnnouncements();
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [repeat, setRepeat] = useState(1);
  const [duration, setDuration] = useState(30);
  const hasItems = Boolean(announcements && announcements.length > 0);

  useEffect(() => {
    const height = hasItems ? rootRef.current?.offsetHeight ?? 36 : 0;
    document.documentElement.style.setProperty('--ticker-h', `${height}px`);
    return () => {
      document.documentElement.style.setProperty('--ticker-h', '0px');
    };
  }, [hasItems]);

  // Grow the repeat count until one lap is at least as wide as the viewport,
  // then fix the animation's speed to that width so longer lists don't
  // suddenly race by and short ones don't crawl.
  useLayoutEffect(() => {
    if (!hasItems) return;
    setRepeat(1);
  }, [hasItems, announcements?.length]);

  useLayoutEffect(() => {
    if (!hasItems) return;
    const width = trackRef.current?.scrollWidth ?? 0;
    if (width === 0) return;
    if (width < window.innerWidth && repeat < MAX_REPEAT) {
      setRepeat((r) => r + 1);
      return;
    }
    setDuration(Math.max(12, width / PIXELS_PER_SECOND));
  }, [hasItems, repeat, announcements?.length]);

  if (!hasItems) return null;

  const items = announcements!;
  const lap: Announcement[] = Array.from({ length: repeat }, () => items).flat();

  // Rendered twice back-to-back so the CSS animation can loop seamlessly —
  // when the first lap scrolls fully off, the identical second lap is
  // already in that exact position, so the wrap-around is invisible.
  const track = (key: string, ref?: React.Ref<HTMLDivElement>) => (
    <div ref={ref} key={key} className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={key === 'copy'}>
      {lap.map((a, i) => {
        const content = (
          <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium text-white">
            {a.tag && (
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                {a.tag}
              </span>
            )}
            {a.message}
            {a.link && <ArrowRight size={14} className="shrink-0" />}
          </span>
        );
        return (
          <span key={`${key}-${a.id}-${i}`} className="inline-flex items-center">
            {a.link ? (
              <a href={a.link} className="transition-opacity hover:opacity-80">
                {content}
              </a>
            ) : (
              content
            )}
            <span className="ml-10 h-1 w-1 rounded-full bg-white/30" />
          </span>
        );
      })}
    </div>
  );

  return (
    <div
      ref={rootRef}
      role="marquee"
      aria-label="Announcements and offers"
      className="fixed inset-x-0 top-0 z-[60] overflow-hidden bg-accent py-2"
    >
      <div className="ticker-viewport flex w-max" style={{ animationDuration: `${duration}s` }}>
        {track('main', trackRef)}
        {track('copy')}
      </div>
    </div>
  );
};

export default AnnouncementTicker;
