import { useEffect, useRef, useState } from 'react';
import { Quote, Sparkles } from 'lucide-react';

interface Slide {
  quote: string;
  author: string;
  role: string;
}

// Short (under-15-word), widely attributed quotes — one per source, kept
// brief per copyright practice. Genuinely different people, not invented.
const SLIDES: Slide[] = [
  {
    quote: 'The beautiful thing about learning is nobody can take it away from you.',
    author: 'B.B. King',
    role: 'Musician',
  },
  {
    quote: 'Education is the most powerful weapon which you can use to change the world.',
    author: 'Nelson Mandela',
    role: 'Former President of South Africa',
  },
  {
    quote: 'The expert in anything was once a beginner.',
    author: 'Helen Hayes',
    role: 'Actress',
  },
  {
    quote: 'Skill is only developed by hours and hours of work.',
    author: 'Usain Bolt',
    role: 'Olympic Sprinter',
  },
  {
    quote: 'Practical knowledge beats theory the moment you sit down to build something real.',
    author: 'Academy Faculty',
    role: 'Training Philosophy',
  },
];

const AUTO_ADVANCE_MS = 5500;

const InspirationSlider = () => {
  const [index, setIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // A single self-scheduling timeout (not setInterval) that always reads
  // the *current* index via the effect's own closure and re-arms itself
  // after each advance. This avoids two real-world failure modes with a
  // long-lived setInterval: (1) background/inactive browser tabs throttle
  // or fully suspend interval timers, so a stale interval can silently
  // stop firing until the tab regains focus, and (2) any interaction that
  // changes `index` elsewhere (the dot buttons) would otherwise leave the
  // old interval running on its own drifted schedule. Re-deriving the
  // timeout from `index` itself sidesteps both.
  useEffect(() => {
    if (prefersReducedMotion.current || focused) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [index, focused, resetKey]);

  // Also resync immediately if the tab was backgrounded and comes back,
  // rather than waiting on a timer that may have been suspended mid-count.
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === 'visible') setResetKey((k) => k + 1);
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return (
    <section
      className="py-20 bg-gradient-to-br from-slate-900 via-accent-dark/30 to-slate-900 relative overflow-hidden"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      aria-roledescription="carousel"
      aria-label="Words on learning"
    >
      {/* Ambient glow — purely decorative */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 text-center relative">
        <div className="inline-flex items-center gap-2 badge-gradient px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-8">
          <Sparkles size={14} />
          Words on Learning
        </div>

        <div className="relative min-h-[160px] flex items-center justify-center">
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              aria-hidden={i !== index}
              className={`absolute inset-0 flex flex-col items-center justify-center gap-6 transition-all duration-700 ease-out ${
                i === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
              }`}
            >
              <Quote className="text-accent/50" size={32} />
              <p className="text-2xl sm:text-3xl font-bold text-white leading-snug">
                "{slide.quote}"
              </p>
              <p className="text-sm text-slate-400">
                <span className="text-white font-semibold">{slide.author}</span> - {slide.role}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mt-10">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show quote ${i + 1} of ${SLIDES.length}`}
              aria-current={i === index}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? 'w-8 bg-accent' : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default InspirationSlider;
