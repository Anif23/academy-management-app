import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, CalendarClock, Paperclip } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardBody } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/Badge';
import { EmptyState, ErrorState, CardSkeleton } from '../components/common/States';
import { useMyTasks } from '../hooks/useTasks';
import { formatDate } from '../utils/format';

export default function MyTasks() {
  const { data: tasks, isLoading, isError, refetch } = useMyTasks();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="My Tasks" description="Tasks assigned to you individually or through your batch." />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !tasks || tasks.length === 0 ? (
        <Card>
          <EmptyState title="No tasks yet" description="Tasks assigned by your trainer will show up here." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((submission) => (
            <Card
              key={submission.id}
              className="cursor-pointer transition-shadow hover:shadow-soft-lg"
              onClick={() => navigate(`/my-tasks/${submission.taskId}`)}
            >
              <CardBody>
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-2 text-sm font-semibold text-text-primary">{submission.task.title}</p>
                  <StatusBadge status={submission.status} />
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs text-text-muted">{submission.task.description}</p>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <CalendarClock className="h-3.5 w-3.5" />
                    Due {formatDate(submission.task.dueDate)}
                  </span>
                  {submission.task.attachments.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Paperclip className="h-3.5 w-3.5" />
                      {submission.task.attachments.length} file(s)
                    </span>
                  )}
                </div>

                {submission.status === 'Needs Revision' && (
                  <div className="mt-2 flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-500/10 dark:text-red-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Trainer requested changes
                  </div>
                )}

                <div className="mt-3 flex items-center justify-end text-xs font-medium text-brand-600 dark:text-brand-400">
                  {submission.status === 'Pending' || submission.status === 'Needs Revision' || submission.status === 'Overdue'
                    ? 'Open & submit'
                    : 'View submission'}
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
