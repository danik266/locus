import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaults, recommend, makeTasks } from '../lib/admissions.ts';
import { isLocale, localeFromCookie, money, translateText } from '../lib/i18n.ts';
import { messages } from '../lib/messages.ts';

test('only supported languages can enter locale state',()=>{assert.equal(localeFromCookie(undefined),'en');assert.equal(localeFromCookie('fr'),'en');assert.equal(localeFromCookie('kk'),'kk');assert.equal(isLocale('en'),true);assert.equal(isLocale('<script>'),false);});
test('every UI phrase has complete English and Kazakh translations',()=>{for(const [source,pair] of Object.entries(messages)){assert.equal(pair.length,2);assert.ok(pair.every(s=>s.trim().length>0),source);assert.doesNotMatch(translateText(source,'en'),/[А-Яа-яЁё]/,source);assert.equal(translateText(source,'kk').trim(),pair[1]);}});
test('all generated recommendations and task content translate, including constraint cases',()=>{for(const interest of ['Технологии','Дизайн','Бизнес'])for(const country of ['Любая','Германия','Польша','Нидерланды'])for(const budget of [1000,25000])for(const english of ['0','7']){
 const profile={...defaults,interest,country,budget,english};
 for(const p of recommend(profile)){
  for(const text of [p.title,p.school,p.country,...p.reasons,...p.gaps,...makeTasks(profile,p).flatMap(t=>[t.title,t.detail,t.when,t.category])])assert.doesNotMatch(translateText(text,'en'),/[А-Яа-яЁё]/,text);
 }
}});
test('user names survive localization verbatim',()=>{assert.equal(translateText('Алия, вот','en'),'Алия, here’s');assert.equal(translateText('Алия, вот','kk'),'Алия, міне,');});
test('comparison labels and money are localized without changing data',()=>{assert.equal(translateText('Убрать Компьютерные науки из сравнения','en'),'Remove Computer Science from comparison');assert.equal(translateText('3 года','kk'),'3 жыл');assert.equal(translateText('Выше на 12 000 €','en'),`Over by ${money(12000,'en')}`);assert.match(translateText('IELTS 6.5 · нужна подготовка','kk'),/дайындық қажет/);assert.equal(translateText(' Твой выбор ','en'),' Your choice ');assert.equal(translateText('Далее — главная','ru'),'Continue — главная');});
