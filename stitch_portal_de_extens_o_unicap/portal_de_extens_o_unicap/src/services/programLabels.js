// Rename only display fields. Preserve identifiers and binary attachment payloads.
const labels=new Set(['title','grant','modality','label','detail','description','shortDesc']);
export function programLabels(value){
 if(Array.isArray(value))return value.map(programLabels);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,labels.has(key)&&typeof item==='string'?item.replace(/PIBEX/g,'PIBIC'):programLabels(item)]));
 return value;
}
