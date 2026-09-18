import { recommend } from '../../../lib/admissions';
import { buildRoadmap, parseAiRoadmap, roadmapInput } from '../../../lib/roadmap';
import { parseProfile } from '../../../lib/diagnosis';
import { loadActivePrograms } from '../../../lib/catalog-service';

const headers={'Cache-Control':'no-store'};

export async function POST(request:Request){
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Forbidden'},{status:403,headers});
 if(Number(request.headers.get('content-length')||0)>12000)return Response.json({error:'Payload too large'},{status:413,headers});
 let payload:Record<string,unknown>;
 try{const raw=await request.text();if(raw.length>12000)throw new Error('size');payload=JSON.parse(raw);}catch{return Response.json({error:'Invalid JSON'},{status:400,headers});}
 const profile=parseProfile(payload.profile);
 const programId=payload.programId;
 if(!profile||typeof programId!=='string'||programId.length>80)return Response.json({error:'Invalid request'},{status:400,headers});
 const program=recommend(profile,await loadActivePrograms()).find(p=>p.id===programId);
 if(!program)return Response.json({error:'Unknown program'},{status:400,headers});
 const locale=['ru','en','kk'].includes(payload.locale as string)?payload.locale:'ru';
 const key=process.env.GROQ_API_KEY;
 if(!key)return Response.json({error:'AI unavailable'},{status:503,headers});
 const stages=buildRoadmap(profile,program);
 try{
  const response=await fetch('https://api.groq.com/openai/v1/chat/completions',{
   method:'POST',signal:AbortSignal.timeout(22000),headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','User-Agent':'Mozilla/5.0 ContinueAdmissions/0.1'},
   body:JSON.stringify({model:'openai/gpt-oss-20b',temperature:0.2,max_completion_tokens:5000,reasoning_effort:'low',reasoning_format:'hidden',response_format:{type:'json_object'},messages:[
    {role:'system',content:`You are a careful university admissions planner. Write in ${locale==='ru'?'Russian':locale==='kk'?'Kazakh':'English'}, directly to the applicant, without assuming gender. Create a detailed, useful preparation roadmap for exactly the supplied program and applicant. Use only supplied facts and the eight provided stage IDs in the same order. Each stage has verified actions that the UI always displays; your extraActions must ADD specific, practical preparation details without repeating them. Focus on what the applicant can do, how to sequence it, and what to verify. Never invent an official deadline, scholarship amount, admission probability, required exam, visa rule, GPA threshold, document, tuition, or university policy. Unknown requirements must be framed as questions to check with the university. IELTS overall meeting a threshold does not prove section scores or admission eligibility. Self-assessed English is not an official result. SAT must not be described as universally required. A tuition estimate excludes fees and living costs. Scholarship availability does not mean an award. Avoid precise calendar dates or months unless supplied in program.deadline; write relative timing only. If a deadline in the program is null, state that it is unconfirmed. Do not add URLs or markdown. Return ONLY JSON exactly shaped as {"intro":"2-3 sentence personalized overview","priority":"single most urgent practical priority","stages":[{"id":"exact supplied ID","focus":"2-3 sentences personalized to this stage","extraActions":["one detailed action","another detailed action"],"checkpoint":"clear observable outcome"} for all eight IDs in order],"outro":"short final note about checking live university rules"}. Keep each field concise and factual.`},
    {role:'user',content:JSON.stringify(roadmapInput(profile,program,stages))}
   ]})
  });
  if(!response.ok)return Response.json({error:'AI unavailable'},{status:502,headers});
  const result=await response.json() as {choices?:{message?:{content?:string}}[]};
  const insight=parseAiRoadmap(JSON.parse(result.choices?.[0]?.message?.content||'null'));
  if(!insight)return Response.json({error:'Invalid AI response'},{status:502,headers});
  return Response.json({insight},{headers});
 }catch(error){console.warn('Roadmap analysis failed',error instanceof Error?error.name:'unknown');return Response.json({error:'AI unavailable'},{status:502,headers});}
}
