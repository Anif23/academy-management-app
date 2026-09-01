import { useMemo, useState } from 'react';
import { Download, IndianRupee, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardBody } from '../components/ui/Card';
import { DataTable } from '../components/common/DataTable';
import type { DataTableColumn } from '../components/common/DataTable';
import { Button } from '../components/ui/Button';
import { Label, Select } from '../components/ui/Field';
import { StatusBadge } from '../components/ui/Badge';
import { StatCard } from '../components/common/StatCard';
import { useAllStudents } from '../hooks/useStudents';
import { useAllBatches } from '../hooks/useBatches';
import { useAllEmployees } from '../hooks/useEmployees';
import { useAllFees } from '../hooks/useFees';
import { useAllAttendance } from '../hooks/useAttendance';
import { useAllTasks } from '../hooks/useTasks';
import { useAllPerformance } from '../hooks/usePerformance';
import { useAllClassReports } from '../hooks/useClassReports';
import { useAllCourses } from '../hooks/useCourses';
import { computeAttendanceSummary, computeFeeSummary, computeOverallPerformance } from '../services/api';
import type { Student } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { downloadCsv } from '../utils/csv';

type ReportType = 'students' | 'attendance' | 'fees' | 'tasks' | 'performance' | 'batches' | 'trainers';

const REPORT_TYPES: Array<{ value: ReportType; label: string }> = [
  { value: 'students', label: 'Student Report' },
  { value: 'attendance', label: 'Attendance Report' },
  { value: 'fees', label: 'Fee / Income Report' },
  { value: 'tasks', label: 'Task Report' },
  { value: 'performance', label: 'Performance Report' },
  { value: 'batches', label: 'Batch Report' },
  { value: 'trainers', label: 'Trainer / Employee Report' },
];

const STATUSES = ['Active', 'On Hold', 'Completed', 'Dropped'];

export default function Reports() {
  const { data: students, isLoading: studentsLoading } = useAllStudents();
  const { data: batches } = useAllBatches();
  const { data: employees } = useAllEmployees();
  const { data: fees } = useAllFees();
  const { data: attendance } = useAllAttendance();
  const { data: tasks } = useAllTasks();
  const { data: performance } = useAllPerformance();
  const { data: classReports } = useAllClassReports();
  const { data: courses } = useAllCourses();

  const [reportType, setReportType] = useState<ReportType>('students');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');

  function batchName(id: string) {
    return batches?.find((b) => b.id === id)?.batchId ?? '—';
  }

  function studentOf(id: string) {
    return students?.find((s) => s.id === id);
  }

  function employeeName(id: string) {
    return employees?.find((e) => e.id === id)?.name ?? '—';
  }

  // ------------------------------------------------------------------
  // Students
  // ------------------------------------------------------------------
  const feeByStudent = useMemo(() => {
    const map = new Map<string, number>();
    fees?.forEach((fee) => map.set(fee.studentId, computeFeeSummary(fee).pendingAmount));
    return map;
  }, [fees]);

  const filteredStudents = useMemo(() => {
    return (students ?? []).filter((student) => {
      if (courseFilter !== 'all' && student.course !== courseFilter) return false;
      if (statusFilter !== 'all' && student.status !== statusFilter) return false;
      if (batchFilter !== 'all' && student.batchId !== batchFilter) return false;
      return true;
    });
  }, [students, courseFilter, statusFilter, batchFilter]);

  const studentColumns: Array<DataTableColumn<Student>> = [
    { key: 'studentId', header: 'Student ID', render: (row) => row.studentId },
    { key: 'name', header: 'Name', render: (row) => row.name },
    { key: 'course', header: 'Course', render: (row) => row.course },
    { key: 'batchId', header: 'Batch', render: (row) => batchName(row.batchId) },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'pending', header: 'Pending Fee', render: (row) => <span className="text-red-500">{formatCurrency(feeByStudent.get(row.id) ?? 0)}</span> },
    { key: 'joiningDate', header: 'Joined', render: (row) => formatDate(row.joiningDate) },
  ];

  // ------------------------------------------------------------------
  // Attendance
  // ------------------------------------------------------------------
  const attendanceRows = useMemo(() => {
    return filteredStudents.map((student) => {
      const records = attendance?.filter((a) => a.studentId === student.id) ?? [];
      const summary = computeAttendanceSummary(records);
      return { student, ...summary };
    });
  }, [filteredStudents, attendance]);

  // ------------------------------------------------------------------
  // Fees / Income
  // ------------------------------------------------------------------
  const feeRows = useMemo(() => {
    return filteredStudents
      .map((student) => {
        const fee = fees?.find((f) => f.studentId === student.id);
        if (!fee) return null;
        const summary = computeFeeSummary(fee);
        const status = summary.pendingAmount <= 0 ? 'Paid' : summary.paidAmount > 0 ? 'Partial' : 'Pending';
        return { student, fee, summary, status };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);
  }, [filteredStudents, fees]);

  const incomeTotals = useMemo(() => {
    return feeRows.reduce(
      (acc, row) => ({
        billed: acc.billed + row.summary.finalFee,
        collected: acc.collected + row.summary.paidAmount,
        pending: acc.pending + row.summary.pendingAmount,
      }),
      { billed: 0, collected: 0, pending: 0 },
    );
  }, [feeRows]);

  // ------------------------------------------------------------------
  // Tasks
  // ------------------------------------------------------------------
  const taskRows = useMemo(() => {
    const studentIds = new Set(filteredStudents.map((s) => s.id));
    return (tasks ?? []).filter((task) => studentIds.has(task.studentId));
  }, [tasks, filteredStudents]);

  // ------------------------------------------------------------------
  // Performance
  // ------------------------------------------------------------------
  const performanceRows = useMemo(() => {
    const studentIds = new Set(filteredStudents.map((s) => s.id));
    return (performance ?? []).filter((record) => studentIds.has(record.studentId));
  }, [performance, filteredStudents]);

  // ------------------------------------------------------------------
  // Batches
  // ------------------------------------------------------------------
  const batchRows = useMemo(() => {
    return (batches ?? []).filter((batch) => {
      if (courseFilter !== 'all' && batch.course !== courseFilter) return false;
      if (statusFilter !== 'all' && batch.status !== statusFilter) return false;
      return true;
    });
  }, [batches, courseFilter, statusFilter]);

  // ------------------------------------------------------------------
  // Trainers / Employees
  // ------------------------------------------------------------------
  const trainerRows = useMemo(() => {
    return (employees ?? []).map((employee) => {
      const assignedBatches = (batches ?? []).filter((b) => b.trainerId === employee.id || employee.assignedBatchIds.includes(b.id));
      const totalStudents = assignedBatches.reduce((sum, b) => sum + b.studentIds.length, 0);
      const reportsLogged = (classReports ?? []).filter((r) => r.trainerId === employee.id).length;
      return { employee, assignedBatches, totalStudents, reportsLogged };
    });
  }, [employees, batches, classReports]);

  function handleExport() {
    switch (reportType) {
      case 'students':
        downloadCsv(
          'student-report.csv',
          ['Student ID', 'Name', 'Course', 'Batch', 'Status', 'Pending Fee', 'Joined'],
          filteredStudents.map((s) => [s.studentId, s.name, s.course, batchName(s.batchId), s.status, feeByStudent.get(s.id) ?? 0, formatDate(s.joiningDate)]),
        );
        break;
      case 'attendance':
        downloadCsv(
          'attendance-report.csv',
          ['Student ID', 'Name', 'Batch', 'Total Classes', 'Present', 'Absent', 'Leave', 'Attendance %'],
          attendanceRows.map((row) => [
            row.student.studentId,
            row.student.name,
            batchName(row.student.batchId),
            row.total,
            row.present,
            row.absent,
            row.leave,
            `${row.percentage}%`,
          ]),
        );
        break;
      case 'fees':
        downloadCsv(
          'fee-income-report.csv',
          ['Student ID', 'Name', 'Course Fee', 'Discount', 'Final Fee', 'Paid', 'Pending', 'Status'],
          feeRows.map((row) => [
            row.student.studentId,
            row.student.name,
            row.summary.courseFee,
            row.summary.discount,
            row.summary.finalFee,
            row.summary.paidAmount,
            row.summary.pendingAmount,
            row.status,
          ]),
        );
        break;
      case 'tasks':
        downloadCsv(
          'task-report.csv',
          ['Title', 'Student', 'Batch', 'Priority', 'Status', 'Assigned Date', 'Due Date'],
          taskRows.map((task) => [
            task.title,
            studentOf(task.studentId)?.name ?? 'Unknown',
            task.batchId ? batchName(task.batchId) : 'Individual',
            task.priority,
            task.status,
            formatDate(task.assignedDate),
            formatDate(task.dueDate),
          ]),
        );
        break;
      case 'performance':
        downloadCsv(
          'performance-report.csv',
          ['Student', 'Date', 'Technical', 'Practical', 'Communication', 'Attendance', 'Task Completion', 'Behaviour', 'Overall'],
          performanceRows.map((record) => [
            studentOf(record.studentId)?.name ?? 'Unknown',
            formatDate(record.date),
            record.technicalKnowledge,
            record.practicalSkills,
            record.communication,
            record.attendance,
            record.taskCompletion,
            record.behaviour,
            computeOverallPerformance(record),
          ]),
        );
        break;
      case 'batches':
        downloadCsv(
          'batch-report.csv',
          ['Batch ID', 'Name', 'Course', 'Trainer', 'Students', 'Status', 'Start Date', 'End Date'],
          batchRows.map((batch) => [
            batch.batchId,
            batch.name,
            batch.course,
            employeeName(batch.trainerId),
            batch.studentIds.length,
            batch.status,
            formatDate(batch.startDate),
            formatDate(batch.endDate),
          ]),
        );
        break;
      case 'trainers':
        downloadCsv(
          'trainer-employee-report.csv',
          ['Employee ID', 'Name', 'Type', 'Status', 'Assigned Batches', 'Total Students', 'Class Reports Logged'],
          trainerRows.map((row) => [
            row.employee.employeeId,
            row.employee.name,
            row.employee.type,
            row.employee.status,
            row.assignedBatches.length,
            row.totalStudents,
            row.reportsLogged,
          ]),
        );
        break;
    }
  }

  const showCourseStatusFilters = ['students', 'attendance', 'fees', 'tasks', 'performance', 'batches'].includes(reportType);
  const showBatchFilter = ['students', 'attendance', 'fees', 'tasks', 'performance'].includes(reportType);

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Choose a report type and export exactly what you're viewing as CSV."
        action={
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <Card className="mb-4">
        <CardBody>
          <div className="flex flex-wrap gap-4">
            <div className="w-full sm:w-64">
              <Label htmlFor="report-type">Report Type</Label>
              <Select id="report-type" value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)}>
                {REPORT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>
            {showCourseStatusFilters && (
              <div className="w-full sm:w-56">
                <Label htmlFor="report-course">Course</Label>
                <Select id="report-course" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
                  <option value="all">All Courses</option>
                  {courses?.map((course) => (
                    <option key={course.id} value={course.name}>
                      {course.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}
            {reportType !== 'trainers' && (
              <div className="w-full sm:w-48">
                <Label htmlFor="report-status">Status</Label>
                <Select id="report-status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  {(reportType === 'batches' ? ['Upcoming', 'Ongoing', 'Completed'] : STATUSES).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </div>
            )}
            {showBatchFilter && (
              <div className="w-full sm:w-56">
                <Label htmlFor="report-batch">Batch</Label>
                <Select id="report-batch" value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)}>
                  <option value="all">All Batches</option>
                  {batches?.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {reportType === 'fees' && (
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total Billed" value={formatCurrency(incomeTotals.billed)} icon={IndianRupee} tone="brand" />
          <StatCard label="Collected" value={formatCurrency(incomeTotals.collected)} icon={TrendingUp} tone="green" />
          <StatCard label="Pending" value={formatCurrency(incomeTotals.pending)} icon={TrendingDown} tone="amber" />
        </div>
      )}

      {reportType === 'students' && (
        <DataTable
          columns={studentColumns}
          data={filteredStudents}
          rowKey={(row) => row.id}
          isLoading={studentsLoading}
          page={1}
          pageSize={filteredStudents.length || 1}
          total={filteredStudents.length}
          emptyTitle="No students match these filters"
        />
      )}

      {reportType === 'attendance' && (
        <DataTable
          columns={[
            { key: 'name', header: 'Student', render: (row) => <><p className="font-medium text-text-primary">{row.student.name}</p><p className="text-xs text-text-muted">{row.student.studentId}</p></> },
            { key: 'batch', header: 'Batch', render: (row) => batchName(row.student.batchId) },
            { key: 'total', header: 'Total Classes', render: (row) => row.total },
            { key: 'present', header: 'Present', render: (row) => <span className="text-emerald-600">{row.present}</span> },
            { key: 'absent', header: 'Absent', render: (row) => <span className="text-red-500">{row.absent}</span> },
            { key: 'leave', header: 'Leave', render: (row) => <span className="text-amber-600">{row.leave}</span> },
            { key: 'percentage', header: 'Attendance %', render: (row) => `${row.percentage}%` },
          ]}
          data={attendanceRows}
          rowKey={(row) => row.student.id}
          page={1}
          pageSize={attendanceRows.length || 1}
          total={attendanceRows.length}
          emptyTitle="No attendance data for these filters"
        />
      )}

      {reportType === 'fees' && (
        <DataTable
          columns={[
            { key: 'name', header: 'Student', render: (row) => <><p className="font-medium text-text-primary">{row.student.name}</p><p className="text-xs text-text-muted">{row.student.studentId}</p></> },
            { key: 'courseFee', header: 'Course Fee', render: (row) => formatCurrency(row.summary.courseFee) },
            { key: 'discount', header: 'Discount', render: (row) => formatCurrency(row.summary.discount) },
            { key: 'finalFee', header: 'Final Fee', render: (row) => formatCurrency(row.summary.finalFee) },
            { key: 'paid', header: 'Paid', render: (row) => <span className="text-emerald-600">{formatCurrency(row.summary.paidAmount)}</span> },
            { key: 'pending', header: 'Pending', render: (row) => <span className="text-red-500">{formatCurrency(row.summary.pendingAmount)}</span> },
            { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          ]}
          data={feeRows}
          rowKey={(row) => row.fee.id}
          page={1}
          pageSize={feeRows.length || 1}
          total={feeRows.length}
          emptyTitle="No fee records for these filters"
        />
      )}

      {reportType === 'tasks' && (
        <DataTable
          columns={[
            { key: 'title', header: 'Task', render: (row) => row.title },
            { key: 'student', header: 'Student', render: (row) => studentOf(row.studentId)?.name ?? 'Unknown' },
            { key: 'batch', header: 'Batch', render: (row) => (row.batchId ? batchName(row.batchId) : 'Individual') },
            { key: 'priority', header: 'Priority', render: (row) => <StatusBadge status={row.priority} /> },
            { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            { key: 'dueDate', header: 'Due Date', render: (row) => formatDate(row.dueDate) },
          ]}
          data={taskRows}
          rowKey={(row) => row.id}
          page={1}
          pageSize={taskRows.length || 1}
          total={taskRows.length}
          emptyTitle="No tasks for these filters"
        />
      )}

      {reportType === 'performance' && (
        <DataTable
          columns={[
            { key: 'student', header: 'Student', render: (row) => studentOf(row.studentId)?.name ?? 'Unknown' },
            { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
            { key: 'technical', header: 'Technical', render: (row) => `${row.technicalKnowledge}/10` },
            { key: 'practical', header: 'Practical', render: (row) => `${row.practicalSkills}/10` },
            { key: 'communication', header: 'Communication', render: (row) => `${row.communication}/10` },
            { key: 'overall', header: 'Overall', render: (row) => <span className="font-semibold text-brand-600">{computeOverallPerformance(row)}/10</span> },
          ]}
          data={performanceRows}
          rowKey={(row) => row.id}
          page={1}
          pageSize={performanceRows.length || 1}
          total={performanceRows.length}
          emptyTitle="No performance records for these filters"
        />
      )}

      {reportType === 'batches' && (
        <DataTable
          columns={[
            { key: 'name', header: 'Batch', render: (row) => <><p className="font-medium text-text-primary">{row.name}</p><p className="text-xs text-text-muted">{row.batchId}</p></> },
            { key: 'course', header: 'Course', render: (row) => row.course },
            { key: 'trainer', header: 'Trainer', render: (row) => employeeName(row.trainerId) },
            {
              key: 'students',
              header: 'Students',
              render: (row) => (
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-text-muted" />
                  {row.studentIds.length}
                </span>
              ),
            },
            { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            { key: 'startDate', header: 'Start', render: (row) => formatDate(row.startDate) },
            { key: 'endDate', header: 'End', render: (row) => formatDate(row.endDate) },
          ]}
          data={batchRows}
          rowKey={(row) => row.id}
          page={1}
          pageSize={batchRows.length || 1}
          total={batchRows.length}
          emptyTitle="No batches for these filters"
        />
      )}

      {reportType === 'trainers' && (
        <DataTable
          columns={[
            { key: 'name', header: 'Employee', render: (row) => <><p className="font-medium text-text-primary">{row.employee.name}</p><p className="text-xs text-text-muted">{row.employee.employeeId}</p></> },
            { key: 'type', header: 'Type', render: (row) => <StatusBadge status={row.employee.type} /> },
            { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.employee.status} /> },
            { key: 'batches', header: 'Assigned Batches', render: (row) => row.assignedBatches.length },
            { key: 'students', header: 'Total Students', render: (row) => row.totalStudents },
            { key: 'reports', header: 'Class Reports Logged', render: (row) => row.reportsLogged },
          ]}
          data={trainerRows}
          rowKey={(row) => row.employee.id}
          page={1}
          pageSize={trainerRows.length || 1}
          total={trainerRows.length}
          emptyTitle="No employees found"
        />
      )}
    </div>
  );
}
