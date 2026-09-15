import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CheckCircle2 } from "lucide-react";
import { cn } from "../../utils/cn";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    title: "Choose Your Course",
    desc: "Explore our curated list of industry-relevant courses.",
    icon: "01",
  },
  {
    title: "Join Your Batch",
    desc: "Pick a timing that fits your schedule perfectly.",
    icon: "02",
  },
  {
    title: "Learn With Trainers",
    desc: "Get mentored by experienced industry professionals.",
    icon: "03",
  },
  {
    title: "Practice Real Skills",
    desc: "Hands-on training with real-world scenarios.",
    icon: "04",
  },
  {
    title: "Build Projects",
    desc: "Create a professional portfolio with capstone projects.",
    icon: "05",
  },
  {
    title: "Grow Your Career",
    desc: "Get placed in top companies with our career support.",
    icon: "06",
  },
];

const LearningJourney = () => {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray(".journey-card");

      cards.forEach((card: any) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          opacity: 0,
          x: card.classList.contains("lg:even:translate-x-0") ? -50 : 50, // simplistic parity check
          duration: 0.8,
          ease: "power3.out",
        });
      });
    },
    { scope: container },
  );

  return (
    <section
      id="learning"
      ref={container}
      className="py-24 px-6 sm:px-12 bg-white overflow-hidden"
    >
      <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
        <h2 className="text-4xl lg:text-5xl font-bold text-primary tracking-tight">
          Your Path to <span className="text-accent">Mastery</span>
        </h2>
        <p className="text-lg text-secondary leading-relaxed">
          We guide you from the very first step of choosing a course to landing
          your dream job.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
        {/* Background Line for Desktop */}
        <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10" />

        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              "journey-card p-8 rounded-3xl border border-slate-100 bg-slate-100 hover:bg-white hover:shadow-2xl transition-all duration-300 group relative",
              index % 2 === 0 ? "lg:translate-x-0" : "lg:translate-x-0", // Simplified for now
            )}
          >
            <div className="flex items-start justify-between mb-6">
              <span className="text-5xl font-black text-slate-400 group-hover:text-accent/20 transition-colors">
                {step.icon}
              </span>
              <div className="p-2 bg-accent/10 text-accent rounded-full">
                <CheckCircle2 size={20} />
              </div>
            </div>

            <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-accent transition-colors">
              {step.title}
            </h3>
            <p className="text-secondary leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LearningJourney;
