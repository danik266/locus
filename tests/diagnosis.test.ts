import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaults } from '../lib/admissions.ts';
import { diagnose } from '../lib/diagnosis.ts';

test('diagnosis uses the actual matches and does not require SAT universally',()=>{
 const profile={...defaults,countries:['Италия'],subjects:['Математика'],englishExam:'IELTS',english:'6',budget:10000};
 const result=diagnose(profile);
 assert.equal(result.goal,'Технологии');
 assert.ok(result.strengths.includes('subjects'));
 assert.ok(!result.constraints.includes('destination'));
 assert.ok(!result.constraints.includes('sat'));
 assert.equal(result.bottleneck,'verification');
});

test('diagnosis identifies missing destination, cost and language barriers',()=>{
 assert.equal(diagnose({...defaults,countries:['Франция']}).bottleneck,'destination');
 assert.equal(diagnose({...defaults,countries:['США'],budget:1000}).bottleneck,'budget');
 assert.equal(diagnose({...defaults,countries:['США'],budget:100000}).bottleneck,'english');
 assert.ok(diagnose({...defaults,countries:['США'],budget:1000}).constraints.includes('budget'));
 assert.ok(!diagnose({...defaults,interest:'Бизнес',countries:['Германия']}).constraints.includes('budget'));
});
