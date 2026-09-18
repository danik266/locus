'use client';
import { budgetComparison, focusName, formatMoney, formatTuition, type Profile } from '../lib/admissions';
import { approximateEur, fx, type Program } from '../lib/program-catalog';
import { useLanguage } from './language';
import Image from 'next/image';

type Match=Program&{reasons:string[];gaps:string[];score:number};
type Props={profile:Profile;ranked:Match[];compared:string[];onEdit:()=>void;onPick:(id:string)=>void;onCompare:(id:string)=>void;onComparePage:()=>void;onExploreAllCountries:()=>void};
const date=(value:string)=>new Date(value+'T12:00:00Z').toLocaleDateString('ru-RU');

export function ProgramMatches({profile,ranked,compared,onEdit,onPick,onCompare,onComparePage,onExploreAllCountries}:Props){
 const {localize}=useLanguage();
 return localize(<section className="workspace container">
  <div className="workspace-top"><span className="eyebrow">01 / ПРОГРАММЫ КАТАЛОГА</span><button className="text-button" onClick={onEdit}>Изменить ответы ↗</button></div>
  <div className="page-title"><h1>{profile.name?profile.name+', вот':'Вот'}<br/><em>твои варианты.</em></h1><p>Найдено {ranked.length} программ по направлению «{focusName(profile)}». Открой источники и сравни условия поступления.</p></div>
  <div className="diagnosis"><div><span className="eyebrow">ТВОЯ ЦЕЛЬ</span><h3>{focusName(profile)} · бакалавриат {profile.year}</h3><p>{profile.countries.length?profile.countries.join(', '):'Страна пока открыта'} · бюджет на обучение до {formatMoney(profile.budget)} в год</p></div><div><b>Как читать подбор</b><p>Стоимость дана для граждан Казахстана. Другие валюты сопоставлены с бюджетом по официальному курсу на {date(fx.date)}. Сборы и проживание в сравнении не учтены.</p></div></div>
  {profile.citizenship!=='Казахстан'&&<div className="demo-banner"><span className="info-icon">i</span><p>Сейчас в каталоге проверены тарифы для граждан Казахстана. Для гражданства «{profile.citizenship}» стоимость и правила приёма нужно уточнить.</p></div>}
  {ranked.length>0&&<section className="match-shortlist"><div className="match-shortlist-heading"><div><span className="eyebrow">С ЧЕГО НАЧАТЬ</span><h2>{ranked.length>=3?'Три варианта для первого сравнения':`${ranked.length} вариант${ranked.length===1?'':ranked.length<5?'а':'ов'} для первого сравнения`}</h2></div><p>Порядок учитывает бюджет и подтверждённый английский. Для рейтинга, карьеры и стипендий пока нет сопоставимых данных. Это не вероятность поступления.</p></div><div className="match-shortlist-grid">{ranked.slice(0,3).map((item,index)=>{const cost=budgetComparison(profile,item);return <article key={item.id}><span className="match-shortlist-rank">0{index+1}</span><div><small>{item.country} · {item.school}</small><h3>{item.title}</h3><p>{cost==='within'?'Стоимость обучения в бюджете':cost==='above'?'Стоимость выше бюджета':'Стоимость нужно уточнить'} · {item.gaps.length} {item.gaps.length===1?'вопрос для проверки':'вопроса для проверки'}</p></div><button type="button" onClick={()=>onPick(item.id)}>Смотреть план ↗</button></article>})}</div></section>}
  {ranked.length>0&&ranked.length<3&&(profile.countries.length>0||profile.country!=='Любая')&&<div className="quiet-callout catalog-empty"><h2>В выбранной стране вариантов пока мало</h2><p>Можно посмотреть программы того же направления в других странах.</p><button className="button" onClick={onExploreAllCountries}>Показать все страны ↗</button></div>}
  {ranked.length===0?<div className="quiet-callout catalog-empty"><h2>Совпадений пока нет</h2><p>Попробуй выбрать другое направление или страну. Новые программы добавляются после проверки информации вузов.</p>{(profile.countries.length>0||profile.country!=='Любая')&&<button className="button" onClick={onExploreAllCountries}>Показать все страны ↗</button>}<button className="text-button" onClick={onEdit}>Изменить профиль ↗</button></div>:<div className="program-grid">{ranked.map((p,i)=>{
   const cost=budgetComparison(profile,p),eur=approximateEur(p);
   return <article className="program-card" key={p.id}>
    <div className={`program-visual ${p.accent}${p.coverImage?' with-photo':''}`}><span className="program-number">{String(i+1).padStart(2,'0')}</span>{p.coverImage?<Image className="program-cover-image" src={p.coverImage} alt={`Кампус ${p.school}`} fill sizes="(max-width: 650px) 100vw, 33vw"/>:<div className="mini-sculpture"><i/><i/><i/></div>}<span className="program-country">{p.country}</span></div>
    <div className="program-body"><span className="overline">{p.school}</span><h2>{p.title}</h2>
     <div className="program-facts"><span><small>Обучение / год</small>{formatTuition(p)}</span><span><small>Английский</small>{p.english.ielts===null?'Уточнить':'IELTS '+p.english.ielts}</span><span><small>Срок</small>{p.duration}</span></div>
     <div className="catalog-meta"><span>Тариф: {p.tuition?.year??'не подтверждён'}</span><span>{p.verified===false?'Данные уточняются':`Проверено: ${date(p.checkedOn)}`}</span></div>
     <p className="catalog-budget">{cost==='within'?'Ориентир по tuition в бюджете':cost==='above'?p.tuition?.annualRange?`Даже нижняя граница ${formatTuition(p)} выше бюджета`:`Около ${formatMoney(eur!)} в год по курсу ${date(fx.date)} — выше бюджета`:p.tuition?.annualRange?'Бюджет попадает в диапазон: точная сумма зависит от предметов':'Стоимость с бюджетом пока не сопоставлена'}</p>
     <h3>Почему в подборе</h3><ul className="reasons">{p.reasons.map(r=><li key={r}><span>✓</span>{r}</li>)}</ul>
     {p.gaps.length>0&&<div className="gaps"><b>Что проверить</b>{p.gaps.map(g=><p key={g}>{g}</p>)}</div>}
     <details className="catalog-details"><summary>Требования, сроки и стипендии</summary><p><b>Язык.</b> {p.english.detail}</p><p><b>Поступление.</b> {p.admissionNote}</p>{p.specialRequirement&&<p><b>Дополнительно.</b> {p.specialRequirement}</p>}<p><b>Дедлайн.</b> {p.deadline?.intake===profile.year?`${date(p.deadline.date)} · ${p.deadline.label}`:'На выбранный год пока не подтверждён'}</p><p><b>Финансирование.</b> {p.scholarshipNote}</p>{p.tuition?.note&&<p><b>Стоимость.</b> {p.tuition.note}</p>}<div className="catalog-links"><a href={p.programUrl} target="_blank" rel="noopener noreferrer">Программа ↗</a><a href={p.admissionUrl} target="_blank" rel="noopener noreferrer">Приём ↗</a><a href={p.tuition?.source??p.costUrl??p.programUrl} target="_blank" rel="noopener noreferrer">Стоимость ↗</a><a href={p.english.source} target="_blank" rel="noopener noreferrer">Английский ↗</a></div></details>
     <div className="program-actions"><button className="button" onClick={()=>onPick(p.id)}>Построить план ↗</button><button className="compare-toggle" disabled={!compared.includes(p.id)&&compared.length>=3} aria-pressed={compared.includes(p.id)} onClick={()=>onCompare(p.id)}><span>{compared.includes(p.id)?'✓':'+'}</span>{compared.includes(p.id)?'В сравнении':'Сравнить'}</button></div>
    </div></article>;
  })}</div>}
  {compared.length>0&&<div className="compare-bar"><span>Выбрано: {compared.length} из 3 <small>Минимум два для сравнения</small></span><button className="button" disabled={compared.length<2} onClick={onComparePage}>Сравнить варианты ↗</button></div>}
 </section>);
}

export { ProgramComparison } from './program-comparison';
