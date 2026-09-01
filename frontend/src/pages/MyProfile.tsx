import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Mail, MapPin, Phone } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { ErrorState } from '../components/common/States';
import { StatusBadge } from '../components/ui/Badge';
import { studentsApi, feesApi, attendanceApi, tasksApi, performanceApi, getMyDashboardStats } from '../services/api';
import { StudentOverviewTab } from '../features/students/StudentOverviewTab';
import { StudentFeeTab } from '../features/students/StudentFeeTab';
import { StudentAttendanceTab } from '../features/students/StudentAttendanceTab';
import { StudentTasksTab } from '../features/students/StudentTasksTab';
import { StudentPerformanceTab } from '../features/students/StudentPerformanceTab';
import { formatDate, initials } from '../utils/format';
import { cn } from '../utils/cn';

const TABS = ['Overview', 'Fees', 'Attendance', 'Tasks', 'Performance'] as const;
type Tab = (typeof TABS)[number];

export default function MyProfile() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  const studentQuery = useQuery({ queryKey: ['me', 'student'], queryFn: studentsApi.getMe });
  const statsQuery = useQuery({ queryKey: ['me', 'dashboard'], queryFn: getMyDashboardStats });
  const feeQuery = useQuery({ queryKey: ['me', 'fee'], queryFn: feesApi.getMine });
  const attendanceQuery = useQuery({ queryKey: ['me', 'attendance'], queryFn: attendanceApi.getMine });
  const tasksQuery = useQuery({ queryKey: ['me', 'tasks'], queryFn: tasksApi.getMine });
  const performanceQuery = useQuery({ queryKey: ['me', 'performance'], queryFn: performanceApi.getMine });

  const student = studentQuery.data;

  if (studentQuery.isLoading) {
    return <div className="h-64 animate-pulse rounded-xl bg-surface-hover" />;
  }

  if (studentQuery.isError || !student) {
    return <ErrorState message="Could not load your profile." onRetry={() => studentQuery.refetch()} />;
  }

  return (
    <div>
      <PageHeader title="My Profile" description="Your course, attendance, fees, tasks, and performance — read-only." />

      <div className="mb-6 rounded-2xl border border-border bg-surface p-6 shadow-soft">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-50 text-lg font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
            {student.photo ? <img src={student.photo} alt={student.name} className="h-full w-full object-cover" /> : initials(student.name)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-text-primary">{student.name}</h1>
              <StatusBadge status={student.status} />
            </div>
            <p className="text-sm text-text-muted">
              {student.studentId} · {student.course}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {student.email}
              </span>
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {student.mobile}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {student.address}
              </span>
              <span>Joined {formatDate(student.joiningDate)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              'border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors',
              activeTab === tab ? 'border-brand-600 text-brand-600' : 'border-transparent text-text-muted hover:text-text-primary',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && statsQuery.data && <StudentOverviewTab student={student} stats={statsQuery.data} />}
      {activeTab === 'Fees' && <StudentFeeTab fee={feeQuery.data} />}
      {activeTab === 'Attendance' && <StudentAttendanceTab records={attendanceQuery.data ?? []} />}
      {activeTab === 'Tasks' && <StudentTasksTab tasks={tasksQuery.data ?? []} />}
      {activeTab === 'Performance' && <StudentPerformanceTab records={performanceQuery.data ?? []} />}
    </div>
  );
}
