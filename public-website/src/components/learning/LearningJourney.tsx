import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Code2,
  FolderKanban,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import gsap from "gsap";

const steps: {
  title: string;
  desc: string;
  detail: string;
  icon: LucideIcon;
  accent: string;
}[] = [
  {
    title: "Choose Your Course",
    desc: "Explore our curated list of industry-relevant courses.",
    detail:
      "Compare skills, course outcomes, and duration to find a path that fits your goals.",
    icon: BookOpen,
    accent: "#0d9488",
  },
  {
    title: "Join Your Batch",
    desc: "Pick a timing that fits your schedule.",
    detail:
      "Choose from upcoming morning, evening, and weekend batches with clear start dates.",
    icon: CalendarDays,
    accent: "#c026d3",
  },
  {
    title: "Learn With Trainers",
    desc: "Get guidance from experienced professionals.",
    detail:
      "Learn in small, supportive classes and get direct feedback from your trainers.",
    icon: UsersRound,
    accent: "#d97706",
  },
  {
    title: "Practice Real Skills",
    desc: "Turn each new concept into hands-on practice.",
    detail:
      "Build confidence through practical exercises based on real workplace scenarios.",
    icon: Code2,
    accent: "#059669",
  },
  {
    title: "Build Projects",
    desc: "Create work you can proudly add to your portfolio.",
    detail:
      "Bring your skills together in useful projects you can share with future employers.",
    icon: FolderKanban,
    accent: "#0284c7",
  },
  {
    title: "Grow Your Career",
    desc: "Take your next step with support from our team.",
    detail:
      "Get help with your resume, interview practice, and preparing for opportunities.",
    icon: BriefcaseBusiness,
    accent: "#0891b2",
  },
];

const LearningJourney = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStep = steps[activeIndex];

  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll<HTMLElement>(
      ".learning-step-card",
    );
    if (!cards?.length) return;

    const revealedCards = new WeakSet<HTMLElement>();
    const revealCard = (card: HTMLElement) => {
      gsap.fromTo(
        card,
        { autoAlpha: 0.65, y: 38, scale: 0.98 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: "power3.out",
          overwrite: true,
        },
      );
    };
    const revealObserver = new IntersectionObserver(
      (entries) => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          revealObserver.disconnect();
          return;
        }

        entries.forEach(({ isIntersecting, target }) => {
          const card = target as HTMLElement;
          if (!isIntersecting || revealedCards.has(card)) return;
          revealedCards.add(card);
          revealCard(card);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    let frame = 0;
    const updateActiveStep = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const viewportFocus = window.innerHeight * 0.45;
        let closestIndex = 0;
        let closestDistance = Number.POSITIVE_INFINITY;

        cards.forEach((card, index) => {
          const bounds = card.getBoundingClientRect();
          const center = bounds.top + bounds.height / 2;
          const distance = Math.abs(center - viewportFocus);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        setActiveIndex((current) =>
          current === closestIndex ? current : closestIndex,
        );
      });
    };

    cards.forEach((card) => {
      revealObserver.observe(card);
    });
    window.addEventListener("scroll", updateActiveStep, { passive: true });
    window.addEventListener("resize", updateActiveStep);
    updateActiveStep();

    return () => {
      revealObserver.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateActiveStep);
      window.removeEventListener("resize", updateActiveStep);
      gsap.killTweensOf(cards);
    };
  }, []);

  return (
    <section
      id="learning"
      ref={sectionRef}
      className="bg-slate-50 px-6 py-20 sm:px-12 lg:py-28"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div
          className="lg:sticky lg:flex lg:h-[calc(100vh-10rem)] lg:max-h-[46rem] lg:flex-col lg:justify-center lg:self-start"
          style={{ top: "calc(var(--ticker-h, 0px) + 7rem)" }}
        >
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">
            A clear path forward
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            Your Path to <span className="text-gradient">Mastery</span>
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-secondary">
            We guide you from choosing a course to building the skills and
            confidence to take your next career step.
          </p>

          <div
            className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="flex items-center justify-between gap-4">
              <span
                className="text-xs font-bold uppercase tracking-[0.18em]"
                style={{ color: activeStep.accent }}
              >
                Step {String(activeIndex + 1).padStart(2, "0")}
              </span>
              <span className="text-sm font-semibold text-slate-400">
                {String(activeIndex + 1).padStart(2, "0")}{" "}
                <span className="text-slate-300">/</span>{" "}
                {String(steps.length).padStart(2, "0")}
              </span>
            </div>
            <h3 className="mt-4 text-2xl font-bold text-primary sm:text-3xl">
              {activeStep.title}
            </h3>
            <p className="mt-3 leading-relaxed text-secondary">
              {activeStep.detail}
            </p>
            <div className="mt-7 flex gap-2" aria-hidden="true">
              {steps.map((step, index) => (
                <span
                  key={step.title}
                  className="h-1.5 flex-1 rounded-full transition-colors duration-300"
                  style={{
                    backgroundColor:
                      index <= activeIndex ? activeStep.accent : "#e2e8f0",
                  }}
                />
              ))}
            </div>
          </div>

          <p className="mt-5 text-sm font-medium text-slate-400">
            Scroll to explore each step
          </p>
        </div>

        <ol className="space-y-6 lg:space-y-8">
          {steps.map(({ title, desc, icon: Icon, accent }, index) => (
            <li key={title}>
              <article
                className="learning-step-card group relative flex min-h-[19rem] items-center justify-between gap-5 overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl sm:min-h-[22rem] sm:p-9"
                style={{ borderLeftColor: accent, borderLeftWidth: "4px" }}
              >
                <div className="relative z-10 max-w-md">
                  <span
                    className="inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em]"
                    style={{ backgroundColor: `${accent}14`, color: accent }}
                  >
                    Step {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 text-2xl font-bold text-primary sm:text-3xl">
                    {title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-secondary sm:text-lg">
                    {desc}
                  </p>
                </div>

                <div
                  aria-hidden="true"
                  className="relative grid h-20 w-20 shrink-0 place-items-center rounded-[1.6rem] transition duration-500 group-hover:rotate-3 group-hover:scale-105 sm:h-28 sm:w-28"
                  style={{ backgroundColor: `${accent}12`, color: accent }}
                >
                  <div
                    className="absolute inset-2 rounded-[1.2rem] border"
                    style={{ borderColor: `${accent}24` }}
                  />
                  <Icon
                    size={38}
                    strokeWidth={1.6}
                    className="sm:hidden"
                  />
                  <Icon
                    size={52}
                    strokeWidth={1.6}
                    className="hidden sm:block"
                  />
                </div>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-16 -right-12 h-52 w-52 rounded-full blur-3xl opacity-40 transition-opacity duration-300 group-hover:opacity-70"
                  style={{ backgroundColor: `${accent}20` }}
                />
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default LearningJourney;
