import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertCircle, CalendarCheck, CalendarClock, CheckCircle2, ClipboardList, GraduationCap, IndianRupee, Sparkles, TrendingUp, UsersRound } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { CardSkeleton, EmptyState, ErrorState } from '../components/common/States';
import { StatusBadge } from '../components/ui/Badge';
import { useCourseDistribution, useDashboardStats, useLeadFunnel, useRevenueSeries } from '../hooks/useDashboard';
import { useAllClassReports } from '../hooks/useClassReports';
import { useAllBatches } from '../hooks/useBatches';
import { useAllEmployees } from '../hooks/useEmployees';
import { useAllStudents } from '../hooks/useStudents';
import { useAllTasks } from '../hooks/useTasks';
import { useAllPerformance } from '../hooks/usePerformance';
import { computeOverallPerformance } from '../services/api';
import { formatCurrency, formatDate, initials, todayIso } from '../utils/format';
import { useAuthStore } from '../store/authStore';
import { cn } from '../utils/cn';

interface TrainerDashboardStats {
  dashboardType: 'trainer';
  myBatches: number;
  ongoingBatches: number;
  myStudents: number;
  activeStudents: number;
  avgAttendance: number;
  pendingSubmissions: number;
  batchesAttendancePending: number;
  classReportsFiledToday: number;
}

interface FollowUpLead {
  id: string;
  name: string;
  mobile: string;
  course: string;
  followUpDate: string;
  status: string;
}

interface CounsellorDashboardStats {
  dashboardType: 'counsellor';
  totalLeads: number;
  newThisWeek: number;
  admissionsThisMonth: number;
  followUpsDueToday: number;
  followUpsOverdue: number;
  todaysFollowUps: FollowUpLead[];
  overdueList: FollowUpLead[];
}

const PIE_COLORS = ['#4f46e5', '#818cf8', '#a5b4fc', '#f59e0b', '#10b981', '#ef4444'];
const TASK_STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b',
  Submitted: '#4f46e5',
  'Needs Revision': '#ef4444',
  Resubmitted: '#a855f7',
  Reviewed: '#10b981',
  Overdue: '#dc2626',
};

export default function Dashboard() {
  const role = useAuthStore((s) => s.user?.role);
  if (role === 'STAFF' || role === 'COUNSELLOR') return <StaffDashboard />;
  return <AdminDashboard />;
}

function StaffDashboard() {
  const { data: stats, isLoading, isError, refetch } = useDashboardStats() as unknown as {
    data?: TrainerDashboardStats | CounsellorDashboardStats;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="My Dashboard" description="What needs your attention today." />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div>
        <PageHeader title="My Dashboard" description="" />
        <Card>
          <ErrorState onRetry={refetch} />
        </Card>
      </div>
    );
  }

  if (stats.dashboardType === 'counsellor') {
    return <CounsellorDashboard stats={stats} />;
  }
  return <TrainerDashboard stats={stats} />;
}

function TrainerDashboard({ stats }: { stats: TrainerDashboardStats }) {
  const navigate = useNavigate();
  const hasPendingAttendance = stats.batchesAttendancePending > 0;

  return (
    <div>
      <PageHeader title="My Dashboard" description="Your assigned batches and students — not the full academy." />

      {/* "Today" — the one thing this dashboard exists to answer: what
          actually needs doing right now, not just static totals. */}
      <Card className="mb-6 border-brand-200 bg-brand-50/40 dark:border-brand-500/20 dark:bg-brand-500/5">
        <CardBody>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-600" />
            <h3 className="text-sm font-semibold text-text-primary">Today</h3>
          </div>
          <div className="mt-3 space-y-2">
            <TodayRow
              done={!hasPendingAttendance}
              label={
                hasPendingAttendance
                  ? `Attendance not yet marked for ${stats.batchesAttendancePending} of your ongoing batch(es)`
                  : "Attendance is up to date for all your ongoing batches"
              }
              actionLabel={hasPendingAttendance ? 'Mark now' : undefined}
              onAction={() => navigate('/attendance')}
            />
            <TodayRow
              done={stats.pendingSubmissions === 0}
              label={
                stats.pendingSubmissions > 0
                  ? `${stats.pendingSubmissions} task submission(s) waiting on your review`
                  : 'No submissions waiting on review'
              }
              actionLabel={stats.pendingSubmissions > 0 ? 'Review' : undefined}
              onAction={() => navigate('/tasks')}
            />
            <TodayRow
              done={stats.classReportsFiledToday > 0}
              label={
                stats.classReportsFiledToday > 0
                  ? `${stats.classReportsFiledToday} class report(s) filed today`
                  : "No class report filed yet today"
              }
              actionLabel={stats.classReportsFiledToday === 0 ? 'Add report' : undefined}
              onAction={() => navigate('/class-reports')}
            />
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="My Batches" value={stats.myBatches.toString()} icon={GraduationCap} tone="brand" onClick={() => navigate('/batches')} />
        <StatCard label="Ongoing Batches" value={stats.ongoingBatches.toString()} icon={CalendarClock} tone="green" />
        <StatCard label="My Students" value={stats.myStudents.toString()} icon={UsersRound} tone="purple" onClick={() => navigate('/students')} />
        <StatCard label="Active Students" value={stats.activeStudents.toString()} icon={CheckCircle2} tone="green" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Average Attendance"
          value={`${stats.avgAttendance}%`}
          icon={CalendarCheck}
          tone="amber"
          onClick={() => navigate('/attendance')}
        />
        <StatCard
          label="Submissions to Review"
          value={stats.pendingSubmissions.toString()}
          icon={ClipboardList}
          tone="red"
          onClick={() => navigate('/tasks')}
        />
      </div>

      <p className="mt-6 text-xs text-text-muted">
        Revenue, fees, and academy-wide reports are only visible to admin accounts.
      </p>
    </div>
  );
}

function CounsellorDashboard({ stats }: { stats: CounsellorDashboardStats }) {
  const navigate = useNavigate();
  const hasFollowUpsToday = stats.todaysFollowUps.length > 0;
  const hasOverdue = stats.overdueList.length > 0;

  return (
    <div>
      <PageHeader title="My Dashboard" description="Your leads and follow-ups — not the full academy." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="My Total Leads" value={stats.totalLeads.toString()} icon={UsersRound} tone="brand" onClick={() => navigate('/walk-ins')} />
        <StatCard label="New This Week" value={stats.newThisWeek.toString()} icon={ClipboardList} tone="purple" />
        <StatCard label="Due Today" value={stats.followUpsDueToday.toString()} icon={CalendarCheck} tone={hasFollowUpsToday ? 'amber' : 'green'} />
        <StatCard label="Overdue" value={stats.followUpsOverdue.toString()} icon={CalendarClock} tone={hasOverdue ? 'red' : 'green'} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Follow Up With Today" description={hasFollowUpsToday ? undefined : 'Nothing scheduled for today — nice and clear.'} />
          <CardBody>
            {hasFollowUpsToday ? (
              <ul className="space-y-2">
                {stats.todaysFollowUps.map((lead) => (
                  <FollowUpRow key={lead.id} lead={lead} onClick={() => navigate('/walk-ins')} />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-muted">You're all caught up for today.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Overdue Follow-ups" description={hasOverdue ? 'These passed their follow-up date without an update.' : undefined} />
          <CardBody>
            {hasOverdue ? (
              <ul className="space-y-2">
                {stats.overdueList.map((lead) => (
                  <FollowUpRow key={lead.id} lead={lead} overdue onClick={() => navigate('/walk-ins')} />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-muted">Nothing overdue. Great work staying on top of it.</p>
            )}
          </CardBody>
        </Card>
      </div>

      <p className="mt-6 text-xs text-text-muted">
        Revenue, fees, and academy-wide reports are only visible to admin accounts.
      </p>
    </div>
  );
}

function TodayRow({
  done,
  label,
  actionLabel,
  onAction,
}: {
  done: boolean;
  label: string;
  actionLabel?: string;
  onAction: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-surface px-3 py-2">
      <div className="flex items-center gap-2 text-sm">
        {done ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
        ) : (
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
        )}
        <span className={done ? 'text-text-secondary' : 'text-text-primary font-medium'}>{label}</span>
      </div>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function FollowUpRow({ lead, overdue, onClick }: { lead: FollowUpLead; overdue?: boolean; onClick: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 text-left transition-colors hover:bg-surface-hover"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text-primary">{lead.name}</p>
          <p className="truncate text-xs text-text-muted">
            {lead.course} · {lead.mobile}
          </p>
        </div>
        <span className={cn('shrink-0 text-xs font-semibold', overdue ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400')}>
          {formatDate(lead.followUpDate)}
        </span>
      </button>
    </li>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: revenue, isLoading: revenueLoading } = useRevenueSeries();
  const { data: courseSplit, isLoading: courseLoading } = useCourseDistribution();
  const { data: funnel, isLoading: funnelLoading } = useLeadFunnel();
  const { data: reports, isLoading: reportsLoading } = useAllClassReports();
  const { data: batches } = useAllBatches();
  const { data: employees } = useAllEmployees();
  const { data: students } = useAllStudents();
  const { data: tasks } = useAllTasks();
  const { data: performance } = useAllPerformance();

  function batchName(id: string) {
    return batches?.find((b) => b.id === id)?.name ?? 'Unknown batch';
  }

  function trainerName(id: string) {
    return employees?.find((e) => e.id === id)?.name ?? 'Unknown trainer';
  }

  const recentReports = [...(reports ?? [])]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  // Student growth: cumulative registered students by month, last 6 months.
  const studentGrowth = useMemo(() => {
    if (!students) return [];
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - (5 - i));
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en-US', { month: 'short' }), cutoff: new Date(d.getFullYear(), d.getMonth() + 1, 1) };
    });
    return months.map(({ label, cutoff }) => ({
      month: label,
      students: students.filter((s) => new Date(s.joiningDate) < cutoff).length,
    }));
  }, [students]);

  const taskBreakdown = useMemo(() => {
    if (!tasks) return [];
    const counts: Record<string, number> = {
      Pending: 0,
      Submitted: 0,
      'Needs Revision': 0,
      Resubmitted: 0,
      Reviewed: 0,
      Overdue: 0,
    };
    tasks.forEach((t) => {
      counts[t.status] = (counts[t.status] ?? 0) + 1;
    });
    return Object.entries(counts).filter(([, count]) => count > 0).map(([status, count]) => ({ status, count }));
  }, [tasks]);

  const upcomingBatches = useMemo(() => {
    if (!batches) return [];
    const today = todayIso();
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);
    return batches
      .filter((b) => b.startDate >= today && new Date(b.startDate) <= in30Days)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5);
  }, [batches]);

  const topPerformers = useMemo(() => {
    if (!performance || !students) return [];
    const latestByStudent = new Map<string, (typeof performance)[number]>();
    performance.forEach((record) => {
      const existing = latestByStudent.get(record.studentId);
      if (!existing || new Date(record.date).getTime() > new Date(existing.date).getTime()) {
        latestByStudent.set(record.studentId, record);
      }
    });
    return Array.from(latestByStudent.values())
      .sort((a, b) => computeOverallPerformance(b) - computeOverallPerformance(a))
      .slice(0, 5)
      .map((record) => ({ record, student: students.find((s) => s.id === record.studentId) }))
      .filter((row) => row.student);
  }, [performance, students]);

  const pendingTasksCount = tasks?.filter((t) => t.status !== 'Completed').length ?? 0;

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of academy operations, admissions, and revenue." />

      {statsError ? (
        <ErrorState message="Could not load dashboard statistics." onRetry={() => refetchStats()} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statsLoading || !stats ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                label="Total Students"
                value={stats.totalStudents.toString()}
                icon={GraduationCap}
                tone="brand"
                trend={{ value: `${stats.activeStudents} active`, direction: 'up' }}
              />
              <StatCard
                label="Ongoing Batches"
                value={`${stats.ongoingBatches} / ${stats.totalBatches}`}
                icon={UsersRound}
                tone="purple"
              />
              <StatCard
                label="Revenue Collected"
                value={formatCurrency(stats.totalRevenue)}
                icon={IndianRupee}
                tone="green"
                trend={{ value: formatCurrency(stats.pendingFees) + ' pending', direction: 'down' }}
              />
              <StatCard
                label="Avg. Attendance"
                value={`${stats.avgAttendance}%`}
                icon={CalendarCheck}
                tone="amber"
              />
            </>
          )}
        </div>
      )}

      {stats && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Admissions This Month" value={stats.admissionsThisMonth.toString()} icon={TrendingUp} tone="green" />
          <StatCard label="New Leads This Week" value={stats.newLeadsThisWeek.toString()} icon={ClipboardList} tone="brand" />
          <StatCard label="Tasks Pending" value={pendingTasksCount.toString()} icon={CheckCircle2} tone="amber" />
          <StatCard label="Trainers on Staff" value={stats.totalTrainers.toString()} icon={UsersRound} tone="purple" />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Revenue Trend" description="Monthly collected revenue vs. target (last 6 months)" />
          <CardBody>
            {revenueLoading ? (
              <div className="h-72 animate-pulse rounded-lg bg-surface-hover" />
            ) : !revenue || revenue.length === 0 ? (
              <EmptyState title="No revenue data yet" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenue}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} fill="url(#revenueFill)" name="Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Course Distribution" description="Active students by course" />
          <CardBody>
            {courseLoading ? (
              <div className="h-72 animate-pulse rounded-lg bg-surface-hover" />
            ) : !courseSplit || courseSplit.length === 0 ? (
              <EmptyState title="No students yet" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={courseSplit} dataKey="count" nameKey="course" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {courseSplit.map((entry, index) => (
                      <Cell key={entry.course} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
              {courseSplit?.map((entry, index) => (
                <div key={entry.course} className="flex items-center gap-1.5 text-xs text-text-muted">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                  {entry.course} ({entry.count})
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Student Growth" description="Cumulative registered students over the last 6 months" />
          <CardBody>
            {!students ? (
              <div className="h-64 animate-pulse rounded-lg bg-surface-hover" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={studentGrowth}>
                  <defs>
                    <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="students" stroke="#10b981" strokeWidth={2} fill="url(#growthFill)" name="Students" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Task Status" description="Across all assigned tasks" />
          <CardBody>
            {!tasks || tasks.length === 0 ? (
              <EmptyState title="No tasks yet" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={taskBreakdown} dataKey="count" nameKey="status" innerRadius={45} outerRadius={80} paddingAngle={2}>
                    {taskBreakdown.map((entry) => (
                      <Cell key={entry.status} fill={TASK_STATUS_COLORS[entry.status] ?? '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
              {taskBreakdown.map((entry) => (
                <div key={entry.status} className="flex items-center gap-1.5 text-xs text-text-muted">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: TASK_STATUS_COLORS[entry.status] ?? '#94a3b8' }} />
                  {entry.status} ({entry.count})
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader title="Lead Funnel" description="Walk-ins by lead status" />
          <CardBody>
            {funnelLoading ? (
              <div className="h-64 animate-pulse rounded-lg bg-surface-hover" />
            ) : !funnel || funnel.every((f) => f.count === 0) ? (
              <EmptyState title="No walk-in leads yet" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={funnel} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis type="category" dataKey="stage" tickLine={false} axisLine={false} fontSize={12} width={90} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader
            title="Upcoming Batches"
            description="Starting within the next 30 days"
            action={
              <button type="button" onClick={() => navigate('/batches')} className="text-xs font-medium text-brand-600 hover:underline">
                View all
              </button>
            }
          />
          {!batches ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-hover" />
              ))}
            </div>
          ) : upcomingBatches.length === 0 ? (
            <EmptyState title="No upcoming batches" description="Batches starting in the next 30 days will appear here." icon={<CalendarClock className="h-6 w-6" />} />
          ) : (
            <div className="divide-y divide-border">
              {upcomingBatches.map((batch) => (
                <button
                  key={batch.id}
                  type="button"
                  onClick={() => navigate('/batches')}
                  className="flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left transition-colors hover:bg-surface-hover"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">{batch.name}</p>
                    <p className="truncate text-xs text-text-muted">{trainerName(batch.trainerId)}</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-text-muted">{formatDate(batch.startDate)}</span>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader
            title="Top Performers"
            description="By latest overall score"
            action={
              <button type="button" onClick={() => navigate('/performance')} className="text-xs font-medium text-brand-600 hover:underline">
                View all
              </button>
            }
          />
          {!performance ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-hover" />
              ))}
            </div>
          ) : topPerformers.length === 0 ? (
            <EmptyState title="No evaluations yet" />
          ) : (
            <div className="divide-y divide-border">
              {topPerformers.map(({ record, student }) => (
                <button
                  key={record.id}
                  type="button"
                  onClick={() => student && navigate(`/students/${student.id}`)}
                  className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-surface-hover"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                    {student ? initials(student.name) : '—'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">{student?.name}</p>
                    <p className="truncate text-xs text-text-muted">{student?.studentId}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-brand-600">{computeOverallPerformance(record)}/10</span>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader
            title="Recent Class Reports"
            description="Latest training sessions logged by trainers"
            action={
              <button type="button" onClick={() => navigate('/class-reports')} className="text-xs font-medium text-brand-600 hover:underline">
                View all
              </button>
            }
          />
          {reportsLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-hover" />
              ))}
            </div>
          ) : recentReports.length === 0 ? (
            <EmptyState title="No class reports yet" description="Trainers can log a report after every class." />
          ) : (
            <div className="divide-y divide-border">
              {recentReports.map((report) => (
                <button
                  key={report.id}
                  type="button"
                  onClick={() => navigate('/class-reports')}
                  className="flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left transition-colors hover:bg-surface-hover"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">{report.topic}</p>
                    <p className="truncate text-xs text-text-muted">
                      {batchName(report.batchId)} · {trainerName(report.trainerId)} · {formatDate(report.date)}
                    </p>
                  </div>
                  <StatusBadge status={report.taskStatus} />
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
