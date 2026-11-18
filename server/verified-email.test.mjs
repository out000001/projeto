import test from 'node:test';import assert from 'node:assert/strict';
import {createProjectsHandler} from './projects.mjs';import {createTrackingHandler} from './tracking.mjs';import {createPortalHandler} from './portal.mjs';import {createEditaisHandler} from './editais.mjs';
for(const[title,factory]of [['projects',createProjectsHandler],['tracking',createTrackingHandler],['account',createPortalHandler],['editais',createEditaisHandler]]){
 test(`${title} denies an unverified token before accessing private data`,async()=>{
  const auth={verifyIdToken:async()=>({uid:'unverified',email_verified:false})};const db={collection(){throw new Error('Must not access database');}};
  const res={code:200,setHeader(){},status(code){this.code=code;return this;},json(body){this.body=body;}};
  await factory({auth,db})({method:'GET',headers:{authorization:'Bearer unverified'},query:{resource:'account'}},res);
  assert.equal(res.code,403);assert.match(res.body.error,/Confirme seu e-mail/);
 });
}
