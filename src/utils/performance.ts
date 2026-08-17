export interface Grade {
  label: string;
  tone: 'green' | 'blue' | 'amber' | 'red';
}

export function getGrade(overallScore: number): Grade {
  if (overallScore >= 9) return { label: 'A+', tone: 'green' };
  if (overallScore >= 8) return { label: 'A', tone: 'green' };
  if (overallScore >= 7) return { label: 'B+', tone: 'blue' };
  if (overallScore >= 6) return { label: 'B', tone: 'blue' };
  if (overallScore >= 5) return { label: 'C', tone: 'amber' };
  return { label: 'D', tone: 'red' };
}
