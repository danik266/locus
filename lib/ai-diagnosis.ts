export type AiDiagnosis = {
  summary: string;
  strengthInsight: string;
  constraintInsight: string;
  bottleneckInsight: string;
  priority: string;
};

export function parseAiDiagnosis(value: unknown): AiDiagnosis | null {
  if (!value || typeof value !== 'object') return null;
  const data = value as Record<string, unknown>;
  const keys: (keyof AiDiagnosis)[] = ['summary', 'strengthInsight', 'constraintInsight', 'bottleneckInsight', 'priority'];
  if (!keys.every(key => typeof data[key] === 'string' && (data[key] as string).trim().length >= 8 && (data[key] as string).length <= 360)) return null;
  return Object.fromEntries(keys.map(key => [key, (data[key] as string).trim()])) as AiDiagnosis;
}
