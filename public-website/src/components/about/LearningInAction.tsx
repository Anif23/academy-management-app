import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BookOpenCheck, Sparkles, Users2, Layers } from 'lucide-react';
import { useAcademyStats } from '../../hooks/useAcademyStats';

gsap.registerPlugin(ScrollTrigger);

const STAT_META = [
  { key: 'students' as const, label: 'Students Trained', icon: Users2 },
  { key: 'courses' as const, label: 'Active Courses', icon: BookOpenCheck },
  { key: 'trainers' as const, label: 'Expert Trainers', icon: Sparkles },
  { key: 'batches' as const, label: 'Batches Running', icon: Layers },
];

/**
 * A single bold, video-backed moment that pairs real usage numbers (never
 * invented — see useAcademyStats) with a glimpse of the classroom, placed
 * between Courses and Testimonials to build trust right when a visitor is
 * deciding whether to register.
 */
const LearningInAction = () => {
  const container = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoInView, setVideoInView] = useState(false);
  const { data: stats } = useAcademyStats();

  // Only load/play the video once it's actually about to be visible —
  // keeps initial page weight and battery use down on a scroll-heavy page.
  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVideoInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = videoRef.current;
    if (!node || !videoInView) return;
    node.play().catch(() => {
      /* Autoplay can be blocked by the browser — the poster image still shows, which is fine. */
    });
  }, [videoInView]);

  useGSAP(
    () => {
      const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mql.matches || !container.current?.querySelector('.lia-media')) return;

      gsap.fromTo(
        '.lia-media',
        { scale: 1.15, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: container.current, start: 'top 80%' },
        },
      );

      gsap.fromTo(
        '.lia-copy > *',
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: { trigger: container.current, start: 'top 75%' },
        },
      );

      // Count-up on the real stats, triggered once as the band scrolls in.
      gsap.utils.toArray<HTMLElement>('.lia-stat-value').forEach((el) => {
        const target = Number(el.dataset.value || 0);
        if (!target) return;
        const counter = { value: 0 };
        gsap.to(counter, {
          value: target,
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onUpdate: () => {
            el.textContent = `${Math.round(counter.value)}+`;
          },
        });
      });
    },
    { scope: container, dependencies: [stats] },
  );

  return (
    <section ref={container} className="relative overflow-hidden bg-slate-900 py-24 sm:py-28">
      <div className="grid items-center gap-14 px-4 sm:px-10 lg:grid-cols-2 lg:gap-20">
        <div className="lia-media relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl lg:aspect-square">
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="none"
            poster="https://images.pexels.com/videos/8342354/books-children-class-classes-8342354.jpeg?auto=compress&cs=tinysrgb&w=900"
            className="h-full w-full object-cover"
          >
            {videoInView && (
              <source
                src="https://videos.pexels.com/video-files/8342354/8342354-uhd_2560_1440_25fps.mp4"
                type="video/mp4"
              />
            )}
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
        </div>

        <div className="lia-copy">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
            Real classrooms, real outcomes
          </span>
          <h2 className="mt-4 text-4xl font-bold leading-tight text-white lg:text-5xl">
            Learning that looks like <span className="text-gradient">this every day.</span>
          </h2>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-slate-300">
            No stock-photo promises. Every trainer, batch and student below is tracked in our own systems, updated the moment a new student joins.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-6">
            {STAT_META.map(({ key, label, icon: Icon }) => (
              <div key={key} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <Icon className="h-5 w-5 text-accent" />
                <p className="lia-stat-value mt-3 text-3xl font-extrabold text-white" data-value={stats?.[key] ?? 0}>
                  0+
                </p>
                <p className="mt-1 text-sm text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LearningInAction;
