import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Course } from '../../types';

interface CourseCardProps {
  course: Course;
}

// A course has no photo in the source-of-truth API (and we never invent
// one implying it depicts this specific course's classroom). Instead each
// card gets a deterministic gradient + icon treatment, so every course
// still reads as visually distinct without fabricating imagery.
const GRADIENTS = [
  'from-accent to-teal-500',
  'from-accent to-orange-400',
  'from-emerald-500 to-teal-500',
  'from-fuchsia-500 to-pink-500',
  'from-sky-500 to-cyan-400',
];

function gradientFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

// Descriptions can come back as rich-text HTML from the admin editor — the
// card only wants plain text, never raw tags.
function toPlainText(html: string | null | undefined): string {
  return (html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatFee(fee: number | string): string {
  const value = Number(fee);
  return Number.isFinite(value) ? value.toLocaleString('en-IN') : String(fee);
}

const CourseCard = ({ course }: CourseCardProps) => {
  return (
    // Outer wrapper is the GSAP scroll-reveal target (opacity/transform); the hover lift lives on
    // the inner card so CSS transitions never fight the GSAP tween.
    <div className="course-card h-full">
    <div className="card-gradient-border group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent/10">
      <div className={`relative h-36 overflow-hidden bg-gradient-to-br ${gradientFor(course.id)}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <BookOpen
          size={110}
          strokeWidth={1}
          className="absolute -bottom-4 -right-4 text-white/25 transition-transform duration-700 ease-out group-hover:scale-125 group-hover:-rotate-6 group-hover:text-white/35"
        />
        <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-primary text-xs font-bold uppercase tracking-wider transition-transform duration-300 group-hover:scale-105">
          {course.status}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-3 text-2xl font-bold text-primary transition-colors duration-300 group-hover:text-accent">
          {course.name}
        </h3>

        <p className="mb-6 line-clamp-3 min-h-[4.5rem] leading-relaxed text-secondary">
          {toPlainText(course.description)}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="flex items-center gap-2 text-sm text-secondary">
            <Clock size={14} className="opacity-70" />
            <span className="font-medium text-primary">{course.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-secondary">
            <span className="opacity-70">Fee:</span>
            <span className="font-semibold text-primary">₹{formatFee(course.fee)}</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-6">
          <Link
            to={`/courses/${course.id}`}
            className="text-sm font-bold text-primary flex items-center gap-1 group/btn hover:text-accent transition-colors"
          >
            View Details
            <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
          <Link
            to={`/register?courseId=${course.id}`}
            className="px-4 py-2 bg-primary text-white rounded-full text-xs font-bold hover:bg-primary-dark transition-all active:scale-95"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
    </div>
  );
};

export default CourseCard;
