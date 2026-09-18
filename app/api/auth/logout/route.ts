import { cookies } from 'next/headers';
import { deleteSession, SESSION_COOKIE_NAME } from '../../../../lib/auth';

const h = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };

export async function POST() {
  await deleteSession();
  const jar = await cookies();
  jar.delete(SESSION_COOKIE_NAME);
  return Response.json({ ok: true }, { headers: h });
}
