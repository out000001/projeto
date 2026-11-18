import {portalRequest} from './portalApi';
import {uploadFiles} from './projectApi';
export const fetchEditais=()=>portalRequest('/api/editais');
export async function createEdital(id,title,file){
 if(!(file instanceof File)||file.type!=='application/pdf'||!file.size||file.size>10*1024*1024)throw new Error('Selecione um PDF de até 10 MB.');
 const[attachment]=await uploadFiles(id,[file],body=>portalRequest('/api/editais','POST',body));
 return portalRequest('/api/editais','POST',{id,title,file:attachment});
}
export async function downloadEdital(item){
 const chunks=[];
 for(let part=0;part<item.file.parts;part++){
  const result=await portalRequest(`/api/editais?id=${encodeURIComponent(item.id)}&part=${part}`);
  chunks.push(Uint8Array.from(window.atob(result.data),c=>c.charCodeAt(0)));
 }
 return new Blob(chunks,{type:'application/pdf'});
}
