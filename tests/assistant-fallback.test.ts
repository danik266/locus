import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fallbackAssistant } from '../lib/assistant-fallback.ts';

const facts = {
  question: 'Сколько стоит обучение?', locale: 'ru' as const, programId: 'program-1',
  programTitle: 'Computer Science', university: 'Example University', year: '2027',
  schoolQualification: 'Обычный аттестат', verified: false,
  tuition: { amount: 10000, currency: 'EUR', period: 'year', year: '2026' },
  english: { ielts: 6.5, detail: 'IELTS 6.5' }, englishExam: 'Не сдавал',
  deadline: { date: '2026-05-01', intake: '2027' },
  admissionUrl: 'https://example.org/admissions', programUrl: 'https://example.org/program',
  completedTaskIds: [] as string[],
};

test('unverified program details never become asserted facts', () => {
  const price = fallbackAssistant(facts);
  assert.match(price, /пока не подтверждена/);
  assert.doesNotMatch(price, /10000/);
  const deadline = fallbackAssistant({ ...facts, question: 'Какой дедлайн?' });
  assert.match(deadline, /пока не подтверждён/);
  assert.doesNotMatch(deadline, /2026-05-01/);
});

test('guide picks the first incomplete stage for the selected program', () => {
  const answer = fallbackAssistant({ ...facts, question: 'Что дальше?', completedTaskIds: ['roadmap-program-1-eligibility'] });
  assert.match(answer, /Укрепить оценки/);
});
