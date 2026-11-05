const fail = (status,message) => Object.assign(new Error(message),{status});
const validId = value => typeof value==='string' && /^[a-zA-Z0-9_-]{10,80}$/.test(value);
export async function finalizeFiles(db,uid,projectId,files=[]) {
  if(!Array.isArray(files)||files.length>5) throw fail(400,'Até 5 anexos são permitidos.');
  const result=[];
  for(const a of files) {
    if(!validId(a.id)||typeof a.name!=='string'||a.name.length>200||!['application/pdf','image/png','image/jpeg'].includes(a.type)||!Number.isInteger(a.parts)||a.parts<1||a.parts>5||!Number.isInteger(a.size)||a.size<1||a.size>10*1024*1024) throw fail(400,'Anexo inválido. Selecione o arquivo novamente.');
    const storageId=`${uid}-${projectId}-${a.id}`;
    const root=db.collection('_projectFiles').doc(storageId);
    await db.runTransaction(async tx=>{
      const metadata=await Promise.all(Array.from({length:a.parts},async(_,i)=>(await tx.get(root.collection('segments').doc(String(i)))).data()));
      const first=(await tx.get(root.collection('data').doc('0-0'))).data();
      if(metadata.some(m=>!m||m.size>2*1024*1024)||metadata.reduce((sum,m)=>sum+m.size,0)!==a.size||!first) throw fail(400,'Anexo incompleto. Tente enviar novamente.');
      const header=Buffer.from(first.base64,'base64').subarray(0,8);
      const signature=a.type==='application/pdf'?header.subarray(0,5).toString()==='%PDF-':a.type==='image/png'?header.equals(Buffer.from([137,80,78,71,13,10,26,10])):header.subarray(0,3).equals(Buffer.from([255,216,255]));
      if(!signature)throw fail(400,'O conteúdo do anexo não corresponde a PDF, PNG ou JPEG.');
      tx.set(root,{sealed:true},{merge:true});
    });
    result.push({id:a.id,name:a.name,type:a.type,size:a.size,parts:a.parts,storageId});
  }
  return result;
}
export async function readFilePart(db,file,value) {
  const part=Number(value);
  if(!Number.isInteger(part)||part<0||part>=file.parts) throw fail(400,'Parte de anexo inválida.');
  const root=db.collection('_projectFiles').doc(file.storageId);
  await db.runTransaction(async tx=>{tx.set(root,{sealed:true},{merge:true});});
  const meta=(await root.collection('segments').doc(String(part)).get()).data();
  if(!meta) throw fail(404,'Anexo incompleto.');
  const buffers=[];
  for(let i=0;i<meta.shards;i++) {
    const shard=(await root.collection('data').doc(`${part}-${i}`).get()).data();
    if(!shard) throw fail(404,'Anexo incompleto.');
    buffers.push(Buffer.from(shard.base64,'base64'));
  }
  return {data:Buffer.concat(buffers).toString('base64')};
}
