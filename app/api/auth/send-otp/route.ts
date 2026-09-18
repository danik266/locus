import connectDB from '../../../../lib/mongodb';
import { Otp } from '../../../../lib/models/Otp';
import { randomInt, createHash } from 'node:crypto';

const h = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };

function generateOtp(): string {
  return String(randomInt(100000, 1000000));
}

async function sendEmail(to: string, code: string): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;

  if (resendKey) {
    if (!from) throw new Error('MAIL_FROM is required');
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to,
        subject: 'Ваш код входа в Continue',
        html: `<p>Код для входа в Continue: <strong>${code}</strong></p><p>Действителен 10 минут.</p>`,
        text: `Код для входа в Continue: ${code}\n\nДействителен 10 минут.`,
      }),
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.error(`Resend API error (${res.status}):`, errBody);
      // In development, do not block the user: log code to console
      if (process.env.NODE_ENV !== 'production') {
        console.log(`\n🔑 [DEV FALLBACK] OTP for ${to}: ${code}\n`);
        return;
      }
      throw new Error(`Resend error: ${res.status}`);
    }
    return;
  }

  // Fallback: log to console in dev if no email service configured
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n🔑 OTP for ${to}: ${code}\n`);
    return;
  }
  throw new Error('Email service not configured');
}

export async function POST(request: Request) {
  const { email } = await request.json().catch(() => ({})) as { email?: string };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Invalid email' }, { status: 400, headers: h });
  }

  await connectDB();

  // Rate limit: max 3 OTPs per email per 10 minutes
  const cutoff = new Date(Date.now() - 10 * 60 * 1000);
  const recent = await Otp.countDocuments({ email: email.toLowerCase(), createdAt: { $gt: cutoff } });
  if (recent >= 3) {
    return Response.json({ error: 'Too many attempts. Try again in 10 minutes.' }, { status: 429, headers: h });
  }

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  const otp = await Otp.create({ email: email.toLowerCase(), code: createHash('sha256').update(code).digest('hex'), expiresAt });

  try {
    await sendEmail(email.toLowerCase(), code);
    await Otp.updateMany({ email: email.toLowerCase(), _id: { $ne: otp._id }, used: false }, { $set: { used: true } });
  } catch (err) {
    await Otp.deleteOne({ _id: otp._id });
    console.error('Email send failed:', err);
    return Response.json({ error: 'Failed to send code' }, { status: 502, headers: h });
  }

  return Response.json({ ok: true }, { headers: h });
}
