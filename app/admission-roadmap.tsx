'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { type Profile } from '../lib/admissions';
import { type Program } from '../lib/program-catalog';
import { buildRoadmap, parseAiRoadmap, type AiRoadmap } from '../lib/roadmap';
import { useLanguage } from './language';

type Props={profile:Profile;program:Program;done:string[];onToggle:(id:string)=>void;onBack:()=>void;onEdit:()=>void;onClear:()=>void};
const cache=new Map<string,AiRoadmap>();
export function clearRoadmapCache(){cache.clear();}
const copy={
 ru:{artStart:'Старт',artStartSub:'Твой профиль',artMiddle:'Подготовка',artMiddleSub:'План действий',artEnd:'Цель',artEndSub:'Поступление',artFoot:'8 этапов · один маршрут',back:'← К программам',edit:'Изменить профиль ↗',eyebrow:'03 / ПЕРСОНАЛЬНЫЙ МАРШРУТ',title:'Путь к поступлению.',subtitle:'От проверки требований до первого дня учёбы — в понятной последовательности.',loading:'Строим твой маршрут',loadingSub:'Сопоставляем профиль, требования программы и ближайшие действия.',loadingSteps:['Проверяем путь поступления','Расставляем приоритеты подготовки','Собираем этапы и документы','Проверяем финальный маршрут'],ai:'Маршрут с Groq AI',fallback:'Маршрут по данным каталога',year:'Набор',program:'Программа',progress:'ПРОГРЕСС МАРШРУТА',complete:'этапов выполнено',priority:'НАЧНИ С ЭТОГО',start:'Маршрут по этапам',stage:'ЭТАП',verified:'Обязательная проверка и подготовка',extra:'Дополнительно для твоего профиля',checkpoint:'КАК ПОНЯТЬ, ЧТО ЭТАП ГОТОВ',source:'Официальный источник ↗',mark:'Отметить этап выполненным',undo:'Отменить отметку',done:'Этап выполнен',regenerate:'Составить заново ↗',print:'Сохранить в PDF ↗',clear:'Удалить мои данные',method:'Как составлен маршрут',methodText:'Основные этапы опираются на данные анкеты и проверенные страницы программы. Groq AI дополняет их персональными действиями. Сроки без подтверждённого источника не превращаются в даты; гранты и поступление не гарантируются. Перед подачей сверяй актуальные правила вуза.',fallbackIntro:'Маршрут построен по данным твоего профиля и опубликованным сведениям программы. Начни с проверки пути поступления, затем готовь язык, финансы и документы.',fallbackPriority:'Сначала подтвердить путь поступления и требования для твоего документа и гражданства.',fallbackOutro:'Перед отправкой заявки перепроверь правила и сроки на официальном сайте университета.',empty:'Выбери программу',emptySub:'Открой подбор и выбери конкретный вуз, чтобы увидеть маршрут.',backTo:'К программам ↗'},
 en:{artStart:'Start',artStartSub:'Your profile',artMiddle:'Preparation',artMiddleSub:'Action plan',artEnd:'Goal',artEndSub:'Admission',artFoot:'8 stages · one route',back:'← Back to programs',edit:'Edit profile ↗',eyebrow:'03 / PERSONAL ROADMAP',title:'Your path to university.',subtitle:'From checking requirements to your first day of study, in a clear sequence.',loading:'Building your roadmap',loadingSub:'Connecting your profile, program requirements, and next actions.',loadingSteps:['Checking entry path','Prioritizing preparation','Mapping stages and documents','Reviewing the final roadmap'],ai:'Roadmap with Groq AI',fallback:'Catalog-based roadmap',year:'Intake',program:'Program',progress:'ROADMAP PROGRESS',complete:'stages completed',priority:'START HERE',start:'Your stages',stage:'STAGE',verified:'Core checks and preparation',extra:'For your profile',checkpoint:'HOW TO KNOW THIS STAGE IS DONE',source:'Official source ↗',mark:'Mark stage complete',undo:'Undo completion',done:'Stage complete',regenerate:'Rebuild roadmap ↗',print:'Save as PDF ↗',clear:'Delete my data',method:'How this roadmap is built',methodText:'Core stages use your answers and verified program pages. Groq AI adds personalized actions. Unconfirmed deadlines are not presented as dates; scholarships and admission are not guaranteed. Check current university rules before applying.',fallbackIntro:'This roadmap uses your profile and published program information. Start by confirming your entry path, then prepare language, finances, and documents.',fallbackPriority:'First confirm the entry path and requirements for your qualification and citizenship.',fallbackOutro:'Before applying, check current rules and deadlines on the university website.',empty:'Choose a program',emptySub:'Open your matches and select a university to see its roadmap.',backTo:'Back to programs ↗'},
 kk:{artStart:'Бастау',artStartSub:'Сенің бейінің',artMiddle:'Дайындық',artMiddleSub:'Әрекет жоспары',artEnd:'Мақсат',artEndSub:'Оқуға түсу',artFoot:'8 кезең · бір жол',back:'← Бағдарламаларға қайту',edit:'Бейінді өзгерту ↗',eyebrow:'03 / ЖЕКЕ ЖОЛ КАРТАСЫ',title:'Университетке апарар жолың.',subtitle:'Талаптарды тексеруден оқудың алғашқы күніне дейінгі анық реттілік.',loading:'Жол картаңды құрастырып жатырмыз',loadingSub:'Бейініңді, бағдарлама талаптарын және келесі әрекеттерді сәйкестендіреміз.',loadingSteps:['Қабылдау жолын тексеру','Дайындық басымдықтарын анықтау','Кезеңдер мен құжаттарды жинау','Соңғы жол картасын тексеру'],ai:'Groq AI бар жол картасы',fallback:'Каталог деректеріне негізделген жол картасы',year:'Қабылдау жылы',program:'Бағдарлама',progress:'ЖОЛ КАРТАСЫНЫҢ ІЛГЕРІЛЕУІ',complete:'кезең аяқталды',priority:'ОСЫДАН БАСТА',start:'Жол картасының кезеңдері',stage:'КЕЗЕҢ',verified:'Негізгі тексеру және дайындық',extra:'Сенің бейініңе арналған',checkpoint:'КЕЗЕҢНІҢ АЯҚТАЛҒАНЫН ҚАЛАЙ БІЛЕСІҢ',source:'Ресми дереккөз ↗',mark:'Кезеңді аяқталды деп белгілеу',undo:'Белгіні алып тастау',done:'Кезең аяқталды',regenerate:'Жол картасын қайта құру ↗',print:'PDF ретінде сақтау ↗',clear:'Деректерімді жою',method:'Жол картасы қалай жасалды',methodText:'Негізгі кезеңдер сауалнама жауаптары мен бағдарламаның тексерілген беттеріне сүйенеді. Groq AI жеке әрекеттерді қосады. Расталмаған мерзімдер нақты күн ретінде көрсетілмейді; грант пен қабылдауға кепілдік берілмейді. Өтініш берер алдында университеттің ағымдағы ережелерін тексер.',fallbackIntro:'Бұл жол картасы бейінің мен бағдарлама туралы жарияланған деректерге негізделген. Алдымен қабылдау жолын, содан кейін тіл, қаржы және құжаттарды дайында.',fallbackPriority:'Алдымен құжатың мен азаматтығың үшін қабылдау жолы мен талаптарды раста.',fallbackOutro:'Өтініш берер алдында университет сайтындағы ережелер мен мерзімдерді тексер.',empty:'Бағдарламаны таңда',emptySub:'Жол картасын көру үшін іріктеуден университетті таңда.',backTo:'Бағдарламаларға қайту ↗'}
} as const;

export function AdmissionRoadmap({profile,program,done,onToggle,onBack,onEdit,onClear}:Props){
 const {locale}=useLanguage();const c=copy[locale];
 const stages=buildRoadmap(profile,program);
 const [insight,setInsight]=useState<AiRoadmap|null>(null);
 const [loading,setLoading]=useState(true);
 const [phase,setPhase]=useState(0);
 const [retry,setRetry]=useState(0);
 const snakeRef=useRef<HTMLDivElement>(null);
 const nodesRef=useRef<(HTMLSpanElement|null)[]>([]);
 const [snakePath,setSnakePath]=useState({d:'',width:1000,height:4000});
 const key=JSON.stringify({programId:program.id,profile,locale});
 useEffect(()=>{
  const saved=retry===0?cache.get(key):undefined;
  if(saved){
   // eslint-disable-next-line react-hooks/set-state-in-effect
   setInsight(saved);setLoading(false);return;
  }
  const controller=new AbortController();
  setInsight(null);setLoading(true);setPhase(0);
  const timer=window.setInterval(()=>setPhase(p=>Math.min(p+1,3)),650);
  const delay=new Promise<void>(resolve=>window.setTimeout(resolve,1750));
  const request=fetch('/api/roadmap',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({profile,programId:program.id,locale}),signal:controller.signal})
   .then(async response=>{if(!response.ok)throw new Error('AI unavailable');const data=await response.json() as {insight?:unknown};return parseAiRoadmap(data.insight)})
   .catch(()=>null);
  void Promise.all([request,delay]).then(([result])=>{if(controller.signal.aborted)return;if(result)cache.set(key,result);setInsight(result);setLoading(false);window.scrollTo({top:0,behavior:'smooth'});});
  return()=>{controller.abort();window.clearInterval(timer)};
 },[key,retry,profile,program.id,locale]);
 useLayoutEffect(()=>{
  if(loading||!snakeRef.current)return;
  const container=snakeRef.current;
  const update=()=>{
   const origin=container.getBoundingClientRect();
   const points=nodesRef.current.map(node=>{if(!node)return null;const box=node.getBoundingClientRect();return {x:box.left-origin.left+box.width/2,y:box.top-origin.top+box.height/2};}).filter((point):point is {x:number;y:number}=>point!==null);
   if(points.length!==8)return;
   const d=points.slice(1).reduce((path,point,i)=>{const prev=points[i];const mid=(prev.y+point.y)/2;return `${path} C ${prev.x} ${mid}, ${point.x} ${mid}, ${point.x} ${point.y}`;},`M ${points[0].x} ${points[0].y}`);
   setSnakePath({d,width:Math.max(1,origin.width),height:Math.max(1,origin.height)});
  };
  update();
  const observer=new ResizeObserver(update);
  observer.observe(container);
  container.querySelectorAll('.roadmap-stage').forEach(card=>observer.observe(card));
  window.addEventListener('resize',update);
  return()=>{observer.disconnect();window.removeEventListener('resize',update)};
 },[loading,insight,program.id]);
 const complete=stages.filter(stage=>done.includes(`roadmap-${program.id}-${stage.id}`)).length;
 const progress=Math.round(complete/stages.length*100);
 const intro=insight?.intro??c.fallbackIntro;
 const priority=insight?.priority??c.fallbackPriority;
 if(loading)return <section className="workspace container roadmap-page roadmap-loading" aria-live="polite"><div className="workspace-top"><button className="back-button" onClick={onBack}>{c.back}</button><span className="eyebrow">{c.eyebrow}</span></div><div className="roadmap-loading-body"><div className="roadmap-loading-symbol" aria-hidden="true"><svg viewBox="0 0 240 140"><path d="M18 20 H186 Q220 20 220 55 Q220 75 184 75 H55 Q18 75 18 110 H222"/></svg><span>↗</span></div><h1>{c.loading}</h1><p>{c.loadingSub}</p><div className="roadmap-loading-school">{program.school} · {program.title}</div><ol>{c.loadingSteps.map((step,i)=><li className={i<phase?'complete':i===phase?'active':''} key={step}><span>{i<phase?'✓':`0${i+1}`}</span>{step}</li>)}</ol></div></section>;
 return <section className="workspace container roadmap-page"><div className="workspace-top"><button className="back-button" onClick={onBack}>{c.back}</button><button className="text-button" onClick={onEdit}>{c.edit}</button></div>
  <header className="roadmap-hero"><div className="roadmap-hero-copy"><span className="roadmap-kicker"><i/>{insight?c.ai:c.fallback}</span><span className="roadmap-eyebrow">{c.eyebrow}</span><h1>{c.title}</h1><p>{c.subtitle}</p><div className="roadmap-target"><span>{c.program}</span><strong>{program.school}</strong><small>{program.title} · {program.country} · {c.year} {profile.year}</small></div></div><div className="roadmap-hero-art" aria-hidden="true">
   <div className="roadmap-art-panel">
    <div className="roadmap-art-header"><span>CONTINUE <i/> {profile.year}</span><span className="roadmap-art-header-arrow">↗</span></div>
    <svg className="roadmap-art-map" viewBox="0 0 340 320" preserveAspectRatio="xMidYMid meet">
     <defs><linearGradient id="roadmapArtGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f5e2ed"/><stop offset="55%" stopColor="#d4aec9"/><stop offset="100%" stopColor="#f8ddbc"/></linearGradient></defs>
     <path className="roadmap-art-base" d="M62 80 C125 80 121 151 195 153 S284 218 274 251"/>
     <path className="roadmap-art-trace" d="M62 80 C125 80 121 151 195 153 S284 218 274 251"/>
     <circle className="roadmap-art-ring" cx="62" cy="80" r="12"/><circle className="roadmap-art-dot" cx="62" cy="80" r="4"/>
     <circle className="roadmap-art-ring" cx="195" cy="153" r="12"/><circle className="roadmap-art-dot" cx="195" cy="153" r="4"/>
     <circle className="roadmap-art-end" cx="274" cy="251" r="18"/><path className="roadmap-art-check" d="m266 251 6 6 11-13"/>
    </svg>
    <div className="roadmap-art-chip roadmap-art-chip-start"><span>01</span><strong>{c.artStart}</strong><small>{c.artStartSub}</small></div>
    <div className="roadmap-art-chip roadmap-art-chip-middle"><span>04</span><strong>{c.artMiddle}</strong><small>{c.artMiddleSub}</small></div>
    <div className="roadmap-art-chip roadmap-art-chip-end"><span>08</span><strong>{c.artEnd}</strong><small>{c.artEndSub}</small></div>
    <div className="roadmap-art-foot"><span>{c.artFoot}</span><span>01 — 08</span></div>
   </div>
  </div></header>
  <div className="roadmap-summary"><div><span className="eyebrow">{c.priority}</span><h2>{priority}</h2><p>{intro}</p></div><div className="roadmap-progress"><span>{c.progress}</span><strong>{progress}<small>%</small></strong><div className="roadmap-progress-track"><i style={{width:`${progress}%`}}/></div><small>{complete} / {stages.length} {c.complete}</small></div></div>
  <div className="roadmap-section-head"><span className="eyebrow">01 / {c.start}</span><h2>{c.start}</h2><p>{program.school} · {profile.year}</p></div>
  <div className="roadmap-snake" ref={snakeRef}><svg className="roadmap-snake-line" viewBox={`0 0 ${snakePath.width} ${snakePath.height}`} preserveAspectRatio="none" aria-hidden="true"><path d={snakePath.d}/></svg>{stages.map((stage,i)=>{const selected=done.includes(`roadmap-${program.id}-${stage.id}`);const ai=insight?.stages[i];return <div className={`roadmap-snake-row ${i%2?'right':'left'}`} key={stage.id}><article className={`roadmap-stage ${selected?'is-done':''}`} style={{animationDelay:`${Math.min(i*90,630)}ms`}}><div className="roadmap-stage-top"><span className="roadmap-stage-number">{String(i+1).padStart(2,'0')}</span><span className="roadmap-stage-when">{stage.when}</span></div><div className="roadmap-stage-label">{c.stage} {String(i+1).padStart(2,'0')} / 08</div><h3>{stage.title}</h3><p className="roadmap-stage-summary">{stage.summary}</p>{ai&&<p className="roadmap-stage-focus">{ai.focus}</p>}<div className="roadmap-action-block"><h4>{c.verified}</h4><ol>{stage.actions.map(action=><li key={action}>{action}</li>)}</ol></div>{ai&&<div className="roadmap-ai-block"><h4>✦ {c.extra}</h4><ul>{ai.extraActions.map(action=><li key={action}>{action}</li>)}</ul></div>}<div className="roadmap-checkpoint"><span>{c.checkpoint}</span><p>{ai?.checkpoint??stage.checkpoint}</p></div><div className="roadmap-stage-footer"><a href={stage.sourceUrl} target="_blank" rel="noopener noreferrer">{c.source}</a><button type="button" className={selected?'roadmap-complete done':'roadmap-complete'} aria-pressed={selected} onClick={()=>onToggle(`roadmap-${program.id}-${stage.id}`)}><span>{selected?'✓':'○'}</span>{selected?c.done:c.mark}</button></div></article><span className="roadmap-path-node" ref={el=>{nodesRef.current[i]=el}} aria-hidden="true">{String(i+1).padStart(2,'0')}</span></div>})}</div>
  <div className="roadmap-finish"><span>↗</span><div><small>{c.stage} 08 / 08</small><h2>{insight?.outro??c.fallbackOutro}</h2></div></div>
  <div className="roadmap-tools"><button className="text-button" onClick={()=>{cache.delete(key);setRetry(n=>n+1)}}>{c.regenerate}</button><button className="text-button" onClick={()=>window.print()}>{c.print}</button><button className="text-button danger" onClick={onClear}>{c.clear}</button></div><details className="roadmap-method"><summary>{c.method}</summary><p>{c.methodText}</p></details>
 </section>;
}
