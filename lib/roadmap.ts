import { approximateEur, fx, type Program } from './program-catalog.ts';
import { budgetComparison, formatTuition, type Profile } from './admissions.ts';

export const roadmapIds = ['eligibility','academics','english','exams','finance','documents','application','after'] as const;
export type RoadmapId = typeof roadmapIds[number];
export type RoadmapStage = {id:RoadmapId;title:string;when:string;summary:string;actions:string[];checkpoint:string;sourceLabel:string;sourceUrl:string};
export type AiRoadmap = {intro:string;priority:string;stages:{id:RoadmapId;focus:string;extraActions:string[];checkpoint:string}[];outro:string};

export function buildRoadmap(profile:Profile,program:Program):RoadmapStage[]{
 const deadline=program.deadline?.intake===profile.year?program.deadline:null;
 const cost=budgetComparison(profile,program);
 const english=profile.englishExam==='IELTS' ? Number(profile.english) : null;
 const englishStatus=profile.englishExam==='Не сдавал'
  ? `Экзамен ещё не сдан. Уровень ${profile.englishLevel} — только самооценка.`
  : profile.englishExam==='IELTS'&&program.english.ielts!==null
   ? `Твой IELTS overall ${profile.english}; опубликованный порог ${program.english.ielts}. ${english !== null && english >= program.english.ielts?'Общий балл достигает порога, но секции и срок действия результата нужно сверить.':'Общий балл пока ниже порога.'}`
   : 'Способ подтверждения английского по этому результату нужно сверить с правилами программы.';
 const costStatus=cost==='within'?'Ориентир по tuition укладывается в указанный бюджет.':cost==='above'?'Ориентир по tuition выше указанного бюджета.':'Стоимость для твоего бюджета пока не подтверждена.';
 const abroad=program.country!==profile.residence;
 return [
  {id:'eligibility',title:'Проверить путь поступления',when:'Начни сейчас',summary:`${program.school} · ${program.title}. Твой документ: ${profile.schoolQualification}. ${program.admissionNote}`,actions:[
   `Открой правила приёма ${program.school} для гражданства «${profile.citizenship}» и документа «${profile.schoolQualification}».`,
   'Выпиши условия прямого поступления и альтернативные пути, если обычный аттестат не подходит.',
   'Запиши вопросы приёмной комиссии, если на странице не указан именно твой сценарий.'
  ],checkpoint:'Понятен доступный путь поступления и список условий, которые нужно подтвердить.',sourceLabel:'Правила приёма',sourceUrl:program.admissionUrl},
  {id:'academics',title:'Укрепить академический профиль',when:'Параллельно с проверкой',summary:`Средний балл ${profile.gpa}/${profile.gpaScale}. Сильные предметы: ${profile.subjects.length?profile.subjects.join(', '):'не указаны'}. Направление — ${program.interest}.`,actions:[
   'Собери актуальную выписку оценок и отметь предметы, связанные с выбранной программой.',
   'Определи 1–2 предмета, где улучшение оценки или подтверждённый проект усилит заявку.',
   'Проверь у вуза, нужны ли оценки за конкретные классы или профильные предметы.'
  ],checkpoint:'Готова выписка оценок и понятен план по профильным предметам.',sourceLabel:'Страница программы',sourceUrl:program.programUrl},
  {id:'english',title:'Подтвердить английский',when:'Начни заранее',summary:`${englishStatus} ${program.english.detail}`,actions:[
   profile.englishExam==='Не сдавал'?'Пройди диагностический тест и выбери дату официального экзамена после проверки правил программы.':`Сверь, принимает ли программа ${profile.englishExam}, и проверь требования к каждому компоненту.`,
   profile.englishExam==='IELTS'&&program.english.ielts!==null&&english !== null && english < program.english.ielts?'Составь график подготовки к повторной сдаче с акцентом на слабые секции.':'Составь регулярный график практики чтения, письма, аудирования и речи.',
   'Сохрани официальный результат и проверь срок его действия на момент подачи.'
  ],checkpoint:'Есть действующий официальный языковой результат по правилам программы.',sourceLabel:'Требования к языку',sourceUrl:program.english.source},
  {id:'exams',title:'Разобраться с вступительными условиями',when:'До сбора заявки',summary:program.specialRequirement?`${program.specialRequirement} ${program.admissionNote}`:program.admissionNote,actions:[
   'Из официальных правил выпиши, какие тесты, собеседования или дополнительные материалы относятся именно к твоему пути поступления.',
   program.specialRequirement?`Подготовь отдельный план для требования: ${program.specialRequirement}`:'Не записывай SAT или другой тест как обязательный, пока вуз не подтвердит его для твоего пути.',
   'Проверь формат, регистрацию и срок результата только для подтверждённых испытаний.'
  ],checkpoint:'Есть точный список обязательных испытаний и материалов для твоего пути.',sourceLabel:'Условия поступления',sourceUrl:program.admissionUrl},
  {id:'finance',title:'Посчитать полную стоимость',when:'До окончательного выбора',summary:`Tuition: ${formatTuition(program)} (${program.tuition?.year??'год не указан'}). ${costStatus} Финансирование: ${program.scholarshipNote}`,actions:[
   `Сравни опубликованный тариф с бюджетом ${new Intl.NumberFormat('ru-RU').format(profile.budget)} € в год; для другой валюты используй курс на ${fx.date} только как ориентир.`,
   'Добавь отдельно обязательные сборы, страховку, проживание, питание и транспорт.',
   profile.aid==='Нет'?'Определи доступный резерв на непредвиденные расходы.':'Проверь сроки, критерии и отдельную заявку на грант или скидку; не считай финансирование гарантированным.'
  ],checkpoint:'Есть годовой бюджет с tuition и отдельными расходами, а также подтверждённый план финансирования.',sourceLabel:'Источник тарифа',sourceUrl:program.tuition?.source??program.costUrl??program.programUrl},
  {id:'documents',title:'Собрать пакет документов',when:'До открытия подачи',summary:'Точный перечень документов зависит от гражданства, диплома и пути поступления. Его нужно сверить с вузом.',actions:[
   'Сверь в правилах программы полный перечень документов и формат загрузки для своего пути.',
   'Подготовь удостоверение личности, выписку оценок, школьный документ и переводы, если они требуются.',
   'Проверь, нужны ли рекомендации, мотивационное письмо, портфолио или заверение; не готовь их как обязательные без подтверждения.'
  ],checkpoint:'Все обязательные документы готовы в требуемом формате и проверены по чеклисту вуза.',sourceLabel:'Правила приёма',sourceUrl:program.admissionUrl},
  {id:'application',title:'Подать заявку',when:deadline?`До ${deadline.date}`:'После подтверждения срока',summary:deadline?`Для набора ${profile.year} в каталоге указан срок ${deadline.date} (${deadline.label}). Перепроверь его перед подачей.`:`Срок подачи на набор ${profile.year} в каталоге не подтверждён. Не планируй отправку по неподтверждённой дате.`,actions:[
   'Открой официальный портал и ещё раз проверь требования, срок и часовой пояс дедлайна.',
   'Заполни форму, загрузи проверенные документы и перепроверь данные перед отправкой.',
   'Сохрани номер заявки, письмо с подтверждением и копии отправленных файлов.'
  ],checkpoint:'Заявка отправлена через официальный канал и подтверждение сохранено.',sourceLabel:'Подача заявки',sourceUrl:program.admissionUrl},
  {id:'after',title:'Следить за решением и готовиться к старту',when:'После подачи',summary:`После отправки следи за сообщениями ${program.school}. ${abroad?'Если получишь предложение и обучение будет за границей, отдельно проверь визовые и миграционные требования.':'После предложения проверь дальнейшие шаги университета.'}`,actions:[
   'Регулярно проверяй личный кабинет и почту; отвечай на запросы дополнительных документов.',
   'После официального решения изучи условия предложения и сроки подтверждения места.',
   abroad?'После зачисления проверь актуальные визовые правила, жильё и финансовые документы.':'После зачисления уточни оплату, регистрацию и начало обучения.'
  ],checkpoint:'Решение получено, условия предложения выполнены, подготовка к старту подтверждена.',sourceLabel:'Приёмная комиссия',sourceUrl:program.admissionUrl}
 ];
}

export function roadmapInput(profile:Profile,program:Program,stages:RoadmapStage[]){
 return {profile:{goal:profile.interest==='Другое'?profile.customInterest:profile.interest,year:profile.year,grade:profile.grade,citizenship:profile.citizenship,residence:profile.residence,schoolQualification:profile.schoolQualification,gpa:profile.gpa,gpaScale:profile.gpaScale,subjects:profile.subjects,englishExam:profile.englishExam,ieltsOverall:profile.englishExam==='IELTS'?profile.english:null,toefl:profile.englishExam==='TOEFL'?profile.toefl:null,englishSelfAssessment:profile.englishExam==='Не сдавал'?profile.englishLevel:null,sat:profile.sat||null,satWilling:profile.satWilling,budgetEUR:profile.budget,aid:profile.aid,readiness:profile.readiness},program:{id:program.id,title:program.title,school:program.school,country:program.country,duration:program.duration,tuition:program.tuition,approximateAnnualEUR:approximateEur(program),english:program.english,deadline:program.deadline?.intake===profile.year?program.deadline:null,admissionNote:program.admissionNote,specialRequirement:program.specialRequirement??null,scholarshipNote:program.scholarshipNote},stages:stages.map(({id,title,summary,actions})=>({id,title,summary,verifiedActions:actions}))};
}

export function parseAiRoadmap(value:unknown):AiRoadmap|null{
 if(!value||typeof value!=='object')return null;
 const data=value as Record<string,unknown>;
 const line=(v:unknown,max:number)=>typeof v==='string'&&v.trim().length>=12&&v.length<=max&&!/[<>]/.test(v);
 if(!line(data.intro,650)||!line(data.priority,450)||!line(data.outro,450)||!Array.isArray(data.stages)||data.stages.length!==roadmapIds.length)return null;
 const rows=data.stages as Record<string,unknown>[];
 if(!rows.every((row,i)=>row&&typeof row==='object'&&row.id===roadmapIds[i]&&line(row.focus,480)&&line(row.checkpoint,300)&&Array.isArray(row.extraActions)&&row.extraActions.length>=1&&row.extraActions.length<=2&&row.extraActions.every(action=>line(action,260))))return null;
 return data as AiRoadmap;
}
