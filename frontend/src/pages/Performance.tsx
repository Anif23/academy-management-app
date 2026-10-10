import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Award, Plus, Sparkles, Trash2, TrendingDown, Users } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { DataTable } from '../components/common/DataTable';
import type { DataTableColumn } from '../components/common/DataTable';
import { Drawer } from '../components/common/Drawer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StatCard } from '../components/common/StatCard';
import { EmptyState } from '../components/common/States';
import { PerformanceForm } from '../features/performance/PerformanceForm';
import { useAllPerformance, useCreatePerformance, useDeletePerformance, useUpdatePerformance } from '../hooks/usePerformance';
import { useAllStudents } from '../hooks/useStudents';
import { useAllBatches } from '../hooks/useBatches';
import { useTableState } from '../hooks/useTableState';
import { computeOverallPerformance } from '../services/api';
import { getGrade } from '../utils/performance';
import type { PerformanceRecord } from '../types';
import { formatDate } from '../utils/format';
import { Select } from '../components/ui/Field';
import { useCan } from '../hooks/usePermission';

const SKILL_LABELS: Array<{ key: keyof PerformanceRecord; label: string }> = [
  { key: 'technicalKnowledge', label: 'Technical' },
  { key: 'practicalSkills', label: 'Practical' },
  { key: 'communication', label: 'Communication' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'taskCompletion', label: 'Tasks' },
  { key: 'behaviour', label: 'Behaviour' },
];

export default function Performance() {
  const can = useCan();
  const table = useTableState();
  const { data: records, isLoading, isError, refetch } = useAllPerformance();
  const { data: students } = useAllStudents();
  const { data: batches } = useAllBatches();
  const [batchFilter, setBatchFilter] = useState('all');

  const createMutation = useCreatePerformance();
  const updateMutation = useUpdatePerformance();
  const deleteMutation = useDeletePerformance();

  const [drawerState, setDrawerState] = useState<{ mode: 'create' | 'edit'; record?: PerformanceRecord } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PerformanceRecord | null>(null);

  function studentFor(record: PerformanceRecord) {
    return students?.find((s) => s.id === record.studentId);
  }

  // Records scoped to the selected batch (if any), used as the basis for
  // both the aggregate stats/charts and the table below.
  const scopedRecords = useMemo(() => {
    if (batchFilter === 'all') return records ?? [];
    return (records ?? []).filter((r) => studentFor(r)?.batchId === batchFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, students, batchFilter]);

  // Only the most recent evaluation per student counts toward aggregate stats.
  const latestPerStudent = useMemo(() => {
    const map = new Map<string, PerformanceRecord>();
    scopedRecords.forEach((record) => {
      const existing = map.get(record.studentId);
      if (!existing || new Date(record.date).getTime() > new Date(existing.date).getTime()) {
        map.set(record.studentId, record);
      }
    });
    return Array.from(map.values());
  }, [scopedRecords]);

  const avgOverall = useMemo(() => {
    if (latestPerStudent.length === 0) return 0;
    const sum = latestPerStudent.reduce((acc, r) => acc + computeOverallPerformance(r), 0);
    return Math.round((sum / latestPerStudent.length) * 10) / 10;
  }, [latestPerStudent]);

  const topPerformer = useMemo(() => {
    if (latestPerStudent.length === 0) return null;
    const best = [...latestPerStudent].sort((a, b) => computeOverallPerformance(b) - computeOverallPerformance(a))[0];
    return { record: best, student: studentFor(best) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestPerStudent, students]);

  const needsAttentionCount = latestPerStudent.filter((r) => computeOverallPerformance(r) < 5).length;

  const skillAverages = useMemo(() => {
    if (latestPerStudent.length === 0) return SKILL_LABELS.map((s) => ({ skill: s.label, average: 0 }));
    return SKILL_LABELS.map(({ key, label }) => {
      const sum = latestPerStudent.reduce((acc, r) => acc + (r[key] as number), 0);
      return { skill: label, average: Math.round((sum / latestPerStudent.length) * 10) / 10 };
    });
  }, [latestPerStudent]);

  const gradeDistribution = useMemo(() => {
    const buckets: Record<string, number> = { 'A+': 0, A: 0, 'B+': 0, B: 0, C: 0, D: 0 };
    latestPerStudent.forEach((r) => {
      buckets[getGrade(computeOverallPerformance(r)).label] += 1;
    });
    return Object.entries(buckets).map(([grade, count]) => ({ grade, count }));
  }, [latestPerStudent]);

  const filtered = useMemo(() => {
    let rows = scopedRecords;
    if (table.search) {
      const q = table.search.toLowerCase();
      rows = rows.filter((record) => {
        const student = studentFor(record);
        return student && [student.name, student.studentId].some((f) => f.toLowerCase().includes(q));
      });
    }
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopedRecords, students, table.search]);

  const columns: Array<DataTableColumn<PerformanceRecord>> = [
    {
      key: 'student',
      header: 'Student',
      render: (row) => {
        const student = studentFor(row);
        return (
          <div>
            <p className="font-medium text-text-primary">{student?.name ?? 'Unknown student'}</p>
            <p className="text-xs text-text-muted">{student?.studentId}</p>
          </div>
        );
      },
    },
    { key: 'date', header: 'Evaluated On', render: (row) => formatDate(row.date) },
    { key: 'technicalKnowledge', header: 'Technical', render: (row) => `${row.technicalKnowledge}/10` },
    { key: 'practicalSkills', header: 'Practical', render: (row) => `${row.practicalSkills}/10` },
    { key: 'communication', header: 'Communication', render: (row) => `${row.communication}/10` },
    {
      key: 'overall',
      header: 'Overall',
      render: (row) => <span className="font-semibold text-brand-600">{computeOverallPerformance(row)}/10</span>,
    },
    {
      key: 'grade',
      header: 'Grade',
      render: (row) => {
        const grade = getGrade(computeOverallPerformance(row));
        return <Badge tone={grade.tone}>{grade.label}</Badge>;
      },
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => (
        <>{can('performance:delete') && (
<Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setDeleteTarget(row);
          }}
          aria-label="Delete record"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
)}</>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Student Performance"
        description="Evaluate students across technical, practical, and behavioural parameters."
        action={
          can('performance:create') ? (
<Button onClick={() => setDrawerState({ mode: 'create' })}>
            <Plus className="h-4 w-4" />
            New Evaluation
          </Button>
) : undefined
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Average Overall Score" value={`${avgOverall}/10`} icon={Sparkles} tone="purple" />
        <StatCard
          label="Top Performer"
          value={topPerformer?.student?.name ?? '—'}
          icon={Award}
          tone="green"
          trend={topPerformer ? { value: `${computeOverallPerformance(topPerformer.record)}/10`, direction: 'up' } : undefined}
        />
        <StatCard label="Needs Attention" value={needsAttentionCount.toString()} icon={TrendingDown} tone="amber" />
        <StatCard label="Students Evaluated" value={latestPerStudent.length.toString()} icon={Users} tone="brand" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader title="Average Skill Profile" description="Batch-wide average across all evaluated students" />
          <CardBody>
            {latestPerStudent.length === 0 ? (
              <EmptyState title="No evaluations yet" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={skillAverages}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" fontSize={12} />
                  <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                  <Radar dataKey="average" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.35} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Grade Distribution" description="Number of students in each grade band" />
          <CardBody>
            {latestPerStudent.length === 0 ? (
              <EmptyState title="No evaluations yet" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={gradeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="grade" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="#a855f7" radius={[6, 6, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        searchValue={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Search by student name or ID..."
        filters={
          <Select value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)} className="h-9 w-full sm:w-52">
            <option value="all">All Batches</option>
            {batches?.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </Select>
        }
        page={1}
        pageSize={filtered.length || 1}
        total={filtered.length}
        emptyTitle="No performance records yet"
        onRowClick={can('performance:update') ? (row) => setDrawerState({ mode: 'edit', record: row }) : undefined}
      />

      <Drawer open={Boolean(drawerState)} onClose={() => setDrawerState(null)} title={drawerState?.mode === 'edit' ? 'Edit Evaluation' : 'New Performance Evaluation'}>
        {drawerState && (
          <PerformanceForm
            defaultValues={drawerState.record}
            students={students ?? []}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            onCancel={() => setDrawerState(null)}
            onSubmit={(values) => {
              if (drawerState.mode === 'edit' && drawerState.record) {
                updateMutation.mutate(
                  { id: drawerState.record.id, patch: values },
                  { onSuccess: () => setDrawerState(null) },
                );
              } else {
                createMutation.mutate(values, { onSuccess: () => setDrawerState(null) });
              }
            }}
          />
        )}
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete performance record"
        description="Are you sure you want to delete this evaluation? This action cannot be undone."
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
          }
        }}
      />
    </div>
  );
}
