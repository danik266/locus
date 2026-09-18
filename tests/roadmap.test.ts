import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults, programs } from '../lib/admissions.ts';
import { buildRoadmap, parseAiRoadmap, roadmapIds } from '../lib/roadmap.ts';

test('roadmap ties eight stages to one real program and preserves unknown deadlines',()=>{
 const sdu=programs.find(program=>program.id==='sdu-cs')!;
 const stages=buildRoadmap({...defaults,englishExam:'Не сдавал',englishLevel:'B2'},sdu);
 assert.deepEqual(stages.map(stage=>stage.id),roadmapIds);
 assert.equal(stages.length,8);
 assert.match(stages[2].summary,/самооценка/);
 assert.match(stages[6].summary,/не подтверждён/);
 assert.equal(stages[6].sourceUrl,sdu.admissionUrl);
 assert.ok(stages.every(stage=>stage.actions.length>=3&&stage.sourceUrl.startsWith('https://')));
});

test('AI roadmap must contain complete stages in the intended order',()=>{
 const value={intro:'Подготовка состоит из нескольких связанных этапов.',priority:'Сначала проверь доступный путь поступления.',outro:'Перед подачей сверяй актуальные правила университета.',stages:roadmapIds.map(id=>({id,focus:'Здесь важна последовательная подготовка по программе.',extraActions:['Запиши вопросы приёмной комиссии по своему документу.'],checkpoint:'Условия подтверждены по официальной странице.'}))};
 assert.deepEqual(parseAiRoadmap(value),value);
 assert.equal(parseAiRoadmap({...value,stages:value.stages.slice(0,7)}),null);
 assert.equal(parseAiRoadmap({...value,stages:[value.stages[1],value.stages[0],...value.stages.slice(2)]}),null);
 assert.equal(parseAiRoadmap({...value,priority:'<script>alert(1)</script>'}),null);
});
