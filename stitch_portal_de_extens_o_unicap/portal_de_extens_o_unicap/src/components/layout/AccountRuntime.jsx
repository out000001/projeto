import {useCallback,useEffect,useRef,useState} from 'react';
import {getAccount} from '../../services/portalApi';
import {DEFAULT_SETTINGS} from '../../modules/settings/settingsLogic';
import {useSession} from '../../contexts/SessionContext';
import Button from '../ui/Button';
import AccountNotices from './AccountNotices';
export default function AccountRuntime(){
 const {logout}=useSession();const [settings,setSettings]=useState(DEFAULT_SETTINGS),[notices,setNotices]=useState([]),[error,setError]=useState(''),[open,setOpen]=useState(false);const lastActivity=useRef(Date.now());const requestRevision=useRef({version:0});const [loading,setLoading]=useState(true);
 const refresh=useCallback(async()=>{const requestState=requestRevision.current;const revision=++requestState.version;setError('');setLoading(true);try{const account=await getAccount(true);if(revision===requestState.version){setSettings(account.settings);setNotices(account.notices||[]);}}catch(err){if(revision===requestState.version)setError(err.message);}finally{if(revision===requestState.version)setLoading(false);}},[]);
 useEffect(()=>{const requestState=requestRevision.current;refresh();const changed=event=>{setSettings(event.detail);refresh();};window.addEventListener('portal-settings-changed',changed);return()=>{requestState.version++;window.removeEventListener('portal-settings-changed',changed);};},[refresh]);
 useEffect(()=>{document.documentElement.dataset.density=settings.density;return()=>{delete document.documentElement.dataset.density;};},[settings.density]);
 useEffect(()=>{let timer;const timeout=settings.sessionTimeoutMinutes*60000;
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(()=>{if(Date.now()-lastActivity.current>=timeout)logout();else schedule();},Math.max(1000,timeout-(Date.now()-lastActivity.current)));};
  const activity=()=>{lastActivity.current=Date.now();};const visible=()=>{if(document.visibilityState==='visible'){if(Date.now()-lastActivity.current>=timeout)logout();else schedule();}};
  const events=['pointerdown','keydown','touchstart','scroll'];events.forEach(event=>window.addEventListener(event,activity,{passive:true}));document.addEventListener('visibilitychange',visible);schedule();
  return()=>{clearTimeout(timer);events.forEach(event=>window.removeEventListener(event,activity));document.removeEventListener('visibilitychange',visible);};
 },[settings.sessionTimeoutMinutes,logout]);
 return <><Button variant="outline" onClick={()=>{setOpen(true);refresh();}} aria-haspopup="dialog" aria-expanded={open} aria-label={`Avisos (${notices.length})`}>Avisos{notices.length?` (${notices.length})`:''}</Button><AccountNotices open={open} onClose={()=>setOpen(false)} notices={notices} loading={loading} error={error} onRefresh={refresh}/></>;
}
