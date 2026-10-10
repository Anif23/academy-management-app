import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ArrowRight, MessageSquare, GraduationCap } from 'lucide-react';
import { useAcademyInfo } from '../../hooks/useAcademyInfo';
import { useAcademyStats } from '../../hooks/useAcademyStats';

const Hero = () => {
  const container = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { data: academy } = useAcademyInfo();
  const { data: stats } = useAcademyStats();

  // The hero video is the single most expensive asset on the page — defer
  // its network request until right after first paint so it never
  // competes with the critical above-the-fold text/CTAs for bandwidth.
  const [loadVideo, setLoadVideo] = useState(false);
  useEffect(() => {
    const id = 'requestIdleCallback' in window ? window.requestIdleCallback(() => setLoadVideo(true)) : setTimeout(() => setLoadVideo(true), 300);
    return () => {
      if ('requestIdleCallback' in window && typeof id === 'number') window.cancelIdleCallback(id);
      else clearTimeout(id as unknown as number);
    };
  }, []);

  useEffect(() => {
    if (loadVideo) videoRef.current?.load();
  }, [loadVideo]);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from('.hero-title', {
      y: 100,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
    })
    .from('.hero-subtitle', {
      y: 30,
      opacity: 0,
      duration: 0.8,
    }, '-=0.6')
    .from('.hero-ctas', {
      y: 30,
      opacity: 0,
      duration: 0.8,
    }, '-=0.6')
    .from('.hero-visual', {
      scale: 0.8,
      opacity: 0,
      duration: 1.2,
    }, '-=1');
  }, { scope: container });

  return (
    <section
      id='home'
      ref={container}
      className="relative min-h-screen flex items-center justify-center pt-28 px-4 sm:px-10 pb-20 overflow-hidden bg-slate-900"
    >
      {/* Background Video & Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=60&w=1200"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        >
          {/* TODO: replace with the academy's own licensed hero footage before launch.
              The previous source hotlinked a raw Canva asset URL (video-public.canva.com),
              which is not a licensed, redistributable video source — using it live would be
              a copyright/ToS risk. Using a Pexels free-license clip as a safe placeholder. */}
          {loadVideo && (
            <source
              src="https://videos.pexels.com/video-files/8342354/8342354-uhd_2560_1440_25fps.mp4"
              type="video/mp4"
            />
          )}
        </video>
        {/* <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/80 to-slate-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-slate-900/40" /> */}
      </div>

      {/* Background Decorative Elements (SaaS Blobs) */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-accent/10 rounded-full blur-[150px] animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-full mx-auto px-12 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Content */}
        <div className="text-center lg:text-left space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 backdrop-blur-md border border-accent/30 text-accent text-sm font-semibold hero-title">
            <GraduationCap size={16} />
            <span>Empowering the next generation of tech leaders</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight hero-title">
            Learn the skills that get you <span className="text-accent-light">hired</span>.
          </h1>

          <p className="text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed hero-subtitle">
            Build practical skills, learn from experienced trainers and take the next step toward your career. Join our community of learners today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 hero-ctas">
            <a
              href="#courses"
              className="group px-8 py-4 btn-gradient text-white rounded-full font-bold flex items-center gap-2 active:scale-95"
            >
              Explore Courses
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href={`https://wa.me/${academy?.whatsapp || 'your-number'}`}
              className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full font-bold flex items-center gap-2 hover:bg-white/20 transition-all active:scale-95 shadow-sm"
            >
              <MessageSquare size={20} className="text-accent" />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Visual */}
        <div className="relative hero-visual">
          <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-white/10 backdrop-blur-sm bg-slate-200 aspect-square lg:aspect-video">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800"
              alt="Students learning"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Floating Stats Card */}
          <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 z-20 flex items-center gap-4 animate-bounce-slow">
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-accent">
              <GraduationCap size={24} />
            </div>
            <div className="text-slate-900">
              <p className="text-2xl font-bold">{stats?.students ? `${stats.students}+` : '…'}</p>
              <p className="text-sm text-slate-600">Happy Students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animation Styles */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-bounce-slow,
          .animate-blob {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
