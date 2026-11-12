import {finalizeFiles,readFilePart} from './project-files.mjs';
import { validateStep } from '../stitch_portal_de_extens_o_unicap/portal_de_extens_o_unicap/src/modules/project-submission/validation.js';
import { steps, editais, odsOptions, modalities, deliverables, teamRoles } from '../stitch_portal_de_extens_o_unicap/portal_de_extens_o_unicap/src/modules/project-submission/data/submissionOptions.js';
const validId = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(value);
const fail = (status, message) => Object.assign(new Error(message), { status });
export function validateSubmission(form) {
  if (!form || typeof form !== 'object' || JSON.stringify(form).length > 300000) throw fail(400, 'Proposta inválida ou muito extensa.');
  for (const field of ['title', 'center', 'modality', 'thematicLine', 'socialJustification', 'objectives', 'activities']) {
    if (typeof form[field] !== 'string' || form[field].length > (field === 'title' ? 300 : 20000)) throw fail(400, 'Revise os campos da proposta.');
  }
  for (const field of ['ods', 'selectedDeliverables', 'budget', 'teamMembers', 'attachments']) {
    if (!Array.isArray(form[field]) || form[field].length > (field === 'attachments' ? 5 : 100)) throw fail(400, 'Revise as listas da proposta.');
  }
  for (const field of ['bolsistas', 'voluntarios', 'expectedAudience']) {
    if (!Number.isInteger(Number(form[field])) || Number(form[field]) < 0 || Number(form[field]) > 1000000) throw fail(400, `${({bolsistas:'Bolsistas PIBEX',voluntarios:'Voluntários',expectedAudience:'Público Estimado'})[field]}: informe um número inteiro entre 0 e 1.000.000, sem vírgula ou ponto decimal.`);
  }
  if(!modalities.some(item=>item.value===form.modality)||form.ods.some(value=>!odsOptions.some(item=>item.value===value))||form.selectedDeliverables.some(value=>!deliverables.some(item=>item.value===value))) throw fail(400,'Selecione modalidades, ODS e entregáveis válidos.');
  if(form.teamMembers.some(member=>!member||typeof member.name!=='string'||member.name.length>120||typeof member.email!=='string'||member.email.length>254||!teamRoles.some(role=>role.value===member.role)||(member.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)))) throw fail(400,'Revise os nomes, e-mails e funções da equipe.');
  if(['timeline','partnerName'].some(key=>form[key]!==undefined&&(typeof form[key]!=='string'||form[key].length>20000))) throw fail(400,'Cronograma ou parceria inválidos.');
  if (form.budget.some(item => !item || typeof item.category!=='string' || !Number.isFinite(Number(item.amount)) || Number(item.amount) < 0 || Number(item.amount) > 1e9)) throw fail(400, 'Orçamento inválido.');
  if (!['cne','forproex','lgpd','autorizacao'].every(key => form.compliance?.[key] === true)) throw fail(400, 'Confirme os itens de conformidade.');
  for (const step of steps) {
    const validation = validateStep(step.id, form);
    if (!validation.ok) throw fail(400, Object.values(validation.errors)[0]);
  }
}
export function publicProject(project, info) {
  for (const field of ['local','courses','hours','deadline']) if (typeof info?.[field] !== 'string' || !info[field].trim() || info[field].length > 300) throw fail(400, 'Preencha local, cursos, carga horária e prazo de inscrição.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(info.deadline) || !Number.isFinite(Date.parse(info.deadline))) throw fail(400, 'Prazo inválido.');
  const f = project.submission;
  const spots = Number(f.bolsistas) + Number(f.voluntarios);
  return {
    title:f.title, shortDesc:f.socialJustification, description:f.socialJustification,
    area:f.thematicLine||project.thematicLine, modality:project.grant || editais.find(e=>e.value===f.edital)?.label || f.modality,
    local:info.local.trim(), courses:info.courses.trim(), hours:info.hours.trim(), deadline:info.deadline,
    ods:f.ods.map(value=>`ODS ${value} • ${odsOptions.find(o=>o.value===value)?.label || value}`),
    activities:f.activities.split('\n').filter(Boolean), partner:f.partnerName || 'Não informado',
    turnos:Array.isArray(info.turnos) ? info.turnos.filter(t=>["Manhã","Tarde","Noite","Sábados"].includes(t)) : [], spotsMax:spots, spotsLeft:spots, featured:false
  };
}
export function createProjectsHandler({auth,db}) {
  return async (req,res) => {
    res.setHeader('Cache-Control','no-store');
    try {
      if (!['GET','POST','PATCH'].includes(req.method)) throw fail(405,'Método não permitido.');
      const token = /^Bearer (.+)$/.exec(req.headers.authorization || '')?.[1];
      if (!token) throw fail(401,'Entre na sua conta para continuar.');
      let user;
      try { user = await auth.verifyIdToken(token, true); } catch { throw fail(401,'Sua sessão expirou. Entre novamente.'); }
      const profile = (await db.collection('users').doc(user.uid).get()).data();
      const manager = profile?.profile === 'gestor';
      const body = req.body || {};
      const id = req.method === 'GET' ? req.query?.id : body.id;
      if (req.method === 'GET' && !id) {
        if (!manager) throw fail(403,'Apenas gestores podem acessar o painel.');
        const snapshot = await db.collection('submissions').select('ownerId','coordinator','title','center','thematicLine','grant','status','published','impact','scholarships','volunteers','budget','spentBudget','pendingReports','semester','createdAt','publicInfo').get();
        return res.json({items:snapshot.docs.map(d=>({...d.data(),id:d.id}))});
      }
      if (!validId(id)) throw fail(400,'Identificador de proposta inválido.');
      const ref = db.collection('submissions').doc(id);
      if (req.method === 'GET') {
        const project = (await ref.get()).data();
        if (!project || (!manager && project.ownerId!==user.uid)) throw fail(404,'Proposta não encontrada.');
        if (req.query.details === '1') return res.json({item:{...project,id}});
        const file = project.submission.attachments.find(a=>a.id===req.query.attachment);
        if (!file) throw fail(404,'Anexo não encontrado.');
        return res.json(await readFilePart(db,file,req.query.part));
      }
      if (req.method === 'PATCH') {
        if (!manager) throw fail(403,'Apenas gestores podem publicar projetos.');
        await db.runTransaction(async tx=>{
          const snapshot = await tx.get(ref);
          if (!snapshot.exists) throw fail(404,'Proposta não encontrada.');
          if (body.action==='unpublish') {
            tx.delete(db.collection('projects').doc(id));
            tx.update(ref,{published:false,status:'analysis'});
          } else if (body.action==='publish') {
            const registrations=await tx.get(db.collection('_enrollments').where('projectId','==',id));
            const confirmed=registrations.docs.filter(entry=>entry.data().status==='confirmed').length;
            const catalogue=publicProject(snapshot.data(),body.info);
            catalogue.spotsLeft=Math.max(0,catalogue.spotsMax-confirmed);
            tx.set(db.collection('projects').doc(id),catalogue);
            tx.update(ref,{published:true,status:'active',publicInfo:body.info});
          } else throw fail(400,'Ação inválida.');
        });
        return res.json({ok:true});
      }
      if (body.action==='upload') {
        if(!manager) {
          const membership=(await db.collection('_tracking').doc(id).get()).data();
          if(!membership?.participants?.some(participant=>participant.userId===user.uid&&participant.active)) throw fail(403,'Sua participação está inativa ou você não faz parte deste projeto.');
        }
        const a=body.attachment;
        if (!validId(a?.id) || !Number.isInteger(a.part) || a.part<0 || a.part>=5 || typeof a.data!=='string' || a.data.length>2800000) throw fail(400,'Parte de anexo inválida.');
        const buffer=Buffer.from(a.data,'base64');
        if (!buffer.length || buffer.length>2*1024*1024) throw fail(400,'Anexo inválido.');
        const root=db.collection('_projectFiles').doc(`${user.uid}-${id}-${a.id}`);
        const shardSize=512*1024;
        const shards=Math.ceil(buffer.length/shardSize);
        await db.runTransaction(async tx=>{
          const existing=await tx.get(root);
          if(existing.data()?.sealed)throw fail(409,'Este anexo já foi enviado e não pode ser alterado. Envie um novo arquivo.');
          for(let i=0;i<shards;i++)tx.set(root.collection('data').doc(`${a.part}-${i}`),{base64:buffer.subarray(i*shardSize,(i+1)*shardSize).toString('base64')});
          tx.set(root.collection('segments').doc(String(a.part)),{size:buffer.length,shards});
          tx.set(root,{ownerId:user.uid,submissionId:id,createdAt:new Date().toISOString()},{merge:true});
        });
        return res.json({ok:true});
      }
      if(!manager) throw fail(403,'Apenas gestores podem cadastrar projetos.');
      validateSubmission(body.form);
      const existing=await ref.get();
      if (existing.exists) {
        if(existing.data().ownerId!==user.uid) throw fail(403,'Proposta não disponível.');
        return res.json({id,ok:true});
      }
      const attachments=await finalizeFiles(db,user.uid,id,body.form.attachments);
      const f={...body.form,attachments};
      const record={ownerId:user.uid,coordinator:profile?.name || user.email || 'Proponente',title:f.title,center:f.center,thematicLine:f.thematicLine,grant:editais.find(e=>e.value===f.edital)?.label || f.edital,status:'analysis',published:false,impact:Number(f.expectedAudience),scholarships:Number(f.bolsistas),volunteers:Number(f.voluntarios),budget:f.budget.reduce((sum,i)=>sum+Number(i.amount),0),spentBudget:0,pendingReports:0,semester:new Date().getFullYear()+'.'+(new Date().getMonth()<6?'1':'2'),createdAt:new Date().toISOString(),submission:f};
      await db.runTransaction(async tx=>{
        const old=await tx.get(ref);
        if(old.exists) {if(old.data().ownerId!==user.uid) throw fail(403,'Proposta não disponível.');return;}
        tx.create(ref,record);
      });
      return res.status(201).json({id,ok:true});
    } catch(error) {
      if(!error.status) console.error('Project operation failed',{code:error.code || 'unknown'});
      return res.status(error.status || 503).json({error:error.status?error.message:'Não foi possível salvar. Seu rascunho foi mantido. Tente novamente.'});
    }
  };
}
