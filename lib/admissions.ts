export type Profile = { name: string; grade: string; interest: string; country: string; budget: number; english: string; year: string; grades: string };
export type Program = { id: string; title: string; school: string; country: string; interest: string; tuition: number; english: number; duration: number; accent: string };
export const defaults: Profile = { name: '', grade: '11 класс', interest: 'Технологии', country: 'Любая', budget: 12000, english: '6', year: '2027', grades: '4–5' };
export const programs: Program[] = [
 { id: 'cs-de', title: 'Компьютерные науки', school: 'North Campus · демопрограмма', country: 'Германия', interest: 'Технологии', tuition: 3500, english: 6.5, duration: 3, accent: 'plum' },
 { id: 'it-pl', title: 'Разработка цифровых продуктов', school: 'City Institute · демопрограмма', country: 'Польша', interest: 'Технологии', tuition: 4500, english: 6, duration: 3, accent: 'sand' },
 { id: 'ai-nl', title: 'Данные и искусственный интеллект', school: 'West Academy · демопрограмма', country: 'Нидерланды', interest: 'Технологии', tuition: 14000, english: 6.5, duration: 4, accent: 'sage' },
 { id: 'ux-nl', title: 'Дизайн цифрового опыта', school: 'West Academy · демопрограмма', country: 'Нидерланды', interest: 'Дизайн', tuition: 11000, english: 6, duration: 3, accent: 'sand' },
 { id: 'design-pl', title: 'Коммуникационный дизайн', school: 'City Institute · демопрограмма', country: 'Польша', interest: 'Дизайн', tuition: 5000, english: 5.5, duration: 3, accent: 'plum' },
 { id: 'design-de', title: 'Промышленный дизайн', school: 'North Campus · демопрограмма', country: 'Германия', interest: 'Дизайн', tuition: 6000, english: 6, duration: 3, accent: 'sage' },
 { id: 'biz-de', title: 'Бизнес и аналитика', school: 'North Campus · демопрограмма', country: 'Германия', interest: 'Бизнес', tuition: 7000, english: 6.5, duration: 3, accent: 'sage' },
 { id: 'biz-pl', title: 'Международный менеджмент', school: 'City Institute · демопрограмма', country: 'Польша', interest: 'Бизнес', tuition: 4000, english: 6, duration: 3, accent: 'sand' },
 { id: 'biz-nl', title: 'Предпринимательство', school: 'West Academy · демопрограмма', country: 'Нидерланды', interest: 'Бизнес', tuition: 13000, english: 6.5, duration: 4, accent: 'plum' },
];
export function recommend(profile: Profile) {
 return programs.filter(p => p.interest === profile.interest).map(p => {
  const reasons: string[] = [`Направление совпадает с интересом «${profile.interest.toLowerCase()}»`];
  const gaps: string[] = [];
  if(p.tuition <= profile.budget) reasons.push('Стоимость обучения укладывается в бюджет'); else gaps.push(`Бюджет ниже стоимости на ${formatMoney(p.tuition-profile.budget)} в год`);
  if(profile.country === 'Любая' || profile.country === p.country) reasons.push(profile.country === 'Любая' ? 'Страна открыта для рассмотрения' : 'Находится в выбранной стране'); else gaps.push(`Другая страна: ${p.country}`);
  if(Number(profile.english) >= p.english) reasons.push('Указанный уровень английского соответствует демотребованию'); else gaps.push(`Понадобится подготовка к IELTS ${p.english}`);
  return { ...p, reasons, gaps, score: (p.tuition <= profile.budget ? 4 : -4) + (profile.country === p.country ? 6 : profile.country === 'Любая' ? 1 : -3) + (Number(profile.english) >= p.english ? 2 : 0) };
 }).sort((a,b)=>b.score-a.score || a.tuition-b.tuition);
}
export const formatMoney = (value: number) => new Intl.NumberFormat('ru-RU').format(value) + ' €';
export function makeTasks(profile: Profile, program: Program) {
 const tasks = [
  { id: 'verify-'+program.id, title: 'Проверить программу и требования', detail: 'Найди реальную программу на официальном сайте вуза. Уточни стоимость, язык, требования к аттестату и дату подачи: здесь показан демонстрационный вариант.', when: 'Первый шаг', category: 'Выбор' },
 ];
 if(program.tuition > profile.budget) tasks.push({id:'fund-'+program.id,title:'Составить план финансирования',detail:`Разница с твоим бюджетом — ${formatMoney(program.tuition-profile.budget)} в год. Изучи стипендии и отдельно оцени проживание.`,when:'До выбора программы',category:'Финансы'});
 if(Number(profile.english) < program.english) tasks.push({id:'english-'+program.english,title:`Подготовиться к IELTS ${program.english}`,detail:`Текущий ориентир: ${profile.english === '0' ? 'уровень не определён' : profile.english}. Пройди пробный тест и составь график занятий. Требование в демокаталоге нужно подтвердить.`,when:'Начать заранее',category:'Экзамены'});
 tasks.push(
  {id:'docs-'+program.id,title:'Собрать документы',detail:'Составь список: аттестат и оценки, переводы, документ личности. Дополнительные документы уточни у выбранного вуза.',when:`До подачи в ${profile.year}`,category:'Документы'},
  {id:'portfolio-'+profile.interest,title:profile.interest==='Дизайн'?'Подготовить портфолио':'Подготовить проект и мотивацию',detail:profile.interest==='Дизайн'?'Выбери 3–5 работ и опиши процесс. Формат портфолио проверь на странице реальной программы.':`Опиши свой интерес к направлению «${profile.interest}» и один самостоятельный проект. Уточни, требуется ли мотивационное письмо.`,when:'Параллельно с подготовкой',category:'Развитие'},
  {id:'apply-'+program.id+'-'+profile.year,title:'Проверить сроки и отправить заявку',detail:'Запиши официальный дедлайн выбранной программы, проверь комплектность документов и сохрани подтверждение подачи. Сервис не отправляет заявки за тебя.',when:`Набор ${profile.year} · срок уточняется`,category:'Поступление'}
 );
 return tasks;
}
