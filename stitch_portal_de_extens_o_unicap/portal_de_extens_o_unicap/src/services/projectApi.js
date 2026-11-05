import { auth } from './firebase';

async function request(method, body, query = '') {
  const user = auth.currentUser;
  if (!user) throw new Error('Entre na sua conta para continuar.');
  const token = await user.getIdToken();
  const response = await fetch(`/api/projects${query}`, {
    method, headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result) throw new Error(result?.error || 'Não foi possível conectar ao serviço de projetos. Tente novamente.');
  return result;
}
const asBase64 = blob => new Promise((resolve,reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result).split(',')[1]);
  reader.onerror = () => reject(new Error('Não foi possível ler o anexo. Selecione-o novamente.'));
  reader.readAsDataURL(blob);
});
export async function uploadFiles(id, files) {
  const attachments=[];
  for (const file of files || []) {
    if (!(file instanceof File)) throw new Error('Selecione novamente os anexos do rascunho antes de enviar.');
    const fileId=window.crypto.randomUUID();
    const chunkSize=2*1024*1024;
    const parts=Math.ceil(file.size/chunkSize);
    for(let part=0;part<parts;part++) {
      const data=await asBase64(file.slice(part*chunkSize,(part+1)*chunkSize));
      await request('POST',{action:'upload',id,attachment:{id:fileId,part,data}});
    }
    attachments.push({id:fileId,name:file.name,type:file.type,size:file.size,parts});
  }
  return attachments;
}
export async function submitProject(form,id) {
  const attachments=await uploadFiles(id,form.attachments);
  return request('POST',{id,form:{...form,attachments}});
}
export const fetchProjectDetails = id => request('GET',null,`?id=${encodeURIComponent(id)}&details=1`);
export const fetchManagerProjects = () => request('GET');
export const publishProject = (id,info) => request('PATCH',{id,action:'publish',info});
export const unpublishProject = id => request('PATCH',{id,action:'unpublish'});
export async function attachmentDownload(id,file) {
  const pieces=[];
  for(let part=0;part<file.parts;part++) {
    const result=await request('GET',null,`?id=${encodeURIComponent(id)}&attachment=${encodeURIComponent(file.id)}&part=${part}`);
    pieces.push(Uint8Array.from(window.atob(result.data),character=>character.charCodeAt(0)));
  }
  return new Blob(pieces,{type:file.type});
}
