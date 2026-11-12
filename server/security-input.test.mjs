import test from 'node:test';
import assert from 'node:assert/strict';
import {finalizeFiles} from './project-files.mjs';
import {createTrackingHandler} from './tracking.mjs';
import {createPortalHandler} from './portal.mjs';
import {createProjectsHandler} from './projects.mjs';
import {DEFAULT_SETTINGS,validateSettings} from '../stitch_portal_de_extens_o_unicap/portal_de_extens_o_unicap/src/modules/settings/settingsLogic.js';
function fixture(manager=true){
 const documents=new Map([['users/user',{profile:manager?'gestor':'estudante'}],['submissions/project',{id:'project'}],['_tracking/project',{revision:0,participants:[{id:'p',userId:'user',active:false}]}]]);
 const db={
  collection(collection){
   return {doc(id){
    return {get:async()=>({exists:documents.has(`${collection}/${id}`),data:()=>documents.get(`${collection}/${id}`)})};
   }};
  }
 };
 const auth={verifyIdToken:async()=>({uid:'user'})};
 const response=()=>({code:200,setHeader(){},status(code){this.code=code;return this;},json(value){this.value=value;return this;}});
 return{db,auth,response};
}
test('malformed attachment entries are rejected before touching storage',async()=>{
 for(const entry of [null,false,123,[],{}])await assert.rejects(finalizeFiles({},'user','project',[entry]),error=>error.status===400);
});
test('non-string alternate email produces validation errors instead of throwing',()=>{
 for(const alternateEmail of [null,0,123,{},[]])assert.equal(validateSettings({...DEFAULT_SETTINGS,alternateEmail}).errors.alternateEmail,'Informe um e-mail válido, como nome@dominio.br.');
});
test('tracking rejects non-string participant email as a client error',async()=>{
 const{db,auth,response}=fixture();const res=response();await createTrackingHandler({db,auth})({method:'POST',headers:{authorization:'Bearer test'},body:{id:'project',action:'participant-save',participant:{email:123}}},res);assert.equal(res.code,400);
});
test('account settings reject non-string email as a client error',async()=>{
 const{db,auth,response}=fixture();const res=response();await createPortalHandler({db,auth})({method:'POST',headers:{authorization:'Bearer test'},query:{resource:'account'},body:{settings:{...DEFAULT_SETTINGS,alternateEmail:123}}},res);assert.equal(res.code,400);
});
test('inactive members cannot create attachment chunks',async()=>{
 const{db,auth,response}=fixture(false);const res=response();await createProjectsHandler({db,auth})({method:'POST',headers:{authorization:'Bearer test'},body:{id:'project',action:'upload',attachment:{id:'attachment-test',part:0,data:Buffer.from('test').toString('base64')}}},res);assert.equal(res.code,403);
});
