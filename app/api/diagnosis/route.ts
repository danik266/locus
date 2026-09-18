import { diagnose } from '../../../lib/diagnosis';
import { budgetComparison, focusName, recommend } from '../../../lib/admissions';
import { parseAiDiagnosis } from '../../../lib/ai-diagnosis';
import { parseProfile } from '../../../lib/diagnosis';
import { loadActivePrograms } from '../../../lib/catalog-service';

const headers = { 'Cache-Control': 'no-store' };

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: 'Forbidden' }, { status: 403, headers });
  if (Number(request.headers.get('content-length') || 0) > 12000) return Response.json({ error: 'Payload too large' }, { status: 413, headers });
  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 12000) return Response.json({ error: 'Payload too large' }, { status: 413, headers });
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400, headers });
  }
  const payload = body && typeof body === 'object' ? body as Record<string, unknown> : {};
  const profile = parseProfile(payload.profile);
  if (!profile) return Response.json({ error: 'Invalid profile' }, { status: 400, headers });
  const locale = ['ru', 'en', 'kk'].includes(payload.locale as string) ? payload.locale : 'ru';
  const key = process.env.GROQ_API_KEY;
  if (!key) return Response.json({ error: 'AI unavailable' }, { status: 503, headers });

  const matches = recommend(profile, await loadActivePrograms());
  const diagnosis = diagnose(profile, matches);
  const facts = {
    goal: focusName(profile), age: profile.age, grade: profile.grade, residence: profile.residence, citizenship:profile.citizenship,schoolQualification:profile.schoolQualification,
    year: profile.year, gpa: profile.gpa, gpaScale: profile.gpaScale, subjects: profile.subjects,
    englishExam: profile.englishExam, englishScore: profile.englishExam === 'IELTS' ? profile.english : profile.englishExam === 'TOEFL' ? profile.toefl : null,
    englishSelfAssessment: profile.englishExam === 'Не сдавал' ? profile.englishLevel : null,
    sat: profile.sat || null, satWilling: profile.satWilling, countries: profile.countries,
    budgetPerYear: profile.budget, budgetCurrency: 'EUR', aid: profile.aid, readiness: profile.readiness,
    strengths: diagnosis.strengths, constraints: diagnosis.constraints, mainBottleneck: diagnosis.bottleneck,
    catalogSignals: {
      noVerifiedMatches: matches.length===0,
      everyOptionOverBudget: matches.length > 0 && matches.every(match => budgetComparison(profile,match)==='above'),
      pricesAreTuitionOnly: true,
    },
  };
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 ContinueAdmissions/0.1' },
      signal: AbortSignal.timeout(12000),
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        temperature: 0.2,
        max_completion_tokens: 2048,
        reasoning_effort: 'low',
        reasoning_format: 'hidden',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: `You are an admission planning assistant. Address the applicant directly, without assuming gender. Write in ${locale === 'ru' ? 'Russian' : locale === 'kk' ? 'Kazakh' : 'English'}. Use only the supplied facts. The budget currency is EUR; never change the currency. Never invent a school, scholarship, admission requirement, deadline, admission probability, or test score. Never claim that most programs require an exam or prescribe a target exam score; advise checking actual program requirements. English self-assessment is not an official exam result. The catalog contains real programs but only partial verified facts. It does not prove admission eligibility. Tuition comparisons exclude fees and living costs and use dated currency rates. A budget is insufficient only if everyOptionOverBudget is true. The listed mainBottleneck is the deterministic priority; explain it without changing it. Return ONLY a JSON object with five short plain-text strings: summary, strengthInsight, constraintInsight, bottleneckInsight, priority. Each should be one concise sentence. Strength and constraint insights must reflect only listed strengths and constraints. Priority must describe a concrete next action.` },
          { role: 'user', content: JSON.stringify(facts) },
        ],
      }),
    });
    if (!response.ok) {
      console.warn('Groq request failed with status', response.status);
      return Response.json({ error: 'AI unavailable' }, { status: 502, headers });
    }
    const result = await response.json() as { choices?: { message?: { content?: string } }[] };
    const insight = parseAiDiagnosis(JSON.parse(result.choices?.[0]?.message?.content || 'null'));
    if (!insight) {
      console.warn('Groq returned an invalid diagnosis');
      return Response.json({ error: 'Invalid AI response' }, { status: 502, headers });
    }
    return Response.json({ insight }, { headers });
  } catch (error) {
    console.warn('Groq request could not complete', error instanceof Error ? error.name : 'unknown');
    return Response.json({ error: 'AI unavailable' }, { status: 502, headers });
  }
}
