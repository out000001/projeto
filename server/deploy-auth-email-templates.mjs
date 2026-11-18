import {readFile} from 'node:fs/promises';
import {getApp} from 'firebase-admin/app';
import {services} from './firebase-admin.mjs';
import {AUTH_CONFIG_URL,emailTemplatePatch,emailTemplatesMatch} from './auth-email-config.mjs';

// Reviewed project-specific production configuration. Credentials remain in memory.
if(process.env.VERCEL_ENV==='production'){
 try{
  services();
  const config=JSON.parse(await readFile(new URL('../config/auth-emails/templates.json',import.meta.url),'utf8'));
  const html=await readFile(new URL('../config/auth-emails/reset-password.html',import.meta.url),'utf8');
  const{body,mask}=emailTemplatePatch(config,html);
  const credential=getApp().options.credential;
  const {access_token:accessToken}=await credential.getAccessToken();
  const fields='notification(defaultLocale,sendEmail(verifyEmailTemplate(senderDisplayName,subject),resetPasswordTemplate(senderDisplayName,subject,body,bodyFormat),changeEmailTemplate(senderDisplayName,subject),revertSecondFactorAdditionTemplate(senderDisplayName,subject)))';
  const base=AUTH_CONFIG_URL;
  async function request(method,payload){
   const query=new URLSearchParams({fields,...(method==='PATCH'?{updateMask:mask.join(',')}:{})});
   const response=await fetch(`${base}?${query}`,{method,headers:{Authorization:`Bearer ${accessToken}`,...(payload?{'Content-Type':'application/json'}:{})},...(payload?{body:JSON.stringify(payload)}:{}),signal:AbortSignal.timeout(30000)});
   const result=await response.json();
   if(!response.ok)throw new Error(`Firebase email configuration: HTTP ${response.status} (${method}: ${result.error?.status||'unknown'})`);
   return result;
  }
  const current=await request('GET');
  if(emailTemplatesMatch(current,body))console.log('Firebase auth email templates already match UNICAP branding.');
  else{
   await request('PATCH',body);
   const verified=await request('GET');
   if(!emailTemplatesMatch(verified,body))throw new Error('Firebase email configuration did not match the reviewed templates');
   console.log('Firebase auth email templates personalized and verified: four subjects/senders, pt-BR locale, UNICAP reset header.');
  }
 }catch(error){console.error(error.message?.startsWith('Firebase email configuration')?error.message:'Firebase email template deployment failed.');process.exitCode=1;}
}
