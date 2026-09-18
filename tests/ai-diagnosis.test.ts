import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAiDiagnosis } from '../lib/ai-diagnosis.ts';

test('only a complete, bounded AI diagnosis is shown', () => {
 const valid = {
  summary: 'Цель — поступить на бакалавриат.',
  strengthInsight: 'Средний балл помогает начать подготовку.',
  constraintInsight: 'Английский нужно подтвердить экзаменом.',
  bottleneckInsight: 'Без результата экзамена требования пока не подтверждены.',
  priority: 'Уточни требуемый тест и запланируй подготовку.',
 };
 assert.deepEqual(parseAiDiagnosis(valid), valid);
 assert.equal(parseAiDiagnosis({ ...valid, priority: '' }), null);
 assert.equal(parseAiDiagnosis({ ...valid, summary: 'x'.repeat(361) }), null);
 assert.equal(parseAiDiagnosis(null), null);
});
