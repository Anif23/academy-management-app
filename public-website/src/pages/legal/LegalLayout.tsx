import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const LegalLayout = ({
  title,
  updatedLabel,
  children,
}: {
  title: string;
  updatedLabel: string;
  children: ReactNode;
}) => (
  <div className="min-h-screen bg-slate-50 pt-28 pb-20">
    <div className="mx-auto max-w-3xl px-6 sm:px-10">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-primary"
      >
        <ArrowLeft size={16} />
        Back to home
      </Link>
      <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-secondary">{updatedLabel}</p>
      <div className="legal-content mt-10 space-y-8 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm sm:p-12">
        {children}
      </div>
    </div>
  </div>
);

export const Section = ({ heading, children }: { heading: string; children: ReactNode }) => (
  <section>
    <h2 className="text-xl font-bold text-primary">{heading}</h2>
    <div className="mt-3 space-y-3 text-sm leading-relaxed text-secondary [&_a]:font-medium [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-primary">
      {children}
    </div>
  </section>
);
