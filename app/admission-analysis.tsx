'use client';
import { diagnose } from '../lib/diagnosis';
import { type Profile, recommend } from '../lib/admissions';
import { money } from '../lib/i18n';
import { useLanguage } from './language';
import type { AiDiagnosis } from '../lib/ai-diagnosis';

const phases=['Анализируем академический профиль','Проверяем ограничения','Сопоставляем программы','Строим план поступления'];
const bottlenecks={destination:'Подтверждённых программ пока нет',budget:'Стоимость выше бюджета',english:'Языковые требования',grades:'Академическая подготовка',verification:'Проверка реальных требований'} as const;
const priorities={destination:'Расширь список стран или проверь реальные программы в выбранной стране.',budget:'Проверь финансирование и стоимость обучения до окончательного выбора.',english:'Уточни требуемый экзамен и готовь язык параллельно с документами.',grades:'Укрепи профильные предметы и собери подтверждения своих достижений.',verification:'Сверь программы и сроки на официальных сайтах, затем начни собирать документы.'} as const;

export function AnalysisLoading({stage}:{stage:number}){
 const {t}=useLanguage();
 return <section className="analysis-loading container" aria-live="polite"><div className="analysis-orbit" aria-hidden="true"><i/><i/><i/><span>↗</span></div><div className="eyebrow">{t('ТВОЯ СТРАТЕГИЯ ПОСТУПЛЕНИЯ')}</div><h1>{t('Собираем твой маршрут.')}</h1><p>{t('Сопоставляем твои ответы и готовим понятный следующий шаг.')}</p><ol className="analysis-phases">{phases.map((item,index)=><li key={item} className={index<stage?'complete':index===stage?'active':''}><span aria-hidden="true">{index<stage?'✓':`0${index+1}`}</span>{t(item)}</li>)}</ol></section>;
}

export function AdmissionProfile({profile,insight,onMatches,onEdit}:{profile:Profile;insight:AiDiagnosis|null;onMatches:()=>void;onEdit:()=>void}){
 const {locale,t}=useLanguage();
 const diagnosis=diagnose(profile);
 const matches=recommend(profile);
 const destinations=profile.countries?.length ? profile.countries : profile.country==='Любая' ? [] : [profile.country];
 const englishValue=profile.englishExam==='IELTS' ? 'IELTS '+profile.english : profile.englishExam==='TOEFL' ? 'TOEFL '+profile.toefl : profile.englishLevel==='Не знаю' ? t('Не указан') : profile.englishLevel;
 const englishNote=profile.englishExam==='Не сдавал' ? profile.englishLevel==='Не знаю' ? t('Не сдавал') : t('Самооценка, не экзамен') : t('Результат анкеты');
 const snapshot=[
  {label:t('Направление'),value:t(diagnosis.goal),note:t('Бакалавриат')},
  {label:t('Средний балл'),value:profile.gpa+' / '+profile.gpaScale,note:t(profile.grade)},
  {label:t('Английский'),value:englishValue,note:englishNote},
  {label:t('Бюджет в год'),value:money(profile.budget,locale),note:t('На обучение')},
  {label:t('Страны'),value:destinations.length?destinations.map(t).join(', '):t('Пока открыты'),note:t('Предпочтение')},
  {label:t('Поступление'),value:profile.year,note:profile.sat?'SAT '+profile.sat:t('Бакалавриат')},
 ];
 const strengthText=(kind:typeof diagnosis.strengths[number])=>{
  if(kind==='grades') return <>{t('Сильный средний балл')} · {profile.gpa}/{profile.gpaScale}</>;
  if(kind==='subjects') return <>{t('Сильные предметы')}: {profile.subjects.map(t).join(', ')}</>;
  if(kind==='english') return <>{t('Указанный результат IELTS')} · {profile.english}</>;
  return t('Чёткая академическая цель');
 };
 const constraintText=(kind:typeof diagnosis.constraints[number])=>{
  if(kind==='destination') return t('По выбранному направлению и странам нет подтверждённых программ');
  if(kind==='budget') return <>{t('Бюджет на обучение до')} {money(profile.budget,locale)} {t('в год')}</>;
  if(kind==='englishExam') return profile.englishExam==='TOEFL'?t('TOEFL нужно сверить с требованием вуза'):<>{t('Английский без экзамена')}{profile.englishLevel!=='Не знаю'?` · ${profile.englishLevel}`:''}</>;
  if(kind==='englishScore') return <>IELTS {profile.english} · {t('часть программ требует больше')}</>;
  if(kind==='sat') return t('SAT не сдан — проверь, нужен ли он');
  if(kind==='grades') return t('Средний балл стоит усилить');
  return t('Неполные данные программ нужно проверить');
 };
 return <section className="workspace container admission-profile">
  <div className="workspace-top"><span className="eyebrow">{t('01 / ТВОЯ ДИАГНОСТИКА')}</span><button className="text-button" onClick={onEdit}>{t('Изменить ответы')} ↗</button></div>

  <div className="diagnosis-hero">
   <div className="diagnosis-hero-copy">
    <span className="diagnosis-status"><i aria-hidden="true"/>{insight?t('AI-анализ готов'):t('Профиль проанализирован')}</span>
    <span className="diagnosis-kicker">{t('ТВОЯ ОТПРАВНАЯ ТОЧКА')}</span>
    <h1>{t('Понять себя.')}<br/><em>{t('Увидеть путь.')}</em></h1>
    <p>{insight?.summary || t('Мы сопоставили твою цель, академические данные и ограничения. Ниже — что уже помогает и на чём стоит сосредоточиться.')}</p>
   </div>
   <div className="diagnosis-hero-goal">
    <span className="diagnosis-goal-symbol" aria-hidden="true">↗</span>
    <span className="diagnosis-goal-label">{t('ОБРАЗОВАТЕЛЬНАЯ ЦЕЛЬ')}</span>
    <strong>{t('Бакалавриат')}<br/>{t(diagnosis.goal)}</strong>
    <span className="diagnosis-goal-line"/>
    <small>{destinations.length?destinations.map(t).join(' · '):t('Страна пока открыта')}<br/>{t('Набор')} {profile.year}</small>
   </div>
  </div>

  <div className="diagnosis-section-heading"><div><span className="eyebrow">{t('01 / ФАКТЫ')}</span><h2>{t('Твой профиль в деталях')}</h2></div><p>{t('Это ответы анкеты, на которых строится разбор. Если что-то изменится, диагностику можно пройти заново.')}</p></div>
  <div className="diagnosis-snapshot">{snapshot.map(({label,value,note})=><div className="diagnosis-snapshot-item" key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></div>)}</div>
  <div className="diagnosis-extra"><span><b>{t('Финансовая помощь')}</b>{t(profile.aid)}</span><span><b>{t('Готовность к подаче')}</b>{t(profile.readiness)}</span><span><b>{t('Сильные предметы')}</b>{profile.subjects.length?profile.subjects.map(t).join(', '):t('Не выбраны')}</span></div>

  <div className="diagnosis-section-heading diagnosis-section-heading-spaced"><div><span className="eyebrow">{t('02 / КАРТИНА ЦЕЛИКОМ')}</span><h2>{t('Что помогает. Что проверить.')}</h2></div><p>{t('Сильные стороны можно использовать уже сейчас. Ограничения показывают, что требует внимания перед подачей.')}</p></div>
  <div className="analysis-grid">
   <article className="analysis-card analysis-card-strength"><div className="analysis-card-head"><div className="analysis-card-icon" aria-hidden="true">↗</div><span>{t('ТВОЯ ОПОРА')}</span></div><h3>{t('Сильные стороны')}</h3><ul>{diagnosis.strengths.map((kind,i)=><li key={kind+'-'+i}><span aria-hidden="true">✓</span>{strengthText(kind)}</li>)}</ul>{insight&&<p className="analysis-insight">{insight.strengthInsight}</p>}</article>
   <article className="analysis-card analysis-card-constraint"><div className="analysis-card-head"><div className="analysis-card-icon warning" aria-hidden="true">!</div><span>{t('ЗОНА ВНИМАНИЯ')}</span></div><h3>{t('Что учесть')}</h3><ul>{diagnosis.constraints.map((kind,i)=><li key={kind+'-'+i}><span aria-hidden="true">•</span>{constraintText(kind)}</li>)}</ul>{insight&&<p className="analysis-insight">{insight.constraintInsight}</p>}</article>
  </div>

  <div className="diagnosis-focus"><div className="diagnosis-focus-main"><span className="diagnosis-focus-index">03 / {t('ГЛАВНЫЙ ФОКУС')}</span><h2>{t(bottlenecks[diagnosis.bottleneck])}</h2><p>{insight?.bottleneckInsight || t('Это ограничение сейчас сильнее всего влияет на ближайшие шаги.')}</p></div><div className="diagnosis-focus-action"><span className="diagnosis-focus-index">{t('ПЕРВЫЙ ПРИОРИТЕТ')}</span><p>{insight?.priority || t(priorities[diagnosis.bottleneck])}</p></div></div>

  <div className="diagnosis-section-heading diagnosis-section-heading-spaced"><div><span className="eyebrow">{t('04 / ДАЛЬШЕ')}</span><h2>{t('С чего начать сейчас')}</h2></div><p>{t('Маршрут не нужно проходить за один день. Начни с главного, затем уточни детали и сравни варианты.')}</p></div>
  <ol className="diagnosis-next-steps">
   <li><span>01</span><div><h3>{t('Разобраться с главным ограничением')}</h3><p>{t(priorities[diagnosis.bottleneck])}</p></div></li>
   <li><span>02</span><div><h3>{t('Проверить реальные требования')}</h3><p>{t('На официальных сайтах уточни язык, стоимость, документы и сроки подачи для интересующих программ.')}</p></div></li>
   <li><span>03</span><div><h3>{t('Сравнить варианты')}</h3><p>{t('Открой подбор, сравни программы и выбери одну, чтобы получить пошаговый план.')}</p></div></li>
  </ol>

  <div className="diagnosis-bottom"><div><span className="diagnosis-bottom-label">{t('ГОТОВ К СЛЕДУЮЩЕМУ ШАГУ?')}</span><h2>{t('Теперь посмотрим варианты.')}</h2><p>{t('Подбор покажет реальные программы с источниками и объяснит, почему каждая оказалась в списке.')}</p></div><button className="button" onClick={onMatches}>{t('Посмотреть мои программы')} <span aria-hidden="true">↗</span></button></div>
  <details className="diagnosis-method"><summary>{t('Как составлена эта диагностика?')}</summary><p>{t(insight?'Groq подготовил текстовые пояснения и формулировку первого шага. Цель, сильные стороны и главное ограничение определяются правилами анкеты.':'Сейчас выводы построены по ответам анкеты и прозрачным правилам. Текстовый AI-анализ не был доступен.')}</p><p>{t('Каталог содержит реальные программы и официальные источники. Неполные данные отмечены; перед подачей перепроверь требования и сроки. Это не оценка шансов поступления.')}</p></details>
  <span className="sr-only">{matches.length} {t('подтверждённых вариантов')}</span>
 </section>;
}
