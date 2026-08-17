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

export default function Registration() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const walkInId = searchParams.get('walkInId') ?? undefined;

  const { data: batches } = useAllBatches();
  const { data: employees } = useAllEmployees();
  const { data: courses } = useAllCourses();
  const { data: walkIn } = useWalkIn(walkInId);
  const counsellors = useMemo(() => employees?.filter((e) => e.type === 'Counsellor') ?? [], [employees]);
  const createMutation = useCreateStudent();

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
              course: walkIn?.courseInterested,
              counsellorId: walkIn?.counsellorId,
              walkInId,
            }}
            courses={courses ?? []}
            batches={batches ?? []}
            counsellors={counsellors}
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
