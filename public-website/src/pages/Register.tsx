import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCourses } from '../hooks/useCourses';
import { useBatches } from '../hooks/useBatches';
import { registrationApi } from '../api/registrations';
import { CheckCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';

const registrationSchema = z.object({
  name: z.string().min(2, { message: 'Name is required' }),
  mobile: z.string().min(10, { message: 'Valid mobile number is required' }),
  email: z.email({ message: 'Valid email is required' }),
  courseInterestedId: z.string().min(1, { message: 'Please select a course' }),
  batchId: z.string().optional(),
  qualification: z.string().optional(),
  location: z.string().optional(),
  remarks: z.string().optional(),
  consent: z.boolean().refine((v) => v === true, {
    message: 'Please agree to the Privacy Policy and Terms & Conditions to continue.',
  }),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const courseIdFromUrl = searchParams.get('courseId');
  const batchIdFromUrl = searchParams.get('batchId');

  const { data: courses, isLoading: coursesLoading } = useCourses();

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      courseInterestedId: courseIdFromUrl || '',
      consent: false,
    },
  });

  useEffect(() => {
    if (batchIdFromUrl) {
      form.setValue('batchId', batchIdFromUrl);
    }
  }, [batchIdFromUrl, form]);

  const selectedCourseId = form.watch('courseInterestedId');
  const formValues = form.watch();
  const { data: availableBatches, isLoading: batchesLoading } = useBatches(selectedCourseId);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const { consent: _consent, ...payload } = data;
      await registrationApi.register(payload);
      setIsSuccess(true);
    } catch (error) {
      setSubmitError("We couldn't submit your registration. Please check your details and try again, or contact us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // The actual registration API call is only ever triggered by one thing:
  // a direct click on the "Complete Registration" button at step 4 (see
  // its onClick below). There is deliberately no other path to it — the
  // <form>'s own onSubmit is a no-op (see className="space-y-8" form tag),
  // so no keypress, autofill, or mobile keyboard "Go/Enter" action can
  // ever trigger a real submission early, regardless of which step is
  // showing.
  const handleCompleteRegistration = () => form.handleSubmit(onSubmit)();

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    // Enter anywhere in the form just advances to the next step — it can
    // never submit, because nothing here calls onSubmit directly.
    if (e.key === 'Enter') {
      e.preventDefault();
      if (step === 4) {
        handleCompleteRegistration();
      } else {
        nextStep();
      }
    }
  };

  const nextStep = async () => {
    const fieldsToValidate: { [key: number]: (keyof RegistrationFormData)[] } = {
      1: ['name', 'mobile', 'email'],
      2: ['courseInterestedId'],
      3: [],
    };

    if (step === 3) {
      setStep(4);
      return;
    }

    const currentFields = fieldsToValidate[step] || [];

    if (currentFields.length === 0) {
      setStep(step + 1);
      return;
    }

    const result = await form.trigger(currentFields as any);
    if (result) setStep(step + 1);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-6 p-12 rounded-3xl bg-white shadow-xl border border-slate-100">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold text-primary">Registration Successful!</h2>
          <p className="text-secondary">Thank you for registering. Our admissions team will contact you shortly via WhatsApp or Email.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-12 bg-slate-50 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-slate-100 h-2 w-full">
          <div
            className="bg-accent h-full transition-all duration-500"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <div className="p-8 lg:p-12">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-3xl font-bold text-primary">Join the Academy</h1>
              <p className="text-secondary">Step {step} of 4: {
                step === 1 ? 'Personal Details' :
                step === 2 ? 'Course Selection' :
                step === 3 ? 'Batch Selection' : 'Review'
              }</p>
            </div>
            <div className="text-accent font-bold text-xl">{step}/4</div>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            onKeyDown={handleFormKeyDown}
            className="space-y-8"
          >
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-secondary">Full Name</label>
                  <input
                    {...form.register('name')}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-accent outline-none transition-all"
                    placeholder="John Doe"
                  />
                  <p className="text-xs text-red-500">{form.formState.errors.name?.message}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-secondary">Mobile Number</label>
                  <input
                    {...form.register('mobile')}
                    maxLength={10}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-accent outline-none transition-all"
                    placeholder="9876543210"
                  />
                  <p className="text-xs text-red-500">{form.formState.errors.mobile?.message}</p>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-secondary">Email Address</label>
                  <input
                    {...form.register('email')}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-accent outline-none transition-all"
                    placeholder="john@example.com"
                  />
                  <p className="text-xs text-red-500">{form.formState.errors.email?.message}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-secondary">Qualification</label>
                  <input
                    {...form.register('qualification')}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-accent outline-none transition-all"
                    placeholder="e.g. B.Sc Computer Science"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-secondary">Location</label>
                  <input
                    {...form.register('location')}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-accent outline-none transition-all"
                    placeholder="City, State"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <label className="text-sm font-semibold text-secondary">Select Your Course</label>
                {coursesLoading ? (
                  <div className="grid grid-cols-1 gap-4">
                    {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto pr-2">
                    {courses?.map(course => (
                      <div
                        key={course.id}
                        onClick={() => form.setValue('courseInterestedId', course.id)}
                        className={cn(
                          "p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center",
                          form.watch('courseInterestedId') === course.id
                            ? "border-accent bg-accent/5 text-accent"
                            : "border-slate-100 bg-white hover:border-slate-200"
                        )}
                      >
                        <span className="font-semibold">{course.name}</span>
                        {form.watch('courseInterestedId') === course.id && <CheckCircle size={18} />}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-red-500">{form.formState.errors.courseInterestedId?.message}</p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-secondary">Select Available Batch</label>
                  <span className="text-xs text-slate-500">(Optional)</span>
                </div>
                {batchesLoading ? (
                  <div className="grid grid-cols-1 gap-4">
                    {[1,2].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}
                  </div>
                ) : (availableBatches && availableBatches.length > 0) ? (
                  <div className="grid grid-cols-1 gap-3">
                    {availableBatches.map(batch => (
                      <div
                        key={batch.id}
                        onClick={() => form.setValue('batchId', batch.id)}
                        className={cn(
                          "p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center",
                          form.watch('batchId') === batch.id
                            ? "border-accent bg-accent/5 text-accent"
                            : "border-slate-100 bg-white hover:border-slate-200"
                        )}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold">{batch.name}</span>
                          <span className="text-xs opacity-70">{batch.classTiming} • Starts {new Date(batch.startDate).toLocaleDateString()}</span>
                        </div>
                        {form.watch('batchId') === batch.id && <CheckCircle size={18} />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-secondary italic">No specific batches available, we will contact you to discuss timings.</p>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="text-secondary">Name</span>
                    <span className="font-bold text-primary">{form.getValues('name')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="text-secondary">Mobile</span>
                    <span className="font-bold text-primary">{form.getValues('mobile')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="text-secondary">Email</span>
                    <span className="font-bold text-primary">{form.getValues('email')}</span>
                  </div>
                  {form.getValues('qualification') && (
                    <div className="flex justify-between py-2 border-b border-slate-200">
                      <span className="text-secondary">Qualification</span>
                      <span className="font-bold text-primary">{form.getValues('qualification')}</span>
                    </div>
                  )}
                  {form.getValues('location') && (
                    <div className="flex justify-between py-2 border-b border-slate-200">
                      <span className="text-secondary">Location</span>
                      <span className="font-bold text-primary">{form.getValues('location')}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2">
                    <span className="text-secondary">Course</span>
                    <span className="font-bold text-accent">
                      {courses?.find(c => c.id === formValues.courseInterestedId)?.name || 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-slate-200">
                    <span className="text-secondary">Batch</span>
                    <span className="font-bold text-accent">
                      {availableBatches?.find(batch => batch.id === formValues.batchId)?.name || 'No specific batch selected'}
                    </span>
                  </div>
                </div>
                <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-secondary">
                  <input
                    type="checkbox"
                    {...form.register('consent')}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-accent focus:ring-accent"
                    aria-invalid={Boolean(form.formState.errors.consent)}
                    aria-describedby={form.formState.errors.consent ? 'consent-error' : undefined}
                  />
                  <span>
                    I agree to be contacted by the Academy via WhatsApp, Email or phone regarding my registration,
                    and I have read and accept the{' '}
                    <Link to="/privacy-policy" target="_blank" className="font-semibold text-accent underline underline-offset-2">
                      Privacy Policy
                    </Link>{' '}
                    and{' '}
                    <Link to="/terms" target="_blank" className="font-semibold text-accent underline underline-offset-2">
                      Terms &amp; Conditions
                    </Link>
                    .
                  </span>
                </label>
                {form.formState.errors.consent && (
                  <p id="consent-error" role="alert" className="text-sm font-medium text-red-600">
                    {form.formState.errors.consent.message}
                  </p>
                )}
                {submitError && (
                  <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                    {submitError}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-between items-center pt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 text-secondary font-semibold flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>
              )}
              <div className="ml-auto">
                {step < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-8 py-3 bg-accent text-white rounded-xl font-bold flex items-center gap-2 hover:bg-accent-dark transition-all active:scale-95"
                  >
                    Continue
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCompleteRegistration}
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                    className="px-12 py-4 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={20} className="animate-spin" aria-hidden="true" />
                        Submitting…
                      </>
                    ) : (
                      'Complete Registration'
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
