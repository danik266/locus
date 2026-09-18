import { test } from 'node:test';
import assert from 'node:assert/strict';
import { budgetComparison, defaults, formatTuition, makeTasks, programs, recommend } from '../lib/admissions.ts';

test('catalogue has sourced programs across all offered countries',()=>{
 assert.equal(programs.length,22);
 assert.equal(new Set(programs.map(p=>p.id)).size,22);
 for(const country of ['Германия','Польша','Нидерланды','США','Италия','Южная Корея','Казахстан']){
  const entries=programs.filter(p=>p.country===country);
  assert.equal(entries.length,country==='Казахстан'?4:3,country);
  assert.ok(entries.every(p=>p.programUrl.startsWith('https://')&&p.admissionUrl.startsWith('https://')&&p.english.source.startsWith('https://')));
 }
});

test('recommendations respect direction and destination without invented fallback',()=>{
 assert.equal(recommend({...defaults,interest:'Технологии'}).length,8);
 for(const interest of ['Бизнес','Дизайн'])assert.equal(recommend({...defaults,interest}).length,7);
 assert.deepEqual(recommend({...defaults,interest:'Медицина и здоровье'}),[]);
 assert.equal(recommend({...defaults,interest:'Другое',customInterest:'Биоинформатика'}).length,8);
 const threeCs=recommend({...defaults,interest:'Другое',customInterest:'Computer Science',countries:['Казахстан','США']}).filter(p=>p.title.includes('Computer Science'));
 assert.deepEqual(new Set(threeCs.map(p=>p.school)),new Set(['Nazarbayev University','SDU University','Arizona State University']));
 assert.deepEqual(recommend({...defaults,interest:'Другое',customInterest:'Неизвестная специальность'}),[]);
 assert.equal(recommend({...defaults,countries:['Италия']}).length,1);
 assert.ok(recommend({...defaults,countries:['Италия']}).every(p=>p.country==='Италия'));
});

test('tuition converts the published billing period and unknown amounts remain unknown',()=>{
 assert.equal(formatTuition(programs.find(p=>p.id==='wut-cs')!),'11 040 € / год');
 assert.equal(formatTuition(programs.find(p=>p.id==='pjait-graphic')!),'24 000 PLN / год');
 const sdu=programs.find(p=>p.id==='sdu-cs')!;
 assert.match(formatTuition(sdu),/1.140.000–1.980.000 ₸ \/ год \(60 ECTS\)/);
 assert.equal(budgetComparison({...defaults,budget:1000},sdu),'above');
 assert.equal(budgetComparison({...defaults,budget:3000},sdu),'unknown');
 assert.equal(budgetComparison({...defaults,budget:5000},sdu),'within');
 assert.equal(budgetComparison(defaults,programs.find(p=>p.id==='kimep-management')!),'unknown');
 assert.equal(budgetComparison({...defaults,citizenship:'Другое'},programs[0]),'unknown');
});

test('roadmap uses real requirements and marks unconfirmed deadlines',()=>{
 const twente=programs.find(p=>p.id==='twente-tcs')!;
 const tasks=makeTasks(defaults,twente);
 assert.ok(tasks.some(t=>t.id==='diploma-'+twente.id));
 assert.ok(tasks.some(t=>t.id==='english-'+twente.id));
 assert.ok(tasks.some(t=>t.id.startsWith('fund-')));
 const wut=programs.find(p=>p.id==='wut-cs')!;
 assert.ok(makeTasks(defaults,wut).some(t=>t.detail.includes('NAWA')));
 const pavia=programs.find(p=>p.id==='pavia-ai')!;
 assert.match(makeTasks(defaults,pavia).at(-1)!.detail,/срок не подтверждён/);
 assert.notEqual(makeTasks(defaults,pavia).at(-1)!.id,makeTasks({...defaults,year:'2028'},pavia).at(-1)!.id);
});
