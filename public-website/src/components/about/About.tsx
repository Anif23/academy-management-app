import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAcademyInfo } from '../../hooks/useAcademyInfo';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const { data: info, isLoading } = useAcademyInfo();
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
      // While the academy info is loading the section renders a skeleton without these elements.
      if (mql.matches || !container.current?.querySelector('.about-image')) return;

      gsap.fromTo(
        '.about-image',
        { clipPath: 'inset(0 0 100% 0)', scale: 1.08 },
        {
          clipPath: 'inset(0 0 0% 0)',
          scale: 1,
          duration: 1,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: container.current, start: 'top 75%' },
        },
      );

      gsap.fromTo(
        '.about-copy > *',
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: container.current, start: 'top 70%' },
        },
      );
    },
    { scope: container, dependencies: [info] },
  );

  if (isLoading) return <div className="py-24 bg-white text-center text-secondary">Loading about info...</div>;
  if (!info) return null;

  return (
    <section id="about" ref={container} className="py-24 bg-slate-50 overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="about-image relative z-10 aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-slate-200">
               <img
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=900"
                alt="Students collaborating at the academy"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
          </div>

          <div className="about-copy space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-primary tracking-tight">
                About <span className="text-gradient">{info.name || 'AcademyPro'}</span>
              </h2>
              <p className="text-xl text-secondary leading-relaxed">
                {info.description || 'We are a leading education center dedicated to bridging the gap between academic learning and industry requirements.'}
              </p>
            </div>

            <div className="grid gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2">
                <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full" />
                  Our Mission
                </h3>
                <p className="text-secondary leading-relaxed">
                  {info.mission || 'To empower every student with practical skills and a growth mindset to excel in the modern professional landscape.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2">
                <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full" />
                  Our Vision
                </h3>
                <p className="text-secondary leading-relaxed">
                  {info.vision || 'To become the global gold standard for practical technical education and career acceleration.'}
                </p>
              </div>
            </div>

            <div className="pt-4">
              <a
                href="/register"
                className="px-8 py-4 btn-gradient text-white rounded-full font-bold flex items-center gap-2 active:scale-95 w-fit"
              >
                Start Your Journey
                <ArrowRight size={20} />
              </a>
            </div>
          </div>
        </div>
    </section>
  );
};

export default About;
