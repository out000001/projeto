import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {initializeApp,deleteApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {createProjectsHandler} from './projects.mjs';
import {createEmptySubmission} from '../stitch_portal_de_extens_o_unicap/portal_de_extens_o_unicap/src/modules/project-submission/data/submissionOptions.js';
const require=createRequire(new URL('../stitch_portal_de_extens_o_unicap/portal_de_extens_o_unicap/package.json',import.meta.url));
const {initializeTestEnvironment,assertFails}=require('@firebase/rules-unit-testing');
const {collection,getDocs}=require('firebase/firestore');
if(!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Emulator required; refusing production access');
const projectId='demo-portal-unicap';
const app=initializeApp({projectId},'project-persistence-test');
const db=getFirestore(app);
const environment=await initializeTestEnvironment({projectId,firestore:{host:'127.0.0.1',port:8080,rules:await readFile(new URL('../stitch_portal_de_extens_o_unicap/portal_de_extens_o_unicap/firestore.rules',import.meta.url),'utf8')}});
const auth={verifyIdToken:async uid=>({uid,email:`${uid}@example.invalid`})};
async function request(actor,method,body={},query={}) {
 const handler=createProjectsHandler({auth,db});
 const res={code:200,setHeader(){},status(code){this.code=code;return this;},json(value){this.value=value;return this;}};
 await handler({method,body,query,headers:{authorization:`Bearer ${actor}`}},res);return res;
}
try {
 await environment.clearFirestore();
 await db.collection('users').doc('manager').set({profile:'gestor',name:'Gestora'});
 await db.collection('users').doc('student').set({profile:'estudante',name:'Estudante'});
 const id='integration-project-12345';const fileId='integration-file-12345';
 const bytes=Buffer.from('%PDF-1.4\nPrivate attachment');
 assert.equal((await request('student','POST',{id,action:'upload',attachment:{id:fileId,part:0,data:bytes.toString('base64')}})).code,200);
 const form={...createEmptySubmission(),title:'Projeto persistente de integração',ods:['4'],socialJustification:'Proposta de integração com justificativa social suficientemente detalhada para validação.',bolsistas:1,expectedAudience:30,objectives:'Objetivos detalhados para a comunidade.',activities:'Oficinas e atividades de integração.',selectedDeliverables:['relatorio_final'],budget:[{category:'material',amount:200}],attachments:[{id:fileId,name:'document.pdf',type:'application/pdf',parts:1,size:bytes.length}],compliance:{cne:true,forproex:true,lgpd:true,autorizacao:true}};
 assert.equal((await request('student','POST',{id,form})).code,201);
 const listed=await request('manager','GET');assert.equal(listed.value.items[0].id,id);
 assert.equal((await db.collection('projects').get()).size,0);
 const info={local:'Boa Vista',courses:'Todos os cursos',hours:'20h',deadline:'2027-02-10'};
 assert.equal((await request('student','PATCH',{id,action:'publish',info})).code,403);
 assert.equal((await request('manager','PATCH',{id,action:'publish',info})).code,200);
 const guest=environment.unauthenticatedContext().firestore();
 const catalogue=await getDocs(collection(guest,'projects'));
 assert.equal(catalogue.size,1);assert.equal(catalogue.docs[0].data().title,form.title);
 assert.equal('teamMembers' in catalogue.docs[0].data(),false);
 await assertFails(getDocs(collection(guest,'submissions')));
 await assertFails(getDocs(collection(guest,'_projectFiles')));
 const download=await request('manager','GET',{}, {id,attachment:fileId,part:'0'});
 assert.deepEqual(Buffer.from(download.value.data,'base64'),bytes);
 assert.equal((await request('other-student','GET',{}, {id,attachment:fileId,part:'0'})).code,404);
 assert.equal((await request('manager','PATCH',{id,action:'unpublish'})).code,200);
 assert.equal((await getDocs(collection(guest,'projects'))).size,0);
 console.log('PASS: persisted submission → fresh manager request → publication → public catalogue; private attachments and access controls verified');
} finally {await environment.clearFirestore();await environment.cleanup();await db.terminate();await deleteApp(app);}
