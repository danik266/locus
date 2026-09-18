import mongoose from 'mongoose';

const UniversitySchema = new mongoose.Schema({
  name: String, country: String, city: String, website: String,
  logoUrl: String, rankQS: Number, rankTHE: Number,
  type: { type: String, enum: ['public','private'], default: 'public' },
}, { timestamps: true });

const ProgramSchema = new mongoose.Schema({
  universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
  legacyId: String,
  title: String, degree: { type: String, default: 'bachelor' },
  field: String, subfield: String,
  language: { type: String, default: 'English' },
  durationYears: Number,
  tuition: mongoose.Schema.Types.Mixed,
  english: mongoose.Schema.Types.Mixed,
  deadline: mongoose.Schema.Types.Mixed,
  admissionNote: String, scholarshipNote: String, specialRequirement: String,
  programUrl: String, admissionUrl: String, costUrl: String,
  checkedOn: String, isActive: { type: Boolean, default: true },
  accent: { type: String, default: 'plum' }, coverImage: String,
}, { timestamps: true });

const University = mongoose.models.University || mongoose.model('University', UniversitySchema);
const Program = mongoose.models.Program || mongoose.model('Program', ProgramSchema);

type ProgramField = string;
type Currency = string;
type Degree = string;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/locus';

// Extended database of universities
const rawUniversities = [
  // Existing
  { name: 'Constructor University', country: 'Германия', city: 'Бремен', website: 'https://constructor.university', type: 'private', rankQS: 450 },
  { name: 'Rhine-Waal University of Applied Sciences', country: 'Германия', city: 'Клеве', website: 'https://www.hochschule-rhein-waal.de', type: 'public' },
  { name: 'Technical University of Munich (TUM)', country: 'Германия', city: 'Мюнхен', website: 'https://www.tum.de', type: 'public', rankQS: 28 },
  { name: 'Heidelberg University', country: 'Германия', city: 'Гейдельберг', website: 'https://www.uni-heidelberg.de', type: 'public', rankQS: 84 },
  { name: 'LMU Munich', country: 'Германия', city: 'Мюнхен', website: 'https://www.lmu.de', type: 'public', rankQS: 59 },
  { name: 'Berlin University of the Arts (UdK)', country: 'Германия', city: 'Берлин', website: 'https://www.udk-berlin.de', type: 'public' },

  // Netherlands
  { name: 'University of Twente', country: 'Нидерланды', city: 'Энсхеде', website: 'https://www.utwente.nl', type: 'public', rankQS: 210 },
  { name: 'Delft University of Technology (TU Delft)', country: 'Нидерланды', city: 'Делфт', website: 'https://www.tudelft.nl', type: 'public', rankQS: 49 },
  { name: 'University of Amsterdam (UvA)', country: 'Нидерланды', city: 'Амстердам', website: 'https://www.uva.nl', type: 'public', rankQS: 53 },
  { name: 'Leiden University', country: 'Нидерланды', city: 'Лейден', website: 'https://www.universiteitleiden.nl', type: 'public', rankQS: 141 },
  { name: 'Wageningen University & Research', country: 'Нидерланды', city: 'Вагенинген', website: 'https://www.wur.nl', type: 'public', rankQS: 151 },
  { name: 'Erasmus University Rotterdam', country: 'Нидерланды', city: 'Роттердам', website: 'https://www.eur.nl', type: 'public', rankQS: 176 },

  // Poland
  { name: 'Warsaw University of Technology', country: 'Польша', city: 'Варшава', website: 'https://www.pw.edu.pl', type: 'public', rankQS: 571 },
  { name: 'Kozminski University', country: 'Польша', city: 'Варшава', website: 'https://www.kozminski.edu.pl', type: 'private' },
  { name: 'Polish-Japanese Academy of Information Technology', country: 'Польша', city: 'Варшава', website: 'https://www.pja.edu.pl', type: 'private' },
  { name: 'University of Warsaw', country: 'Польша', city: 'Варшава', website: 'https://en.uw.edu.pl', type: 'public', rankQS: 258 },
  { name: 'Jagiellonian University', country: 'Польша', city: 'Краков', website: 'https://en.uj.edu.pl', type: 'public', rankQS: 312 },

  // Italy
  { name: 'University of Pavia', country: 'Италия', city: 'Павия', website: 'https://web.unipv.it', type: 'public', rankQS: 540 },
  { name: 'Bocconi University', country: 'Италия', city: 'Милан', website: 'https://www.unibocconi.it', type: 'private', rankQS: 110 },
  { name: 'NABA (Nuova Accademia di Belle Arti)', country: 'Италия', city: 'Милан', website: 'https://www.naba.it', type: 'private' },
  { name: 'Politecnico di Milano', country: 'Италия', city: 'Милан', website: 'https://www.polimi.it', type: 'public', rankQS: 111 },
  { name: 'University of Bologna', country: 'Италия', city: 'Болонья', website: 'https://www.unibo.it', type: 'public', rankQS: 133 },
  { name: 'Sapienza University of Rome', country: 'Италия', city: 'Рим', website: 'https://www.uniroma1.it', type: 'public', rankQS: 132 },

  // UK
  { name: 'University of Oxford', country: 'Великобритания', city: 'Оксфорд', website: 'https://www.ox.ac.uk', type: 'public', rankQS: 3 },
  { name: 'University of Cambridge', country: 'Великобритания', city: 'Кембридж', website: 'https://www.cam.ac.uk', type: 'public', rankQS: 5 },
  { name: 'Imperial College London', country: 'Великобритания', city: 'Лондон', website: 'https://www.imperial.ac.uk', type: 'public', rankQS: 2 },
  { name: 'University College London (UCL)', country: 'Великобритания', city: 'Лондон', website: 'https://www.ucl.ac.uk', type: 'public', rankQS: 9 },
  { name: 'London School of Economics (LSE)', country: 'Великобритания', city: 'Лондон', website: 'https://www.lse.ac.uk', type: 'public', rankQS: 50 },
  { name: 'University of Edinburgh', country: 'Великобритания', city: 'Эдинбург', website: 'https://www.ed.ac.uk', type: 'public', rankQS: 27 },

  // USA
  { name: 'Arizona State University', country: 'США', city: 'Темпе', website: 'https://www.asu.edu', type: 'public', rankQS: 200 },
  { name: 'Babson College', country: 'США', city: 'Уэллсли', website: 'https://www.babson.edu', type: 'private' },
  { name: 'Parsons School of Design', country: 'США', city: 'Нью-Йорк', website: 'https://www.newschool.edu/parsons', type: 'private' },
  { name: 'Boston University', country: 'США', city: 'Бостон', website: 'https://www.bu.edu', type: 'private', rankQS: 108 },
  { name: 'University of California, Berkeley', country: 'США', city: 'Беркли', website: 'https://www.berkeley.edu', type: 'public', rankQS: 12 },
  { name: 'New York University (NYU)', country: 'США', city: 'Нью-Йорк', website: 'https://www.nyu.edu', type: 'private', rankQS: 43 },

  // South Korea
  { name: 'SUNY Korea / Stony Brook University', country: 'Южная Корея', city: 'Инчхон', website: 'https://www.sunykorea.ac.kr', type: 'private' },
  { name: 'Yonsei University, Underwood International College', country: 'Южная Корея', city: 'Сеул / Сондо', website: 'https://uic.yonsei.ac.kr', type: 'private', rankQS: 56 },
  { name: 'KAIST', country: 'Южная Корея', city: 'Тэджон', website: 'https://www.kaist.ac.kr', type: 'public', rankQS: 53 },
  { name: 'Korea University', country: 'Южная Корея', city: 'Сеул', website: 'https://www.korea.edu', type: 'private', rankQS: 67 },

  // Kazakhstan
  { name: 'Nazarbayev University', country: 'Казахстан', city: 'Астана', website: 'https://nu.edu.kz', type: 'public', rankQS: 505 },
  { name: 'SDU University', country: 'Казахстан', city: 'Каскелен / Алматы', website: 'https://sdu.edu.kz', type: 'private' },
  { name: 'KIMEP University', country: 'Казахстан', city: 'Алматы', website: 'https://www.kimep.kz', type: 'private' },
  { name: 'Astana IT University', country: 'Казахстан', city: 'Астана', website: 'https://astanait.edu.kz', type: 'private' },
  { name: 'Narxoz University', country: 'Казахстан', city: 'Алматы', website: 'https://narxoz.edu.kz', type: 'private' },

  // France & Czechia & Canada
  { name: 'Sciences Po', country: 'Франция', city: 'Париж', website: 'https://www.sciencespo.fr', type: 'public', rankQS: 319 },
  { name: 'École Polytechnique', country: 'Франция', city: 'Палезо', website: 'https://www.polytechnique.edu', type: 'public', rankQS: 46 },
  { name: 'Charles University', country: 'Чехия', city: 'Прага', website: 'https://cuni.cz', type: 'public', rankQS: 248 },
  { name: 'Czech Technical University in Prague (CTU)', country: 'Чехия', city: 'Прага', website: 'https://www.cvut.cz', type: 'public', rankQS: 403 },
  { name: 'University of Toronto', country: 'Канада', city: 'Торонто', website: 'https://www.utoronto.ca', type: 'public', rankQS: 25 },
  { name: 'University of British Columbia (UBC)', country: 'Канада', city: 'Ванкувер', website: 'https://www.ubc.ca', type: 'public', rankQS: 38 },
];

type ProgramSeed = {
  uniName: string;
  title: string;
  field: ProgramField;
  subfield: string;
  language: string;
  degree: Degree;
  durationYears: number;
  tuition: {
    amount: number;
    currency: Currency;
    period: 'year' | 'semester' | 'month' | 'credit';
    year: string;
    source: string;
    note?: string;
    annualRange?: { min: number; max: number; credits: number };
  } | null;
  english: {
    ielts: number | null;
    toefl: number | null;
    detail: string;
    source: string;
  };
  deadline: {
    date: string;
    label: string;
    intake: string;
    source: string;
  } | null;
  admissionNote: string;
  scholarshipNote: string;
  specialRequirement?: string;
  programUrl: string;
  admissionUrl: string;
  costUrl?: string;
  checkedOn: string;
  accent: 'plum' | 'sand' | 'sage';
};

const expandedPrograms: ProgramSeed[] = [
  // ================= 1. ТЕХНОЛОГИИ =================
  {
    uniName: 'Technical University of Munich (TUM)',
    title: 'Informatics (B.Sc.)',
    field: 'Технологии',
    subfield: 'Computer Science, Software Engineering',
    language: 'English',
    degree: 'bachelor',
    durationYears: 3,
    tuition: { amount: 6000, currency: 'EUR', period: 'year', year: '2025/2026', source: 'tum.de/fees' },
    english: { ielts: 6.5, toefl: 88, detail: 'IELTS 6.5 или TOEFL 88', source: 'tum.de' },
    deadline: { date: '15.07.2026', label: 'Winter Intake', intake: 'Winter 2026', source: 'tum.de' },
    admissionNote: 'Высокие оценки по математике и информатике. Проводится Aptitude Assessment Test.',
    scholarshipNote: 'Доступны стипендии DAAD и частичное освобождение от семестровых сборов.',
    programUrl: 'https://www.cit.tum.de/en/cit/studies/degree-programs/bachelor-informatics/',
    admissionUrl: 'https://www.tum.de/en/studies/application/',
    checkedOn: '18.09.2026',
    accent: 'plum'
  },
  {
    uniName: 'Delft University of Technology (TU Delft)',
    title: 'Computer Science and Engineering (BSc)',
    field: 'Технологии',
    subfield: 'Software, Systems & Algorithms',
    language: 'English',
    degree: 'bachelor',
    durationYears: 3,
    tuition: { amount: 16705, currency: 'EUR', period: 'year', year: '2025/2026', source: 'tudelft.nl' },
    english: { ielts: 7.0, toefl: 100, detail: 'IELTS 7.0 (минимум 6.5 по секциям)', source: 'tudelft.nl' },
    deadline: { date: '15.01.2026', label: 'Numerus Fixus', intake: 'Fall 2026', source: 'tudelft.nl' },
    admissionNote: 'Программа Numerus Fixus (квота 550 мест). Когнитивный тест по математике и логике в феврале.',
    scholarshipNote: 'Excellence scholarships для бакалавров ограничены; рекомендуются гранты фондов.',
    programUrl: 'https://www.tudelft.nl/en/education/programmes/bachelors/cse/bachelor-of-computer-science-and-engineering',
    admissionUrl: 'https://www.tudelft.nl/en/education/admission-and-application/',
    checkedOn: '18.09.2026',
    accent: 'plum'
  },
  {
    uniName: 'KAIST',
    title: 'School of Computing (B.S.)',
    field: 'Технологии',
    subfield: 'Artificial Intelligence, Cybersecurity',
    language: 'English',
    degree: 'bachelor',
    durationYears: 4,
    tuition: { amount: 0, currency: 'KRW', period: 'year', year: '2026', source: 'kaist.ac.kr', note: '100% покрытие при удержании GPA' },
    english: { ielts: 6.5, toefl: 83, detail: 'IELTS 6.5 или TOEFL iBT 83', source: 'admission.kaist.ac.kr' },
    deadline: { date: '20.10.2025', label: 'Early Track', intake: 'Fall 2026', source: 'kaist.ac.kr' },
    admissionNote: 'Обучение на английском. Требуются отличные оценки по STEM предметам и рекомендации.',
    scholarshipNote: 'Все принятые иностранные студенты получают стипендию KAIST Scholarship (100% обучение + ежемесячная стипендия).',
    programUrl: 'https://cs.kaist.ac.kr',
    admissionUrl: 'https://admission.kaist.ac.kr/intl-undergraduate/',
    checkedOn: '18.09.2026',
    accent: 'sage'
  },

  // ================= 2. ДИЗАЙН =================
  {
    uniName: 'Politecnico di Milano',
    title: 'Interaction Design & Product Design (Laurea)',
    field: 'Дизайн',
    subfield: 'Product & UX Design',
    language: 'English',
    degree: 'bachelor',
    durationYears: 3,
    tuition: { amount: 3900, currency: 'EUR', period: 'year', year: '2025/2026', source: 'polimi.it' },
    english: { ielts: 6.0, toefl: 78, detail: 'IELTS 6.0 или TOLD test', source: 'polimi.it' },
    deadline: { date: '30.04.2026', label: 'International Call', intake: 'Fall 2026', source: 'polimi.it' },
    admissionNote: 'Вступительный экзамен TOLD (Test Online di Design) на логику, геометрию и культуру дизайна.',
    scholarshipNote: 'Стипендии DSU Regione Lombardia покрывают обучение и дают до 7000 € в год на проживание.',
    programUrl: 'https://www.design.polimi.it/en',
    admissionUrl: 'https://www.polimi.it/en/international-prospective-students',
    checkedOn: '18.09.2026',
    accent: 'sand'
  },
  {
    uniName: 'Berlin University of the Arts (UdK)',
    title: 'Visual Communication (B.A.)',
    field: 'Дизайн',
    subfield: 'Graphic, Editorial & Digital Media',
    language: 'English',
    degree: 'bachelor',
    durationYears: 4,
    tuition: { amount: 0, currency: 'EUR', period: 'year', year: '2026', source: 'udk-berlin.de', note: 'Семестровый сбор ≈ 350 €' },
    english: { ielts: 6.5, toefl: 85, detail: 'Английский B2/C1 + базовый немецкий приветствуется', source: 'udk-berlin.de' },
    deadline: { date: '15.03.2026', label: 'Portfolio Submission', intake: 'Winter 2026', source: 'udk-berlin.de' },
    admissionNote: 'Один из старейших арт-вузов Европы. Главный критерий — авторское портфолио (Mappe) из 20 работ.',
    scholarshipNote: 'Обучение бесплатное. Оплачивается только семестровый проездной билет.',
    programUrl: 'https://www.udk-berlin.de/en/courses/visual-communication/',
    admissionUrl: 'https://www.udk-berlin.de/en/studies/application/',
    checkedOn: '18.09.2026',
    accent: 'plum'
  },

  // ================= 3. БИЗНЕС =================
  {
    uniName: 'Erasmus University Rotterdam',
    title: 'International Business Administration (BSc IBA)',
    field: 'Бизнес',
    subfield: 'Strategy, Finance, International Management',
    language: 'English',
    degree: 'bachelor',
    durationYears: 3,
    tuition: { amount: 12500, currency: 'EUR', period: 'year', year: '2025/2026', source: 'rsm.nl' },
    english: { ielts: 7.0, toefl: 95, detail: 'IELTS 7.0 (секторы не ниже 6.5)', source: 'rsm.nl' },
    deadline: { date: '15.01.2026', label: 'Numerus Fixus', intake: 'Fall 2026', source: 'rsm.nl' },
    admissionNote: 'Входит в топ-10 бизнес-школ Европы (Rotterdam School of Management). Отбор по мотивационному письму и GPA.',
    scholarshipNote: 'Holland Scholarship (до 5000 €) в первый год для выдающихся студентов.',
    programUrl: 'https://www.rsm.nl/bachelor/international-business-administration/',
    admissionUrl: 'https://www.rsm.nl/bachelor/admission/',
    checkedOn: '18.09.2026',
    accent: 'sand'
  },
  {
    uniName: 'London School of Economics (LSE)',
    title: 'BSc Management',
    field: 'Бизнес',
    subfield: 'Organizational Leadership, Markets & Strategy',
    language: 'English',
    degree: 'bachelor',
    durationYears: 3,
    tuition: { amount: 28176, currency: 'GBP', period: 'year', year: '2025/2026', source: 'lse.ac.uk' },
    english: { ielts: 7.0, toefl: 100, detail: 'IELTS 7.0 (7.0 по всем компонентам)', source: 'lse.ac.uk' },
    deadline: { date: '29.01.2026', label: 'UCAS Deadline', intake: 'Fall 2026', source: 'ucas.com' },
    admissionNote: 'Подача строго через UCAS. Требуется сильный академический профайл по математике (A*AA / GPA 4.8+).',
    scholarshipNote: 'LSE Undergraduate Support Scheme предоставляет стипендии до полной стоимости обучения.',
    programUrl: 'https://www.lse.ac.uk/study-at-lse/Undergraduate/degree-programmes-2025/BSc-Management',
    admissionUrl: 'https://www.lse.ac.uk/study-at-lse/Undergraduate/Prospective-Students/How-to-Apply',
    checkedOn: '18.09.2026',
    accent: 'plum'
  },
  {
    uniName: 'KIMEP University',
    title: 'Bachelor of Finance & Accounting (BFA)',
    field: 'Бизнес',
    subfield: 'Corporate Finance, Banking, Audit',
    language: 'English',
    degree: 'bachelor',
    durationYears: 4,
    tuition: { amount: 3200000, currency: 'KZT', period: 'year', year: '2025/2026', source: 'kimep.kz' },
    english: { ielts: 5.5, toefl: 70, detail: 'IELTS 5.5 или внутренний KIMEP English Test', source: 'kimep.kz' },
    deadline: { date: '15.07.2026', label: 'Main Intake', intake: 'Fall 2026', source: 'kimep.kz' },
    admissionNote: 'Старейший англоязычный бизнес-вуз Центральной Азии. Международная аккредитация FIBAA.',
    scholarshipNote: 'Государственные гранты РК, академические скидки от 25% до 100% за победы в олимпиадах и высокий ЕНТ/GPA.',
    programUrl: 'https://kimep.kz/bang-college-of-business/',
    admissionUrl: 'https://kimep.kz/prospective-students/',
    checkedOn: '18.09.2026',
    accent: 'sage'
  },

  // ================= 4. ИНЖЕНЕРИЯ =================
  {
    uniName: 'University of Cambridge',
    title: 'Engineering (BA Hons / MEng)',
    field: 'Инженерия',
    subfield: 'Mechanical, Electrical, Aerospace & Civil',
    language: 'English',
    degree: 'bachelor',
    durationYears: 4,
    tuition: { amount: 39162, currency: 'GBP', period: 'year', year: '2025/2026', source: 'cam.ac.uk' },
    english: { ielts: 7.5, toefl: 110, detail: 'IELTS 7.5 (не ниже 7.0 по секциям)', source: 'cam.ac.uk' },
    deadline: { date: '15.10.2025', label: 'Early UCAS', intake: 'Fall 2026', source: 'ucas.com' },
    admissionNote: 'Письменный экзамен ESAT (Engineering and Science Admissions Test) + академическое интервью.',
    scholarshipNote: 'Cambridge Trust Scholarships и международные стипендии колледжей.',
    programUrl: 'https://www.undergraduate.study.cam.ac.uk/courses/engineering',
    admissionUrl: 'https://www.undergraduate.study.cam.ac.uk/apply',
    checkedOn: '18.09.2026',
    accent: 'plum'
  },
  {
    uniName: 'Nazarbayev University',
    title: 'Mechanical and Aerospace Engineering (BEng)',
    field: 'Инженерия',
    subfield: 'Robotics, Thermofluids, Aerodynamics',
    language: 'English',
    degree: 'bachelor',
    durationYears: 4,
    tuition: { amount: 0, currency: 'KZT', period: 'year', year: '2026', source: 'nu.edu.kz', note: '100% государственный грант РК' },
    english: { ielts: 6.5, toefl: 85, detail: 'IELTS 6.5 (секторы 6.0) + SAT 1240+ рекомендуется', source: 'nu.edu.kz' },
    deadline: { date: '31.03.2026', label: 'Standard Deadline', intake: 'Fall 2026', source: 'nu.edu.kz' },
    admissionNote: 'Обучение на английском. Лаборатории мирового уровня, аккредитация ABET.',
    scholarshipNote: 'Все граждане РК обучаются на полном государственном гранте + получают ежемесячную стипендию.',
    programUrl: 'https://seds.nu.edu.kz/programs/undergraduate/beng-mae',
    admissionUrl: 'https://admissions.nu.edu.kz',
    checkedOn: '18.09.2026',
    accent: 'sand'
  },

  // ================= 5. МЕДИЦИНА И ЗДОРОВЬЕ =================
  {
    uniName: 'University of Pavia',
    title: 'Medicine and Surgery (Harvey Course, Single Cycle)',
    field: 'Медицина и здоровье',
    subfield: 'Clinical Medicine, Biomedical Sciences',
    language: 'English',
    degree: 'bachelor',
    durationYears: 6,
    tuition: { amount: 3500, currency: 'EUR', period: 'year', year: '2025/2026', source: 'unipv.it' },
    english: { ielts: 6.5, toefl: 88, detail: 'IELTS 6.5 или результат IMAT', source: 'unipv.it' },
    deadline: { date: '15.07.2026', label: 'IMAT Registration', intake: 'Fall 2026', source: 'universitaly.it' },
    admissionNote: 'Государственная программа на английском. Зачисление строго по результатам единого экзамена IMAT.',
    scholarshipNote: 'Стипендия EDiSU Pavia: бесплатное обучение + общежитие + питание для студентов с невысоким семейным доходом.',
    programUrl: 'https://web.unipv.it/internazionale/single-cycle-degrees-6-years-in-english/medicine-and-surgery-harvey-course/',
    admissionUrl: 'https://www.universitaly.it',
    checkedOn: '18.09.2026',
    accent: 'sage'
  },
  {
    uniName: 'Charles University',
    title: 'General Medicine (M.D.)',
    field: 'Медицина и здоровье',
    subfield: 'Human Biology, Clinical Anatomy, Pathology',
    language: 'English',
    degree: 'bachelor',
    durationYears: 6,
    tuition: { amount: 15000, currency: 'EUR', period: 'year', year: '2025/2026', source: 'lf1.cuni.cz' },
    english: { ielts: 6.5, toefl: 85, detail: 'IELTS 6.5 или подтверждение языка на интервью', source: 'cuni.cz' },
    deadline: { date: '30.04.2026', label: 'Entrance Exam', intake: 'Fall 2026', source: 'lf1.cuni.cz' },
    admissionNote: 'Первый медицинский факультет (основан в 1348 г.). Вступительный экзамен по химии, биологии и физике на английском.',
    scholarshipNote: 'Стипендии за отличную успеваемость со 2-го курса до 2500 € в год.',
    programUrl: 'https://en.lf1.cuni.cz/general-medicine',
    admissionUrl: 'https://en.lf1.cuni.cz/how-to-apply',
    checkedOn: '18.09.2026',
    accent: 'plum'
  },

  // ================= 6. ПРАВО =================
  {
    uniName: 'Leiden University',
    title: 'International and European Law (LLB)',
    field: 'Право',
    subfield: 'Public International Law, EU Constitutional Law',
    language: 'English',
    degree: 'bachelor',
    durationYears: 3,
    tuition: { amount: 13500, currency: 'EUR', period: 'year', year: '2025/2026', source: 'universiteitleiden.nl' },
    english: { ielts: 7.0, toefl: 100, detail: 'IELTS 7.0 (не менее 6.5 по секциям)', source: 'universiteitleiden.nl' },
    deadline: { date: '01.04.2026', label: 'Non-EU Deadline', intake: 'Fall 2026', source: 'universiteitleiden.nl' },
    admissionNote: 'Кампус в Гааге — юридической столице мира (Международный суд ООН). Анализ мотивации и эссе.',
    scholarshipNote: 'Leiden University Excellence Scholarship (LexS) для выдающихся абитуриентов.',
    programUrl: 'https://www.universiteitleiden.nl/en/education/study-programmes/bachelor/international-and-european-law',
    admissionUrl: 'https://www.universiteitleiden.nl/en/education/admission-and-application',
    checkedOn: '18.09.2026',
    accent: 'sand'
  },
  {
    uniName: 'University of Bologna',
    title: 'European Studies and Global Law (Laurea)',
    field: 'Право',
    subfield: 'Comparative Law, Human Rights & Global Governance',
    language: 'English',
    degree: 'bachelor',
    durationYears: 3,
    tuition: { amount: 2600, currency: 'EUR', period: 'year', year: '2025/2026', source: 'unibo.it' },
    english: { ielts: 6.0, toefl: 80, detail: 'IELTS 6.0 или эквивалент B2', source: 'unibo.it' },
    deadline: { date: '10.05.2026', label: 'Intake Call', intake: 'Fall 2026', source: 'unibo.it' },
    admissionNote: 'Старейший университет мира (1088 г.). Тест TOLC-E или SAT для ранжирования кандидатов.',
    scholarshipNote: 'Гранты ER.GO (Emilia-Romagna): бесплатное обучение и стипендия до 6500 € по уровню дохода семьи.',
    programUrl: 'https://corsi.unibo.it/1cycle/european-studies',
    admissionUrl: 'https://www.unibo.it/en/admissions',
    checkedOn: '18.09.2026',
    accent: 'sage'
  },

  // ================= 7. АРХИТЕКТУРА =================
  {
    uniName: 'University College London (UCL)',
    title: 'Architecture BSc (The Bartlett)',
    field: 'Архитектура',
    subfield: 'Spatial Design, Urban Theory, Sustainable Architecture',
    language: 'English',
    degree: 'bachelor',
    durationYears: 3,
    tuition: { amount: 34400, currency: 'GBP', period: 'year', year: '2025/2026', source: 'ucl.ac.uk' },
    english: { ielts: 7.0, toefl: 100, detail: 'IELTS 7.0 (минимум 6.5 по секциям)', source: 'ucl.ac.uk' },
    deadline: { date: '29.01.2026', label: 'UCAS Deadline', intake: 'Fall 2026', source: 'ucas.com' },
    admissionNote: 'The Bartlett признан архитектурной школой #1 в мире по рейтингу QS. Обязательны портфолио и творческое задание.',
    scholarshipNote: 'UCL Global Undergraduate Scholarship (до полного покрытия расходов на обучение и жизнь).',
    programUrl: 'https://www.ucl.ac.uk/bartlett/architecture/programmes/undergraduate/architecture-bsc',
    admissionUrl: 'https://www.ucl.ac.uk/prospective-students/undergraduate/applying-ucl',
    checkedOn: '18.09.2026',
    accent: 'plum'
  },
  {
    uniName: 'Czech Technical University in Prague (CTU)',
    title: 'Architecture and Urbanism (BSc)',
    field: 'Архитектура',
    subfield: 'Architectural Design, Building Technology',
    language: 'English',
    degree: 'bachelor',
    durationYears: 4,
    tuition: { amount: 5500, currency: 'EUR', period: 'year', year: '2025/2026', source: 'cvut.cz' },
    english: { ielts: 6.0, toefl: 78, detail: 'IELTS 6.0 или B2 Certificate', source: 'fa.cvut.cz' },
    deadline: { date: '31.03.2026', label: 'Portfolio Review', intake: 'Fall 2026', source: 'fa.cvut.cz' },
    admissionNote: 'Преподавание на английском. Оценка портфолио из графических и натурных рисунков + собеседование.',
    scholarshipNote: 'Стипендии Вышеградского фонда (Visegrad Fund) и скидки за академические успехи.',
    programUrl: 'https://www.fa.cvut.cz/en/study/programmes/architecture-and-urbanism',
    admissionUrl: 'https://www.fa.cvut.cz/en/study/admissions',
    checkedOn: '18.09.2026',
    accent: 'sand'
  },

  // ================= 8. ПСИХОЛОГИЯ =================
  {
    uniName: 'University of Amsterdam (UvA)',
    title: 'Psychology (BSc)',
    field: 'Психология',
    subfield: 'Cognitive Science, Clinical & Developmental Psychology',
    language: 'English',
    degree: 'bachelor',
    durationYears: 3,
    tuition: { amount: 13400, currency: 'EUR', period: 'year', year: '2025/2026', source: 'uva.nl' },
    english: { ielts: 6.5, toefl: 92, detail: 'IELTS 6.5 (минимум 6.0 по навыкам)', source: 'uva.nl' },
    deadline: { date: '15.01.2026', label: 'Numerus Fixus', intake: 'Fall 2026', source: 'uva.nl' },
    admissionNote: 'Топ-15 факультетов психологии в мире (QS). Программа Numerus Fixus с онлайн-тестом по статистике и биологии.',
    scholarshipNote: 'Amsterdam Merit Scholarship для студентов с выдающимися академическими результатами.',
    programUrl: 'https://www.uva.nl/en/programmes/bachelors/psychology/psychology.html',
    admissionUrl: 'https://www.uva.nl/en/programmes/bachelors/psychology/application-and-admission/application-and-admission.html',
    checkedOn: '18.09.2026',
    accent: 'sage'
  },
  {
    uniName: 'University of Warsaw',
    title: 'Cognitive Science (BA)',
    field: 'Психология',
    subfield: 'Neuroscience, Artificial Intelligence, Philosophy of Mind',
    language: 'English',
    degree: 'bachelor',
    durationYears: 3,
    tuition: { amount: 2800, currency: 'EUR', period: 'year', year: '2025/2026', source: 'uw.edu.pl' },
    english: { ielts: 6.5, toefl: 87, detail: 'IELTS 6.5 или эквивалент B2+', source: 'uw.edu.pl' },
    deadline: { date: '05.07.2026', label: 'IRK Registration', intake: 'Fall 2026', source: 'irk.uw.edu.pl' },
    admissionNote: 'Междисциплинарная программа на стыке психологии, нейронаук и IT. Прием по оценкам аттестата (математика, биология, английский).',
    scholarshipNote: 'Стипендии ректора Варшавского университета за успеваемость со второго семестра.',
    programUrl: 'https://en.uw.edu.pl/education/study-at-uw/degree-programmes/cognitive-science-ba/',
    admissionUrl: 'https://irk.uw.edu.pl',
    checkedOn: '18.09.2026',
    accent: 'plum'
  },

  // ================= 9. ЕСТЕСТВЕННЫЕ НАУКИ =================
  {
    uniName: 'École Polytechnique',
    title: 'Bachelor of Science (Double Major: Math & Physics)',
    field: 'Естественные науки',
    subfield: 'Applied Mathematics, Quantum Physics, Data Modeling',
    language: 'English',
    degree: 'bachelor',
    durationYears: 3,
    tuition: { amount: 16500, currency: 'EUR', period: 'year', year: '2025/2026', source: 'polytechnique.edu' },
    english: { ielts: 7.0, toefl: 100, detail: 'IELTS 7.0 или TOEFL 100', source: 'polytechnique.edu' },
    deadline: { date: '10.01.2026', label: 'Round 2', intake: 'Fall 2026', source: 'polytechnique.edu' },
    admissionNote: 'Элитная программа Франции. Онлайн-интервью по высшей математике и физике с профессорами.',
    scholarshipNote: 'Foundation de l’École Polytechnique предоставляет гранты за академические заслуги до 50% стоимости.',
    programUrl: 'https://programmes.polytechnique.edu/en/bachelor/bachelor-of-science',
    admissionUrl: 'https://programmes.polytechnique.edu/en/bachelor/admissions',
    checkedOn: '18.09.2026',
    accent: 'sand'
  },
  {
    uniName: 'Nazarbayev University',
    title: 'Biological Sciences (BSc)',
    field: 'Естественные науки',
    subfield: 'Genetics, Molecular Biology, Immunology',
    language: 'English',
    degree: 'bachelor',
    durationYears: 4,
    tuition: { amount: 0, currency: 'KZT', period: 'year', year: '2026', source: 'nu.edu.kz', note: 'Полный грант' },
    english: { ielts: 6.5, toefl: 85, detail: 'IELTS 6.5 + SAT Subject / General', source: 'nu.edu.kz' },
    deadline: { date: '31.03.2026', label: 'General Admission', intake: 'Fall 2026', source: 'nu.edu.kz' },
    admissionNote: 'Научные лаборатории биомедицины, участие студентов в грантовых исследованиях с 2-го курса.',
    scholarshipNote: '100% покрытие стоимости, ежемесячная стипендия и бесплатное общежитие для грантников.',
    programUrl: 'https://ssh.nu.edu.kz/departments/biological-sciences',
    admissionUrl: 'https://admissions.nu.edu.kz',
    checkedOn: '18.09.2026',
    accent: 'sage'
  },

  // ================= 10. ГУМАНИТАРНЫЕ НАУКИ =================
  {
    uniName: 'University of Oxford',
    title: 'History and Economics (BA Hons)',
    field: 'Гуманитарные науки',
    subfield: 'Global History, Economic Systems, Historical Analysis',
    language: 'English',
    degree: 'bachelor',
    durationYears: 3,
    tuition: { amount: 35000, currency: 'GBP', period: 'year', year: '2025/2026', source: 'ox.ac.uk' },
    english: { ielts: 7.5, toefl: 110, detail: 'IELTS 7.5 (минимум 7.0 по всем разделам)', source: 'ox.ac.uk' },
    deadline: { date: '15.10.2025', label: 'Early UCAS Deadline', intake: 'Fall 2026', source: 'ucas.com' },
    admissionNote: 'Письменный тест HAT (History Aptitude Test) + образцы эссе + 2 академических интервью в Оксфорде/онлайн.',
    scholarshipNote: 'Reach Oxford Scholarship для студентов из развивающихся стран (покрывает 100% расходов).',
    programUrl: 'https://www.ox.ac.uk/admissions/undergraduate/courses/course-listing/history-and-economics',
    admissionUrl: 'https://www.ox.ac.uk/admissions/undergraduate/applying-to-oxford',
    checkedOn: '18.09.2026',
    accent: 'plum'
  },
  {
    uniName: 'Yonsei University, Underwood International College',
    title: 'Comparative Literature and Culture (BA)',
    field: 'Гуманитарные науки',
    subfield: 'World Literature, Cultural Studies, Critical Theory',
    language: 'English',
    degree: 'bachelor',
    durationYears: 4,
    tuition: { amount: 7200000, currency: 'KRW', period: 'semester', year: '2025/2026', source: 'uic.yonsei.ac.kr' },
    english: { ielts: 6.5, toefl: 85, detail: 'IELTS 6.5 / TOEFL 85', source: 'uic.yonsei.ac.kr' },
    deadline: { date: '15.11.2025', label: 'Spring/Fall Early', intake: 'Fall 2026', source: 'uic.yonsei.ac.kr' },
    admissionNote: 'Корейский SKY-вуз. Преподавание 100% на английском в кампусе Сондо. Требуется сильное эссе и видео-интервью.',
    scholarshipNote: 'UIC Admissions Scholarship дает 50% или 100% скидку на все 4 года обучения.',
    programUrl: 'https://uic.yonsei.ac.kr/main/major.asp?mid=m02_02_01',
    admissionUrl: 'https://uic.yonsei.ac.kr/main/admissions.asp',
    checkedOn: '18.09.2026',
    accent: 'sand'
  },

  // ================= 11. СОЦИАЛЬНЫЕ НАУКИ =================
  {
    uniName: 'Sciences Po',
    title: 'Bachelor of Arts in Social Sciences & Humanities',
    field: 'Социальные науки',
    subfield: 'Political Science, Sociology, Public Policy',
    language: 'English',
    degree: 'bachelor',
    durationYears: 3,
    tuition: { amount: 14720, currency: 'EUR', period: 'year', year: '2025/2026', source: 'sciencespo.fr' },
    english: { ielts: 7.0, toefl: 100, detail: 'IELTS 7.0 или TOEFL iBT 100', source: 'sciencespo.fr' },
    deadline: { date: '25.04.2026', label: 'International Admissions', intake: 'Fall 2026', source: 'sciencespo.fr' },
    admissionNote: 'Главная школа государственного управления Франции. Досье из 3 эссе + онлайн-интервью с анализом новостной фотографии.',
    scholarshipNote: 'Стипендия Эмиля Бутми (Émile Boutmy Scholarship) от 3900 € до 14210 € в год.',
    programUrl: 'https://www.sciencespo.fr/college/en/academics/bachelor.html',
    admissionUrl: 'https://www.sciencespo.fr/admissions/en/undergraduate.html',
    checkedOn: '18.09.2026',
    accent: 'sage'
  },
  {
    uniName: 'University of Amsterdam (UvA)',
    title: 'Communication Science (BSc)',
    field: 'Социальные науки',
    subfield: 'Media Systems, Digital Culture, Persuasive Communication',
    language: 'English',
    degree: 'bachelor',
    durationYears: 3,
    tuition: { amount: 11600, currency: 'EUR', period: 'year', year: '2025/2026', source: 'uva.nl' },
    english: { ielts: 6.5, toefl: 92, detail: 'IELTS 6.5 (минимум 6.0 по навыкам)', source: 'uva.nl' },
    deadline: { date: '01.04.2026', label: 'Non-EU Intake', intake: 'Fall 2026', source: 'uva.nl' },
    admissionNote: 'Факультет медиа и коммуникаций #1 в мире по рейтингу QS на протяжении 6 лет подряд.',
    scholarshipNote: 'Holland Scholarship для абитуриентов из стран, не входящих в ЕЭЗ.',
    programUrl: 'https://www.uva.nl/en/programmes/bachelors/communication-science/communication-science.html',
    admissionUrl: 'https://www.uva.nl/en/programmes/bachelors/communication-science/application-and-admission/application-and-admission.html',
    checkedOn: '18.09.2026',
    accent: 'plum'
  },

  // ================= 12. ИСКУССТВО И МЕДИА =================
  {
    uniName: 'NABA (Nuova Accademia di Belle Arti)',
    title: 'Creative Media and Film Making (BA)',
    field: 'Искусство и медиа',
    subfield: 'Cinematography, Digital Storytelling, Motion Graphics',
    language: 'English',
    degree: 'bachelor',
    durationYears: 3,
    tuition: { amount: 19500, currency: 'EUR', period: 'year', year: '2025/2026', source: 'naba.it' },
    english: { ielts: 5.5, toefl: 72, detail: 'IELTS 5.5 или сертификат B2', source: 'naba.it' },
    deadline: { date: '30.06.2026', label: 'Rolling Admission', intake: 'Fall 2026', source: 'naba.it' },
    admissionNote: 'Ведущая частная академия искусств Италии в Милане. Отбор по художественному портфолио или видео-эссе.',
    scholarshipNote: 'Ежегодный конкурс NABA Scholarship Competition покрывает до 50% стоимости обучения.',
    programUrl: 'https://www.naba.it/en/undergraduate-programmes/ba-film-and-animation',
    admissionUrl: 'https://www.naba.it/en/apply',
    checkedOn: '18.09.2026',
    accent: 'sand'
  },
  {
    uniName: 'Astana IT University',
    title: 'Media Technologies (BSc)',
    field: 'Искусство и медиа',
    subfield: 'Game Development, 3D Animation, VFX, Digital Media',
    language: 'English',
    degree: 'bachelor',
    durationYears: 3,
    tuition: { amount: 1600000, currency: 'KZT', period: 'year', year: '2025/2026', source: 'astanait.edu.kz' },
    english: { ielts: 5.0, toefl: 65, detail: 'IELTS 5.0 или тестирование AITU', source: 'astanait.edu.kz' },
    deadline: { date: '25.07.2026', label: 'Main Intake', intake: 'Fall 2026', source: 'astanait.edu.kz' },
    admissionNote: '3-годичный прикладной бакалавриат. Обучение разработке игр, спецэффектам и интерактивным медиа.',
    scholarshipNote: 'Государственные образовательные гранты Республики Казахстан по специальности информационных технологий.',
    programUrl: 'https://astanait.edu.kz/educational-programs/',
    admissionUrl: 'https://astanait.edu.kz/admission/',
    checkedOn: '18.09.2026',
    accent: 'sage'
  },

  // ================= 13. ОБРАЗОВАНИЕ =================
  {
    uniName: 'University College London (UCL)',
    title: 'Education, Society and Culture (BA)',
    field: 'Образование',
    subfield: 'Educational Psychology, Global Pedagogy, EdTech Policy',
    language: 'English',
    degree: 'bachelor',
    durationYears: 3,
    tuition: { amount: 26200, currency: 'GBP', period: 'year', year: '2025/2026', source: 'ucl.ac.uk' },
    english: { ielts: 7.0, toefl: 100, detail: 'IELTS 7.0 (не менее 6.5 по субтестам)', source: 'ucl.ac.uk' },
    deadline: { date: '29.01.2026', label: 'UCAS Deadline', intake: 'Fall 2026', source: 'ucas.com' },
    admissionNote: 'Институт образования UCL (IOE) занимает 1-е место в мире по направлению Education более 10 лет.',
    scholarshipNote: 'UCL Undergraduate bursaries и партнерские гранты международных фондов.',
    programUrl: 'https://www.ucl.ac.uk/prospective-students/undergraduate/degrees/education-studies-ba',
    admissionUrl: 'https://www.ucl.ac.uk/prospective-students/undergraduate/applying-ucl',
    checkedOn: '18.09.2026',
    accent: 'plum'
  },
  {
    uniName: 'SDU University',
    title: 'Foreign Language: Two Foreign Languages (English & German/French)',
    field: 'Образование',
    subfield: 'Linguistics, Modern Teaching Methodologies, TESOL',
    language: 'English',
    degree: 'bachelor',
    durationYears: 4,
    tuition: { amount: 1550000, currency: 'KZT', period: 'year', year: '2025/2026', source: 'sdu.edu.kz' },
    english: { ielts: 5.5, toefl: 70, detail: 'IELTS 5.5 или вступительный экзамен SDU', source: 'sdu.edu.kz' },
    deadline: { date: '10.08.2026', label: 'Admission Cycle', intake: 'Fall 2026', source: 'sdu.edu.kz' },
    admissionNote: 'Один из сильнейших педагогических центров подготовки преподавателей иностранных языков в РК.',
    scholarshipNote: 'Внутренняя олимпиада SDU SPT с грантами до 100% покрытия на все 4 года обучения + госгранты.',
    programUrl: 'https://sdu.edu.kz/faculty-of-education-and-humanities/',
    admissionUrl: 'https://sdu.edu.kz/admission/',
    checkedOn: '18.09.2026',
    accent: 'sand'
  },

  // ================= 14. ЭКОЛОГИЯ =================
  {
    uniName: 'Wageningen University & Research',
    title: 'Environmental Sciences (BSc)',
    field: 'Экология',
    subfield: 'Climate Change, Water Management, Ecosystem Restoration',
    language: 'English',
    degree: 'bachelor',
    durationYears: 3,
    tuition: { amount: 16400, currency: 'EUR', period: 'year', year: '2025/2026', source: 'wur.nl' },
    english: { ielts: 6.5, toefl: 92, detail: 'IELTS 6.5 (speaking не ниже 6.0)', source: 'wur.nl' },
    deadline: { date: '01.05.2026', label: 'Non-EU Students', intake: 'Fall 2026', source: 'wur.nl' },
    admissionNote: 'Мировой лидер в области наук об окружающей среде, сельском хозяйстве и экологии (#1 в мире по QS Agriculture & Forestry).',
    scholarshipNote: 'Holland Scholarship (до 5000 € в первый год) + гранты международных фондов устойчивого развития.',
    programUrl: 'https://www.wur.nl/en/education-programmes/bachelor/environmental-sciences.htm',
    admissionUrl: 'https://www.wur.nl/en/education-programmes/bachelor/apply.htm',
    checkedOn: '18.09.2026',
    accent: 'sage'
  },
  {
    uniName: 'Narxoz University',
    title: 'Sustainable Development and Environmental Economics (BSc)',
    field: 'Экология',
    subfield: 'ESG Strategy, Carbon Markets, Natural Resource Management',
    language: 'English',
    degree: 'bachelor',
    durationYears: 4,
    tuition: { amount: 2200000, currency: 'KZT', period: 'year', year: '2025/2026', source: 'narxoz.edu.kz' },
    english: { ielts: 5.5, toefl: 70, detail: 'IELTS 5.5 или экзамен Narxoz English', source: 'narxoz.edu.kz' },
    deadline: { date: '15.08.2026', label: 'Fall Registration', intake: 'Fall 2026', source: 'narxoz.edu.kz' },
    admissionNote: 'Первая программа в Центральной Азии с фокусом на зеленые финансы, стандарты ESG и циркулярную экономику.',
    scholarshipNote: 'Гранты фонда Булата Утемуратова и академические стипендии университета за успеваемость.',
    programUrl: 'https://narxoz.edu.kz/programs/undergraduate/',
    admissionUrl: 'https://narxoz.edu.kz/admissions/',
    checkedOn: '18.09.2026',
    accent: 'sand'
  },

  // ================= 15. МЕЖДУНАРОДНЫЕ ОТНОШЕНИЯ =================
  {
    uniName: 'Sciences Po',
    title: 'International Relations and Middle East / European Affairs',
    field: 'Международные отношения',
    subfield: 'Diplomacy, International Security, Global Governance',
    language: 'English',
    degree: 'bachelor',
    durationYears: 3,
    tuition: { amount: 14720, currency: 'EUR', period: 'year', year: '2025/2026', source: 'sciencespo.fr' },
    english: { ielts: 7.0, toefl: 100, detail: 'IELTS 7.0 или TOEFL 100', source: 'sciencespo.fr' },
    deadline: { date: '25.04.2026', label: 'International Call', intake: 'Fall 2026', source: 'sciencespo.fr' },
    admissionNote: 'Кампусы в Ментоне, Реймсе, Гавре с региональными специализациями. Третий год обучения проходит за рубежом в вузе-партнере.',
    scholarshipNote: 'Émile Boutmy Scholarship покрывает до 100% стоимости обучения для иностранных студентов.',
    programUrl: 'https://www.sciencespo.fr/college/en/academics/bachelor.html',
    admissionUrl: 'https://www.sciencespo.fr/admissions/en/',
    checkedOn: '18.09.2026',
    accent: 'plum'
  },
  {
    uniName: 'University of Warsaw',
    title: 'International Relations (BA)',
    field: 'Международные отношения',
    subfield: 'European Geopolitics, Foreign Policy Analysis',
    language: 'English',
    degree: 'bachelor',
    durationYears: 3,
    tuition: { amount: 3000, currency: 'EUR', period: 'year', year: '2025/2026', source: 'uw.edu.pl' },
    english: { ielts: 6.5, toefl: 85, detail: 'IELTS 6.5 или B2 Certificate', source: 'uw.edu.pl' },
    deadline: { date: '05.07.2026', label: 'IRK Admission', intake: 'Fall 2026', source: 'irk.uw.edu.pl' },
    admissionNote: 'Институт международных отношений Варшавского университета — ключевой аналитический хаб Восточной Европы.',
    scholarshipNote: 'Доступны стипендии NAWA (Польское национальное агентство академических обменов) имени Стефана Банаха.',
    programUrl: 'https://en.uw.edu.pl/education/study-at-uw/degree-programmes/international-relations-ba/',
    admissionUrl: 'https://irk.uw.edu.pl',
    checkedOn: '18.09.2026',
    accent: 'sage'
  },
  {
    uniName: 'Korea University',
    title: 'Division of International Studies (DIS)',
    field: 'Международные отношения',
    subfield: 'International Commerce, East Asian Diplomacy, Security',
    language: 'English',
    degree: 'bachelor',
    durationYears: 4,
    tuition: { amount: 4800000, currency: 'KRW', period: 'semester', year: '2025/2026', source: 'korea.edu' },
    english: { ielts: 7.0, toefl: 95, detail: 'IELTS 7.0 или TOEFL iBT 95', source: 'dis.korea.ac.kr' },
    deadline: { date: '15.10.2025', label: 'Early Admission', intake: 'Fall 2026', source: 'korea.edu' },
    admissionNote: 'Один из университетов корейской тройки SKY. Полностью англоязычная программа с преподаванием от бывших дипломатов.',
    scholarshipNote: 'Korea University Global Leader Scholarship дает 50–100% скидку на обучение.',
    programUrl: 'https://dis.korea.ac.kr',
    admissionUrl: 'https://oia.korea.ac.kr',
    checkedOn: '18.09.2026',
    accent: 'sand'
  }
];

async function seed() {
  console.log('🔌 Connecting to MongoDB:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected');

  // Upsert universities
  const uniMap = new Map<string, mongoose.Types.ObjectId>();
  for (const u of rawUniversities) {
    const doc = await University.findOneAndUpdate(
      { name: u.name },
      { $set: u },
      { upsert: true, new: true }
    );
    uniMap.set(u.name, doc._id);
    console.log(`  🏫 University: ${u.name} (${u.country})`);
  }

  // Seed expanded programs
  for (const p of expandedPrograms) {
    const universityId = uniMap.get(p.uniName);
    if (!universityId) {
      console.warn(`  ⚠️ University not found for: ${p.uniName}`);
      continue;
    }

    const legacyId = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);

    await Program.findOneAndUpdate(
      { title: p.title, universityId },
      {
        $set: {
          universityId,
          legacyId,
          title: p.title,
          degree: p.degree,
          field: p.field,
          subfield: p.subfield,
          language: p.language,
          durationYears: p.durationYears,
          tuition: p.tuition,
          english: p.english,
          deadline: p.deadline,
          admissionNote: p.admissionNote,
          scholarshipNote: p.scholarshipNote,
          specialRequirement: p.specialRequirement,
          programUrl: p.programUrl,
          admissionUrl: p.admissionUrl,
          costUrl: p.costUrl,
          checkedOn: p.checkedOn,
          isActive: true,
          accent: p.accent,
        },
      },
      { upsert: true, new: true }
    );
    console.log(`  📚 [${p.field}] ${p.uniName} — ${p.title}`);
  }

  const totalUnis = await University.countDocuments();
  const totalPrograms = await Program.countDocuments();
  console.log(`\n🎉 SEED COMPLETE: ${totalUnis} universities, ${totalPrograms} active programs across all 15 directions!`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
