import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaults, recommend } from '../lib/admissions.ts';
import { isLocale, localeFromCookie, money, translateText } from '../lib/i18n.ts';
import { messages } from '../lib/messages.ts';

test('only supported languages can enter locale state',()=>{assert.equal(localeFromCookie(undefined),'ru');assert.equal(localeFromCookie('fr'),'ru');assert.equal(localeFromCookie('en'),'en');assert.equal(localeFromCookie('kk'),'kk');assert.equal(isLocale('en'),true);assert.equal(isLocale('<script>'),false);});
test('every UI phrase has complete English and Kazakh translations',()=>{for(const [source,pair] of Object.entries(messages)){assert.equal(pair.length,2);assert.ok(pair.every(s=>s.trim().length>0),source);assert.doesNotMatch(translateText(source,'en'),/[А-Яа-яЁё]/,source);assert.equal(translateText(source,'kk').trim(),pair[1]);}});
test('Russian remains the default language for sourced program recommendations',()=>{
 const matches=recommend(defaults);
 assert.ok(matches.length>0);
 assert.ok(matches.every(p=>p.reasons.some(reason=>reason.includes('Реальная программа'))));
 assert.equal(translateText(matches[0].school,'ru'),matches[0].school);
});
test('user names survive localization verbatim',()=>{assert.equal(translateText('Алия, вот','en'),'Алия, here’s');assert.equal(translateText('Алия, вот','kk'),'Алия, міне,');});
test('comparison labels and money are localized without changing data',()=>{assert.equal(translateText('Убрать Компьютерные науки из сравнения','en'),'Remove Computer Science from comparison');assert.equal(translateText('3 года','kk'),'3 жыл');assert.equal(translateText('Выше на 12 000 €','en'),`Over by ${money(12000,'en')}`);assert.match(translateText('IELTS 6.5 · нужна подготовка','kk'),/дайындық қажет/);assert.equal(translateText(' Твой выбор ','en'),' Your choice ');assert.equal(translateText('Далее — главная','ru'),'Continue — главная');});

test('English self-assessment stays distinct from an official certificate',()=>{const profile={...defaults,englishExam:'Не сдавал',englishLevel:'B1'};for(const program of recommend(profile)){assert.ok(program.gaps.some(value=>value.includes('самооценка')));assert.ok(!program.reasons.some(value=>value.includes('IELTS достигает')));}});
