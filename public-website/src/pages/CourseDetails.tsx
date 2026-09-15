import { useParams, useNavigate } from 'react-router-dom';
import { useCourse } from '../hooks/useCourses';
import { useBatches } from '../hooks/useBatches';
import { CheckCircle, Clock, CreditCard, ArrowLeft, MessageSquare } from 'lucide-react';
import type { Batch } from '../types';

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: course, isLoading: courseLoading, error: courseError } = useCourse(id!);
  const { data: batches, isLoading: batchesLoading } = useBatches(id!);

  if (courseLoading) return <div className="min-h-screen flex items-center justify-center">Loading course details...</div>;
  if (courseError || !course) return <div className="min-h-screen flex items-center justify-center">Course not found.</div>;

  return (
    <div className="min-h-screen pt-28 pb-12 bg-slate-50">
      <div className="max-w-full mx-auto px-6 sm:px-16">
        {/* Breadcrumb/Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Courses
        </button>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-extrabold text-primary tracking-tight">
                {course.name}
              </h1>
              <p className="text-xl text-secondary leading-relaxed">
                {course.description}
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-accent/10 text-accent rounded-xl"><Clock size={24} /></div>
                <div>
                  <p className="text-sm text-secondary">Duration</p>
                  <p className="font-bold text-primary">{course.duration}</p>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-accent/10 text-accent rounded-xl"><CreditCard size={24} /></div>
                <div>
                  <p className="text-sm text-secondary">Course Fee</p>
                  <p className="font-bold text-primary">₹{course.fee}</p>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-accent/10 text-accent rounded-xl"><CheckCircle size={24} /></div>
                <div>
                  <p className="text-sm text-secondary">Status</p>
                  <p className="font-bold text-primary">{course.status}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-primary">Curriculum & Outcomes</h2>
              <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4 text-secondary leading-relaxed">
                <p>This course is designed to provide a comprehensive understanding of the subject, focusing on practical application and industry standards.</p>
                <ul className="space-y-3">
                  {['Industry recognized certification', 'Hands-on project work', 'Expert mentorship', 'Placement assistance'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle size={18} className="text-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar / Batch Selection */}
          <div className="space-y-8">
            <div className="p-8 rounded-3xl bg-primary text-white shadow-2xl sticky top-28">
              <h3 className="text-2xl font-bold mb-6">Join a Batch</h3>

              {batchesLoading ? (
                <div className="space-y-4">
                  {[1,2].map(i => <div key={i} className="h-20 bg-primary-light rounded-xl animate-pulse" />)}
                </div>
              ) : (batches && batches.length > 0) ? (
                <div className="space-y-4 mb-8">
                  {batches.map((batch: Batch) => (
                    <div
                      key={batch.id}
                      className="p-4 rounded-xl bg-primary-light border border-slate-700 hover:border-accent transition-all cursor-pointer group"
                      onClick={() => navigate(`/register?courseId=${course.id}&batchId=${batch.id}`)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-white group-hover:text-accent transition-colors">
                          {batch.name}
                        </span>
                        <span className="text-xs bg-accent text-white px-2 py-1 rounded">Available</span>
                      </div>
                      <div className="text-xs text-slate-400 flex justify-between">
                        <span>Starts: {new Date(batch.startDate).toLocaleDateString()}</span>
                        <span>{batch.classTiming}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 mb-8">No active batches available at the moment.</p>
              )}

              <div className="space-y-4">
                <button
                  onClick={() => navigate(`/register?courseId=${course.id}`)}
                  className="w-full py-4 bg-accent text-white rounded-xl font-bold hover:bg-accent-dark transition-all active:scale-95 shadow-lg"
                >
                  Register Now
                </button>
                <a
                  href={`https://wa.me/your-number?text=Hi, I am interested in the ${course.name} course. Can you provide more details?`}
                  className="w-full py-4 bg-white text-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all"
                >
                  <MessageSquare size={20} className="text-accent" />
                  WhatsApp Inquiry
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
