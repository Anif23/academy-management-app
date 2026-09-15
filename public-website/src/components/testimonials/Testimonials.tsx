import { Star, Quote } from 'lucide-react';
import { useTestimonials } from '../../hooks/useTestimonials';

const Testimonials = () => {
  const { data: testimonials, isLoading, error } = useTestimonials();

  if (isLoading) {
    return (
      <section id="testimonials" className="py-24 bg-slate-50">
          <h2 className="text-4xl font-bold text-primary mb-12">What Our Students Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-8 rounded-3xl border border-slate-100 bg-white animate-pulse h-64" />
            ))}
          </div>
      </section>
    );
  }

  if (error || !testimonials) {
    return null;
  }

  return (
    <section id="testimonials" className="py-24 bg-slate-50 overflow-hidden">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold text-primary tracking-tight">
            Student <span className="text-accent">Success Stories</span>
          </h2>
          <p className="text-lg text-secondary leading-relaxed">
            Hear from our graduates who have transformed their careers through our specialized programs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial: any) => (
            <div
              key={testimonial.id}
              className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative"
            >
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Quote size={20} />
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < (testimonial.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}
                  />
                ))}
              </div>

              <p className="text-secondary italic mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                  {testimonial.studentImage ? (
                    <img src={testimonial.studentImage} alt={testimonial.studentName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                      {testimonial.studentName?.charAt(0) || 'S'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-primary">{testimonial.studentName}</p>
                  <p className="text-xs text-secondary">{testimonial.courseName || 'Student'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
    </section>
  );
};

export default Testimonials;
