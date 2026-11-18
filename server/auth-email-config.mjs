const names=['verifyEmailTemplate','resetPasswordTemplate','changeEmailTemplate','revertSecondFactorAdditionTemplate'];
export function emailTemplatePatch(config,resetBody){
 if(config.defaultLocale!=='pt-BR'||!config.senderDisplayName?.trim())throw new Error('Invalid email branding configuration');
 if(!resetBody.includes('href="%LINK%"')||!resetBody.includes('%EMAIL%'))throw new Error('Missing Firebase email placeholders');
 const sendEmail={},mask=['notification.defaultLocale'];
 for(const name of names){
  const input=config.templates[name];if(!input||typeof input.subject!=='string'||!input.subject.trim())throw new Error('Missing email subject');
  sendEmail[name]={senderDisplayName:config.senderDisplayName,subject:input.subject};
  mask.push(`notification.sendEmail.${name}.senderDisplayName`,`notification.sendEmail.${name}.subject`);
  if(name==='resetPasswordTemplate'){
   sendEmail[name].body=resetBody;sendEmail[name].bodyFormat='HTML';
   mask.push(`notification.sendEmail.${name}.body`,`notification.sendEmail.${name}.bodyFormat`);
  }
 }
 return{body:{notification:{defaultLocale:'pt-BR',sendEmail}},mask};
}
export function emailTemplatesMatch(current,desired){
 if(current?.notification?.defaultLocale!==desired.notification.defaultLocale)return false;
 return Object.entries(desired.notification.sendEmail).every(([name,fields])=>Object.entries(fields).every(([field,value])=>current.notification.sendEmail?.[name]?.[field]===value));
}
