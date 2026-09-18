import { approximateEur, fx, type Program } from './program-catalog.ts';
import { budgetComparison, formatTuition, type Profile } from './admissions.ts';

export type ComparisonFact = {
 id: string; school: string; title: string; country: string; tuition: string; tuitionYear: string | null;
 budget: 'within' | 'above' | 'unknown'; approximateAnnualEur: number | null;
 language: 'metOverall' | 'belowOverall' | 'notTaken' | 'unverified'; languageDetail: string;
 pathway: 'blockedDirect' | 'verify'; admissionNote: string; specialRequirement: string | null;
 aidNote: string; deadline: string | null; deadlineConfirmed: boolean;
 source: string; tuitionSource: string | null; englishSource: string;
 signals: number; reasons: string[]; checks: string[];
};

export type ComparisonNarrative = {
 overview: string;
 programs: {id:string; fit:string; strengths:string[]; risks:string[]; nextStep:string}[];
 verdict: {winnerId:string; why:string; tradeoff:string; firstAction:string};
};

export function comparisonFacts(profile: Profile, items: Program[]): ComparisonFact[] {
 return items.map(program => {
  const budget = budgetComparison(profile, program);
  const language = profile.englishExam === 'Не сдавал' ? 'notTaken' : profile.englishExam === 'IELTS' && program.english.ielts !== null
   ? Number(profile.english) >= program.english.ielts ? 'metOverall' : 'belowOverall' : 'unverified';
  const pathway = program.country === 'Нидерланды' && profile.citizenship === 'Казахстан' && profile.schoolQualification === 'Обычный аттестат' ? 'blockedDirect' : 'verify';
  const deadlineConfirmed = !!program.deadline && program.deadline.intake === profile.year;
  const reasons = [
   ...(budget === 'within' ? ['Ориентир по обучению укладывается в бюджет'] : []),
   ...(language === 'metOverall' ? ['Общий IELTS достигает опубликованного порога; требования к секциям ещё нужно проверить'] : []),
   ...(deadlineConfirmed ? [`Срок подачи на ${profile.year} подтверждён в каталоге`] : []),
  ];
  const checks = [
   ...(budget === 'above' ? ['Стоимость обучения выше бюджета без подтверждённого финансирования'] : budget === 'unknown' ? ['Годовую стоимость для твоего гражданства нужно уточнить'] : []),
   ...(language === 'belowOverall' ? [`Общий IELTS ниже порога ${program.english.ielts}`] : language === 'notTaken' ? ['Результат экзамена по английскому ещё не подтверждён'] : language === 'unverified' ? ['Совместимость языкового результата с требованием не подтверждена'] : []),
   ...(pathway === 'blockedDirect' ? ['Обычный аттестат Казахстана не даёт прямого поступления в University of Twente'] : []),
   ...(!deadlineConfirmed ? [`Срок подачи на ${profile.year} не подтверждён`] : []),
   ...(program.specialRequirement ? [program.specialRequirement] : []),
  ];
  // A comparison heuristic, never an admission probability. Missing data remain neutral.
  const costWeight = Math.max(1, Math.min(3, profile.priorities.cost ?? 1));
  const signals = (budget === 'within' ? 3 : budget === 'above' ? -3 : 0) * costWeight
   + (language === 'metOverall' ? 2 : language === 'belowOverall' ? -2 : 0)
   - (pathway === 'blockedDirect' ? 8 : 0)
   + (deadlineConfirmed ? 1 : 0);
  return {
   id:program.id, school:program.school, title:program.title, country:program.country,
   tuition:formatTuition(program), tuitionYear:program.tuition?.year ?? null,
   budget, approximateAnnualEur:approximateEur(program), language, languageDetail:program.english.detail,
   pathway, admissionNote:program.admissionNote, specialRequirement:program.specialRequirement ?? null,
   aidNote:program.scholarshipNote, deadline:deadlineConfirmed ? program.deadline!.date : null, deadlineConfirmed,
   source:program.programUrl, tuitionSource:program.tuition?.source ?? null, englishSource:program.english.source,
   signals, reasons, checks,
  };
 });
}

export function comparisonWinner(facts: ComparisonFact[]): ComparisonFact | null {
 return [...facts].sort((a,b)=>b.signals-a.signals || (a.approximateAnnualEur ?? Infinity)-(b.approximateAnnualEur ?? Infinity) || a.id.localeCompare(b.id))[0] ?? null;
}

export function parseComparisonNarrative(value: unknown, ids: string[], winnerId: string): ComparisonNarrative | null {
 if (!value || typeof value !== 'object') return null;
 const data=value as Record<string,unknown>;
 const line=(v:unknown,max=600)=>typeof v==='string'&&v.trim().length>=12&&v.length<=max&&!/[<>]/.test(v);
 const list=(v:unknown)=>Array.isArray(v)&&v.length>=1&&v.length<=3&&v.every(x=>line(x,260));
 if (!line(data.overview,700)||!Array.isArray(data.programs)||data.programs.length!==ids.length) return null;
 const rows=data.programs as Record<string,unknown>[];
 if (!rows.every(p=>p&&typeof p==='object'&&ids.includes(p.id as string)&&line(p.fit,420)&&list(p.strengths)&&list(p.risks)&&line(p.nextStep,300))) return null;
 if (new Set(rows.map(p=>p.id)).size!==ids.length) return null;
 const verdict=data.verdict as Record<string,unknown> | undefined;
 if (!verdict||verdict.winnerId!==winnerId||!line(verdict.why,650)||!line(verdict.tradeoff,500)||!line(verdict.firstAction,350)) return null;
 return data as ComparisonNarrative;
}

export function fallbackComparison(facts: ComparisonFact[], winnerId: string): ComparisonNarrative {
 const winner=facts.find(f=>f.id===winnerId)!;
 return {
  overview:`Сопоставлены ${facts.length} программы по опубликованной стоимости обучения, английскому, пути поступления и подтверждённым срокам. Курсы валют взяты на ${fx.date}; проживание и сборы не учтены.`,
  programs:facts.map(f=>({id:f.id,fit:`${f.school}: ${f.budget==='within'?'обучение укладывается в бюджет':f.budget==='above'?'обучение выше бюджета':'стоимость для бюджета пока не ясна'}. ${f.language==='metOverall'?'Общий IELTS достигает порога.':f.language==='belowOverall'?'Общий IELTS ниже порога.':'Английский нужно подтвердить.'}`,
   strengths:f.reasons.length?f.reasons:['Программа соответствует выбранному направлению'],
   risks:f.checks.length?f.checks:['Проверь условия выбранного набора на сайте вуза'],
   nextStep:f.checks[0] ?? 'Сверь условия подачи на официальном сайте программы.'})),
  verdict:{winnerId,why:`${winner.school} сейчас выглядит ближе к твоим условиям по подтверждённым данным: ${winner.reasons[0]?.toLowerCase() ?? 'меньше выявленных препятствий'}.`,tradeoff:winner.checks[0] ?? 'Полная стоимость и условия приёма требуют проверки.',firstAction:winner.checks[0] ?? 'Открой официальную страницу программы и проверь требования на свой год поступления.'},
 };
}
