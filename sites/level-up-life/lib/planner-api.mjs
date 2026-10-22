import { normalizePlan } from '../public/site/lib/plan.mjs';
const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, private','Vary':'Cookie','X-Content-Type-Options':'nosniff'};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
export async function plannerAPI(request,db,userId){
  if(!userId)return json({error:'Sign in to save your plan.'},401);
  if(!['GET','PUT'].includes(request.method))return json({error:'Method not allowed'},405);
  if(!db)return json({error:'Saving is temporarily unavailable. Your device copy is safe.'},503);
  if(request.method==='PUT'){
    if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Invalid request origin'},403);
    if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'JSON required'},415);
    if(Number(request.headers.get('content-length'))>400000)return json({error:'Plan is too large'},413);
  }
  try{
    if(request.method==='GET'){
      const row=await db.prepare('SELECT payload, revision FROM planner_account_state WHERE owner_id = ?').bind(userId).first();
      return json({plan:row?normalizePlan(JSON.parse(row.payload)):null,revision:row?.revision??0});
    }
    const raw=await request.text();if(raw.length>400000)return json({error:'Plan is too large'},413);
    let body,plan;try{body=JSON.parse(raw);plan=normalizePlan(body.plan);}catch{return json({error:'Invalid plan. Export your device copy before trying a restore.'},400);}
    if(!Number.isSafeInteger(body.revision)||body.revision<0||body.revision>1e9)return json({error:'Invalid revision'},400);
    // The owner ID comes exclusively from the authenticated request, never the submitted document.
    // Each write checks the expected revision atomically inside SQLite.
    const updated=body.revision===0
      ? await db.prepare('INSERT INTO planner_account_state (owner_id, payload, revision, updated_at) VALUES (?, ?, 1, ?) ON CONFLICT(owner_id) DO NOTHING RETURNING revision').bind(userId,JSON.stringify(plan),new Date().toISOString()).first()
      : await db.prepare('UPDATE planner_account_state SET payload = ?, revision = revision + 1, updated_at = ? WHERE owner_id = ? AND revision = ? RETURNING revision').bind(JSON.stringify(plan),new Date().toISOString(),userId,body.revision).first();
    if(!updated)return json({error:'Your plan changed on another device. Choose which copy to keep.',conflict:true},409);
    return json({revision:updated.revision});
  }catch{return json({error:'Saving is temporarily unavailable. Your device copy is safe.'},503);}
}
