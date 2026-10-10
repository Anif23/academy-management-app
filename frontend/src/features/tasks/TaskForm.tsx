import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Users, UserRound } from 'lucide-react';
import { batchTaskSchema, editTaskSchema, taskSchema } from '../../schemas/taskSchema';
import type { BatchTaskFormValues, EditTaskFormValues, TaskFormValues } from '../../schemas/taskSchema';
import type { Batch, Student, Task } from '../../types';
import { Button } from '../../components/ui/Button';
import { FieldError, FormRow, Input, Label, Select, Textarea } from '../../components/ui/Field';
import { FileUploadField } from '../../components/ui/FileUploadField';
import { todayIso } from '../../utils/format';
import { cn } from '../../utils/cn';

interface TaskFormProps {
  defaultValues?: Partial<Task>;
  students: Student[];
  batches: Batch[];
  onSubmitIndividual: (values: TaskFormValues) => void;
  onSubmitBatch: (values: BatchTaskFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function TaskForm({ defaultValues, students, batches, onSubmitIndividual, onSubmitBatch, onCancel, isSubmitting }: TaskFormProps) {
  const isEditing = Boolean(defaultValues?.id);
  const [assignmentType, setAssignmentType] = useState<'individual' | 'batch'>(
    defaultValues?.assignmentType ?? 'individual',
  );

  // Editing never changes who the task is assigned to — only its content —
  // so it uses its own, simpler schema/form regardless of assignment type.
  const editForm = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      assignedDate: defaultValues?.assignedDate?.slice(0, 10) ?? todayIso(),
      dueDate: defaultValues?.dueDate?.slice(0, 10) ?? todayIso(),
      priority: defaultValues?.priority ?? 'Medium',
    },
  });

  const individualForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      studentId: '',
      title: '',
      description: '',
      assignedDate: todayIso(),
      dueDate: todayIso(),
      priority: 'Medium',
      attachments: [],
    },
  });

  const batchForm = useForm<BatchTaskFormValues>({
    resolver: zodResolver(batchTaskSchema),
    defaultValues: {
      batchId: '',
      title: '',
      description: '',
      assignedDate: todayIso(),
      dueDate: todayIso(),
      priority: 'Medium',
      attachments: [],
    },
  });

  if (isEditing) {
    return (
      <form onSubmit={editForm.handleSubmit((values) => onSubmitIndividual(values as TaskFormValues))} noValidate className="space-y-4">
        <div>
          <Label htmlFor="edit-task-title" required>
            Task Title
          </Label>
          <Input id="edit-task-title" error={editForm.formState.errors.title?.message} {...editForm.register('title')} />
          <FieldError message={editForm.formState.errors.title?.message} />
        </div>

        <div>
          <Label htmlFor="edit-task-description" required>
            Description
          </Label>
          <Textarea id="edit-task-description" rows={3} error={editForm.formState.errors.description?.message} {...editForm.register('description')} />
          <FieldError message={editForm.formState.errors.description?.message} />
        </div>

        <FormRow>
          <div>
            <Label htmlFor="edit-task-assigned" required>
              Assigned Date
            </Label>
            <Input id="edit-task-assigned" type="date" error={editForm.formState.errors.assignedDate?.message} {...editForm.register('assignedDate')} />
            <FieldError message={editForm.formState.errors.assignedDate?.message} />
          </div>
          <div>
            <Label htmlFor="edit-task-due" required>
              Due Date
            </Label>
            <Input id="edit-task-due" type="date" error={editForm.formState.errors.dueDate?.message} {...editForm.register('dueDate')} />
            <FieldError message={editForm.formState.errors.dueDate?.message} />
          </div>
        </FormRow>

        <div>
          <Label htmlFor="edit-task-priority" required>
            Priority
          </Label>
          <Select id="edit-task-priority" {...editForm.register('priority')}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </Select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Assignment Type</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setAssignmentType('individual')}
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors',
              assignmentType === 'individual'
                ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                : 'border-border text-text-secondary hover:bg-surface-hover',
            )}
          >
            <UserRound className="h-4 w-4" />
            Individual Student
          </button>
          <button
            type="button"
            onClick={() => setAssignmentType('batch')}
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors',
              assignmentType === 'batch'
                ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                : 'border-border text-text-secondary hover:bg-surface-hover',
            )}
          >
            <Users className="h-4 w-4" />
            Entire Batch
          </button>
        </div>
      </div>

      {assignmentType === 'individual' ? (
        <form onSubmit={individualForm.handleSubmit(onSubmitIndividual)} noValidate className="space-y-4">
          <div>
            <Label htmlFor="task-student" required>
              Student
            </Label>
            <Select id="task-student" error={individualForm.formState.errors.studentId?.message} {...individualForm.register('studentId')}>
              <option value="" disabled>
                Select a student...
              </option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.studentId})
                </option>
              ))}
            </Select>
            <FieldError message={individualForm.formState.errors.studentId?.message} />
          </div>

          <div>
            <Label htmlFor="task-title" required>
              Task Title
            </Label>
            <Input id="task-title" error={individualForm.formState.errors.title?.message} {...individualForm.register('title')} />
            <FieldError message={individualForm.formState.errors.title?.message} />
          </div>

          <div>
            <Label htmlFor="task-description" required>
              Description
            </Label>
            <Textarea id="task-description" rows={3} error={individualForm.formState.errors.description?.message} {...individualForm.register('description')} />
            <FieldError message={individualForm.formState.errors.description?.message} />
          </div>

          <FormRow>
            <div>
              <Label htmlFor="task-assigned" required>
                Assigned Date
              </Label>
              <Input id="task-assigned" type="date" error={individualForm.formState.errors.assignedDate?.message} {...individualForm.register('assignedDate')} />
              <FieldError message={individualForm.formState.errors.assignedDate?.message} />
            </div>
            <div>
              <Label htmlFor="task-due" required>
                Due Date
              </Label>
              <Input id="task-due" type="date" error={individualForm.formState.errors.dueDate?.message} {...individualForm.register('dueDate')} />
              <FieldError message={individualForm.formState.errors.dueDate?.message} />
            </div>
          </FormRow>

          <div>
            <Label htmlFor="task-priority" required>
              Priority
            </Label>
            <Select id="task-priority" {...individualForm.register('priority')}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Select>
          </div>

          <div>
            <Label>Reference Attachments (optional)</Label>
            <Controller
              control={individualForm.control}
              name="attachments"
              render={({ field }) => (
                <FileUploadField folder="task-attachments" value={field.value ?? []} onChange={field.onChange} maxFiles={5} label="Attach reference files" hint="Assignment briefs, starter files, etc." />
              )}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Assign Task
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={batchForm.handleSubmit(onSubmitBatch)} noValidate className="space-y-4">
          <div>
            <Label htmlFor="batch-task-batch" required>
              Batch
            </Label>
            <Select id="batch-task-batch" error={batchForm.formState.errors.batchId?.message} {...batchForm.register('batchId')}>
              <option value="" disabled>
                Select a batch...
              </option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </Select>
            <FieldError message={batchForm.formState.errors.batchId?.message} />
            <p className="mt-1.5 text-xs text-text-muted">
              Every active student currently in this batch will get their own progress record, so you can track who has submitted.
            </p>
          </div>

          <div>
            <Label htmlFor="batch-task-title" required>
              Task Title
            </Label>
            <Input id="batch-task-title" error={batchForm.formState.errors.title?.message} {...batchForm.register('title')} />
            <FieldError message={batchForm.formState.errors.title?.message} />
          </div>

          <div>
            <Label htmlFor="batch-task-description" required>
              Description
            </Label>
            <Textarea id="batch-task-description" rows={3} error={batchForm.formState.errors.description?.message} {...batchForm.register('description')} />
            <FieldError message={batchForm.formState.errors.description?.message} />
          </div>

          <FormRow>
            <div>
              <Label htmlFor="batch-task-assigned" required>
                Assigned Date
              </Label>
              <Input id="batch-task-assigned" type="date" error={batchForm.formState.errors.assignedDate?.message} {...batchForm.register('assignedDate')} />
              <FieldError message={batchForm.formState.errors.assignedDate?.message} />
            </div>
            <div>
              <Label htmlFor="batch-task-due" required>
                Due Date
              </Label>
              <Input id="batch-task-due" type="date" error={batchForm.formState.errors.dueDate?.message} {...batchForm.register('dueDate')} />
              <FieldError message={batchForm.formState.errors.dueDate?.message} />
            </div>
          </FormRow>

          <div>
            <Label htmlFor="batch-task-priority" required>
              Priority
            </Label>
            <Select id="batch-task-priority" {...batchForm.register('priority')}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Select>
          </div>

          <div>
            <Label>Reference Attachments (optional)</Label>
            <Controller
              control={batchForm.control}
              name="attachments"
              render={({ field }) => (
                <FileUploadField folder="task-attachments" value={field.value ?? []} onChange={field.onChange} maxFiles={5} label="Attach reference files" hint="Assignment briefs, starter files, etc." />
              )}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Assign to Batch
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
