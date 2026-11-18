import {readFile} from 'node:fs/promises';
import {getApp} from 'firebase-admin/app';
import {services} from './firebase-admin.mjs';
import {AUTH_CONFIG_URL,emailTemplatePatch,emailTemplatesMatch,singleTemplateUpdate} from './auth-email-config.mjs';

// Reviewed project-specific production configuration. Credentials remain in memory.
if(process.env.VERCEL_ENV==='production'){
 try{
  services();
  const config=JSON.parse(await readFile(new URL('../config/auth-emails/templates.json',import.meta.url),'utf8'));
  const html=await readFile(new URL('../config/auth-emails/reset-password.html',import.meta.url),'utf8');
  const{body,mask}=emailTemplatePatch(config,html);
  const credential=getApp().options.credential;
  const {access_token:accessToken}=await credential.getAccessToken();
  const fields='notification(defaultLocale,sendEmail(verifyEmailTemplate(senderLocalPart,senderDisplayName,replyTo,subject,body,bodyFormat),resetPasswordTemplate(senderDisplayName,subject,body,bodyFormat),changeEmailTemplate(senderLocalPart,senderDisplayName,replyTo,subject,body,bodyFormat),revertSecondFactorAdditionTemplate(senderLocalPart,senderDisplayName,replyTo,subject,body,bodyFormat)))';
  const base=AUTH_CONFIG_URL;
  async function request(method,payload,fieldMask=mask,label='config'){
   const query=new URLSearchParams({fields,...(method==='PATCH'?{updateMask:fieldMask.join(',')}:{})});
   const response=await fetch(`${base}?${query}`,{method,headers:{Authorization:`Bearer ${accessToken}`,...(payload?{'Content-Type':'application/json'}:{})},...(payload?{body:JSON.stringify(payload)}:{}),signal:AbortSignal.timeout(30000)});
   const result=await response.json();
   if(!response.ok){
    // Only configuration validation text is logged; never request headers or configuration values.
    const detail=response.status===400?String(result.error?.message||'').replace(/Bearer\s+\S+/gi,'[redacted]').replace(/ya29\.[A-Za-z0-9._-]+/g,'[redacted]').slice(0,400):'';
    throw new Error(`Firebase email configuration: HTTP ${response.status} (${method}/${label}: ${result.error?.status||'unknown'}) ${detail}`);
   }
   return result;
  }
  let current=await request('GET');
  if(emailTemplatesMatch(current,body))console.log('Firebase auth email templates already match UNICAP branding.');
  else{
   if(current.notification?.defaultLocale!=='pt-BR'){
    await request('PATCH',{notification:{defaultLocale:'pt-BR'}},['notification.defaultLocale'],'locale');
    current=await request('GET');
   }
   for(const name of Object.keys(body.notification.sendEmail)){
    const fieldsMatch=Object.entries(body.notification.sendEmail[name]).every(([key,value])=>current.notification?.sendEmail?.[name]?.[key]===value);
    if(fieldsMatch)continue;
    const update=singleTemplateUpdate(current,body,name);
    await request('PATCH',update.body,update.mask,name);
    console.log(`Firebase email branding applied: ${name}.`);
   }
   const verified=await request('GET');
   if(!emailTemplatesMatch(verified,body))throw new Error('Firebase email configuration did not match the reviewed templates');
   console.log('Firebase auth email templates personalized and verified: four subjects/senders, pt-BR locale, UNICAP reset header.');
  }
 }catch(error){console.error(error.message?.startsWith('Firebase email configuration')?error.message:'Firebase email template deployment failed.');process.exitCode=1;}
}
