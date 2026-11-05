import {randomUUID,createHash} from 'node:crypto';
import {DEFAULT_SETTINGS,validateSettings} from '../stitch_portal_de_extens_o_unicap/portal_de_extens_o_unicap/src/modules/settings/settingsLogic.js';
import {initialTracking} from './tracking.mjs';
import {createEmptySubmission} from '../stitch_portal_de_extens_o_unicap/portal_de_extens_o_unicap/src/modules/project-submission/data/submissionOptions.js';
const fail=(status,message)=>Object.assign(new Error(message),{status});
const validId=value=>typeof value==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(value);
const clean=(value,label,max=200)=>{if(typeof value!=='string'||!value.trim()||value.length>max)throw fail(400,`${label}: preencha até ${max} caracteres.`);return value.trim();};
const email=value=>typeof value==='string'&&value.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export function catalogueSubmission(p) {
 return {ownerId:null,source:'catalogue',title:p.title,coordinator:p.coordinator||'Responsável não cadastrado',center:p.center||'Não informado',thematicLine:p.area||'Extensão',grant:p.modality||'Não informado',status:'active',published:true,impact:0,scholarships:0,volunteers:0,budget:0,spentBudget:0,pendingReports:0,semester:'',createdAt:new Date().toISOString(),publicInfo:{local:p.local||'',courses:p.courses||'',hours:p.hours||'',deadline:p.deadline||'',turnos:p.turnos||[]},submission:{...createEmptySubmission(),title:p.title,thematicLine:p.area||'Extensão',bolsistas:0,voluntarios:Number(p.spotsMax)||0,ods:(p.ods||[]).map(value=>String(value).match(/\d+/)?.[0]).filter(Boolean),teamMembers:[],selectedDeliverables:[],attachments:[],socialJustification:p.description||p.shortDesc||'',objectives:'',activities:(p.activities||[]).join('\n'),timeline:'',partnerName:p.partner||''}};
}
async function noticesFor(db,user,manager,settings) {
 const snapshot=manager?await db.collection('_tracking').get():await db.collection('_tracking').where('memberIds','array-contains',user.uid).get();
 const now=Date.now(),day=86400000;const notices=[];let recent=0;
 for(const doc of snapshot.docs) {
  const state=doc.data();const project=(await db.collection('submissions').doc(doc.id).get()).data();if(!project)continue;
  const href=`/tracking?id=${encodeURIComponent(doc.id)}`;
  const own=new Set((state.participants||[]).filter(p=>p.userId===user.uid).map(p=>p.id));
  if(Date.parse(state.updatedAt)>now-7*day)recent++;
  if(settings.notifyDeadlines) for(const item of [...(state.milestones||[]),...(state.reports||[])]) {
   const due=item.dueDate||item.date;if(!due||['approved','completed'].includes(item.status))continue;
   if(!manager&&item.submittedBy&&item.submittedBy!==user.uid)continue;
   const days=Math.ceil((Date.parse(due+'T23:59:59Z')-now)/day);
   if(days<=settings.deadlineAlertDays&&days>=-30)notices.push({id:`due-${doc.id}-${item.id}`,label:`${project.title}: ${item.label} ${days<0?'está em atraso':days===0?'vence hoje':`vence em ${days} dias`}.`,href});
  }
  if(settings.notifyHomologacoes) {
   let pending=0,approved=0;
   for(const sheet of Object.values(state.frequency||{}))for(const[id,record]of Object.entries(sheet)) {
    if(manager&&record.status==='pending'&&record.hours>0)pending++;
    if(!manager&&own.has(id)&&record.status==='homologada'&&Date.parse(record.approvedAt)>now-7*day)approved++;
   }
   const reviews=(state.reports||[]).filter(report=>report.status==='received').length;
   if(manager&&reviews)notices.push({id:`reviews-${doc.id}`,label:`${project.title}: ${reviews} relatório(s) aguardando parecer.`,href});
   if(!manager)for(const report of state.reports||[])if(report.submittedBy===user.uid&&['approved','changes_requested'].includes(report.status)&&Date.parse(report.reviewedAt)>now-7*day)notices.push({id:`review-${doc.id}-${report.id}`,label:`${project.title}: ${report.label} ${report.status==='approved'?'foi aprovado':'recebeu pedido de ajustes'}.`,href});
   if(pending)notices.push({id:`pending-${doc.id}`,label:`${project.title}: ${pending} folha(s) aguardando homologação.`,href});
   if(approved)notices.push({id:`approved-${doc.id}`,label:`${project.title}: ${approved} folha(s) sua(s) homologada(s) na última semana.`,href});
  }
 }
 if(settings.weeklyDigest&&recent)notices.push({id:'weekly',label:`Resumo dos últimos 7 dias: ${recent} projeto(s) com atualizações.`,href:'/tracking'});
 if(manager&&settings.notifyEditais) {
  const pending=await db.collection('submissions').where('status','==','analysis').select('title').get();
  if(pending.size)notices.push({id:'proposals',label:`${pending.size} proposta(s) aguardando análise.`,href:'/dashboard'});
 }
 return notices.slice(0,30);
}
export function createPortalHandler({auth,db}) {
 return async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  try {
   const resource=req.query?.resource,body=req.body||{};
   if(resource==='partnerships'&&req.method==='POST') {
    const name=clean(body.name,'Organização',200),type=clean(body.type,'Tipo de organização',100),message=clean(body.message,'Proposta',10000);
    if(!email(body.email))throw fail(400,'Informe um e-mail válido para contato.');
    const ip=req.headers['x-vercel-forwarded-for']||req.socket?.remoteAddress||'unknown';
    const limiter=db.collection('_partnershipLimits').doc(createHash('sha256').update(String(ip)).digest('hex'));
    await db.runTransaction(async tx=>{const data=(await tx.get(limiter)).data();const now=Date.now();const current=data?.expiresAt>now?data:{count:0,expiresAt:now+900000};if(current.count>=5)throw fail(429,'Muitas solicitações. Aguarde 15 minutos.');tx.set(limiter,{...current,count:current.count+1});});
    const id=validId(body.requestId)&&body.requestId.length>=10?body.requestId:randomUUID();
    const requestHash=createHash('sha256').update(JSON.stringify({name,type,email:body.email.trim(),message})).digest('hex');
    const ref=db.collection('_partnerships').doc(id);
    await db.runTransaction(async tx=>{const old=await tx.get(ref);if(old.exists){if(old.data().requestHash!==requestHash)throw fail(409,'Esta solicitação já foi salva com outros dados. Reabra o formulário para enviar uma nova proposta.');return;}tx.create(ref,{name,type,email:body.email.trim(),message,status:'new',createdAt:new Date().toISOString(),notes:'',requestHash});});
    return res.status(201).json({ok:true,id});
   }
   const token=/^Bearer (.+)$/.exec(req.headers.authorization||'')?.[1];if(!token)throw fail(401,'Entre na sua conta para continuar.');
   let user;try{user=await auth.verifyIdToken(token,true);}catch{throw fail(401,'Sua sessão expirou. Entre novamente.');}
   const profileRef=db.collection('users').doc(user.uid);const profile=(await profileRef.get()).data()||{};const manager=profile.profile==='gestor';
   if(resource==='account') {
    const settings={...DEFAULT_SETTINGS,...(profile.settings||{})};
    if(req.method==='GET') return res.json({settings,name:profile.name||user.name||user.email,email:user.email,syncedAt:profile.settingsUpdatedAt||profile.createdAt||null,notices:req.query.notifications==='1'?await noticesFor(db,user,manager,settings):[]});
    if(req.method!=='POST')throw fail(405,'Método não permitido.');
    const next=body.reset?{...DEFAULT_SETTINGS}:Object.fromEntries(Object.keys(DEFAULT_SETTINGS).map(key=>[key,body.settings?.[key]]));
    if(typeof next.displayName!=='string'||next.displayName.length>120||!validateSettings(next).ok)throw fail(400,'Revise os dados das configurações.');
    next.displayName=next.displayName.trim();next.alternateEmail=next.alternateEmail.trim();
    const officialName=profile.institutionalName||profile.name||user.name||user.email;
    const now=new Date().toISOString();
    await profileRef.set({settings:next,settingsUpdatedAt:now,institutionalName:officialName,name:next.displayName||officialName},{merge:true});
    return res.json({ok:true,settings:next,savedAt:now});
   }
   if(resource==='partnerships') {
    if(!manager)throw fail(403,'Apenas gestores podem consultar parcerias.');
    if(req.method==='GET'){const snapshot=await db.collection('_partnerships').get();return res.json({items:snapshot.docs.map(d=>({...d.data(),id:d.id}))});}
    if(req.method==='PATCH') {
     if(!validId(body.id)||!['new','contacted','closed'].includes(body.status)||typeof body.notes!=='string'||body.notes.length>4000)throw fail(400,'Dados da parceria inválidos.');
     await db.collection('_partnerships').doc(body.id).update({status:body.status,notes:body.notes,updatedBy:user.uid,updatedAt:new Date().toISOString()});return res.json({ok:true});
    }
   }
   if(resource==='enrollments') {
    if(req.method==='GET'){const query=manager&&validId(req.query.projectId)?db.collection('_enrollments').where('projectId','==',req.query.projectId):db.collection('_enrollments').where('userId','==',user.uid);const snapshot=await query.get();return res.json({items:snapshot.docs.map(d=>({...d.data(),id:d.id}))});}
    if(req.method!=='POST'||!validId(body.projectId))throw fail(400,'Projeto inválido.');
    if(!['enroll','cancel','promote'].includes(body.action||'enroll'))throw fail(400,'Ação inválida.');
    if(body.action==='promote'&&(!manager||!validId(body.userId)))throw fail(403,'Apenas gestores podem confirmar a lista de espera.');
    const subject=body.action==='promote'?body.userId:user.uid;
    const id=body.projectId;const ref=db.collection('_enrollments').doc(`${id}_${subject}`);const publicRef=db.collection('projects').doc(id);const projectRef=db.collection('submissions').doc(id);const trackingRef=db.collection('_tracking').doc(id);let result;
    await db.runTransaction(async tx=>{
     const publicSnapshot=await tx.get(publicRef);const existing=await tx.get(ref);const projectSnapshot=await tx.get(projectRef);const trackingSnapshot=await tx.get(trackingRef);
     const old=existing.data();
     if(body.action==='cancel') {
      if(!old||old.status==='cancelled'){result={status:'cancelled'};return;}
      if(old.status==='confirmed'&&publicSnapshot.exists)tx.update(publicRef,{spotsLeft:Math.min(Number(publicSnapshot.data().spotsMax)||0,(Number(publicSnapshot.data().spotsLeft)||0)+1)});
      tx.update(ref,{status:'cancelled',updatedAt:new Date().toISOString()});
      if(trackingSnapshot.exists){const state=trackingSnapshot.data();tx.update(trackingRef,{participants:state.participants.map(p=>p.userId===user.uid?{...p,active:false}:p),revision:state.revision+1});}
      result={status:'cancelled'};return;
     }
     if(body.action==='promote'){if(!old||old.status!=='waitlist')throw fail(400,'Esta inscrição não está na lista de espera.');}
     else if(old&&old.status!=='cancelled'){result=old;return;}
     if(!publicSnapshot.exists)throw fail(404,'Este projeto não está disponível para inscrição.');
     const p=publicSnapshot.data();
     if(body.action!=='promote'&&p.deadline&&p.deadline<new Date().toLocaleDateString('en-CA',{timeZone:'America/Sao_Paulo'}))throw fail(400,'O prazo de inscrição deste projeto terminou.');
     const available=Number(p.spotsLeft);if(!Number.isInteger(available)||available<0)throw fail(400,'As vagas deste projeto precisam ser revisadas pela gestão.');
     if(body.action==='promote'&&available<=0)throw fail(409,'Não há vaga disponível para confirmar esta inscrição.');
     const status=available>0?'confirmed':'waitlist';const name=body.action==='promote'?old.name:profile.name||user.name||user.email;
     const contactEmail=body.action==='promote'?old.email:user.email;
     const record={projectId:id,projectTitle:p.title,userId:subject,name,email:contactEmail,status,createdAt:old?.createdAt||new Date().toISOString()};
     tx.set(ref,record);
     if(status==='confirmed') {
      const project=projectSnapshot.exists?projectSnapshot.data():catalogueSubmission(p);
      if(!projectSnapshot.exists)tx.create(projectRef,project);
      const state=trackingSnapshot.exists?trackingSnapshot.data():initialTracking(project);
      if(!state.participants.some(member=>member.userId===subject)) {
       if(state.participants.length>=200)throw fail(400,'O projeto atingiu o limite de participantes. Contate a gestão.');
       state.participants.push({id:`enrolled-${subject}`,userId:subject,name,email:contactEmail,mat:'',course:profile.course||'',type:'voluntary',active:true});
      } else state.participants=state.participants.map(member=>member.userId===subject?{...member,active:true}:member);
      state.memberIds=[...new Set(state.participants.map(member=>member.userId).filter(Boolean))];state.revision++;state.updatedAt=new Date().toISOString();tx.set(trackingRef,state);
      tx.update(publicRef,{spotsLeft:available-1});
     }
     result=record;
    });
    return res.json({ok:true,enrollment:result});
   }
   throw fail(404,'Operação não encontrada.');
  }catch(error){if(!error.status)console.error('Portal operation failed',{code:error.code||'unknown'});return res.status(error.status||503).json({error:error.status?error.message:'Não foi possível concluir a operação. Tente novamente.'});}
 };
}
