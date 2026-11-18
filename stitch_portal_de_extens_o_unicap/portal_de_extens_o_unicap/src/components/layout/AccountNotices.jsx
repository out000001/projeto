import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import {Calendar,FileText,CheckCircle,Pending,ArrowForward} from '../ui/Icons';

function presentation(id){
  if(id.startsWith('due-'))return {title:'Prazo do projeto',action:'Ver prazo',Icon:Calendar,attention:true};
  if(id.startsWith('reviews-'))return {title:'Relatórios para analisar',action:'Revisar relatórios',Icon:FileText,attention:true};
  if(id.startsWith('pending-'))return {title:'Frequência para homologar',action:'Ver frequência',Icon:CheckCircle,attention:true};
  if(id==='proposals')return {title:'Propostas para análise',action:'Ver propostas',Icon:FileText,attention:true};
  if(id==='weekly')return {title:'Resumo semanal',action:'Ver projetos',Icon:Calendar,attention:false};
  if(id.startsWith('approved-'))return {title:'Horas homologadas',action:'Ver frequência',Icon:CheckCircle,attention:false};
  if(id.startsWith('review-'))return {title:'Parecer de relatório',action:'Ver parecer',Icon:FileText,attention:false};
  return {title:'Atualização do projeto',action:'Abrir projeto',Icon:Pending,attention:false};
}
function readableLabel(label){
  return label.replace(/(\d+) (relatório|projeto|proposta|folha)\(s\)/g,(_all,n,noun)=>`${n} ${noun}${Number(n)===1?'':'s'}`)
    .replace(/folha sua\(s\) homologada\(s\)/g,'folha homologada').replace(/folhas sua\(s\) homologada\(s\)/g,'folhas homologadas');
}
export default function AccountNotices({open,onClose,notices,loading,error,onRefresh}){
  const items=notices.map(notice=>({...notice,...presentation(notice.id)}));
  const groups=[{title:'Ações e prazos',items:items.filter(item=>item.attention)},{title:'Atualizações e resumos',items:items.filter(item=>!item.attention)}];
  return <Modal open={open} onClose={onClose} title="Avisos da sua conta" titleId="account-notices-title" className="w-full max-w-2xl">
    <div className="flex max-h-[calc(100dvh-2rem)] min-h-0 flex-col">
      <div className="shrink-0 border-b border-surface-container-high px-5 pb-5 pt-6 sm:px-6">
        <h2 id="account-notices-title" className="pr-12 text-2xl font-semibold text-primary">Avisos da sua conta</h2>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">Pendências e atualizações dos seus projetos, em um só lugar.</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p role="status" className="text-sm text-on-surface-variant">{loading?'Atualizando avisos…':`${notices.length} ${notices.length===1?'aviso disponível':'avisos disponíveis'}`}</p>
          <Button variant="outline" onClick={onRefresh} disabled={loading}>Atualizar avisos</Button>
        </div>
      </div>
      <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-6" aria-busy={loading}>
        {error&&<div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><p>{error}</p><Button variant="outline" className="mt-3" onClick={onRefresh} disabled={loading}>Tentar novamente</Button></div>}
        {!loading&&!error&&!items.length&&<div className="rounded-xl bg-surface-container-low p-6 text-center"><CheckCircle className="mx-auto mb-3 h-8 w-8 text-primary"/><h3 className="font-semibold">Nenhum aviso por enquanto</h3><p className="mt-2 text-sm leading-relaxed text-on-surface-variant">Não há avisos nas categorias que você selecionou. Confira suas preferências nas configurações.</p></div>}
        {groups.filter(group=>group.items.length).map(group=><section key={group.title} aria-label={group.title} className="mb-5 last:mb-0"><h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">{group.title}</h3><ul className="space-y-3">{group.items.map(item=><li key={item.id} className={`rounded-xl border p-4 ${item.attention?'border-primary/20 bg-primary/5':'border-surface-container-high bg-surface-container-lowest'}`}>
          <div className="flex items-start gap-3"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.attention?'bg-primary/10 text-primary':'bg-surface-container text-on-surface-variant'}`}><item.Icon className="h-5 w-5"/></div><div className="min-w-0 flex-1"><h4 className="font-semibold leading-snug text-on-surface">{item.title}</h4><p className="mt-2 break-words text-sm leading-relaxed text-on-surface-variant">{readableLabel(item.label)}</p><Link to={item.href} onClick={onClose} aria-label={`${item.action}: ${readableLabel(item.label)}`} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md px-1 text-sm font-semibold text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">{item.action}<ArrowForward className="h-4 w-4"/></Link></div></div>
        </li>)}</ul></section>)}
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-surface-container-high bg-surface-container-low px-5 py-4 sm:px-6"><Link to="/settings" onClick={onClose} className="inline-flex min-h-11 items-center rounded text-sm font-semibold text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">Configurar meus avisos</Link><Button variant="outline" onClick={onClose}>Fechar avisos</Button></div>
    </div>
  </Modal>;
}
AccountNotices.propTypes={open:PropTypes.bool.isRequired,onClose:PropTypes.func.isRequired,notices:PropTypes.arrayOf(PropTypes.shape({id:PropTypes.string.isRequired,label:PropTypes.string.isRequired,href:PropTypes.string.isRequired})).isRequired,loading:PropTypes.bool.isRequired,error:PropTypes.string.isRequired,onRefresh:PropTypes.func.isRequired};
