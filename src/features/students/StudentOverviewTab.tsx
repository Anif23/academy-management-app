import { BookOpen, CalendarCheck, CheckCircle2, IndianRupee } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import type { Student } from '../../types';
import type { StudentDashboardStats } from '../../types';
import { formatCurrency } from '../../utils/format';

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-hover">
      <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

export function StudentOverviewTab({ student, stats }: { student: Student; stats: StudentDashboardStats }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader title="Course Progress" description={`${student.course} · ${student.courseDuration}`} />
        <CardBody className="space-y-5">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-text-secondary">Overall Progress</span>
              <span className="font-medium text-text-primary">{stats.courseProgress}%</span>
            </div>
            <ProgressBar value={stats.courseProgress} />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-text-secondary">Attendance</span>
              <span className="font-medium text-text-primary">{stats.attendancePercentage}%</span>
            </div>
            <ProgressBar value={stats.attendancePercentage} />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-text-secondary">Task Completion</span>
              <span className="font-medium text-text-primary">
                {stats.tasksTotal ? Math.round((stats.tasksCompleted / stats.tasksTotal) * 100) : 0}%
              </span>
            </div>
            <ProgressBar value={stats.tasksTotal ? (stats.tasksCompleted / stats.tasksTotal) * 100 : 0} />
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
          <div className="flex items-center gap-2 text-text-muted">
            <BookOpen className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Classes</span>
          </div>
          <p className="mt-2 text-lg font-semibold text-text-primary">
            {stats.classesCompleted} <span className="text-sm font-normal text-text-muted">completed</span>
          </p>
          <p className="text-xs text-text-muted">{stats.classesPending} pending</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
          <div className="flex items-center gap-2 text-text-muted">
            <CalendarCheck className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Attendance</span>
          </div>
          <p className="mt-2 text-lg font-semibold text-text-primary">{stats.attendancePercentage}%</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
          <div className="flex items-center gap-2 text-text-muted">
            <IndianRupee className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Fee Paid</span>
          </div>
          <p className="mt-2 text-lg font-semibold text-emerald-600">{formatCurrency(stats.feePaid)}</p>
          <p className="text-xs text-text-muted">{formatCurrency(stats.feePending)} pending</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
          <div className="flex items-center gap-2 text-text-muted">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Tasks</span>
          </div>
          <p className="mt-2 text-lg font-semibold text-text-primary">
            {stats.tasksCompleted}/{stats.tasksTotal} <span className="text-sm font-normal text-text-muted">done</span>
          </p>
        </div>
      </div>
    </div>
  );
}
