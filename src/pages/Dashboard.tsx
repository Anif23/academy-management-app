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
import { CalendarCheck, CalendarClock, CheckCircle2, ClipboardList, GraduationCap, IndianRupee, TrendingUp, UsersRound } from 'lucide-react';
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

const PIE_COLORS = ['#4f46e5', '#818cf8', '#a5b4fc', '#f59e0b', '#10b981', '#ef4444'];
const TASK_STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b',
  'In Progress': '#4f46e5',
  Completed: '#10b981',
};

export default function Dashboard() {
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
    const counts: Record<string, number> = { Pending: 0, 'In Progress': 0, Completed: 0 };
    tasks.forEach((t) => {
      counts[t.status] = (counts[t.status] ?? 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
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
