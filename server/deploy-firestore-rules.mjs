import {readFile} from 'node:fs/promises';
import {getSecurityRules} from 'firebase-admin/security-rules';
import {services} from './firebase-admin.mjs';

// Run only as part of the authorized production release. Never print credentials.
if(process.env.VERCEL_ENV==='production'){
 services();
 const source=await readFile(new URL('../stitch_portal_de_extens_o_unicap/portal_de_extens_o_unicap/firestore.rules',import.meta.url),'utf8');
 const rules=getSecurityRules();
 try{
  const current=await rules.getFirestoreRuleset();
  if(current.source.some(file=>file.content===source))console.log('Firestore rules already match the reviewed release.');
  else{await rules.releaseFirestoreRulesetFromSource(source);console.log('Firestore verification rules released for portaldeextensaocomunitaria.');}
 }catch(error){console.error('Firestore rules release failed',{code:error.code||'unknown'});process.exitCode=1;}
}
