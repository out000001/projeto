import test from 'node:test';import assert from 'node:assert/strict';import{createEditaisHandler}from'./editais.mjs';
function fixture(){
 const data=new Map([['users/manager',{profile:'gestor'}],['users/student',{profile:'estudante'}]]);
 const doc=path=>({path,collection:name=>collection(`${path}/${name}`),get:async()=>({exists:data.has(path),data:()=>data.get(path)})});
 const collection=path=>({doc:id=>doc(`${path}/${id}`),get:async()=>({docs:[...data].filter(([key])=>key.startsWith(path+'/')&&key.split('/').length===path.split('/').length+1).map(([key,value])=>({id:key.split('/').at(-1),data:()=>value}))})});
 const tx={get:ref=>ref.get(),set:(ref,value,options)=>data.set(ref.path,options?.merge?{...data.get(ref.path),...value}:value),create:(ref,value)=>{assert.equal(data.has(ref.path),false);data.set(ref.path,value);}};
 const db={collection,runTransaction:async fn=>fn(tx)},auth={verifyIdToken:async uid=>({uid,email_verified:true})},handler=createEditaisHandler({auth,db});
 async function request(user,method='GET',body={},query={}){const res={code:200,setHeader(){},status(code){this.code=code;return this;},json(value){this.value=value;}};await handler({method,body,query,headers:user?{authorization:'Bearer '+user}:{}},res);return res;}
 return{request,data};
}
test('editais require authentication and only managers may upload',async()=>{const{request}=fixture();assert.equal((await request(null)).code,401);assert.equal((await request('student','POST',{id:'edital-test',action:'upload'})).code,403);});
test('manager publishes a validated PDF and students can list and download unchanged bytes',async()=>{
 const{request}=fixture(),id='edital-test',fileId='pdf-file-unique',pdf=Buffer.from('%PDF-1.4\nEdital PIBIC\n%%EOF');
 assert.equal((await request('manager','POST',{id,action:'upload',attachment:{id:fileId,part:0,data:pdf.toString('base64')}})).code,200);
 const created=await request('manager','POST',{id,title:'Edital PIBIC de teste',file:{id:fileId,name:'edital.pdf',type:'application/pdf',parts:1,size:pdf.length}});assert.equal(created.code,201);
 const list=await request('student');assert.equal(list.value.items[0].title,'Edital PIBIC de teste');assert.equal(list.value.items[0].file.storageId,undefined);
 const read=await request('student','GET',{}, {id,part:'0'});assert.deepEqual(Buffer.from(read.value.data,'base64'),pdf);
 const overwrite=await request('manager','POST',{id,action:'upload',attachment:{id:fileId,part:0,data:pdf.toString('base64')}});assert.equal(overwrite.code,409);
});
test('a renamed non-PDF is rejected by content signature',async()=>{const{request}=fixture(),id='invalid-edital',fileId='fake-file-unique',pdf=Buffer.from('not a PDF');await request('manager','POST',{id,action:'upload',attachment:{id:fileId,part:0,data:pdf.toString('base64')}});const result=await request('manager','POST',{id,title:'Edital incorreto',file:{id:fileId,name:'fake.pdf',type:'application/pdf',parts:1,size:pdf.length}});assert.equal(result.code,400);});
