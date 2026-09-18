import { messages } from './messages.ts';
export const locales = ['en', 'ru', 'kk'] as const;
export type Locale = typeof locales[number];
export const languageNames: Record<Locale, string> = { en: 'English', ru: 'Русский', kk: 'Қазақша' };
export function isLocale(value: unknown): value is Locale { return typeof value === 'string' && locales.includes(value as Locale); }
export function localeFromCookie(value: string | undefined): Locale { return isLocale(value) ? value : 'ru'; }
export function money(value: number, locale: Locale) { return new Intl.NumberFormat(locale === 'kk' ? 'kk-KZ' : locale === 'ru' ? 'ru-RU' : 'en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value); }
export const pageTitles: Record<Locale, string> = { en: 'Continue — your path to university', ru: 'Continue — твой маршрут поступления', kk: 'Continue — университетке апарар жолың' };
export const descriptions: Record<Locale, string> = { en: 'Find programs, compare your options and take the next step with a personal admission plan.', ru: 'Подбери программы, сравни варианты и сделай следующий шаг с личным планом поступления.', kk: 'Бағдарламаларды тауып, нұсқаларды салыстыр және жеке жоспарыңмен келесі қадамды жаса.' };
const dynamic: { re: RegExp; en: string; kk: string; raw?: number[] }[] = [
 {re:/^Английский (A1|A2|B1|B2|C1|C2) — самооценка; нужен официальный экзамен$/,en:'English {0} is self-assessed; an official exam is needed',kk:'Ағылшын тілі {0} — өзіндік бағалау; ресми емтихан қажет',raw:[0]},
 {re:/^Твоя самооценка английского: (Не знаю|A1|A2|B1|B2|C1|C2)\. Пройди пробный тест, составь план подготовки и проверь требование на сайте вуза\.$/,en:'Your self-assessed English level: {0}. Take a practice test, make a study plan and check the university requirement.',kk:'Ағылшын деңгейіңді өзің {0} деп бағаладың. Сынақ тестін тапсырып, дайындық жоспарын құр және университет талабын тексер.'},
 {re:/^Твой английский: (A1|A2|B1|B2|C1|C2) \(самооценка\)\. Подтверди его экзаменом\.$/,en:'Your English: {0} (self-assessed). Confirm it with an exam.',kk:'Ағылшын деңгейің: {0} (өзіндік бағалау). Оны емтиханмен раста.',raw:[0]},
 {re:/^IELTS ([\d.]+) · экзамен не сдан$/,en:'IELTS {0} · exam not taken',kk:'IELTS {0} · емтихан тапсырылмаған',raw:[0]},
 {re:/^IELTS ([\d.]+) · проверить TOEFL$/,en:'IELTS {0} · check TOEFL',kk:'IELTS {0} · TOEFL талабын тексер',raw:[0]},
 {re:/^(.+) · (академический трек|прикладной трек|международный трек)$/,en:'{0} · {1}',kk:'{0} · {1}'},
 {re:/^(.+), вот$/,en:'{0}, here’s',kk:'{0}, міне,',raw:[0]},
 {re:/^Убрать (.+) из сравнения$/,en:'Remove {0} from comparison',kk:'{0} бағдарламасын салыстырудан алып тастау'},
 {re:/^Выше на (.+)$/,en:'Over by {0}',kk:'{0} артық'},
 {re:/^IELTS ([\d.]+) · нужна подготовка$/,en:'IELTS {0} · preparation needed',kk:'IELTS {0} · дайындық қажет'},
 {re:/^(\d+) года$/,en:'{0} years',kk:'{0} жыл'},
 {re:/^Направление совпадает с интересом «(.+)»$/,en:'Matches your interest in {0}',kk:'«{0}» қызығушылығыңа сәйкес келеді'},
 {re:/^Бюджет ниже стоимости на (.+) в год$/,en:'Tuition exceeds your budget by {0} per year',kk:'Оқу ақысы бюджетіңнен жылына {0} артық'},
 {re:/^Другая страна: (.+)$/,en:'Different country: {0}',kk:'Басқа ел: {0}'},
 {re:/^Понадобится подготовка к IELTS ([\d.]+)$/,en:'Preparation for IELTS {0} is needed',kk:'IELTS {0} деңгейіне дайындық қажет'},
 {re:/^Разница с твоим бюджетом — (.+) в год\. Изучи стипендии и отдельно оцени проживание\.$/,en:'The gap is {0} per year. Explore scholarships and estimate living costs separately.',kk:'Бюджетіңмен айырмасы — жылына {0}. Стипендияларды зерттеп, тұру шығынын бөлек есепте.'},
 {re:/^Подготовиться к IELTS ([\d.]+)$/,en:'Prepare for IELTS {0}',kk:'IELTS {0} емтиханына дайындалу'},
 {re:/^Текущий ориентир: (.+)\. Пройди пробный тест и составь график занятий\. Требование в демокаталоге нужно подтвердить\.$/,en:'Your current estimate: {0}. Take a practice test and make a study schedule. Verify the requirement shown in the demo catalog.',kk:'Қазіргі деңгейің: {0}. Сынақ тестін тапсырып, оқу кестесін жаса. Демокаталогтағы талапты растау қажет.'},
 {re:/^До подачи в (\d+)$/,en:'Before applying in {0}',kk:'{0} жылы өтініш бергенге дейін'},
 {re:/^Опиши свой интерес к направлению «(.+)» и один самостоятельный проект\. Уточни, требуется ли мотивационное письмо\.$/,en:'Describe your interest in {0} and one independent project. Check whether a motivation letter is required.',kk:'«{0}» бағытына қызығушылығыңды және бір жеке жобаңызды сипатта. Уәждемелік хат қажет пе, нақтыла.'},
 {re:/^Набор (\d+) · срок уточняется$/,en:'{0} intake · deadline to confirm',kk:'{0} жылғы қабылдау · мерзімі нақтыланады'},
];
export function translateText(source: string, locale: Locale): string {
 const key = source.trim();
 if(!key) return source;
 // Currency is formatted at the presentation boundary; source data stays stable.
 const amount = key.match(/^([\d\s\u00a0\u202f]+) €$/);
 if(amount) return source.replace(key,money(Number(amount[1].replace(/\s/g,'')),locale));
 const normalized = key === 'далее' ? 'Continue' : key.replace('«Далее»', 'Continue').replace('Далее —', 'Continue —');
 if(locale === 'ru') return source.replace(key, normalized);
 const direct = messages[key];
 if(direct) return source.replace(key,direct[locale==='en'?0:1]);
 if(key === key.toLowerCase() && messages[key[0].toUpperCase()+key.slice(1)]) return translateText(key[0].toUpperCase()+key.slice(1),locale).toLowerCase();
 for(const template of dynamic){
  const match=template.re.exec(key);
  if(!match) continue;
  const result=template[locale].replace(/\{(\d+)\}/g,(_,index:string)=>template.raw?.includes(Number(index))?match[Number(index)+1]:translateText(match[Number(index)+1],locale));
  return source.replace(key,()=>result);
 }
 return source;
}
