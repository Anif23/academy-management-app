import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './components/navbar/Navbar';
import AnnouncementTicker from './components/navbar/AnnouncementTicker';
import Hero from './components/hero/Hero';
import LearningJourney from './components/learning/LearningJourney';
import CourseCard from './components/courses/CourseCard';
import CourseDetails from './pages/CourseDetails';
import Register from './pages/Register';
import WhatsAppButton from './components/common/WhatsAppButton';
import AnimatedBackground from './components/common/AnimatedBackground';
import About from './components/about/About';
import Contact from './components/contact/Contact';
import FAQ from './components/faq/FAQ';
import Testimonials from './components/testimonials/Testimonials';
import LearningInAction from './components/about/LearningInAction';
import InspirationSlider from './components/about/InspirationSlider';
import Footer from './components/layout/Footer';
import CookieConsentBanner from './components/common/CookieConsentBanner';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsAndConditions from './pages/legal/TermsAndConditions';
import CookiePolicy from './pages/legal/CookiePolicy';
import RefundPolicy from './pages/legal/RefundPolicy';
import { useCourses } from './hooks/useCourses';

const queryClient = new QueryClient();
gsap.registerPlugin(ScrollTrigger);
const Home = () => {
  return (
  <>
    <Hero />
    <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-16">
      <About />
      <LearningJourney />
    </main>
    <InspirationSlider />
    <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-16">
      <CoursesSection />
    </main>
    <LearningInAction />
    <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-16">
      <Testimonials />
      <FAQ />
      <Contact />
    </main>
  </>
  );
};

const CoursesSection = () => {
  const { data: courses, isLoading, error } = useCourses();
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
      // The grid only exists once courses have loaded — never target elements that aren't in the DOM yet.
      if (mql.matches || !courses?.length || !gridRef.current?.querySelector('.course-card')) return;

      ScrollTrigger.batch('.course-card', {
        start: 'top 88%',
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { opacity: 0, y: 32 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08 },
          ),
        once: true,
      });
    },
    { scope: gridRef, dependencies: [courses] },
  );

  if (isLoading) {
    return (
      <section id="courses" className="py-24 bg-white">
        <div className="max-w-full mx-auto px-6 sm:px-12 text-center">
          <h2 className="text-4xl font-bold text-primary mb-4">Our Courses</h2>
          <p className="text-secondary mb-12">Explore our range of specialized programs.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <div key={i} className="p-8 rounded-3xl border border-slate-100 bg-slate-50 animate-pulse h-80" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="courses" className="py-24 bg-white">
        <div className="max-w-full mx-auto px-6 sm:px-12 text-center">
          <h2 className="text-4xl font-bold text-primary mb-4">Our Courses</h2>
          <p className="text-red-500 mb-12">Failed to load courses. Please try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="courses" className="py-24 bg-white">
      <div className="max-w-full mx-auto px-6 sm:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold text-primary tracking-tight">
            Explore Our <span className="text-gradient">Programs</span>
          </h2>
          <p className="text-lg text-secondary leading-relaxed">
            Choose from our specialized courses designed to take you from beginner to industry professional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" ref={gridRef}>
          {courses?.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Nav links like "Contact" point at "/#contact" — a hash on a section
 * that only exists on the Home page. Clicking one from another route
 * (e.g. /register) does a full page navigation, and the browser's native
 * "scroll to element with this id" only fires once, immediately, before
 * this SPA has actually rendered that section into the DOM — so it
 * silently fails and the page just sits at the top (Hero). This re-runs
 * the scroll-to-hash after each render settles, and retries briefly in
 * case the target section mounts a moment later (e.g. behind a loading
 * state).
 */
function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    // No hash — behave like a normal page load and start at the top, instead
    // of keeping whatever scroll position the previous page was at (that's
    // what made a footer link like Privacy Policy open "mid-page").
    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      return;
    }

    const id = location.hash.slice(1);
    let target: Element | null = null;
    let mutationObserver: MutationObserver | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let mutationTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let settleTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let maxWaitTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let alignmentTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      mutationObserver?.disconnect();
      resizeObserver?.disconnect();
      if (mutationTimeoutId) clearTimeout(mutationTimeoutId);
      if (settleTimeoutId) clearTimeout(settleTimeoutId);
      if (maxWaitTimeoutId) clearTimeout(maxWaitTimeoutId);
      if (alignmentTimeoutId) clearTimeout(alignmentTimeoutId);
      window.removeEventListener('wheel', stopWatchingLayout);
      window.removeEventListener('touchstart', stopWatchingLayout);
      window.removeEventListener('keydown', stopWatchingLayout);
    };

    const alignTarget = (behavior: ScrollBehavior) => {
      if (!target) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          target?.scrollIntoView({ behavior, block: 'start' });
        });
      });
    };

    function stopWatchingLayout() {
      cleanup();
    }

    const startWatchingLayout = (el: Element) => {
      if (target) return;
      target = el;
      mutationObserver?.disconnect();
      if (mutationTimeoutId) clearTimeout(mutationTimeoutId);

      alignTarget('smooth');
      resizeObserver = new ResizeObserver(() => {
        if (alignmentTimeoutId) clearTimeout(alignmentTimeoutId);
        alignmentTimeoutId = setTimeout(() => alignTarget('auto'), 80);
        if (settleTimeoutId) clearTimeout(settleTimeoutId);
        settleTimeoutId = setTimeout(cleanup, 1200);
      });
      resizeObserver.observe(document.documentElement);
      settleTimeoutId = setTimeout(cleanup, 1200);
      maxWaitTimeoutId = setTimeout(cleanup, 10000);
      window.addEventListener('wheel', stopWatchingLayout, { once: true, passive: true });
      window.addEventListener('touchstart', stopWatchingLayout, { once: true, passive: true });
      window.addEventListener('keydown', stopWatchingLayout, { once: true });
    };

    const existing = document.getElementById(id);
    if (existing) {
      startWatchingLayout(existing);
    } else {
      // Some sections render after their data loads. Wait for the target to
      // mount, then track layout changes so async content cannot shift it
      // away from the viewport after the initial hash navigation.
      mutationObserver = new MutationObserver(() => {
        const el = document.getElementById(id);
        if (el) startWatchingLayout(el);
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });
      mutationTimeoutId = setTimeout(cleanup, 8000);
    }

    return () => {
      cleanup();
    };
  }, [location.pathname, location.hash]);

  return null;
}

const AppContent = () => {

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Global Decorative Mesh Gradients - animated on scroll */}
      <AnimatedBackground />

      <ScrollToHash />
      <AnnouncementTicker />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/register" element={<Register />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
        </Routes>
      </main>

      <WhatsAppButton />

      <Footer />
      <CookieConsentBanner />
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
