import { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { publishProject, unpublishProject, attachmentDownload } from '../../../services/projectApi';

export default function ProjectPublication({project,onChanged}) {
  const [info,setInfo]=useState(project.publicInfo || {local:'',courses:'',hours:'',deadline:'',turnos:[]});
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  async function change(event) {
    event.preventDefault();
    if(busy) return;
    setBusy(true);setError('');
    try {
      if(project.published) await unpublishProject(project.id);
      else await publishProject(project.id,info);
      onChanged();
    } catch(err) {setError(err.message);} finally {setBusy(false);}
  }
  async function download(file) {
    setError('');
    try {
      const blob=await attachmentDownload(project.id,file);
      const url=URL.createObjectURL(blob);
      const link=document.createElement('a');link.href=url;link.download=file.name;
      document.body.appendChild(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
    } catch(err) {setError(err.message);}
  }
  if (!project.submission) return null;
  return <div className="mt-6 flex flex-col gap-5 border-t border-surface-container-high pt-5">
    <h3 className="font-semibold">Proposta salva</h3>
    {['socialJustification','objectives','activities','timeline'].map((key,index)=><div key={key}><h4 className="font-semibold">{['Justificativa social','Objetivos','Atividades','Cronograma'][index]}</h4><p className="whitespace-pre-wrap break-words text-sm text-on-surface-variant">{project.submission[key] || 'Não informado'}</p></div>)}
    <div><h4 className="font-semibold">Equipe</h4>{project.submission.teamMembers.map((member,index)=><p key={index} className="break-words text-sm">{Object.values(member).join(' · ')}</p>)}</div>
    <div><h4 className="font-semibold">Anexos privados</h4>{project.submission.attachments.length ? project.submission.attachments.map(file=><Button key={file.id} variant="outline" onClick={()=>download(file)} className="mt-2 max-w-full break-all">Baixar {file.name}</Button>) : <p className="text-sm text-on-surface-variant">Nenhum anexo.</p>}</div>
    <form onSubmit={change} className="flex flex-col gap-4">
      <h3 className="font-semibold">{project.published?'Publicado na vitrine':'Publicar na vitrine'}</h3>
      <p className="text-sm text-on-surface-variant">Apenas a descrição pública, vagas e informações de participação serão divulgadas. Equipe, orçamento e anexos permanecem privados.</p>
      {!project.published && <>
        {Object.entries({local:'Local / bairro',courses:'Cursos / público participante',hours:'Carga horária',deadline:'Inscrições até'}).map(([key,label])=><Input key={key} label={label} type={key==='deadline'?'date':'text'} value={info[key]} maxLength={300} required onChange={event=>setInfo(current=>({...current,[key]:event.target.value}))} />)}
        <fieldset><legend className="font-semibold text-sm">Turnos (opcional)</legend><div className="flex flex-wrap gap-3">{['Manhã','Tarde','Noite','Sábados'].map(turno=><label key={turno} className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={(info.turnos || []).includes(turno)} onChange={()=>setInfo(current=>({...current,turnos:(current.turnos || []).includes(turno)?current.turnos.filter(t=>t!==turno):[...(current.turnos || []),turno]}))} />{turno}</label>)}</div></fieldset>
      </>}
      {error && <p role="alert" className="text-red-800">{error}</p>}
      <Button type="submit" variant={project.published?'outline':'primary'} disabled={busy}>{busy?'Salvando…':project.published?'Retirar da vitrine':'Publicar projeto'}</Button>
    </form>
  </div>;
}
ProjectPublication.propTypes={project:PropTypes.object.isRequired,onChanged:PropTypes.func.isRequired};
