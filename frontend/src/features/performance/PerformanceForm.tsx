import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { performanceSchema } from '../../schemas/performanceSchema';
import type { PerformanceFormValues } from '../../schemas/performanceSchema';
import type { PerformanceRecord, Student } from '../../types';
import { Button } from '../../components/ui/Button';
import { FieldError, FormRow, Input, Label, Select, Textarea } from '../../components/ui/Field';
import { todayIso } from '../../utils/format';

interface PerformanceFormProps {
  defaultValues?: Partial<PerformanceRecord>;
  students: Student[];
  onSubmit: (values: PerformanceFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const SCORE_FIELDS: Array<{ key: keyof PerformanceFormValues; label: string }> = [
  { key: 'technicalKnowledge', label: 'Technical Knowledge' },
  { key: 'practicalSkills', label: 'Practical Skills' },
  { key: 'communication', label: 'Communication' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'taskCompletion', label: 'Task Completion' },
  { key: 'behaviour', label: 'Behaviour' },
];

export function PerformanceForm({ defaultValues, students, onSubmit, onCancel, isSubmitting }: PerformanceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PerformanceFormValues>({
    resolver: zodResolver(performanceSchema),
    defaultValues: {
      studentId: defaultValues?.studentId ?? students[0]?.id ?? '',
      date: defaultValues?.date ?? todayIso(),
      technicalKnowledge: defaultValues?.technicalKnowledge ?? 5,
      practicalSkills: defaultValues?.practicalSkills ?? 5,
      communication: defaultValues?.communication ?? 5,
      attendance: defaultValues?.attendance ?? 5,
      taskCompletion: defaultValues?.taskCompletion ?? 5,
      behaviour: defaultValues?.behaviour ?? 5,
      remarks: defaultValues?.remarks ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormRow>
        <div>
          <Label htmlFor="perf-student" required>
            Student
          </Label>
          <Select id="perf-student" error={errors.studentId?.message} {...register('studentId')}>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} ({student.studentId})
              </option>
            ))}
          </Select>
          <FieldError message={errors.studentId?.message} />
        </div>
        <div>
          <Label htmlFor="perf-date" required>
            Evaluation Date
          </Label>
          <Input id="perf-date" type="date" error={errors.date?.message} {...register('date')} />
          <FieldError message={errors.date?.message} />
        </div>
      </FormRow>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">Scores (1–10)</p>
        <div className="grid grid-cols-2 gap-4">
          {SCORE_FIELDS.map((field) => (
            <div key={field.key}>
              <Label htmlFor={`perf-${field.key}`}>{field.label}</Label>
              <Input
                id={`perf-${field.key}`}
                type="number"
                min={1}
                max={10}
                error={errors[field.key]?.message as string | undefined}
                {...register(field.key)}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="perf-remarks">Remarks</Label>
        <Textarea id="perf-remarks" rows={3} {...register('remarks')} />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {defaultValues?.id ? 'Save Changes' : 'Save Evaluation'}
        </Button>
      </div>
    </form>
  );
}
