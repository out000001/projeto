import {signInWithEmailAndPassword,sendEmailVerification,signOut} from 'firebase/auth';
import {auth} from './firebase';
let sending=false;
export async function sendVerificationForCredentials(email,password){
 if(sending)throw new Error('Aguarde o envio da confirmação.');
 if(!email?.trim()||!password)throw new Error('Informe e-mail e senha para enviar a confirmação.');
 sending=true;
 try{
  const {user}=await signInWithEmailAndPassword(auth,email.trim(),password);
  if(user.emailVerified)throw new Error('Este e-mail já está confirmado. Entre normalmente.');
  await sendEmailVerification(user);
 }catch(error){
  if(error.code==='auth/too-many-requests')throw new Error('Muitas tentativas de envio. Aguarde alguns minutos e tente novamente.');
  if(error.code==='auth/invalid-credential')throw new Error('Confira seu e-mail e senha para enviar a confirmação.');
  if(error.code)throw new Error('Não foi possível enviar a confirmação. Verifique sua conexão. Se precisar de ajuda com a confirmação, contate a coordenação.');
  throw error;
 }finally{try{await signOut(auth);}finally{sending=false;}}
}
