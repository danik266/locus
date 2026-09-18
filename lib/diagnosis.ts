import { budgetComparison, focusName, recommend, type Profile, type Program } from './admissions.ts';

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
