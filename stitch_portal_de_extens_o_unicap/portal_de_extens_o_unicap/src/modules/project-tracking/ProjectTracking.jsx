import {useState} from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import {Calendar, Person, School} from '../../components/ui/Icons';
import {downloadTextFile} from '../../utils/download';
import {odsOptions} from '../project-submission/data/submissionOptions';
import useTracking from './useTracking';
import {currentMonth, validMonth, trackingMonths, frequencySummary, executionSummary, monthLabel} from './trackingMetrics';
import TrackingFrequency from './components/TrackingFrequency';
import TrackingParticipants from './components/TrackingParticipants';
import TrackingPlan from './components/TrackingPlan';
import TrackingReports from './components/TrackingReports';
import TrackingOverview from './components/TrackingOverview';
import TrackingProgress from './components/TrackingProgress';

const tabs = [['overview','Visão geral'],['participants','Participantes'],['frequency','Frequência'],['plan','Cronograma e atividades'],['reports','Relatórios e pareceres']];
const displayDate = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR') : 'Não definida';

export default function ProjectTracking() {
  const {items,id,setId,data,loading,busy,error,reload,action} = useTracking();
  const [tab,setTab] = useState('frequency');
  const [selection,setSelection] = useState(null);
  const [uploading,setUploading] = useState(false);
  const [notice,setNotice] = useState('');
  const working = busy || uploading;
  const tracking = data?.tracking;
  const month = tracking ? validMonth(selection?.id === id ? selection.month : currentMonth(), tracking.config) : currentMonth();
  const months = tracking ? trackingMonths(tracking) : [];
  const monthIndex = months.indexOf(month);
  const nearby = months.slice(Math.max(0,monthIndex - 2), Math.max(5,monthIndex + 3));
  const active = tracking?.participants.filter(p => p.active) || [];
  const execution = tracking ? executionSummary(tracking) : null;
  const summary = tracking ? frequencySummary(tracking,month) : null;
  const configured = Boolean(tracking?.config.startDate && tracking?.config.endDate && tracking?.config.totalHours && tracking?.config.monthlyHours);

  async function change(payload) {
    const ok = await action(payload);
    setNotice(ok ? 'Alteração salva no banco de dados.' : '');
    return ok;
  }
  function downloadSummary() {
    downloadTextFile(`resumo-${id}.txt`, ['Resumo de acompanhamento — UNICAP',data.project.title,
      `Coordenação: ${data.project.coordinator}`,`Vigência: ${displayDate(tracking.config.startDate)} a ${displayDate(tracking.config.endDate)}`,
      `Participantes visíveis nesta conta: ${active.length}`,`Extraído em ${new Date().toLocaleString('pt-BR')}`,
      'Este resumo não substitui uma declaração institucional assinada.'].join('\n'));
  }

  return <div className="flex min-w-0 flex-col gap-6">
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 w-full sm:flex-1"><p className="mb-2 text-sm font-semibold text-primary">Extensão comunitária</p>
        <h1 className="font-display text-2xl font-bold tracking-tight text-primary sm:text-3xl">Acompanhamento de projetos</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant">Acompanhe as atividades, confira as horas e organize as entregas do projeto.</p>
      </div>
      <Button variant="outline" onClick={reload} disabled={working || !id}>Atualizar dados</Button>
    </div>
    <label className="max-w-2xl text-sm font-semibold">Projeto
      <select className="input mt-2" value={id} disabled={working || !items.length} onChange={e=>{setId(e.target.value);setNotice('');}}>
        {!items.length && <option value="">Nenhum projeto disponível</option>}
        {items.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}
      </select>
    </label>
    {error && <div role="alert" className="flex flex-wrap items-center gap-3 rounded-lg bg-red-50 p-4 text-red-800">{error}<Button variant="outline" onClick={reload} disabled={working}>Recarregar acompanhamento</Button></div>}
    <div role="status" aria-live="polite" className="text-sm text-primary">{loading ? 'Carregando acompanhamento…' : working ? 'Salvando…' : notice}</div>
    {!loading && !items.length && !error && <Card className="p-6"><p>Você ainda não tem projetos disponíveis para acompanhamento. Gestores podem cadastrar um projeto no painel; alunos precisam se inscrever ou ser vinculados pela gestão.</p></Card>}
    {data && !loading && <>
      <Card className="p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold leading-relaxed">
          <span className="rounded-md bg-secondary-container px-3 py-1.5 text-on-secondary-fixed">{data.project.grant || 'Edital não informado'}</span>
          <span className="inline-flex items-center gap-2 rounded-md bg-surface-container px-3 py-1.5"><Calendar className="h-4 w-4 shrink-0"/> Vigência: {displayDate(tracking.config.startDate)} a {displayDate(tracking.config.endDate)}</span>
        </div>
        <div className="flex flex-col items-start gap-5 lg:flex-row lg:justify-between">
          <div className="min-w-0 w-full max-w-3xl lg:flex-1"><h2 className="break-words font-display text-2xl font-semibold leading-snug tracking-tight text-primary">{data.project.title}</h2>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm leading-relaxed text-on-surface-variant">
              <span className="inline-flex items-start gap-2"><Person className="mt-0.5 h-4 w-4 shrink-0"/>Coordenação: {data.project.coordinator || 'Não informada'}</span>
              <span className="inline-flex items-start gap-2"><School className="mt-0.5 h-4 w-4 shrink-0"/>{data.project.center || 'Centro não informado'}</span>
            </div>
            {data.project.ods?.length > 0 && <ul aria-label="Objetivos de Desenvolvimento Sustentável" className="mt-4 flex flex-wrap gap-2">{data.project.ods.map(ods=><li key={ods} className="rounded-md bg-surface-container-low px-3 py-1.5 text-xs leading-relaxed text-secondary">ODS {ods} · {odsOptions.find(item=>item.value===String(ods))?.label || 'Objetivo informado no projeto'}</li>)}</ul>}
          </div>
          <Button variant="outline" onClick={downloadSummary}>Baixar resumo do projeto</Button>
        </div>
      </Card>
      {!configured && <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-outline-variant bg-surface-container-low p-5">
        <div className="max-w-2xl text-sm leading-relaxed"><p className="font-semibold">Acompanhamento aguardando configuração</p><p className="mt-1 text-on-surface-variant">{data.canManage ? 'Defina a vigência e as cargas horárias na visão geral para calcular o progresso e homologar a frequência.' : 'A gestão ainda precisa definir a vigência e as cargas horárias. Os valores não informados não representam atividades concluídas.'}</p></div>
        {data.canManage && <Button variant="outline" disabled={working} onClick={()=>setTab('overview')}>Configurar acompanhamento</Button>}
      </div>}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[{label:'Carga horária por participante',value:tracking.config.totalHours ? `${tracking.config.totalHours}h` : 'Não definida',note:tracking.config.monthlyHours ? `${tracking.config.monthlyHours}h mensais` : 'Carga mensal não definida'},
          {label:data.canManage ? 'Equipe discente' : 'Minha participação',value:active.length,note:data.canManage ? `${active.filter(p=>p.type==='pbex').length} bolsistas · ${active.filter(p=>p.type==='voluntary').length} voluntários` : 'Somente seus registros estão visíveis'},
          {label:'Beneficiários atendidos',value:configured ? tracking.config.beneficiaries : 'Não informado',note:'Quantidade informada pela gestão'},
          {label:'Progresso homologado',value:execution.percent === null ? 'Não calculado' : `${execution.percent}%`,note:`${execution.approved}h homologadas${execution.planned ? ` de ${execution.planned}h previstas` : ''}`}].map(card=><Card key={card.label} className="min-w-0 p-5"><p className="text-xs font-semibold leading-relaxed text-on-surface-variant">{card.label}</p><p className="mt-3 break-words font-display text-2xl font-semibold tabular-nums text-primary">{card.value}</p><p className="mt-2 text-xs leading-relaxed text-on-surface-variant">{card.note}</p></Card>)}
      </div>
      <nav aria-label="Seções de acompanhamento" className="flex flex-wrap gap-2 border-b border-outline-variant pb-4">
        {tabs.filter(([key])=>key!=='participants' || data.canManage).map(([key,label])=><button key={key} type="button" disabled={working} aria-pressed={tab===key} onClick={()=>setTab(key)} className={`min-h-11 rounded-lg px-4 py-2 text-sm font-semibold ${tab===key ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'}`}>{label}</button>)}
      </nav>
      {tab==='overview' && <TrackingOverview key={`${id}-${tracking.revision}`} tracking={tracking} canManage={data.canManage} busy={working} onAction={change}/>}
      {tab==='participants' && data.canManage && <TrackingParticipants key={id} projectId={id} onReload={reload} participants={tracking.participants} busy={working} onAction={change}/>}
      {tab==='frequency' && <>
        <div className="flex flex-wrap items-end justify-between gap-4"><label className="text-sm font-semibold">Competência<input className="input mt-2" type="month" value={month} disabled={working} min={tracking.config.startDate?.slice(0,7)||undefined} max={tracking.config.endDate?.slice(0,7)||undefined} onChange={e=>{if(e.target.value)setSelection({id,month:validMonth(e.target.value,tracking.config)});}}/></label><p className="text-sm leading-relaxed text-on-surface-variant">{summary.approved} de {summary.total} participantes com frequência homologada no mês.</p></div>
        {nearby.length > 1 && <div aria-label="Meses da frequência" className="flex flex-wrap gap-2">{nearby.map(value=><button key={value} type="button" disabled={working} aria-pressed={value===month} onClick={()=>setSelection({id,month:value})} className={`min-h-11 rounded-lg border px-3 py-2 text-sm ${value===month ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant bg-surface text-on-surface'}`}>{monthLabel(value)}</button>)}</div>}
        <TrackingProgress label={`Homologação em ${monthLabel(month)}`} value={summary.percent} detail={summary.total ? `${summary.percent}% · ${summary.pending} pendência(s)` : 'Sem participantes ativos'}/>
        <TrackingFrequency key={`${id}-${month}`} tracking={tracking} month={month} canManage={data.canManage} busy={working} onAction={change}/>
      </>}
      {tab==='plan' && <TrackingPlan key={id} milestones={tracking.milestones} plan={data.project.plan} activities={data.project.activities} canManage={data.canManage} busy={working} onAction={change}/>}
      {tab==='reports' && <TrackingReports key={id} projectId={id} reports={tracking.reports} canManage={data.canManage} busy={busy} onAction={change} onUploading={setUploading}/>}
    </>}
  </div>;
}
