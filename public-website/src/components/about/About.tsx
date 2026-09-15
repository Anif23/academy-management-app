import { useAcademyInfo } from '../../hooks/useAcademyInfo';
import { ArrowRight } from 'lucide-react';

const About = () => {
  const { data: info, isLoading } = useAcademyInfo();

  if (isLoading) return <div className="py-24 bg-white text-center">Loading about info...</div>;
  if (!info) return null;

  return (
    <section id="about" className="py-24 bg-slate-50 overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl bg-slate-200">
               <img
                src="https://images.unsplash.com/photo-1523240795612-1//about-us"
                alt="Academy Campus"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800";
                }}
              />
            </div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-primary tracking-tight">
                About <span className="text-accent">{info.name || 'AcademyPro'}</span>
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
                className="px-8 py-4 bg-primary text-white rounded-full font-bold flex items-center gap-2 hover:bg-primary-dark transition-all hover:shadow-xl active:scale-95 w-fit"
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
