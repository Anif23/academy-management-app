import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, Info } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Label, Select } from '../components/ui/Field';
import { EmptyState } from '../components/common/States';
import { useAllBatches } from '../hooks/useBatches';
import { useAllStudents } from '../hooks/useStudents';
import { useAttendanceByBatchDate, useMarkBulkAttendance } from '../hooks/useAttendance';
import type { AttendanceStatus } from '../types';
import { cn } from '../utils/cn';
import { formatDate, initials, todayIso } from '../utils/format';

const STATUS_OPTIONS: AttendanceStatus[] = ['Present', 'Absent', 'Leave'];

const STATUS_STYLES: Record<AttendanceStatus, string> = {
  Present: 'bg-emerald-600 text-white border-emerald-600',
  Absent: 'bg-red-600 text-white border-red-600',
  Leave: 'bg-amber-500 text-white border-amber-500',
};

export default function Attendance() {
  const { data: batches } = useAllBatches();
  const { data: students } = useAllStudents();
  const [batchId, setBatchId] = useState('');
  const [date, setDate] = useState(todayIso());
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({});

  useEffect(() => {
    if (!batchId && batches && batches.length > 0) {
      setBatchId(batches.find((b) => b.status === 'Ongoing')?.id ?? batches[0].id);
    }
  }, [batches, batchId]);

  const { data: existingRecords, isLoading } = useAttendanceByBatchDate(batchId, date);
  const markMutation = useMarkBulkAttendance();

  const batchAllStudents = useMemo(() => (students ?? []).filter((s) => s.batchId === batchId), [students, batchId]);

  // A student can only be marked present/absent for a class that happens on
  // or after the day they actually joined the academy.
  const batchStudents = useMemo(
    () => batchAllStudents.filter((s) => s.joiningDate && s.joiningDate <= date),
    [batchAllStudents, date],
  );

  const notYetJoinedCount = batchAllStudents.length - batchStudents.length;

  useEffect(() => {
    const initial: Record<string, AttendanceStatus> = {};
    batchStudents.forEach((student) => {
      const existing = existingRecords?.find((r) => r.studentId === student.id);
      initial[student.id] = existing?.status ?? 'Present';
    });
    setMarks(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId, date, existingRecords]);

  function setMark(studentId: string, status: AttendanceStatus) {
    setMarks((prev) => ({ ...prev, [studentId]: status }));
  }

  function markAll(status: AttendanceStatus) {
    const next: Record<string, AttendanceStatus> = {};
    batchStudents.forEach((student) => {
      next[student.id] = status;
    });
    setMarks(next);
  }

  function handleSave() {
    const payload = batchStudents.map((student) => ({ studentId: student.id, status: marks[student.id] ?? 'Present' }));
    markMutation.mutate({ batchId, date, marks: payload });
  }

  const presentCount = Object.values(marks).filter((status) => status === 'Present').length;

  return (
    <div>
      <PageHeader title="Attendance" description="Mark and review daily attendance per batch." />

      <Card className="mb-4">
        <CardBody>
          <div className="flex flex-wrap items-end gap-4">
            <div className="w-full sm:w-64">
              <Label htmlFor="attendance-batch">Batch</Label>
              <Select id="attendance-batch" value={batchId} onChange={(e) => setBatchId(e.target.value)}>
                {batches?.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="attendance-date">Date</Label>
              <input
                id="attendance-date"
                type="date"
                value={date}
                max={todayIso()}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="ml-auto flex items-center gap-2 text-sm text-text-muted">
              <CalendarCheck className="h-4 w-4" />
              {presentCount} / {batchStudents.length} present
            </div>
          </div>

          {notYetJoinedCount > 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400">
              <Info className="h-3.5 w-3.5 shrink-0" />
              {notYetJoinedCount} student{notYetJoinedCount > 1 ? 's' : ''} in this batch join{notYetJoinedCount === 1 ? 's' : ''} after {formatDate(date)} and {notYetJoinedCount === 1 ? "isn't" : "aren't"} shown here yet.
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Mark Attendance"
          description={batchStudents.length ? `${batchStudents.length} student(s) eligible for this date` : undefined}
          action={
            batchStudents.length > 0 ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => markAll('Present')}>
                  Mark All Present
                </Button>
                <Button variant="outline" size="sm" onClick={() => markAll('Absent')}>
                  Mark All Absent
                </Button>
              </div>
            ) : undefined
          }
        />
        {isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-hover" />
            ))}
          </div>
        ) : batchStudents.length === 0 ? (
          <EmptyState
            title="No students to mark for this date"
            description={
              batchAllStudents.length === 0
                ? 'No students are assigned to this batch yet.'
                : 'All students in this batch join after the selected date.'
            }
          />
        ) : (
          <div className="divide-y divide-border">
            {batchStudents.map((student) => (
              <div key={student.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                    {initials(student.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{student.name}</p>
                    <p className="text-xs text-text-muted">{student.studentId}</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setMark(student.id, status)}
                      className={cn(
                        'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                        marks[student.id] === status ? STATUS_STYLES[status] : 'border-border text-text-secondary hover:bg-surface-hover',
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {batchStudents.length > 0 && (
          <div className="flex justify-end border-t border-border px-5 py-4">
            <Button onClick={handleSave} loading={markMutation.isPending}>
              Save Attendance
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
