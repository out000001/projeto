import {useCallback,useEffect,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import {getAccount} from '../../services/portalApi';
import {DEFAULT_SETTINGS} from '../../modules/settings/settingsLogic';
import {useSession} from '../../contexts/SessionContext';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
export default function AccountRuntime(){
 const {logout}=useSession();const [settings,setSettings]=useState(DEFAULT_SETTINGS),[notices,setNotices]=useState([]),[error,setError]=useState(''),[open,setOpen]=useState(false);const lastActivity=useRef(Date.now());
 const refresh=useCallback(async()=>{setError('');try{const account=await getAccount(true);setSettings(account.settings);setNotices(account.notices||[]);}catch(err){setError(err.message);}},[]);
 useEffect(()=>{refresh();const changed=event=>{setSettings(event.detail);refresh();};window.addEventListener('portal-settings-changed',changed);return()=>window.removeEventListener('portal-settings-changed',changed);},[refresh]);
 useEffect(()=>{document.documentElement.dataset.density=settings.density;return()=>{delete document.documentElement.dataset.density;};},[settings.density]);
 useEffect(()=>{let timer;const timeout=settings.sessionTimeoutMinutes*60000;
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(()=>{if(Date.now()-lastActivity.current>=timeout)logout();else schedule();},Math.max(1000,timeout-(Date.now()-lastActivity.current)));};
  const activity=()=>{lastActivity.current=Date.now();};const visible=()=>{if(document.visibilityState==='visible'){if(Date.now()-lastActivity.current>=timeout)logout();else schedule();}};
  const events=['pointerdown','keydown','touchstart','scroll'];events.forEach(event=>window.addEventListener(event,activity,{passive:true}));document.addEventListener('visibilitychange',visible);schedule();
  return()=>{clearTimeout(timer);events.forEach(event=>window.removeEventListener(event,activity));document.removeEventListener('visibilitychange',visible);};
 },[settings.sessionTimeoutMinutes,logout]);
 return <><Button variant="outline" onClick={()=>{setOpen(true);refresh();}} aria-label={`Avisos (${notices.length})`}>Avisos{notices.length?` (${notices.length})`:''}</Button><Modal open={open} onClose={()=>setOpen(false)} title="Avisos da sua conta"><div className="overflow-y-auto p-6"><h2 className="mb-4 text-xl font-semibold">Avisos da sua conta</h2>{error?<p role="alert">{error} <Button onClick={refresh}>Tentar novamente</Button></p>:notices.length?<ul className="space-y-3">{notices.map(notice=><li key={notice.id}><Link onClick={()=>setOpen(false)} to={notice.href} className="block rounded-lg border border-surface-container-high p-3 text-sm underline">{notice.label}</Link></li>)}</ul>:<p>Nenhum aviso nas categorias selecionadas. Você pode ajustar os avisos em Configurações.</p>}</div></Modal></>;
}
