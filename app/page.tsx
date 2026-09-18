'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { LanguagePicker, useLanguage } from './language';
import { AdmissionWizard } from './admission-wizard';
import { AdmissionProfile, AnalysisLoading } from './admission-analysis';
import { ProgramMatches, ProgramComparison } from './program-matches';
import { AdmissionRoadmap, clearRoadmapCache } from './admission-roadmap';
import { defaults, programs, recommend, type Profile, type Program } from '../lib/admissions';
import { parseAiDiagnosis, type AiDiagnosis } from '../lib/ai-diagnosis';
import { useAuth } from './auth-context';
import { LoginModal } from './login-modal';
import { CatalogView } from './catalog-view';
import Image from 'next/image';

type View = 'home'|'catalog'|'profile'|'analyzing'|'diagnosis'|'results'|'compare'|'plan';
function Arrow(){return <span aria-hidden="true">↗</span>}
function Logo(){return <span className="logo"><svg className="logo-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M10 30 30 10M10 10h20v20" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Continue<span className="logo-dot">.</span></span>}
function Reveal({children,className='',direction='up'}:{children:ReactNode;className?:string;direction?:string}) {
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{const el=ref.current;if(!el)return; if(matchMedia('(prefers-reduced-motion: reduce)').matches)return; const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){el.classList.add('visible');obs.unobserve(el)}},{threshold:.14});el.classList.add('will-reveal');obs.observe(el);return()=>obs.disconnect()},[]);
 return <div ref={ref} className={`reveal ${direction} ${className}`}>{children}</div>;
}
function Model({kind='cards'}:{kind?:'cards'|'calendar'}) {
 const {localize}=useLanguage();
 return localize(<div className={`model model-${kind}`} aria-hidden="true">{kind==='cards'?<>
  <div className="model-shadow"/><div className="model-plinth"/>
  <div className="paper paper-left model-piece"><span className="paper-symbol">〈 〉</span><i/><i/><i/><small>ТВОИ ИНТЕРЕСЫ</small></div>
  <div className="paper paper-right model-piece"><span className="paper-chart"><i/><i/><i/></span><i/><i/><i/><small>ТВОИ ВОЗМОЖНОСТИ</small></div>
  <div className="selection-frame model-piece"><div className="paper paper-main"><span className="paper-circle"/><i/><i/><i/><span className="paper-badge">Твой выбор <span>✓</span></span></div></div>
  <span className="model-caption">Из вариантов — в твой план</span>
 </>:<><div className="calendar-back model-piece"><div className="check-row">✓ <i/></div><div className="check-row">✓ <i/></div><div className="check-row">✓ <i/></div><div className="check-row muted">○ <i/></div></div><div className="calendar-body model-piece"><div className="rings"><i/><i/><i/><i/></div><div className="calendar-heading">ТВОЙ СЛЕДУЮЩИЙ ШАГ</div><div className="calendar-grid">{Array.from({length:28},(_,i)=><span key={i} className={[5,12,17,24].includes(i)?'marked':''}>{i+1}</span>)}</div><div className="calendar-note"><span/> В твоём темпе</div></div><div className="calendar-tag model-piece">Всё складывается.</div></>}</div>);
}
const faqs=[['А если я ещё не знаю, куда поступать?','Начни с интересов. Выбери направление, которое хочется исследовать, а страну оставь открытой. Позже все ответы можно изменить — подбор и план обновятся.'],['Что меняется, если изменить бюджет или цели?','Программы заново упорядочиваются по твоим ограничениям. Мы показываем, что подходит и что нужно подготовить. При выборе программы план учитывает бюджет, английский и год поступления.'],['Откуда берутся требования к поступлению?',`В каталоге есть ${programs.length} проверенных программ и дополнительные варианты, по которым условия ещё уточняются. Перед подачей перепроверь стоимость и требования выбранного набора на сайте вуза.`],['Где сохраняются мои ответы?','После входа ответы и прогресс сохраняются в аккаунте и доступны на других устройствах.']];
export default function Home(){
 const {localize,t,locale}=useLanguage();
 const {user,logout,loading:authLoading}=useAuth();
 const [view,setView]=useState<View>('home'); const [analysisStage,setAnalysisStage]=useState(0); const [aiInsight,setAiInsight]=useState<AiDiagnosis|null>(null); const [insightLocale,setInsightLocale]=useState(''); const [profile,setProfile]=useState<Profile>(defaults);const [step,setStep]=useState(0);const [hasProfile,setHasProfile]=useState(false);const [selected,setSelected]=useState('');const [compared,setCompared]=useState<string[]>([]);const [done,setDone]=useState<string[]>([]);const [ready,setReady]=useState(false);const [notice,setNotice]=useState('');const [menu,setMenu]=useState(false);const [privacy,setPrivacy]=useState(false);const [showLogin,setShowLogin]=useState(false);
 const [catalogPrograms, setCatalogPrograms] = useState<Program[]>([]);
 const [loadedUserId,setLoadedUserId]=useState<string|null>(null);
 const [startAfterLogin,setStartAfterLogin]=useState(false);
 const restoredUserId=useRef<string|null>(null);
 const pendingStart=useRef(false);
 const heading=useRef<HTMLDivElement>(null);

 useEffect(() => {
  async function fetchDbPrograms() {
   try {
    const res = await fetch('/api/programs?limit=500');
    if (res.ok) {
     const data = (await res.json()) as { programs?: Record<string, unknown>[] };
     if (Array.isArray(data.programs) && data.programs.length > 0) {
      const mapped: Program[] = data.programs.map(raw => {
       const p = raw as unknown as {
        id: string; title: string; university: string; country: string; field: string; interest: string;
        durationYears: number; accent: Program['accent']; programUrl: string; admissionUrl: string;
        coverImage?: string;
        verified?: boolean;
        costUrl?: string; checkedOn: string; tuition: Program['tuition']; english: Program['english'];
        deadline: Program['deadline']; admissionNote: string; scholarshipNote: string; specialRequirement?: string;
       };
       return {id:p.id,title:p.title,school:p.university,country:p.country,interest:p.field||p.interest,
        duration:`${p.durationYears} ${p.durationYears===1?'год':p.durationYears<5?'года':'лет'}`,
        accent:p.accent||'plum',programUrl:p.programUrl,admissionUrl:p.admissionUrl,costUrl:p.costUrl,
        coverImage:p.coverImage,
        verified:p.verified,
        checkedOn:p.checkedOn??'',tuition:p.tuition,english:p.english,deadline:p.deadline,
        admissionNote:p.admissionNote,scholarshipNote:p.scholarshipNote,specialRequirement:p.specialRequirement};
      });
      setCatalogPrograms(mapped);
     }
    }
   } catch { /* fallback to static programs */ }
  }
  void fetchDbPrograms();
 }, []);

 // Restore each account independently before allowing writes.
 useEffect(()=>{
  if(authLoading)return;
  let cancelled=false;
  async function restore() {
   setReady(false);
   setLoadedUserId(null);
   const previousUserId=restoredUserId.current;
   if (user) {
    try {
     const res = await fetch('/api/profile', { credentials: 'include' });
     if(!res.ok)throw new Error('Profile unavailable');
     const data = await res.json() as { profile: (Profile & { savedProgramIds?: string[]; selectedProgramId?: string; completedTaskIds?: string[]; hasProfile?: boolean }) | null };
     if(cancelled)return;
     if (data.profile) {
      const sp = data.profile;
      const restored = {...defaults, ...sp, countries: sp.countries ?? [], alternatives: sp.alternatives ?? [], subjects: sp.subjects ?? [], priorities: {...defaults.priorities, ...sp.priorities}, englishExam: sp.englishExam ?? (sp.english && sp.english!=='0'?'IELTS':'Не сдавал')};
      setProfile(restored);
      setSelected(sp.selectedProgramId ?? '');
      setDone(Array.isArray(sp.completedTaskIds)?sp.completedTaskIds:[]);
      setCompared(Array.isArray(sp.savedProgramIds)?sp.savedProgramIds.slice(0,3):[]);
      setHasProfile(sp.hasProfile ?? true);
     } else if(previousUserId){
      setProfile(defaults);setSelected('');setDone([]);setCompared([]);setHasProfile(false);
     }
     restoredUserId.current=user.id;
     setLoadedUserId(user.id);
    } catch { if(!cancelled)setNotice('Не удалось загрузить профиль. Попробуй обновить страницу.');return; }
   } else {
    restoredUserId.current=null;
    setProfile(defaults);setSelected('');setDone([]);setCompared([]);setHasProfile(false);
   }
   if(!cancelled)setReady(true);
  }
  void restore();
  return()=>{cancelled=true};
 },[user,authLoading]);

 useEffect(()=>{
  if(!ready||!user||loadedUserId!==user.id)return;
  if(!hasProfile&&profile===defaults&&!selected&&!done.length&&!compared.length)return;
  const timer=window.setTimeout(async()=>{
   try{
    const res=await fetch('/api/profile',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({...profile,savedProgramIds:compared,selectedProgramId:selected,completedTaskIds:done,hasProfile})});
    if(!res.ok)throw new Error('Save failed');
    setNotice('');
   }catch{setNotice('Не удалось сохранить изменения. Проверь соединение и попробуй ещё раз.');}
  },600);
  return()=>window.clearTimeout(timer);
 },[profile,selected,done,compared,hasProfile,ready,user,loadedUserId]);
 useEffect(()=>{
  if(!startAfterLogin||!ready||!user||loadedUserId!==user.id)return;
  queueMicrotask(()=>{
   setStartAfterLogin(false);
   setStep(0);
   setView('profile');
   history.pushState(null,'','#profile');
  });
 },[startAfterLogin,ready,user,loadedUserId]);
 useEffect(()=>{if(authLoading)return;const onHash=()=>{const hash=location.hash.slice(1);if(!['home','catalog','profile','analyzing','diagnosis','results','compare','plan'].includes(hash))return;if(!user&&hash!=='home'&&hash!=='catalog'){pendingStart.current=true;setShowLogin(true);setView('home');return;}setView(hash as View)};window.addEventListener('hashchange',onHash);onHash();return()=>window.removeEventListener('hashchange',onHash)},[authLoading,user]);
 useEffect(()=>{
  if(view!=='analyzing'||!hasProfile)return;
  const controller=new AbortController();
  let phase=0;
  const timer=window.setInterval(()=>{phase=Math.min(phase+1,3);setAnalysisStage(phase)},700);
  const delay=new Promise<void>(resolve=>window.setTimeout(resolve,2100));
  const analysis=fetch('/api/diagnosis',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({profile,locale}),signal:controller.signal})
   .then(async response=>{if(!response.ok)throw new Error('AI unavailable');const data=await response.json() as {insight?:unknown};return parseAiDiagnosis(data.insight)})
   .catch(()=>null);
  void Promise.all([analysis,delay]).then(([insight])=>{
   if(controller.signal.aborted)return;
   setAiInsight(insight);setInsightLocale(locale);setView('diagnosis');history.replaceState(null,'','#diagnosis');window.scrollTo({top:0,behavior:'instant'});
  });
  return()=>{controller.abort();window.clearInterval(timer)};
 },[view,hasProfile,profile,locale]);
 function go(next:View){if(!user&&next!=='home'&&next!=='catalog'){pendingStart.current=true;setShowLogin(true);return;}setView(next);setMenu(false);history.pushState(null,'','#'+next);window.scrollTo({top:0,behavior:'instant'});requestAnimationFrame(()=>heading.current?.focus())}
 function begin(){
  if(!user){pendingStart.current=true;setShowLogin(true);return;}
  setStep(0);setAiInsight(null);go('profile');
 }
 function example(){go('catalog')}
 function patch<K extends keyof Profile>(key:K,value:Profile[K]){setProfile(p=>({...p,[key]:value}));setAiInsight(null);if(['interest','customInterest','countries','country','citizenship','schoolQualification'].includes(key)){setSelected('');setCompared([])}}
 const activeProgramList = catalogPrograms.length > 0 ? catalogPrograms : programs;
 const ranked = recommend(profile, activeProgramList);
 const chosen = ranked.find(p=>p.id===selected) || activeProgramList.find(p=>p.id===selected);
 function pick(id:string){
  if(!user){pendingStart.current=true;setShowLogin(true);return;}
  setSelected(id);go(hasProfile?'plan':'profile');
 }
 function toggleCompare(id:string){setCompared(c=>c.includes(id)?c.filter(x=>x!==id):c.length<3?[...c,id]:c)}
 const comparePrograms=ranked.filter(p=>compared.includes(p.id));
 async function clear(){if(!window.confirm(t('Удалить профиль и прогресс из аккаунта?')))return;
  if(user){
   setLoadedUserId(null);
   try{const res=await fetch('/api/profile',{method:'DELETE',credentials:'include'});if(!res.ok)throw new Error('Delete failed');}
   catch{setLoadedUserId(user.id);setNotice('Не удалось удалить профиль. Попробуй ещё раз.');return;}
  }
  clearRoadmapCache();setProfile(defaults);setAiInsight(null);setSelected('');setCompared([]);setDone([]);setHasProfile(false);go('home');
  if(user)setLoadedUserId(user.id);
 }
 async function signOut(){await logout();setView('home');history.replaceState(null,'','#home');setProfile(defaults);setSelected('');setCompared([]);setDone([]);setHasProfile(false)}
 return localize(<><a className="skip-link" href="#main">К содержимому</a><header className="header">
  <div className="container nav">
   <button className="logo-button" onClick={()=>go('home')} aria-label="Continue — главная"><Logo/></button>
   <nav id="site-navigation" className={menu?'nav-links open':'nav-links'} aria-label="Основная навигация">
    {view==='home'?<>
     <a href="#how" onClick={()=>setMenu(false)}>Как это работает</a>
     <button onClick={()=>go('catalog')}>Каталог программ</button>
     <button onClick={example}>Посмотреть программы</button>
     <a href="#faq" onClick={()=>setMenu(false)}>Вопросы</a>
    </>:<>
     <button className={view==='catalog'?'active':''} onClick={()=>go('catalog')}>Каталог</button>
     <button className={view==='diagnosis'?'active':''} onClick={()=>go(hasProfile?'diagnosis':'profile')}>Диагностика</button>
     <button className={view==='results'?'active':''} onClick={()=>go('results')}>Подбор</button>
     <button className={view==='compare'?'active':''} onClick={()=>go('compare')}>Сравнение{compared.length>0&&<span className="nav-count">{compared.length}</span>}</button>
     <button className={view==='plan'?'active':''} onClick={()=>go('plan')}>Мой план</button>
    </>}
    <button className="nav-mobile-primary" onClick={begin}>{hasProfile?t('Изменить анкету'):t('Начать маршрут')} <Arrow/></button>
   </nav>
   <div className="nav-actions">
    <LanguagePicker/>
    <button className="button small nav-primary" onClick={begin}>{hasProfile?t('Моя анкета'):t('Начать')}<Arrow/></button>
    {user?<details className="account-menu">
     <summary aria-label={`${t('Аккаунт')}: ${user.email}`} title={user.email}><span className="account-avatar">{(user.name||user.email).charAt(0).toUpperCase()}</span><span className="account-chevron" aria-hidden="true">⌄</span></summary>
     <div className="account-popover">
      <p className="account-popover-label">{t('Вы вошли как')}</p><strong className="account-email">{user.email}</strong>
      <div className="account-popover-divider"/>
      <button onClick={e=>{e.currentTarget.closest('details')?.removeAttribute('open');if(hasProfile)go(selected?'plan':'results');else begin()}}>{t('Мой маршрут')} <Arrow/></button>
      <button onClick={e=>{e.currentTarget.closest('details')?.removeAttribute('open');void signOut()}}>{t('Выйти')}</button>
     </div>
    </details>:<button className="nav-login" onClick={()=>{pendingStart.current=false;setShowLogin(true)}}>{t('Войти')}</button>}
    <button className="menu-button" aria-label={menu?'Закрыть меню':'Открыть меню'} aria-controls="site-navigation" aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?'×':'☰'}</button>
   </div>
  </div>
 </header>
 {showLogin&&<LoginModal onClose={()=>{setShowLogin(false);pendingStart.current=false}} onSuccess={()=>{if(pendingStart.current)setStartAfterLogin(true)}}/>}
 <main id="main" ref={heading} tabIndex={-1}>{notice&&<div className="notice container" role="status">{notice}</div>}
 {user&&!ready?<section className="empty-state container" aria-live="polite"><h1>Загружаем твой профиль…</h1><p>Ответы и прогресс появятся через мгновение.</p></section>:view==='home'?<>
 <section className="hero container"><Reveal direction="left" className="hero-copy"><div className="eyebrow"><span className="tiny-line"/> ПОСТУПЛЕНИЕ В ТВОЁМ ТЕМПЕ</div><h1>Куда поступать.<br/><em>С чего начать.</em></h1><p className="lead">Большие планы становятся ближе,<br className="desktop"/> когда понятен следующий шаг.</p><p className="hero-description">Найди программу под свои интересы и собери<br className="desktop"/> маршрут поступления — от выбора до заявки.</p><div className="hero-actions"><button className="button" onClick={begin}>Построить маршрут <Arrow/></button><button className="text-button" onClick={()=>go('catalog')}>Каталог программ <span>↗</span></button></div><div className="hero-footnote"><span className="small-check">✓</span> Вход по email для сохранения <span className="dot"/> Ответы можно изменить</div></Reveal><Reveal direction="right" className="hero-art"><Model/></Reveal></section>
 <div className="container principle-strip"><span>Твои интересы</span><i/><span>Твои возможности</span><i/><span>Твой следующий шаг</span><span className="strip-end">Всё складывается в маршрут <span>↘</span></span></div>
 <section className="campus-gallery container" aria-label="Университеты каталога"><div className="campus-gallery-heading"><span className="eyebrow">УНИВЕРСИТЕТЫ В КАТАЛОГЕ</span><h2>Представь, куда приведёт твой маршрут.</h2><button className="text-button" onClick={()=>go('catalog')}>Исследовать вузы ↗</button></div><div className="campus-gallery-grid">{[{name:'Nazarbayev University',place:'Астана, Казахстан',photo:'/universities/nu.jpg'},{name:'TU Delft',place:'Делфт, Нидерланды',photo:'/universities/delft.jpg'},{name:'University of Oxford',place:'Оксфорд, Великобритания',photo:'/universities/oxford.jpg'}].map(university=><article key={university.name}><Image src={university.photo} alt={`Кампус ${university.name}`} fill sizes="(max-width: 650px) 100vw, 33vw"/><div><strong>{university.name}</strong><span>{university.place}</span></div></article>)}</div></section>
 <section id="how" className="section container"><Reveal><div className="section-top"><div><div className="eyebrow">НЕ ПРОСТО СПИСОК УНИВЕРСИТЕТОВ</div><h2>Много вариантов.<br/><em>Один — ближе тебе.</em></h2></div><p>Интересы, бюджет и планы на будущее.<br/>Поможем увидеть, что подходит тебе<br/>и что понадобится для поступления.</p></div></Reveal><Reveal className="showcase"><div className="showcase-art"><Model/><div className="sample-caption">Выбор начинается с тебя</div></div><div className="showcase-content"><span className="pill">ПРИМЕР ПОДБОРА</span><h3>Компьютерные науки</h3><p className="muted-text">Здесь твои интересы становятся направлением.</p><dl className="match-list"><div><dt><span>⌘</span> Интересы</dt><dd>Технологии и продукты</dd></div><div><dt><span>↔</span> Бюджет</dt><dd>В твоём диапазоне</dd></div><div><dt><span>↗</span> Следующий шаг</dt><dd>Сравнить программы</dd></div></dl><button className="text-button plum" onClick={example}>Посмотреть пример подбора <Arrow/></button><span className="demo-note">Иллюстрация интерфейса · подбор из реального каталога</span></div></Reveal></section>
 <section className="section container plan-section"><Reveal direction="left"><div className="eyebrow">ОТ ЦЕЛИ К ДЕЙСТВИЮ</div><h2>Большой путь.<br/><em>Посильные шаги.</em></h2><p className="section-description">Экзамены, документы и сроки — в одном плане.<br/>Не всё сразу. Только то, что важно сейчас.</p><div className="steps">{[['Расскажи о себе','Интересы, возможности и то, к чему стремишься.'],['Выбери подходящее','Сравни варианты и пойми причины подбора.'],['Двигайся в своём темпе','Начни с одной задачи. Отмечай свой прогресс.']].map(([title,desc],i)=><div className="step-row" key={title}><span>0{i+1}</span><div><h3>{title}</h3><p>{desc}</p></div></div>)}</div></Reveal><Reveal direction="right" className="calendar-art"><Model kind="calendar"/><span className="art-index">02 / СДЕЛАТЬ ПЕРВЫЙ ШАГ</span></Reveal></section>
 <section id="faq" className="section container faq-section"><Reveal><div className="eyebrow">ДАВАЙ РАЗБЕРЁМСЯ</div><h2>Есть вопросы?<br/><em>Это нормально.</em></h2><p className="section-description">Первый шаг не обязан быть очевидным.</p></Reveal><Reveal className="faq-list">{faqs.map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</Reveal></section>
 <section className="container cta-wrap"><Reveal className="cta"><div><span className="eyebrow">НАЧНИ С ТОГО, ЧТО ВАЖНО ТЕБЕ</span><h2>Твой следующий шаг — здесь.</h2><p>Твои цели. Твой темп. Твой план.</p></div><button className="button light" onClick={begin}>Составить мой план <Arrow/></button><span className="cta-decoration" aria-hidden="true">↗</span></Reveal></section>
 </>:view==='catalog'?<CatalogView compared={compared} onPick={pick} onCompare={toggleCompare}/>:view==='profile'?<AdmissionWizard profile={profile} step={step} setStep={setStep} patch={patch} finish={()=>{setHasProfile(true);setAnalysisStage(0);go('analyzing')}} back={()=>go(hasProfile?'diagnosis':'home')}/>:view==='analyzing'&&hasProfile?<AnalysisLoading stage={analysisStage}/>:view==='diagnosis'&&hasProfile?<AdmissionProfile profile={profile} insight={insightLocale===locale?aiInsight:null} onMatches={()=>go('results')} onEdit={begin}/>:!hasProfile?<section className="empty-state container"><div className="eyebrow">НАЧНЁМ СО ЗНАКОМСТВА</div><h1>Маршрут начинается<br/><em>с твоих целей.</em></h1><p>Ответь на несколько вопросов, чтобы увидеть подбор и план.</p><button className="button" onClick={begin}>Заполнить профиль <Arrow/></button></section>:view==='results'?<ProgramMatches profile={profile} ranked={ranked} compared={compared} onEdit={begin} onPick={pick} onCompare={toggleCompare} onComparePage={()=>go('compare')} onExploreAllCountries={()=>{patch('countries',[]);patch('country','Любая')}}/>:view==='compare'?<ProgramComparison profile={profile} items={comparePrograms} onBack={()=>go('results')} onPick={pick} onRemove={toggleCompare}/>:chosen?<AdmissionRoadmap profile={profile} program={chosen} done={done} onToggle={id=>setDone(current=>current.includes(id)?current.filter(x=>x!==id):[...current,id])} onBack={()=>go('results')} onEdit={begin} onClear={clear}/>:<section className="workspace container"><div className="workspace-top"><button className="back-button" onClick={()=>go('results')}>← К программам</button></div><div className="empty-state"><h1>Выбери цель.<br/><em>Соберём маршрут.</em></h1><p>Выбери программу из подбора, чтобы увидеть персональные задачи.</p><button className="button" onClick={()=>go('results')}>К программам <Arrow/></button></div></section>}
 </main><footer className="footer container"><button className="logo-button" onClick={()=>go('home')}><Logo/></button><span>Большие планы. Понятные шаги.</span><button onClick={()=>setPrivacy(!privacy)}>О данных и проекте</button><small>LOCUS · Кейс 02 · Прототип</small></footer>{privacy&&<div className="privacy-panel container" role="region" aria-label="О данных и проекте"><h2>Как сохраняются данные</h2><p>После входа ответы, выбор программы и прогресс сохраняются в вашем аккаунте на сервере. Без входа они доступны только в текущей вкладке. Для AI-диагностики, сравнения и маршрута ответы анкеты могут передаваться Groq. Условия поступления и стоимость проверяйте на сайте университета перед подачей.</p><button className="text-button" onClick={()=>setPrivacy(false)}>Закрыть ×</button></div>}</>);
}
