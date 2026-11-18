import{it,expect}from'vitest';import{programLabels}from'./programLabels';
it('renders stored program labels as PIBIC without changing legacy document IDs',()=>{expect(programLabels({id:'pibex-2025',items:[{grant:'PIBEX 2025',modality:'Bolsa PIBEX'}]})).toEqual({id:'pibex-2025',items:[{grant:'PIBIC 2025',modality:'Bolsa PIBIC'}]});});
it('does not alter binary payloads or attachment identifiers containing the old label sequence',()=>{const file={data:'PIBEXAAA==',id:'PIBEX-file',storageId:'PIBEX-storage',name:'PIBEX.pdf'};expect(programLabels({file})).toEqual({file});});
