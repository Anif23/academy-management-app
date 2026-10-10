import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { AlertTriangle, ArrowLeft, CalendarClock, CheckCircle2, Paperclip } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardBody } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Label, FieldError } from '../components/ui/Field';
import { RichTextEditor } from '../components/ui/RichTextEditor';
import { FileUploadField, FilePreviewList } from '../components/ui/FileUploadField';
import { EmptyState, ErrorState, CardSkeleton } from '../components/common/States';
import { useMySubmission, useSubmitTask } from '../hooks/useTasks';
import { submitTaskSchema } from '../schemas/taskSchema';
import type { SubmitTaskFormValues } from '../schemas/taskSchema';
import { formatDate, formatDateTime } from '../utils/format';

export default function TaskSubmit() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { data: submission, isLoading, isError, refetch } = useMySubmission(taskId);
  const submitMutation = useSubmitTask();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SubmitTaskFormValues>({
    resolver: zodResolver(submitTaskSchema),
    values: submission ? { content: submission.content || '', files: submission.files } : undefined,
    defaultValues: { content: '', files: [] },
  });

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Task" description="Loading..." />
        <CardSkeleton />
      </div>
    );
  }

  if (isError || !submission) {
    return (
      <div>
        <PageHeader title="Task" description="" />
        <Card>
          <ErrorState onRetry={() => refetch()} />
        </Card>
      </div>
    );
  }

  const isLocked = ['Submitted', 'Resubmitted', 'Reviewed'].includes(submission.status);
  const canEdit = !isLocked; // Pending, Needs Revision, Overdue are all still editable

  function onConfirmedSubmit(values: SubmitTaskFormValues) {
    if (!taskId) return;
    submitMutation.mutate(
      { taskId, content: values.content, files: values.files },
      { onSuccess: () => setConfirmOpen(false) },
    );
  }

  return (
    <div>
      <PageHeader
        title={submission.task.title}
        description={submission.task.batch ? `Batch: ${submission.task.batch.name}` : 'Individual task'}
        action={
          <Button variant="outline" size="sm" onClick={() => navigate('/my-tasks')}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to My Tasks
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between gap-2">
                <StatusBadge status={submission.status} />
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <CalendarClock className="h-3.5 w-3.5" />
                  Due {formatDate(submission.task.dueDate)}
                </div>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm text-text-secondary">{submission.task.description}</p>

              {submission.task.attachments.length > 0 && (
                <div className="mt-4">
                  <Label>
                    <span className="flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5" />
                      Reference files from your trainer
                    </span>
                  </Label>
                  <div className="mt-2">
                    <FilePreviewList files={submission.task.attachments} />
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {submission.status === 'Needs Revision' && submission.trainerFeedback && (
            <Card className="border-red-200 bg-red-50/60 dark:border-red-500/30 dark:bg-red-500/5">
              <CardBody>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400">Your trainer requested changes</p>
                    <div
                      className="rich-content mt-1 text-sm text-red-700/90 dark:text-red-300"
                      dangerouslySetInnerHTML={{ __html: submission.trainerFeedback }}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {submission.status === 'Reviewed' && (
            <Card className="border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/5">
              <CardBody>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Reviewed & approved</p>
                    {submission.trainerFeedback && (
                      <div
                        className="rich-content mt-1 text-sm text-emerald-700/90 dark:text-emerald-300"
                        dangerouslySetInnerHTML={{ __html: submission.trainerFeedback }}
                      />
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardBody>
              <Label required={canEdit}>Your comments / answer</Label>
              <Controller
                control={control}
                name="content"
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    disabled={!canEdit}
                    placeholder="Write your answer, explanation, or notes here..."
                    error={errors.content?.message}
                  />
                )}
              />

              <div className="mt-5">
                <Label>Attachments</Label>
                {canEdit ? (
                  <Controller
                    control={control}
                    name="files"
                    render={({ field }) => (
                      <FileUploadField
                        folder="submission-files"
                        value={field.value}
                        onChange={field.onChange}
                        maxFiles={8}
                        label="Upload images or videos"
                        hint="Add your work as images or video, up to 8 files."
                      />
                    )}
                  />
                ) : (
                  <FilePreviewList files={submission.files} />
                )}
              </div>

              {isLocked ? (
                <div className="mt-5 rounded-lg border border-border bg-surface-muted px-4 py-3 text-sm text-text-secondary">
                  {submission.status === 'Reviewed'
                    ? 'This task has been reviewed. No further changes needed.'
                    : `Submitted on ${submission.submittedAt ? formatDateTime(submission.submittedAt) : '—'}. Waiting for your trainer to review it.`}
                </div>
              ) : (
                <div className="mt-5 flex items-center justify-end">
                  <Button onClick={() => setConfirmOpen(true)} loading={submitMutation.isPending}>
                    {submission.status === 'Needs Revision' ? 'Resubmit Task' : 'Submit Task'}
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardBody>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Task details</p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-text-muted">Assigned</dt>
                  <dd className="text-text-primary">{formatDate(submission.task.assignedDate)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-text-muted">Due</dt>
                  <dd className="text-text-primary">{formatDate(submission.task.dueDate)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-text-muted">Priority</dt>
                  <dd>
                    <StatusBadge status={submission.task.priority} />
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>
        </div>
      </div>

      {confirmOpen && (
        <SubmitConfirmDialog
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleSubmit(onConfirmedSubmit)}
          loading={submitMutation.isPending}
          isResubmit={submission.status === 'Needs Revision'}
        />
      )}
    </div>
  );
}

function SubmitConfirmDialog({
  onCancel,
  onConfirm,
  loading,
  isResubmit,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
  isResubmit: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-soft-lg" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-text-primary">{isResubmit ? 'Resubmit this task?' : 'Submit this task?'}</h3>
        <p className="mt-1.5 text-sm text-text-muted">
          Once submitted, you won't be able to make further changes unless your trainer sends it back for revision.
        </p>
        <div className="mt-4 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button size="sm" onClick={onConfirm} loading={loading}>
            {isResubmit ? 'Resubmit' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  );
}
