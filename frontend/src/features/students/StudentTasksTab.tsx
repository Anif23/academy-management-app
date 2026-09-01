import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/common/States';
import { StatusBadge } from '../../components/ui/Badge';
import type { StudentTask } from '../../types';
import { formatDate } from '../../utils/format';

export function StudentTasksTab({ tasks }: { tasks: StudentTask[] }) {
  if (tasks.length === 0) {
    return (
      <Card>
        <EmptyState title="No tasks assigned" description="Tasks assigned by trainers will appear here." />
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card key={task.id}>
          <div className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-text-primary">{task.title}</p>
                <p className="mt-1 text-sm text-text-muted">{task.description}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <StatusBadge status={task.priority} />
                <StatusBadge status={task.status} />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-text-muted">
              <span>Assigned: {formatDate(task.assignedDate)}</span>
              <span>Due: {formatDate(task.dueDate)}</span>
            </div>
            {task.trainerRemarks && (
              <p className="mt-2 rounded-lg bg-surface-muted px-3 py-2 text-xs text-text-secondary">{task.trainerRemarks}</p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
