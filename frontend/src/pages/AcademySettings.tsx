import { AcademySettingsForm } from '../features/academy-settings/AcademySettingsForm';
import TestimonialsManager from '../features/academy-settings/TestimonialsManager';
import FAQManager from '../features/academy-settings/FAQManager';

const AcademySettingsPage = () => {
  return (
    <div className="space-y-12 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-primary">Academy Content Management</h1>
        <p className="text-secondary">Manage your public website branding, testimonials, and FAQs from one place.</p>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-accent rounded-full" />
            Website Branding & Info
          </h2>
          <AcademySettingsForm />
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-accent rounded-full" />
            Student Testimonials
          </h2>
          <TestimonialsManager />
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-accent rounded-full" />
            Public FAQs
          </h2>
          <FAQManager />
        </section>
      </div>
    </div>
  );
};

export default AcademySettingsPage;
