import { useNavigate } from 'react-router-dom';
import { AlertTriangle, BookOpen, CalendarCheck, CheckCircle2, IndianRupee, Sparkles } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import type { MyTask, Student } from '../../types';
import type { StudentDashboardStats } from '../../types';
import { formatCurrency } from '../../utils/format';

interface AttentionItem {
  label: string;
  actionLabel: string;
  onAction: () => void;
  tone: 'red' | 'amber';
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-hover">
      <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

export function StudentOverviewTab({
  student,
  stats,
  tasks = [],
  onViewFees,
  /** Only the student looking at their own profile gets the attention banner —
      a trainer/counsellor/admin viewing this student's profile doesn't need
      "you have pending fees" addressed to them, and doesn't need an
      always-visible "all caught up" card either. */
  showAttention = false,
}: {
  student: Student;
  stats: StudentDashboardStats;
  tasks?: MyTask[];
  onViewFees?: () => void;
  showAttention?: boolean;
}) {
  const navigate = useNavigate();

  const overdueTasks = tasks.filter((t) => t.status === 'Overdue').length;
  const needsRevisionTasks = tasks.filter((t) => t.status === 'Needs Revision').length;

  const attentionItems: AttentionItem[] = [];
  if (stats.feePending > 0) {
    attentionItems.push({
      label: `${formatCurrency(stats.feePending)} in fees is pending`,
      actionLabel: 'View fees',
      onAction: () => onViewFees?.(),
      tone: 'amber',
    });
  }
  if (overdueTasks > 0) {
    attentionItems.push({
      label: `${overdueTasks} task${overdueTasks > 1 ? 's are' : ' is'} overdue`,
      actionLabel: 'View tasks',
      onAction: () => navigate('/my-tasks'),
      tone: 'red',
    });
  }
  if (needsRevisionTasks > 0) {
    attentionItems.push({
      label: `${needsRevisionTasks} task${needsRevisionTasks > 1 ? 's need' : ' needs'} revision from your trainer`,
      actionLabel: 'View tasks',
      onAction: () => navigate('/my-tasks'),
      tone: 'red',
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {showAttention && attentionItems.length > 0 && (
        <Card className="lg:col-span-3 border-amber-200 bg-amber-50/50 dark:border-amber-500/20 dark:bg-amber-500/5">
          <CardBody>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-semibold text-text-primary">Needs Your Attention</h3>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {attentionItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-lg bg-surface px-3 py-2.5 shadow-sm"
                >
                  <span
                    className={
                      item.tone === 'red'
                        ? 'text-sm font-medium text-red-600 dark:text-red-400'
                        : 'text-sm font-medium text-amber-700 dark:text-amber-400'
                    }
                  >
                    {item.label}
                  </span>
                  <button
                    type="button"
                    onClick={item.onAction}
                    className="shrink-0 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                  >
                    {item.actionLabel}
                  </button>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {showAttention && attentionItems.length === 0 && (
        <Card className="lg:col-span-3 border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-500/5">
          <CardBody className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              You're all caught up — no pending fees or tasks need your attention.
            </p>
          </CardBody>
        </Card>
      )}

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
