import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import { Program } from '../../../../lib/models/Program';
import { University } from '../../../../lib/models/University';
import mongoose from 'mongoose';
import { campusPhoto } from '../../../../lib/university-visuals';
import { isVerifiedProgram } from '../../../../lib/program-verification';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    void University;

    const { id } = await params;

    // Search by legacyId or _id
    const filter = mongoose.isValidObjectId(id)
      ? { $or: [{ _id: id }, { legacyId: id }] }
      : { legacyId: id };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p: any = await Program.findOne(filter).populate('universityId').lean();

    if (!p) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    const uni = p.universityId || {};
    const verified = isVerifiedProgram(p.legacyId);

    return NextResponse.json({
      program: {
        id: p.legacyId || String(p._id),
        _id: String(p._id),
        title: p.title,
        university: uni.name || 'Университет',
        country: uni.country || '',
        city: uni.city || '',
        universityWebsite: uni.website,
        universityRankQS: uni.rankQS,
        universityRankTHE: uni.rankTHE,
        universityType: uni.type,
        degree: p.degree,
        field: p.field,
        interest: p.field,
        subfield: p.subfield || '',
        language: p.language,
        durationYears: p.durationYears,
        verified,
        tuition: verified ? p.tuition : null,
        english: verified ? p.english : { ielts: null, toefl: null, detail: 'Уточни языковые требования на сайте программы.', source: p.admissionUrl },
        deadline: verified ? p.deadline : null,
        admissionNote: verified ? p.admissionNote : 'Условия поступления этой программы ещё не проверены. Открой официальную страницу вуза.',
        scholarshipNote: verified ? p.scholarshipNote : 'Финансирование нужно уточнить на сайте университета.',
        specialRequirement: verified ? p.specialRequirement : undefined,
        programUrl: p.programUrl,
        admissionUrl: p.admissionUrl,
        costUrl: p.costUrl,
        checkedOn: verified ? p.checkedOn : '',
        accent: p.accent || 'plum',
        coverImage: p.coverImage || campusPhoto(uni.name),
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch program' },
      { status: 500 }
    );
  }
}
