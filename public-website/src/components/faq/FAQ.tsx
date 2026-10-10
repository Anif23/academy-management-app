import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { faqApi } from '../../api/faqs';
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
            Frequently <span className="text-gradient">Asked Questions</span>
          </h2>
          <p className="text-secondary">Everything you need to know about joining our academy.</p>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          {faqs?.map((faq, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${faq.id}`;
            const buttonId = `faq-button-${faq.id}`;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-300 shadow-sm"
              >
                <button
                  id={buttonId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="w-full p-6 text-left flex justify-between items-center gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-2xl"
                >
                  <span className="font-bold text-primary group-hover:text-accent transition-colors">
                    {faq.question}
                  </span>
                  <div className={cn(
                    "p-1 bg-slate-100 rounded-full transition-all duration-300 shrink-0",
                    isOpen ? "rotate-180 bg-accent text-white" : "text-secondary"
                  )}>
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  aria-hidden={!isOpen}
                  className={cn(
                    "transition-all duration-300 overflow-hidden",
                    isOpen ? "max-h-96 opacity-100 p-6 pt-0" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="pt-4 border-t border-slate-50 text-secondary leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
    </section>
  );
};

export default FAQ;
