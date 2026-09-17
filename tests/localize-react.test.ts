import {test} from 'node:test';
import assert from 'node:assert/strict';
import { createElement, type ReactElement } from 'react';
import { localizeContent } from '../lib/localize-react.ts';

test('translated options retain canonical values used by recommendation rules',()=>{
 const source=createElement('option',{key:'country'},'Нидерланды');
 const localized=localizeContent(source,'en') as ReactElement<{value:string;children:string}>;
 assert.equal(localized.props.children,'Netherlands');assert.equal(localized.props.value,'Нидерланды');assert.equal(localized.key,source.key);
});
test('language changes preserve input values and event handlers',()=>{
 const onChange=()=>{};
 const source=createElement('input',{value:'Алия',placeholder:'Твоё имя','aria-label':'Твоё имя',onChange});
 const localized=localizeContent(source,'en') as ReactElement<{value:string;placeholder:string;onChange:typeof onChange;'aria-label':string}>;
 assert.equal(localized.props.value,'Алия');assert.equal(localized.props.onChange,onChange);assert.equal(localized.props.placeholder,'Your name');assert.equal(localized.props['aria-label'],'Your name');
});
test('protected content stays untouched and currency renders in the selected locale',()=>{
 const source=createElement('span',{'data-no-translate':true},'Технологии');assert.equal(localizeContent(source,'en'),source);
 assert.equal(localizeContent('12 000 €','en'),'€12,000');
 const input=createElement('option',{value:'0'},'Пока не знаю / не сдавал');
 assert.equal((localizeContent(input,'kk') as ReactElement<{value:string}>).props.value,'0');
});
