import { Card, CardHeader } from '../../components/ui/Card';
import { EmptyState } from '../../components/common/States';
import { StatusBadge } from '../../components/ui/Badge';
import type { AttendanceRecord } from '../../types';
import { computeAttendanceSummary } from '../../services/api';
import { formatDate } from '../../utils/format';

export function StudentAttendanceTab({ records }: { records: AttendanceRecord[] }) {
  const summary = computeAttendanceSummary(records);
  const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Classes', value: summary.total },
          { label: 'Present', value: summary.present },
          { label: 'Absent', value: summary.absent },
          { label: 'Attendance %', value: `${summary.percentage}%` },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-surface p-4 shadow-soft">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{item.label}</p>
            <p className="mt-1.5 text-lg font-semibold text-text-primary">{item.value}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader title="Attendance History" />
        {sorted.length === 0 ? (
          <EmptyState title="No attendance records yet" />
        ) : (
          <div className="max-h-80 divide-y divide-border overflow-y-auto">
            {sorted.map((record) => (
              <div key={record.id} className="flex items-center justify-between px-5 py-3">
                <p className="text-sm text-text-secondary">{formatDate(record.date)}</p>
                <StatusBadge status={record.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
