import {useEffect,useRef} from 'react';
import {useSearchParams} from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

const statuses = {active:'Ativo',pending:'Pendente',analysis:'Em análise',suspended:'Suspenso',completed:'Concluído'};
const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
const dateLabel = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR') : 'Não definida';
const pageSize = 10;

export default function TrackingProjectList({items,loading,error,busy,onOpen,onReload,quick=false}) {
  const [params,setParams] = useSearchParams();
  const inputRef = useRef(null);
  useEffect(()=>{if(quick)inputRef.current?.focus();},[quick]);
  const query=params.get('q') || '',center=params.get('center') || '',grant=params.get('grant') || '',status=params.get('status') || '';
  function update(key,value) {
    setParams(current=>{const next=new window.URLSearchParams(current);if(value)next.set(key,value);else next.delete(key);if(key!=='page')next.delete('page');return next;},{replace:true});
  }
  function clear() {
    setParams(current=>{const next=new window.URLSearchParams(current);for(const key of ['q','center','grant','status','page'])next.delete(key);return next;},{replace:true});
  }
  const terms=normalize(query).trim().split(/\s+/).filter(Boolean);
  const filtered=items.filter(p=>terms.every(term=>normalize(`${p.title} ${p.coordinator} ${p.id}`).includes(term))&&(!center||p.center===center)&&(!grant||p.grant===grant)&&(!status||p.status===status)).sort((a,b)=>a.title.localeCompare(b.title,'pt-BR')||a.id.localeCompare(b.id));
  const pageCount=Math.max(1,Math.ceil(filtered.length/pageSize));
  const requestedPage=Number(params.get('page'));
  const page=Math.min(pageCount,Number.isSafeInteger(requestedPage)&&requestedPage>0?requestedPage:1);
  const visible=filtered.slice((page-1)*pageSize,page*pageSize);
  const filterOptions=(key,current)=>[...new Set([...items.map(p=>p[key]).filter(Boolean),...(current?[current]:[])])].sort((a,b)=>a.localeCompare(b,'pt-BR'));

  return <section id="tracking-project-list" aria-label={quick?'Busca para trocar projeto':'Projetos disponíveis'} className="min-w-0">
    <Card className="p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-primary">{quick?'Trocar projeto':'Encontre um projeto'}</h2>
      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">Busque pelo nome, coordenação ou código e refine os resultados pelos filtros.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="text-sm font-semibold">Buscar projeto<input ref={inputRef} className="input mt-2" type="search" value={query} placeholder="Nome, coordenação ou código" onChange={e=>update('q',e.target.value)}/></label>
        {[['center','Centro acadêmico',center],['grant','Edital',grant],['status','Situação',status]].map(([key,label,value])=><label key={key} className="min-w-0 text-sm font-semibold">{label}<select className="input mt-2" value={value} onChange={e=>update(key,e.target.value)}><option value="">Todos</option>{filterOptions(key,value).map(option=><option key={option} value={option}>{key==='status'?statuses[option]||option:option}</option>)}</select></label>)}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-on-surface-variant">{loading?'Atualizando projetos…':`${filtered.length} ${filtered.length===1?'projeto encontrado':'projetos encontrados'} · ${items.length} ${items.length===1?'disponível':'disponíveis'}`}</p>
        {(query||center||grant||status)&&<Button variant="ghost" onClick={clear}>Limpar busca e filtros</Button>}
      </div>
      {error&&<div role="alert" className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-red-50 p-4 text-red-800">{error}<Button variant="outline" onClick={onReload} disabled={busy||loading}>Tentar novamente</Button></div>}
      {!loading&&!error&&!items.length&&<p className="mt-6 text-sm leading-relaxed">Você ainda não tem projetos disponíveis para acompanhamento. Gestores podem cadastrar um projeto no painel; alunos precisam se inscrever ou ser vinculados pela gestão.</p>}
      {!loading&&!error&&items.length>0&&!visible.length&&<div className="mt-6 text-sm leading-relaxed"><p className="font-semibold">Nenhum projeto corresponde à sua busca.</p><p className="mt-1 text-on-surface-variant">Tente outro nome ou remova algum filtro.</p></div>}
      <ul className="mt-5 divide-y divide-outline-variant">
        {visible.map(p=><li key={p.id} className="flex min-w-0 flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-start gap-2"><h3 className="break-words text-lg font-semibold leading-snug text-primary">{p.title}</h3><span className="rounded-md bg-surface-container px-2 py-1 text-xs font-semibold">{statuses[p.status]||'Situação não informada'}</span></div>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">Coordenação: {p.coordinator||'Não informada'} · {p.center||'Centro não informado'}</p>
            <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{p.grant||'Edital não informado'} · Vigência: {dateLabel(p.startDate)} a {dateLabel(p.endDate)}</p>
            <p className="mt-2 break-all text-xs text-on-surface-variant">Código: {p.id}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs leading-relaxed">
              <span className={p.pendingReports>0?'font-semibold text-primary':'text-on-surface-variant'}>{p.pendingReports||0} {p.pendingReports===1?'entrega pendente':'entregas pendentes'}</span>
              <span className="text-on-surface-variant">{p.awaitingReview||0} {p.awaitingReview===1?'relatório aguardando parecer':'relatórios aguardando parecer'}</span>
            </div>
          </div>
          <div className="shrink-0"><Button disabled={busy} onClick={()=>onOpen(p.id)} aria-label={`Abrir acompanhamento de ${p.title}`}>Abrir acompanhamento</Button></div>
        </li>)}
      </ul>
      {pageCount>1&&<nav aria-label="Paginação de projetos" className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant pt-4"><span className="text-sm tabular-nums">Página {page} de {pageCount}</span><div className="flex gap-2"><Button variant="outline" disabled={page===1||busy} onClick={()=>update('page',String(page-1))}>Anterior</Button><Button variant="outline" disabled={page===pageCount||busy} onClick={()=>update('page',String(page+1))}>Próxima</Button></div></nav>}
    </Card>
  </section>;
}
TrackingProjectList.propTypes={items:PropTypes.array.isRequired,loading:PropTypes.bool,error:PropTypes.string,busy:PropTypes.bool.isRequired,onOpen:PropTypes.func.isRequired,onReload:PropTypes.func.isRequired,quick:PropTypes.bool};
