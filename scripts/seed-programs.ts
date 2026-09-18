/**
 * Seed script: loads the static program catalog into MongoDB.
 * Run: node --experimental-strip-types scripts/seed-programs.ts
 */
import mongoose from 'mongoose';
import { programs as staticPrograms } from '../lib/program-catalog.ts';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/locus';

// Inline minimal models (avoids Next.js import issues)
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

// Extract unique universities from the catalog
function extractUniversity(p: typeof staticPrograms[0]) {
  const countryToCity: Record<string, string> = {
    'Германия': 'Germany', 'Польша': 'Kraków', 'Нидерланды': 'Enschede',
    'США': 'United States', 'Италия': 'Italy', 'Южная Корея': 'Seoul',
    'Казахстан': 'Almaty',
  };
  return {
    name: p.school,
    country: p.country,
    city: countryToCity[p.country] ?? p.country,
    website: new URL(p.programUrl).origin,
    type: 'public' as const,
  };
}

function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1]) : 3;
}

async function seed() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected');

  // Clear existing data
  await Program.deleteMany({});
  await University.deleteMany({});
  console.log('🧹 Cleared existing programs and universities');

  // Group by school name
  const univMap = new Map<string, mongoose.Types.ObjectId>();
  const univDatas = [...new Map(staticPrograms.map(p => [p.school, extractUniversity(p)])).values()];

  for (const uData of univDatas) {
    const doc = await University.create(uData);
    univMap.set(uData.name, doc._id as mongoose.Types.ObjectId);
    console.log(`  🏫 ${uData.name}`);
  }

  // Insert programs
  let count = 0;
  for (const p of staticPrograms) {
    const universityId = univMap.get(p.school);
    await Program.create({
      universityId,
      legacyId: p.id,
      title: p.title,
      degree: 'bachelor',
      field: p.interest,
      language: 'English',
      durationYears: parseDuration(p.duration),
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
      coverImage: p.coverImage,
    });
    count++;
    console.log(`  📚 ${p.school} — ${p.title}`);
  }

  console.log(`\n✅ Seeded ${univDatas.length} universities and ${count} programs`);
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
