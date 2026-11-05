import {useState} from 'react';
import PropTypes from 'prop-types';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import TrackingProgress from './TrackingProgress';
import {participantHours, trackingMonths, frequencySummary, currentMonth, validMonth, monthLabel} from '../trackingMetrics';

export default function TrackingOverview({tracking,canManage,busy,onAction}) {
  const [config,setConfig] = useState({...tracking.config});
  const configured = Boolean(tracking.config.startDate && tracking.config.endDate && tracking.config.totalHours && tracking.config.monthlyHours);
  const lastMonth = validMonth(currentMonth(),tracking.config);
  const months = trackingMonths(tracking).filter(month=>month<=lastMonth).slice(-6);
  return <div className="flex flex-col gap-6">
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-5 sm:p-6"><h2 className="text-xl font-semibold">Progresso por participante</h2>
        <p className="mb-6 mt-2 text-sm leading-relaxed text-on-surface-variant">Horas homologadas em relação à carga total prevista para cada participante.</p>
        <div className="space-y-6">{tracking.participants.length ? tracking.participants.map(p=>{
          const totals = participantHours(tracking,p.id);
          const planned = tracking.config.totalHours;
          return <div key={p.id}><TrackingProgress label={`${p.name}${p.active ? '' : ' · Inativo'}`} value={planned ? totals.approved/planned*100 : 0} detail={planned ? `${totals.approved}h / ${planned}h` : 'Meta não definida'}/><p className="mt-2 text-xs leading-relaxed text-on-surface-variant">{totals.registered}h registradas · {totals.approved}h homologadas</p></div>;
        }) : <p className="text-sm text-on-surface-variant">Nenhum participante cadastrado.</p>}</div>
      </Card>
      <Card className="p-5 sm:p-6"><h2 className="text-xl font-semibold">Homologação por competência</h2>
        <p className="mb-6 mt-2 text-sm leading-relaxed text-on-surface-variant">Até seis competências recentes da vigência. Consulte os demais meses na aba Frequência.</p>
        <div className="space-y-6">{months.map(month=>{const summary=frequencySummary(tracking,month);return <TrackingProgress key={month} label={monthLabel(month)} value={summary.percent} detail={summary.total ? `${summary.approved} de ${summary.total} · ${summary.percent}%` : 'Sem participantes ativos'}/>;})}</div>
      </Card>
    </div>
    <Card className="p-5 sm:p-6">
      {canManage ? <details open={!configured}><summary className="cursor-pointer text-lg font-semibold">Vigência e metas do acompanhamento</summary>
        <p className="mb-5 mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">Informe as datas e a carga horária prevista por participante. Beneficiários são a quantidade efetivamente atendida, informada pela gestão.</p>
        <form className="flex flex-col gap-5" onSubmit={async e=>{e.preventDefault();await onAction({action:'configure',config});}}>
          <fieldset disabled={busy} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[['startDate','Início da vigência'],['endDate','Fim da vigência']].map(([key,label])=><Input key={key} label={label} type="date" required value={config[key]} onChange={e=>setConfig(prev=>({...prev,[key]:e.target.value}))}/>)}
            {[['totalHours','Carga horária total',10000],['monthlyHours','Carga horária mensal',744],['beneficiaries','Beneficiários atendidos',10000000]].map(([key,label,max])=><Input key={key} label={label} type="number" min={key==='beneficiaries'?0:0.5} max={max} step={key==='beneficiaries'?1:0.5} required value={config[key]} onChange={e=>setConfig(prev=>({...prev,[key]:Number(e.target.value)}))}/>)}
          </fieldset>
          <div><Button type="submit" disabled={busy}>Salvar vigência e metas</Button></div>
        </form>
      </details> : <div><h2 className="text-lg font-semibold">Metas da minha participação</h2><p className="mt-3 text-sm leading-relaxed">Carga total: {tracking.config.totalHours ? `${tracking.config.totalHours}h` : 'Não definida'} · Carga mensal: {tracking.config.monthlyHours ? `${tracking.config.monthlyHours}h` : 'Não definida'}</p></div>}
    </Card>
  </div>;
}
TrackingOverview.propTypes={tracking:PropTypes.object.isRequired,canManage:PropTypes.bool.isRequired,busy:PropTypes.bool.isRequired,onAction:PropTypes.func.isRequired};
