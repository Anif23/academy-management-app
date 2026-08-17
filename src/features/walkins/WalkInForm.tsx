import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { walkInSchema } from '../../schemas/walkInSchema';
import type { WalkInFormValues } from '../../schemas/walkInSchema';
import type { CourseRecord, Employee, WalkIn } from '../../types';
import { Button } from '../../components/ui/Button';
import { FieldError, FormRow, Input, Label, Select, Textarea } from '../../components/ui/Field';

interface WalkInFormProps {
  defaultValues?: Partial<WalkIn>;
  counsellors: Employee[];
  courses: CourseRecord[];
  onSubmit: (values: WalkInFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function WalkInForm({ defaultValues, counsellors, courses, onSubmit, onCancel, isSubmitting }: WalkInFormProps) {
  const activeCourses = courses.filter((c) => c.status === 'Active' || c.name === defaultValues?.courseInterested);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WalkInFormValues>({
    resolver: zodResolver(walkInSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      mobile: defaultValues?.mobile ?? '',
      email: defaultValues?.email ?? '',
      courseInterested: defaultValues?.courseInterested ?? activeCourses[0]?.name ?? '',
      qualification: defaultValues?.qualification ?? '',
      location: defaultValues?.location ?? '',
      source: defaultValues?.source ?? 'Walk-in',
      counsellorId: defaultValues?.counsellorId ?? counsellors[0]?.id ?? '',
      enquiryDate: defaultValues?.enquiryDate ?? new Date().toISOString().slice(0, 10),
      remarks: defaultValues?.remarks ?? '',
      followUpDate: defaultValues?.followUpDate ?? '',
      status: defaultValues?.status ?? 'New',
    },
  });

  return (
    <form id="walk-in-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormRow>
        <div>
          <Label htmlFor="wi-name" required>
            Student Name
          </Label>
          <Input id="wi-name" error={errors.name?.message} {...register('name')} />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="wi-mobile" required>
            Mobile Number
          </Label>
          <Input id="wi-mobile" maxLength={10} error={errors.mobile?.message} {...register('mobile')} />
          <FieldError message={errors.mobile?.message} />
        </div>
      </FormRow>

      <FormRow>
        <div>
          <Label htmlFor="wi-email" required>
            Email
          </Label>
          <Input id="wi-email" type="email" error={errors.email?.message} {...register('email')} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="wi-course" required>
            Course Interested
          </Label>
          <Select id="wi-course" error={errors.courseInterested?.message} {...register('courseInterested')}>
            {activeCourses.length === 0 && (
              <option value="" disabled>
                No courses available — add one first
              </option>
            )}
            {activeCourses.map((course) => (
              <option key={course.id} value={course.name}>
                {course.name}
              </option>
            ))}
          </Select>
          <FieldError message={errors.courseInterested?.message} />
        </div>
      </FormRow>

      <FormRow>
        <div>
          <Label htmlFor="wi-qualification" required>
            Qualification
          </Label>
          <Input id="wi-qualification" error={errors.qualification?.message} {...register('qualification')} />
          <FieldError message={errors.qualification?.message} />
        </div>
        <div>
          <Label htmlFor="wi-location" required>
            Location
          </Label>
          <Input id="wi-location" error={errors.location?.message} {...register('location')} />
          <FieldError message={errors.location?.message} />
        </div>
      </FormRow>

      <FormRow>
        <div>
          <Label htmlFor="wi-source" required>
            Source
          </Label>
          <Select id="wi-source" {...register('source')}>
            <option value="Walk-in">Walk-in</option>
            <option value="Website">Website</option>
            <option value="Google">Google</option>
            <option value="Instagram">Instagram</option>
            <option value="Referral">Referral</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="wi-counsellor" required>
            Counsellor Name
          </Label>
          <Select id="wi-counsellor" error={errors.counsellorId?.message} {...register('counsellorId')}>
            {counsellors.map((counsellor) => (
              <option key={counsellor.id} value={counsellor.id}>
                {counsellor.name}
              </option>
            ))}
          </Select>
          <FieldError message={errors.counsellorId?.message} />
        </div>
      </FormRow>

      <FormRow>
        <div>
          <Label htmlFor="wi-enquiry-date" required>
            Enquiry Date
          </Label>
          <Input id="wi-enquiry-date" type="date" error={errors.enquiryDate?.message} {...register('enquiryDate')} />
          <FieldError message={errors.enquiryDate?.message} />
        </div>
        <div>
          <Label htmlFor="wi-followup-date">Follow-up Date</Label>
          <Input id="wi-followup-date" type="date" {...register('followUpDate')} />
        </div>
      </FormRow>

      <div>
        <Label htmlFor="wi-status" required>
          Lead Status
        </Label>
        <Select id="wi-status" {...register('status')}>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Counselling">Counselling</option>
          <option value="Interested">Interested</option>
          <option value="Admission">Admission</option>
          <option value="Not Interested">Not Interested</option>
        </Select>
        {!defaultValues?.convertedStudentId && (
          <p className="mt-1.5 text-xs text-text-muted">
            Setting this to "Admission" will take you to the full registration form to complete enrolment.
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="wi-remarks">Remarks</Label>
        <Textarea id="wi-remarks" rows={3} {...register('remarks')} />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {defaultValues?.id ? 'Save Changes' : 'Create Enquiry'}
        </Button>
      </div>
    </form>
  );
}
