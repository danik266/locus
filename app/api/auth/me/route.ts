import { getSessionUser } from '../../../../lib/auth';

const h = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ user: null }, { headers: h });
  return Response.json({
    user: { id: user._id, email: user.email, name: user.name },
  }, { headers: h });
}
