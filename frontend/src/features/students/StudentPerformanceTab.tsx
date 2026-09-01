import { Radar, RadarChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/common/States';
import type { PerformanceRecord } from '../../types';
import { computeOverallPerformance } from '../../services/api';
import { getGrade } from '../../utils/performance';
import { formatDate } from '../../utils/format';

export function StudentPerformanceTab({ records }: { records: PerformanceRecord[] }) {
  if (records.length === 0) {
    return (
      <Card>
        <EmptyState title="No performance records yet" description="Trainer evaluations will appear here." />
      </Card>
    );
  }

  const latest = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const chartData = [
    { metric: 'Technical', value: latest.technicalKnowledge },
    { metric: 'Practical', value: latest.practicalSkills },
    { metric: 'Communication', value: latest.communication },
    { metric: 'Attendance', value: latest.attendance },
    { metric: 'Tasks', value: latest.taskCompletion },
    { metric: 'Behaviour', value: latest.behaviour },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader title="Performance Radar" description={`Latest evaluation on ${formatDate(latest.date)}`} />
        <div className="p-2">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" fontSize={12} />
              <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
              <Radar dataKey="value" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardHeader title="Overall Score" description="Average across all evaluated parameters" />
        <div className="flex flex-col items-center justify-center gap-2 p-8">
          <p className="text-4xl font-bold text-brand-600">{computeOverallPerformance(latest)}</p>
          <p className="text-sm text-text-muted">out of 10</p>
          <Badge tone={getGrade(computeOverallPerformance(latest)).tone}>Grade {getGrade(computeOverallPerformance(latest)).label}</Badge>
          {latest.remarks && <p className="mt-3 max-w-xs text-center text-sm text-text-secondary">{latest.remarks}</p>}
        </div>
      </Card>
    </div>
  );
}
