import { ArrowRight } from 'lucide-react';
import type { Course } from '../../types';

interface CourseCardProps {
  course: Course;
}

const CourseCard = ({ course }: CourseCardProps) => {
  return (
    <div className="group relative p-6 rounded-3xl bg-gradient-to-r from-slate-300 to-slate-500 border border-slate-100 hover:border-accent transition-all duration-300 hover:shadow-2xl overflow-hidden">
      {/* Top Badge */}
      <div className="flex justify-between items-start mb-4">
        <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider">
          {course.status}
        </span>
      </div>

      <h3 className="text-2xl font-bold text-primary mb-3 group-hover:text-accent transition-colors">
        {course.name}
      </h3>

      <p className="text-primary-dark line-clamp-3 mb-6 leading-relaxed">
        {course.description}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="flex items-center gap-2 text-sm text-secondary">
          <span className="opacity-70">Duration:</span>
          <span className="font-medium text-primary">{course.duration}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-secondary">
          <span className="opacity-70">Fee:</span>
          <span className="font-semibold text-primary">₹{course.fee}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
        <a
          href={`/courses/${course.id}`}
          className="text-sm font-bold text-primary flex items-center gap-1 group/btn hover:text-accent transition-colors"
        >
          View Details
          <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
        </a>
        <a
          href={`/register?courseId=${course.id}`}
          className="px-4 py-2 bg-primary text-white rounded-full text-xs font-bold hover:bg-primary-dark transition-all active:scale-95"
        >
          Register
        </a>
      </div>
    </div>
  );
};

export default CourseCard;
