import {useCallback,useEffect,useState} from 'react';
import {DEFAULT_SETTINGS,settingsAreEqual} from '../settingsLogic';
import {getAccount,saveAccount} from '../../../services/portalApi';
export default function useSettings(){
 const [settings,setSettings]=useState({...DEFAULT_SETTINGS}),[savedSnapshot,setSavedSnapshot]=useState({...DEFAULT_SETTINGS}),[loading,setLoading]=useState(true),[error,setError]=useState(''),[syncedAt,setSyncedAt]=useState(null),[busy,setBusy]=useState(false);
 useEffect(()=>{let active=true;getAccount().then(result=>{if(active){setSettings(result.settings);setSavedSnapshot(result.settings);setSyncedAt(result.syncedAt);}}).catch(err=>{if(active)setError(err.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
 const update=useCallback(patch=>setSettings(prev=>({...prev,...patch})),[]);
 const persist=useCallback(async(next,reset=false)=>{setBusy(true);setError('');try{const result=await saveAccount(next,reset);setSettings(result.settings);setSavedSnapshot(result.settings);setSyncedAt(result.savedAt);window.dispatchEvent(new window.CustomEvent('portal-settings-changed',{detail:result.settings}));return{ok:true,savedAt:result.savedAt};}catch(err){setError(err.message);return{ok:false,error:err.message};}finally{setBusy(false);}},[]);
 return{settings,update,save:next=>persist(next),discard:()=>setSettings({...savedSnapshot}),reset:()=>persist(DEFAULT_SETTINGS,true),isDirty:!settingsAreEqual(settings,savedSnapshot),loading,error,syncedAt,busy};
}
