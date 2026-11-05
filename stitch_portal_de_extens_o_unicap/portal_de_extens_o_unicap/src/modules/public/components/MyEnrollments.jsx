import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import {getEnrollments,enrollProject} from '../../../services/portalApi';
export default function MyEnrollments(){
 const [items,setItems]=useState([]),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function reload(){try{setItems((await getEnrollments()).items);}catch(err){setError(err.message);}}
 useEffect(()=>{reload();},[]);
 return <Card className="p-5"><h2 className="mb-3 text-xl font-semibold">Minhas inscrições</h2>{error&&<p role="alert" className="text-red-800">{error}</p>}{items.length?items.map(item=><div key={item.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-container-high py-3"><div className="min-w-0"><strong>{item.projectTitle}</strong><p className="text-sm">{({confirmed:'Inscrição confirmada',waitlist:'Na lista de espera',cancelled:'Inscrição cancelada'})[item.status]}</p></div><div className="flex flex-wrap gap-2">{item.status==='confirmed'&&<Link className="btn border border-surface-container-high px-3 py-2 text-sm" to={`/tracking?id=${encodeURIComponent(item.projectId)}`}>Ver meu acompanhamento</Link>}{item.status!=='cancelled'&&<Button variant="outline" disabled={busy} onClick={async()=>{setBusy(true);setError('');try{await enrollProject(item.projectId,'cancel');await reload();window.dispatchEvent(new window.Event('portal-enrollment-changed'));}catch(err){setError(err.message);}finally{setBusy(false);}}}>Cancelar inscrição</Button>}</div></div>):<p className="text-sm">Você ainda não realizou inscrições.</p>}</Card>;
}
