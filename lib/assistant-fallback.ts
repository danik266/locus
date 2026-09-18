import { roadmapIds } from './roadmap.ts';

type GuideFacts = {
  question: string;
  locale: 'ru' | 'en' | 'kk';
  programId: string;
  programTitle: string;
  university: string;
  year: string;
  schoolQualification: string;
  verified: boolean;
  tuition: { amount: number; currency: string; period: string; year: string } | null;
  english: { ielts: number | null; detail: string } | null;
  englishExam: string;
  deadline: { date: string; intake: string } | null;
  admissionUrl: string;
  programUrl: string;
  completedTaskIds: string[];
};

const stageTitles = {
  ru: ['Проверить путь поступления', 'Укрепить оценки', 'Подтвердить английский', 'Уточнить вступительные условия', 'Рассчитать финансы', 'Собрать документы', 'Подать заявку', 'Следить за решением'],
  en: ['Check eligibility', 'Strengthen academics', 'Confirm English', 'Check entrance requirements', 'Plan finances', 'Prepare documents', 'Submit the application', 'Follow the decision'],
  kk: ['Қабылдау жолын тексеру', 'Бағаларды жақсарту', 'Ағылшын тілін растау', 'Қабылдау талаптарын анықтау', 'Қаржыны жоспарлау', 'Құжаттарды дайындау', 'Өтініш беру', 'Шешімді қадағалау'],
};

export function fallbackAssistant(facts: GuideFacts): string {
  const question = facts.question.toLocaleLowerCase();
  const unverified = !facts.verified;
  const official = facts.admissionUrl;
  const nextIndex = roadmapIds.findIndex(stage => !facts.completedTaskIds.includes(`roadmap-${facts.programId}-${stage}`));
  const nextStage = stageTitles[facts.locale][nextIndex < 0 ? stageTitles.ru.length - 1 : nextIndex];

  if (/стоим|стоит|сколько стоит|бюджет|грант|стипенд|финанс|tuition|cost|budget|scholarship|қаржы|грант|баға/.test(question)) {
    if (facts.locale === 'en') return `${unverified || !facts.tuition ? 'The tuition for this program is not verified yet.' : `The catalog lists ${facts.tuition.amount} ${facts.tuition.currency} per ${facts.tuition.period} for ${facts.tuition.year}.`} Check mandatory fees, living costs and funding directly with ${facts.university}: ${official}`;
    if (facts.locale === 'kk') return `${unverified || !facts.tuition ? 'Бұл бағдарламаның оқу ақысы әлі расталмаған.' : `Каталогта ${facts.tuition.year} үшін ${facts.tuition.amount} ${facts.tuition.currency} / ${facts.tuition.period} көрсетілген.`} Қосымша төлемдер, тұру шығындары мен гранттарды университеттен тексер: ${official}`;
    return `${unverified || !facts.tuition ? 'Стоимость этой программы пока не подтверждена.' : `В каталоге указан тариф ${facts.tuition.amount} ${facts.tuition.currency} за ${facts.tuition.period} (${facts.tuition.year}).`} Отдельно проверь сборы, проживание и условия финансирования на сайте ${facts.university}: ${official}`;
  }

  if (/англ|ielts|toefl|язык|english|language|ағылшын|тіл/.test(question)) {
    if (facts.locale === 'en') return `${unverified || !facts.english ? 'The English requirement has not been verified.' : `The catalog says: ${facts.english.detail}`} Your stated exam: ${facts.englishExam}. Verify accepted tests, section scores and validity with the university: ${official}`;
    if (facts.locale === 'kk') return `${unverified || !facts.english ? 'Ағылшын тіліне қойылатын талап әлі расталмаған.' : `Каталогтағы мәлімет: ${facts.english.detail}`} Сіз көрсеткен емтихан: ${facts.englishExam}. Қабылданатын тест пен әр бөлімнің талабын университет сайтынан тексер: ${official}`;
    return `${unverified || !facts.english ? 'Языковые требования этой программы пока не подтверждены.' : `В каталоге указано: ${facts.english.detail}`} У тебя указан экзамен «${facts.englishExam}». Сверь допустимый тест, баллы по секциям и срок действия результата: ${official}`;
  }

  if (/срок|дедлайн|подач|заявк|deadline|apply|application|мерзім|өтініш/.test(question)) {
    const deadline = facts.verified && facts.deadline?.intake === facts.year ? facts.deadline.date : null;
    if (facts.locale === 'en') return `${deadline ? `The catalog lists ${deadline} for your ${facts.year} intake.` : `The application deadline for the ${facts.year} intake is not confirmed.`} Check the official admissions calendar and time zone before planning submission: ${official}`;
    if (facts.locale === 'kk') return `${deadline ? `Каталогта ${facts.year} қабылдауына ${deadline} көрсетілген.` : `${facts.year} қабылдауына өтініш беру мерзімі расталмаған.`} Ресми күнтізбе мен уақыт белдеуін тексер: ${official}`;
    return `${deadline ? `Для набора ${facts.year} в каталоге указан срок ${deadline}.` : `Срок подачи на набор ${facts.year} пока не подтверждён.`} Перед планированием подачи проверь официальный календарь и часовой пояс: ${official}`;
  }

  if (/документ|аттестат|портфолио|document|diploma|portfolio|құжат|аттестат/.test(question)) {
    if (facts.locale === 'en') return `Your stated qualification is “${facts.schoolQualification}”. First check whether ${facts.university} accepts it for direct entry. Then copy the required document list from the official admissions page; do not treat optional documents as mandatory: ${official}`;
    if (facts.locale === 'kk') return `Сіз көрсеткен құжат: «${facts.schoolQualification}». Алдымен ${facts.university} оны тікелей қабылдай ма, соны тексер. Содан кейін қажетті құжаттар тізімін ресми беттен жазып ал: ${official}`;
    return `У тебя указан документ «${facts.schoolQualification}». Сначала проверь, даёт ли он прямой путь в ${facts.university}. Затем выпиши точный список обязательных документов с официальной страницы: ${official}`;
  }

  if (facts.locale === 'en') return `Your next step for ${facts.programTitle} is “${nextStage}”. Open the official page, write down what is confirmed and what you still need to ask admissions. ${unverified ? 'This program’s admission details have not been verified in our catalog.' : 'Recheck current rules before applying.'} ${facts.programUrl}`;
  if (facts.locale === 'kk') return `${facts.programTitle} бағдарламасы бойынша келесі қадамыңыз — «${nextStage}». Ресми бетті ашып, расталған талаптар мен қабылдау комиссиясына қоятын сұрақтарды жазып алыңыз. ${unverified ? 'Бұл бағдарламаның шарттары каталогта әлі тексерілмеген.' : 'Өтініш берер алдында ережелерді қайта тексеріңіз.'} ${facts.programUrl}`;
  return `Твой следующий шаг для ${facts.programTitle} — «${nextStage}». Открой страницу программы, запиши подтверждённые условия и вопросы для приёмной комиссии. ${unverified ? 'Условия этой программы в каталоге пока не проверены.' : 'Перед подачей ещё раз сверь текущие правила.'} ${facts.programUrl}`;
}
