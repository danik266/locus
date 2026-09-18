import { budgetComparison, defaults, focusName, recommend, type Profile, type Program } from './admissions.ts';

export type Strength = 'grades' | 'subjects' | 'direction' | 'english';
export type Constraint = 'destination' | 'budget' | 'englishExam' | 'englishScore' | 'sat' | 'grades' | 'verification';
export type Bottleneck = 'destination' | 'budget' | 'english' | 'grades' | 'verification';
export type AdmissionDiagnosis = {
 goal: string;
 strengths: Strength[];
 constraints: Constraint[];
 bottleneck: Bottleneck;
};

/** Transparent local diagnosis until a server-side model is configured. */
export function diagnose(profile:Profile, matches:Program[]=recommend(profile)):AdmissionDiagnosis {
 const destinations=profile.countries?.length ? profile.countries : profile.country==='Любая' ? [] : [profile.country];
 const gpaRatio=profile.gpaScale>0 ? profile.gpa/profile.gpaScale : 0;
 const strengths:Strength[]=['direction'];
 if(gpaRatio>=.85) strengths.unshift('grades');
 if(profile.subjects?.length) strengths.push('subjects');
 if(profile.englishExam==='IELTS' && Number(profile.english)>=6.5) strengths.push('english');

 const constraints:Constraint[]=[];
 const noDestinationMatch=destinations.length>0 && !matches.some(p=>destinations.includes(p.country));
 const overBudget=matches.length>0 && matches.every(p=>budgetComparison(profile,p)==='above');
 const englishMissing=profile.englishExam==='Не сдавал';
 const englishBelow=profile.englishExam==='IELTS' && matches.some(p=>p.english.ielts!==null&&Number(profile.english)<p.english.ielts);
 if(noDestinationMatch) constraints.push('destination');
 if(overBudget) constraints.push('budget');
 if(englishMissing || profile.englishExam==='TOEFL') constraints.push('englishExam');
 else if(englishBelow) constraints.push('englishScore');
 if(gpaRatio<.7) constraints.push('grades');
 constraints.push('verification');

 const bottleneck:Bottleneck=noDestinationMatch?'destination':overBudget?'budget':englishMissing||englishBelow||profile.englishExam==='TOEFL'?'english':gpaRatio<.7?'grades':'verification';
 return {goal:focusName(profile),strengths,constraints,bottleneck};
}

function cleanText(value: unknown, fallback: string, length = 80) {
  return typeof value === 'string' ? value.trim().slice(0, length) : fallback;
}

function cleanNumber(value: unknown, fallback: number, min: number, max: number) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}

function cleanList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').slice(0, 5).map(item => item.trim().slice(0, 60)) : [];
}

export function parseProfile(value: unknown): Profile | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const interest = cleanText(raw.interest, defaults.interest);
  const customInterest = cleanText(raw.customInterest, '', 100);
  if (interest === 'Другое' && !customInterest) return null;
  return {
    ...defaults,
    age: cleanNumber(raw.age, defaults.age, 13, 35),
    grade: cleanText(raw.grade, defaults.grade),
    residence: cleanText(raw.residence, defaults.residence),
    citizenship: cleanText(raw.citizenship, defaults.citizenship),
    schoolQualification: cleanText(raw.schoolQualification, defaults.schoolQualification),
    interest,
    customInterest,
    alternatives: cleanList(raw.alternatives),
    country: cleanText(raw.country, defaults.country),
    countries: cleanList(raw.countries),
    budget: cleanNumber(raw.budget, defaults.budget, 0, 1000000),
    priorities: raw.priorities && typeof raw.priorities === 'object' ? Object.fromEntries(Object.entries(defaults.priorities).map(([key, fallback]) => [key, cleanNumber((raw.priorities as Record<string, unknown>)[key], fallback, 0, 2)])) : defaults.priorities,
    aid: cleanText(raw.aid, defaults.aid),
    english: cleanText(raw.english, defaults.english, 8),
    englishExam: ['IELTS', 'TOEFL', 'Не сдавал'].includes(raw.englishExam as string) ? raw.englishExam as string : defaults.englishExam,
    englishLevel: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Не знаю'].includes(raw.englishLevel as string) ? raw.englishLevel as string : defaults.englishLevel,
    toefl: cleanNumber(raw.toefl, 0, 0, 120),
    sat: cleanNumber(raw.sat, 0, 0, 1600),
    satWilling: cleanText(raw.satWilling, defaults.satWilling),
    year: cleanText(raw.year, defaults.year, 8),
    gpa: cleanNumber(raw.gpa, defaults.gpa, 0, 100),
    gpaScale: [5, 10, 100].includes(raw.gpaScale as number) ? raw.gpaScale as number : defaults.gpaScale,
    subjects: cleanList(raw.subjects),
    readiness: cleanText(raw.readiness, defaults.readiness),
  };
}
