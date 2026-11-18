import {requireVerifiedEmail} from './verified-email.mjs';
import {writeFilePart,finalizeFiles,readFilePart} from './project-files.mjs';
const fail=(status,message)=>Object.assign(new Error(message),{status});
const validId=value=>typeof value==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(value);
const view=(id,data)=>({id,title:data.title,createdAt:data.createdAt,file:{id:data.file.id,name:data.file.name,size:data.file.size,parts:data.file.parts,type:'application/pdf'}});
export function createEditaisHandler({auth,db}){
 return async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  try{
   if(!['GET','POST'].includes(req.method))throw fail(405,'Método não permitido.');
   const token=/^Bearer (.+)$/.exec(req.headers.authorization||'')?.[1];if(!token)throw fail(401,'Entre na sua conta para consultar os editais.');
   let user;try{user=await auth.verifyIdToken(token,true);}catch{throw fail(401,'Sua sessão expirou. Entre novamente.');}requireVerifiedEmail(user);
   const body=req.body||{},id=req.method==='GET'?req.query?.id:body.id;
   if(req.method==='GET'){
    if(!id){const snapshot=await db.collection('_editais').get();return res.json({items:snapshot.docs.map(d=>view(d.id,d.data())).sort((a,b)=>b.createdAt.localeCompare(a.createdAt))});}
    if(!validId(id))throw fail(400,'Identificador de edital inválido.');
    const item=(await db.collection('_editais').doc(id).get()).data();if(!item)throw fail(404,'Edital não encontrado.');
    return res.json(await readFilePart(db,item.file,req.query.part));
   }
   const profile=(await db.collection('users').doc(user.uid).get()).data();if(profile?.profile!=='gestor')throw fail(403,'Apenas gestores podem cadastrar editais.');
   if(!validId(id))throw fail(400,'Identificador de edital inválido.');
   const ref=db.collection('_editais').doc(id);
   if(body.action==='upload'){await writeFilePart(db,user.uid,id,body.attachment);return res.json({ok:true});}
   if(typeof body.title!=='string'||body.title.trim().length<5||body.title.length>200||!body.file||body.file.type!=='application/pdf')throw fail(400,'Informe um título de 5 a 200 caracteres e um arquivo PDF de até 10 MB.');
   const previous=await ref.get();if(previous.exists){if(previous.data().ownerId!==user.uid)throw fail(409,'Identificador de edital já utilizado.');return res.json({item:view(id,previous.data())});}
   const[file]=await finalizeFiles(db,user.uid,id,[body.file]);
   const item={title:body.title.trim(),ownerId:user.uid,createdAt:new Date().toISOString(),file};
   await db.runTransaction(async tx=>{const old=await tx.get(ref);if(old.exists)throw fail(409,'Este edital já foi cadastrado. Atualize a lista.');tx.create(ref,item);});
   return res.status(201).json({item:view(id,item)});
  }catch(error){if(!error.status)console.error('Edital operation failed',{code:error.code||'unknown'});return res.status(error.status||503).json({error:error.status?error.message:'Editais indisponíveis. Tente novamente.'});}
 };
}
