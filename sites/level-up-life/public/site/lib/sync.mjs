import { emptyPlan,normalizePlan } from './plan.mjs';
export function createPlanSync({initial,apply,status,lock,fetcher=fetch,storage=localStorage}){
  const guestKey='level-up-life.planner.v1';let account=null,key=guestKey,revision=0,dirty=false,plan=initial,timer,saving=false,serial=0,conflict=null,loading=true,session=null;
  const read=k=>{try{return JSON.parse(storage.getItem(k));}catch{return null;}};
  const write=()=>{try{storage.setItem(key,account?JSON.stringify({plan,revision,dirty}):JSON.stringify(plan));return true;}catch{status({kind:'error',message:'This browser could not save a device backup. Export your plan now.'});return false;}};
  const announce=(kind,message)=>status({kind,message,account:!!account,session,conflict:!!conflict,hasGuest:!!read(guestKey)?.quests?.length});
  const set=p=>{plan=normalizePlan(p);apply(plan);};
  async function getRemote(){const r=await fetcher('/api/plan',{cache:'no-store',credentials:'same-origin'});if(!r.ok)throw Error(r.status===401?'Your session expired. Reopen the site to sign in.':'Could not load your account plan.');const data=await r.json();if(!Number.isSafeInteger(data.revision)||data.revision<0||data.revision>1e9)throw Error('Invalid saved revision');return{plan:data.plan?normalizePlan(data.plan):emptyPlan(),revision:data.revision};}
  async function saveRemote(){
    if(!account||loading||saving||!dirty||conflict)return;
    saving=true;const sent=serial,snapshot=structuredClone(plan),expected=revision;announce('saving','Saving your latest small wins…');
    try{const r=await fetcher('/api/plan',{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({plan:snapshot,revision:expected})});
      if(r.status===409){conflict=await getRemote();announce('conflict','Another device has changed this plan. Your device copy is safe. Export it or choose which version to keep.');return;}
      if(!r.ok)throw Error(r.status===401?'Your session expired. Reopen the site to sign in.':'Not saved online yet. Your changes are kept on this device; retry when connected.');
      const result=await r.json();if(result.revision!==expected+1)throw Error('Could not verify the save. Refresh from your account before retrying.');revision=result.revision;dirty=serial!==sent;write();announce(dirty?'saving':'saved',dirty?'Saving your latest changes…':'Saved to your account. Ready on your other devices.');
    }catch(error){announce('error',error.message);}finally{saving=false;if(dirty&&!conflict&&serial!==sent)timer=setTimeout(saveRemote,350);}
  }
  async function boot(){
    loading=true;lock(true);announce('loading','Checking your saved plan…');
    try{const r=await fetcher('/api/session',{cache:'no-store',credentials:'same-origin'});if(!r.ok)throw Error('Could not check your account. Your device plan is available.');session=await r.json();
      if(!session.user){account=null;key=guestKey;announce('local','Device-only plan. Sign in to save across devices.');return;}
      account=session.user.id;key=guestKey+'.account.'+account;const cached=read(key);let cachedPlan=null;try{cachedPlan=cached?normalizePlan(cached.plan):null;}catch{}
      if(cachedPlan){set(cachedPlan);revision=Number.isSafeInteger(cached.revision)?cached.revision:0;dirty=!!cached.dirty;}else{set(emptyPlan());revision=0;dirty=false;}
      const remote=await getRemote();
      if(dirty&&revision!==remote.revision){conflict=remote;announce('conflict','Another device has changed this plan. Your unsaved device copy is safe. Choose which version to keep.');}
      else if(dirty){announce('saving','Restoring your unsaved changes…');}
      else{revision=remote.revision;set(remote.plan);write();announce('saved',revision?'Saved to your account. Ready on your other devices.':'Your account plan is ready. Changes save automatically.');}
    }catch(error){announce('error',error.message+' Retry before relying on cross-device saving.');}finally{loading=false;lock(false);if(dirty&&!conflict)void saveRemote();}
  }
  return {
    boot,
    changed(next){plan=normalizePlan(next);serial++;dirty=!!account;write();if(account){announce('saving','Changes saved on this device. Saving to your account…');clearTimeout(timer);timer=setTimeout(saveRemote,450);}else announce('local','Saved on this device. Sign in to save across devices.');},
    async retry(){if(loading||saving)return;if(!account)return boot();try{const remote=await getRemote();if(dirty&&revision!==remote.revision){conflict=remote;announce('conflict','Another device changed this plan. Choose which version to keep.');return;}if(!dirty){revision=remote.revision;set(remote.plan);write();announce('saved','Up to date with your account.');}else await saveRemote();}catch(error){announce('error',error.message);}},
    async useRemote(){if(!conflict)return;set(conflict.plan);revision=conflict.revision;conflict=null;dirty=false;serial++;write();announce('saved','Loaded the saved account copy.');},
    async keepDevice(){if(!conflict)return;revision=conflict.revision;conflict=null;dirty=true;serial++;write();await saveRemote();},
    getGuest(){const value=read(guestKey);return value?normalizePlan(value):null;},
    isAccount:()=>!!account,
    pending:()=>dirty||saving,
  };
}
