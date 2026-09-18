import { annualRangeEur, approximateEur, fx, programs, tuitionPerYear, type Currency, type Program } from './program-catalog.ts';
export { programs, type Program } from './program-catalog.ts';

export type Profile = { name:string;age:number;grade:string;residence:string;citizenship:string;schoolQualification:string;interest:string;customInterest:string;alternatives:string[];country:string;countries:string[];budget:number;aid:string;priorities:Record<string,number>;english:string;englishExam:string;englishLevel:string;toefl:number;sat:number;satWilling:string;year:string;grades:string;gpa:number;gpaScale:number;subjects:string[];readiness:string };
export const directions = ['Технологии','Дизайн','Бизнес','Инженерия','Медицина и здоровье','Право','Архитектура','Психология','Естественные науки','Гуманитарные науки','Социальные науки','Искусство и медиа','Образование','Экология','Международные отношения'] as const;
export const focusName=(profile:Profile)=>profile.interest==='Другое'?profile.customInterest.trim():profile.interest;
export const defaults:Profile={name:'',age:17,grade:'11 класс',residence:'Казахстан',citizenship:'Казахстан',schoolQualification:'Обычный аттестат',interest:'Технологии',customInterest:'',alternatives:[],country:'Любая',countries:[],budget:12000,aid:'Желательно',priorities:{scholarship:2,ranking:1,cost:2,location:1,career:1},english:'0',englishExam:'Не сдавал',englishLevel:'Не знаю',toefl:0,sat:0,satWilling:'Не знаю',year:'2027',grades:'4–5',gpa:4.5,gpaScale:5,subjects:[],readiness:'Изучаю варианты'};
export const formatMoney=(value:number)=>new Intl.NumberFormat('ru-RU').format(value)+' €';
const symbols:Record<Currency,string>={EUR:'€',USD:'$',PLN:'PLN',KRW:'₩',KZT:'₸',GBP:'£',CAD:'CAD',AUD:'AUD',JPY:'¥',SGD:'SGD'};
export function formatTuition(program:Program):string{
 const t=program.tuition;if(!t)return 'Не опубликована';
 if(t.annualRange){const f=(n:number)=>new Intl.NumberFormat('ru-RU').format(n);return `≈${f(t.annualRange.min)}–${f(t.annualRange.max)} ${symbols[t.currency]} / год (${t.annualRange.credits} ECTS)`;}
 const annual=tuitionPerYear(program);
 if(!annual)return `${new Intl.NumberFormat('ru-RU').format(t.amount)} ${symbols[t.currency]} / ${t.period==='month'?'месяц':'кредит'}`;
 return `${new Intl.NumberFormat('ru-RU').format(annual.amount)} ${symbols[annual.currency]} / год`;
}
export function budgetComparison(profile:Profile,program:Program):'within'|'above'|'unknown'{
 if(profile.citizenship!=='Казахстан')return 'unknown';
 const range=annualRangeEur(program);
 if(range)return profile.budget>=range.max?'within':profile.budget<range.min?'above':'unknown';
 const eur=approximateEur(program);return eur===null?'unknown':eur<=profile.budget?'within':'above';
}
function interestsFor(profile:Profile):string[]{
 const list: string[] = [];
 if ((directions as readonly string[]).includes(profile.interest)) {
  list.push(profile.interest);
 }
 if (Array.isArray(profile.alternatives)) {
  for (const alt of profile.alternatives) {
   if ((directions as readonly string[]).includes(alt) && !list.includes(alt)) {
    list.push(alt);
   }
  }
 }
 if (list.length > 0) return list;

 const focus = focusName(profile).toLocaleLowerCase('ru');
 if (/компьют|программ|информат|данн|ai|искусственн|робот|кибер|разработ|computer science|software engineering|\bit\b/i.test(focus)) return ['Технологии'];
 if (/бизнес|эконом|финанс|менедж|маркет|предприним/i.test(focus)) return ['Бизнес'];
 if (/дизайн|график|анимац|ux|ui|коммуникац/i.test(focus)) return ['Дизайн'];
 if (/инженер|механик|электро|строит|робототехн/i.test(focus)) return ['Инженерия'];
 if (/медицин|врач|лечебн|биомед|фарм|здоров/i.test(focus)) return ['Медицина и здоровье'];
 if (/прав|юрисп|закон|law/i.test(focus)) return ['Право'];
 if (/архитект|урбан|градостро/i.test(focus)) return ['Архитектура'];
 if (/психол|когнитив|поведен/i.test(focus)) return ['Психология'];
 if (/биолог|физик|химия|математ|наук/i.test(focus)) return ['Естественные науки'];
 if (/истор|филолог|литератур|философ|язык/i.test(focus)) return ['Гуманитарные науки'];
 if (/социолог|политолог|обществ/i.test(focus)) return ['Социальные науки'];
 if (/кино|фильм|медиа|арт|искусств|живопис/i.test(focus)) return ['Искусство и медиа'];
 if (/педагог|учител|образован|преподават/i.test(focus)) return ['Образование'];
 if (/эколог|климат|окружающ|природ/i.test(focus)) return ['Экология'];
 if (/международн|дипломат|отношен/i.test(focus)) return ['Международные отношения'];
 return [];
}
export function recommend(profile:Profile, programList:Program[] = programs){
 const focus=focusName(profile);if(!focus)return [];
 const categories=interestsFor(profile);
 const destinations=profile.countries?.length?profile.countries:profile.country==='Любая'?[]:[profile.country];
 return programList.filter(p=>categories.includes(p.interest)&&(!destinations.length||destinations.includes(p.country))).map(p=>{
  const reasons:string[]=[`Реальная программа по направлению «${p.interest.toLowerCase()}»`],gaps:string[]=[];
  const cost=budgetComparison(profile,p);
  if(cost==='within')reasons.push('Ориентир по tuition укладывается в бюджет');
  else if(cost==='above')gaps.push(p.tuition?.annualRange?`Даже нижняя граница стоимости выше бюджета: ${formatTuition(p)}`:`Tuition выше бюджета: около ${formatMoney(approximateEur(p)!)} в год по курсу ${fx.date}`);
  else gaps.push(profile.citizenship!=='Казахстан'?'Тариф нужно проверить для твоего гражданства':p.tuition?.annualRange?`Бюджет попадает в диапазон ${formatTuition(p)}; итог зависит от предметов`:'Годовая стоимость пока не подтверждена');
  if(destinations.length)reasons.push('В выбранной стране');
  const diplomaGap=p.school==='University of Twente'&&profile.citizenship==='Казахстан'&&profile.schoolQualification==='Обычный аттестат';
  if(diplomaGap)gaps.push('Обычный аттестат Казахстана не даёт прямого поступления в Twente');
  if(profile.englishExam==='Не сдавал')gaps.push(profile.englishLevel!=='Не знаю'?`Английский ${profile.englishLevel} — самооценка; нужен официальный документ`:'Английский нужно подтвердить');
  else if(profile.englishExam==='IELTS'&&p.english.ielts!==null){
   if(Number(profile.english)<p.english.ielts)gaps.push(`Общий IELTS ниже порога ${p.english.ielts}`);
   else reasons.push('Общий IELTS достигает опубликованного порога; проверь секции');
  }else gaps.push('Способ подтверждения английского нужно сверить');
  if(p.specialRequirement)gaps.push(p.specialRequirement);
  const score=(cost==='within'?3:cost==='above'?-3:0)*(1+(profile.priorities.cost??1))+(profile.englishExam==='IELTS'&&p.english.ielts!==null?(Number(profile.english)>=p.english.ielts?2:-2):0)-(diplomaGap?8:0)+(p.tuition?.year.startsWith(profile.year)?2:0);
  return {...p,reasons,gaps,score};
 }).sort((a,b)=>b.score-a.score||(approximateEur(a)??Infinity)-(approximateEur(b)??Infinity));
}
export function makeTasks(profile:Profile,program:Program){
 const tasks:{id:string;title:string;detail:string;when:string;category:string}[]=[
  {id:'verify-'+program.id,title:'Проверить условия программы',detail:`Открой официальную страницу ${program.school}. Сверь требования для своего гражданства, диплома и года поступления.`,when:'Первый шаг',category:'Выбор'}
 ];
 const cost=budgetComparison(profile,program);
 if(cost==='above')tasks.push({id:'fund-'+program.id,title:'Составить план финансирования',detail:`Tuition: ${formatTuition(program)} (${program.tuition?.year}). ${program.tuition?.annualRange?'Даже нижняя граница выше твоего бюджета.':`Ориентир по курсу ${fx.date}: ≈${formatMoney(approximateEur(program)!)} в год.`} Добавь сборы и проживание.`,when:'До выбора программы',category:'Финансы'});
 else if(cost==='unknown')tasks.push({id:'cost-'+program.id,title:'Уточнить полную стоимость',detail:`Текущий тариф: ${formatTuition(program)}. Найди годовую цену, сборы и расходы на проживание.`,when:'До выбора программы',category:'Финансы'});
 if(profile.englishExam==='Не сдавал')tasks.push({id:'english-'+program.id,title:'Подтвердить английский',detail:`Твоя самооценка: ${profile.englishLevel}. ${program.english.detail}`,when:'Начать заранее',category:'Экзамены'});
 else if(profile.englishExam==='IELTS'&&program.english.ielts!==null&&Number(profile.english)<program.english.ielts)tasks.push({id:'english-'+program.id,title:'Подготовиться к IELTS',detail:program.english.detail,when:'До подачи',category:'Экзамены'});
 else tasks.push({id:'language-'+program.id,title:'Сверить языковые требования',detail:program.english.detail,when:'До подачи',category:'Экзамены'});
 if(program.school==='University of Twente'&&profile.citizenship==='Казахстан'&&profile.schoolQualification==='Обычный аттестат')tasks.push({id:'diploma-'+program.id,title:'Проверить признание диплома',detail:program.admissionNote,when:'Как можно раньше',category:'Документы'});
 if(program.specialRequirement)tasks.push({id:'extra-'+program.id,title:'Подготовить дополнительное требование',detail:program.specialRequirement,when:'До подачи',category:'Экзамены'});
 if(profile.aid!=='Нет')tasks.push({id:'aid-'+program.id,title:'Проверить финансирование',detail:program.scholarshipNote,when:'До подачи',category:'Финансы'});
 tasks.push({id:'docs-'+program.id,title:'Собрать документы',detail:'Подготовь оценки, аттестат или прогноз оценок, переводы и документ личности. Полный список сверяй с правилами приёма.',when:`До подачи в ${profile.year}`,category:'Документы'});
 const when=program.deadline?.intake===profile.year?new Date(`${program.deadline.date}T12:00:00Z`).toLocaleDateString('ru-RU'):'срок не подтверждён';
 tasks.push({id:`apply-${program.id}-${profile.year}`,title:'Подать заявку',detail:`Проверь официальный источник: ${program.admissionUrl}. Срок для набора ${profile.year}: ${when}. Сохрани подтверждение подачи.`,when:`Набор ${profile.year} · ${when}`,category:'Поступление'});
 return tasks;
}
