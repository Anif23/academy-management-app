import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/common/States';
import { StatusBadge } from '../../components/ui/Badge';
import type { ClassReport } from '../../types';
import { formatDate } from '../../utils/format';

export function StudentClassReportsTab({ reports }: { reports: ClassReport[] }) {
  if (reports.length === 0) {
    return (
      <Card>
        <EmptyState title="No class reports for this batch yet" />
      </Card>
    );
  }

  const sorted = [...reports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-3">
      {sorted.map((report) => (
        <Card key={report.id}>
          <div className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-text-primary">{report.topic}</p>
                <p className="text-xs text-text-muted">
                  {report.module} · {formatDate(report.date)}
                </p>
              </div>
              <StatusBadge status={report.taskStatus} />
            </div>
            <p className="mt-2 text-sm text-text-secondary">{report.description}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
