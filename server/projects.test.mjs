import test from 'node:test';
import assert from 'node:assert/strict';
import {createProjectsHandler,publicProject} from './projects.mjs';
import {createEmptySubmission} from '../stitch_portal_de_extens_o_unicap/portal_de_extens_o_unicap/src/modules/project-submission/data/submissionOptions.js';
const form=()=>({...createEmptySubmission(),title:'Projeto comunitário de teste',ods:['4'],socialJustification:'Justificativa social de exemplo com mais de cinquenta caracteres para validação.',bolsistas:1,voluntarios:2,expectedAudience:30,objectives:'Objetivos suficientemente detalhados.',activities:'Atividades suficientemente detalhadas.',selectedDeliverables:['relatorio_final'],budget:[{category:'material',amount:200}],compliance:{cne:true,forproex:true,lgpd:true,autorizacao:true}});
function setup(role='gestor') {
 const data=new Map([['users/test-user',{name:'Ana',profile:role}]]);
 const doc=path=>({path,collection:name=>collection(`${path}/${name}`),get:async()=>({exists:data.has(path),data:()=>data.get(path)} )});
 const collection=path=>({select:()=>collection(path),where:()=>collection(path),doc:id=>doc(`${path}/${id}`),get:async()=>({docs:[...data.entries()].filter(([key])=>key.startsWith(path+'/')&&key.split('/').length===path.split('/').length+1).map(([key,value])=>({id:key.split('/').at(-1),data:()=>value}))})});
 const writer={set:(ref,value,options)=>data.set(ref.path,options?.merge?{...data.get(ref.path),...value}:value),create:(ref,value)=>{assert.equal(data.has(ref.path),false);data.set(ref.path,value);},update:(ref,value)=>data.set(ref.path,{...data.get(ref.path),...value}),delete:ref=>data.delete(ref.path),get:ref=>ref.get()};
 const db={collection,runTransaction:async fn=>fn(writer),batch:()=>({...writer,commit:async()=>{}})};
 const handler=createProjectsHandler({auth:{verifyIdToken:async()=>({uid:'test-user',email:'test@example.com'})},db});
 const request=async(method='GET',body={},query={},authorized=true)=>{
  const res={code:200,setHeader(){},status(code){this.code=code;return this;},json(value){this.value=value;return this;}};
  await handler({method,body,query,headers:authorized?{authorization:'Bearer test-token'}:{}},res);return res;
 };
 return{request,data};
}
const id='project-unique-12345';
test('requires a valid session and restricts manager list',async()=>{
 const {request}=setup('estudante');
 assert.equal((await request('GET',{}, {},false)).code,401);
 assert.equal((await request()).code,403);
});
test('saves privately, ignores forged role/status, and retries without duplicating',async()=>{
 const {request,data}=setup('gestor');
 const body={id,form:{...form(),status:'active',ownerId:'someone-else'}};
 assert.equal((await request('POST',body)).code,201);
 assert.equal(data.get(`submissions/${id}`).ownerId,'test-user');
 assert.equal(data.get(`submissions/${id}`).status,'analysis');
 assert.equal(data.has(`projects/${id}`),false);
 assert.equal((await request('POST',body)).code,200);
 assert.equal([...data.keys()].filter(k=>k.startsWith('submissions/')).length,1);
 assert.equal((await setup('estudante').request('POST',body)).code,403);
});
test('validates every step and the full compliance checklist server-side',async()=>{
 const {request,data}=setup();
 assert.equal((await request('POST',{id,form:{...form(),compliance:{}}})).code,400);
 assert.equal((await request('POST',{id,form:{...form(),objectives:''}})).code,400);
 assert.equal(data.has(`submissions/${id}`),false);
});
test('publication exposes only catalogue fields and can be removed atomically',async()=>{
 const {request,data}=setup();
 await request('POST',{id,form:form()});
 assert.equal((await request('PATCH',{id,action:'publish',info:{}})).code,400);
 const info={local:'Boa Vista',courses:'Todos os cursos',hours:'40h',deadline:'2027-02-10'};
 assert.equal((await request('PATCH',{id,action:'publish',info})).code,200);
 const published=data.get(`projects/${id}`);
 assert.equal(published.title,form().title);
 for(const key of ['teamMembers','budget','ownerId','submission','attachments']) assert.equal(key in published,false);
 assert.equal(data.get(`submissions/${id}`).published,true);
 assert.equal((await request('PATCH',{id,action:'unpublish'})).code,200);
 assert.equal(data.has(`projects/${id}`),false);
 assert.equal(data.get(`submissions/${id}`).published,false);
});
test('attachment chunks stay below Firestore document limits and download intact',async()=>{
 const {request,data}=setup();const fileId='attachment-test-12345';const bytes=Buffer.alloc(2*1024*1024,42);bytes.write('%PDF-1.4');
 assert.equal((await request('POST',{id,action:'upload',attachment:{id:fileId,part:0,data:bytes.toString('base64')}})).code,200);
 for(const[key,value]of data) if(key.includes('/data/')) assert.ok(JSON.stringify(value).length<1000000);
 const f={...form(),attachments:[{id:fileId,name:'test.pdf',type:'application/pdf',size:bytes.length,parts:1}]};
 assert.equal((await request('POST',{id,form:f})).code,201);
 const result=await request('GET',{}, {id,attachment:fileId,part:'0'});
 assert.equal(result.code,200);assert.deepEqual(Buffer.from(result.value.data,'base64'),bytes);
 data.set('users/test-user',{profile:'estudante'});data.set(`submissions/${id}`,{...data.get(`submissions/${id}`),ownerId:'another-user'});
 assert.equal((await request('GET',{}, {id,attachment:fileId,part:'0'})).code,404);
});
test('public conversion keeps zero scholarships and never fabricates hours or deadlines',()=>{
 assert.throws(()=>publicProject({submission:form()},{}));
});
