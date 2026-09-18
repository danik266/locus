import connectDB from './mongodb';
import { Program as ProgramModel } from './models/Program';
import { University } from './models/University';
import { programs, type Program } from './program-catalog';
import { isVerifiedProgram } from './program-verification';
import { campusPhoto } from './university-visuals';

export async function loadActivePrograms(): Promise<Program[]> {
  await connectDB();
  void University;
  const rows = await ProgramModel.find({ isActive: true }).populate('universityId').lean();
  if (!rows.length) return programs;
  return rows.map(row => {
    const university = row.universityId as unknown as { name: string; country: string };
    const verified = isVerifiedProgram(row.legacyId);
    const years = row.durationYears;
    return {
      id: row.legacyId || String(row._id), title: row.title,
      school: university?.name ?? 'Университет', country: university?.country ?? '',
      interest: row.field, duration: `${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}`,
      accent: row.accent ?? 'plum', coverImage: row.coverImage || campusPhoto(university?.name), verified,
      tuition: verified ? row.tuition : null,
      english: verified ? row.english : { ielts: null, detail: 'Языковые требования нужно проверить на сайте вуза.', source: row.admissionUrl },
      deadline: verified ? row.deadline : null,
      admissionNote: verified ? row.admissionNote : 'Условия поступления ещё не проверены. Открой официальный сайт.',
      scholarshipNote: verified ? row.scholarshipNote : 'Финансирование нужно уточнить на сайте университета.',
      specialRequirement: verified ? row.specialRequirement : undefined,
      programUrl: row.programUrl, admissionUrl: row.admissionUrl, costUrl: row.costUrl,
      checkedOn: verified ? row.checkedOn : '',
    } satisfies Program;
  });
}
