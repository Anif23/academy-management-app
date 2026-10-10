import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/common/States';
import { StatusBadge } from '../../components/ui/Badge';
import type { MyTask } from '../../types';
import { formatDate } from '../../utils/format';

/** Read-only view of a student's tasks — used on admin/staff's Student Profile page. */
export function StudentTasksTab({ tasks }: { tasks: MyTask[] }) {
  if (tasks.length === 0) {
    return (
      <Card>
        <EmptyState title="No tasks assigned" description="Tasks assigned by trainers will appear here." />
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((submission) => (
        <Card key={submission.id}>
          <div className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-text-primary">{submission.task.title}</p>
                <p className="mt-1 text-sm text-text-muted">{submission.task.description}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <StatusBadge status={submission.task.priority} />
                <StatusBadge status={submission.status} />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-text-muted">
              <span>Assigned: {formatDate(submission.task.assignedDate)}</span>
              <span>Due: {formatDate(submission.task.dueDate)}</span>
              {submission.submittedAt && <span>Submitted: {formatDate(submission.submittedAt)}</span>}
              {submission.task.batch && <span>Batch: {submission.task.batch.name}</span>}
            </div>
            {submission.trainerFeedback && (
              <p className="mt-2 rounded-lg bg-surface-muted px-3 py-2 text-xs text-text-secondary">
                <span className="font-medium text-text-primary">Trainer feedback: </span>
                <span className="rich-content inline" dangerouslySetInnerHTML={{ __html: submission.trainerFeedback }} />
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
