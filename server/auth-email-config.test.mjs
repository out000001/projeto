import test from 'node:test';import assert from 'node:assert/strict';import{readFile}from'node:fs/promises';
import{AUTH_CONFIG_URL,emailTemplatePatch,emailTemplatesMatch,singleTemplateUpdate}from'./auth-email-config.mjs';
const config=JSON.parse(await readFile(new URL('../config/auth-emails/templates.json',import.meta.url),'utf8'));
const html=await readFile(new URL('../config/auth-emails/reset-password.html',import.meta.url),'utf8');
test('brands all four subjects and senders without changing delivery, action URLs or auth policies',()=>{
 const{body,mask}=emailTemplatePatch(config,html);assert.equal(Object.keys(body.notification.sendEmail).length,4);
 assert.equal(body.notification.defaultLocale,'pt-BR');assert.deepEqual(Object.keys(body),['notification']);
 for(const template of Object.values(body.notification.sendEmail)){assert.match(template.subject,/Portal de Extensão UNICAP/);assert.equal(template.senderDisplayName,'Portal de Extensão UNICAP');}
 assert.ok(mask.every(field=>!/(smtp|callbackUri|senderLocalPart|replyTo|authorizedDomains|mfa|signIn)/.test(field)));
 for(const name of ['verifyEmailTemplate','changeEmailTemplate','revertSecondFactorAdditionTemplate'])assert.equal('body' in body.notification.sendEmail[name],false);
});
test('reset message retains Firebase tokens and a header readable with images disabled',()=>{
 const{body}=emailTemplatePatch(config,html);const reset=body.notification.sendEmail.resetPasswordTemplate;
 assert.equal(reset.bodyFormat,'HTML');assert.ok(reset.body.includes('href="%LINK%"'));assert.ok(reset.body.includes('%EMAIL%'));
 assert.match(reset.body,/Universidade Católica de Pernambuco/);assert.doesNotMatch(reset.body,/<img|<script|<form/i);
 assert.doesNotMatch(reset.body,/https?:\/\//);
});
test('missing action placeholders fail before producing a configuration update',()=>{assert.throws(()=>emailTemplatePatch(config,'A broken template'),/placeholders/);});
test('matching is idempotent but catches a changed subject or missing email body',()=>{
 const{body}=emailTemplatePatch(config,html);assert.equal(emailTemplatesMatch(structuredClone(body),body),true);
 const changed=structuredClone(body);changed.notification.sendEmail.verifyEmailTemplate.subject='Other';assert.equal(emailTemplatesMatch(changed,body),false);
 delete changed.notification.sendEmail.resetPasswordTemplate.body;assert.equal(emailTemplatesMatch(changed,body),false);
});

test('uses the Firebase administrative configuration endpoint',()=>{assert.equal(new URL(AUTH_CONFIG_URL).pathname,'/admin/v2/projects/portaldeextensaocomunitaria/config');});

test('complete template updates preserve managed bodies and sender addresses',()=>{
 const{body}=emailTemplatePatch(config,html);
 const current={notification:{sendEmail:{verifyEmailTemplate:{senderLocalPart:'noreply',replyTo:'',body:'Managed %LINK%',bodyFormat:'HTML',customized:false}}}};
 const update=singleTemplateUpdate(current,body,'verifyEmailTemplate');
 assert.equal(update.body.notification.sendEmail.verifyEmailTemplate.body,'Managed %LINK%');
 assert.equal(update.body.notification.sendEmail.verifyEmailTemplate.senderLocalPart,'noreply');
 assert.equal('customized' in update.body.notification.sendEmail.verifyEmailTemplate,false);
 assert.deepEqual(update.mask,['notification.sendEmail.verifyEmailTemplate']);
});
