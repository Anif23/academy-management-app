import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { faqApi } from '../../api/faqs'; // I need to create this API file
import { cn } from '../../utils/cn';

const FAQ = () => {
  const { data: faqs, isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: faqApi.getActiveFAQs,
  });

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (isLoading) return <div className="py-24 bg-white text-center">Loading FAQs...</div>;

  return (
    <section id="faq" className="py-24 bg-slate-50">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex p-3 bg-accent/10 text-accent rounded-2xl mb-4">
            <HelpCircle size={32} />
          </div>
          <h2 className="text-4xl font-bold text-primary tracking-tight">
            Frequently <span className="text-accent">Asked Questions</span>
          </h2>
          <p className="text-secondary">Everything you need to know about joining our academy.</p>
        </div>

        <div className="space-y-4">
          {faqs?.map((faq, index) => (
            <div
              key={faq.id}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-300 shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 text-left flex justify-between items-center gap-4 group"
              >
                <span className="font-bold text-primary group-hover:text-accent transition-colors">
                  {faq.question}
                </span>
                <div className={cn(
                  "p-1 bg-slate-100 rounded-full transition-all duration-300",
                  openIndex === index ? "rotate-180 bg-accent text-white" : "text-secondary"
                )}>
                  {openIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>

              <div className={cn(
                "transition-all duration-300 overflow-hidden",
                openIndex === index ? "max-h-96 opacity-100 p-6 pt-0" : "max-h-0 opacity-0"
              )}>
                <div className="pt-4 border-t border-slate-50 text-secondary leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
    </section>
  );
};

export default FAQ;
