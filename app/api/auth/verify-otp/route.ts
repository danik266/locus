import { cookies } from 'next/headers';
import connectDB from '../../../../lib/mongodb';
import { User } from '../../../../lib/models/User';
import { Otp } from '../../../../lib/models/Otp';
import { createSession, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from '../../../../lib/auth';
import { createHash } from 'node:crypto';

const h = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };

export async function POST(request: Request) {
  const { email, code } = await request.json().catch(() => ({})) as { email?: string; code?: string };

  if (!email || !code || !/^\d{6}$/.test(code)) {
    return Response.json({ error: 'Invalid request' }, { status: 400, headers: h });
  }

  await connectDB();

  const otp = await Otp.findOneAndUpdate({
    email: email.toLowerCase(),
    used: false,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: 5 },
  }, { $inc: { attempts: 1 } }, { sort: { createdAt: -1 }, returnDocument: 'after' });

  if (!otp || otp.code !== createHash('sha256').update(code).digest('hex')) {
    return Response.json({ error: 'Invalid or expired code' }, { status: 401, headers: h });
  }

  const consumed = await Otp.updateOne({ _id: otp._id, used: false }, { $set: { used: true } });
  if (!consumed.modifiedCount) return Response.json({ error: 'Invalid or expired code' }, { status: 401, headers: h });

  // Upsert user
  let user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    user = await User.create({ email: email.toLowerCase() });
  } else {
    user.lastLoginAt = new Date();
    await user.save();
  }

  // Create session
  const token = await createSession(user._id.toString());

  // Set cookie
  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);

  return Response.json({
    ok: true,
    user: { id: user._id, email: user.email, name: user.name },
  }, { headers: h });
}
