import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Eye, RotateCcw, Search } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Label, Select } from '../components/ui/Field';
import { StatusBadge } from '../components/ui/Badge';
import { RichTextEditor } from '../components/ui/RichTextEditor';
import { FilePreviewList } from '../components/ui/FileUploadField';
import { CardSkeleton, EmptyState, ErrorState } from '../components/common/States';
import { Modal } from '../components/common/Modal';
import { useReviewSubmission, useTask } from '../hooks/useTasks';
import type { SubmissionStatus, TaskSubmission } from '../types';
import { formatDate, formatDateTime } from '../utils/format';
import { useCan } from '../hooks/usePermission';

const STATUS_OPTIONS: SubmissionStatus[] = ['Pending', 'Submitted', 'Needs Revision', 'Resubmitted', 'Reviewed', 'Overdue'];

export default function TaskReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: task, isLoading, isError, refetch } = useTask(id);
  const [statusFilter, setStatusFilter] = useState<'all' | SubmissionStatus>('all');
  const [search, setSearch] = useState('');
  const [activeSubmission, setActiveSubmission] = useState<TaskSubmission | null>(null);

  const filtered = useMemo(() => {
    if (!task) return [];
    return task.submissions.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (search && !s.student?.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [task, statusFilter, search]);

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Task Review" description="Loading..." />
        <CardSkeleton />
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div>
        <PageHeader title="Task Review" description="" />
        <Card>
          <ErrorState onRetry={() => refetch()} />
        </Card>
      </div>
    );
  }

  const { total, submitted, pending, overdue } = task.submissionCounts;

  return (
    <div>
      <PageHeader
        title={task.title}
        description={task.assignmentType === 'batch' ? `Batch: ${task.batch?.name} · Due ${formatDate(task.dueDate)}` : `Due ${formatDate(task.dueDate)}`}
        action={
          <Button variant="outline" size="sm" onClick={() => navigate('/tasks')}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Tasks
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryStat label="Total Students" value={total} />
        <SummaryStat label="Submitted" value={submitted} tone="emerald" />
        <SummaryStat label="Pending" value={pending} tone="amber" />
        <SummaryStat label="Overdue" value={overdue} tone="red" />
      </div>

      <Card>
        <CardBody className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name..."
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="h-9 w-full sm:w-48">
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </CardBody>

        {filtered.length === 0 ? (
          <EmptyState title="No students match this filter" description="Try a different status or search term." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted At</th>
                  <th className="px-4 py-3">Files</th>
                  <th className="px-4 py-3">Comment</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((submission) => (
                  <tr key={submission.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">{submission.student?.name ?? '—'}</p>
                      <p className="text-xs text-text-muted">{submission.student?.studentCode}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={submission.status} />
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {submission.submittedAt ? formatDateTime(submission.submittedAt) : '—'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{submission.files.length || '—'}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-text-secondary">
                      {submission.content ? stripHtml(submission.content) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={submission.status === 'Pending'}
                        onClick={() => setActiveSubmission(submission)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {submission.status === 'Pending' ? 'Not submitted' : 'Review'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {activeSubmission && (
        <ReviewModal submission={activeSubmission} onClose={() => setActiveSubmission(null)} />
      )}
    </div>
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function SummaryStat({ label, value, tone }: { label: string; value: number; tone?: 'emerald' | 'amber' | 'red' }) {
  const toneClass =
    tone === 'emerald'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'amber'
      ? 'text-amber-600 dark:text-amber-400'
      : tone === 'red'
      ? 'text-red-600 dark:text-red-400'
      : 'text-text-primary';
  return (
    <Card>
      <CardBody className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
        <p className={`mt-1 text-2xl font-bold ${toneClass}`}>{value}</p>
      </CardBody>
    </Card>
  );
}

function ReviewModal({ submission, onClose }: { submission: TaskSubmission; onClose: () => void }) {
  const reviewMutation = useReviewSubmission();
  const [feedback, setFeedback] = useState(submission.trainerFeedback || '');
  const alreadyReviewed = submission.status === 'Reviewed';
  const canReview = useCan()('tasks:update');

  function handleDecision(decision: 'approve' | 'needs_revision') {
    reviewMutation.mutate(
      { submissionId: submission.id, decision, feedback },
      { onSuccess: () => onClose() },
    );
  }

  return (
    <Modal open onClose={onClose} title={submission.student?.name ?? 'Submission'} size="lg">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <StatusBadge status={submission.status} />
          <span className="text-xs text-text-muted">
            {submission.submittedAt ? `Submitted ${formatDateTime(submission.submittedAt)}` : 'Not submitted'}
          </span>
        </div>

        <div>
          <Label>Student's comment</Label>
          <div
            className="rich-content max-w-none rounded-lg border border-border bg-surface-muted px-3 py-2.5"
            dangerouslySetInnerHTML={{ __html: submission.content || '<p class="text-text-muted">No comment left.</p>' }}
          />
        </div>

        <div>
          <Label>Submitted files</Label>
          <div className="mt-2">
            <FilePreviewList files={submission.files} />
          </div>
        </div>

        <div>
          <Label>Feedback {alreadyReviewed ? '' : '(sent to the student)'}</Label>
          <RichTextEditor value={feedback} onChange={setFeedback} placeholder="Add feedback for the student..." disabled={alreadyReviewed || !canReview} />
        </div>

        {!alreadyReviewed && canReview && (
          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button variant="outline" onClick={() => handleDecision('needs_revision')} loading={reviewMutation.isPending}>
              <RotateCcw className="h-4 w-4" />
              Send Back for Revision
            </Button>
            <Button onClick={() => handleDecision('approve')} loading={reviewMutation.isPending}>
              <CheckCircle2 className="h-4 w-4" />
              Approve & Mark Reviewed
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
