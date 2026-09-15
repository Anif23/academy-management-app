import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/navbar/Navbar';
import Hero from './components/hero/Hero';
import LearningJourney from './components/learning/LearningJourney';
import CourseCard from './components/courses/CourseCard';
import CourseDetails from './pages/CourseDetails';
import Register from './pages/Register';
import WhatsAppButton from './components/common/WhatsAppButton';
import About from './components/about/About';
import Contact from './components/contact/Contact';
import FAQ from './components/faq/FAQ';
import Testimonials from './components/testimonials/Testimonials';
import Footer from './components/layout/Footer';
import { useCourses } from './hooks/useCourses';

const queryClient = new QueryClient();
const Home = () => {
  return (
  <>
    <Hero />
    <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-16">
      <About />
      <LearningJourney />
      <CoursesSection />
      <Testimonials />
      <FAQ />
      <Contact />
    </main>
  </>
  );
};

const CoursesSection = () => {
  const { data: courses, isLoading, error } = useCourses();

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
            Explore Our <span className="text-accent">Programs</span>
          </h2>
          <p className="text-lg text-secondary leading-relaxed">
            Choose from our specialized courses designed to take you from beginner to industry professional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses?.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}

const AppContent = () => {

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Global Decorative Mesh Gradients */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>

      <WhatsAppButton />

      <Footer />
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
