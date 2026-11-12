import {randomUUID} from 'node:crypto';
import {finalizeFiles,readFilePart} from './project-files.mjs';
import {deliverables} from '../stitch_portal_de_extens_o_unicap/portal_de_extens_o_unicap/src/modules/project-submission/data/submissionOptions.js';
const fail=(status,message)=>Object.assign(new Error(message),{status});
const validId=value=>typeof value==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(value);
const text=(value,label,max=200)=>{if(typeof value!=='string'||!value.trim()||value.length>max) throw fail(400,`${label}: preencha até ${max} caracteres.`);return value.trim();};
const date=value=>{if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const parsed=new Date(`${value}T12:00:00Z`);return Number.isFinite(parsed.getTime())&&parsed.toISOString().slice(0,10)===value;};
const number=(value,label,max=10000)=>{if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>max) throw fail(400,`${label}: informe um número entre 0 e ${max}.`);return value;};
export function initialTracking(project) {
  return {revision:0,config:{startDate:'',endDate:'',totalHours:0,monthlyHours:0,beneficiaries:0},
    participants:(project.submission?.teamMembers||[]).filter(m=>typeof m.name==='string'&&m.name.trim()&&['bolsista','voluntario'].includes(m.role)).slice(0,200).map((m,i)=>({id:`proposal-member-${i}`,name:m.name.trim(),email:m.email||'',mat:'',course:'',type:m.role==='bolsista'?'pbex':'voluntary',userId:null,active:true})),
    memberIds:[],frequency:{},milestones:[],reports:(project.submission?.selectedDeliverables||[]).map(value=>({id:`deliverable-${value}`,label:deliverables.find(d=>d.value===value)?.label||value,period:'',dueDate:'',detail:'',status:'pending',attachments:[],submittedBy:null}))};
}
export function trackingView(project,state,user,manager) {
  const own=state.participants.filter(p=>p.userId===user.uid);
  const ids=new Set(own.map(p=>p.id));
  return {project:{id:project.id,title:project.title,coordinator:project.coordinator,center:project.center,grant:project.grant,status:project.status,ods:project.submission?.ods||[],plan:project.submission?.timeline||'',activities:project.submission?.activities||''},
    tracking:manager?state:{...state,memberIds:[],participants:own,frequency:Object.fromEntries(Object.entries(state.frequency).map(([month,entries])=>[month,Object.fromEntries(Object.entries(entries).filter(([id])=>ids.has(id)))])),reports:state.reports.filter(r=>r.submittedBy===user.uid||(r.status==='pending'&&!r.submittedBy)).map(r=>r.submittedBy===user.uid?r:{id:r.id,label:r.label,period:r.period,dueDate:r.dueDate,status:'pending',detail:'',attachments:[],submittedBy:null})},canManage:manager};
}
export function createTrackingHandler({auth,db}) {
 return async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  try {
   if(!['GET','POST'].includes(req.method)) throw fail(405,'Método não permitido.');
   const token=/^Bearer (.+)$/.exec(req.headers.authorization||'')?.[1];if(!token) throw fail(401,'Entre na sua conta para continuar.');
   let user;try{user=await auth.verifyIdToken(token,true);}catch{throw fail(401,'Sua sessão expirou. Entre novamente.');}
   const profile=(await db.collection('users').doc(user.uid).get()).data();const manager=profile?.profile==='gestor';
   const body=req.body||{};const id=req.method==='GET'?req.query?.id:body.id;
   if(req.method==='GET'&&!id) {
    const fields=['title','coordinator','center','grant','status','submission.selectedDeliverables'];
    let projects,states;
    if(manager) {
     projects=(await db.collection('submissions').select(...fields).get()).docs;
     states=[];
     for(let offset=0;offset<projects.length;offset+=200)states.push(...await db.getAll(...projects.slice(offset,offset+200).map(p=>db.collection('_tracking').doc(p.id)),{fieldMask:['config','reports']}));
    } else {
     states=(await db.collection('_tracking').where('memberIds','array-contains',user.uid).select('config','reports').get()).docs;
     projects=[];
     for(let offset=0;offset<states.length;offset+=200)projects.push(...await db.getAll(...states.slice(offset,offset+200).map(p=>db.collection('submissions').doc(p.id)),{fieldMask:fields}));
    }
    const stateById=new Map(states.map(doc=>[doc.id,doc.data()]));
    const items=projects.filter(doc=>doc.exists&&doc.data().title).map(doc=>{
     const project=doc.data(),state=stateById.get(doc.id)||initialTracking(project);
     const reports=(state.reports||[]).filter(r=>manager||r.submittedBy===user.uid||(r.status==='pending'&&!r.submittedBy));
     return {id:doc.id,title:project.title,coordinator:project.coordinator||'',center:project.center||'',grant:project.grant||'',status:project.status||'',startDate:state.config?.startDate||'',endDate:state.config?.endDate||'',pendingReports:reports.filter(r=>['pending','changes_requested'].includes(r.status)).length,awaitingReview:reports.filter(r=>r.status==='received').length};
    });
    return res.json({items});
   }
   if(!validId(id)) throw fail(400,'Projeto inválido.');
   const projectRef=db.collection('submissions').doc(id);const ref=db.collection('_tracking').doc(id);
   const projectSnap=await projectRef.get();if(!projectSnap.exists) throw fail(404,'Projeto não encontrado.');
   const project={...projectSnap.data(),id};
   const snapshot=await ref.get();const state=snapshot.exists?snapshot.data():initialTracking(project);
   const member=state.participants.some(p=>p.userId===user.uid);
   if(!manager&&!member) throw fail(403,'Você não faz parte deste projeto.');
   if(req.method==='GET') {
    if(req.query.report&&req.query.attachment) {
     const report=state.reports.find(r=>r.id===req.query.report);if(!report||(!manager&&report.submittedBy!==user.uid)) throw fail(404,'Relatório não encontrado.');
     const file=report.attachments.find(a=>a.id===req.query.attachment);if(!file) throw fail(404,'Anexo não encontrado.');
     return res.json(await readFilePart(db,file,req.query.part));
    }
    return res.json(trackingView(project,state,user,manager));
   }
   if(!manager&&body.action!=='report-submit') throw fail(403,'Apenas gestores podem alterar o acompanhamento.');
   if(body.action==='participant-save'&&body.participant?.email!==undefined&&typeof body.participant.email!=='string') throw fail(400,'E-mail do participante inválido.');
   let linkedUid=null;
   if(body.action==='participant-save'&&body.participant?.email) {
    const email=body.participant.email.trim().toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw fail(400,'E-mail do participante inválido.');
    try {linkedUid=(await auth.getUserByEmail(email)).uid;} catch(error) {if(error.code!=='auth/user-not-found') throw error;}
   }
   const attachments=body.action==='report-submit'?await finalizeFiles(db,user.uid,id,body.attachments):[];
   const generatedId=randomUUID();const now=new Date().toISOString();let result;
   await db.runTransaction(async tx=>{
    const freshProject=await tx.get(projectRef);if(!freshProject.exists) throw fail(404,'Projeto não encontrado.');
    const fresh=await tx.get(ref);const current=fresh.exists?fresh.data():initialTracking(freshProject.data());
    if(!manager&&!current.participants.some(p=>p.userId===user.uid)) throw fail(403,'Você não faz parte deste projeto.');
    if(body.revision!==current.revision) throw fail(409,'O acompanhamento mudou em outra sessão. Recarregue antes de salvar.');
    const next=JSON.parse(JSON.stringify(current));
    if(body.action==='configure') {
     const c=body.config;
     if(!c||!date(c.startDate)||!date(c.endDate)||c.endDate<c.startDate||Number(c.endDate.slice(0,4))-Number(c.startDate.slice(0,4))>10) throw fail(400,'Informe uma vigência válida, de até 10 anos.');
     if(number(c.totalHours,'Carga horária total')<=0||number(c.monthlyHours,'Carga mensal',744)<=0) throw fail(400,'As cargas horárias devem ser maiores que zero.');
     next.config={startDate:c.startDate,endDate:c.endDate,totalHours:c.totalHours,monthlyHours:c.monthlyHours,beneficiaries:number(c.beneficiaries,'Beneficiários',10000000)};
    } else if(body.action==='participant-save') {
     const p=body.participant||{};if(next.participants.length>=200&&!p.id) throw fail(400,'Limite de 200 participantes por projeto.');
     if(p.id&&!next.participants.some(x=>x.id===p.id)) throw fail(404,'Participante não encontrado.');
     if(!['pbex','voluntary'].includes(p.type)) throw fail(400,'Escolha bolsista ou voluntário.');
     const value={id:p.id||generatedId,name:text(p.name,'Nome',120),email:p.email?.trim().toLowerCase()||'',mat:typeof p.mat==='string'?p.mat.slice(0,80):'',course:typeof p.course==='string'?p.course.slice(0,200):'',type:p.type,userId:linkedUid,active:true};
     const index=next.participants.findIndex(x=>x.id===value.id);
     if(linkedUid&&next.participants.some(x=>x.userId===linkedUid&&x.id!==value.id)) throw fail(400,'Esta conta já está vinculada ao projeto.');
     if(index<0) next.participants.push(value);else next.participants[index]=value;
    } else if(body.action==='participant-archive') {
     const participant=next.participants.find(p=>p.id===body.participantId);if(!participant) throw fail(404,'Participante não encontrado.');participant.active=false;
    } else if(body.action==='hours'||body.action==='homologate') {
     const month=body.month;if(typeof month!=='string'||!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw fail(400,'Competência inválida.');
     if(next.config.startDate&&(month<next.config.startDate.slice(0,7)||month>next.config.endDate.slice(0,7))) throw fail(400,'Competência fora da vigência do projeto.');
     next.frequency[month] ||= {};
     const ids=body.action==='hours'?[body.participantId]:body.participantIds;
     if(!Array.isArray(ids)||!ids.length||ids.length>200) throw fail(400,'Selecione os participantes.');
     for(const participantId of new Set(ids)) {
      if(!next.participants.some(p=>p.id===participantId&&p.active)) throw fail(400,'Participante inativo ou não encontrado.');
      if(body.action==='hours') {
       const hours=number(body.hours,'Horas do mês',744);
       next.frequency[month][participantId]={hours,status:hours>0?'pending':'missing',updatedAt:now,updatedBy:user.uid};
      } else {
       const record=next.frequency[month][participantId];
       if(!next.config.monthlyHours) throw fail(400,'Defina a carga horária mensal antes de homologar.');
       if(!record?.hours||record.hours>next.config.monthlyHours+2) throw fail(400,`Registre horas entre 0 e ${next.config.monthlyHours+2}h antes de homologar.`);
       next.frequency[month][participantId]={...record,status:'homologada',approvedAt:now,approvedBy:user.uid};
      }
     }
    } else if(body.action==='milestone-save') {
     const m=body.milestone||{};if(!date(m.date)||!['upcoming','current','completed'].includes(m.status)) throw fail(400,'Data ou situação do marco inválida.');
     if(next.milestones.length>=100&&!m.id) throw fail(400,'Limite de 100 marcos.');
     const value={id:m.id||generatedId,label:text(m.label,'Atividade',200),date:m.date,status:m.status,detail:typeof m.detail==='string'?m.detail.slice(0,4000):''};
     const index=next.milestones.findIndex(x=>x.id===value.id);if(m.id&&index<0) throw fail(404,'Marco não encontrado.');if(index<0) next.milestones.push(value);else next.milestones[index]=value;
    } else if(body.action==='report-submit') {
     const old=body.reportId?next.reports.find(r=>r.id===body.reportId):null;
     if(body.reportId&&!old) throw fail(404,'Relatório não encontrado.');
     if(old?.status==='approved') throw fail(409,'O relatório já foi aprovado. Envie uma nova versão como outro relatório.');
     if(!manager&&!current.participants.some(p=>p.userId===user.uid&&p.active)) throw fail(403,'Sua participação está inativa. Procure a gestão.');
     if(!manager&&old&&old.submittedBy!==user.uid&&!(old.status==='pending'&&!old.submittedBy)) throw fail(403,'Relatório não disponível para esta conta.');
     if(typeof body.detail!=='string'||body.detail.length>30000||(body.detail.trim().length<20&&!attachments.length)) throw fail(400,'Descreva o relatório com pelo menos 20 caracteres ou anexe um documento.');
     if(next.reports.length>=100&&!old) throw fail(400,'Limite de 100 relatórios.');
     const value={id:old?.id||generatedId,label:text(body.label||old?.label,'Título do relatório'),period:typeof body.period==='string'?body.period.slice(0,100):'',dueDate:old?.dueDate||'',detail:body.detail.trim(),attachments,status:'received',submittedBy:user.uid,submittedName:profile?.name||user.email,submittedAt:now,reviewComment:''};
     if(old) next.reports[next.reports.findIndex(r=>r.id===old.id)]=value;else next.reports.push(value);
    } else if(body.action==='report-task') {
     if(body.dueDate&&!date(body.dueDate)) throw fail(400,'Prazo inválido.');
     if(next.reports.length>=100) throw fail(400,'Limite de 100 relatórios.');
     next.reports.push({id:generatedId,label:text(body.label,'Título'),period:'',dueDate:body.dueDate||'',detail:'',status:'pending',attachments:[],submittedBy:null});
    } else if(body.action==='report-review') {
     const report=next.reports.find(r=>r.id===body.reportId);if(!report||report.status!=='received') throw fail(400,'Selecione um relatório recebido para emitir parecer.');
     if(!['approved','changes_requested'].includes(body.status)) throw fail(400,'Parecer inválido.');
     const comment=body.status==='changes_requested'?text(body.comment,'Motivo da devolução',4000):typeof body.comment==='string'?body.comment.slice(0,4000):'';
     Object.assign(report,{status:body.status,reviewComment:comment,reviewedBy:user.uid,reviewedAt:now});
    } else throw fail(400,'Ação desconhecida.');
    next.memberIds=[...new Set(next.participants.map(p=>p.userId).filter(Boolean))];next.revision=current.revision+1;next.updatedAt=now;next.updatedBy=user.uid;
    if(Buffer.byteLength(JSON.stringify(next))>850000) throw fail(400,'Este acompanhamento atingiu o limite de registros. Contate o suporte.');
    tx.set(ref,next);tx.update(projectRef,{pendingReports:next.reports.filter(r=>['pending','changes_requested'].includes(r.status)).length});tx.set(ref.collection('events').doc(randomUUID()),{action:body.action,actor:user.uid,at:now});
    result=trackingView(project,next,user,manager);
   });
   return res.json(result);
  }catch(error){if(!error.status) console.error('Tracking operation failed',{code:error.code||'unknown'});return res.status(error.status||503).json({error:error.status?error.message:'Não foi possível salvar o acompanhamento. Seus dados não foram confirmados; tente novamente.'});}
 };
}
