import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardBody } from '../components/ui/Card';
import { StudentForm } from '../features/students/StudentForm';
import { useCreateStudent } from '../hooks/useStudents';
import { useAllBatches } from '../hooks/useBatches';
import { useAllEmployees } from '../hooks/useEmployees';
import { useAllCourses } from '../hooks/useCourses';
import { useWalkIn } from '../hooks/useWalkIns';
import { useAuthStore } from '../store/authStore';

export default function Registration() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const walkInId = searchParams.get('walkInId') ?? undefined;
  const user = useAuthStore((s) => s.user);

  const { data: batches } = useAllBatches();
  const { data: employees } = useAllEmployees();
  const { data: courses } = useAllCourses();
  const { data: walkIn } = useWalkIn(walkInId);
  const counsellors = useMemo(() => employees?.filter((e) => e.type === 'Counsellor') ?? [], [employees]);
  const createMutation = useCreateStudent();

  // A counsellor registering a student is always registering it under
  // themselves — the backend enforces this regardless, so lock the field
  // in the UI too rather than showing a picker that gets silently
  // overridden.
  const lockedCounsellor = (user?.role === 'STAFF' || user?.role === 'COUNSELLOR') && user.employeeId ? { id: user.employeeId, name: user.name } : undefined;

  return (
    <div>
      <PageHeader
        title="Student Registration"
        description={walkIn ? `Converting enquiry from ${walkIn.name} into a registered student.` : 'Capture full student details after admission is confirmed.'}
      />

      <Card>
        <CardBody>
          <StudentForm
            defaultValues={{
              name: walkIn?.name ?? '',
              mobile: walkIn?.mobile ?? '',
              email: walkIn?.email ?? '',
              address: walkIn?.location ?? '',
              qualification: walkIn?.qualification ?? '',
              courseId: walkIn?.courseInterestedId,
              // The batch they picked during public registration (step 3)
              // — this was previously silently dropped and never made it
              // this far, forcing staff to re-ask and re-select it.
              batchId: walkIn?.batchId ?? undefined,
              counsellorId: walkIn?.counsellorId,
              walkInId,
            }}
            courses={courses ?? []}
            batches={batches ?? []}
            counsellors={counsellors}
            lockedCounsellor={lockedCounsellor}
            isSubmitting={createMutation.isPending}
            submitLabel="Register Student"
            onCancel={() => navigate('/students')}
            onSubmit={(values) => {
              createMutation.mutate(values, {
                onSuccess: (student) => navigate(`/students/${student.id}`),
              });
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
