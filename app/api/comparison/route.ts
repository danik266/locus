import { recommend } from '../../../lib/admissions';
import { comparisonFacts, comparisonWinner, parseComparisonNarrative } from '../../../lib/comparison-analysis';
import { parseProfile } from '../../../lib/diagnosis';
import { loadActivePrograms } from '../../../lib/catalog-service';

const headers = {'Cache-Control':'no-store'};

export async function POST(request: Request) {
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Forbidden'},{status:403,headers});
 if(Number(request.headers.get('content-length')||0)>12000)return Response.json({error:'Payload too large'},{status:413,headers});
 let payload:Record<string,unknown>;
 try {const raw=await request.text();if(raw.length>12000)throw new Error('size');payload=JSON.parse(raw);} catch {return Response.json({error:'Invalid JSON'},{status:400,headers});}
 const profile=parseProfile(payload.profile);
 const ids=payload.ids;
 if(!profile||!Array.isArray(ids)||ids.length<2||ids.length>3||new Set(ids).size!==ids.length||!ids.every(id=>typeof id==='string'&&id.length<80))return Response.json({error:'Invalid comparison'},{status:400,headers});
 const candidates=recommend(profile,await loadActivePrograms());
 const items=ids.map(id=>candidates.find(p=>p.id===id));
 if(items.some(item=>!item))return Response.json({error:'Unknown program'},{status:400,headers});
 const facts=comparisonFacts(profile,items as typeof candidates);
 const winner=comparisonWinner(facts)!;
 const locale=['ru','en','kk'].includes(payload.locale as string)?payload.locale:'ru';
 const key=process.env.GROQ_API_KEY;
 if(!key)return Response.json({error:'AI unavailable'},{status:503,headers});
 try {
  const response=await fetch('https://api.groq.com/openai/v1/chat/completions',{
   method:'POST',signal:AbortSignal.timeout(18000),
   headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','User-Agent':'Mozilla/5.0 ContinueAdmissions/0.1'},
   body:JSON.stringify({model:'openai/gpt-oss-20b',temperature:0.2,max_completion_tokens:3500,reasoning_effort:'low',reasoning_format:'hidden',response_format:{type:'json_object'},messages:[
    {role:'system',content:`You are a careful admission comparison analyst. Write in ${locale==='ru'?'Russian':locale==='kk'?'Kazakh':'English'}, directly to the applicant without assuming gender. Use ONLY supplied facts. The preferred program ID is fixed by transparent signals; explain that choice and its tradeoff rather than changing it. Signals are a comparison heuristic, NOT admission probability or odds. Do not invent ranking, career outcomes, scholarship awards, admission chances, deadlines, cost, missing test requirements, or equivalence of diplomas. Missing facts remain unknown. A self-assessed English level is NOT an exam. Meeting overall IELTS does not prove section requirements or eligibility. Tuition excludes fees/living costs; annual EUR estimates are dated and approximate. Scholarship notes do not guarantee aid. If all options are difficult, say the winner is only the closest of these options. Do not cite unprovided sources. Return ONLY JSON: {"overview":"2-3 informative sentences","programs":[{"id":"exact ID","fit":"2 detailed sentences","strengths":["1-2 evidence-based specifics"],"risks":["1-2 concrete blockers or uncertainties"],"nextStep":"one concrete action"}],"verdict":{"winnerId":"exact preferred ID","why":"2-3 specific comparative sentences","tradeoff":"main drawback or uncertainty","firstAction":"first action before deciding"}}. Cover every supplied ID exactly once. Keep each string plain text, no markdown.`},
    {role:'user',content:JSON.stringify({applicant:{goal:profile.interest==='Другое'?profile.customInterest:profile.interest,year:profile.year,citizenship:profile.citizenship,schoolQualification:profile.schoolQualification,budgetEURPerYear:profile.budget,aid:profile.aid,priorities:profile.priorities,englishExam:profile.englishExam,ieltsOverall:profile.englishExam==='IELTS'?profile.english:null,englishSelfAssessment:profile.englishExam==='Не сдавал'?profile.englishLevel:null,readiness:profile.readiness},preferredProgramId:winner.id,programs:facts})}
   ]})
  });
  if(!response.ok)return Response.json({error:'AI unavailable'},{status:502,headers});
  const result=await response.json() as {choices?:{message?:{content?:string}}[]};
  const insight=parseComparisonNarrative(JSON.parse(result.choices?.[0]?.message?.content||'null'),ids,winner.id);
  if(!insight)return Response.json({error:'Invalid AI response'},{status:502,headers});
  return Response.json({insight},{headers});
 }catch(error){console.warn('Comparison analysis failed',error instanceof Error?error.name:'unknown');return Response.json({error:'AI unavailable'},{status:502,headers});}
}
