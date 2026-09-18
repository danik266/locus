import connectDB from '../../../lib/mongodb';
import { Profile } from '../../../lib/models/Profile';
import { getSessionUser } from '../../../lib/auth';
import { defaults } from '../../../lib/admissions';

const h = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401, headers: h });

  await connectDB();
  const profile = await Profile.findOne({ userId: user._id }).lean();
  return Response.json({ profile: profile ?? null }, { headers: h });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401, headers: h });

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: h });
  }
  const input = body as Record<string, unknown>;

  await connectDB();

  // Merge with defaults — don't let client inject arbitrary fields
  const allowed = Object.keys(defaults) as (keyof typeof defaults)[];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in input) update[key] = input[key];
  }
  if (Array.isArray(input.savedProgramIds)) {
    update.savedProgramIds = (input.savedProgramIds as unknown[])
      .filter((id): id is string => typeof id === 'string')
      .slice(0, 50);
  }
  if (typeof input.selectedProgramId === 'string') update.selectedProgramId = input.selectedProgramId.slice(0, 100);
  if (Array.isArray(input.completedTaskIds)) {
    update.completedTaskIds = input.completedTaskIds.filter((id: unknown): id is string => typeof id === 'string').slice(0, 200);
  }
  if (typeof input.hasProfile === 'boolean') update.hasProfile = input.hasProfile;

  const profile = await Profile.findOneAndUpdate(
    { userId: user._id },
    { $set: update, $setOnInsert: { userId: user._id } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  return Response.json({ profile }, { headers: h });
}

export async function DELETE() {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401, headers: h });
  await connectDB();
  await Profile.deleteOne({ userId: user._id });
  return Response.json({ ok: true }, { headers: h });
}
