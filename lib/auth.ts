import { cookies } from 'next/headers';
import connectDB from './mongodb';
import { Session } from './models/Session';
import { User, type IUser } from './models/User';
import { randomBytes, createHmac } from 'crypto';

const SESSION_COOKIE = 'locus_session';
const SESSION_DAYS = 30;
function sessionSecret(): string {
  return process.env.SESSION_SECRET || 'c1ec77b026cfb952a67f4d4b5ab464b0062c27e45b70957c73f9544bded7d5af';
}

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export function signToken(token: string): string {
  return createHmac('sha256', sessionSecret()).update(token).digest('hex');
}

export async function createSession(userId: string): Promise<string> {
  await connectDB();
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await Session.create({ userId, token: signToken(token), expiresAt });
  return token; // raw token goes to cookie
}

export async function getSessionUser(): Promise<IUser | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  await connectDB();
  const signed = signToken(raw);
  const session = await Session.findOne({ token: signed, expiresAt: { $gt: new Date() } });
  if (!session) return null;
  return User.findById(session.userId);
}

export async function deleteSession(): Promise<void> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return;
  await connectDB();
  await Session.deleteOne({ token: signToken(raw) });
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: SESSION_DAYS * 24 * 60 * 60,
  path: '/',
};
