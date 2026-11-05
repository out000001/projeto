import assert from 'node:assert/strict';
import http from 'node:http';
import {createRequire} from 'node:module';
import {initializeApp,deleteApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {createProjectsHandler} from './projects.mjs';
import {createEmptySubmission} from '../stitch_portal_de_extens_o_unicap/portal_de_extens_o_unicap/src/modules/project-submission/data/submissionOptions.js';
const require=createRequire(new URL('../stitch_portal_de_extens_o_unicap/portal_de_extens_o_unicap/package.json',import.meta.url));
const {chromium}=require('@playwright/test');
if(!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Firestore emulator required');
const app=initializeApp({projectId:'demo-portal-unicap'},'browser-project-flow');const db=getFirestore(app);
// Identity is a test double; API/database/file operations below use the real code.
const handler=createProjectsHandler({auth:{verifyIdToken:async()=>({uid:'browser-manager',email:'manager@example.invalid'})},db});
const server=http.createServer(async(req,res)=>{
 try {
  const url=new URL(req.url,'http://127.0.0.1');res.status=code=>{res.statusCode=code;return res;};res.json=value=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(value));};
  if(url.pathname==='/catalogue') {const result=await db.collection('projects').get();return res.json({items:result.docs.map(d=>({...d.data(),id:d.id}))});}
  req.query=Object.fromEntries(url.searchParams);const chunks=[];for await(const chunk of req) chunks.push(chunk);req.body=chunks.length?JSON.parse(Buffer.concat(chunks).toString()):{};
  await handler(req,res);
 } catch(error) {res.statusCode=500;res.end(JSON.stringify({error:error.message}));}
});
await new Promise(resolve=>server.listen(3002,'127.0.0.1',resolve));
let browser;
try {
 await db.collection('users').doc('browser-manager').set({name:'Gestora de teste',profile:'gestor'});
 browser=await chromium.launch({args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:844},acceptDownloads:true});
 await page.route('**/src/services/api.js',route=>route.fulfill({contentType:'application/javascript',body:`export const observeSession=cb=>{queueMicrotask(()=>cb({user:{id:'browser-manager',name:'Gestora de teste',profile:'gestor'}}));return ()=>{};};export const loginRequest=async()=>{};export const logoutRequest=async()=>{};export const fetchProjects=async()=>(await fetch('/__catalogue')).json();`}));
 await page.route('**/src/services/firebase.js',route=>route.fulfill({contentType:'application/javascript',body:`export const auth={currentUser:{getIdToken:async()=>'browser-test-token'}};`}));
 await page.route('**/api/projects*',async route=>route.fulfill({response:await route.fetch({url:'http://127.0.0.1:3002'+new URL(route.request().url()).pathname+new URL(route.request().url()).search})}));
 await page.route('**/__catalogue',async route=>route.fulfill({response:await route.fetch({url:'http://127.0.0.1:3002/catalogue'})}));
 const form={...createEmptySubmission(),title:'Projeto real de teste no emulador',ods:['4'],socialJustification:'Proposta comunitária de teste com justificativa social detalhada e oficinas de cidadania.',bolsistas:1,expectedAudience:30,objectives:'Objetivos detalhados para atividades comunitárias.',activities:'Oficinas de cidadania com estudantes.',selectedDeliverables:['relatorio_final'],budget:[{category:'material',amount:200}],compliance:{cne:true,forproex:true,lgpd:true,autorizacao:true}};
 await page.addInitScript(form=>localStorage.setItem('unicap:submission-draft',JSON.stringify(form)),form);
 await page.goto('http://127.0.0.1:5173/submit');
 for(let step=0;step<4;step++) await page.getByRole('button',{name:'Continuar',exact:true}).click();
 await page.locator('input[type=file]').setInputFiles({name:'comprovante.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4\nPrivate document')});
 await page.getByRole('button',{name:'Continuar',exact:true}).click();
 await page.getByRole('button',{name:'Enviar proposta',exact:true}).click();
 await page.getByRole('heading',{name:'Proposta enviada com sucesso!'}).waitFor();
 const saved=await db.collection('submissions').get();assert.equal(saved.size,1);assert.equal(saved.docs[0].data().submission.attachments.length,1);
 await page.goto('http://127.0.0.1:5173/dashboard');
 await page.getByRole('button',{name:'Parecer',exact:true}).click();
 const downloading=page.waitForEvent('download');await page.getByRole('button',{name:'Baixar comprovante.pdf'}).click();const downloaded=await downloading;assert.equal(downloaded.suggestedFilename(),'comprovante.pdf');
 await page.getByLabel('Local / bairro').fill('Boa Vista');await page.getByLabel('Cursos / público participante').fill('Todos os cursos');await page.getByLabel('Carga horária').fill('40h');await page.getByLabel('Inscrições até').fill('2027-02-10');
 await page.getByRole('button',{name:'Publicar projeto',exact:true}).click();
 await page.getByRole('button',{name:'Detalhes',exact:true}).waitFor();
 assert.equal((await db.collection('projects').get()).size,1);
 await page.goto('http://127.0.0.1:5173/public');
 await page.getByRole('heading',{name:form.title,exact:true}).waitFor();
 console.log('PASS browser → real API → Firestore → manager reload → attachment download → publish → public catalogue');
 console.log('Public mobile horizontal overflow:',await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
} finally {
 if(browser) await browser.close();await new Promise(resolve=>server.close(resolve));
 for(const collection of ['submissions','projects','_projectFiles','users']) await db.recursiveDelete(db.collection(collection));
 await db.terminate();await deleteApp(app);
}
