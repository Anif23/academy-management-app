import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { studentSchema } from '../../schemas/studentSchema';
import type { StudentFormValues } from '../../schemas/studentSchema';
import type { Batch, CourseRecord, Employee, Student } from '../../types';
import { Button } from '../../components/ui/Button';
import { FieldError, FormRow, Input, Label, Select, Textarea } from '../../components/ui/Field';
import { formatCurrency, todayIso } from '../../utils/format';

interface StudentFormProps {
  defaultValues?: Partial<Student>;
  courses: CourseRecord[];
  batches: Batch[];
  counsellors: Employee[];
  onSubmit: (values: StudentFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  showPhotoUpload?: boolean;
}

export function StudentForm({
  defaultValues,
  courses,
  batches,
  counsellors,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
  showPhotoUpload = true,
}: StudentFormProps) {
  const activeCourses = courses.filter((c) => c.status === 'Active' || c.id === defaultValues?.courseId);

  function buildDefaults(): StudentFormValues {
    return {
      name: defaultValues?.name ?? '',
      photo: defaultValues?.photo ?? '',
      mobile: defaultValues?.mobile ?? '',
      email: defaultValues?.email ?? '',
      dob: defaultValues?.dob ?? '',
      gender: defaultValues?.gender ?? 'Male',
      address: defaultValues?.address ?? '',
      qualification: defaultValues?.qualification ?? '',
      courseId: defaultValues?.courseId ?? activeCourses[0]?.id ?? '',
      courseDuration: defaultValues?.courseDuration ?? activeCourses[0]?.duration ?? '',
      joiningDate: defaultValues?.joiningDate ?? todayIso(),
      batchId: defaultValues?.batchId ?? batches[0]?.id ?? '',
      mode: defaultValues?.mode ?? 'Offline',
      counsellorId: defaultValues?.counsellorId ?? counsellors[0]?.id ?? '',
      status: defaultValues?.status ?? 'Active',
      walkInId: defaultValues?.walkInId,
    };
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting: formSubmitting, isDirty },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: buildDefaults(),
  });

  // When converting a walk-in, this page mounts before the walk-in's data
  // has actually loaded (it's fetched async), so react-hook-form's
  // one-time defaultValues snapshot at mount is empty. Once the real data
  // (or the batches/courses/counsellors lists it depends on) arrives, sync
  // it in — but never after the person has started typing their own edits.
  useEffect(() => {
    if (isDirty) return;
    reset(buildDefaults());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues, batches, courses, counsellors]);

  const photoPreview = watch('photo');
  const selectedCourseId = watch('courseId');
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  // The duration is a property of the course itself, not something a
  // registrar types by hand — keep it in sync whenever the course changes.
  useEffect(() => {
    if (selectedCourse) {
      setValue('courseDuration', selectedCourse.duration, { shouldDirty: true });
    }
  }, [selectedCourse, setValue]);

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setValue('photo', reader.result as string, { shouldDirty: true });
    reader.readAsDataURL(file);
  }

  const isEditing = Boolean(defaultValues?.id);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {showPhotoUpload ? (
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed border-border bg-surface-muted text-xs text-text-muted">
            {photoPreview ? <img src={photoPreview} alt="Student preview" className="h-full w-full object-cover" /> : 'No photo'}
          </div>
          <div>
            <Label htmlFor="photo-upload">Photo</Label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="block text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-surface-hover file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-text-primary hover:file:bg-border"
            />
          </div>
        </div>
      ) : (
        <input type="hidden" {...register('photo')} />
      )}

      <div>
        <h3 className="mb-3 text-sm font-semibold text-text-primary">Personal Details</h3>
        <FormRow>
          <div>
            <Label htmlFor="reg-name" required>
              Name
            </Label>
            <Input id="reg-name" error={errors.name?.message} {...register('name')} />
            <FieldError message={errors.name?.message} />
          </div>
          <div>
            <Label htmlFor="reg-mobile" required>
              Mobile
            </Label>
            <Input id="reg-mobile" maxLength={10} error={errors.mobile?.message} {...register('mobile')} />
            <FieldError message={errors.mobile?.message} />
          </div>
        </FormRow>
        <FormRow className="mt-4">
          <div>
            <Label htmlFor="reg-email" required>
              Email
            </Label>
            <Input id="reg-email" type="email" error={errors.email?.message} {...register('email')} />
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <Label htmlFor="reg-dob" required>
              Date of Birth
            </Label>
            <Input id="reg-dob" type="date" max={todayIso()} error={errors.dob?.message} {...register('dob')} />
            <FieldError message={errors.dob?.message} />
          </div>
        </FormRow>
        <FormRow className="mt-4">
          <div>
            <Label htmlFor="reg-gender" required>
              Gender
            </Label>
            <Select id="reg-gender" {...register('gender')}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="reg-qualification" required>
              Qualification
            </Label>
            <Input id="reg-qualification" error={errors.qualification?.message} {...register('qualification')} />
            <FieldError message={errors.qualification?.message} />
          </div>
        </FormRow>
        <div className="mt-4">
          <Label htmlFor="reg-address" required>
            Address
          </Label>
          <Textarea id="reg-address" rows={2} error={errors.address?.message} {...register('address')} />
          <FieldError message={errors.address?.message} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-text-primary">Course &amp; Batch Details</h3>
        <FormRow>
          <div>
            <Label htmlFor="reg-course" required>
              Course
            </Label>
            <Select id="reg-course" error={errors.courseId?.message} {...register('courseId')}>
              {activeCourses.length === 0 && (
                <option value="" disabled>
                  No courses available — add one first
                </option>
              )}
              {activeCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </Select>
            <FieldError message={errors.courseId?.message} />
            {selectedCourse && !isEditing && (
              <p className="mt-1.5 text-xs text-text-muted">
                Admission fee of <span className="font-medium text-text-secondary">{formatCurrency(selectedCourse.fee)}</span> will be
                created automatically — discounts can be applied afterwards from the Fees page.
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="reg-duration">Course Duration</Label>
            <Input id="reg-duration" readOnly disabled {...register('courseDuration')} />
          </div>
        </FormRow>
        <FormRow className="mt-4">
          <div>
            <Label htmlFor="reg-joining" required>
              Joining Date
            </Label>
            <Input id="reg-joining" type="date" error={errors.joiningDate?.message} {...register('joiningDate')} />
            <FieldError message={errors.joiningDate?.message} />
          </div>
          <div>
            <Label htmlFor="reg-batch" required>
              Batch
            </Label>
            <Select id="reg-batch" error={errors.batchId?.message} {...register('batchId')}>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </Select>
            <FieldError message={errors.batchId?.message} />
          </div>
        </FormRow>
        <FormRow className="mt-4">
          <div>
            <Label htmlFor="reg-mode" required>
              Mode
            </Label>
            <Select id="reg-mode" {...register('mode')}>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="reg-counsellor" required>
              Assigned Counsellor
            </Label>
            <Select id="reg-counsellor" error={errors.counsellorId?.message} {...register('counsellorId')}>
              {counsellors.map((counsellor) => (
                <option key={counsellor.id} value={counsellor.id}>
                  {counsellor.name}
                </option>
              ))}
            </Select>
            <FieldError message={errors.counsellorId?.message} />
          </div>
        </FormRow>
        {isEditing && (
          <div className="mt-4">
            <Label htmlFor="reg-status" required>
              Status
            </Label>
            <Select id="reg-status" {...register('status')}>
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Dropped">Dropped</option>
            </Select>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border pt-5">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting || formSubmitting}>
          {submitLabel ?? (isEditing ? 'Save Changes' : 'Register Student')}
        </Button>
      </div>
    </form>
  );
}
