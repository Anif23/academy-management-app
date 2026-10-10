import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CheckCircle2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Existing data — untouched (title/desc/icon). `detail` is additive, used
// only by the new left-side explanation panel.
const steps = [
  {
    title: "Choose Your Course",
    desc: "Explore our curated list of industry-relevant courses.",
    detail:
      "Browse every course we run, filtered by category, skill level, and duration. Each listing shows exactly what you'll build, what skills you'll leave with, and what past students went on to do — so you pick with real information, not guesswork.",
    icon: "01",
  },
  {
    title: "Join Your Batch",
    desc: "Pick a timing that fits your schedule perfectly.",
    detail:
      "Morning, evening, or weekend — see every upcoming batch for your course with its exact start date and timing before you commit. No back-and-forth with staff just to find a slot that fits your life.",
    icon: "02",
  },
  {
    title: "Learn With Trainers",
    desc: "Get mentored by experienced industry professionals.",
    detail:
      "Every trainer here has shipped real, production work in the field they teach. Classes are small enough that you're not just watching a lecture — you're getting direct feedback on your own work, live.",
    icon: "03",
  },
  {
    title: "Practice Real Skills",
    desc: "Hands-on training with real-world scenarios.",
    detail:
      "Theory alone doesn't get you hired. Every module pairs a concept with a hands-on exercise built around a real scenario you'd actually hit on the job — so what you practice is what you'll be asked to do.",
    icon: "04",
  },
  {
    title: "Build Projects",
    desc: "Create a professional portfolio with capstone projects.",
    detail:
      "By the end of the course you'll have real, working projects — not toy exercises — that you can show an interviewer, link on your resume, or demo live. That portfolio is what actually gets you past the first screen.",
    icon: "05",
  },
  {
    title: "Grow Your Career",
    desc: "Get placed in top companies with our career support.",
    detail:
      "Our support doesn't stop at graduation — resume reviews, mock interviews, and direct introductions to hiring partners looking for exactly the skills you just built.",
    icon: "06",
  },
];

// A distinct gradient per card (Tailwind classes for the cards, hex for the
// left panel's accents so both stay in the same colour family).
const CARD_THEMES = [
  { bg: "from-accent to-teal-600", accent: "#0d9488" },
  { bg: "from-fuchsia-600 to-pink-600", accent: "#c026d3" },
  { bg: "from-amber-500 to-orange-600", accent: "#f59e0b" },
  { bg: "from-emerald-600 to-teal-600", accent: "#059669" },
  { bg: "from-sky-600 to-cyan-600", accent: "#0284c7" },
  { bg: "from-cyan-600 to-blue-600", accent: "#0891b2" },
];

const DESKTOP_QUERY = "(min-width: 1024px)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

/** Pinned, scroll-scrubbed experience only on desktop without reduced-motion; everything else gets a plain list. */
function usePinnedMode() {
  const compute = () => window.matchMedia(DESKTOP_QUERY).matches && !window.matchMedia(REDUCED_QUERY).matches;
  const [pinned, setPinned] = useState(compute);
  useEffect(() => {
    const queries = [window.matchMedia(DESKTOP_QUERY), window.matchMedia(REDUCED_QUERY)];
    const update = () => setPinned(compute());
    queries.forEach((q) => q.addEventListener("change", update));
    return () => queries.forEach((q) => q.removeEventListener("change", update));
  }, []);
  return pinned;
}

/**
 * Desktop: the whole block PINS while the page scrolls. The left panel stays
 * fixed and always explains the card currently on top; scrolling brings the
 * right-hand cards in one by one (each slides up from below with a light
 * sheen, and the cards already played tuck back into a stack). A soft
 * reflection sits under every card. The left text, step counter, "steps
 * remaining" and progress bar are all driven by the same scrubbed timeline,
 * so they can never drift out of sync with the cards.
 *
 * Mobile / reduced motion: a plain vertical list, each card with its own detail.
 */
const LearningJourney = () => {
  const container = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const pinned = usePinnedMode();
  const total = steps.length;
  const active = steps[activeIndex];
  const activeTheme = CARD_THEMES[activeIndex % CARD_THEMES.length];

  useGSAP(
    () => {
      if (!pinned || !pinRef.current) return;
      const cards = gsap.utils.toArray<HTMLElement>(".jl-card", pinRef.current);
      const sheens = gsap.utils.toArray<HTMLElement>(".jl-sheen", pinRef.current);
      if (cards.length < 2) return;

      // Starting state: first card in place, the rest waiting below.
      gsap.set(cards, { transformPerspective: 1200, transformOrigin: "50% 100%" });
      cards.forEach((card, i) => {
        if (i > 0) gsap.set(card, { yPercent: 115, opacity: 0, rotateX: -14, scale: 0.96 });
      });

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top 96px",
          end: () => `+=${(cards.length - 1) * window.innerHeight * 0.85}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: { snapTo: 1 / (cards.length - 1), duration: { min: 0.2, max: 0.6 }, delay: 0.05, ease: "power1.inOut" },
          onUpdate: (self) => {
            if (barRef.current) barRef.current.style.width = `${Math.max(4, self.progress * 100)}%`;
          },
        },
        onUpdate: () => {
          const idx = Math.min(cards.length - 1, Math.max(0, Math.round(tl.time())));
          setActiveIndex((prev) => (prev === idx ? prev : idx));
        },
      });

      for (let i = 1; i < cards.length; i++) {
        const at = i - 1;
        // The new card rises into place...
        tl.to(cards[i], { yPercent: 0, opacity: 1, rotateX: 0, scale: 1, duration: 1 }, at);
        // ...with a light sheen sweeping across it...
        if (sheens[i]) tl.fromTo(sheens[i], { xPercent: -130, opacity: 0.9 }, { xPercent: 130, opacity: 0, duration: 1, ease: "none" }, at);
        // ...while every earlier card sinks one more level into the stack.
        for (let j = 0; j < i; j++) {
          const depth = i - j;
          tl.to(
            cards[j],
            { scale: Math.max(0.8, 1 - 0.06 * depth), y: -22 * depth, opacity: Math.max(0.25, 1 - 0.3 * depth), duration: 1 },
            at,
          );
        }
      }

      tlRef.current = tl;
      return () => {
        tlRef.current = null;
      };
    },
    { scope: container, dependencies: [pinned], revertOnUpdate: true },
  );

  // Fresh text fades in on the left whenever the active card changes.
  useEffect(() => {
    if (!pinned || !textRef.current) return;
    gsap.fromTo(textRef.current.children, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.06, ease: "power3.out", overwrite: true });
  }, [activeIndex, pinned]);

  function goToStep(index: number) {
    const st = tlRef.current?.scrollTrigger;
    if (!st) return;
    const y = st.start + (index / (total - 1)) * (st.end - st.start);
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  const stepsLeft = total - 1 - activeIndex;

  return (
    <section id="learning" ref={container} className="bg-white px-6 py-24 sm:px-12" style={{ overflowX: "clip" }}>
      <div className="mx-auto mb-14 max-w-3xl space-y-4 text-center">
        <h2 className="text-4xl font-bold tracking-tight text-primary lg:text-5xl">
          Your Path to <span className="text-gradient">Mastery</span>
        </h2>
        <p className="text-lg leading-relaxed text-secondary">
          We guide you from the very first step of choosing a course to landing your dream job.
        </p>
      </div>

      {pinned ? (
        <div ref={pinRef} className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-center gap-16" style={{ minHeight: "calc(100vh - 140px)" }}>
          {/* LEFT — fixed while pinned; content follows the active card. */}
          <div>
            <div className="mb-6 flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-secondary">
              <span style={{ color: activeTheme.accent }}>
                Step {String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
              <span className="h-px flex-1 bg-slate-200" />
              <span>{stepsLeft === 0 ? "Final step" : `${stepsLeft} step${stepsLeft === 1 ? "" : "s"} to go`}</span>
            </div>

            <div ref={textRef} className="min-h-[15rem]">
              <span className="block text-8xl font-black leading-none" style={{ color: activeTheme.accent, opacity: 0.22 }}>
                {active.icon}
              </span>
              <h3 className="mt-2 text-4xl font-bold text-primary">{active.title}</h3>
              <p className="mt-5 text-lg leading-relaxed text-secondary">{active.detail}</p>
            </div>

            <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                ref={barRef}
                className="h-full rounded-full transition-colors duration-500"
                style={{ width: "4%", background: activeTheme.accent }}
              />
            </div>

            <div className="mt-5 flex gap-2">
              {steps.map((step, i) => (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => goToStep(i)}
                  aria-label={`Go to step ${i + 1}: ${step.title}`}
                  className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex ? "w-10" : "w-2 bg-slate-300 hover:bg-slate-400"}`}
                  style={i === activeIndex ? { background: activeTheme.accent } : undefined}
                />
              ))}
            </div>
          </div>

          {/* RIGHT — cards come in one by one as the page scrolls. */}
          <div className="relative h-[440px]" style={{ perspective: "1200px" }}>
            {steps.map((step, index) => {
              const theme = CARD_THEMES[index % CARD_THEMES.length];
              return (
                <div key={step.title} className="jl-card absolute inset-0 will-change-transform" style={{ zIndex: index + 1 }}>
                  <div className={`relative h-full overflow-hidden rounded-3xl bg-gradient-to-br ${theme.bg} p-10 text-white shadow-2xl`}>
                    <div className="mb-8 flex items-start justify-between">
                      <span className="text-7xl font-black text-white/25">{step.icon}</span>
                      <div className="rounded-full bg-white/15 p-2">
                        <CheckCircle2 size={22} />
                      </div>
                    </div>
                    <h3 className="mb-3 text-3xl font-bold">{step.title}</h3>
                    <p className="text-lg leading-relaxed text-white/85">{step.desc}</p>
                    <div className="jl-sheen pointer-events-none absolute inset-y-0 -left-1/4 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0" />
                  </div>
                  {/* Reflection: a faded, flipped, blurred echo of the card under it. */}
                  <div
                    aria-hidden
                    className={`pointer-events-none absolute inset-x-6 top-full mt-2 h-24 -scale-y-100 rounded-3xl bg-gradient-to-br ${theme.bg} opacity-30 blur-md`}
                    style={{ WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)", maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)" }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-2xl space-y-6">
          {steps.map((step, index) => {
            const theme = CARD_THEMES[index % CARD_THEMES.length];
            return (
              <div key={step.title} className={`rounded-3xl bg-gradient-to-br ${theme.bg} p-8 text-white shadow-xl`}>
                <span className="text-6xl font-black text-white/25">{step.icon}</span>
                <h3 className="mt-2 text-2xl font-bold">{step.title}</h3>
                <p className="mt-2 text-lg text-white/90">{step.desc}</p>
                <p className="mt-4 text-base leading-relaxed text-white/80">{step.detail}</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default LearningJourney;
