import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import { University } from '../../../lib/models/University';
import { Program } from '../../../lib/models/Program';
import { campusPhoto } from '../../../lib/university-visuals';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const [universities, counts] = await Promise.all([
      University.find().sort({ country: 1, name: 1 }).lean(),
      Program.aggregate<{ _id: string; count: number }>([
        { $match: { isActive: true } },
        { $group: { _id: '$universityId', count: { $sum: 1 } } },
      ]),
    ]);
    const countById = new Map(counts.map(row => [String(row._id), row.count]));
    return NextResponse.json({ universities: universities.map(university => ({
      id: String(university._id), name: university.name, country: university.country,
      city: university.city, website: university.website,
      photo: campusPhoto(university.name),
      programCount: countById.get(String(university._id)) ?? 0,
    })) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch universities' }, { status: 500 });
  }
}
