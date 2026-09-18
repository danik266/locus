import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import { Program } from '../../../lib/models/Program';
import { University } from '../../../lib/models/University';
import { campusPhoto } from '../../../lib/university-visuals';
import { isVerifiedProgram } from '../../../lib/program-verification';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    // Ensure University model is registered for populate
    void University;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim();
    const field = searchParams.get('field')?.trim();
    const country = searchParams.get('country')?.trim();
    const degree = searchParams.get('degree')?.trim();
    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 100, 1), 500);
    const page = Math.max(Number(searchParams.get('page')) || 1, 1);

    // Build filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = { isActive: true };

    if (field && field !== 'Все' && field !== 'All') {
      const fields = field.split(',').map(f => f.trim()).filter(Boolean);
      if (fields.length === 1) filter.field = fields[0];
      else if (fields.length > 1) filter.field = { $in: fields };
    }

    if (degree && degree !== 'all') {
      filter.degree = degree;
    }

    if (country && !['Все', 'Любая', 'All'].includes(country)) {
      const countries = country.split(',').map(value => value.trim()).filter(Boolean);
      const universityIds = await University.find({ country: { $in: countries } }).distinct('_id');
      filter.universityId = { $in: universityIds };
    }

    if (search) {
      const regex = new RegExp(search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
      filter.$or = [
        { title: regex },
        { subfield: regex },
        { admissionNote: regex },
      ];
    }

    // Query programs with university populated
    const query = Program.find(filter)
      .populate('universityId')
      .sort({ 'deadline.date': 1, title: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const [rawPrograms, total] = await Promise.all([
      query.exec(),
      Program.countDocuments(filter),
    ]);

    // Format program objects for easy consumption
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatted = rawPrograms.map((p: any) => {
      const uni = p.universityId || {};
      const verified = isVerifiedProgram(p.legacyId);
      return {
        id: p.legacyId || String(p._id),
        _id: String(p._id),
        title: p.title,
        university: uni.name || 'Университет',
        country: uni.country || '',
        city: uni.city || '',
        degree: p.degree,
        field: p.field,
        interest: p.field, // for compatibility with legacy components
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
        universityRankQS: uni.rankQS,
        universityType: uni.type,
      };
    });

    return NextResponse.json({
      programs: formatted,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}
