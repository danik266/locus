import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults, programs } from '../lib/admissions.ts';
import { comparisonFacts, comparisonWinner, parseComparisonNarrative } from '../lib/comparison-analysis.ts';

test('comparison keeps unknowns distinct and uses the applicant budget and diploma',()=>{
 const profile={...defaults,countries:['Казахстан','Нидерланды'],budget:6000,englishExam:'Не сдавал',englishLevel:'B2'};
 const selected=[programs.find(p=>p.id==='sdu-cs')!,programs.find(p=>p.id==='twente-tcs')!];
 const facts=comparisonFacts(profile,selected);
 assert.equal(facts[0].language,'notTaken');
 assert.equal(facts[0].budget,'within');
 assert.equal(facts[1].pathway,'blockedDirect');
 assert.equal(comparisonWinner(facts)?.id,'sdu-cs');
 assert.equal(comparisonFacts({...profile,citizenship:'США'},selected)[0].budget,'unknown');
});

test('AI comparison accepts only selected IDs and the verified winner',()=>{
 const value={overview:'Два варианта имеют разные ограничения.',programs:[
  {id:'sdu-cs',fit:'Стоимость соответствует бюджету.',strengths:['Стоимость соответствует бюджету.'],risks:['Английский нужно подтвердить.'],nextStep:'Проверь условия поступления.'},
  {id:'nu-cs',fit:'Стоимость выше бюджета.',strengths:['Направление совпадает с целью.'],risks:['Проверь доступное финансирование.'],nextStep:'Изучи официальный тариф.'}
 ],verdict:{winnerId:'sdu-cs',why:'Этот вариант ближе к бюджету.',tradeoff:'Английский пока не подтверждён.',firstAction:'Проверь языковые требования.'}};
 assert.deepEqual(parseComparisonNarrative(value,['sdu-cs','nu-cs'],'sdu-cs'),value);
 assert.equal(parseComparisonNarrative({...value,verdict:{...value.verdict,winnerId:'nu-cs'}},['sdu-cs','nu-cs'],'sdu-cs'),null);
 assert.equal(parseComparisonNarrative({...value,programs:[value.programs[0],value.programs[0]]},['sdu-cs','nu-cs'],'sdu-cs'),null);
});
