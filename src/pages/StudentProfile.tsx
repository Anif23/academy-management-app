import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, Pencil, Phone } from 'lucide-react';
import { ErrorState } from '../components/common/States';
import { StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Drawer } from '../components/common/Drawer';
import { StudentForm } from '../features/students/StudentForm';
import { useStudent, useUpdateStudent } from '../hooks/useStudents';
import { useStudentDashboardStats } from '../hooks/useDashboard';
import { useAllBatches } from '../hooks/useBatches';
import { useAllEmployees } from '../hooks/useEmployees';
import { useAllCourses } from '../hooks/useCourses';
import { useFeeByStudent } from '../hooks/useFees';
import { useAttendanceByStudent } from '../hooks/useAttendance';
import { useAllClassReports } from '../hooks/useClassReports';
import { useTasksByStudent } from '../hooks/useTasks';
import { usePerformanceByStudent } from '../hooks/usePerformance';
import { StudentOverviewTab } from '../features/students/StudentOverviewTab';
import { StudentFeeTab } from '../features/students/StudentFeeTab';
import { StudentAttendanceTab } from '../features/students/StudentAttendanceTab';
import { StudentClassReportsTab } from '../features/students/StudentClassReportsTab';
import { StudentTasksTab } from '../features/students/StudentTasksTab';
import { StudentPerformanceTab } from '../features/students/StudentPerformanceTab';
import { formatDate, initials } from '../utils/format';
import { cn } from '../utils/cn';

const TABS = ['Overview', 'Fees', 'Attendance', 'Class Reports', 'Tasks', 'Performance'] as const;
type Tab = (typeof TABS)[number];

export default function StudentProfile() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [editOpen, setEditOpen] = useState(false);

  const { data: student, isLoading, isError, refetch } = useStudent(studentId);
  const { data: stats } = useStudentDashboardStats(studentId);
  const { data: batches } = useAllBatches();
  const { data: employees } = useAllEmployees();
  const { data: courses } = useAllCourses();
  const { data: fee } = useFeeByStudent(studentId);
  const { data: attendance } = useAttendanceByStudent(studentId);
  const { data: allClassReports } = useAllClassReports();
  const { data: tasks } = useTasksByStudent(studentId);
  const { data: performance } = usePerformanceByStudent(studentId);
  const updateMutation = useUpdateStudent();

  const counsellors = useMemo(() => employees?.filter((e) => e.type === 'Counsellor') ?? [], [employees]);
  const batch = useMemo(() => batches?.find((b) => b.id === student?.batchId), [batches, student]);
  const counsellor = useMemo(() => employees?.find((e) => e.id === student?.counsellorId), [employees, student]);
  const trainer = useMemo(() => employees?.find((e) => e.id === batch?.trainerId), [employees, batch]);
  const batchReports = useMemo(
    () =>
      (allClassReports ?? []).filter(
        (r) => r.batchId === student?.batchId && student && r.date >= student.joiningDate,
      ),
    [allClassReports, student],
  );

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-xl bg-surface-hover" />;
  }

  if (isError || !student) {
    return <ErrorState message="Could not load this student profile." onRetry={() => refetch()} />;
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/students')} className="-ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </Button>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="h-3.5 w-3.5" />
          Edit Student
        </Button>
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-surface p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-50 text-lg font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
              {student.photo ? <img src={student.photo} alt={student.name} className="h-full w-full object-cover" /> : initials(student.name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-text-primary">{student.name}</h1>
                <StatusBadge status={student.status} />
              </div>
              <p className="text-sm text-text-muted">{student.studentId}</p>
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
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs text-text-muted">Course</dt>
              <dd className="font-medium text-text-primary">{student.course}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Batch</dt>
              <dd className="font-medium text-text-primary">{batch?.batchId ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Trainer</dt>
              <dd className="font-medium text-text-primary">{trainer?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Counsellor</dt>
              <dd className="font-medium text-text-primary">{counsellor?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Joining Date</dt>
              <dd className="font-medium text-text-primary">{formatDate(student.joiningDate)}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Mode</dt>
              <dd className="font-medium text-text-primary">{student.mode}</dd>
            </div>
          </dl>
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
              activeTab === tab
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-text-muted hover:text-text-primary',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && stats && <StudentOverviewTab student={student} stats={stats} />}
      {activeTab === 'Fees' && <StudentFeeTab fee={fee} />}
      {activeTab === 'Attendance' && <StudentAttendanceTab records={attendance ?? []} />}
      {activeTab === 'Class Reports' && <StudentClassReportsTab reports={batchReports} />}
      {activeTab === 'Tasks' && <StudentTasksTab tasks={tasks ?? []} />}
      {activeTab === 'Performance' && <StudentPerformanceTab records={performance ?? []} />}

      <Drawer open={editOpen} onClose={() => setEditOpen(false)} title="Edit Student" description="Update the student's information.">
        <StudentForm
          defaultValues={student}
          courses={courses ?? []}
          batches={batches ?? []}
          counsellors={counsellors}
          showPhotoUpload={false}
          isSubmitting={updateMutation.isPending}
          onCancel={() => setEditOpen(false)}
          onSubmit={(values) => {
            updateMutation.mutate({ id: student.id, patch: values }, { onSuccess: () => setEditOpen(false) });
          }}
        />
      </Drawer>
    </div>
  );
}
